const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const examController = require('../controllers/examController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', enrollmentController.enrollInCourse);
router.get('/my', enrollmentController.getMyEnrollments);
router.get('/courses/:courseId/learn', enrollmentController.getCourseLearningRoom);
router.post('/courses/:courseId/lessons/:lessonId/complete', enrollmentController.toggleLessonCompletion);
router.get('/lessons/:lessonId/notes', enrollmentController.getLessonNotes);
router.post('/lessons/:lessonId/notes', enrollmentController.saveLessonNotes);

// Exam Endpoints
router.get('/courses/:courseId/exam', examController.getCourseExam);
router.post('/courses/:courseId/exam/submit', examController.submitCourseExam);

module.exports = router;
