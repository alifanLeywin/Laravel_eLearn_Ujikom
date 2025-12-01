<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentProgressController extends Controller
{
    public function __invoke(Request $request, Course $course, Enrollment $enrollment): Response
    {
        $user = $request->user();

        if ($course->teacher_id !== $user?->id || $enrollment->course_id !== $course->id) {
            abort(403);
        }

        $course->load([
            'modules' => fn ($query) => $query->orderBy('sort_order'),
            'modules.lessons' => fn ($query) => $query->orderBy('sort_order'),
            'modules.lessons.assignment',
            'modules.lessons.quiz',
        ]);

        $progressIds = $enrollment->progress()->pluck('lesson_id')->all();

        $assignmentSubmissions = Submission::query()
            ->where('user_id', $enrollment->user_id)
            ->whereHas('assignment.lesson.module.course', fn ($query) => $query->where('id', $course->id))
            ->get()
            ->keyBy('assignment_id');

        $quizAttempts = QuizAttempt::query()
            ->where('user_id', $enrollment->user_id)
            ->whereHas('quiz.lesson.module.course', fn ($query) => $query->where('id', $course->id))
            ->latest('submitted_at')
            ->get()
            ->groupBy('quiz_id');

        $lessons = $course->modules->flatMap->lessons->map(function (Lesson $lesson) use ($progressIds, $assignmentSubmissions, $quizAttempts) {
            $submission = $lesson->assignment ? $assignmentSubmissions->get($lesson->assignment->id) : null;
            $attempt = $lesson->quiz ? optional($quizAttempts->get($lesson->quiz->id))->first() : null;

            return [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'type' => $lesson->type,
                'module' => $lesson->module?->title,
                'completed' => in_array($lesson->id, $progressIds, true),
                'assignment' => $submission ? [
                    'grade' => $submission->grade,
                    'feedback_text' => $submission->feedback_text,
                    'submitted_at' => $submission->submitted_at?->toDateTimeString(),
                ] : null,
                'quiz' => $attempt ? [
                    'score' => $attempt->score,
                    'passed' => $attempt->passed,
                    'submitted_at' => $attempt->submitted_at?->toDateTimeString(),
                ] : null,
            ];
        });

        return Inertia::render('teacher/courses/student-progress', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'level' => $course->level,
            ],
            'student' => [
                'id' => $enrollment->user?->id,
                'name' => $enrollment->user?->name,
                'email' => $enrollment->user?->email,
            ],
            'lessons' => $lessons,
        ]);
    }
}
