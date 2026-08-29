# Coursify — Online Course Management System
**Project Report & System Documentation**  
**Author:** Dhanush  
**Academic Term:** Final Year Major Project (Web Engineering)  
**Stack:** React 18 (Vite), Node.js, Express, SQLite3 (Better-SQLite3), JSON Web Tokens (JWT), Vanilla CSS Variables  

---

## 1. Introduction & Problem Statement

Most standard online learning websites let students click through video lessons without checking if they actually learned the material. Anyone can skip directly to the end of a video playlist, open another browser tab to Google the answers during a quiz, or copy-paste answers directly into the test fields.

When I started building **Coursify**, my main goal was to address these real-world issues by building a practical e-learning platform with three core ideas:
1. **Enforced Progression:** Students cannot skip ahead. Lesson 2 only unlocks after completing Lesson 1.
2. **Cheating Prevention (Proctoring):** The final certification test monitors webcam access, blocks tab-switching, prevents copy-pasting, and triggers audio warnings on suspicious activity.
3. **Accountability & Security:** Every login event (successful or failed) is stored in the database with the student's IP address, browser information, and timestamp, giving both students and admins full visibility over account access.

---

## 2. System Design & Architecture

The application is structured into three clean layers:

```
[ Frontend (Client Tier) ]
React 18 SPA (Vite) + Lucide Icons + Web Audio API
Features: Course Catalog, Video Classroom, Notes Pad, Proctoring Booth, Admin Panel
              |
              |  REST API Calls (JSON / Bearer JWT)
              v
[ Backend (Server Tier) ]
Node.js + Express.js API Server
Features: Auth & RBAC Middleware, Course Management, Progress Tracker, Exam Grader
              |
              |  Prepared SQL Statements
              v
[ Database (Persistence Tier) ]
SQLite3 (Better-SQLite3 engine in WAL mode)
Tables: users, login_logs, courses, lessons, enrollments, lesson_progress, lesson_notes, bookmarks, exam_questions, exam_submissions
```

### Why SQLite with Better-SQLite3?
For this project, I chose **Better-SQLite3** over MongoDB or an external PostgreSQL instance because:
- It runs in-process with zero network overhead, executing queries synchronously with high throughput.
- Foreign keys with `ON DELETE CASCADE` guarantee referential integrity across students, enrollments, and progress logs without orphan records.
- WAL (Write-Ahead Logging) mode allows fast concurrent reads without locking issues.

---

## 3. Database Schema & Structure

The database schema is organized into 10 relational tables:

| Table Name | Primary Key | Foreign Keys | What It Stores |
| :--- | :--- | :--- | :--- |
| `users` | `id` | None | User profile, role (`student` or `admin`), and bcrypt-hashed password. |
| `login_logs` | `id` | `user_id -> users(id)` | Sign-in audit log: email, username, role, IP address, user agent, status, and timestamp. |
| `courses` | `id` | `instructor_id -> users(id)` | Course details: title, slug, level, instructor, duration, and thumbnail. |
| `lessons` | `id` | `course_id -> courses(id)` | Video lessons belonging to each course with order indexes and markdown text. |
| `enrollments` | `id` | `user_id`, `course_id` | Student course registrations and overall progress percentages. |
| `lesson_progress` | `id` | `user_id`, `lesson_id` | Checkmarks for each individual lesson completed by the student. |
| `lesson_notes` | `id` | `user_id`, `lesson_id` | Personal markdown study notes saved per lesson. |
| `bookmarks` | `id` | `user_id`, `course_id` | Courses saved by students to their wishlist. |
| `exam_questions` | `id` | `course_id -> courses(id)` | Final exam questions (options A-D, correct answer key, explanation). |
| `exam_submissions` | `id` | `user_id`, `course_id` | Exam score records, proctoring warning counts, and generated certificate codes. |

---

## 4. Key Features Implemented

### 4.1 Authentication & Login Audit Logging
- Passwords are encrypted using `bcryptjs` with 10 salt rounds before hitting the database.
- On login, the server issues a signed JWT token containing the user's ID, role, and email with a 7-day expiration.
- Every login attempt (both success and failure) is recorded into `login_logs`. Admins can inspect the full audit trail in the Admin Dashboard, and students can view their personal session history under their Student Dashboard.

### 4.2 Sequential Video Classroom & Study Notes
- In `LearningRoom.jsx`, a lesson is only clickable if the preceding lesson has been completed.
- Each lesson includes a private scratchpad where students can take notes. Notes automatically persist to the backend via `POST /api/enrollments/lessons/:id/notes`.

