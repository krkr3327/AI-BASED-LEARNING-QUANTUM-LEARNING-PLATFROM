# 🐘 PHP REST API Backend for Quantum Learning Platform

A standalone, production-ready, modular **PHP REST Backend** with PDO Database persistence (SQLite/MySQL), prepared statements, CORS middleware, token-based authentication, curriculum management, automated quiz grading, assessment grading desk, and code execution.

---

## 📁 Folder Structure

```
php_backend/
├── config/
│   ├── env.php                  # Environment variables loader
│   ├── database.php             # PDO database connection factory
│   └── cors.php                 # CORS middleware for local dev & production
├── data/
│   └── database.sqlite          # Auto-created SQLite database file with seed data
├── src/
│   ├── Controllers/
│   │   ├── AuthController.php         # Registration, Login, Profile
│   │   ├── CourseController.php       # Courses, Modules, Lessons, Notes CRUD
│   │   ├── QuizController.php         # Quizzes & Auto-grading Knowledge Checks
│   │   ├── AssessmentController.php   # Formal Exams, Submissions & Live Grading Desk
│   │   ├── ChallengeController.php    # Code Challenges, Problems & Sandbox Execution
│   │   ├── ProgressController.php     # Enrollments, Lesson Progress & Oversight
│   │   └── NotificationController.php # Student & Trainer Notifications
│   ├── Models/
│   │   └── Schema.php                 # Auto-creates SQL tables & seeds default courses
│   └── Utils/
│       ├── Auth.php                   # Bearer token validation & RBAC security
│       ├── Response.php               # Standard JSON output & HTTP status codes
│       └── Router.php                 # RESTful URL pattern router
├── index.php                          # Master Front Controller
├── .env.example                       # Example environment configuration
├── .env                               # Active environment file
└── README.md                          # Comprehensive documentation
```

---

## ⚙️ 1. Database Configuration

The PHP backend uses standard **PDO** and comes configured with **SQLite** by default (requiring zero database setup, as `data/database.sqlite` is automatically created and populated).

To use **MySQL / MariaDB**, edit `php_backend/.env`:

```ini
# Switch driver to mysql
DB_DRIVER=mysql

# MySQL Server Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=quantum_platform
DB_USER=root
DB_PASS=your_mysql_password

# CORS Settings
CORS_ORIGIN=*
```

---

## 🚀 2. How to Start the PHP Server

### Option A: Built-in PHP Web Server (Recommended for local testing)

Open a terminal in the project root and run:

```bash
php -S localhost:8080 -t php_backend
```

The API will be live at `http://localhost:8080`.

### Option B: Apache / Nginx / XAMPP / Laragon

1. Point your Document Root or VirtualHost to `php_backend/` (or place `php_backend` inside `htdocs`/`www`).
2. Ensure URL rewriting is enabled to route requests through `index.php`.

---

## 🌐 3. Connecting Frontend to the PHP Backend

In your frontend, you can point directly to the PHP server by setting the environment variable in `frontend/.env`:

```ini
VITE_API_URL=http://localhost:8080
```

Then start Vite:

```bash
cd frontend
npm run dev
```

---

## 📡 4. Complete API Endpoints Reference

### 🔐 Authentication (`/api/platform/auth/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/platform/auth/register` | Register new Trainer or Student |
| `POST` | `/api/platform/auth/login` | Login and receive Bearer session token |
| `GET` | `/api/platform/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/platform/profile` | Update user profile, avatar, bio, expertise |

**Default Seed Accounts:**
* **Trainer**: `trainer@platform.edu` / `trainer123`
* **Student**: `student@platform.edu` / `student123`

---

### 📚 Courses, Modules, Lessons & Notes (`/api/platform/courses/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/platform/courses` | List courses (supports `?trainer_id=...` & `?published_only=true`) |
| `POST` | `/api/platform/courses` | Author new course |
| `GET` | `/api/platform/courses/{course_id}` | Fetch full course with modules, lessons, quizzes, assessments |
| `PUT` | `/api/platform/courses/{course_id}` | Update course metadata |
| `DELETE` | `/api/platform/courses/{course_id}` | Delete course and cascade elements |
| `POST` | `/api/platform/courses/{course_id}/modules` | Add module to course |
| `DELETE` | `/api/platform/courses/{course_id}/modules/{module_id}` | Delete module |
| `POST` | `/api/platform/courses/{course_id}/modules/{module_id}/lessons` | Add video or theory lesson |
| `DELETE` | `/api/platform/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}` | Delete lesson |
| `POST` | `/api/platform/courses/{course_id}/notes` | Attach downloadable PDF / study note |
| `DELETE` | `/api/platform/courses/{course_id}/notes/{note_id}` | Delete note resource |

---

### ❓ Quizzes & Auto-Evaluation (`/api/platform/quizzes/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/platform/courses/{course_id}/quizzes` | Create timed multiple-choice quiz |
| `DELETE` | `/api/platform/courses/{course_id}/quizzes/{quiz_id}` | Delete quiz |
| `POST` | `/api/platform/courses/{course_id}/quizzes/{quiz_id}/submit` | Submit answers, auto-grade, record score |

---

### 📑 Assessments & Live Grading Desk (`/api/platform/assessments/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/platform/courses/{course_id}/assessments` | Create formal examination |
| `DELETE` | `/api/platform/courses/{course_id}/assessments/{assessment_id}` | Delete assessment |
| `POST` | `/api/platform/assessments/{assessment_id}/submit` | Student written answers submission |
| `GET` | `/api/platform/submissions` | List submissions for Live Grading Desk |
| `POST` | `/api/platform/submissions/{submission_id}/grade` | Instructor assigns score & qualitative feedback |

---

### ⚡ Practical Challenges & Sandbox (`/api/platform/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/platform/courses/{course_id}/challenges` | Author practical coding challenge |
| `DELETE` | `/api/platform/courses/{course_id}/challenges/{challenge_id}` | Delete challenge |
| `POST` | `/api/platform/courses/{course_id}/problems` | Author lab problem |
| `DELETE` | `/api/platform/courses/{course_id}/problems/{problem_id}` | Delete problem |
| `POST` | `/api/platform/execute-code` | Execute Python script in sandbox & return stdout |

---

### 📈 Enrollments, Progress & Oversight (`/api/platform/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/platform/enrollments/{course_id}` | Enroll student in course |
| `GET` | `/api/platform/enrollments` | List student's enrolled courses |
| `GET` | `/api/platform/progress/{course_id}` | Get completion percentage & scorecards |
| `POST` | `/api/platform/progress/{course_id}/complete-lesson` | Mark lesson as completed |
| `GET` | `/api/platform/trainer/learners-overview` | Trainer supervision oversight table |
| `GET` | `/api/platform/notifications` | Fetch student / trainer notifications |
| `POST` | `/api/platform/notifications/read` | Mark notifications as read |

---

## 🧪 5. Testing the Integration

You can test API endpoints using `curl` or Postman:

```bash
# 1. Health check
curl http://localhost:8080/api/health

# 2. List Courses
curl http://localhost:8080/api/platform/courses

# 3. Trainer Login
curl -X POST http://localhost:8080/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@platform.edu","password":"trainer123","role":"trainer"}'
```
