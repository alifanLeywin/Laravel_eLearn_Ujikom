<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignmentRequest;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function store(AssignmentRequest $request, Course $course, Module $module, Lesson $lesson): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson);

        Assignment::create([
            'lesson_id' => $lesson->id,
            'due_date' => $request->validated('due_date'),
            'max_score' => $request->validated('max_score'),
        ]);

        return back()->with('success', 'Assignment created.');
    }

    public function update(AssignmentRequest $request, Course $course, Module $module, Lesson $lesson, Assignment $assignment): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);
        $this->ensureHierarchy($course, $module, $lesson, $assignment);

        $assignment->update([
            'due_date' => $request->validated('due_date'),
            'max_score' => $request->validated('max_score'),
        ]);

        return back()->with('success', 'Assignment updated.');
    }

    public function destroy(Course $course, Module $module, Lesson $lesson, Assignment $assignment): RedirectResponse
    {
        $this->ensureCourseAccess(request(), $course);
        $this->ensureHierarchy($course, $module, $lesson, $assignment);

        $assignment->delete();

        return back()->with('success', 'Assignment deleted.');
    }

    private function ensureHierarchy(Course $course, Module $module, Lesson $lesson, ?Assignment $assignment = null): void
    {
        if ($module->course_id !== $course->id || $lesson->module_id !== $module->id) {
            abort(404);
        }

        if ($assignment && $assignment->lesson_id !== $lesson->id) {
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
