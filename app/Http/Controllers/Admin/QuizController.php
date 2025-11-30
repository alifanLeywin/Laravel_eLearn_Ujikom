<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuizRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function store(QuizRequest $request, Course $course, Module $module, Lesson $lesson): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson);

        Quiz::create([
            'lesson_id' => $lesson->id,
            'time_limit' => $request->validated('time_limit'),
            'passing_grade' => $request->validated('passing_grade'),
        ]);

        return back()->with('success', 'Quiz created.');
    }

    public function update(QuizRequest $request, Course $course, Module $module, Lesson $lesson, Quiz $quiz): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson, $quiz);

        $quiz->update([
            'time_limit' => $request->validated('time_limit'),
            'passing_grade' => $request->validated('passing_grade'),
        ]);

        return back()->with('success', 'Quiz updated.');
    }

    public function destroy(Course $course, Module $module, Lesson $lesson, Quiz $quiz): RedirectResponse
    {
        $this->ensureCourseAccess(request(), $course);
        $this->ensureHierarchy($course, $module, $lesson, $quiz);

        $quiz->delete();

        return back()->with('success', 'Quiz deleted.');
    }

    private function ensureHierarchy(Course $course, Module $module, Lesson $lesson, ?Quiz $quiz = null): void
    {
        if ($module->course_id !== $course->id || $lesson->module_id !== $module->id) {
            abort(404);
        }

        if ($quiz && $quiz->lesson_id !== $lesson->id) {
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
