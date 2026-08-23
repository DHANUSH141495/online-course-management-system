# 🎓 COURSIFY — Complete Technical Engineering Dissertation & Project Report

**Author & Developer:** Dhanush  
**Academic Year:** 2026  
**Project Title:** Online Course Management & AI-Proctored E-Learning Platform  
**Primary Tech Stack:** React 18, Vite, Node.js, Express.js, Better-SQLite3, JWT Authentication, Vanilla CSS Custom Properties  

---

## 1. Executive Summary & Problem Landscape

### 1.1 Background & Motivation
In contemporary digital education, traditional Learning Management Systems (LMS) suffer from two fundamental weaknesses:
1. **Passive Content Skimming & Skipping**: Students often skip straight to the end of course modules without mastering foundational prerequisites.
2. **Lack of Integrity in Online Certifications**: Multiple-choice tests are frequently compromised by unmonitored tab switching, search engine lookups, and copy-pasting.

### 1.2 The Coursify Solution
**Coursify** is an enterprise-grade full-stack online learning management system engineered to eliminate these vulnerabilities. It introduces:
- **107 Seeded Industry Courses** across 8 domains with over 400 interactive lessons.
- **Sequential Progression Lock (Anti-Skipping)** ensuring prerequisite module mastery.
- **AI-Proctored Examination Suite** with active webcam/mic streaming, 3-strike tab-switch/window blur detection with procedural audio alarms, and 100% clipboard interceptors.
- **In-Lesson Study Scratchpad & Concept Quizzes** auto-saving personal code notes directly saved per lesson into SQLite, accompanied by instant multiple-choice concept checks.
- **5 Custom Dynamic Theme Palettes** (Midnight Cyber, Matrix Emerald, Cosmic Amethyst, Oceanic Sapphire, Sunset Ember) with instant 60fps GPU token transitions and local storage persistence.
- **Verifiable Certificate Issuance** featuring unique validation IDs (e.g. `CERT-DHANUSH-11-8398`) and PDF canvas printing.

---

## 2. System Architecture & Technical Flowcharts

### 2.1 High-Level 3-Tier Layered Architecture

```text
+===================================================================================+
|                                    CLIENT TIER                                    |
|  React 18 SPA (Vite) | 5 Dynamic CSS Theme Engines | Web Audio API Alerts         |
|  - Course Catalog & Search       - Interactive Video Classroom (Sequential Locks) |
|  - Student & Admin Dashboards    - AI-Proctored Examination Booth                 |
+=========================================+=========================================+
                                          |
                                          | (HTTPS / REST JSON API / Bearer JWT)
                                          v
+===================================================================================+
|                                    SERVER TIER                                    |
|  Node.js (v20+) & Express.js REST API Server                                      |
|  - Authentication Middleware (JWT + Salted Bcrypt Hashing)                        |
|  - Role-Based Access Control (RBAC: 'student' vs 'admin')                         |
|  - Course Controller (107 Courses, Category Filters, Bookmarks)                   |
|  - Enrollment & Progress Engine (Sequential Locks, SQLite Notes)                  |
|  - Exam Proctoring Controller (535 Questions, 3-Strike Malpractice Evaluation)   |
|  - Static Single-Port Production Web Server                                       |
+=========================================+=========================================+
                                          |
                                          | (Better-SQLite3 Prepared Statements)
                                          v
+===================================================================================+
|                                  DATABASE TIER                                    |
|  SQLite3 Relational Database (3NF Normalized with Foreign Key Cascade Deletions) |
|  [users] [courses] [lessons] [enrollments] [lesson_progress]                      |
|  [lesson_notes] [bookmarks] [exam_questions] [exam_submissions]                  |
+===================================================================================+
```

---

### 2.2 AI-Proctored Examination & Malpractice State Machine

