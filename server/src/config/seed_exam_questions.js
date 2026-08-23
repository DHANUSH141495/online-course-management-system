const db = require('./db');

function seedExamQuestions() {
  console.log('📝 Seeding Comprehensive Certification Exam Questions...');

  const courses = db.prepare('SELECT id, title, category_id FROM courses').all();

  const insertQuestion = db.prepare(`
    INSERT OR IGNORE INTO exam_questions (course_id, question, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  courses.forEach((course) => {
    const existing = db.prepare('SELECT COUNT(*) AS count FROM exam_questions WHERE course_id = ?').get(course.id).count;
    if (existing >= 5) return;

    if (course.title.toLowerCase().includes('java') || course.category_id === 1) {
      insertQuestion.run(
        course.id,
        'What is the primary role of the Java Virtual Machine (JVM) ClassLoader subsystem?',
        'Loading .class bytecode files into memory and performing byte-code verification',
        'Directly executing C++ machine code without parsing',
        'Managing garbage collection exclusively for static variables',
        'Generating native OS threads bypassing the kernel',
        'A',
        'ClassLoader is responsible for Loading, Linking, and Initializing .class files into the JVM runtime memory.'
      );
      insertQuestion.run(
        course.id,
        'Which Spring Boot annotation is used to declare a REST controller combining @Controller and @ResponseBody?',
        '@Service',
        '@RestController',
        '@Repository',
        '@ComponentREST',
        'B',
        '@RestController is a specialized version of @Controller that automatically serializes response objects to JSON.'
      );
      insertQuestion.run(
        course.id,
        'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?',
        'O(1)',
        'O(N)',
        'O(log N)',
        'O(N log N)',
        'C',
        'In balanced BSTs, height is constrained to O(log N), guaranteeing O(log N) worst-case search time.'
      );
      insertQuestion.run(
        course.id,
        'Which Garbage Collector algorithm in modern JVMs is optimized for low-latency pause times on large heaps?',
        'Serial GC',
        'Parallel GC',
        'ZGC (Z Garbage Collector)',
        'DefNew GC',
        'C',
        'ZGC provides sub-millisecond max pause times regardless of heap size by performing garbage collection concurrently.'
      );
      insertQuestion.run(
        course.id,
        'What does the "SOLID" Dependency Inversion Principle (DIP) state?',
        'High-level modules should not depend on low-level modules; both should depend on abstractions',
        'Classes must have only one reason to change',
        'Subtypes must be substitutable for their base types',
        'Clients should not be forced to depend on methods they do not use',
        'A',
        'Dependency Inversion Principle enforces decoupling high-level business logic from low-level implementations via interfaces.'
      );
    } else if (course.title.toLowerCase().includes('react') || course.category_id === 2) {
      insertQuestion.run(
        course.id,
        'In React 18, what is the primary benefit of Concurrent Rendering & Suspense?',
        'Enables interruptible rendering so the browser main thread remains responsive during heavy updates',
        'Forces all state updates to occur synchronously',
        'Replaces JavaScript with WebAssembly',
        'Disables the Virtual DOM reconciliation',
        'A',
        'Concurrent Mode lets React pause and resume rendering to prioritize urgent user interactions like typing.'
      );
      insertQuestion.run(
        course.id,
        'Which React Hook prevents unnecessary function re-creation across re-renders for memoized child components?',
        'useMemo',
        'useCallback',
        'useRef',
        'useLayoutEffect',
        'B',
        'useCallback returns a memoized version of the callback function that only changes when its dependencies change.'
      );
      insertQuestion.run(
        course.id,
        'What is the primary difference between Next.js Server Components and Client Components?',
        'Server Components execute exclusively on the server and send zero JavaScript bundle to the browser',
        'Server Components cannot query databases',
        'Client Components cannot use useState or useEffect',
        'Server Components are slower than Client Components',
        'A',
        'Server Components render on the server without shipping JavaScript client bundle size, improving initial page load.'
      );
      insertQuestion.run(
        course.id,
        'How does Express.js error-handling middleware distinguish itself from standard middleware?',
        'It must accept four parameters: (err, req, res, next)',
        'It must be declared before all routes',
        'It uses async/await exclusively',
        'It does not require res.status()',
        'A',
        'Express recognizes error handlers by checking function arity of 4 arguments: (err, req, res, next).'
      );
      insertQuestion.run(
        course.id,
        'What is Cross-Origin Resource Sharing (CORS) and where is it enforced?',
        'A browser security mechanism that restricts HTTP requests made from a different domain/port',
        'A database connection pooling algorithm',
        'A firewall protocol at the operating system kernel level',
        'An encryption standard for HTTPS certificates',
        'A',
        'CORS is enforced by web browsers to protect users from malicious cross-origin requests unless authorized by CORS headers.'
      );
    } else {
      insertQuestion.run(
        course.id,
        'What is the ACID property in database transactions that guarantees all operations succeed or none are applied?',
        'Atomicity',
        'Consistency',
        'Isolation',
        'Durability',
        'A',
        'Atomicity ensures an all-or-nothing execution of database transactions.'
      );
      insertQuestion.run(
        course.id,
        'In Docker, what is the layer caching mechanism used for?',
        'Reusing unchanged build steps to drastically accelerate image compilation and deployment',
        'Encrypting filesystem volumes',
        'Balancing network traffic across containers',
        'Allocating memory limits dynamically',
        'A',
        'Docker caches intermediary build layers, rebuilding only layers that have changed since the last build.'
      );
      insertQuestion.run(
        course.id,
        'In Kubernetes (K8s), what is the smallest deployable computing unit that can be created and managed?',
        'Pod',
        'Node',
        'Service',
        'ConfigMap',
        'A',
        'A Pod wraps one or more containers, shared storage, and network IP as the atomic unit in Kubernetes.'
      );
      insertQuestion.run(
        course.id,
        'What does JWT (JSON Web Token) signature verification accomplish without database lookups?',
        'Cryptographically verifies that the payload has not been tampered with and was signed by the secret key',
        'Decrypts hidden user passwords',
        'Automatically refreshes database tables',
        'Blocks network denial-of-service attacks',
        'A',
        'JWT tokens are stateless and tamper-evident because altering the payload invalidates the cryptographic signature.'
      );
      insertQuestion.run(
        course.id,
        'Which HTTP status code indicates that the client request was understood but the user lacks necessary authorization role?',
        '401 Unauthorized',
        '403 Forbidden',
        '404 Not Found',
        '409 Conflict',
        'B',
        '403 Forbidden indicates the server understands who you are (authenticated), but your role does not possess permissions.'
      );
    }
  });

  const total = db.prepare('SELECT COUNT(*) AS count FROM exam_questions').get().count;
  console.log(`✅ Exam Question Seeding Complete: ${total} questions initialized across all courses.`);
}

seedExamQuestions();
