<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\GradeSubmissionRequest;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function update(GradeSubmissionRequest $request, Course $course, Submission $submission): RedirectResponse
    {
        $user = $request->user();

        if ($course->teacher_id !== $user?->id || $submission->assignment?->lesson?->module?->course_id !== $course->id) {
            abort(403);
        }

        $submission->update([
            'grade' => $request->validated('grade'),
            'feedback_text' => $request->validated('feedback_text'),
        ]);

        return back()->with('success', 'Nilai dan feedback tersimpan.');
    }
}
