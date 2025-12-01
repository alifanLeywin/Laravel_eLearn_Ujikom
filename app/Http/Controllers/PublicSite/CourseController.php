<?php

namespace App\Http\Controllers\PublicSite;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\CourseComment;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $categoryId = (string) $request->input('category_id', '');

        $courses = Course::query()
            ->where('status', 'published')
            ->with(['teacher:id,name', 'category:id,name'])
            ->when(filled($search), fn ($query) => $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            }))
            ->when(filled($categoryId), fn ($query) => $query->where('category_id', $categoryId))
            ->latest()
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
                'description' => $course->description,
                'cover_image' => $course->cover_image,
                'level' => $course->level,
                'status' => $course->status,
                'teacher' => $course->teacher?->name,
                'category' => $course->category?->name,
            ]);

        $categories = Category::query()
            ->latest()
            ->get(['id', 'name']);

        return Inertia::render('public/courses/index', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        $course->load(['teacher:id,name', 'category:id,name']);

        if ($course->status !== 'published' && ! $this->canViewUnpublished($request->user(), $course)) {
            abort(404);
        }

        $enrollment = null;
        if ($request->user()) {
            $enrollment = Enrollment::query()
                ->where('course_id', $course->id)
                ->where('user_id', $request->user()->id)
                ->first(['id', 'status']);
        }

        $comments = CourseComment::query()
            ->where('course_id', $course->id)
            ->latest()
            ->with('user:id,name')
            ->get()
            ->map(fn (CourseComment $comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'user' => $comment->user?->name,
                'user_id' => $comment->user_id,
                'created_at' => $comment->created_at?->toDateTimeString(),
                'can_edit' => $request->user()?->id === $comment->user_id,
            ]);

        return Inertia::render('public/course', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status,
                'description' => $course->description,
                'cover_image' => $course->cover_image,
                'level' => $course->level,
                'teacher' => $course->teacher?->name,
                'teacher_slug' => $course->teacher?->slug,
                'category' => $course->category?->name,
                'modules_count' => $course->modules()->count(),
                'lessons_count' => $course->lessons()->count(),
            ],
            'enrollment' => $enrollment,
            'comments' => $comments,
        ]);
    }

    public function enroll(Request $request, Course $course): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->role !== UserRole::Student) {
            abort(403, 'Only students can enroll.');
        }

        if ($course->status !== 'published' && ! $this->canViewUnpublished($user, $course)) {
            abort(403);
        }

        Enrollment::updateOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'status' => 'active',
                'enrolled_at' => now(),
            ],
        );

        return back()->with('success', 'Enrolled to course.');
    }

    public function unenroll(Request $request, Course $course): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->role !== UserRole::Student) {
            abort(403, 'Only students can unenroll.');
        }

        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($enrollment) {
            $enrollment->delete();
        }

        return back()->with('success', 'Kamu telah keluar dari course ini.');
    }

    private function canViewUnpublished(?User $user, Course $course): bool
    {
        return $user?->role === \App\Enums\UserRole::SuperAdmin
            || ($user?->role === \App\Enums\UserRole::Admin && $user->tenant_id === $course->tenant_id)
            || ($user?->role === \App\Enums\UserRole::Teacher && $course->teacher_id === $user->id);
    }
}
