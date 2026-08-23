# 🎓 Coursify — Final Project Viva, Presentation & Defense Guide
**Candidate Name:** Dhanush  
**Project Title:** Online Course Management & AI-Proctored E-Learning System  
**Tech Stack:** React 18, Vite, Node.js, Express, SQLite3 / PostgreSQL DDL, Vanilla CSS Tokens  

---

## 🌟 1. 2-Minute Elevator Pitch (How to Introduce Your Project)

> *"Respected Evaluators, I have developed **Coursify**, a full-stack Online Course Management and AI-Proctored E-Learning Platform. 
> Unlike typical LMS platforms that simply display video links, Coursify solves two critical industry problems: **learning retention** and **academic integrity in online certifications**.
>
> It features **107 industry-standard courses**, a **sequential learning enforcement engine** that prevents skipping, an **in-lesson study scratchpad**, **concept-check quizzes**, and an **AI-proctored examination room** equipped with real-time camera feeds, window blur/tab-switch tracking with a 3-strike malpractice termination policy, and automated verifiable certificate generation.
> The backend is powered by Express and SQLite with strict JWT Role-Based Access Control, and the UI features 5 customizable theme palettes built with zero bulky UI component libraries."*

---

## 🎯 2. Live Evaluator Demo Flow (Step-by-Step)

When demonstrating the project on your screen, follow this sequence:

### Step 1: Course Catalog & Dynamic Theme Switcher (1 min)
1. Open **`http://localhost:3000`**.
2. Point out the **107 courses** across 8 distinct tech domains (Full-Stack, AI/ML, Cloud/DevOps, Cybersecurity, Mobile, etc.).
3. Demonstrate the live search and category pill filtering.
4. Click the **"🎨 Theme"** dropdown in the top navbar and switch between **Midnight Cyber**, **Matrix Emerald**, and **Cosmic Amethyst** to show the 60fps CSS token transitions and `localStorage` persistence.

### Step 2: 1-Click Student Authentication (30 sec)
1. Click the **"⚡ Demo Student"** button in the navbar (instantly logs in as **Dhanush**).
2. Go to **"My Learning"** (`StudentDashboard`) to display the KPI stats (Enrolled, In Progress, Completed, Average Completion Rate).
3. Show the **Course Wishlist** tab with instant heart-bookmarking.

### Step 3: Interactive Video Classroom & Sequential Progression (1.5 min)
1. Open any course (e.g. *Java Programming & Spring Boot Masterclass*).
2. Show the **"Pre-Content & Prerequisites"** orientation tab.
3. Show the **Sequential Learning Lock**: Attempt to click Module 3 before Module 1 & 2 are done — highlight the 🔒 padlock icon and alert toast.
4. Open the **"My Study Scratchpad"** tab: type a code note, click Save Notes, and explain that it is stored in the database relational table `lesson_notes`.
5. Open the **"Knowledge Check (Quiz)"** tab: answer a concept question and show the instant rationale.
6. Check off the lessons to reach **100% progress** — trigger the confetti celebration!

### Step 4: The AI-Proctored Certification Exam (2 min - STAR FEATURE ⭐)
1. Click **"🎓 Take AI-Proctored Exam"**.
2. Point out the **Camera & Audio Permissions Modal** and the live floating webcam feed in the proctor booth.
3. **Trigger Tab-Switch Violation**: Switch to another browser tab or click outside the window.
   - Show the audio beep alert.
   - Show the popup: *"⚠️ MALPRACTICE STRIKE 1 of 3: Tab switch detected!"*
4. **Trigger Copy Block**: Try pressing `Ctrl+C` or right-clicking on the exam questions — demonstrate that clipboard operations and context menus are completely blocked.
5. Answer the 5 exam questions (score ≥ 60%) and submit.
6. Display the **Official Verifiable Certificate** issued to **Dhanush** with the verification code (e.g. `CERT-DHANUSH-11-8398`) and click Print/Download.

### Step 5: Admin Portal & Interactive REST API Docs (1 min)
1. Switch to Admin via **"⚡ Demo Admin"**.
2. Open **"Admin Portal"**: Show the platform KPI stats, Student Enrollment Monitor, and Course Creation Modal with multi-lesson syllabus builder.
3. Open **"REST APIs"** (`/api-docs`): Run a live API call right inside the explorer.

---

## 🗄️ 3. Database Architecture & Normalization (3NF)

