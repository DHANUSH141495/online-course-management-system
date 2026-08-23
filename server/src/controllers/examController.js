const db = require('../config/db');

// GET /api/enrollments/courses/:courseId/exam
exports.getCourseExam = (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verify course & enrollment
    const enrollment = db.prepare('SELECT id, progress_percent, status FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to take the certification examination.'
      });
    }

    const course = db.prepare('SELECT id, title, instructor, level FROM courses WHERE id = ?').get(courseId);

    // Fetch questions without revealing correct answer
    const questions = db.prepare(`
      SELECT 
        id, 
        course_id, 
        question, 
        option_a, 
        option_b, 
        option_c, 
        option_d, 
        points
      FROM exam_questions 
      WHERE course_id = ?
      ORDER BY id ASC
    `).all(courseId);

    // Check past submission
    const pastSubmission = db.prepare(`
      SELECT * FROM exam_submissions 
      WHERE user_id = ? AND course_id = ? 
      ORDER BY submitted_at DESC 
      LIMIT 1
    `).get(userId, courseId);

    return res.json({
      success: true,
      course,
      enrollment,
      is_eligible: enrollment.progress_percent >= 100,
      total_questions: questions.length,
      questions,
      past_submission: pastSubmission || null
    });
  } catch (error) {
    console.error('GetCourseExam Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load course exam.'
    });
  }
};

// POST /api/enrollments/courses/:courseId/exam/submit
exports.submitCourseExam = (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { answers = {}, warnings_count = 0, terminated_for_malpractice = false } = req.body;

    const enrollment = db.prepare('SELECT id, progress_percent FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Enrollment verification failed.'
      });
    }

    const questions = db.prepare('SELECT id, correct_option, explanation FROM exam_questions WHERE course_id = ?').all(courseId);
    const totalQuestions = questions.length;

    let correctCount = 0;
    const resultsBreakdown = [];

    questions.forEach((q) => {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer && studentAnswer.toUpperCase() === q.correct_option.toUpperCase();
      if (isCorrect) {
        correctCount++;
      }
      resultsBreakdown.push({
        question_id: q.id,
        user_answer: studentAnswer || 'Unanswered',
        correct_answer: q.correct_option,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercent >= 60 && !terminated_for_malpractice;

    let proctorStatus = 'clean';
    if (terminated_for_malpractice || warnings_count >= 3) {
      proctorStatus = 'disqualified';
    } else if (warnings_count > 0) {
      proctorStatus = 'warned';
    }

    const certificateCode = passed 
      ? `CERT-${req.user.name.replace(/[^a-zA-Z]/g, '').toUpperCase()}-${courseId}${enrollment.id}-${Math.floor(1000 + Math.random() * 9000)}` 
      : null;

    db.prepare(`
      INSERT INTO exam_submissions (
        user_id, 
        course_id, 
        total_questions, 
        correct_answers, 
        score_percent, 
        passed, 
        warnings_count, 
        terminated_for_malpractice, 
        proctor_status, 
        certificate_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      courseId,
      totalQuestions,
      correctCount,
      scorePercent,
      passed ? 1 : 0,
      warnings_count,
      terminated_for_malpractice ? 1 : 0,
      proctorStatus,
      certificateCode
    );

    return res.json({
      success: true,
      passed,
      score_percent: scorePercent,
      correct_answers: correctCount,
      total_questions: totalQuestions,
      warnings_count,
      terminated_for_malpractice,
      proctor_status: proctorStatus,
      certificate_code: certificateCode,
      results: resultsBreakdown,
      message: terminated_for_malpractice 
        ? 'Exam terminated due to 3 malpractice warnings.' 
        : passed 
          ? '🎉 Congratulations! You have passed the certification examination!' 
          : 'You did not achieve the required passing score (60%). You can review and retake the exam.'
    });
  } catch (error) {
    console.error('SubmitCourseExam Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate exam submission.'
    });
  }
};
