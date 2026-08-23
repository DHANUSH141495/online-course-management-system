# 🎓 COURSIFY — Full-Stack Online Course Management & AI-Proctored E-Learning System
**Author:** Dhanush  
**Academic Year:** 2026  
**Tech Stack:** React 18, Vite, Node.js, Express, Better-SQLite3, JWT Authentication, Vanilla CSS Custom Properties  

---

## 1. Executive Summary & Problem Statement

In contemporary online learning, platforms suffer from two major deficiencies:
1. **Low Active Engagement & Content Skipping**: Students often skip straight to the end of video modules without completing prerequisites.
2. **Lack of Integrity in Online Certifications**: Online multiple-choice tests are frequently compromised by unmonitored tab switching, search engine lookups, and copy-pasting.

**Coursify** solves both problems through a human-crafted full-stack architecture featuring:
- **107 Seeded Industry Courses** across 8 core technological domains.
- **Sequential Learning Locks (Anti-Skipping)** requiring students to complete modules in order.
- **In-Lesson Study Scratchpad & Concept Quizzes** allowing students to save notes per lesson directly to the database.
- **AI-Proctored Examination Suite** with live webcam feeds, 3-strike tab-switch/blur monitoring, and copy/paste interception.
- **5 Dynamic Theme Palettes** with instant GPU-accelerated CSS token transitions and local storage persistence.
- **Verifiable Certificate Generation** with unique verification IDs and PDF canvas printing.

---

## 2. System Architecture & Workflows

### 2.1 Overall System Architecture

```text
+-------------------------------------------------------------------------------+
|                                CLIENT TIER                                    |
|  React 18 (Vite SPA) | 5 Dynamic CSS Theme Engines | AudioContext Alerts      |
|  - Catalog & Search  | - Classroom Player          | - AI Exam Proctor Room   |
+---------------------------------------+---------------------------------------+
                                        | (HTTPS / RESTful JSON / Bearer JWT)
                                        v
+-------------------------------------------------------------------------------+
|                                SERVER TIER                                    |
|  Node.js + Express.js REST API Server                                         |
|  - Auth Middleware (JWT + Bcrypt)     | - RBAC (Admin / Student Protection)   |
|  - Course Controller (107 Courses)    | - Exam Controller (Proctor Logic)     |
|  - Enrollment & Notes Controller      | - Static Single-Port Asset Server     |
+---------------------------------------+---------------------------------------+
                                        | (Better-SQLite3 Prepared Statements)
                                        v
+-------------------------------------------------------------------------------+
|                                DATABASE TIER                                  |
|  SQLite3 Relational Database (3NF Normalized)                                 |
|  [users] [courses] [lessons] [enrollments] [lesson_progress]                  |
|  [lesson_notes] [bookmarks] [exam_questions] [exam_submissions]              |
+-------------------------------------------------------------------------------+
```

---

### 2.2 AI-Proctored Examination Workflow

```text
[ Student Completes 100% of Course Modules ]
                     |
                     v
[ Enter AI-Proctored Exam Room ]
                     |
                     v
[ Request Webcam & Microphone Permissions (getUserMedia) ]
                     |
                     v
[ Active Exam Mode: Anti-Copy/Paste & Window Blur Listeners Active ]
                     |
                     +---------------------------------------+
                     |                                       |
           (Tab Switch / Blur Detected)             (Valid MCQ Answers)
                     |                                       |
                     v                                       v
         [ Strike Warning (1 to 3) ]               [ Submit Exam Payload ]
         [ Procedural Alert Beep ]                           |
                     |                                       v
             +-------+-------+                      [ Backend Evaluation ]
             |               |                               |
    (Strikes < 3)     (Strikes == 3)                (Score >= 60% ?)
             |               |                               |
             v               v                               +-------+
       [ Continue ]    [ AUTO-TERMINATE & ]                  |       |
                       [ DISQUALIFY EXAM  ]               (Yes)     (No)
                                                             |       |
                                                             v       v
                                                       [ Issue Cert ][ Fail ]
```