### 4.3 AI-Proctored Exam Room
- When students finish 100% of a course, they unlock the final exam.
- The exam requests camera permissions via `navigator.mediaDevices.getUserMedia`.
- During the test, event listeners catch any attempt to switch tabs (`visibilitychange`), defocus the window (`blur`), or copy text (`copy`, `paste`, `contextmenu`).
- The browser synthesizes dual-tone warning beeps using the `Web Audio API` oscillator. If a student receives 3 warnings, the exam auto-terminates.
- Students scoring $\ge 60\%$ with an intact record receive a verifiable certificate (e.g., `CERT-DHANUSH-11-7895`).

### 4.4 Human Eye-Comfort Theme Engine
- Default theme is **Monochrome Dark (Eye Comfort)**, built with `#09090b` pitch backgrounds, charcoal `#18181b` card surfaces, and high-contrast text to reduce blue light and eye fatigue.
- Supports 5 distinct palettes: Monochrome Dark, Paper White, OLED Black, Warm Sepia, and Slate Graphite.
- Selected theme persists in `localStorage` and applies instantly via CSS custom properties on `document.documentElement`.

---

## 5. API Testing & Endpoint Verification

All 23 REST endpoints were verified using an automated Node.js test script (`node server/test_all_endpoints.js`):

| # | Method | Path | Auth | Purpose & Result |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/api/health` | Public | Server health status check (`200 OK`) |
| 2 | `POST` | `/api/auth/register` | Public | Student account registration (`201 Created`) |
| 3 | `POST` | `/api/auth/login` | Public | Student login + JWT generation (`200 OK`) |
| 4 | `POST` | `/api/auth/login` | Public | Admin login + JWT generation (`200 OK`) |
| 5 | `GET` | `/api/auth/me` | Bearer | Current user profile verification (`200 OK`) |
| 6 | `GET` | `/api/auth/login-history` | Bearer | Personal sign-in history (`200 OK`) |
| 7 | `GET` | `/api/admin/login-logs` | Admin | Full platform access audit logs (`200 OK`) |
| 8 | `GET` | `/api/courses/categories` | Public | Category list with counts (`200 OK`) |
| 9 | `GET` | `/api/courses` | Public | Course search, filters, pagination (`200 OK`) |
| 10 | `GET` | `/api/courses/:id` | Public | Course details and syllabus (`200 OK`) |
| 11 | `POST` | `/api/courses/:id/bookmark` | Bearer | Add/remove course from wishlist (`200 OK`) |
| 12 | `GET` | `/api/courses/my/bookmarks` | Bearer | Fetch student wishlist (`200 OK`) |
| 13 | `POST` | `/api/courses/:id/discussions`| Bearer | Post question in forum (`201 Created`) |
| 14 | `POST` | `/api/courses/discussions/:id/upvote` | Bearer | Upvote helpful question (`200 OK`) |
| 15 | `POST` | `/api/enrollments` | Bearer | Enroll in course (`200/201 OK`) |
| 16 | `GET` | `/api/enrollments/my` | Bearer | List student enrolled courses (`200 OK`) |
| 17 | `GET` | `/api/enrollments/courses/:id/learn` | Bearer | Classroom syllabus & progress (`200 OK`) |
| 18 | `POST` | `/api/enrollments/courses/:id/lessons/:id/complete` | Bearer | Mark lesson complete (`200 OK`) |
| 19 | `POST` | `/api/enrollments/lessons/:id/notes` | Bearer | Save lesson study notes (`200 OK`) |
| 20 | `GET` | `/api/enrollments/courses/:id/exam` | Bearer | Fetch exam questions (`200 OK`) |
| 21 | `POST` | `/api/enrollments/courses/:id/exam/submit` | Bearer | Submit answers & grade test (`200 OK`) |
| 22 | `GET` | `/api/enrollments/verify-certificate/:code` | Public | Verify certificate authenticity (`200 OK`) |
| 23 | `GET` | `/api/admin/stats` | Admin | Overall student and enrollment metrics (`200 OK`) |

---

## 6. How to Run the Project Locally

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start the application:**
   ```bash
   npm start
   ```
3. Open your browser and navigate to:
   - **App:** `http://localhost:5000`
   - **Report:** `http://localhost:5000/report`
   - **API Explorer:** `http://localhost:5000` &rarr; Click *API Docs* tab

---

*Submitted by **Dhanush** &bull; Final Year Major Project &bull; 2026*
