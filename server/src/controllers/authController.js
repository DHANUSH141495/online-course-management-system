const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

function getUserAgent(req) {
  return req.headers['user-agent'] || 'Unknown Browser';
}

// POST /api/auth/register
exports.register = (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const validRole = role === 'admin' ? 'admin' : 'student';

    // Check if email already registered
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Hash password & create user
    const passwordHash = bcrypt.hashSync(password, 10);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, avatar)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), passwordHash, validRole, avatar);

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: validRole,
      avatar
    };

    // Record initial registration login log in database
    try {
      db.prepare(`
        INSERT INTO login_logs (user_id, email, user_name, role, ip_address, user_agent, status)
        VALUES (?, ?, ?, ?, ?, ?, 'success')
      `).run(user.id, user.email, user.name, user.role, getClientIp(req), getUserAgent(req));
    } catch (logErr) {
      console.error('Failed to record register login log:', logErr);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
};

// POST /api/auth/login
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!user) {
      // Record failed attempt in database
      try {
        db.prepare(`
          INSERT INTO login_logs (user_id, email, user_name, role, ip_address, user_agent, status)
          VALUES (?, ?, ?, ?, ?, ?, 'failed')
        `).run(null, email.trim().toLowerCase(), 'Unknown', 'student', ip, userAgent);
      } catch (logErr) {
        console.error('Failed to log failed attempt:', logErr);
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      // Record failed attempt for known user
      try {
        db.prepare(`
          INSERT INTO login_logs (user_id, email, user_name, role, ip_address, user_agent, status)
          VALUES (?, ?, ?, ?, ?, ?, 'failed')
        `).run(user.id, user.email, user.name, user.role, ip, userAgent);
      } catch (logErr) {
        console.error('Failed to log failed attempt:', logErr);
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Record successful login in database
    try {
      db.prepare(`
        INSERT INTO login_logs (user_id, email, user_name, role, ip_address, user_agent, status)
        VALUES (?, ?, ?, ?, ?, ?, 'success')
      `).run(user.id, user.email, user.name, user.role, ip, userAgent);
    } catch (logErr) {
      console.error('Failed to log successful login:', logErr);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      created_at: user.created_at
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, avatar, created_at
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

// GET /api/auth/login-history (Current user personal login audit history)
exports.getLoginHistory = (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT id, email, user_name, role, ip_address, user_agent, status, login_at
      FROM login_logs
      WHERE user_id = ? OR LOWER(email) = LOWER(?)
      ORDER BY login_at DESC
      LIMIT 50
    `).all(req.user.id, req.user.email);

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('GetLoginHistory Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal login history.'
    });
  }
};

