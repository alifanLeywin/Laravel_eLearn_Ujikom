# eLearn LMS (Laravel + Inertia + React)

Multi-tenant learning management system with roles for Super Admin, Admin, Teacher, and Student. Supports course hierarchy (Course → Module → Lesson), assignments with file submissions, quizzes, enrollments, progress tracking, and public catalog pages styled for marketing use.

## Tech Stack
- PHP 8.4, Laravel 12 (Inertia SSR disabled, SPA style)
- Inertia v2 + React 19
- Tailwind CSS v4
- MySQL (default), Vite, TypeScript, PHPUnit 11

## Features (Highlight)
- Multi-tenant courses with categories, modules, lessons
- Enrollments (student-only), progress tracking, complete/undo complete
- Assignments (upload/download submissions), teacher grading & feedback
- Quizzes (MCQ/essay) with attempts, automatic scoring, pass check
- Public catalog + course detail pages with themed layouts and related courses
- Teacher dashboard (metrics, upcoming lessons), Student dashboard (summary & recommendations)
- Soft-delete courses with trash + restore/force delete
- Role-aware navigation and custom 403/404 pages

## Setup
```bash
cp .env.example .env

composer install
npm install

php artisan key:generate
php artisan migrate --seed   # seeds sample tenants/courses/teachers/students
php artisan storage:link

npm run build                # or npm run dev
php artisan serve
```

Visit: http://localhost:8000

## ERD (Simplified)
```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    USERS ||--o{ COURSES : teaches
    COURSES ||--o{ MODULES : contains
    MODULES ||--o{ LESSONS : contains
    LESSONS ||--o{ QUIZZES : has
    QUIZZES ||--o{ QUESTIONS : has
    LESSONS ||--o{ ASSIGNMENTS : has
    USERS ||--o{ ENROLLMENTS : owns
    ENROLLMENTS ||--o{ COURSE_PROGRESS : tracks
    ASSIGNMENTS ||--o{ SUBMISSIONS : collects
    QUIZZES ||--o{ QUIZ_ATTEMPTS : records
    LESSONS ||--o{ ATTACHMENTS : stores
    COURSES ||--o{ COURSE_COMMENTS : comments

    TENANTS {
        uuid id PK
        string name
        string slug
        string subscription_status
    }
    USERS {
        uuid id PK
        uuid tenant_id FK
        string name
        string email
        enum role "super_admin|admin|teacher|student"
        string password
        string slug
        text bio
    }
    COURSES {
        uuid id PK
        uuid tenant_id FK
        uuid teacher_id FK
        uuid category_id FK
        string title
        string slug
        text description
        string status
        string level
        string cover_image
    }
    MODULES {
        uuid id PK
        uuid course_id FK
        string title
        int sort_order
    }
    LESSONS {
        uuid id PK
        uuid module_id FK
        string title
        string type
        longtext content
        string video_url
        int duration
        bool is_preview
        int sort_order
    }
    ENROLLMENTS {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        string status
        datetime enrolled_at
    }
```

## UML (Key Classes/Relations)
```mermaid
classDiagram
    class Course {
        +id: uuid
        +title: string
        +status: string
        +level: string
        +modules()
        +lessons()
        +enrollments()
    }
    class Lesson {
        +id: uuid
        +type: string
        +content: text
        +video_url: string
        +assignment()
        +quiz()
    }
    class Assignment {
        +id: uuid
        +due_date: datetime
        +max_score: int
        +submissions()
    }
    class Submission {
        +id: uuid
        +file_path: string
        +grade: int
        +feedback_text: text
    }
    class Quiz {
        +id: uuid
        +time_limit: int
        +passing_grade: int
        +questions()
        +attempts()
    }
    class Enrollment {
        +id: uuid
        +status: string
        +progress()
    }

    Course --> Module : has
    Module --> Lesson : has
    Lesson --> Assignment : has
    Lesson --> Quiz : has
    Assignment --> Submission : collects
    Quiz --> Question : has
    Quiz --> QuizAttempt : records
    Course --> Enrollment : owns
    Enrollment --> CourseProgress : tracks
```

## Key Pages (Inertia + React)
- Public: Home, Courses list, Course detail (enroll + related), Teachers list/detail
- Auth: Login/Register/Forgot/2FA
- Admin/Teacher: Courses (CRUD, modules/lessons, quiz & assignment management), Teachers (CRUD), Categories, Tenants (Super Admin)
- Student: Dashboard, Course player (video/text/quiz/assignment), progress toggle, assignment submit/download
- Errors: Custom 403/404 Inertia pages

## Notes
- Courses are free (price removed)
- Soft deletes enabled for courses with trash/restore/force delete
- File uploads stored in `storage/app/public` (run `storage:link`)
- Only students can enroll; teachers/admins blocked with custom 403

## Testing
```bash
php artisan test --filter=StudentCourseTest
```

## Commands (Common)
- Dev server: `php artisan serve` + `npm run dev`
- Lint/format: `vendor/bin/pint --dirty`
- Seed sample data: `php artisan db:seed`

## License
MIT
