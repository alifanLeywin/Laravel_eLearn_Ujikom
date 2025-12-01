<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentAssignmentSubmitRequest;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function show(Request $request, Course $course, Lesson $lesson): Response
    {
        $user = $request->user();

        $this->ensureEnrollment($user?->id, $course->id);
        $this->ensureLessonBelongsToCourse($lesson, $course);

        $assignment = $lesson->assignment;

        if (! $assignment) {
            abort(404);
        }

        $latestSubmission = $assignment->submissions()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('student/assignment', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
            ],
            'assignment' => [
                'id' => $assignment->id,
                'due_date' => $assignment->due_date?->toDateTimeString(),
                'max_score' => $assignment->max_score,
            ],
            'submission' => $latestSubmission ? [
                'id' => $latestSubmission->id,
                'file_url' => $latestSubmission->file_path ? Storage::disk('public')->url($latestSubmission->file_path) : null,
                'grade' => $latestSubmission->grade,
                'feedback_text' => $latestSubmission->feedback_text,
                'submitted_at' => $latestSubmission->submitted_at?->toDateTimeString(),
            ] : null,
        ]);
    }

    public function submit(StudentAssignmentSubmitRequest $request, Course $course, Lesson $lesson): RedirectResponse
    {
        $user = $request->user();

        $enrollmentId = $this->ensureEnrollment($user?->id, $course->id);
        $this->ensureLessonBelongsToCourse($lesson, $course);

        /** @var Assignment|null $assignment */
        $assignment = $lesson->assignment;

        if (! $assignment) {
            abort(404);
        }

        $path = $request->file('file')->store('submissions', 'public');

        Submission::create([
            'assignment_id' => $assignment->id,
            'user_id' => $user->id,
            'file_path' => $path,
            'submitted_at' => now(),
        ]);

        if ($enrollmentId) {
            CourseProgress::updateOrCreate(
                [
                    'enrollment_id' => $enrollmentId,
                    'lesson_id' => $lesson->id,
                ],
                [
                    'completed_at' => now(),
                ],
            );
        }

        return back()->with('success', 'Tugas berhasil dikumpulkan.');
    }

    private function ensureEnrollment(?string $userId, string $courseId): ?string
    {
        if (! $userId) {
            abort(403, 'Anda belum terdaftar di course ini.');
        }

        $enrollment = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->first();

        if (! $enrollment) {
            abort(403, 'Anda belum terdaftar di course ini.');
        }

        return $enrollment->id;
    }

    private function isEnrolled(string $userId, string $courseId): bool
    {
        return \App\Models\Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->exists();
    }

    private function ensureLessonBelongsToCourse(Lesson $lesson, Course $course): void
    {
        if ($lesson->module?->course_id !== $course->id) {
            abort(404);
        }
    }
}
