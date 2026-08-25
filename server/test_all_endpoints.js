const assert = require('assert');
const express = require('express');
const cors = require('cors');

// Ensure database is initialized
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const PORT = 5001; // Use test port
const BASE_URL = `http://localhost:${PORT}/api`;

let serverInstance = null;

function startTestServer() {
  return new Promise((resolve) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/admin', adminRoutes);

    app.get('/api/health', (req, res) => {
      res.json({
        status: 'online',
        system: 'Coursify Online Course Management System API (Test Engine)',
        timestamp: new Date().toISOString()
      });
    });

    serverInstance = app.listen(PORT, '127.0.0.1', () => {
      resolve();
    });
  });
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
}

async function runComprehensiveApiAudit() {
  console.log('\n======================================================');
  console.log('🔍 FULL SYSTEM ENDPOINT AUDIT (Online Course Management)');
  console.log('======================================================\n');

  try {
    await startTestServer();

    // 1. Health Check
    const health = await makeRequest('GET', '/health');
    console.log(`[1/20] GET /api/health -> Status ${health.status} (${health.data.status})`);
    assert(health.status === 200, 'Health check failed');

    // 2. Register New User
    const testEmail = `student_audit_${Date.now()}@example.com`;
    const reg = await makeRequest('POST', '/auth/register', {
      name: 'Audit Test Student',
      email: testEmail,
      password: 'Student@123',
      role: 'student'
    });
    console.log(`[2/20] POST /api/auth/register -> Status ${reg.status} (User ID: ${reg.data.user?.id}, Name: ${reg.data.user?.name})`);
    assert(reg.status === 201, 'Registration failed');

    // 3. Login as Student (Dhanush)
    const stuLogin = await makeRequest('POST', '/auth/login', {
      email: 'dhanush@gmail.com',
      password: 'Student@123'
    });
    console.log(`[3/20] POST /api/auth/login (Student) -> Status ${stuLogin.status} (Logged in: ${stuLogin.data.user?.name})`);
    assert(stuLogin.status === 200, 'Student login failed');
    const studentToken = stuLogin.data.token;

    // 4. Login as Admin
    const admLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@coursify.com',
      password: 'Admin@123'
    });
    console.log(`[4/20] POST /api/auth/login (Admin) -> Status ${admLogin.status} (Role: ${admLogin.data.user?.role})`);
    assert(admLogin.status === 200, 'Admin login failed');
    const adminToken = admLogin.data.token;

    // 5. Auth /me with Token
    const me = await makeRequest('GET', '/auth/me', null, studentToken);
    console.log(`[5/20] GET /api/auth/me -> Status ${me.status} (Verified User: ${me.data.user?.email})`);
    assert(me.status === 200, 'Auth me failed');

    // 6. Get Course Categories
    const cats = await makeRequest('GET', '/courses/categories');
    console.log(`[6/20] GET /api/courses/categories -> Status ${cats.status} (${cats.data.categories?.length} categories returned)`);
    assert(cats.status === 200, 'Get categories failed');

    // 7. Get All Courses with Search
    const courses = await makeRequest('GET', '/courses?search=Java&category=all&level=all', null, studentToken);
    console.log(`[7/20] GET /api/courses?search=Java -> Status ${courses.status} (${courses.data.courses?.length} matching courses)`);
    assert(courses.status === 200, 'Get courses failed');

    // 8. Get Single Course Syllabus
    const courseDetail = await makeRequest('GET', '/courses/1', null, studentToken);
    console.log(`[8/20] GET /api/courses/1 -> Status ${courseDetail.status} (Title: "${courseDetail.data.course?.title}", Lessons: ${courseDetail.data.course?.lessons?.length})`);
    assert(courseDetail.status === 200, 'Get course detail failed');

    // 9. Course Resources
    const resources = await makeRequest('GET', '/courses/1/resources', null, studentToken);
    console.log(`[9/20] GET /api/courses/1/resources -> Status ${resources.status} (${resources.data.resources?.length} downloadable assets)`);
    assert(resources.status === 200, 'Get resources failed');

    // 10. Course Discussions & Upvoting
    const postDisc = await makeRequest('POST', '/courses/1/discussions', {
      title: 'How does Spring Boot auto-configuration work?',
      content: 'Can someone explain @EnableAutoConfiguration internals?'
    }, studentToken);
    console.log(`[10/20] POST /api/courses/1/discussions -> Status ${postDisc.status} (Created thread ID: ${postDisc.data.discussion?.id})`);
    assert(postDisc.status === 201, 'Post discussion failed');

    const discId = postDisc.data.discussion?.id || 1;
    const upvote = await makeRequest('POST', `/courses/discussions/${discId}/upvote`, null, studentToken);
    console.log(`[11/20] POST /api/courses/discussions/${discId}/upvote -> Status ${upvote.status} (New Upvotes: ${upvote.data.upvotes})`);
    assert(upvote.status === 200, 'Upvote discussion failed');

    // 11. Wishlist / Bookmark Toggle & List
    const bookmarkToggle = await makeRequest('POST', '/courses/1/bookmark', null, studentToken);
    console.log(`[12/20] POST /api/courses/1/bookmark -> Status ${bookmarkToggle.status} (Bookmarked: ${bookmarkToggle.data.is_bookmarked})`);
    assert(bookmarkToggle.status === 200, 'Bookmark toggle failed');

    // 12. Student Enrollments List
    const myEnroll = await makeRequest('GET', '/enrollments/my', null, studentToken);
    console.log(`[13/20] GET /api/enrollments/my -> Status ${myEnroll.status} (${myEnroll.data.enrollments?.length} active/completed enrollments)`);
    assert(myEnroll.status === 200, 'Get enrollments failed');

    // 13. Classroom Video & Modules
    const classroom = await makeRequest('GET', '/enrollments/courses/1/learn', null, studentToken);
    console.log(`[14/20] GET /api/enrollments/courses/1/learn -> Status ${classroom.status} (${classroom.data.lessons?.length} lessons in classroom)`);
    assert(classroom.status === 200, 'Classroom fetch failed');

    // 14. Save & Fetch Personal Study Notes
    const saveNote = await makeRequest('POST', '/enrollments/lessons/1/notes', {
      note_text: 'JIT Compiler optimizes runtime bytecode execution.'
    }, studentToken);
    console.log(`[15/20] POST /api/enrollments/lessons/1/notes -> Status ${saveNote.status} (${saveNote.data.message})`);
    assert(saveNote.status === 200, 'Save notes failed');

    // 15. Certification Exam Endpoints
    const examData = await makeRequest('GET', '/enrollments/courses/1/exam', null, studentToken);
    console.log(`[16/20] GET /api/enrollments/courses/1/exam -> Status ${examData.status} (${examData.data.questions?.length} exam questions, Eligible: ${examData.data.is_eligible})`);
    assert(examData.status === 200, 'Get exam failed');

    // Get correct answers directly from test helper
    const correctRows = db.prepare('SELECT id, correct_option FROM exam_questions WHERE course_id = 1').all();
    const perfectAnswers = {};
    correctRows.forEach(r => {
      perfectAnswers[r.id] = r.correct_option;
    });

    const examSubmit = await makeRequest('POST', '/enrollments/courses/1/exam/submit', {
      answers: perfectAnswers,
      warnings_count: 0,
      terminated_for_malpractice: false
    }, studentToken);
    console.log(`[17/20] POST /api/enrollments/courses/1/exam/submit -> Status ${examSubmit.status} (Score: ${examSubmit.data.score_percent}%, Passed: ${examSubmit.data.passed}, Cert: ${examSubmit.data.certificate_code})`);
    assert(examSubmit.status === 200, 'Exam submission failed');

    const certCode = examSubmit.data.certificate_code;
    assert(certCode, 'Expected valid certificate code generated');

    // 16. Public Certificate Verification
    const verifyCert = await makeRequest('GET', `/enrollments/verify-certificate/${certCode}`);
    console.log(`[18/20] GET /api/enrollments/verify-certificate/${certCode} -> Status ${verifyCert.status} (Valid: ${verifyCert.data.is_valid}, Student: "${verifyCert.data.certificate?.student_name}", Course: "${verifyCert.data.certificate?.course_title}")`);
    assert(verifyCert.status === 200, 'Certificate verification failed');
    assert(verifyCert.data.is_valid === true, 'Certificate must be valid');

    // 17. Student Analytics & Streaks
    const analytics = await makeRequest('GET', '/enrollments/my/analytics', null, studentToken);
    console.log(`[19/20] GET /api/enrollments/my/analytics -> Status ${analytics.status} (Streak: ${analytics.data.analytics?.currentStreakDays} days, Hours: ${analytics.data.analytics?.totalStudyHours}h, Badges: ${analytics.data.analytics?.achievements?.length})`);
    assert(analytics.status === 200, 'Student analytics failed');

    // 18. Admin Overview Dashboard Stats
    const adminStats = await makeRequest('GET', '/admin/stats', null, adminToken);
    console.log(`[20/20] GET /api/admin/stats -> Status ${adminStats.status} (Total Students: ${adminStats.data.stats?.totalStudents}, Enrollments: ${adminStats.data.stats?.totalEnrollments})`);
    assert(adminStats.status === 200, 'Admin stats failed');

    console.log('\n======================================================');
    console.log('✅ ALL 20 API ENDPOINTS AUDITED & WORKING 100% PERFECTLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Audit Encountered an Issue:', error);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }
}

runComprehensiveApiAudit();
