<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;

class LessonController extends Controller
{
    public function store(LessonRequest $request, Course $course, Module $module): RedirectResponse
    {
        $this->authorize('update', $course);

        Lesson::create([
            'module_id' => $module->id,
            'title' => $request->validated('title'),
            'type' => $request->validated('type'),
            'content' => $request->validated('content'),
            'video_url' => $request->validated('video_url'),
            'duration' => $request->validated('duration'),
            'is_preview' => $request->validated('is_preview') ?? false,
            'sort_order' => $request->validated('sort_order') ?? 0,
        ]);

        return back()->with('success', 'Lesson created.');
    }

    public function update(LessonRequest $request, Course $course, Module $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('update', $course);

        $lesson->update([
            'title' => $request->validated('title'),
            'type' => $request->validated('type'),
            'content' => $request->validated('content'),
            'video_url' => $request->validated('video_url'),
            'duration' => $request->validated('duration'),
            'is_preview' => $request->validated('is_preview') ?? false,
            'sort_order' => $request->validated('sort_order') ?? 0,
        ]);

        return back()->with('success', 'Lesson updated.');
    }

    public function destroy(Course $course, Module $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('delete', $course);

        $lesson->delete();

        return back()->with('success', 'Lesson deleted.');
    }
}
