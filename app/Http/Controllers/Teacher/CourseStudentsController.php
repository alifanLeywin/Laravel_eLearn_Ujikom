<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseStudentsController extends Controller
{
    public function __invoke(Request $request, Course $course): Response
    {
        $user = $request->user();

        if ($course->teacher_id !== $user?->id) {
            abort(403);
        }

        $totalLessons = $course->lessons()->count();

        $enrollments = Enrollment::query()
            ->where('course_id', $course->id)
            ->with(['user:id,name,email', 'progress'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Enrollment $enrollment) use ($totalLessons) {
                $completed = $enrollment->progress->count();
                $progress = $totalLessons > 0 ? (int) round($completed / $totalLessons * 100) : 0;

                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'user' => [
                        'id' => $enrollment->user?->id,
                        'name' => $enrollment->user?->name,
                        'email' => $enrollment->user?->email,
                    ],
                    'progress' => $progress,
                    'completed' => $completed,
                    'total_lessons' => $totalLessons,
                ];
            });

        $submissions = Submission::query()
            ->whereHas('assignment.lesson.module.course', fn ($query) => $query->where('id', $course->id))
            ->with(['user:id,name,email', 'assignment:id,lesson_id,max_score', 'assignment.lesson:id,title'])
            ->latest('submitted_at')
            ->limit(25)
            ->get()
            ->map(function (Submission $submission) {
                return [
                    'id' => $submission->id,
                    'user' => [
                        'id' => $submission->user?->id,
                        'name' => $submission->user?->name,
                        'email' => $submission->user?->email,
                    ],
                    'assignment' => [
                        'id' => $submission->assignment?->id,
                        'lesson' => $submission->assignment?->lesson?->title,
                        'max_score' => $submission->assignment?->max_score,
                    ],
                    'grade' => $submission->grade,
                    'feedback_text' => $submission->feedback_text,
                    'submitted_at' => $submission->submitted_at?->toDateTimeString(),
                    'file_url' => $submission->file_path ? \Storage::disk('public')->url($submission->file_path) : null,
                ];
            });

        return Inertia::render('teacher/courses/students', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'level' => $course->level,
                'status' => $course->status,
            ],
            'enrollments' => $enrollments,
            'submissions' => $submissions,
        ]);
    }
}
