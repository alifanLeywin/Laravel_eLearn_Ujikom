<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModuleRequest;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;

class ModuleController extends Controller
{
    public function store(ModuleRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        Module::create([
            'course_id' => $course->id,
            'title' => $request->validated('title'),
            'sort_order' => $request->validated('sort_order') ?? 0,
        ]);

        return back()->with('success', 'Module created.');
    }

    public function update(ModuleRequest $request, Course $course, Module $module): RedirectResponse
    {
        $this->authorize('update', $course);

        $module->update([
            'title' => $request->validated('title'),
            'sort_order' => $request->validated('sort_order') ?? 0,
        ]);

        return back()->with('success', 'Module updated.');
    }

    public function destroy(Course $course, Module $module): RedirectResponse
    {
        $this->authorize('delete', $course);

        $module->delete();

        return back()->with('success', 'Module deleted.');
    }
}
