const db = require('../config/db');

// POST /api/enrollments (Enroll in a course)
exports.enrollInCourse = (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required for enrollment.'
      });
    }

    // Verify course exists
    const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if already enrolled
    const existing = db.prepare(`
      SELECT id, progress_percent, status FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

    if (existing) {
      return res.json({
        success: true,
        message: `You are already enrolled in "${course.title}".`,
        enrollment: existing
      });
    }

    // Create enrollment
    const result = db.prepare(`
      INSERT INTO enrollments (user_id, course_id, progress_percent, status)
      VALUES (?, ?, 0, 'active')
    `).run(userId, courseId);

    const enrollment = {
      id: result.lastInsertRowid,
      user_id: userId,
      course_id: courseId,
      progress_percent: 0,
      status: 'active'
    };

    // Unlock achievement for first enrollment if not yet unlocked
    try {
      db.prepare(`
        INSERT OR IGNORE INTO user_achievements (user_id, badge_key, title, description, icon)
        VALUES (?, 'first_course', 'Course Pioneer', 'Enrolled in your first course on Coursify', 'Award')
      `).run(userId);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Successfully enrolled in "${course.title}"!`,
      enrollment
    });
  } catch (error) {
    console.error('EnrollInCourse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll in course.'
    });
  }
};

// GET /api/enrollments/my (Get logged-in user's enrolled courses)
exports.getMyEnrollments = (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = db.prepare(`
      SELECT 
        e.id AS enrollment_id,
        e.progress_percent,
        e.status,
        e.enrolled_at,
        e.last_accessed_at,
        c.id AS course_id,
        c.title,
        c.slug,
        c.description,
        c.instructor,
        c.level,
        c.duration,
        c.thumbnail,
        c.rating,
        cat.name AS category_name,
        cat.color AS category_color,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = e.id AND completed = 1) AS completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE e.user_id = ?
      ORDER BY e.last_accessed_at DESC
    `).all(userId);

    // Calculate learning stats for student profile
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = totalCourses - completedCourses;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress_percent, 0) / totalCourses)
      : 0;

    return res.json({
      success: true,
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        averageProgress
      },
      enrollments
    });
  } catch (error) {
    console.error('GetMyEnrollments Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments.'
    });
  }
};

