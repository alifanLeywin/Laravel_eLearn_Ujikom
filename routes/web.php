<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\PublicSite\CourseController as PublicCourseController;
use App\Http\Controllers\PublicSite\HomeController;
use App\Http\Controllers\PublicSite\TeacherController as PublicTeacherController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/courses', [PublicCourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [PublicCourseController::class, 'show'])->name('courses.show');
Route::post('/courses/{course:slug}/enroll', [PublicCourseController::class, 'enroll'])
    ->middleware('auth')
    ->name('courses.enroll');
Route::post('/courses/{course:slug}/comments', [\App\Http\Controllers\PublicSite\CourseCommentController::class, 'store'])
    ->middleware('auth')
    ->name('courses.comments.store');
Route::put('/courses/{course:slug}/comments/{comment}', [\App\Http\Controllers\PublicSite\CourseCommentController::class, 'update'])
    ->middleware('auth')
    ->name('courses.comments.update');
Route::delete('/courses/{course:slug}/comments/{comment}', [\App\Http\Controllers\PublicSite\CourseCommentController::class, 'destroy'])
    ->middleware('auth')
    ->name('courses.comments.destroy');
Route::get('/teachers', [PublicTeacherController::class, 'index'])->name('teachers.index');
Route::get('/teachers/{teacher:slug}', [PublicTeacherController::class, 'show'])->name('teachers.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('submissions/{submission}/download', \App\Http\Controllers\SubmissionDownloadController::class)
        ->name('submissions.download');

    Route::get('dashboard', function () {
        $user = auth()->user();

        if (! $user) {
            return redirect()->route('login');
        }

        return match ($user->role) {
            UserRole::SuperAdmin, UserRole::Admin => redirect()->route('admin.dashboard'),
            UserRole::Teacher => redirect()->route('teacher.dashboard'),
            default => redirect()->route('student.dashboard'),
        };
    })->name('dashboard');

    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('admin/dashboard', AdminDashboardController::class)
            ->name('admin.dashboard');

        Route::get('admin/categories', [CategoryController::class, 'index'])
            ->name('admin.categories.index');
        Route::get('admin/categories/create', [CategoryController::class, 'create'])
            ->name('admin.categories.create');
        Route::get('admin/categories/{category}/edit', [CategoryController::class, 'edit'])
            ->name('admin.categories.edit');
        Route::post('admin/categories', [CategoryController::class, 'store'])
            ->name('admin.categories.store');
        Route::put('admin/categories/{category}', [CategoryController::class, 'update'])
            ->name('admin.categories.update');
        Route::delete('admin/categories/{category}', [CategoryController::class, 'destroy'])
            ->name('admin.categories.destroy');
        Route::delete('admin/categories', [CategoryController::class, 'bulkDestroy'])
            ->name('admin.categories.bulk-destroy');

        Route::get('admin/courses', [CourseController::class, 'index'])->name('admin.courses.index');
        Route::get('admin/courses/trashed', [CourseController::class, 'trashed'])->name('admin.courses.trashed');
        Route::get('admin/courses/create', [CourseController::class, 'create'])->name('admin.courses.create');
        Route::get('admin/courses/{course}', [CourseController::class, 'show'])->name('admin.courses.show');
        Route::get('admin/courses/{course}/edit', [CourseController::class, 'edit'])->name('admin.courses.edit');
        Route::post('admin/courses', [CourseController::class, 'store'])->name('admin.courses.store');
        Route::put('admin/courses/{course}', [CourseController::class, 'update'])->name('admin.courses.update');
        Route::delete('admin/courses/{course}', [CourseController::class, 'destroy'])->name('admin.courses.destroy');
        Route::post('admin/courses/{course}/restore', [CourseController::class, 'restore'])
            ->withTrashed()
            ->name('admin.courses.restore');
        Route::delete('admin/courses/{course}/force', [CourseController::class, 'forceDestroy'])
            ->withTrashed()
            ->name('admin.courses.force-destroy');

        Route::post('admin/courses/{course}/modules', [ModuleController::class, 'store'])->name('admin.modules.store');
        Route::put('admin/courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('admin.modules.update');
        Route::delete('admin/courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('admin.modules.destroy');

        Route::post('admin/courses/{course}/modules/{module}/lessons', [LessonController::class, 'store'])->name('admin.lessons.store');
        Route::put('admin/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('admin.lessons.update');
        Route::delete('admin/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('admin.lessons.destroy');
        Route::post('admin/courses/{course}/enrollments', [\App\Http\Controllers\Admin\EnrollmentController::class, 'store'])->name('admin.enrollments.store');
        Route::put('admin/courses/{course}/enrollments/{enrollment}', [\App\Http\Controllers\Admin\EnrollmentController::class, 'update'])->name('admin.enrollments.update');
        Route::delete('admin/courses/{course}/enrollments/{enrollment}', [\App\Http\Controllers\Admin\EnrollmentController::class, 'destroy'])->name('admin.enrollments.destroy');
        Route::post('admin/courses/{course}/modules/{module}/lessons/{lesson}/assignments', [\App\Http\Controllers\Admin\AssignmentController::class, 'store'])->name('admin.assignments.store');
        Route::put('admin/courses/{course}/modules/{module}/lessons/{lesson}/assignments/{assignment}', [\App\Http\Controllers\Admin\AssignmentController::class, 'update'])->name('admin.assignments.update');
        Route::delete('admin/courses/{course}/modules/{module}/lessons/{lesson}/assignments/{assignment}', [\App\Http\Controllers\Admin\AssignmentController::class, 'destroy'])->name('admin.assignments.destroy');
        Route::post('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes', [\App\Http\Controllers\Admin\QuizController::class, 'store'])->name('admin.quizzes.store');
        Route::put('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}', [\App\Http\Controllers\Admin\QuizController::class, 'update'])->name('admin.quizzes.update');
        Route::delete('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}', [\App\Http\Controllers\Admin\QuizController::class, 'destroy'])->name('admin.quizzes.destroy');
        Route::post('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions', [\App\Http\Controllers\Admin\QuestionController::class, 'store'])->name('admin.questions.store');
        Route::put('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions/{question}', [\App\Http\Controllers\Admin\QuestionController::class, 'update'])->name('admin.questions.update');
        Route::delete('admin/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions/{question}', [\App\Http\Controllers\Admin\QuestionController::class, 'destroy'])->name('admin.questions.destroy');

        Route::get('admin/teachers', [\App\Http\Controllers\Admin\TeacherController::class, 'index'])->name('admin.teachers.index');
        Route::get('admin/teachers/create', [\App\Http\Controllers\Admin\TeacherController::class, 'create'])->name('admin.teachers.create');
        Route::get('admin/teachers/{teacher}/edit', [\App\Http\Controllers\Admin\TeacherController::class, 'edit'])->name('admin.teachers.edit');
        Route::post('admin/teachers', [\App\Http\Controllers\Admin\TeacherController::class, 'store'])->name('admin.teachers.store');
        Route::put('admin/teachers/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'update'])->name('admin.teachers.update');
        Route::delete('admin/teachers/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'destroy'])->name('admin.teachers.destroy');
    });

    Route::middleware('role:super_admin,admin,teacher')->group(function () {
        Route::get('teacher/dashboard', TeacherDashboardController::class)
            ->name('teacher.dashboard');

        Route::get('teacher/courses', [CourseController::class, 'index'])->name('teacher.courses.index');
        Route::get('teacher/courses/trashed', [CourseController::class, 'trashed'])->name('teacher.courses.trashed');
        Route::get('teacher/courses/create', [CourseController::class, 'create'])->name('teacher.courses.create');
        Route::get('teacher/courses/{course}', [CourseController::class, 'show'])->name('teacher.courses.show');
        Route::get('teacher/courses/{course}/edit', [CourseController::class, 'edit'])->name('teacher.courses.edit');
        Route::post('teacher/courses', [CourseController::class, 'store'])->name('teacher.courses.store');
        Route::put('teacher/courses/{course}', [CourseController::class, 'update'])->name('teacher.courses.update');
        Route::delete('teacher/courses/{course}', [CourseController::class, 'destroy'])->name('teacher.courses.destroy');
        Route::post('teacher/courses/{course}/restore', [CourseController::class, 'restore'])
            ->withTrashed()
            ->name('teacher.courses.restore');
        Route::delete('teacher/courses/{course}/force', [CourseController::class, 'forceDestroy'])
            ->withTrashed()
            ->name('teacher.courses.force-destroy');

        Route::post('teacher/courses/{course}/modules', [ModuleController::class, 'store'])->name('teacher.modules.store');
        Route::put('teacher/courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('teacher.modules.update');
        Route::delete('teacher/courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('teacher.modules.destroy');

        Route::post('teacher/courses/{course}/modules/{module}/lessons', [LessonController::class, 'store'])->name('teacher.lessons.store');
        Route::put('teacher/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('teacher.lessons.update');
        Route::delete('teacher/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('teacher.lessons.destroy');
        Route::post('teacher/courses/{course}/enrollments', [\App\Http\Controllers\Admin\EnrollmentController::class, 'store'])->name('teacher.enrollments.store');
        Route::put('teacher/courses/{course}/enrollments/{enrollment}', [\App\Http\Controllers\Admin\EnrollmentController::class, 'update'])->name('teacher.enrollments.update');
        Route::delete('teacher/courses/{course}/enrollments/{enrollment}', [\App\Http\Controllers\Admin\EnrollmentController::class, 'destroy'])->name('teacher.enrollments.destroy');
        Route::post('teacher/courses/{course}/modules/{module}/lessons/{lesson}/assignments', [\App\Http\Controllers\Admin\AssignmentController::class, 'store'])->name('teacher.assignments.store');
        Route::put('teacher/courses/{course}/modules/{module}/lessons/{lesson}/assignments/{assignment}', [\App\Http\Controllers\Admin\AssignmentController::class, 'update'])->name('teacher.assignments.update');
        Route::delete('teacher/courses/{course}/modules/{module}/lessons/{lesson}/assignments/{assignment}', [\App\Http\Controllers\Admin\AssignmentController::class, 'destroy'])->name('teacher.assignments.destroy');
        Route::post('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes', [\App\Http\Controllers\Admin\QuizController::class, 'store'])->name('teacher.quizzes.store');
        Route::put('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}', [\App\Http\Controllers\Admin\QuizController::class, 'update'])->name('teacher.quizzes.update');
        Route::delete('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}', [\App\Http\Controllers\Admin\QuizController::class, 'destroy'])->name('teacher.quizzes.destroy');
        Route::post('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions', [\App\Http\Controllers\Admin\QuestionController::class, 'store'])->name('teacher.questions.store');
        Route::put('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions/{question}', [\App\Http\Controllers\Admin\QuestionController::class, 'update'])->name('teacher.questions.update');
        Route::delete('teacher/courses/{course}/modules/{module}/lessons/{lesson}/quizzes/{quiz}/questions/{question}', [\App\Http\Controllers\Admin\QuestionController::class, 'destroy'])->name('teacher.questions.destroy');

        Route::get('teacher/courses/{course}/students', \App\Http\Controllers\Teacher\CourseStudentsController::class)
            ->name('teacher.courses.students');
        Route::get('teacher/courses/{course}/students/{enrollment}', \App\Http\Controllers\Teacher\StudentProgressController::class)
            ->name('teacher.courses.students.progress');
        Route::patch('teacher/courses/{course}/submissions/{submission}', [\App\Http\Controllers\Teacher\SubmissionController::class, 'update'])
            ->name('teacher.submissions.update');
    });

    Route::middleware('role:super_admin,admin,student')->group(function () {
        Route::get('student/dashboard', StudentDashboardController::class)
            ->name('student.dashboard');
        Route::get('student/courses/{course}', [\App\Http\Controllers\Student\CourseController::class, 'show'])->name('student.courses.show');
        Route::post('student/courses/{course}/lessons/{lesson}/complete', [\App\Http\Controllers\Student\CourseController::class, 'complete'])->name('student.courses.lessons.complete');
        Route::delete('student/courses/{course}/lessons/{lesson}/complete', [\App\Http\Controllers\Student\CourseController::class, 'incomplete'])->name('student.courses.lessons.incomplete');
        Route::get('student/courses/{course}/lessons/{lesson}/quiz', [\App\Http\Controllers\Student\QuizController::class, 'show'])->name('student.quizzes.show');
        Route::post('student/courses/{course}/lessons/{lesson}/quiz', [\App\Http\Controllers\Student\QuizController::class, 'submit'])->name('student.quizzes.submit');
        Route::get('student/courses/{course}/lessons/{lesson}/assignment', [\App\Http\Controllers\Student\AssignmentController::class, 'show'])->name('student.assignments.show');
        Route::post('student/courses/{course}/lessons/{lesson}/assignment', [\App\Http\Controllers\Student\AssignmentController::class, 'submit'])->name('student.assignments.submit');
        Route::delete('courses/{course}/enroll', [\App\Http\Controllers\PublicSite\CourseController::class, 'unenroll'])->name('courses.unenroll');
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::get('admin/tenants', [TenantController::class, 'index'])
            ->name('admin.tenants.index');
        Route::get('admin/tenants/create', [TenantController::class, 'create'])
            ->name('admin.tenants.create');
        Route::get('admin/tenants/{tenant}/edit', [TenantController::class, 'edit'])
            ->name('admin.tenants.edit');
        Route::post('admin/tenants', [TenantController::class, 'store'])
            ->name('admin.tenants.store');
        Route::put('admin/tenants/{tenant}', [TenantController::class, 'update'])
            ->name('admin.tenants.update');
        Route::delete('admin/tenants/{tenant}', [TenantController::class, 'destroy'])
            ->name('admin.tenants.destroy');
        Route::delete('admin/tenants', [TenantController::class, 'bulkDestroy'])
            ->name('admin.tenants.bulk-destroy');
    });
});

require __DIR__.'/settings.php';