```text
           [ Student Attains 100% Course Module Progress ]
                                  |
                                  v
                  [ Open AI-Proctor Exam Room ]
                                  |
                                  v
         [ Request Camera & Microphone (getUserMedia API) ]
                                  |
                                  v
       [ Mount Live Video Feed + Activate Browser Event Listeners: ]
       [ - document.addEventListener('visibilitychange')           ]
       [ - window.addEventListener('blur')                         ]
       [ - document.addEventListener('copy', 'paste', 'cut')       ]
       [ - document.addEventListener('contextmenu')                ]
                                  |
            +---------------------+---------------------+
            |                                           |
  (Tab Switch / Blur Event)                    (Valid MCQ Selections)
            |                                           |
            v                                           v
   [ Beep Alarm Tone ]                        [ Submit Answer Payload ]
   [ Increment Strike ]                                 |
            |                                           v
     +------+------+                          [ Backend Controller ]
     |             |                          [ - Verify 100% Learn]
(Strikes < 3) (Strikes == 3)                  [ - Calculate Score %]
     |             |                                    |
     v             v                              +-----+-----+
[ Warning Modal] [ AUTO-TERMINATE & ]             |           |
[ Return Exam  ] [ DISQUALIFY EXAM  ]       (Score >= 60%) (Score < 60%)
                                                  |           |
                                                  v           v
                                            [ Issue Cert ] [ Fail Attempt ]
```

---

## 3. Relational Database Design & Normalization (3NF)

The database utilizes 9 relational tables structured in **Third Normal Form (3NF)** with Foreign Key constraints and `ON DELETE CASCADE` actions:

| Table Name | Primary Key | Foreign Keys | Purpose & Stored Fields |
| :--- | :--- | :--- | :--- |
| `users` | `id` | None | User credentials (email, bcrypt password hash), name, role (`student` / `admin`), timestamps. |
| `courses` | `id` | `instructor_id -> users(id)` | Course metadata: title, description, category, level, duration, thumbnail URL, price, rating. |
| `lessons` | `id` | `course_id -> courses(id)` | Course video modules: title, video_url, markdown content, duration, order_index. |
| `enrollments` | `id` | `user_id -> users(id)`<br>`course_id -> courses(id)` | Student registration records, completion status boolean, enrolled timestamp. |
| `lesson_progress` | `id` | `user_id -> users(id)`<br>`lesson_id -> lessons(id)` | Individual module completion checklist status with completed timestamps. |
| `lesson_notes` | `id` | `user_id -> users(id)`<br>`lesson_id -> lessons(id)` | Personal study scratchpad markdown notes auto-saved per student per module. |
| `bookmarks` | `id` | `user_id -> users(id)`<br>`course_id -> courses(id)` | Student wishlist bookmark records with creation timestamps. |
| `exam_questions` | `id` | `course_id -> courses(id)` | 535 seeded certification questions: question text, options A/B/C/D, correct option key, explanation. |
| `exam_submissions`| `id` | `user_id -> users(id)`<br>`course_id -> courses(id)` | Final exam attempt records: score percentage, passed flag, malpractice violations count, certificate code. |

---

## 4. Tools & Dependencies Justification

| Tool / Technology | Category | Role in Project |
| :--- | :--- | :--- |
| **React 18.3** | Frontend Framework | Stateful single-page application with modular component hierarchy. |
| **Vite 5.3** | Build Engine | Fast development hot module replacement (HMR) and optimized tree-shaken production bundles. |
| **Better-SQLite3** | Database Engine | C++ SQLite bindings executing prepared SQL statements directly inside Node memory. |
| **JSONWebToken** | Security / Auth | Signs and verifies cryptographic stateless authentication tokens passed via `Authorization: Bearer`. |
| **Bcrypt.js** | Password Hashing | One-way adaptive cryptographic hashing with 10 salt rounds protecting user passwords. |
| **Web Audio API** | Browser API | Procedural dual-tone warning sound generation on tab-switch violations without external MP3 files. |
| **Page Visibility API** | Browser API | Real-time tracking of browser window focus, tab visibility, and application defocusing. |
| **Lucide React** | Iconography | Lightweight, scalable vector icons across all pages and UI controls. |
| **Canvas Confetti** | UX Animation | GPU-rendered particle fireworks triggered upon 100% course completion. |

---

## 5. Detailed Step-by-Step Implementation Journey

