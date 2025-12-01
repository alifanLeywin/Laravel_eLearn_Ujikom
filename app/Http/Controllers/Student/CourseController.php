<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function show(Request $request, Course $course): Response
    {
        $enrollment = Enrollment::query()
            ->where('course_id', $course->id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (! $enrollment) {
            abort(403, 'Anda belum terdaftar di course ini.');
        }

        $completedLessonIds = CourseProgress::query()
            ->where('enrollment_id', $enrollment->id)
            ->pluck('lesson_id')
            ->all();

        $course->load([
            'modules' => fn ($query) => $query->orderBy('sort_order'),
            'modules.lessons' => fn ($query) => $query->orderBy('sort_order'),
            'modules.lessons.quiz.questions',
            'modules.lessons.assignment',
            'teacher',
        ]);

        $quizIds = $course->modules
            ->flatMap->lessons
            ->pluck('quiz.id')
            ->filter()
            ->values();

        $assignmentIds = $course->modules
            ->flatMap->lessons
            ->pluck('assignment.id')
            ->filter()
            ->values();

        $quizAttemptsByQuiz = QuizAttempt::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('quiz_id', $quizIds)
            ->latest()
            ->get()
            ->groupBy('quiz_id');

        $submissionsByAssignment = Submission::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->latest()
            ->get()
            ->groupBy('assignment_id');

        $totalLessons = $course->modules->flatMap->lessons->count();

        return Inertia::render('student/course', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'cover_image' => $course->cover_image,
                'teacher' => [
                    'name' => $course->teacher?->name,
                ],
            ],
            'modules' => $course->modules->map(function ($module) use ($completedLessonIds, $quizAttemptsByQuiz, $submissionsByAssignment) {
                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'lessons' => $module->lessons->map(function (Lesson $lesson) use ($completedLessonIds, $quizAttemptsByQuiz, $submissionsByAssignment) {
                        $latestAttempt = $lesson->quiz ? optional($quizAttemptsByQuiz->get($lesson->quiz->id))->first() : null;
                        $latestSubmission = $lesson->assignment ? optional($submissionsByAssignment->get($lesson->assignment->id))->first() : null;

                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'content' => $lesson->content,
                            'type' => $lesson->type,
                            'is_preview' => $lesson->is_preview,
                            'sort_order' => $lesson->sort_order,
                            'video_url' => $lesson->video_url,
                            'duration' => $lesson->duration,
                            'completed' => in_array($lesson->id, $completedLessonIds, true),
                            'quiz' => $lesson->quiz ? [
                                'id' => $lesson->quiz->id,
                                'passing_grade' => $lesson->quiz->passing_grade,
                                'time_limit' => $lesson->quiz->time_limit,
                                'questions_count' => $lesson->quiz->questions->count(),
                                'last_attempt' => $latestAttempt ? [
                                    'score' => $latestAttempt->score,
                                    'passed' => $latestAttempt->passed,
                                    'submitted_at' => $latestAttempt->submitted_at?->toDateTimeString(),
                                ] : null,
                            ] : null,
                            'assignment' => $lesson->assignment ? [
                                'id' => $lesson->assignment->id,
                                'due_date' => $lesson->assignment->due_date?->toDateTimeString(),
                                'max_score' => $lesson->assignment->max_score,
                                'submission' => $latestSubmission ? [
                                    'submitted_at' => $latestSubmission->submitted_at?->toDateTimeString(),
                                    'grade' => $latestSubmission->grade,
                                    'feedback_text' => $latestSubmission->feedback_text,
                                ] : null,
                            ] : null,
                        ];
                    }),
                ];
            }),
            'progress' => [
                'total_lessons' => $totalLessons,
                'completed_lessons' => count($completedLessonIds),
                'percentage' => $totalLessons > 0 ? (int) floor(count($completedLessonIds) / $totalLessons * 100) : 0,
            ],
        ]);
    }

    public function complete(Request $request, Course $course, Lesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::query()
            ->where('course_id', $course->id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (! $enrollment || $lesson->module?->course_id !== $course->id) {
            abort(403, 'Tidak dapat menyelesaikan lesson ini.');
        }

        $progress = CourseProgress::withTrashed()->firstOrNew([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->completed_at = now();
        $progress->deleted_at = null;
        $progress->save();

        return back()->with('success', 'Lesson ditandai selesai.');
    }

    public function incomplete(Request $request, Course $course, Lesson $lesson): RedirectResponse
    {
        $enrollment = Enrollment::query()
            ->where('course_id', $course->id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (! $enrollment || $lesson->module?->course_id !== $course->id) {
            abort(403, 'Tidak dapat membatalkan lesson ini.');
        }

        CourseProgress::query()
            ->where('enrollment_id', $enrollment->id)
            ->where('lesson_id', $lesson->id)
            ->delete();

        return back()->with('success', 'Lesson dibatalkan selesai.');
    }
}
