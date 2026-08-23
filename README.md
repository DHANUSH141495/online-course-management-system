# 🎓 Coursify — Online Course Management & AI-Proctored E-Learning System

A production-grade, human-crafted full-stack **Online Course Management System & Certification Platform** engineered for capstone presentations, technical vivas, and placements.

Developed by **Dhanush** with role-based access control (**Student** & **Admin**), **107 industry courses**, sequential learning enforcement, AI-proctored anti-cheating certification examinations, 5 dynamic UI themes, in-lesson study scratchpad, verifiable certificates, course management CRUD, and an interactive REST API explorer.

---

## ⚡ 1-Minute Quick Start (Local Run)

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**

### 2. Install & Start
```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Run both backend (port 5000) & frontend (port 3000) concurrently
npm run dev
```

Visit the app in your browser: **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Name | Email | Password | Access Capabilities |
|---|---|---|---|---|
| **👨‍🎓 Student** | **Dhanush** | `dhanush@gmail.com` | `Student@123` | Browse 107 courses, bookmark wishlist, take study notes, complete quizzes, take AI-proctored exams, claim verified certificates |
| **👨‍💼 Admin** | **Admin Master** | `admin@coursify.com` | `Admin@123` | View real-time analytics, create/edit/delete courses, monitor enrollments, toggle user roles |

> 💡 **1-Click Demo Login**: Click the **"⚡ Demo Student"** or **"⚡ Demo Admin"** buttons in the navigation bar to login instantly without typing!

---

## 🌟 Standout "Human-Crafted" Features

### 🛡️ 1. AI-Proctored Anti-Cheating Examination Suite
- **Webcam & Audio Live Stream**: Requests browser permissions and mounts a live video feed in the exam room.
- **Tab-Switch & Blur Detection**: Intercepts `visibilitychange` and window blur events with procedural audio alerts.
- **3-Strike Malpractice Policy**: Flashes high-visibility violation warnings; on the 3rd violation, the exam auto-terminates and disqualifies the student.
- **100% Anti-Copy & Hotkey Block**: Prevents clipboard copies, cuts, pastes, right-clicks (`contextmenu`), and shortcut keys (`Ctrl+C`, `Ctrl+V`, `F12`).
- **535 Seeded Exam Questions**: 5 unique certification questions per course across all 107 courses.

### 🔒 2. Sequential Learning Enforcement & Anti-Skipping
- Prevents skipping lessons: Module 2 unlocks only after Module 1 is completed; Module 3 unlocks only after Module 2 is completed.
- Locked lessons display a 🔒 padlock icon.
- Unlocks the **Final AI-Proctored Exam** only upon reaching 100% course completion.

### 🎨 3. Five Custom Dynamic Themes (Navbar Switcher)
1. 🌌 **Midnight Cyber** *(Default)*: Electric Indigo (`#6366f1`) & Cyan (`#06b6d4`).
2. 🌲 **Matrix Emerald**: Deep Emerald (`#10b981`) & Lime Jade (`#34d399`).
3. 🔮 **Cosmic Amethyst**: Vivid Violet (`#a855f7`) & Fuchsia (`#ec4899`).
4. 🌊 **Oceanic Sapphire**: Sapphire Blue (`#0284c7`) & Sky Blue (`#38bdf8`).
5. 🌅 **Sunset Ember**: Coral Crimson (`#f43f5e`) & Warm Amber (`#fb923c`).
- *Stored in `localStorage` for instant session persistence.*

### 📚 4. 107 Comprehensive Seeded Courses
- Spanning 8 categories:
  - Core Programming & Data Structures (14)
  - Full-Stack Web Development (14)
  - Artificial Intelligence, ML & Data Science (14)
  - Cloud Computing & DevOps (13)
  - Databases, SQL & Distributed Systems (13)
  - Mobile App Development (13)
  - Cybersecurity & Ethical Hacking (13)
  - Software Testing, QA & Automation (13)

### ✍️ 5. In-Lesson Study Scratchpad & Concept Quizzes
- **Auto-Saving Study Notes**: Students write custom code notes per module directly stored in SQLite (`lesson_notes`).
- **Knowledge Check Quizzes**: Interactive multiple-choice quizzes with instant answer rationale.

