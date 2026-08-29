const db = require('../config/db');

// GET /api/admin/stats
exports.getAdminStats = (req, res) => {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student'").get().count;
    const totalAdmins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count;
    const totalCourses = db.prepare("SELECT COUNT(*) AS count FROM courses").get().count;
    const totalEnrollments = db.prepare("SELECT COUNT(*) AS count FROM enrollments").get().count;
    const completedEnrollments = db.prepare("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'completed'").get().count;

    const avgProgressRow = db.prepare("SELECT AVG(progress_percent) AS avg_progress FROM enrollments").get();
    const averageProgress = avgProgressRow && avgProgressRow.avg_progress !== null 
      ? Math.round(avgProgressRow.avg_progress) 
      : 0;

    // Top Courses by Enrollment
    const topCourses = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.instructor,
        c.level,
        c.thumbnail,
        cat.name AS category_name,
        COUNT(e.id) AS enrollment_count,
        ROUND(AVG(COALESCE(e.progress_percent, 0)), 1) AS avg_progress
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY enrollment_count DESC, c.id ASC
      LIMIT 5
    `).all();

    // Category Distribution
    const categoryStats = db.prepare(`
      SELECT 
        cat.name,
        cat.color,
        COUNT(DISTINCT c.id) AS course_count,
        COUNT(e.id) AS enrollment_count
      FROM categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY cat.id
      ORDER BY course_count DESC
    `).all();

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        averageProgress,
        topCourses,
        categoryStats
      }
    });
  } catch (error) {
    console.error('GetAdminStats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard statistics.'
    });
  }
};

// GET /api/admin/enrollments (All student enrollments monitor)
exports.getAllEnrollments = (req, res) => {
  try {
    const enrollments = db.prepare(`
      SELECT 
        e.id AS enrollment_id,
        e.progress_percent,
        e.status,
        e.enrolled_at,
        e.last_accessed_at,
        u.id AS user_id,
        u.name AS student_name,
        u.email AS student_email,
        u.avatar AS student_avatar,
        c.id AS course_id,
        c.title AS course_title,
        c.instructor,
        cat.name AS category_name,
        cat.color AS category_color,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = e.id AND completed = 1) AS completed_lessons
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY e.last_accessed_at DESC
    `).all();

    return res.json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('GetAllEnrollments Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments list.'
    });
  }
};

// GET /api/admin/users
exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar,
        u.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) AS enrolled_count,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id AND status = 'completed') AS completed_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('GetAllUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
};

// PUT /api/admin/users/:id/role
exports.updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "student" or "admin".'
      });
    }

    const user = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

    return res.json({
      success: true,
      message: `User ${user.name}'s role updated to ${role}.`
    });
  } catch (error) {
    console.error('UpdateUserRole Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.'
    });
  }
};

// GET /api/admin/login-logs (Real-time DB Login & Access Audit Viewer)
exports.getLoginLogs = (req, res) => {
  try {
    const { search = '', status = 'all', role = 'all', limit = 100 } = req.query;

    let query = `
      SELECT 
        l.id,
        l.user_id,
        l.email,
        l.user_name,
        l.role,
        l.ip_address,
        l.user_agent,
        l.status,
        l.login_at,
        u.avatar AS user_avatar
      FROM login_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(l.email) LIKE ? OR LOWER(l.user_name) LIKE ? OR LOWER(l.ip_address) LIKE ? OR LOWER(l.user_agent) LIKE ?)`;
      params.push(s, s, s, s);
    }

    if (status && status !== 'all') {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    if (role && role !== 'all') {
      query += ` AND l.role = ?`;
      params.push(role);
    }

    query += ` ORDER BY l.login_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10) || 100);

    const logs = db.prepare(query).all(...params);

    // Compute log metrics
    const totalLogins = db.prepare("SELECT COUNT(*) AS count FROM login_logs").get().count;
    const successfulLogins = db.prepare("SELECT COUNT(*) AS count FROM login_logs WHERE status = 'success'").get().count;
    const failedLogins = db.prepare("SELECT COUNT(*) AS count FROM login_logs WHERE status = 'failed'").get().count;
    const uniqueUsersCount = db.prepare("SELECT COUNT(DISTINCT email) AS count FROM login_logs WHERE status = 'success'").get().count;

    return res.json({
      success: true,
      count: logs.length,
      stats: {
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueUsersCount
      },
      logs
    });
  } catch (error) {
    console.error('GetLoginLogs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve login audit logs.'
    });
  }
};

// DELETE /api/admin/login-logs (Clear or prune old logs)
exports.clearLoginLogs = (req, res) => {
  try {
    db.prepare("DELETE FROM login_logs").run();
    return res.json({
      success: true,
      message: 'All login audit records have been cleared.'
    });
  } catch (error) {
    console.error('ClearLoginLogs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear login logs.'
    });
  }
};

