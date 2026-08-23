const assert = require('assert');
const http = require('http');

const PORT = 5000;
let studentToken = '';
let adminToken = '';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Suite...\n');

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200, 'Health check failed');
    console.log('✓ [1/8] Server Health Check: OK');

    // 2. Student Login
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'dhanush@gmail.com',
      password: 'Student@123'
    });
    assert.strictEqual(studentLogin.status, 200, 'Student login failed');
    assert.strictEqual(studentLogin.data.user.name, 'Dhanush', 'Student name mismatch');
    studentToken = studentLogin.data.token;
    console.log(`✓ [2/8] Student Login: OK (Logged in as ${studentLogin.data.user.name})`);

    // 3. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@coursify.com',
      password: 'Admin@123'
    });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
    assert.strictEqual(adminLogin.data.user.role, 'admin', 'Role mismatch');
    adminToken = adminLogin.data.token;
    console.log('✓ [3/8] Admin Login: OK (Admin privileges verified)');

    // 4. Course Catalog Query & Search
    const courses = await request('GET', '/api/courses?search=Java');
    assert.strictEqual(courses.status, 200, 'Courses fetch failed');
    assert.ok(courses.data.courses.length > 0, 'No courses found');
    console.log(`✓ [4/8] Course Catalog Query: OK (${courses.data.courses.length} courses found)`);

    // 5. Course Syllabus Details
    const courseDetail = await request('GET', '/api/courses/1');
    assert.strictEqual(courseDetail.status, 200, 'Course detail failed');
    assert.ok(courseDetail.data.course.lessons.length > 0, 'No lessons in syllabus');
    console.log(`✓ [5/8] Syllabus Detail: OK (${courseDetail.data.course.lessons.length} lessons loaded)`);

    // 6. Student Enrolled Courses & Progress
    const myEnrollments = await request('GET', '/api/enrollments/my', null, studentToken);
    assert.strictEqual(myEnrollments.status, 200, 'Enrollments fetch failed');
    assert.ok(myEnrollments.data.enrollments.length > 0, 'No enrollments for Dhanush');
    console.log(`✓ [6/8] Student Enrollments: OK (${myEnrollments.data.enrollments.length} enrolled courses)`);

    // 7. Toggle Lesson Completion
    const compRes = await fetch(`http://localhost:${PORT}/api/enrollments/courses/1/lessons/4/complete`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });
    const compData = await compRes.json();
    assert(compRes.ok && compData.success, 'Failed to complete lesson');
    console.log(`POST /api/enrollments/courses/1/lessons/4/complete ${compRes.status} - Progress Sync: OK (New Progress: ${compData.progress_percent}%)`);

    // 8. In-Lesson Study Notes Test
    const noteRes = await fetch(`http://localhost:${PORT}/api/enrollments/lessons/1/notes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}` 
      },
      body: JSON.stringify({ note_text: 'Personal observation: Bytecode verification happens in ClassLoader.' })
    });
    const noteData = await noteRes.json();
    assert(noteRes.ok && noteData.success, 'Failed to save notes');
    console.log(`POST /api/enrollments/lessons/1/notes ${noteRes.status} - In-Lesson Notes Sync: OK`);

    // 9. Course Bookmarking / Wishlist Test
    const bookRes = await fetch(`http://localhost:${PORT}/api/courses/2/bookmark`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });
    const bookData = await bookRes.json();
    assert(bookRes.ok && bookData.success, 'Failed to toggle bookmark');
    console.log(`POST /api/courses/2/bookmark ${bookRes.status} - Course Wishlist: OK (Bookmarked: ${bookData.is_bookmarked})`);

    // 10. Admin Overview Stats
    const statsRes = await fetch(`http://localhost:${PORT}/api/admin/stats`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    const statsData = await statsRes.json();
    assert(statsRes.ok && statsData.success, 'Failed to fetch admin stats');
    console.log(`GET /api/admin/stats ${statsRes.status} - Admin Stats: OK (Total Students: ${statsData.stats.total_students}, Enrollments: ${statsData.stats.total_enrollments})`);

    console.log('\n🎉 ALL 10 API VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

// Check if server is running, if not start it
const checkServer = http.get(`http://localhost:${PORT}/api/health`, () => {
  runTests();
});

checkServer.on('error', () => {
  console.log('Starting Express server for test execution...');
  require('./src/server');
  setTimeout(runTests, 1500);
});
