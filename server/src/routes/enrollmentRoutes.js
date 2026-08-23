const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', enrollmentController.enrollInCourse);
router.get('/my', enrollmentController.getMyEnrollments);
router.get('/courses/:courseId/learn', enrollmentController.getCourseLearningRoom);
router.post('/courses/:courseId/lessons/:lessonId/complete', enrollmentController.toggleLessonCompletion);
router.get('/lessons/:lessonId/notes', enrollmentController.getLessonNotes);
router.post('/lessons/:lessonId/notes', enrollmentController.saveLessonNotes);

module.exports = router;
