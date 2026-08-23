const http = require('http');
const assert = require('assert');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

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
    // 1. Health Check
    const health = await makeRequest('GET', '/health');
    console.log(`[1/15] GET /api/health -> Status ${health.status} (${health.data.status})`);
    assert(health.status === 200, 'Health check failed');

    // 2. Register New User
    const testEmail = `student_audit_${Date.now()}@example.com`;
    const reg = await makeRequest('POST', '/auth/register', {
      name: 'Audit Test Student',
      email: testEmail,
      password: 'Student@123',
      role: 'student'
    });
    console.log(`[2/15] POST /api/auth/register -> Status ${reg.status} (User ID: ${reg.data.user?.id}, Name: ${reg.data.user?.name})`);
    assert(reg.status === 201, 'Registration failed');

    // 3. Login as Student (Dhanush)
    const stuLogin = await makeRequest('POST', '/auth/login', {
      email: 'dhanush@gmail.com',
      password: 'Student@123'
    });
    console.log(`[3/15] POST /api/auth/login (Student) -> Status ${stuLogin.status} (Logged in: ${stuLogin.data.user?.name})`);
    assert(stuLogin.status === 200, 'Student login failed');
    const studentToken = stuLogin.data.token;

    // 4. Login as Admin
    const admLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@coursify.com',
      password: 'Admin@123'
    });
    console.log(`[4/15] POST /api/auth/login (Admin) -> Status ${admLogin.status} (Role: ${admLogin.data.user?.role})`);
    assert(admLogin.status === 200, 'Admin login failed');
    const adminToken = admLogin.data.token;

    // 5. Auth /me with Token
    const me = await makeRequest('GET', '/auth/me', null, studentToken);
    console.log(`[5/15] GET /api/auth/me -> Status ${me.status} (Verified User: ${me.data.user?.email})`);
    assert(me.status === 200, 'Auth me failed');

    // 6. Get Course Categories
    const cats = await makeRequest('GET', '/courses/categories');
    console.log(`[6/15] GET /api/courses/categories -> Status ${cats.status} (${cats.data.categories?.length} categories returned)`);
    assert(cats.status === 200, 'Get categories failed');

    // 7. Get All Courses with Search
    const courses = await makeRequest('GET', '/courses?search=Java&category=all&level=all', null, studentToken);
    console.log(`[7/15] GET /api/courses?search=Java -> Status ${courses.status} (${courses.data.courses?.length} matching courses)`);
    assert(courses.status === 200, 'Get courses failed');

    // 8. Get Single Course Syllabus
    const courseDetail = await makeRequest('GET', '/courses/1', null, studentToken);
    console.log(`[8/15] GET /api/courses/1 -> Status ${courseDetail.status} (Title: "${courseDetail.data.course?.title}", Lessons: ${courseDetail.data.lessons?.length})`);
    assert(courseDetail.status === 200, 'Get course detail failed');

    // 9. Wishlist / Bookmark Toggle & List
    const bookmarkToggle = await makeRequest('POST', '/courses/1/bookmark', null, studentToken);
    console.log(`[9/15] POST /api/courses/1/bookmark -> Status ${bookmarkToggle.status} (Bookmarked: ${bookmarkToggle.data.is_bookmarked})`);
    assert(bookmarkToggle.status === 200, 'Bookmark toggle failed');

    const bookmarks = await makeRequest('GET', '/courses/my/bookmarks', null, studentToken);
    console.log(`[10/15] GET /api/courses/my/bookmarks -> Status ${bookmarks.status} (${bookmarks.data.courses?.length} saved courses)`);
    assert(bookmarks.status === 200, 'Get bookmarks failed');

    // 10. Student Enrollments List
    const myEnroll = await makeRequest('GET', '/enrollments/my', null, studentToken);
    console.log(`[11/15] GET /api/enrollments/my -> Status ${myEnroll.status} (${myEnroll.data.enrollments?.length} active/completed enrollments)`);
    assert(myEnroll.status === 200, 'Get enrollments failed');

    // 11. Classroom Video & Modules
    const classroom = await makeRequest('GET', '/enrollments/courses/1/learn', null, studentToken);
    console.log(`[12/15] GET /api/enrollments/courses/1/learn -> Status ${classroom.status} (${classroom.data.lessons?.length} lessons in classroom)`);
    assert(classroom.status === 200, 'Classroom fetch failed');

    // 12. Save & Fetch Personal Study Notes
    const saveNote = await makeRequest('POST', '/enrollments/lessons/1/notes', {
      note_text: 'JIT Compiler optimizes runtime bytecode execution.'
    }, studentToken);
    console.log(`[13/15] POST /api/enrollments/lessons/1/notes -> Status ${saveNote.status} (${saveNote.data.message})`);
    assert(saveNote.status === 200, 'Save notes failed');

    const getNote = await makeRequest('GET', '/enrollments/lessons/1/notes', null, studentToken);
    console.log(`[14/15] GET /api/enrollments/lessons/1/notes -> Status ${getNote.status} (Note text length: ${getNote.data.note_text?.length} chars)`);
    assert(getNote.status === 200, 'Get notes failed');

    // 13. Admin Overview Dashboard Stats
    const adminStats = await makeRequest('GET', '/admin/stats', null, adminToken);
    console.log(`[15/15] GET /api/admin/stats -> Status ${adminStats.status} (Total Students: ${adminStats.data.stats?.totalStudents}, Enrollments: ${adminStats.data.stats?.totalEnrollments})`);
    assert(adminStats.status === 200, 'Admin stats failed');

    console.log('\n======================================================');
    console.log('✅ ALL 15 API ENDPOINTS AUDITED & WORKING 100% PERFECTLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Audit Encountered an Issue:', error);
  }
}

runComprehensiveApiAudit();
