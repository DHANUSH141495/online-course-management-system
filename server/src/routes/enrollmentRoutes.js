const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const examController = require('../controllers/examController');
const { authenticate } = require('../middleware/auth');

// Public Certificate Verification (No auth required)
router.get('/verify-certificate/:code', enrollmentController.verifyCertificate);

// Protected Student Routes (Require JWT Token)
router.post('/', authenticate, enrollmentController.enrollInCourse);
router.get('/my', authenticate, enrollmentController.getMyEnrollments);
router.get('/my/analytics', authenticate, enrollmentController.getStudentAnalytics);
router.post('/my/log-study-time', authenticate, enrollmentController.logStudyTime);

router.get('/courses/:courseId/learn', authenticate, enrollmentController.getCourseLearningRoom);
router.post('/courses/:courseId/lessons/:lessonId/complete', authenticate, enrollmentController.toggleLessonCompletion);
router.get('/lessons/:lessonId/notes', authenticate, enrollmentController.getLessonNotes);
router.post('/lessons/:lessonId/notes', authenticate, enrollmentController.saveLessonNotes);

// Exam Endpoints
router.get('/courses/:courseId/exam', authenticate, examController.getCourseExam);
router.post('/courses/:courseId/exam/submit', authenticate, examController.submitCourseExam);

module.exports = router;
