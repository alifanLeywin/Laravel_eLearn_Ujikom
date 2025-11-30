<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(QuestionRequest $request, Course $course, Module $module, Lesson $lesson, Quiz $quiz): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson, $quiz);

        Question::create([
            'quiz_id' => $quiz->id,
            'type' => $request->validated('type'),
            'question_text' => $request->validated('question_text'),
            'options' => $request->validated('options'),
            'score' => $request->validated('score'),
        ]);

        return back()->with('success', 'Question created.');
    }

    public function update(QuestionRequest $request, Course $course, Module $module, Lesson $lesson, Quiz $quiz, Question $question): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson, $quiz, $question);

        $question->update([
            'type' => $request->validated('type'),
            'question_text' => $request->validated('question_text'),
            'options' => $request->validated('options'),
            'score' => $request->validated('score'),
        ]);

        return back()->with('success', 'Question updated.');
    }

    public function destroy(Course $course, Module $module, Lesson $lesson, Quiz $quiz, Question $question): RedirectResponse
    {
        $this->ensureCourseAccess(request(), $course);
        $this->ensureHierarchy($course, $module, $lesson, $quiz, $question);

        $question->delete();

        return back()->with('success', 'Question deleted.');
    }

    private function ensureHierarchy(Course $course, Module $module, Lesson $lesson, Quiz $quiz, ?Question $question = null): void
    {
        if ($module->course_id !== $course->id || $lesson->module_id !== $module->id || $quiz->lesson_id !== $lesson->id) {
            abort(404);
        }

        if ($question && $question->quiz_id !== $quiz->id) {
            abort(404);
        }
    }

    private function ensureCourseAccess(Request $request, Course $course): void
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }
    }
}
