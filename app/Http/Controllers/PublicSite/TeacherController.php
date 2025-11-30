<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $teachers = User::query()
            ->where('role', \App\Enums\UserRole::Teacher)
            ->withCount('taughtCourses')
            ->latest()
            ->get(['id', 'name', 'slug', 'bio'])
            ->map(fn (User $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'slug' => $teacher->slug,
                'bio' => $teacher->bio,
                'courses_count' => $teacher->taught_courses_count,
                'initials' => mb_strtoupper(mb_substr($teacher->name, 0, 1)),
            ]);

        return Inertia::render('public/teachers/index', [
            'teachers' => $teachers,
        ]);
    }

    public function show(User $teacher): Response
    {
        if ($teacher->role !== \App\Enums\UserRole::Teacher) {
            abort(404);
        }

        $courses = Course::query()
            ->where('teacher_id', $teacher->id)
            ->where('status', 'published')
            ->with('category:id,name')
            ->latest()
            ->get(['id', 'slug', 'title', 'cover_image', 'level', 'price', 'category_id'])
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
                'cover_image' => $course->cover_image,
                'level' => $course->level,
                'price' => $course->price,
                'category' => $course->category?->name,
            ]);

        return Inertia::render('public/teachers/show', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'slug' => $teacher->slug,
                'bio' => $teacher->bio,
                'initials' => mb_strtoupper(mb_substr($teacher->name, 0, 1)),
                'courses_count' => $courses->count(),
            ],
            'courses' => $courses,
        ]);
    }
}
