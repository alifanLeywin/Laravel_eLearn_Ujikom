<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\PublicSite\HomeController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
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
        Route::get('admin/courses/create', [CourseController::class, 'create'])->name('admin.courses.create');
        Route::get('admin/courses/{course}', [CourseController::class, 'show'])->name('admin.courses.show');
        Route::get('admin/courses/{course}/edit', [CourseController::class, 'edit'])->name('admin.courses.edit');
        Route::post('admin/courses', [CourseController::class, 'store'])->name('admin.courses.store');
        Route::put('admin/courses/{course}', [CourseController::class, 'update'])->name('admin.courses.update');
        Route::delete('admin/courses/{course}', [CourseController::class, 'destroy'])->name('admin.courses.destroy');

        Route::post('admin/courses/{course}/modules', [ModuleController::class, 'store'])->name('admin.modules.store');
        Route::put('admin/courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('admin.modules.update');
        Route::delete('admin/courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('admin.modules.destroy');

        Route::post('admin/courses/{course}/modules/{module}/lessons', [LessonController::class, 'store'])->name('admin.lessons.store');
        Route::put('admin/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('admin.lessons.update');
        Route::delete('admin/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('admin.lessons.destroy');
    });

    Route::middleware('role:super_admin,admin,teacher')->group(function () {
        Route::get('teacher/dashboard', TeacherDashboardController::class)
            ->name('teacher.dashboard');

        Route::get('teacher/courses', [CourseController::class, 'index'])->name('teacher.courses.index');
        Route::get('teacher/courses/create', [CourseController::class, 'create'])->name('teacher.courses.create');
        Route::get('teacher/courses/{course}', [CourseController::class, 'show'])->name('teacher.courses.show');
        Route::get('teacher/courses/{course}/edit', [CourseController::class, 'edit'])->name('teacher.courses.edit');
        Route::post('teacher/courses', [CourseController::class, 'store'])->name('teacher.courses.store');
        Route::put('teacher/courses/{course}', [CourseController::class, 'update'])->name('teacher.courses.update');
        Route::delete('teacher/courses/{course}', [CourseController::class, 'destroy'])->name('teacher.courses.destroy');

        Route::post('teacher/courses/{course}/modules', [ModuleController::class, 'store'])->name('teacher.modules.store');
        Route::put('teacher/courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('teacher.modules.update');
        Route::delete('teacher/courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('teacher.modules.destroy');

        Route::post('teacher/courses/{course}/modules/{module}/lessons', [LessonController::class, 'store'])->name('teacher.lessons.store');
        Route::put('teacher/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('teacher.lessons.update');
        Route::delete('teacher/courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('teacher.lessons.destroy');
    });

    Route::middleware('role:super_admin,admin,student')->group(function () {
        Route::get('student/dashboard', StudentDashboardController::class)
            ->name('student.dashboard');
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