1. **Monorepo Architecture & Setup**: Initialized unified workspace linking `client/` and `server/` with concurrent dev and production build scripts.
2. **Database Schema & 107-Course Seeding**: Designed schema in `server/src/config/db.js` and populated 107 courses + 535 exam questions across 8 tech categories.
3. **Secure Express REST API Layer**: Created 17 endpoints with JWT bearer authentication and role verification (`admin` vs `student`).
4. **Video Classroom & Sequential Progression**: Engineered sequential module lock checks, pre-content setup guides, auto-saving notes scratchpads, and concept quizzes.
5. **AI-Proctored Anti-Cheating Suite**: Built `ExamProctorRoom.jsx` with camera streams, tab-switch blur listeners, audio beeps, 3-strike disqualification, and certificate issuance.
6. **5 Dynamic Theme Palettes**: Implemented GPU-accelerated CSS custom properties on `data-theme` selectors with persistent `localStorage` caching.
7. **Automated Test Audit & Deployment**: Created `server/test_all_endpoints.js` verifying 17/17 endpoints and configured single-port static hosting on Render.

---

## 6. Key Code Implementations

### 6.1 AI-Proctoring Tab-Switch & Blur Detection
```javascript
// client/src/pages/ExamProctorRoom.jsx
useEffect(() => {
  if (!examStarted || examSubmitted) return;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      triggerMalpracticeStrike('Tab switch detected! You navigated away from the exam window.');
    }
  };

  const handleWindowBlur = () => {
    triggerMalpracticeStrike('Window blur detected! Focus moved outside exam window.');
  };

  const handleContextMenu = (e) => e.preventDefault();
  const handleCopyPaste = (e) => {
    e.preventDefault();
    triggerMalpracticeStrike('Clipboard copy/paste attempt blocked!');
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('copy', handleCopyPaste);
  document.addEventListener('paste', handleCopyPaste);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('copy', handleCopyPaste);
    document.removeEventListener('paste', handleCopyPaste);
  };
}, [examStarted, examSubmitted, strikes]);
```

### 6.2 Sequential Module Lock Check
```javascript
// client/src/pages/LearningRoom.jsx
const isLessonUnlocked = (index) => {
  if (index === 0) return true; // First lesson is always unlocked
  const prevLesson = lessons[index - 1];
  return prevLesson ? completedLessonIds.has(prevLesson.id) : false;
};
```

---

## 7. Terminal Commands & API Verification Table

### 7.1 Terminal Commands
| Command | Description |
| :--- | :--- |
| `npm run install:all` | Installs dependencies across root, server, and client. |
| `npm run dev` | Runs Express backend (5000) and React frontend (3000) concurrently. |
| `node server/test_all_endpoints.js` | Executes full 17-endpoint automated test audit. |
| `npm run seed` | Re-seeds SQLite database with 107 courses and 535 questions. |
| `npm run build` | Builds React Vite client into production distribution bundle. |
| `npm start` | Launches Express server bound to `0.0.0.0` in production mode. |

### 7.2 17-Endpoint Verification Audit
All 17 endpoints verified passing (`200 OK` / `201 Created`):
1. `GET  /api/health`
2. `POST /api/auth/register`
3. `POST /api/auth/login`
4. `GET  /api/auth/me`
5. `GET  /api/courses/categories`
6. `GET  /api/courses`
7. `GET  /api/courses/:id`
8. `POST /api/courses/:id/bookmark`
9. `GET  /api/courses/my/bookmarks`
10. `POST /api/enrollments`
11. `GET  /api/enrollments/my`
12. `GET  /api/enrollments/courses/:id/learn`
13. `POST /api/enrollments/courses/:id/lessons/:id/complete`
14. `POST /api/enrollments/lessons/:id/notes`
15. `GET  /api/enrollments/lessons/:id/notes`
16. `GET  /api/enrollments/courses/:id/exam`
17. `POST /api/enrollments/courses/:id/exam/submit`

---

*Compiled by **Dhanush** &bull; Coursify Online Course Management System &bull; 2026*
