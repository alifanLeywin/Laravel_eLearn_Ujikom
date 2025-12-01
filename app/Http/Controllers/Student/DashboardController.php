<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
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

        $enrollments = Enrollment::query()
            ->where('user_id', $user->id)
            ->with(['course', 'progress'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(function (Enrollment $enrollment) {
                $lessonCount = $enrollment->course?->lessons()->count() ?? 0;
                $completedCount = $enrollment->progress->count();
                $progress = $lessonCount > 0 ? (int) round(($completedCount / $lessonCount) * 100) : 0;

                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'course' => [
                        'id' => $enrollment->course?->id,
                        'title' => $enrollment->course?->title,
                        'level' => $enrollment->course?->level,
                        'slug' => $enrollment->course?->slug,
                    ],
                    'progress' => $progress,
                ];
            });

        return Inertia::render('student/dashboard', [
            'enrollments' => $enrollments,
        ]);
    }
}
