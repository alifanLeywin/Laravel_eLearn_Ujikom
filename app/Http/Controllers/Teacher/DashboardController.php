<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $courses = Course::query()
            ->where('teacher_id', $user->id)
            ->withCount('enrollments')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'status' => $course->status,
                'level' => $course->level,
                'published_at' => $course->published_at?->toDateString(),
                'enrollments_count' => $course->enrollments_count,
            ]);

        $totalEnrollments = Course::query()
            ->where('teacher_id', $user->id)
            ->withCount('enrollments')
            ->get()
            ->sum('enrollments_count');

        $lessons = Lesson::query()
            ->whereHas('module.course', fn ($query) => $query->where('teacher_id', $user->id))
            ->with('module.course:id,title')
            ->orderBy('sort_order')
            ->limit(6)
            ->get()
            ->map(fn (Lesson $lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'type' => $lesson->type,
                'course' => $lesson->module?->course?->title,
                'is_preview' => $lesson->is_preview,
            ]);

        return Inertia::render('teacher/dashboard', [
            'courses' => $courses,
            'lessons' => $lessons,
            'metrics' => [
                'courses_count' => $courses->count(),
                'enrollments_count' => $totalEnrollments,
            ],
        ]);
    }
}