Point evaluators to [`server/schema.sql`](file:///c:/Users/141dh/OneDrive%20-%20Sri%20Venkateshwara%20College%20of%20engineering/Documents/project%202%20for%20congervence/server/schema.sql) if they ask about the database schema:

| Table Name | Primary Key | Foreign Keys | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` | None | User credentials (bcrypt hashed), role (`student` / `admin`), timestamps |
| `courses` | `id` | `instructor_id -> users(id)` | Course metadata (title, category, level, duration, thumbnail) |
| `lessons` | `id` | `course_id -> courses(id)` | Individual video modules, markdown syllabus, duration, order index |
| `enrollments` | `id` | `user_id`, `course_id` | Student course enrollments, completion timestamps |
| `lesson_progress` | `id` | `user_id`, `lesson_id` | Boolean flag tracking individual module completions |
| `lesson_notes` | `id` | `user_id`, `lesson_id` | Auto-saved student study scratchpad notes |
| `bookmarks` | `id` | `user_id`, `course_id` | Student wishlist items |
| `exam_questions` | `id` | `course_id -> courses(id)` | MCQs, options A/B/C/D, correct answer key, explanations |
| `exam_submissions`| `id` | `user_id`, `course_id` | Exam score %, pass/fail flag, proctor violations count, cert code |

---

## 🧠 4. Top 15 Viva Questions & Model Answers

### Q1: Why did you choose React + Express + SQLite/PostgreSQL instead of an all-in-one CMS like WordPress or Moodle?
> **Answer:** *"A custom full-stack architecture gives us complete control over high-performance state management, sub-millisecond client rendering, and specialized custom capabilities like our Web Audio & Page Visibility proctoring system and live in-lesson study scratchpads which standard CMS platforms cannot easily support."*

### Q2: How does your authentication system work securely?
> **Answer:** *"We implement stateless JWT (JSON Web Tokens) with passwords hashed via `bcryptjs` using a salt work factor of 10. When a user logs in, the backend signs a token containing `id`, `email`, and `role`. Protected API endpoints pass through an `authenticate` middleware that verifies the cryptographic signature before granting access."*

### Q3: How do you enforce Role-Based Access Control (RBAC)?
> **Answer:** *"We use an `authorize(['admin'])` middleware. If a student attempts to perform administrative actions like `POST /api/courses` or access `GET /api/admin/stats`, the server intercepts the request and responds with `403 Forbidden`."*

### Q4: How is the AI-Proctored Exam anti-cheating mechanism implemented?
> **Answer:** *"It uses a multi-layered browser security approach:
> 1. **Page Visibility API (`visibilitychange`)** & **`window.onblur`** to detect tab switching and application switching.
> 2. **DOM Event Interceptors** to disable `copy`, `paste`, `cut`, `contextmenu` (right click), and devtool shortcuts (`F12`, `Ctrl+U`).
> 3. **Webcam Stream (`navigator.mediaDevices.getUserMedia`)** for active visual presence.
> 4. **Malpractice Violation Counter**: Max 3 warnings before automatic termination and disqualification."*

### Q5: How do you prevent students from skipping to the end of a course to get a certificate?
> **Answer:** *"We implement **Sequential Progression Locking**. In the classroom sidebar, Module $N$ remains disabled and locked until Module $N-1$ is recorded as completed in the `lesson_progress` table. Furthermore, the exam endpoint verifies that total completed lessons equal total course lessons before permitting exam access."*

### Q6: How does the dynamic theme switcher work without causing page re-renders?
> **Answer:** *"We use CSS Custom Properties (Variables) defined under `[data-theme="..."]` selectors in `index.css`. Switching themes simply updates the `data-theme` attribute on `document.documentElement` and stores the key in `localStorage`. This allows instant 60fps GPU-accelerated color transitions with zero component re-renders."*

### Q7: How does your database maintain referential integrity?
> **Answer:** *"Every child table uses foreign key constraints with `ON DELETE CASCADE` (e.g. deleting a course automatically cascades deletions to its lessons, enrollments, notes, and exam questions), preventing orphaned records."*

### Q8: How is the student progress percentage calculated?
> **Answer:** *"When a student completes a lesson, the backend queries the count of completed lessons for that enrollment divided by the total lessons in that course, multiplies by 100, and rounds to the nearest integer. If the count reaches 100%, the enrollment `is_completed` flag is set to `true`."*

### Q9: What happens if the database grows large? How will you optimize performance?
> **Answer:** *"1. Add composite database indexes on `(user_id, course_id)` in `enrollments` and `lesson_progress`.
> 2. Implement SQL query pagination (`LIMIT` / `OFFSET`) for the course catalog.
> 3. Implement Redis caching for frequently read catalog categories and course detail pages."*

### Q10: How did you test and verify your API endpoints?
> **Answer:** *"We wrote an automated test audit script (`server/test_all_endpoints.js`) that performs end-to-end HTTP requests across all 17 system endpoints (authentication, course queries, bookmarks, note saves, exam evaluations, and admin stats), asserting status codes and data payloads."*

---

*Prepared for **Dhanush** — Good luck with your presentation and viva!*
