const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/categories', courseController.getCategories);
router.get('/my/bookmarks', authenticate, courseController.getMyBookmarks);
router.post('/:id/bookmark', authenticate, courseController.toggleBookmark);
router.get('/:id', optionalAuth, courseController.getCourseById);

// Admin Protected Routes
router.post('/', authenticate, requireRole('admin'), courseController.createCourse);
router.put('/:id', authenticate, requireRole('admin'), courseController.updateCourse);
router.delete('/:id', authenticate, requireRole('admin'), courseController.deleteCourse);

module.exports = router;