// GET /api/enrollments/courses/:courseId/learn (Classroom data)
exports.getCourseLearningRoom = (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = db.prepare(`
      SELECT 
        c.*,
        cat.name AS category_name,
        cat.color AS category_color
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ? OR c.slug = ?
    `).get(courseId, courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check or auto-enroll for admin / check existing enrollment for student
    let enrollment = db.prepare(`
      SELECT * FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, course.id);

    if (!enrollment) {
      if (req.user.role === 'admin') {
        // Admin gets preview enrollment
        const resInsert = db.prepare(`
          INSERT INTO enrollments (user_id, course_id, progress_percent, status)
          VALUES (?, ?, 0, 'active')
        `).run(userId, course.id);

        enrollment = {
          id: resInsert.lastInsertRowid,
          user_id: userId,
          course_id: course.id,
          progress_percent: 0,
          status: 'active'
        };
      } else {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course yet. Please enroll first.'
        });
      }
    }

    // Update last_accessed_at timestamp
    db.prepare('UPDATE enrollments SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?').run(enrollment.id);

    // Fetch all lessons with content
    const lessons = db.prepare(`
      SELECT id, course_id, title, description, duration, video_url, content_markdown, order_index
      FROM lessons
      WHERE course_id = ?
      ORDER BY order_index ASC, id ASC
    `).all(course.id);

    // Fetch completed lesson IDs for this enrollment
    const completedLessonRows = db.prepare(`
      SELECT lesson_id FROM lesson_progress
      WHERE enrollment_id = ? AND completed = 1
    `).all(enrollment.id);

    const completedLessonIds = completedLessonRows.map(r => r.lesson_id);

    return res.json({
      success: true,
      course,
      enrollment: {
        ...enrollment,
        completed_lesson_ids: completedLessonIds
      },
      lessons
    });
  } catch (error) {
    console.error('GetCourseLearningRoom Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load classroom.'
    });
  }
};

// POST /api/enrollments/courses/:courseId/lessons/:lessonId/complete
exports.toggleLessonCompletion = (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Verify enrollment
    const enrollment = db.prepare(`
      SELECT * FROM enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Enrollment not found for this course.'
      });
    }

    // Check if currently completed
    const existingProgress = db.prepare(`
      SELECT id FROM lesson_progress
      WHERE enrollment_id = ? AND lesson_id = ?
    `).get(enrollment.id, lessonId);

    let isCompletedNow = false;

    if (existingProgress) {
      // Toggle off (uncomplete)
      db.prepare('DELETE FROM lesson_progress WHERE id = ?').run(existingProgress.id);
      isCompletedNow = false;
    } else {
      // Mark completed
      db.prepare(`
        INSERT INTO lesson_progress (enrollment_id, lesson_id, completed)
        VALUES (?, ?, 1)
      `).run(enrollment.id, lessonId);
      isCompletedNow = true;

      // Log 15 minutes of study activity
      try {
        db.prepare(`
          INSERT INTO learning_logs (user_id, lesson_id, minutes_spent, activity_date)
          VALUES (?, ?, 20, DATE('now'))
        `).run(userId, lessonId);
      } catch (e) {}
    }

    // Calculate new progress percentage
    const totalLessons = db.prepare('SELECT COUNT(*) AS count FROM lessons WHERE course_id = ?').get(courseId).count;
    const completedCount = db.prepare('SELECT COUNT(*) AS count FROM lesson_progress WHERE enrollment_id = ? AND completed = 1').get(enrollment.id).count;

    const newProgressPercent = totalLessons > 0 
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    const newStatus = newProgressPercent === 100 ? 'completed' : 'active';

    db.prepare(`
      UPDATE enrollments 
      SET progress_percent = ?, status = ?, last_accessed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newProgressPercent, newStatus, enrollment.id);

    // If completed course, unlock certified achievement
    if (newStatus === 'completed') {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO user_achievements (user_id, badge_key, title, description, icon)
          VALUES (?, 'certified_grad', 'Certified Developer', 'Successfully completed 100% course syllabus and unlocked official certificate', 'CheckCircle2')
        `).run(userId);
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: isCompletedNow ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.',
      is_completed: isCompletedNow,
      progress_percent: newProgressPercent,
      status: newStatus,
      completed_count: completedCount,
      total_lessons: totalLessons
    });
  } catch (error) {
    console.error('ToggleLessonCompletion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update lesson progress.'
    });
  }
};

// GET /api/enrollments/lessons/:lessonId/notes
exports.getLessonNotes = (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const note = db.prepare('SELECT note_text, updated_at FROM lesson_notes WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);

    return res.json({
      success: true,
      note_text: note ? note.note_text : ''
    });
  } catch (error) {
    console.error('GetLessonNotes Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notes.'
    });
  }
};

// POST /api/enrollments/lessons/:lessonId/notes
exports.saveLessonNotes = (req, res) => {
  try {
    const { lessonId } = req.params;
    const { note_text } = req.body;
    const userId = req.user.id;

    db.prepare(`
      INSERT INTO lesson_notes (user_id, lesson_id, note_text, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, lesson_id) 
      DO UPDATE SET note_text = excluded.note_text, updated_at = CURRENT_TIMESTAMP
    `).run(userId, lessonId, note_text || '');

    // Unlock notes achievement if not yet unlocked
    try {
      db.prepare(`
        INSERT OR IGNORE INTO user_achievements (user_id, badge_key, title, description, icon)
        VALUES (?, 'note_taker', 'Knowledge Scribe', 'Created detailed personal lesson notes in the learning room', 'BookOpen')
      `).run(userId);
    } catch (e) {}

    return res.json({
      success: true,
      message: 'Personal study notes saved successfully!'
    });
  } catch (error) {
    console.error('SaveLessonNotes Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save notes.'
    });
  }
};

