# Coursify — Online Course Management System

A full-stack online learning and certification platform built with React, Node.js, Express, and SQLite.

Developed by **Dhanush** as a major web development project.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js (v18 or higher)
- npm

### 2. Run the App
```bash
# Install dependencies
npm run install:all

# Start backend server and frontend concurrently
npm start
```
Visit **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🔑 Demo Logins

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Student** | `dhanush@gmail.com` | `Student@123` | Browse catalog, enroll in courses, save notes, take exams, download certificates, check login history |
| **Admin** | `admin@coursify.com` | `Admin@123` | View site analytics, add/edit/delete courses, monitor students, inspect full login audit logs |

> 💡 *You can also use the 1-click credentials buttons inside the sign-in modal to autofill credentials quickly.*

---

## 🎯 Main Features

1. **Sequential Module Progression:**
   - Lessons must be completed in order. Lesson 2 only unlocks once you finish Lesson 1.
   - The final certification exam is unlocked only after reaching 100% course syllabus completion.

2. **Cheating Prevention & Proctoring:**
   - Live camera stream feed during the final test (`getUserMedia`).
   - Detects tab switches and browser defocus events with warning audio tones.
   - 3-strike rule automatically ends the exam on repeated violations.
   - Clipboard interceptor prevents copy/pasting.

3. **Login & Security Audit Logs (Database Stored):**
   - Every login (successful or failed) is stored in the SQLite `login_logs` table with IP address, browser/device info, and timestamps.
   - Admins have an audit dashboard tab with filters and stats.
   - Students can review their own recent sign-in history under their profile.

4. **Human Eye-Comfort Black & White Themes:**
   - **Monochrome Dark (Default):** Pitch black `#09090b` and dark charcoal cards designed for high readability with zero glare.
   - **Paper White:** Clean high-contrast daylight mode.
   - **OLED Black:** Pure zero-glare `#000000` mode.
   - **Warm Sepia:** Soft ambient tone for comfortable night reading.
   - **Slate Graphite:** Minimalist gray palette.

5. **In-Lesson Study Scratchpad:**
   - Students can jot down personal markdown code notes while watching lesson videos. Notes auto-save directly to the database.

6. **Verifiable Certificates:**
   - Passing students ($\ge 60\%$) receive a certificate with a unique code (e.g., `CERT-DHANUSH-11-7895`) that can be verified publicly at `/api/enrollments/verify-certificate/:code`.

---

## 🏗️ Project Structure

```
project-root/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, AuthModal, CourseCard, CertificateModal
│   │   ├── pages/              # Catalog, Classroom, Exam Room, Dashboards, API Docs
│   │   ├── context/            # AuthContext (JWT & login state)
│   │   └── styles/             # Eye-comfort monochrome CSS design system
│   └── dist/                   # Built production bundle
├── server/                     # Node.js Express backend
│   ├── src/
│   │   ├── config/             # Database connection & table setup (db.js)
│   │   ├── controllers/        # Auth, Courses, Enrollments, Admin, Exam logic
│   │   ├── middleware/         # JWT verification & RBAC role checks
│   │   ├── routes/             # Express API routes
│   │   └── server.js           # Main Express server entry point
│   ├── schema.sql              # Clean SQL table schemas
│   └── test_all_endpoints.js   # Automated 23-endpoint verification suite
├── ecommerce-store/            # Standalone NovaLuxe storefront
└── PROJECT_REPORT.md           # Full engineering report
```

---

## 🧪 Testing

Run the automated test script to verify all 23 API endpoints:
```bash
node server/test_all_endpoints.js
```

---

## 📄 License & Author

Created by **Dhanush** (2026).  
Open source under the [MIT License](LICENSE).
