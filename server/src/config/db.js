const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  console.log('📦 Initializing Database Tables...');

  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT
    );
  `);

  // Courses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      level TEXT NOT NULL DEFAULT 'Beginner' CHECK(level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
      duration TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0.0,
      rating REAL NOT NULL DEFAULT 4.8,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Lessons / Modules Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT NOT NULL,
      video_url TEXT,
      content_markdown TEXT,
      order_index INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Enrollments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    );
  `);

  // Lesson Progress Tracking Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(enrollment_id, lesson_id)
    );
  `);

  // Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    );
  `);

  // Student Personal Lesson Notes Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      note_text TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    );
  `);

  // Course Bookmarks / Wishlist Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    );
  `);

  // Final Certification Exam Questions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
      explanation TEXT,
      points INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Student Exam Submissions & Proctoring Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      score_percent INTEGER NOT NULL,
      passed INTEGER NOT NULL DEFAULT 0,
      warnings_count INTEGER NOT NULL DEFAULT 0,
      terminated_for_malpractice INTEGER NOT NULL DEFAULT 0,
      proctor_status TEXT NOT NULL DEFAULT 'clean', -- 'clean', 'warned', 'disqualified'
      certificate_code TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount > 0) {
    console.log('✓ Database already seeded.');
    return;
  }

  console.log('🌱 Seeding sample users, courses, and lessons...');

  // 1. Seed Users
  const studentHash = bcrypt.hashSync('Student@123', 10);
  const adminHash = bcrypt.hashSync('Admin@123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, avatar)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('Dhanush', 'dhanush@gmail.com', studentHash, 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  insertUser.run('John Doe', 'john.doe@gmail.com', studentHash, 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  insertUser.run('Admin Master', 'admin@coursify.com', adminHash, 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80');

  // 2. Seed Categories
  const insertCat = db.prepare(`
    INSERT INTO categories (name, slug, icon, color)
    VALUES (?, ?, ?, ?)
  `);

  const cat1 = insertCat.run('Programming & Core Java', 'programming', 'Code2', '#3b82f6').lastInsertRowid;
  const cat2 = insertCat.run('Web Development', 'web-development', 'Globe', '#10b981').lastInsertRowid;
  const cat3 = insertCat.run('AI & Python', 'ai-python', 'Sparkles', '#8b5cf6').lastInsertRowid;
  const cat4 = insertCat.run('Database Systems & SQL', 'databases', 'Database', '#f59e0b').lastInsertRowid;
  const cat5 = insertCat.run('Cloud & DevOps', 'cloud-devops', 'Cloud', '#06b6d4').lastInsertRowid;

  // 3. Seed Courses
  const insertCourse = db.prepare(`
    INSERT INTO courses (title, slug, description, instructor, category_id, level, duration, thumbnail, price, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title, description, duration, video_url, content_markdown, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Course 1: Java
  const c1 = insertCourse.run(
    'Java Programming & Spring Boot Masterclass',
    'java-programming-spring-boot',
    'Master Core Java from scratch, Object-Oriented Programming (OOP), Data Structures, multithreading, and build enterprise-grade REST APIs with Spring Boot and MySQL.',
    'Prof. K. Venkatesh',
    cat1,
    'All Levels',
    '18 Hours',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    0.0,
    4.9
  ).lastInsertRowid;

  const c1Lessons = [
    {
      title: '1. Introduction to Java Architecture & JVM/JRE/JDK',
      desc: 'Understand how Java code compiles to bytecode and executes on JVM.',
      dur: '25 min',
      video: 'https://www.youtube.com/embed/eIrMbAQSU34',
      content: `# Java Architecture & Fundamentals\n\nJava is a platform-independent, object-oriented programming language designed on the principle of **Write Once, Run Anywhere (WORA)**.\n\n### Key Components:\n1. **JDK (Java Development Kit)**: Complete toolkit containing compiler (\`javac\`), debugger, and JRE.\n2. **JRE (Java Runtime Environment)**: Provides libraries and runtime needed to run Java programs.\n3. **JVM (Java Virtual Machine)**: Interprets bytecode into machine code.\n\n\`\`\`java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Welcome to Java Masterclass!");\n    }\n}\n\`\`\``
    },
    {
      title: '2. Object Oriented Programming: Encapsulation & Inheritance',
      desc: 'Deep dive into classes, objects, access modifiers, constructors, and inheritance hierarchies.',
      dur: '45 min',
      video: 'https://www.youtube.com/embed/BSvkUk58K6U',
      content: `# Object-Oriented Programming in Java\n\nOOP models real-world entities through four pillars:\n- **Encapsulation**: Bundling data with methods and restricting direct access.\n- **Inheritance**: Code reusability between parent and child classes.\n- **Polymorphism**: Overloading and overriding.\n- **Abstraction**: Hiding complex implementation details.\n\n\`\`\`java\npublic class Student extends User {\n    private String courseEnrolled;\n    \n    public Student(String name, String email, String course) {\n        super(name, email);\n        this.courseEnrolled = course;\n    }\n}\n\`\`\``
    },
    {
      title: '3. Java Collections Framework & Generics',
      desc: 'Master ArrayList, LinkedList, HashMap, HashSet, and sorting with Comparable/Comparator.',
      dur: '40 min',
      video: 'https://www.youtube.com/embed/9OGbTeODnvo',
      content: `# Java Collections Framework\n\nThe Collections framework provides standardized data structures in \`java.util\`:\n\n- \`List\` (ArrayList, LinkedList)\n- \`Set\` (HashSet, TreeSet)\n- \`Map\` (HashMap, TreeMap)\n\n\`\`\`java\nMap<Integer, String> studentMap = new HashMap<>();\nstudentMap.put(101, "Dhanush");\nstudentMap.put(102, "John Doe");\n\`\`\``
    },
    {
      title: '4. Building RESTful APIs with Spring Boot 3',
      desc: 'Create scalable backend endpoints with Spring MVC, annotations, and JSON serialization.',
      dur: '60 min',
      video: 'https://www.youtube.com/embed/31KTdfz55tE',
      content: `# Spring Boot REST API\n\nSpring Boot simplifies enterprise Java backend development by providing auto-configuration and embedded servers.\n\n\`\`\`java\n@RestController\n@RequestMapping("/api/courses")\npublic class CourseController {\n    @GetMapping\n    public List<Course> getAllCourses() {\n        return courseService.findAll();\n    }\n}\n\`\`\``
    }
  ];

  c1Lessons.forEach((l, idx) => {
    insertLesson.run(c1, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
  });

  // Course 2: Full-Stack Web Dev (React & Node.js)
  const c2 = insertCourse.run(
    'Full-Stack Web Development with React & Node.js',
    'full-stack-web-development-react-node',
    'Build production-ready modern web applications from frontend to backend. Learn React hooks, modern CSS, Express REST APIs, authentication, and database persistence.',
    'Sarah Jenkins',
    cat2,
    'Beginner',
    '15 Hours',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    0.0,
    4.9
  ).lastInsertRowid;

  const c2Lessons = [
    {
      title: '1. Modern JavaScript (ES6+) & Asynchronous Programming',
      desc: 'Promises, Async/Await, Array methods, destructuring, and closures.',
      dur: '30 min',
      video: 'https://www.youtube.com/embed/W6NZfCO5SIk',
      content: `# Modern JavaScript & Asynchronous Flow\n\nUnderstand the event loop, async/await, arrow functions, and modern module syntax.\n\n\`\`\`javascript\nconst fetchCourses = async () => {\n  const res = await fetch('/api/courses');\n  const data = await res.json();\n  return data;\n};\n\`\`\``
    },
    {
      title: '2. React Core: Components, Props, and State Hooks',
      desc: 'Build reactive user interfaces using functional components and useState/useEffect.',
      dur: '50 min',
      video: 'https://www.youtube.com/embed/bMknfKXIFA8',
      content: `# React State & Lifecycle\n\nReact builds declarative UIs with component hierarchies.\n\n\`\`\`jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicks: {count}\n    </button>\n  );\n}\n\`\`\``
    },
    {
      title: '3. Express.js REST API Architecture & Middleware',
      desc: 'Design clean REST endpoints, handle request parameters, status codes, and error middleware.',
      dur: '45 min',
      video: 'https://www.youtube.com/embed/7H_QH9nipNs',
      content: `# Express.js Routing & Middleware\n\nExpress is a lightweight Node.js web application framework.\n\n\`\`\`javascript\napp.use(express.json());\napp.post('/api/enrollments', verifyToken, (req, res) => {\n  // Process enrollment\n});\n\`\`\``
    }
  ];

  c2Lessons.forEach((l, idx) => {
    insertLesson.run(c2, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
  });

  // Course 3: Python for Data Science & AI
  const c3 = insertCourse.run(
    'Python for Data Science, Machine Learning & AI',
    'python-data-science-ai',
    'Comprehensive guide to Python programming, NumPy, Pandas, data visualization with Matplotlib, and foundational machine learning algorithms.',
    'Dr. Alex Rivera',
    cat3,
    'Intermediate',
    '20 Hours',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    0.0,
    4.85
  ).lastInsertRowid;

  const c3Lessons = [
    {
      title: '1. Python Fundamentals & Data Structures',
      desc: 'Lists, tuples, dictionaries, list comprehensions, and functional methods.',
      dur: '35 min',
      video: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
      content: `# Python Core Syntax\n\nPython offers clean and expressive syntax for rapid algorithmic prototyping.\n\n\`\`\`python\nsquares = [x**2 for x in range(10) if x % 2 == 0]\nprint("Even squares:", squares)\n\`\`\``
    },
    {
      title: '2. High Performance Computing with NumPy & Pandas',
      desc: 'Vectorized operations, DataFrame querying, grouping, merging, and cleaning.',
      dur: '55 min',
      video: 'https://www.youtube.com/embed/vmEHCJofslg',
      content: `# Pandas Data Exploration\n\nManipulate tabular dataset structures efficiently.\n\n\`\`\`python\nimport pandas as pd\ndf = pd.read_csv('students.csv')\nprint(df.groupby('course')['score'].mean())\n\`\`\``
    }
  ];

  c3Lessons.forEach((l, idx) => {
    insertLesson.run(c3, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
  });

  // Course 4: Database Systems & SQL Mastery
  const c4 = insertCourse.run(
    'Database Systems & Relational SQL Mastery',
    'database-systems-sql-mastery',
    'Deep dive into Relational Database Management Systems (RDBMS), SQL queries, JOINs, indexing, normalization (1NF to 3NF), ACID transactions, and query optimization.',
    'Anita Roy',
    cat4,
    'All Levels',
    '12 Hours',
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    0.0,
    4.95
  ).lastInsertRowid;

  const c4Lessons = [
    {
      title: '1. Relational Database Concepts & Schema Design',
      desc: 'Primary keys, foreign keys, relationships (1:1, 1:N, M:N), and normalization.',
      dur: '30 min',
      video: 'https://www.youtube.com/embed/HXV3zeQKqGY',
      content: `# Database Normalization & Entities\n\nNormalization eliminates data redundancy and anomalies across tables.\n\n\`\`\`sql\nCREATE TABLE enrollments (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id),\n  course_id INTEGER REFERENCES courses(id)\n);\n\`\`\``
    },
    {
      title: '2. Complex SQL Queries, Aggregations, and Window Functions',
      desc: 'INNER/LEFT/RIGHT JOINs, GROUP BY, HAVING, subqueries, and ranking functions.',
      dur: '50 min',
      video: 'https://www.youtube.com/embed/7S_tz1z_5bA',
      content: `# Advanced SQL Queries\n\nExtracting analytical insights with aggregations.\n\n\`\`\`sql\nSELECT c.title, COUNT(e.id) AS total_enrolled, AVG(e.progress_percent) AS avg_progress\nFROM courses c\nLEFT JOIN enrollments e ON c.id = e.course_id\nGROUP BY c.id\nORDER BY total_enrolled DESC;\n\`\`\``
    }
  ];

  c4Lessons.forEach((l, idx) => {
    insertLesson.run(c4, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
  });

  // Course 5: Cloud & Docker
  const c5 = insertCourse.run(
    'Cloud Computing, Docker & Kubernetes Essentials',
    'cloud-computing-docker-kubernetes',
    'Containerize microservices, write Dockerfiles, configure multi-container docker-compose, and deploy cloud-native apps with Kubernetes.',
    'Marcus Vance',
    cat5,
    'Intermediate',
    '14 Hours',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    0.0,
    4.8
  ).lastInsertRowid;

  const c5Lessons = [
    {
      title: '1. Introduction to Containers & Docker Architecture',
      desc: 'Images vs Containers, Docker Engine, building custom Docker images.',
      dur: '40 min',
      video: 'https://www.youtube.com/embed/fqMOX6JJhGo',
      content: `# Dockerfile Basics\n\nPackage code and dependencies into portable images.\n\n\`\`\`dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 5000\nCMD ["npm", "start"]\n\`\`\``
    }
  ];

  c5Lessons.forEach((l, idx) => {
    insertLesson.run(c5, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
  });

  // 4. Seed Enrollments for Dhanush (User 1)
  const insertEnrollment = db.prepare(`
    INSERT INTO enrollments (user_id, course_id, progress_percent, status)
    VALUES (?, ?, ?, ?)
  `);

  const insertProgress = db.prepare(`
    INSERT INTO lesson_progress (enrollment_id, lesson_id, completed)
    VALUES (?, ?, 1)
  `);

  // Dhanush enrolled in Course 1 (Java) -> 75% completed (3 of 4 lessons)
  const e1 = insertEnrollment.run(1, c1, 75, 'active').lastInsertRowid;
  const c1LessonRows = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(c1);
  if (c1LessonRows.length >= 3) {
    insertProgress.run(e1, c1LessonRows[0].id);
    insertProgress.run(e1, c1LessonRows[1].id);
    insertProgress.run(e1, c1LessonRows[2].id);
  }

  // Dhanush enrolled in Course 2 (Web Dev) -> 100% completed (Certificate unlocked!)
  const e2 = insertEnrollment.run(1, c2, 100, 'completed').lastInsertRowid;
  const c2LessonRows = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(c2);
  c2LessonRows.forEach(l => {
    insertProgress.run(e2, l.id);
  });

  // Dhanush enrolled in Course 4 (SQL) -> 50% completed
  const e3 = insertEnrollment.run(1, c4, 50, 'active').lastInsertRowid;
  const c4LessonRows = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(c4);
  if (c4LessonRows.length >= 1) {
    insertProgress.run(e3, c4LessonRows[0].id);
  }

  // John Doe (User 2) enrolled in Course 1 (Java) -> 25%
  const e4 = insertEnrollment.run(2, c1, 25, 'active').lastInsertRowid;
  if (c1LessonRows.length >= 1) {
    insertProgress.run(e4, c1LessonRows[0].id);
  }

  // 5. Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (user_id, course_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `);

  insertReview.run(1, c1, 5, 'Exceptional course! The Spring Boot section helped me build my college capstone project.');
  insertReview.run(1, c2, 5, 'Great practical examples for React hooks and Express REST API integration.');
  insertReview.run(2, c1, 4, 'Very structured explanations for OOP concepts.');

  // 6. Seed Sample Notes for Dhanush
  const insertNote = db.prepare(`
    INSERT INTO lesson_notes (user_id, lesson_id, note_text)
    VALUES (?, ?, ?)
  `);

  if (c1LessonRows.length >= 1) {
    insertNote.run(1, c1LessonRows[0].id, `Key takeaways from JVM & Bytecode:\n- javac compiles .java to .class (Bytecode)\n- JVM loads bytecode via ClassLoader and uses JIT (Just-In-Time) compiler for performance optimization.\n- Remember for interview: WORA means Write Once, Run Anywhere!`);
  }

  // 7. Seed Sample Bookmarks for Dhanush
  const insertBookmark = db.prepare(`
    INSERT INTO bookmarks (user_id, course_id)
    VALUES (?, ?)
  `);
  insertBookmark.run(1, c3); // Python AI course bookmarked

  console.log('✓ Seeding complete! Demo accounts ready:');
  console.log('  👨‍🎓 Student: dhanush@gmail.com / Student@123');
  console.log('  👨‍💼 Admin:   admin@coursify.com / Admin@123');
}

// Execute schema creation & seeding
initDatabase();

module.exports = db;