// ==========================================
// Public Certificate Verification Endpoint
// ==========================================

// GET /api/enrollments/verify-certificate/:code
exports.verifyCertificate = (req, res) => {
  try {
    const { code } = req.params;
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Certificate verification code is required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const submission = db.prepare(`
      SELECT 
        s.id,
        s.certificate_code,
        s.score_percent,
        s.passed,
        s.proctor_status,
        s.submitted_at,
        u.name AS student_name,
        u.email AS student_email,
        c.title AS course_title,
        c.instructor AS instructor_name,
        c.level AS course_level,
        cat.name AS category_name
      FROM exam_submissions s
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE UPPER(s.certificate_code) = ? AND s.passed = 1
    `).get(cleanCode);

    if (!submission) {
      // Also check fallback format if someone enters demo or course code
      return res.status(404).json({
        success: false,
        is_valid: false,
        message: `No authentic verified certificate found with ID "${code}". Please verify the code and try again.`
      });
    }

    return res.json({
      success: true,
      is_valid: true,
      certificate: {
        code: submission.certificate_code,
        student_name: submission.student_name,
        course_title: submission.course_title,
        category_name: submission.category_name,
        instructor_name: submission.instructor_name,
        course_level: submission.course_level,
        score_percent: submission.score_percent,
        proctor_status: submission.proctor_status,
        issued_date: submission.submitted_at
      }
    });
  } catch (error) {
    console.error('VerifyCertificate Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify certificate.'
    });
  }
};

// ==========================================
// Student Analytics & Streak Tracking
// ==========================================

// GET /api/enrollments/my/analytics
exports.getStudentAnalytics = (req, res) => {
  try {
    const userId = req.user.id;

    // Badges & Achievements
    const achievements = db.prepare(`
      SELECT * FROM user_achievements 
      WHERE user_id = ? 
      ORDER BY unlocked_at DESC
    `).all(userId);

    // Exam Submissions History
    const exams = db.prepare(`
      SELECT 
        s.*,
        c.title AS course_title,
        c.thumbnail AS course_thumbnail
      FROM exam_submissions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
    `).all(userId);

    // Learning activity history
    const logs = db.prepare(`
      SELECT activity_date, SUM(minutes_spent) AS total_minutes 
      FROM learning_logs 
      WHERE user_id = ? 
      GROUP BY activity_date 
      ORDER BY activity_date ASC
    `).all(userId);

    const totalStudyMinutes = logs.reduce((acc, curr) => acc + curr.total_minutes, 0);

    // Total Notes Taken
    const totalNotes = db.prepare('SELECT COUNT(*) AS count FROM lesson_notes WHERE user_id = ?').get(userId).count;

    // Total Bookmarks Saved
    const totalBookmarks = db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?').get(userId).count;

    return res.json({
      success: true,
      analytics: {
        totalStudyMinutes: totalStudyMinutes || 240,
        totalStudyHours: ((totalStudyMinutes || 240) / 60).toFixed(1),
        currentStreakDays: logs.length > 0 ? logs.length : 3,
        totalNotes,
        totalBookmarks,
        achievements,
        exams,
        weeklyActivity: logs
      }
    });
  } catch (error) {
    console.error('GetStudentAnalytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student analytics.'
    });
  }
};

// POST /api/enrollments/my/log-study-time
exports.logStudyTime = (req, res) => {
  try {
    const userId = req.user.id;
    const { minutes = 15, lessonId = null } = req.body;

    db.prepare(`
      INSERT INTO learning_logs (user_id, lesson_id, minutes_spent, activity_date)
      VALUES (?, ?, ?, DATE('now'))
    `).run(userId, lessonId, minutes);

    return res.json({
      success: true,
      message: 'Study activity logged successfully.'
    });
  } catch (error) {
    console.error('LogStudyTime Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log study activity.'
    });
  }
};
