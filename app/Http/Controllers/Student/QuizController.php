<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentQuizSubmitRequest;
use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function show(Request $request, Course $course, Lesson $lesson): Response
    {
        $user = $request->user();

        $this->ensureEnrollment($user?->id, $course->id);
        $this->ensureLessonBelongsToCourse($lesson, $course);

        $quiz = $lesson->quiz()->with(['questions'])->firstOrFail();

        $attempts = $quiz->attempts()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (QuizAttempt $attempt) {
                return [
                    'id' => $attempt->id,
                    'score' => $attempt->score,
                    'passed' => $attempt->passed,
                    'submitted_at' => $attempt->submitted_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('student/quiz', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
            ],
            'quiz' => [
                'id' => $quiz->id,
                'time_limit' => $quiz->time_limit,
                'passing_grade' => $quiz->passing_grade,
                'questions' => $quiz->questions->map(function ($question) {
                    return [
                        'id' => $question->id,
                        'question_text' => $question->question_text,
                        'type' => $question->type,
                        'score' => $question->score,
                        'choices' => collect($question->options['choices'] ?? [])->map(function ($choice) {
                            return [
                                'label' => $choice['label'] ?? '',
                                'value' => $choice['value'] ?? '',
                            ];
                        })->values(),
                    ];
                }),
            ],
            'attempts' => $attempts,
        ]);
    }

    public function submit(StudentQuizSubmitRequest $request, Course $course, Lesson $lesson): RedirectResponse
    {
        $user = $request->user();

        $enrollmentId = $this->ensureEnrollment($user?->id, $course->id);
        $this->ensureLessonBelongsToCourse($lesson, $course);

        $quiz = $lesson->quiz()->with('questions')->firstOrFail();

        $answersInput = collect($request->validated('answers'));

        $score = 0;
        $storedAnswers = [];

        foreach ($quiz->questions as $question) {
            $provided = $answersInput->firstWhere('question_id', $question->id)['value'] ?? null;

            $storedAnswers[] = [
                'question_id' => $question->id,
                'value' => $provided,
            ];

            if ($question->type === 'multiple_choice') {
                $correct = data_get($question->options, 'answer');

                if ($correct !== null && $provided !== null && strtoupper((string) $provided) === strtoupper((string) $correct)) {
                    $score += $question->score ?? 0;
                }
            }
        }

        $passed = $quiz->passing_grade !== null ? $score >= $quiz->passing_grade : true;

        QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => $score,
            'passed' => $passed,
            'submitted_at' => now(),
            'answers' => $storedAnswers,
        ]);

        if ($enrollmentId) {
            CourseProgress::upsert(
                [
                    [
                        'id' => (string) Str::uuid(),
                        'enrollment_id' => $enrollmentId,
                        'lesson_id' => $lesson->id,
                        'completed_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                        'deleted_at' => null,
                    ],
                ],
                ['enrollment_id', 'lesson_id'],
                ['completed_at', 'updated_at', 'deleted_at']
            );
        }

        return back()->with('success', 'Jawaban kamu sudah dikirim.')->with('quiz_score', $score);
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
