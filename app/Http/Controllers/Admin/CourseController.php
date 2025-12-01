<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseStoreRequest;
use App\Http\Requests\CourseUpdateRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = [
            'search' => (string) $request->input('search', ''),
            'status' => (string) $request->input('status', ''),
        ];

        $courses = $this->baseCourseQuery($user)
            ->when(filled($filters['search']), function ($query) use ($filters) {
                $query->where(function ($builder) use ($filters) {
                    $builder
                        ->where('title', 'like', '%'.$filters['search'].'%')
                        ->orWhere('slug', 'like', '%'.$filters['search'].'%');
                });
            })
            ->when(filled($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->latest()
            ->get()
            ->values()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'cover_image' => $course->cover_image,
                'slug' => $course->slug,
                'status' => $course->status,
                'level' => $course->level,
                'teacher' => $course->teacher?->name,
                'category' => $course->category?->name,
                'modules_count' => $course->modules_count,
                'lessons_count' => $course->lessons_count,
            ]);

        return Inertia::render('admin/courses/index', [
            'courses' => $courses,
            'filters' => $filters,
            'teachers' => $this->teacherOptions($user),
            'tenants' => $this->tenantOptions($user),
            'categories' => $this->categoryOptions($user),
        ]);
    }

    public function trashed(Request $request): Response
    {
        $user = $request->user();

        $courses = $this->baseCourseQuery($user, onlyTrashed: true)
            ->latest('deleted_at')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status,
                'level' => $course->level,
                'teacher' => $course->teacher?->name,
                'deleted_at' => $course->deleted_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/courses/trashed', [
            'courses' => $courses,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/courses/create', [
            'teachers' => $this->teacherOptions($user),
            'tenants' => $this->tenantOptions($user),
            'categories' => $this->categoryOptions($user),
        ]);
    }

    public function show(Course $course): Response
    {
        $this->authorize('view', $course);

        $course->load([
            'modules.lessons' => fn ($query) => $query->orderBy('sort_order'),
            'modules.lessons.quiz.questions',
            'modules.lessons.assignment',
            'teacher:id,name',
            'category:id,name',
        ]);

        return Inertia::render('admin/courses/show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status,
                'level' => $course->level,
                'description' => $course->description,
                'teacher' => $course->teacher?->name,
                'category' => $course->category?->name,
            ],
            'modules' => $course->modules->map(fn ($module) => [
                'id' => $module->id,
                'title' => $module->title,
                'sort_order' => $module->sort_order,
                'lessons' => $module->lessons->map(fn ($lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'type' => $lesson->type,
                    'sort_order' => $lesson->sort_order,
                    'is_preview' => $lesson->is_preview,
                    'content' => $lesson->content,
                    'video_url' => $lesson->video_url,
                    'duration' => $lesson->duration,
                    'quiz' => $lesson->quiz ? [
                        'id' => $lesson->quiz->id,
                        'passing_grade' => $lesson->quiz->passing_grade,
                        'time_limit' => $lesson->quiz->time_limit,
                        'questions' => $lesson->quiz->questions->map(fn ($question) => [
                            'id' => $question->id,
                            'question_text' => $question->question_text,
                            'type' => $question->type,
                            'score' => $question->score,
                        ]),
                    ] : null,
                    'assignment' => $lesson->assignment ? [
                        'id' => $lesson->assignment->id,
                        'due_date' => $lesson->assignment->due_date?->toDateTimeString(),
                        'max_score' => $lesson->assignment->max_score,
                    ] : null,
                ]),
            ]),
        ]);
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);
        $user = request()->user();

        return Inertia::render('admin/courses/edit', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            'description' => $course->description,
            'cover_image' => $course->cover_image,
            'status' => $course->status,
            'level' => $course->level,
            'category_id' => $course->category_id,
            'tenant_id' => $course->tenant_id,
            'teacher_id' => $course->teacher_id,
            ],
            'teachers' => $this->teacherOptions($user),
            'tenants' => $this->tenantOptions($user),
            'categories' => $this->categoryOptions($user),
        ]);
    }

    public function store(CourseStoreRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $tenantId = $user?->role === UserRole::Teacher
            ? $user->tenant_id
            : ($data['tenant_id'] ?? $user?->tenant_id);

        if ($user?->role === UserRole::Teacher && ! $tenantId) {
            abort(403, 'Teacher must belong to a tenant.');
        }

        $teacherId = $data['teacher_id'] ?? ($user?->role === UserRole::Teacher ? $user->id : null);
        $coverImagePath = $this->storeCover($request);

        $course = Course::create([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['slug'] ?? Str::slug($data['title']), $tenantId),
            'description' => $data['description'] ?? null,
            'cover_image' => $coverImagePath,
            'tenant_id' => $tenantId,
            'teacher_id' => $teacherId,
            'category_id' => $data['category_id'] ?? null,
            'status' => $data['status'],
            'level' => $data['level'] ?? null,
            'published_at' => ($data['status'] === 'published')
                ? ($data['published_at'] ?? now())
                : null,
        ]);

        return redirect()->route('admin.courses.show', $course)->with('success', 'Course created.');
    }

    public function update(CourseUpdateRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $data = $request->validated();
        $coverImagePath = $this->storeCover($request, $course->cover_image);

        $course->update([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['slug'] ?? Str::slug($data['title']), $course->tenant_id, $course->id),
            'description' => $data['description'] ?? null,
            'cover_image' => $coverImagePath,
            'category_id' => $data['category_id'] ?? null,
            'status' => $data['status'],
            'level' => $data['level'] ?? null,
            'published_at' => ($data['status'] === 'published')
                ? ($data['published_at'] ?? $course->published_at ?? now())
                : null,
        ]);

        return back()->with('success', 'Course updated.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course deleted.');
    }

    public function restore(Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        if (! $course->trashed()) {
            $course = Course::withTrashed()->findOrFail($course->id);
        }

        $course->restore();

        return back()->with('success', 'Course restored.');
    }

    public function forceDestroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        if (! $course->trashed()) {
            $course = Course::withTrashed()->findOrFail($course->id);
        }

        $course->forceDelete();

        return back()->with('success', 'Course permanently deleted.');
    }

    private function teacherOptions(?User $user)
    {
        $query = User::query()->whereIn('role', [UserRole::Teacher, UserRole::Admin]);

        if ($user?->role === UserRole::Admin) {
            $query->where('tenant_id', $user->tenant_id);
        }
        if ($user?->role === UserRole::Teacher) {
            return $query->whereKey($user->id)->get(['id', 'name']);
        }

        return $query->get(['id', 'name']);
    }

    private function tenantOptions(?User $user)
    {
        if ($user?->role === UserRole::SuperAdmin) {
            return Tenant::query()->get(['id', 'name']);
        }

        return $user && $user->tenant_id
            ? Tenant::query()->whereKey($user->tenant_id)->get(['id', 'name'])
            : collect();
    }

    private function categoryOptions(?User $user)
    {
        return Category::query()
            ->when($user?->role === UserRole::Admin, fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->get(['id', 'name']);
    }

    private function uniqueSlug(string $baseSlug, ?string $tenantId, ?string $ignoreId = null): string
    {
        $slug = Str::slug($baseSlug) ?: Str::random(8);
        $original = $slug;
        $counter = 1;

        while (
            Course::query()
                ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $original.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function storeCover(Request $request, ?string $existingPath = null): ?string
    {
        if (! $request->hasFile('cover_image')) {
            return $existingPath;
        }

        if ($existingPath) {
            Storage::disk('public')->delete($existingPath);
        }

        return $request->file('cover_image')->store('courses', 'public');
    }

    private function baseCourseQuery(?User $user, bool $onlyTrashed = false): Builder
    {
        $query = Course::query()
            ->with(['teacher:id,name', 'category:id,name'])
            ->withCount(['modules', 'lessons']);

        if ($onlyTrashed) {
            $query->onlyTrashed();
        }

        return $query
            ->when($user?->role === UserRole::Admin, fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->when($user?->role === UserRole::Teacher, fn ($q) => $q->where('teacher_id', $user->id));
    }
}
