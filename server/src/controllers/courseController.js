const db = require('../config/db');

// GET /api/courses
exports.getAllCourses = (req, res) => {
  try {
    const { search, category, level, sort = 'newest' } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        c.*,
        cat.name AS category_name,
        cat.slug AS category_slug,
        cat.icon AS category_icon,
        cat.color AS category_color,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS total_students
    `;

    if (userId) {
      query += `,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND user_id = ${userId}) AS is_enrolled,
        (SELECT progress_percent FROM enrollments WHERE course_id = c.id AND user_id = ${userId}) AS user_progress,
        (SELECT COUNT(*) FROM bookmarks WHERE course_id = c.id AND user_id = ${userId}) AS is_bookmarked
      `;
    } else {
      query += `, 0 AS is_enrolled, 0 AS user_progress, 0 AS is_bookmarked`;
    }

    query += `
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.is_published = 1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.instructor LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      query += ` AND (cat.slug = ? OR cat.id = ?)`;
      params.push(category, category);
    }

    if (level && level !== 'all') {
      query += ` AND c.level = ?`;
      params.push(level);
    }

    if (sort === 'popular') {
      query += ` ORDER BY total_students DESC, c.rating DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY c.rating DESC`;
    } else if (sort === 'title') {
      query += ` ORDER BY c.title ASC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const courses = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('GetAllCourses Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch courses.'
    });
  }
};

// GET /api/courses/categories
exports.getCategories = (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        cat.*,
        (SELECT COUNT(*) FROM courses WHERE category_id = cat.id AND is_published = 1) AS course_count
      FROM categories cat
      ORDER BY cat.name ASC
    `).all();

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('GetCategories Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.'
    });
  }
};

// GET /api/courses/:id
exports.getCourseById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        c.*,
        cat.name AS category_name,
        cat.slug AS category_slug,
        cat.icon AS category_icon,
        cat.color AS category_color,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS total_students
    `;

    if (userId) {
      query += `,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND user_id = ${userId}) AS is_enrolled,
        (SELECT progress_percent FROM enrollments WHERE course_id = c.id AND user_id = ${userId}) AS user_progress
      `;
    } else {
      query += `, 0 AS is_enrolled, 0 AS user_progress`;
    }

    query += `
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE (c.id = ? OR c.slug = ?)
    `;

    const course = db.prepare(query).get(id, id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Fetch Syllabus Lessons
    const lessons = db.prepare(`
      SELECT id, course_id, title, description, duration, order_index
      FROM lessons
      WHERE course_id = ?
      ORDER BY order_index ASC, id ASC
    `).all(course.id);

    // Fetch Reviews
    const reviews = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
    `).all(course.id);

    return res.json({
      success: true,
      course: {
        ...course,
        lessons,
        reviews
      }
    });
  } catch (error) {
    console.error('GetCourseById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course details.'
    });
  }
};

// POST /api/courses (Admin Only)
exports.createCourse = (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      category_id,
      level = 'Beginner',
      duration = '10 Hours',
      thumbnail,
      price = 0.0,
      lessons = []
    } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({
        success: false,
        message: 'Course title, description, and instructor are required.'
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const defaultThumbnail = thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

    const insertCourse = db.prepare(`
      INSERT INTO courses (title, slug, description, instructor, category_id, level, duration, thumbnail, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertCourse.run(
      title.trim(),
      slug,
      description.trim(),
      instructor.trim(),
      category_id || null,
      level,
      duration,
      defaultThumbnail,
      parseFloat(price) || 0.0
    );

    const courseId = result.lastInsertRowid;

    // Insert syllabus lessons if provided
    if (Array.isArray(lessons) && lessons.length > 0) {
      const insertLesson = db.prepare(`
        INSERT INTO lessons (course_id, title, description, duration, video_url, content_markdown, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      lessons.forEach((l, idx) => {
        insertLesson.run(
          courseId,
          l.title || `Lesson ${idx + 1}`,
          l.description || '',
          l.duration || '30 min',
          l.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          l.content_markdown || '# Lesson Content\n\nWelcome to this module.',
          idx + 1
        );
      });
    } else {
      // Create at least one default module
      db.prepare(`
        INSERT INTO lessons (course_id, title, description, duration, video_url, content_markdown, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        courseId,
        '1. Course Introduction & Syllabus Overview',
        'Getting started with the course roadmap and development prerequisites.',
        '20 min',
        'https://www.youtube.com/embed/eIrMbAQSU34',
        `# Welcome to ${title}\n\nIn this course, you will master key industry skills guided by ${instructor}.\n\n### Prerequisites:\n- Dedication to practice\n- Basic computer literacy`,
        1
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      courseId
    });
  } catch (error) {
    console.error('CreateCourse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create course.'
    });
  }
};

