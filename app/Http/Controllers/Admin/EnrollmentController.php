<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnrollmentStoreRequest;
use App\Http\Requests\EnrollmentUpdateRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentController extends Controller
{
    public function store(EnrollmentStoreRequest $request, Course $course): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);

        $data = $request->validated();
        $user = User::query()
            ->whereKey($data['user_id'])
            ->when($course->tenant_id, fn ($query) => $query->where('tenant_id', $course->tenant_id))
            ->firstOrFail();

        DB::transaction(function () use ($course, $user, $data) {
            Enrollment::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                ],
                [
                    'status' => $data['status'] ?? 'active',
                    'enrolled_at' => now(),
                ],
            );
        });

        return back()->with('success', 'Enrollment saved.');
    }

    public function update(EnrollmentUpdateRequest $request, Course $course, Enrollment $enrollment): RedirectResponse
    {
        $this->ensureCourseAccess($request, $course);

        if ($enrollment->course_id !== $course->id) {
            abort(404);
        }

        $enrollment->update([
            'status' => $request->validated('status'),
        ]);

        return back()->with('success', 'Enrollment updated.');
    }

    public function destroy(Course $course, Enrollment $enrollment): RedirectResponse
    {
        $this->ensureCourseAccess(request(), $course);

        if ($enrollment->course_id !== $course->id) {
            abort(404);
        }

        $enrollment->delete();

        return back()->with('success', 'Enrollment removed.');
    }

    private function ensureCourseAccess(Request $request, Course $course): void
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }
    }
}
