const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/stats', adminController.getAdminStats);
router.get('/enrollments', adminController.getAllEnrollments);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