// PUT /api/courses/:id (Admin Only)
exports.updateCourse = (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructor,
      category_id,
      level,
      duration,
      thumbnail,
      price,
      is_published
    } = req.body;

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    db.prepare(`
      UPDATE courses
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        instructor = COALESCE(?, instructor),
        category_id = COALESCE(?, category_id),
        level = COALESCE(?, level),
        duration = COALESCE(?, duration),
        thumbnail = COALESCE(?, thumbnail),
        price = COALESCE(?, price),
        is_published = COALESCE(?, is_published)
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      description ? description.trim() : null,
      instructor ? instructor.trim() : null,
      category_id !== undefined ? category_id : null,
      level || null,
      duration || null,
      thumbnail || null,
      price !== undefined ? parseFloat(price) : null,
      is_published !== undefined ? parseInt(is_published) : null,
      id
    );

    return res.json({
      success: true,
      message: 'Course updated successfully!'
    });
  } catch (error) {
    console.error('UpdateCourse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update course.'
    });
  }
};

// POST /api/courses/:id/bookmark
exports.toggleBookmark = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND course_id = ?').get(userId, id);

    let isBookmarked = false;
    if (existing) {
      db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
      isBookmarked = false;
    } else {
      db.prepare('INSERT INTO bookmarks (user_id, course_id) VALUES (?, ?)').run(userId, id);
      isBookmarked = true;
    }

    return res.json({
      success: true,
      is_bookmarked: isBookmarked,
      message: isBookmarked ? 'Course saved to wishlist!' : 'Course removed from wishlist.'
    });
  } catch (error) {
    console.error('ToggleBookmark Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update bookmark.'
    });
  }
};

// GET /api/courses/my/bookmarks
exports.getMyBookmarks = (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarkedCourses = db.prepare(`
      SELECT 
        c.*,
        cat.name AS category_name,
        cat.color AS category_color,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS total_students,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND user_id = ?) AS is_enrolled,
        (SELECT progress_percent FROM enrollments WHERE course_id = c.id AND user_id = ?) AS user_progress,
        1 AS is_bookmarked
      FROM bookmarks b
      JOIN courses c ON b.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId, userId, userId);

    return res.json({
      success: true,
      courses: bookmarkedCourses
    });
  } catch (error) {
    console.error('GetMyBookmarks Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarked courses.'
    });
  }
};

// DELETE /api/courses/:id (Admin Only)
exports.deleteCourse = (req, res) => {
  try {
    const { id } = req.params;
    const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    db.prepare('DELETE FROM courses WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: `Course "${course.title}" deleted successfully.`
    });
  } catch (error) {
    console.error('DeleteCourse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete course.'
    });
  }
};

// ==========================================
// Interactive Discussions & Forum Endpoints
// ==========================================

// GET /api/courses/:id/discussions
exports.getDiscussions = (req, res) => {
  try {
    const { id } = req.params;
    const { lesson_id } = req.query;

    let query = `
      SELECT 
        d.*,
        u.name AS user_name,
        u.role AS user_role,
        u.avatar AS user_avatar
      FROM discussions d
      JOIN users u ON d.user_id = u.id
      WHERE d.course_id = ?
    `;
    const params = [id];

    if (lesson_id) {
      query += ` AND (d.lesson_id = ? OR d.lesson_id IS NULL)`;
      params.push(lesson_id);
    }

    query += ` ORDER BY d.created_at DESC`;

    const discussions = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: discussions.length,
      discussions
    });
  } catch (error) {
    console.error('GetDiscussions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load discussions.'
    });
  }
};

// POST /api/courses/:id/discussions
exports.createDiscussion = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { lesson_id, parent_id, title, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Discussion content cannot be empty.'
      });
    }

    const result = db.prepare(`
      INSERT INTO discussions (course_id, lesson_id, user_id, parent_id, title, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, lesson_id || null, userId, parent_id || null, title ? title.trim() : null, content.trim());

    const created = db.prepare(`
      SELECT 
        d.*,
        u.name AS user_name,
        u.role AS user_role,
        u.avatar AS user_avatar
      FROM discussions d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: parent_id ? 'Reply posted successfully!' : 'Question posted to discussion forum!',
      discussion: created
    });
  } catch (error) {
    console.error('CreateDiscussion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post discussion.'
    });
  }
};

// POST /api/courses/discussions/:id/upvote
exports.upvoteDiscussion = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE discussions SET upvotes = upvotes + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT upvotes FROM discussions WHERE id = ?').get(id);

    return res.json({
      success: true,
      upvotes: updated ? updated.upvotes : 0,
      message: 'Upvoted!'
    });
  } catch (error) {
    console.error('UpvoteDiscussion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upvote discussion.'
    });
  }
};

// ==========================================
// Course Resources & Downloads Endpoints
// ==========================================

// GET /api/courses/:id/resources
exports.getCourseResources = (req, res) => {
  try {
    const { id } = req.params;
    const resources = db.prepare('SELECT * FROM course_resources WHERE course_id = ? ORDER BY id ASC').all(id);

    return res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('GetCourseResources Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load course resources.'
    });
  }
};

// POST /api/courses/:id/resources (Admin / Instructor)
exports.addCourseResource = (req, res) => {
  try {
    const { id } = req.params;
    const { title, type = 'code', url, description, file_size } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Resource title and download URL are required.'
      });
    }

    const result = db.prepare(`
      INSERT INTO course_resources (course_id, title, type, url, description, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title.trim(), type, url.trim(), description || '', file_size || 'N/A');

    return res.status(201).json({
      success: true,
      message: 'Course resource attached successfully!',
      resourceId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('AddCourseResource Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add course resource.'
    });
  }
};
