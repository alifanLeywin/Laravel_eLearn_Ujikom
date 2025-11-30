<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseCommentRequest;
use App\Models\Course;
use App\Models\CourseComment;
use App\Models\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourseCommentController extends Controller
{
    public function store(CourseCommentRequest $request, Course $course): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $this->isEnrolled($user->id, $course->id)) {
            abort(403);
        }

        CourseComment::create([
            'course_id' => $course->id,
            'user_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function update(CourseCommentRequest $request, Course $course, CourseComment $comment): RedirectResponse
    {
        $user = $request->user();

        if (! $user || $comment->user_id !== $user->id || $comment->course_id !== $course->id) {
            abort(403);
        }

        $comment->update([
            'body' => $request->validated('body'),
        ]);

        return back()->with('success', 'Comment updated.');
    }

    public function destroy(Request $request, Course $course, CourseComment $comment): RedirectResponse
    {
        $user = $request->user();

        if (! $user || $comment->user_id !== $user->id || $comment->course_id !== $course->id) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }

    private function isEnrolled(string $userId, string $courseId): bool
    {
        return Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->exists();
    }
}
