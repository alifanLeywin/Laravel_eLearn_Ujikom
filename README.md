# eLearn LMS (Laravel 12 + Inertia React)

Multi-tenant LMS with roles for Super Admin, Admin, Teacher, and Student. Supports course hierarchy (Course → Module → Lesson), quizzes, assignments with submissions, enrollments, progress tracking, public catalog, and themed public pages..

## 🚀 Getting Started
```bash
git clone https://github.com/alifanLeywin/Laravel_eLearn_Ujikom.git
cd Laravel_eLearn_Ujikom

cp .env.example .env
composer install
npm install

php artisan key:generate
php artisan migrate --seed      # seeds sample tenants/courses/teachers/students
php artisan storage:link

npm run dev   # or npm run build
php artisan serve
```

App runs at http://localhost:8000

## 🛠 Tech Stack
- PHP 8.4, Laravel 12
- Inertia v2 + React 19 + TypeScript
- Tailwind CSS v4, Vite
- MySQL (default), PHPUnit 11
- Roles: super_admin, admin, teacher, student

## 📊 ERD (Complete)
```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    TENANTS ||--o{ COURSES : owns
    USERS ||--o{ COURSES : teaches
    COURSES ||--o{ MODULES : has
    MODULES ||--o{ LESSONS : has
    LESSONS ||--o{ QUIZZES : has
    QUIZZES ||--o{ QUESTIONS : has
    LESSONS ||--o{ ASSIGNMENTS : has
    ASSIGNMENTS ||--o{ SUBMISSIONS : collects
    QUIZZES ||--o{ QUIZ_ATTEMPTS : records
    LESSONS ||--o{ ATTACHMENTS : stores
    COURSES ||--o{ COURSE_COMMENTS : comments
    USERS ||--o{ ENROLLMENTS : owns
    ENROLLMENTS ||--o{ COURSE_PROGRESS : tracks
    COURSES ||--o{ CATEGORIES : belongs_to

    TENANTS {
        uuid id PK
        string name
        string slug
        string subscription_status
        datetime timestamps
    }
    USERS {
        uuid id PK
        uuid tenant_id FK
        string name
        string email UK
        string password
        string role "super_admin|admin|teacher|student"
        string slug
        text bio
        datetime timestamps
        datetime softDeletes
    }
    CATEGORIES {
        uuid id PK
        uuid tenant_id FK
        string name
        uuid parent_id FK
        datetime timestamps
        datetime softDeletes
    }
    COURSES {
        uuid id PK
        uuid tenant_id FK
        uuid teacher_id FK
        uuid category_id FK
        string title
        string slug
        text description
        string cover_image
        string status "draft|published"
        string level
        datetime published_at
        datetime timestamps
        datetime softDeletes
    }
    MODULES {
        uuid id PK
        uuid course_id FK
        string title
        int sort_order
        datetime timestamps
        datetime softDeletes
    }
    LESSONS {
        uuid id PK
        uuid module_id FK
        string title
        string type "text|video|quiz|assignment"
        longtext content
        string video_url
        int duration
        bool is_preview
        int sort_order
        datetime timestamps
        datetime softDeletes
    }
    QUIZZES {
        uuid id PK
        uuid lesson_id FK
        int time_limit
        int passing_grade
        datetime timestamps
        datetime softDeletes
    }
    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        string type "multiple_choice|essay"
        text question_text
        json options
        int score
        datetime timestamps
        datetime softDeletes
    }
    ASSIGNMENTS {
        uuid id PK
        uuid lesson_id FK
        datetime due_date
        int max_score
        datetime timestamps
        datetime softDeletes
    }
    SUBMISSIONS {
        uuid id PK
        uuid assignment_id FK
        uuid user_id FK
        string file_path
        int grade
        text feedback_text
        datetime submitted_at
        datetime timestamps
        datetime softDeletes
    }
    QUIZ_ATTEMPTS {
        uuid id PK
        uuid user_id FK
        uuid quiz_id FK
        int score
        bool passed
        datetime submitted_at
        json answers
        datetime timestamps
        datetime softDeletes
    }
    ENROLLMENTS {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        string status "active|completed|expired"
        datetime enrolled_at
        datetime timestamps
        datetime softDeletes
    }
    COURSE_PROGRESS {
        uuid id PK
        uuid enrollment_id FK
        uuid lesson_id FK
        datetime completed_at
        datetime timestamps
        datetime softDeletes
    }
    ATTACHMENTS {
        uuid id PK
        uuid attachable_id
        string attachable_type
        string file_path
        json meta
        datetime timestamps
        datetime softDeletes
    }
    COURSE_COMMENTS {
        uuid id PK
        uuid course_id FK
        uuid user_id FK
        text body
        datetime timestamps
        datetime softDeletes
    }
```

## 🎭 UML Use Case (Role Responsibilities)
```mermaid
usecaseDiagram
    actor SA as "Super Admin"
    actor AD as "Admin"
    actor TE as "Teacher"
    actor ST as "Student"
    actor GU as "Guest"

    SA --> (Kelola tenant)
    SA --> (Kelola admin/teacher)
    SA --> (Kelola kategori & course)

    AD --> (Kelola kategori)
    AD --> (Kelola teacher)
    AD --> (Kelola course)
    AD --> (Lihat analytics course)

    TE --> (Kelola course pribadi)
    TE --> (Kelola module & lesson)
    TE --> (Buat quiz & soal)
    TE --> (Buat assignment)
    TE --> (Nilai submission & feedback)
    TE --> (Lihat progress siswa)

    ST --> (Lihat katalog & course detail)
    ST --> (Enroll course)
    ST --> (Selesaikan lesson)
    ST --> (Kerjakan quiz)
    ST --> (Upload assignment)
    ST --> (Lihat nilai & feedback)
    ST --> (Komentar course)

    GU --> (Lihat katalog publik)
    GU --> (Register/Login)
```

## ✨ Highlights
- Public catalog & course detail with themed UI and related courses
- Student: enroll, course player (video/text/quiz/assignment), undo/complete lesson, submissions download
- Teacher: grading submissions, quiz authoring, analytics snapshot, student progress view
- Admin/Super Admin: manage tenants, teachers, categories, courses; trash/restore courses
- Custom 403/404, role-aware nav, dark/light theme toggle

## 🔧 Common Commands
- Dev server: `php artisan serve` + `npm run dev`
- Build assets: `npm run build`
- Lint/format: `vendor/bin/pint --dirty`
- Seed data: `php artisan db:seed`
- Tests (sample): `php artisan test --filter=StudentCourseTest`

## 🗒️ Notes
- Courses are free (no price column)
- File uploads in `storage/app/public` (run `php artisan storage:link`)
- Enrollment restricted to students; others get 403 with custom page

## 📄 License
MIT
