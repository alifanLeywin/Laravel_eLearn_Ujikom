# eLearn LMS (Laravel 12 + Inertia React)

Platform LMS multi-tenant dengan peran Super Admin, Admin, Teacher, dan Student. Mendukung hierarki Course → Module → Lesson, quiz, assignment dengan submission, enrollment, pelacakan progres, katalog publik, serta tampilan publik bertema light/dark.

## 🚀 Mulai Cepat
```bash
git clone https://github.com/alifanLeywin/Laravel_eLearn_Ujikom.git
cd Laravel_eLearn_Ujikom

cp .env.example .env
composer install
npm install

php artisan key:generate
php artisan migrate --seed      # seed sample tenant/teacher/student/course
php artisan storage:link

npm run dev   # atau npm run build
php artisan serve
```
App jalan di http://localhost:8000

## 🛠️ Teknologi
- PHP 8.4, Laravel 12
- Inertia v2 + React 19 + TypeScript
- Tailwind CSS v4, Vite
- MySQL (default), PHPUnit 11
- Role: super_admin, admin, teacher, student

## 📊 ERD (lengkap)
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

## 🎭 UML Use Case (Peran & Fitur)
```mermaid
flowchart LR
    classDef actor fill:#fdf2f8,stroke:#fb7185,color:#9f1239,stroke-width:2px;
    classDef action fill:#fff7ed,stroke:#fb923c,color:#9a3412,stroke-dasharray: 3 3;

    SA((Super Admin)):::actor
    AD((Admin)):::actor
    TE((Teacher)):::actor
    ST((Student)):::actor
    GU((Guest)):::actor

    saTenant[Kelola tenant &amp; paket]:::action
    saStaff[Kelola admin &amp; teacher (staf)]:::action
    saCatalog[Kelola kategori &amp; tag katalog]:::action
    saModerate[Review/publish/trash/restore course]:::action
    adTeacher[Kelola teacher]:::action

    teCourse[Buat/edit/publish course sendiri]:::action
    teModule[Susun module &amp; lesson (text/video)]:::action
    teQuiz[Buat quiz, soal, time-limit, passing grade]:::action
    teAssignment[Buat assignment &amp; due date]:::action
    teAttachment[Kelola attachment materi]:::action
    teGrade[Nilai submission + feedback &amp; skor]:::action
    teAnalytics[Lihat progres &amp; analytics course]:::action

    stBrowse[Jelajah katalog, filter, cari course]:::action
    stEnroll[Enroll/unenroll course (role student)]:::action
    stPlayer[Player lesson: video/text, mark complete/undo]:::action
    stQuiz[Kerjakan quiz & lihat skor]:::action
    stSubmission[Upload assignment &amp; unduh feedback]:::action
    stProgress[Track progres &amp; achievement]:::action
    stComment[Komentar/pertanyaan course]:::action

    guBrowse[Lihat katalog publik &amp; detail course]:::action
    guAuth[Register/Login]:::action

    SA --> saTenant
    SA --> saStaff
    SA --> saCatalog
    SA --> saModerate

    AD --> saCatalog
    AD --> adTeacher
    AD --> saModerate

    TE --> teCourse
    TE --> teModule
    TE --> teQuiz
    TE --> teAssignment
    TE --> teAttachment
    TE --> teGrade
    TE --> teAnalytics

    ST --> stBrowse
    ST --> stEnroll
    ST --> stPlayer
    ST --> stQuiz
    ST --> stSubmission
    ST --> stProgress
    ST --> stComment

    GU --> guBrowse
    GU --> guAuth
```

## ✨ Fitur Utama
- Katalog publik & detail course bertema (dengan related courses)
- Student: enroll, player course (video/text/quiz/assignment), undo/complete lesson, unduh submission
- Teacher: penilaian submission, pembuatan quiz/soal, snapshot analytics, progress siswa
- Admin/Super Admin: kelola tenant, teacher, kategori, course; trash/restore course
- Halaman 403/404 kustom, navigasi sesuai role, toggle tema light/dark

## 👤 Akun Default (Seeder)
- Super Admin: `superadmin@example.com` / `password`
- Admin: `admin@example.com` / `password`
- Teacher: `teacher@example.com` / `password`
- Student: `student@example.com` / `password`

## 🔧 Perintah Umum
- Jalankan dev: `php artisan serve` + `npm run dev`
- Build aset: `npm run build`
- Format: `vendor/bin/pint --dirty`
- Seed data: `php artisan db:seed`
- Contoh tes: `php artisan test --filter=StudentCourseTest`

## 🗒️ Catatan
- Semua course gratis (kolom harga dihilangkan)
- Upload file di `storage/app/public` (jalankan `php artisan storage:link`)
- Enrollment hanya untuk student; role lain akan mendapat 403 kustom

## 📄 Lisensi
MIT