### 📜 6. Verifiable Certificate of Completion
- Automatically issued with **Dhanush** as the student name, instructor signature, completion date, and unique verification ID (e.g. `CERT-DHANUSH-11-8398`). Includes full canvas/PDF print support.

---

## 🏗️ Architecture & Technology Stack

```text
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Navbar (Theme Switcher), Footer, Modals, Cards
│   │   ├── context/            # AuthContext (JWT, User state, Toasts)
│   │   ├── pages/
│   │   │   ├── CatalogPage.jsx          # Search, Category Pills, Wishlist
│   │   │   ├── CourseDetailPage.jsx     # Syllabus, Enroll, Prerequisites
│   │   │   ├── StudentDashboard.jsx     # Progress Stats, Wishlist, Exams
│   │   │   ├── LearningRoom.jsx         # Video Player, Sequential Locks, Scratchpad
│   │   │   ├── ExamProctorRoom.jsx      # AI Webcam Proctor, 3-Strike Tab-Switch Guard
│   │   │   ├── AdminDashboard.jsx       # Platform KPIs, CRUD, Progress Monitor
│   │   │   └── ApiDocsPage.jsx          # Live REST API Explorer
│   │   └── styles/index.css    # 5 CSS Data-Theme Tokens & Design System
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # SQLite Schema & DB Initialization
│   │   │   ├── seed_100_courses.js      # 107 Seeded Courses
│   │   │   └── seed_exam_questions.js   # 535 Seeded Exam Questions
│   │   ├── controllers/        # Auth, Courses, Enrollments, Admin, Exam
│   │   ├── middleware/         # JWT Auth, Role-Based Access Control (Admin/Student)
│   │   ├── routes/             # REST Route definitions
│   │   └── server.js           # Express App & Production Static File Handler
│   ├── schema.sql              # Relational DDL Script for DB Presentation
│   └── test_all_endpoints.js   # 17-Endpoint Automated Verification Suite
│
└── package.json                # Unified Root Build & Deployment Scripts
```

---

## 🌐 Full Cloud Deployment Guide

You can deploy this application to any cloud platform in under 3 minutes for free:

### Option A: Render (Recommended — 1-Click Full-Stack)
1. Push this repository to your **GitHub** account.
2. Sign in to **[Render.com](https://render.com)**.
3. Click **"New +"** → **"Web Service"** → Connect your GitHub repository.
4. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_random_secret_string_here`
   - `PORT` = `10000`
6. Click **"Create Web Service"**. Render will build the React frontend and launch the Express server at your custom `https://coursify-xxx.onrender.com` URL!

---

### Option B: Railway
1. Go to **[Railway.app](https://railway.app)**.
2. Click **"New Project"** → **"Deploy from GitHub repo"**.
3. Railway automatically detects `package.json` and runs `npm run build` and `npm start`.
4. Set `JWT_SECRET` in the Variables tab.

---

### Option C: Self-Hosted VPS (Ubuntu / DigitalOcean / AWS EC2)
```bash
# 1. Clone your repo
git clone <your-repo-url>
cd <repo-folder>

# 2. Install & Build
npm run install:all
npm run build

# 3. Run with PM2 Process Manager
npm install -g pm2
pm2 start server/src/server.js --name "coursify"
pm2 save
pm2 startup
```

---

## 🧪 Automated Endpoint Audit Test

Run the full 17-endpoint audit anytime:
```bash
node server/test_all_endpoints.js
```

All 17 core operations (Auth, Categories, Courses, Bookmarks, Classroom, Notes, AI Proctored Exams, Admin KPIs) will execute and report live status codes.

---

## 🎓 Viva & Technical Defense Highlights

- **JWT Stateless Authentication**: Secure authorization header (`Bearer <token>`) with RBAC authorization middleware protecting admin endpoints with `403 Forbidden`.
- **Database Normalization**: Clean 3NF relational design across `users`, `courses`, `lessons`, `enrollments`, `lesson_progress`, `lesson_notes`, `bookmarks`, `exam_questions`, and `exam_submissions`.
- **Anti-Cheating Mechanisms**: Uses HTML5 Page Visibility API (`visibilitychange`), `blur` listeners, `getUserMedia` camera feeds, and hotkey cancellation.
- **Client Performance**: Built with Vite, zero external UI component libraries, and pure CSS variables for instantaneous 60fps theme transitions.

---

*Engineered with pride by **Dhanush**.*
