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

  // Interactive Discussions & Q&A
  db.exec(`
    CREATE TABLE IF NOT EXISTS discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT NOT NULL,
      upvotes INTEGER NOT NULL DEFAULT 0,
      is_answered INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Course Downloadable Resources
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'code', -- 'code', 'pdf', 'cheatsheet', 'link'
      url TEXT NOT NULL,
      description TEXT,
      file_size TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Student Badges & Achievements
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_key)
    );
  `);

  // Learning Logs (Weekly activity & streaks)
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
      minutes_spent INTEGER NOT NULL DEFAULT 15,
      activity_date DATE DEFAULT (DATE('now'))
    );
  `);

  // Create Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
    CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_exam_submissions_user_course ON exam_submissions(user_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_discussions_course ON discussions(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_resources_course ON course_resources(course_id);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  
  if (userCount === 0) {
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
    const cat6 = insertCat.run('Cybersecurity & Defense', 'cybersecurity', 'ShieldCheck', '#ef4444').lastInsertRowid;
    const cat7 = insertCat.run('Mobile App Development', 'mobile-dev', 'Smartphone', '#ec4899').lastInsertRowid;

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

    // Course 2: React & Node.js
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

    // Course 3: Python AI
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

    // Course 4: SQL
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

    // Course 5: Cloud Computing & Docker
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

    // Course 6: Generative AI & LangChain
    const c6 = insertCourse.run(
      'Generative AI Engineering, RAG & LLM Agents',
      'generative-ai-rag-llm-agents',
      'Build end-to-end AI applications using Prompt Engineering, LangChain, Vector Databases (Pinecone/Chroma), Embeddings, Retrieval-Augmented Generation (RAG), and Autonomous Agents.',
      'Dr. Elena Rostova',
      cat3,
      'Advanced',
      '22 Hours',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      0.0,
      4.98
    ).lastInsertRowid;

    const c6Lessons = [
      {
        title: '1. LLM Foundations, Tokens & Prompt Engineering Patterns',
        desc: 'Master zero-shot, few-shot, Chain-of-Thought prompting, and token optimization.',
        dur: '45 min',
        video: 'https://www.youtube.com/embed/jC4v5AS4RIM',
        content: `# Prompt Engineering & LLM Architecture\n\nPrompt engineering is the art of structuring natural language inputs to guide LLMs toward deterministic, high-accuracy outputs.\n\n### Key Techniques:\n- **Few-Shot Prompting**: Providing exemplary pairs before querying.\n- **Chain of Thought (CoT)**: Forcing step-by-step reasoning.\n- **System Prompts**: Setting persona, constraints, and JSON schemas.\n\n\`\`\`python\nprompt = f"""\nYou are an expert code auditor. Analyze the following function for vulnerabilities:\n{source_code}\n\nRespond in JSON format with keys: issue_found, severity, fix.\n"""\n\`\`\``
      },
      {
        title: '2. Retrieval-Augmented Generation (RAG) Architecture',
        desc: 'Chunking, vector embeddings, cosine similarity search, and hybrid retrieval pipelines.',
        dur: '60 min',
        video: 'https://www.youtube.com/embed/tcqEUSNCn8I',
        content: `# Retrieval-Augmented Generation (RAG)\n\nRAG bridges proprietary enterprise knowledge with pre-trained LLMs without expensive fine-tuning.\n\n### RAG Pipeline:\n1. Ingest & Chunk Documents\n2. Generate Vector Embeddings\n3. Store in Vector Database (Chroma/Pinecone)\n4. Semantic Query -> Retrieve Top K Chunks\n5. Synthesize Augmented Answer with Context`
      }
    ];

    c6Lessons.forEach((l, idx) => {
      insertLesson.run(c6, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
    });

    // Course 7: Cybersecurity
    const c7 = insertCourse.run(
      'Ethical Hacking, Penetration Testing & Cyber Defense',
      'ethical-hacking-cyber-defense',
      'Learn modern penetration testing methodologies, OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR), Wireshark packet analysis, cryptography, and server hardening.',
      'Vikram Sethi',
      cat6,
      'Intermediate',
      '16 Hours',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      0.0,
      4.92
    ).lastInsertRowid;

    const c7Lessons = [
      {
        title: '1. Reconnaissance, Footprinting & Network Scanning',
        desc: 'OSINT gathering, Nmap port scanning techniques, banner grabbing, and DNS enumeration.',
        dur: '45 min',
        video: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
        content: `# Network Scanning & Nmap Fundamentals\n\nActive reconnaissance involves interacting directly with the target to discover active hosts and open ports.\n\n\`\`\`bash\n# SYN Stealth Scan with OS and service version detection\nnmap -sS -sV -O -p 1-10000 192.168.1.1\n\`\`\``
      },
      {
        title: '2. OWASP Top 10 Vulnerabilities: SQLi & Cross-Site Scripting (XSS)',
        desc: 'Understand and patch injection attacks, reflected/stored XSS, and parameterized queries.',
        dur: '55 min',
        video: 'https://www.youtube.com/embed/2_lswM1S264',
        content: `# Web Application Vulnerabilities\n\nPreventing SQL Injection with Prepared Statements:\n\n\`\`\`javascript\n// VULNERABLE:\ndb.query(\`SELECT * FROM users WHERE email = '\${email}'\`);\n\n// SECURE (Parameterized Query):\ndb.prepare('SELECT * FROM users WHERE email = ?').get(email);\n\`\`\``
      }
    ];

    c7Lessons.forEach((l, idx) => {
      insertLesson.run(c7, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
    });

    // Course 8: React Native
    const c8 = insertCourse.run(
      'Mobile App Development with React Native & Expo',
      'mobile-app-development-react-native',
      'Create high-performance cross-platform iOS and Android mobile apps from a single codebase. Learn Flexbox layout, Navigation, Camera, Geolocation, and App Store publishing.',
      'David Chen',
      cat7,
      'Beginner',
      '15 Hours',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      0.0,
      4.88
    ).lastInsertRowid;

    const c8Lessons = [
      {
        title: '1. React Native Components & Flexbox Layout System',
        desc: 'View, Text, Image, ScrollView, StyleSheet, and mobile responsive layouts.',
        dur: '40 min',
        video: 'https://www.youtube.com/embed/0-S5a0eXPoc',
        content: `# React Native Core Components\n\nReact Native compiles to native iOS (UIKit) and Android (View) widgets.\n\n\`\`\`jsx\nimport React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Welcome to Coursify Mobile</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },\n  title: { fontSize: 22, color: '#f8fafc', fontWeight: 'bold' }\n});\n\`\`\``
      }
    ];

    c8Lessons.forEach((l, idx) => {
      insertLesson.run(c8, l.title, l.desc, l.dur, l.video, l.content, idx + 1);
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

    // Dhanush enrolled in Course 6 (Gen AI) -> 50% completed
    const e6 = insertEnrollment.run(1, c6, 50, 'active').lastInsertRowid;
    const c6LessonRows = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(c6);
    if (c6LessonRows.length >= 1) {
      insertProgress.run(e6, c6LessonRows[0].id);
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
    insertReview.run(1, c6, 5, 'The RAG architecture and LangChain practical exercises are top-notch!');

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
    insertBookmark.run(1, c7); // Cybersecurity bookmarked

    console.log('✓ Seeding complete! Demo accounts ready:');
    console.log('  👨‍🎓 Student: dhanush@gmail.com / Student@123');
    console.log('  👨‍💼 Admin:   admin@coursify.com / Admin@123');
  }

  // Ensure Exam Questions are seeded for all courses
  seedExamQuestions();
  seedDiscussionsAndResources();
  seedAchievementsAndLogs();
}

function seedExamQuestions() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM exam_questions').get().count;
  if (count > 0) return;

  console.log('📝 Seeding Certification Exam Question Bank for all courses...');

  const insertQ = db.prepare(`
    INSERT INTO exam_questions (course_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const courses = db.prepare('SELECT id, title FROM courses').all();

  courses.forEach(course => {
    if (course.title.includes('Java')) {
      insertQ.run(course.id, 'Which component of Java is responsible for compiling .java source code into bytecode (.class)?', 'JVM (Java Virtual Machine)', 'JDK javac compiler', 'JRE Runtime Environment', 'JIT Just-In-Time Compiler', 'B', 'The javac compiler bundled within the JDK compiles Java source code into bytecode (.class files).', 1);
      insertQ.run(course.id, 'Which of the following OOP principles allows a subclass to provide a specific implementation of an existing parent class method?', 'Encapsulation', 'Method Overloading', 'Method Overriding (Polymorphism)', 'Data Abstraction', 'C', 'Method Overriding in inheritance allows a child class to override a parent method implementation.', 1);
      insertQ.run(course.id, 'Which Java Collection implementation guarantees O(1) time complexity for basic operations like get() and put()?', 'ArrayList', 'HashMap', 'TreeSet', 'LinkedList', 'B', 'HashMap provides constant time O(1) performance on average for get and put operations via hashing.', 1);
      insertQ.run(course.id, 'In Spring Boot, which annotation is used to create a RESTful controller that automatically serializes response bodies to JSON?', '@Controller', '@Component', '@RestController', '@Service', 'C', '@RestController combines @Controller and @ResponseBody to return JSON data automatically.', 1);
      insertQ.run(course.id, 'Which keyword in Java is used to prevent a variable from being re-assigned or a class from being inherited?', 'static', 'final', 'abstract', 'volatile', 'B', 'The final keyword makes a variable constant, prevents method overriding, and prevents class inheritance.', 1);
    } else if (course.title.includes('React & Node') || course.title.includes('Web Development')) {
      insertQ.run(course.id, 'In React, which hook is used to perform side effects such as fetching data from an API or subscribing to events?', 'useState', 'useMemo', 'useEffect', 'useCallback', 'C', 'useEffect is the standard hook for managing side-effects and component lifecycles.', 1);
      insertQ.run(course.id, 'What is the purpose of middleware in an Express.js web server?', 'Compiling React JSX templates', 'Intercepting HTTP requests and responses before reaching route handlers', 'Connecting directly to SQLite storage', 'Running unit tests automatically', 'B', 'Express middleware functions have access to the request and response objects and can execute code or terminate request cycles.', 1);
      insertQ.run(course.id, 'How is JWT (JSON Web Token) authentication typically transmitted in HTTP request headers?', 'Authorization: Bearer <token>', 'Cookie: session_id=<token>', 'Token-Key: <token>', 'Accept-Token: <token>', 'A', 'JWT tokens are passed in the Authorization header formatted as `Bearer <token>`.', 1);
      insertQ.run(course.id, 'Which HTTP status code signifies that a new resource was successfully created on the server?', '200 OK', '201 Created', '204 No Content', '304 Not Modified', 'B', 'HTTP 201 Created indicates the request succeeded and led to the creation of a resource.', 1);
      insertQ.run(course.id, 'In modern JavaScript, what does Promise.all() do when supplied with an array of asynchronous tasks?', 'Executes them sequentially one by one', 'Executes all tasks concurrently and resolves when all succeed', 'Cancels remaining promises if one is slow', 'Transforms JSON objects into arrays', 'B', 'Promise.all resolves when all input promises have resolved or rejects immediately if any fails.', 1);
    } else if (course.title.includes('Python') || course.title.includes('Data Science')) {
      insertQ.run(course.id, 'Which Python library is primary for fast numerical multi-dimensional array operations?', 'Flask', 'NumPy', 'BeautifulSoup', 'Requests', 'B', 'NumPy provides N-dimensional arrays with high-performance C-backed vectorized operations.', 1);
      insertQ.run(course.id, 'In Pandas, what is the two-dimensional tabular data structure with labeled axes called?', 'Series', 'Tensor', 'DataFrame', 'Dictionary', 'C', 'A DataFrame is a 2D labeled data structure with columns of potentially different types.', 1);
      insertQ.run(course.id, 'Which metric evaluates the percentage of correct predictions in a balanced classification problem?', 'Mean Squared Error', 'Accuracy Score', 'Silhouette Score', 'Log Loss', 'B', 'Accuracy is the ratio of correct predictions to total input samples.', 1);
      insertQ.run(course.id, 'Which Python syntax creates a concise list of squares for even numbers from 0 to 8?', '[x**2 for x in range(9) if x%2==0]', '{x: x**2 for x in range(9)}', 'map(lambda x: x*2, range(9))', 'range(0, 9).filter(even)', 'A', 'List comprehensions provide an elegant syntax for filtering and transforming iterables.', 1);
      insertQ.run(course.id, 'What is the purpose of train_test_split() in scikit-learn?', 'Splitting dataset into training and validation sets to prevent overfitting', 'Cleaning missing NaN values in columns', 'Scaling numeric feature vectors', 'Plotting confusion matrix charts', 'A', 'train_test_split divides data into training and evaluation sets for unbiased model evaluation.', 1);
    } else if (course.title.includes('Database') || course.title.includes('SQL')) {
      insertQ.run(course.id, 'Which SQL constraint guarantees that every row in a table has a unique non-null identifier?', 'CHECK', 'FOREIGN KEY', 'PRIMARY KEY', 'DEFAULT', 'C', 'PRIMARY KEY uniquely identifies each record in a database table and disallows nulls.', 1);
      insertQ.run(course.id, 'Which clause in SQL is used to filter aggregated group records produced by GROUP BY?', 'WHERE', 'ORDER BY', 'HAVING', 'LIMIT', 'C', 'HAVING filters grouped aggregates, whereas WHERE filters individual rows before grouping.', 1);
      insertQ.run(course.id, 'Which normal form requires removing partial functional dependencies where non-prime attributes depend on part of a composite key?', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF', 'B', '2NF requires 1NF and that all non-key attributes are fully functionally dependent on the entire primary key.', 1);
      insertQ.run(course.id, 'What does the "A" in ACID database transactions stand for?', 'Availability', 'Atomicity', 'Asynchronous', 'Authorization', 'B', 'Atomicity guarantees that all operations in a transaction either complete entirely or are fully rolled back.', 1);
      insertQ.run(course.id, 'Which type of JOIN returns all records from the left table and matched records from the right table?', 'INNER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'B', 'LEFT JOIN returns all rows from the left table and matched rows from the right table (or NULLs).', 1);
    } else {
      // General fallback questions for other courses
      insertQ.run(course.id, 'What is the primary advantage of modular software engineering?', 'Higher coupling between classes', 'Code reusability, maintainability, and clean separation of concerns', 'Slower runtime performance', 'Bypassing security audits', 'B', 'Modular design enables maintainable code, unit testability, and separation of concerns.', 1);
      insertQ.run(course.id, 'Which protocol provides encrypted, secure communication over computer networks?', 'HTTP', 'HTTPS (TLS/SSL)', 'FTP', 'Telnet', 'B', 'HTTPS encrypts transport layer packets using TLS/SSL to prevent eavesdropping and tampering.', 1);
      insertQ.run(course.id, 'In cloud computing, what does CI/CD stand for?', 'Computer Interface / Common Distribution', 'Continuous Integration / Continuous Deployment (or Delivery)', 'Cloud Infrastructure / Container Deployment', 'Centralized Identity / Cloud Directory', 'B', 'CI/CD automates building, testing, and deploying software updates reliably.', 1);
      insertQ.run(course.id, 'What is the function of an API Gateway in microservices architecture?', 'Storing relational database tables', 'Routing client requests, authentication, and load balancing', 'Compiling frontend code bundles', 'Rendering CSS styles in browsers', 'B', 'API Gateway acts as the single entry point for routing, authentication, and throttling requests.', 1);
      insertQ.run(course.id, 'Which software design pattern ensures that a class has only one instance while providing global access to it?', 'Factory Pattern', 'Observer Pattern', 'Singleton Pattern', 'Decorator Pattern', 'C', 'Singleton pattern ensures a class has only one instance and provides a global access point.', 1);
    }
  });

  console.log('✓ Exam questions seeded successfully.');
}

function seedDiscussionsAndResources() {
  const discCount = db.prepare('SELECT COUNT(*) AS count FROM discussions').get().count;
  if (discCount === 0) {
    console.log('💬 Seeding Course Discussion Forum threads...');
    const insertDisc = db.prepare(`
      INSERT INTO discussions (course_id, lesson_id, user_id, title, content, upvotes, is_answered)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertDisc.run(1, 1, 2, 'How does JIT compiler differ from standard interpreter in JVM?', 'Could someone clarify when the JIT compiler kicks in vs when bytecode is just interpreted line by line?', 4, 1);
    insertDisc.run(1, 1, 3, 'Reply: JIT Hotspot Detection', 'The JVM tracks execution counts ("hot spots"). When a method is called frequently, JIT compiles that bytecode directly into native machine instructions for high speed execution.', 7, 1);
    insertDisc.run(2, 4, 1, 'Best practices for handling JWT expiration in React?', 'What is the cleanest way to handle 401 Unauthorized responses across all fetch calls in the React frontend?', 5, 1);
    insertDisc.run(2, 4, 3, 'Reply: Auth Interceptor Pattern', 'Use a centralized `authFetch` wrapper or Axios response interceptor that checks for 401 status and dispatches a logout or refresh token action automatically.', 9, 1);
    insertDisc.run(4, 8, 2, 'When should I use HAVING vs WHERE in SQL?', 'Is there a performance difference between filtering before or after GROUP BY?', 3, 1);
  }

  const resCount = db.prepare('SELECT COUNT(*) AS count FROM course_resources').get().count;
  if (resCount === 0) {
    console.log('📂 Seeding Course Resources & Cheatsheets...');
    const insertRes = db.prepare(`
      INSERT INTO course_resources (course_id, title, type, url, description, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertRes.run(1, 'Core Java & OOP Architecture Cheatsheet', 'cheatsheet', 'https://github.com/DHANUSH141495/online-course-management-system', 'Complete quick-reference guide covering OOP pillars, collections hierarchy, and JVM internals.', '1.2 MB');
    insertRes.run(1, 'Spring Boot 3 REST API Starter Code', 'code', 'https://github.com/DHANUSH141495/online-course-management-system', 'Production-ready Spring Boot starter repository with JWT authentication and MySQL integration.', '3.8 MB');
    insertRes.run(2, 'React 18 & Express Full-Stack Architecture Guide', 'pdf', 'https://github.com/DHANUSH141495/online-course-management-system', 'Step-by-step PDF blueprint for setting up React Context, custom hooks, and Express REST APIs.', '2.4 MB');
    insertRes.run(3, 'Pandas & NumPy Quick Reference Guide', 'cheatsheet', 'https://github.com/DHANUSH141495/online-course-management-system', 'Essential commands for DataFrame slicing, grouping, cleaning, and matrix mathematics.', '850 KB');
    insertRes.run(4, 'SQL Joins & Indexing Performance Handbook', 'pdf', 'https://github.com/DHANUSH141495/online-course-management-system', 'Visual explanations of JOIN algorithms, B-Trees, and EXPLAIN query plan optimization.', '1.9 MB');
  }
}

function seedAchievementsAndLogs() {
  const achCount = db.prepare('SELECT COUNT(*) AS count FROM user_achievements').get().count;
  if (achCount === 0) {
    console.log('🏆 Seeding Student Badges & Analytics...');
    const insertAch = db.prepare(`
      INSERT INTO user_achievements (user_id, badge_key, title, description, icon)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Badges for Dhanush (User 1)
    insertAch.run(1, 'first_course', 'Course Pioneer', 'Enrolled in your first course on Coursify', 'Award');
    insertAch.run(1, 'certified_grad', 'Certified Developer', 'Successfully completed 100% course syllabus and unlocked official certificate', 'CheckCircle2');
    insertAch.run(1, 'note_taker', 'Knowledge Scribe', 'Created detailed personal lesson notes in the learning room', 'BookOpen');
    insertAch.run(1, 'fast_learner', 'Sprint Master', 'Completed 5 lessons in a single study session', 'Zap');

    // Seed learning logs for Dhanush over the past 7 days
    const insertLog = db.prepare(`
      INSERT INTO learning_logs (user_id, minutes_spent, activity_date)
      VALUES (?, ?, DATE('now', ?))
    `);

    insertLog.run(1, 45, '-6 days');
    insertLog.run(1, 60, '-5 days');
    insertLog.run(1, 30, '-4 days');
    insertLog.run(1, 75, '-3 days');
    insertLog.run(1, 90, '-2 days');
    insertLog.run(1, 45, '-1 days');
    insertLog.run(1, 60, '0 days');
  }
}

// Execute schema creation & seeding
initDatabase();

module.exports = db;