---

## 3. Tools, Technologies & Dependencies

| Category | Technology | Version | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 18.3.1 | Component architecture with hooks (`useState`, `useEffect`, `useContext`). |
| **Build Tool** | Vite | 5.3.4 | Fast development server and optimized production distribution bundling. |
| **Icons** | Lucide React | 0.400.0 | Icon library across navigation, cards, and classroom tools. |
| **Animations** | Canvas Confetti | 1.9.3 | Confetti particle celebration on 100% course completion. |
| **Backend** | Node.js / Express | 4.19.2 | RESTful API routing, middleware pipeline, and static SPA serving. |
| **Database** | Better-SQLite3 | 11.8.1 | High-throughput C++ embedded relational database driver. |
| **Security** | JSONWebToken & Bcrypt | 9.0.2 / 2.4.3 | Stateless authorization tokens and salted password hashing. |
| **Deployment** | Git / Render / Vercel | Latest | Version control and cloud container web service hosting. |

---

## 4. Step-by-Step Implementation Journey

### Phase 1: Monorepo Architecture & Setup
- Initialized a full-stack monorepo uniting `client/` and `server/` with root development (`npm run dev`) and deployment scripts.

### Phase 2: Relational Database Schema (3NF)
- Designed 9 normalized relational tables in SQLite (`users`, `courses`, `lessons`, `enrollments`, `lesson_progress`, `lesson_notes`, `bookmarks`, `exam_questions`, `exam_submissions`) with foreign keys and cascade deletions.
- Seeded **107 full courses** across 8 categories and **535 exam questions**.

### Phase 3: Express REST API & Role-Based Access Control
- Developed 17 endpoints with JWT bearer authentication and role verification (`admin` vs `student`).

### Phase 4: Video Classroom, Study Scratchpad & Sequential Progression
- Built the interactive classroom with sequential lock logic preventing module skipping.
- Added auto-saving lesson notes and instant knowledge check quizzes.

### Phase 5: AI-Proctored Anti-Cheating Examination Suite
- Built `ExamProctorRoom.jsx` utilizing `visibilitychange`, `window.onblur`, procedural audio beeps, 3-strike malpractice termination, copy/paste blockers, and automated certificate issuance.

### Phase 6: Dynamic 5-Theme Engine
- Implemented **Midnight Cyber**, **Matrix Emerald**, **Cosmic Amethyst**, **Oceanic Sapphire**, and **Sunset Ember** using GPU-accelerated CSS custom properties and `localStorage` caching.

---

## 5. Key Code Implementations

### 5.1 AI-Proctoring Anti-Cheating & Tab-Switch Interceptor
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

### 5.2 Sequential Learning Lock
```javascript
// client/src/pages/LearningRoom.jsx
const isLessonUnlocked = (index) => {
  if (index === 0) return true; // First lesson is always unlocked
  const prevLesson = lessons[index - 1];
  return prevLesson ? completedLessonIds.has(prevLesson.id) : false;
};
```

---

## 6. Complete Terminal Commands & Execution Guide

| Command | Description |
| :--- | :--- |
| `npm run install:all` | Installs dependencies across root, server, and client. |
| `npm run dev` | Runs backend (5000) and frontend (3000) concurrently. |
| `node server/test_all_endpoints.js` | Executes full 17-endpoint automated test audit. |
| `npm run seed` | Re-seeds SQLite database with 107 courses and 535 questions. |
| `npm run build` | Builds React Vite frontend into production distribution. |
| `npm start` | Runs Express server bound to `0.0.0.0` in production mode. |

---

## 7. Verification & Audit Results

Ran automated test suite (`node server/test_all_endpoints.js`):
- **17/17 API Endpoints Verified Passing** (`200 OK` / `201 Created`).
- Zero console warnings or build failures.

---

*Compiled by **Dhanush** &bull; Coursify Online Course Management System &bull; 2026*
