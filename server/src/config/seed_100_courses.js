const db = require('./db');

// List of realistic course topics across 8 categories
const rawCategories = [
  { name: 'Core Programming & DSA', slug: 'programming-dsa', icon: 'Code', color: '#6366f1' },
  { name: 'Full-Stack Web Development', slug: 'web-development', icon: 'Globe', color: '#06b6d4' },
  { name: 'AI, ML & Data Science', slug: 'ai-data-science', icon: 'Brain', color: '#ec4899' },
  { name: 'Cloud Computing & DevOps', slug: 'cloud-devops', icon: 'Cloud', color: '#3b82f6' },
  { name: 'Databases & System Architecture', slug: 'databases-systems', icon: 'Database', color: '#10b981' },
  { name: 'Mobile App Development', slug: 'mobile-development', icon: 'Smartphone', color: '#f59e0b' },
  { name: 'Cybersecurity & Ethical Hacking', slug: 'cybersecurity', icon: 'Shield', color: '#ef4444' },
  { name: 'Software Testing & Automation', slug: 'testing-qa', icon: 'CheckCircle', color: '#8b5cf6' }
];

const courseTemplates = [
  // Core Programming & DSA (Category 1)
  { cat: 1, title: 'Java Programming & Spring Boot Masterclass', level: 'Intermediate', duration: '28 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 1, title: 'Data Structures & Algorithms in Java (Interview Prep)', level: 'Intermediate', duration: '34 Hours', instructor: 'Prof. Ananya Rao' },
  { cat: 1, title: 'C++ for Competitive Programming & System Design', level: 'Advanced', duration: '40 Hours', instructor: 'Alexei Ivanov' },
  { cat: 1, title: 'Python Fundamentals to Object-Oriented Mastery', level: 'Beginner', duration: '22 Hours', instructor: 'Sarah Jenkins' },
  { cat: 1, title: 'Rust Systems Programming: Memory Safety Without GC', level: 'Advanced', duration: '26 Hours', instructor: 'Erik Lindqvist' },
  { cat: 1, title: 'Go (Golang) Microservices & Concurrency in Depth', level: 'Intermediate', duration: '24 Hours', instructor: 'Vikram Malhotra' },
  { cat: 1, title: 'Design Patterns in Modern Java & TypeScript', level: 'Intermediate', duration: '18 Hours', instructor: 'Marcus Aurel' },
  { cat: 1, title: 'C# and .NET 8 Enterprise Backend Architecture', level: 'Intermediate', duration: '30 Hours', instructor: 'David Vance' },
  { cat: 1, title: 'Kotlin for Backend & Server-Side Development', level: 'Beginner', duration: '16 Hours', instructor: 'Natalia Romanova' },
  { cat: 1, title: 'Scala & Functional Programming for Big Data', level: 'Advanced', duration: '25 Hours', instructor: 'Priya Sharma' },
  { cat: 1, title: 'Low-Level Computer Architecture & Assembly (x86/ARM)', level: 'Advanced', duration: '32 Hours', instructor: 'Dr. Arthur Pendelton' },
  { cat: 1, title: 'Graph Algorithms & Dynamic Programming Deep Dive', level: 'Advanced', duration: '28 Hours', instructor: 'Prof. Ananya Rao' },
  { cat: 1, title: 'Modern JavaScript (ES6+ to ES2024) Deep Mechanics', level: 'Beginner', duration: '15 Hours', instructor: 'Lucas Silva' },

  // Full-Stack Web Development (Category 2)
  { cat: 2, title: 'Modern Full-Stack React 18, Node.js & SQLite', level: 'Intermediate', duration: '24 Hours', instructor: 'Elena Rostova' },
  { cat: 2, title: 'Next.js 14 App Router, Server Actions & Tailwind CSS', level: 'Intermediate', duration: '22 Hours', instructor: 'Lucas Silva' },
  { cat: 2, title: 'Vue 3 & Nuxt.js Enterprise Web Applications', level: 'Intermediate', duration: '20 Hours', instructor: 'Jean-Luc Dubois' },
  { cat: 2, title: 'Angular 17 Signals & Enterprise Architecture', level: 'Advanced', duration: '28 Hours', instructor: 'Kavita Reddy' },
  { cat: 2, title: 'Backend REST API Engineering with Express & Fastify', level: 'Beginner', duration: '18 Hours', instructor: 'Elena Rostova' },
  { cat: 2, title: 'Full-Stack SvelteKit & Supabase Development', level: 'Beginner', duration: '16 Hours', instructor: 'Oliver Hansen' },
  { cat: 2, title: 'Django & Django REST Framework with React Frontend', level: 'Intermediate', duration: '26 Hours', instructor: 'Tariq Al-Mansoor' },
  { cat: 2, title: 'Ruby on Rails 7 Full-Stack Rapid Prototyping', level: 'Beginner', duration: '20 Hours', instructor: 'Chloe Bennett' },
  { cat: 2, title: 'Tailwind CSS & Modern Responsive Web Design UI', level: 'Beginner', duration: '12 Hours', instructor: 'Lucas Silva' },
  { cat: 2, title: 'GraphQL API Design with Apollo & TypeScript', level: 'Advanced', duration: '18 Hours', instructor: 'Kavita Reddy' },
  { cat: 2, title: 'Real-Time Web Apps with WebSockets & Socket.io', level: 'Intermediate', duration: '14 Hours', instructor: 'Elena Rostova' },
  { cat: 2, title: 'Web Performance Optimization & Core Web Vitals', level: 'Advanced', duration: '15 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 2, title: 'Progressive Web Apps (PWA) & Offline First Architecture', level: 'Intermediate', duration: '14 Hours', instructor: 'Jean-Luc Dubois' },

  // AI, ML & Data Science (Category 3)
  { cat: 3, title: 'Python for AI, Machine Learning & Data Science', level: 'Intermediate', duration: '32 Hours', instructor: 'Prof. Rajesh Kumar' },
  { cat: 3, title: 'Deep Learning with PyTorch & Neural Networks', level: 'Advanced', duration: '36 Hours', instructor: 'Dr. Sophia Zhang' },
  { cat: 3, title: 'Large Language Models (LLMs) & LangChain Applications', level: 'Advanced', duration: '24 Hours', instructor: 'Dr. Sophia Zhang' },
  { cat: 3, title: 'Computer Vision with OpenCV, YOLOv8 & PyTorch', level: 'Advanced', duration: '28 Hours', instructor: 'Prof. Rajesh Kumar' },
  { cat: 3, title: 'Natural Language Processing (NLP) with Transformers', level: 'Advanced', duration: '30 Hours', instructor: 'Dr. Sophia Zhang' },
  { cat: 3, title: 'Data Analysis & Manipulation with Pandas & NumPy', level: 'Beginner', duration: '18 Hours', instructor: 'Sarah Jenkins' },
  { cat: 3, title: 'Data Visualization Mastery with Seaborn, Plotly & Tableau', level: 'Beginner', duration: '16 Hours', instructor: 'Sarah Jenkins' },
  { cat: 3, title: 'TensorFlow 2 & Keras for Production Machine Learning', level: 'Intermediate', duration: '28 Hours', instructor: 'Vikram Malhotra' },
  { cat: 3, title: 'MLOps: Deploying ML Models with Docker, FastAPI & MLflow', level: 'Advanced', duration: '22 Hours', instructor: 'Erik Lindqvist' },
  { cat: 3, title: 'Reinforcement Learning with Gymnasium & Stable-Baselines3', level: 'Advanced', duration: '26 Hours', instructor: 'Dr. Sophia Zhang' },
  { cat: 3, title: 'Generative AI with Stable Diffusion & Midjourney APIs', level: 'Intermediate', duration: '18 Hours', instructor: 'Lucas Silva' },
  { cat: 3, title: 'Time Series Forecasting with ARIMA, Prophet & LSTMs', level: 'Intermediate', duration: '20 Hours', instructor: 'Prof. Rajesh Kumar' },
  { cat: 3, title: 'Feature Engineering & Model Selection Strategies', level: 'Intermediate', duration: '16 Hours', instructor: 'Prof. Rajesh Kumar' },

  // Cloud Computing & DevOps (Category 4)
  { cat: 4, title: 'AWS Certified Solutions Architect Associate Prep', level: 'Intermediate', duration: '35 Hours', instructor: 'David Vance' },
  { cat: 4, title: 'Docker Containers & Microservices Zero to Hero', level: 'Beginner', duration: '18 Hours', instructor: 'David Vance' },
  { cat: 4, title: 'Kubernetes (K8s) Cluster Administration & Helm', level: 'Advanced', duration: '30 Hours', instructor: 'Erik Lindqvist' },
  { cat: 4, title: 'CI/CD Automation with GitHub Actions & GitLab CI', level: 'Intermediate', duration: '16 Hours', instructor: 'David Vance' },
  { cat: 4, title: 'Infrastructure as Code (IaC) with Terraform & Ansible', level: 'Advanced', duration: '24 Hours', instructor: 'Erik Lindqvist' },
  { cat: 4, title: 'Google Cloud Platform (GCP) Cloud Engineer Guide', level: 'Intermediate', duration: '28 Hours', instructor: 'Kavita Reddy' },
  { cat: 4, title: 'Microsoft Azure Administrator (AZ-104) Complete Course', level: 'Intermediate', duration: '32 Hours', instructor: 'Marcus Aurel' },
  { cat: 4, title: 'Linux System Administration & Bash Shell Scripting', level: 'Beginner', duration: '20 Hours', instructor: 'David Vance' },
  { cat: 4, title: 'Cloud Security, IAM, KMS & Zero-Trust Architecture', level: 'Advanced', duration: '22 Hours', instructor: 'Natalia Romanova' },
  { cat: 4, title: 'Observability & Monitoring with Prometheus, Grafana & ELK', level: 'Intermediate', duration: '18 Hours', instructor: 'Erik Lindqvist' },
  { cat: 4, title: 'Serverless Computing with AWS Lambda & API Gateway', level: 'Intermediate', duration: '16 Hours', instructor: 'Lucas Silva' },
  { cat: 4, title: 'Site Reliability Engineering (SRE) Principles & SLOs', level: 'Advanced', duration: '20 Hours', instructor: 'David Vance' },

  // Databases & System Architecture (Category 5)
  { cat: 5, title: 'Relational Database Design & SQL Optimization Mastery', level: 'Intermediate', duration: '20 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 5, title: 'PostgreSQL Advanced Indexing, Partitioning & Internals', level: 'Advanced', duration: '26 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 5, title: 'MongoDB & NoSQL Document Database Architecture', level: 'Intermediate', duration: '18 Hours', instructor: 'Priya Sharma' },
  { cat: 5, title: 'Redis In-Memory Caching, Pub/Sub & Rate Limiting', level: 'Intermediate', duration: '14 Hours', instructor: 'Vikram Malhotra' },
  { cat: 5, title: 'Distributed Systems & High-Scale System Design', level: 'Advanced', duration: '36 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 5, title: 'Apache Kafka Event Streaming & Microservice Messaging', level: 'Advanced', duration: '24 Hours', instructor: 'Alexei Ivanov' },
  { cat: 5, title: 'Elasticsearch, Logstash & Kibana (ELK Stack) Analytics', level: 'Intermediate', duration: '20 Hours', instructor: 'Priya Sharma' },
  { cat: 5, title: 'MySQL 8 Query Tuning, EXPLAIN & Performance Optimization', level: 'Intermediate', duration: '18 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 5, title: 'Neo4j Graph Database Modeling & Cypher Querying', level: 'Beginner', duration: '15 Hours', instructor: 'Oliver Hansen' },
  { cat: 5, title: 'Data Warehousing with Snowflake & Google BigQuery', level: 'Intermediate', duration: '22 Hours', instructor: 'Priya Sharma' },
  { cat: 5, title: 'Cassandra & ScyllaDB for High-Throughput Time Series', level: 'Advanced', duration: '20 Hours', instructor: 'Alexei Ivanov' },
  { cat: 5, title: 'Database Migration, Sharding & Replication Strategies', level: 'Advanced', duration: '22 Hours', instructor: 'Dr. Michael Chen' },

  // Mobile App Development (Category 6)
  { cat: 6, title: 'Flutter & Dart: Cross-Platform iOS & Android Apps', level: 'Intermediate', duration: '32 Hours', instructor: 'Marcus Aurel' },
  { cat: 6, title: 'React Native & Expo: Build Native Mobile Apps with JS', level: 'Intermediate', duration: '28 Hours', instructor: 'Elena Rostova' },
  { cat: 6, title: 'iOS 17 App Development with Swift & SwiftUI', level: 'Beginner', duration: '30 Hours', instructor: 'Chloe Bennett' },
  { cat: 6, title: 'Android App Development with Kotlin & Jetpack Compose', level: 'Intermediate', duration: '32 Hours', instructor: 'Vikram Malhotra' },
  { cat: 6, title: 'Mobile UI/UX Design with Figma to Flutter Implementation', level: 'Beginner', duration: '16 Hours', instructor: 'Chloe Bennett' },
  { cat: 6, title: 'State Management in Flutter: Bloc, Riverpod & Provider', level: 'Advanced', duration: '18 Hours', instructor: 'Marcus Aurel' },
  { cat: 6, title: 'Mobile Game Development with Unity & C#', level: 'Intermediate', duration: '34 Hours', instructor: 'Alexei Ivanov' },
  { cat: 6, title: 'Publishing Mobile Apps to Google Play & Apple App Store', level: 'Beginner', duration: '10 Hours', instructor: 'Chloe Bennett' },
  { cat: 6, title: 'Augmented Reality (AR) on iOS with ARKit & RealityKit', level: 'Advanced', duration: '22 Hours', instructor: 'Dr. Arthur Pendelton' },
  { cat: 6, title: 'Mobile App Security: Reverse Engineering & Obfuscation', level: 'Advanced', duration: '18 Hours', instructor: 'Natalia Romanova' },
  { cat: 6, title: 'Progressive Web Apps on Mobile with Web Push API', level: 'Beginner', duration: '12 Hours', instructor: 'Jean-Luc Dubois' },
  { cat: 6, title: 'GraphQL Integration for React Native Apps', level: 'Intermediate', duration: '15 Hours', instructor: 'Kavita Reddy' },

  // Cybersecurity & Ethical Hacking (Category 7)
  { cat: 7, title: 'Ethical Hacking & Penetration Testing Complete Bootcamp', level: 'Intermediate', duration: '38 Hours', instructor: 'Natalia Romanova' },
  { cat: 7, title: 'Web Application Security & OWASP Top 10 Exploits', level: 'Intermediate', duration: '24 Hours', instructor: 'Natalia Romanova' },
  { cat: 7, title: 'Network Security, Wireshark & Packet Analysis', level: 'Beginner', duration: '20 Hours', instructor: 'Dr. Arthur Pendelton' },
  { cat: 7, title: 'Applied Cryptography & Public Key Infrastructure (PKI)', level: 'Advanced', duration: '22 Hours', instructor: 'Dr. Arthur Pendelton' },
  { cat: 7, title: 'SOC Analyst Fundamentals: Incident Response & SIEM', level: 'Beginner', duration: '26 Hours', instructor: 'Natalia Romanova' },
  { cat: 7, title: 'Malware Analysis & Reverse Engineering with Ghidra', level: 'Advanced', duration: '30 Hours', instructor: 'Alexei Ivanov' },
  { cat: 7, title: 'Bug Bounty Hunting: Real-World Vulnerability Discovery', level: 'Intermediate', duration: '22 Hours', instructor: 'Natalia Romanova' },
  { cat: 7, title: 'CompTIA Security+ (SY0-701) Exam Preparation', level: 'Beginner', duration: '30 Hours', instructor: 'David Vance' },
  { cat: 7, title: 'DevSecOps: Integrating Security in CI/CD Pipelines', level: 'Intermediate', duration: '18 Hours', instructor: 'Erik Lindqvist' },
  { cat: 7, title: 'Wireless Network Penetration Testing (WPA2/WPA3)', level: 'Intermediate', duration: '16 Hours', instructor: 'Natalia Romanova' },
  { cat: 7, title: 'Digital Forensics & Evidence Collection Masterclass', level: 'Advanced', duration: '24 Hours', instructor: 'Dr. Arthur Pendelton' },
  { cat: 7, title: 'API Security: Breaking & Securing REST and GraphQL APIs', level: 'Intermediate', duration: '18 Hours', instructor: 'Kavita Reddy' },

  // Software Testing & Automation (Category 8)
  { cat: 8, title: 'Automated Testing with Selenium WebDriver & Java', level: 'Beginner', duration: '24 Hours', instructor: 'Tariq Al-Mansoor' },
  { cat: 8, title: 'Playwright & Cypress: Modern End-to-End Testing', level: 'Intermediate', duration: '20 Hours', instructor: 'Jean-Luc Dubois' },
  { cat: 8, title: 'Unit Testing & Test-Driven Development (TDD) in Python', level: 'Beginner', duration: '16 Hours', instructor: 'Sarah Jenkins' },
  { cat: 8, title: 'API Testing with Postman, Newman & RestAssured', level: 'Beginner', duration: '15 Hours', instructor: 'Tariq Al-Mansoor' },
  { cat: 8, title: 'Performance & Load Testing with Apache JMeter & k6', level: 'Intermediate', duration: '18 Hours', instructor: 'Priya Sharma' },
  { cat: 8, title: 'Mobile App Automation with Appium and WebDriverIO', level: 'Intermediate', duration: '22 Hours', instructor: 'Tariq Al-Mansoor' },
  { cat: 8, title: 'Contract Testing with Pact for Microservices', level: 'Advanced', duration: '14 Hours', instructor: 'Dr. Michael Chen' },
  { cat: 8, title: 'Chaos Engineering: Fault Injection with Chaos Mesh', level: 'Advanced', duration: '16 Hours', instructor: 'Erik Lindqvist' },
  { cat: 8, title: 'Continuous Quality Assurance in Agile & DevOps', level: 'Beginner', duration: '12 Hours', instructor: 'Tariq Al-Mansoor' },
  { cat: 8, title: 'Security Testing with OWASP ZAP in CI Pipelines', level: 'Intermediate', duration: '14 Hours', instructor: 'Natalia Romanova' },
  { cat: 8, title: 'Code Quality Analysis with SonarQube & Linters', level: 'Beginner', duration: '10 Hours', instructor: 'Jean-Luc Dubois' },
  { cat: 8, title: 'TDD in React & TypeScript with Jest and Vitest', level: 'Intermediate', duration: '18 Hours', instructor: 'Elena Rostova' }
];

const thumbnails = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
];

function seed100Courses() {
  console.log('🚀 Populating 100+ Realistic Courses across 8 Engineering Categories...');

  // Ensure all 8 Categories Exist
  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, icon, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  rawCategories.forEach((cat, index) => {
    insertCat.run(index + 1, cat.name, cat.slug, cat.icon, cat.color);
  });

  const insertCourse = db.prepare(`
    INSERT OR IGNORE INTO courses (title, slug, description, instructor, category_id, level, duration, thumbnail, price, rating, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title, description, duration, video_url, content_markdown, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;

  courseTemplates.forEach((tpl, i) => {
    const slug = tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const desc = `Master ${tpl.title} with practical coding exercises, architectural patterns, and real-world project assignments. Taught by ${tpl.instructor}.`;
    const thumb = thumbnails[i % thumbnails.length];
    const rating = Number((4.6 + ((i * 3) % 4) * 0.1).toFixed(1));
    const price = ((i % 5) + 1) * 299;

    const res = insertCourse.run(
      tpl.title,
      slug,
      desc,
      tpl.instructor,
      tpl.cat,
      tpl.level,
      tpl.duration,
      thumb,
      price,
      rating
    );

    const courseId = res.lastInsertRowid;
    if (courseId) {
      count++;
      // Create 4 realistic lessons per course
      insertLesson.run(
        courseId,
        `1. Foundations & Core Concepts of ${tpl.title.split(' ')[0]}`,
        `Introduction to core architecture, environment setup, and theoretical fundamentals.`,
        '45 mins',
        'https://www.youtube.com/embed/eIrMbAQSU34',
        `# Module 1: Foundations\n\n- Overview of core architecture.\n- Installation & setup.\n- Writing your first hello-world module.`,
        1
      );

      insertLesson.run(
        courseId,
        `2. Hands-on Implementation & Design Patterns`,
        `Building core functional modules with standard industry design patterns.`,
        '65 mins',
        'https://www.youtube.com/embed/eIrMbAQSU34',
        `# Module 2: Implementation\n\n- Key design patterns applied.\n- Data structures & state handling.\n- Best practices for clean code.`,
        2
      );

      insertLesson.run(
        courseId,
        `3. Testing, Performance Tuning & Error Handling`,
        `Stress testing, profiling, benchmarking, and structured exception handling.`,
        '55 mins',
        'https://www.youtube.com/embed/eIrMbAQSU34',
        `# Module 3: Performance & Testing\n\n- Unit & integration testing.\n- Bottleneck detection and caching.\n- Resilient error handling.`,
        3
      );

      insertLesson.run(
        courseId,
        `4. Capstone Project Deployment & Production Readiness`,
        `Packaging, CI/CD deployment, monitoring, and certification preparation.`,
        '80 mins',
        'https://www.youtube.com/embed/eIrMbAQSU34',
        `# Module 4: Deployment & Capstone\n\n- Docker containerization.\n- Cloud deployment pipeline.\n- Final project submission checklist.`,
        4
      );
    }
  });

  const totalCourses = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count;
  console.log(`✅ Success! Database now contains ${totalCourses} full courses across 8 categories with 400+ syllabus modules.`);
}

seed100Courses();
