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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $courses = Course::query()
            ->with(['teacher:id,name', 'category:id,name'])
            ->withCount(['modules', 'lessons'])
            ->when(filled($filters['search']), function ($query) use ($filters) {
                $query->where(function ($builder) use ($filters) {
                    $builder
                        ->where('title', 'like', '%'.$filters['search'].'%')
                        ->orWhere('slug', 'like', '%'.$filters['search'].'%');
                });
            })
            ->when(filled($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when($user?->role === UserRole::Admin, fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->when($user?->role === UserRole::Teacher, fn ($query) => $query->where('teacher_id', $user->id))
            ->latest()
            ->get()
            ->values()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
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

        $course = Course::create([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['slug'] ?? Str::slug($data['title']), $tenantId),
            'description' => $data['description'] ?? null,
            'tenant_id' => $tenantId,
            'teacher_id' => $teacherId,
            'category_id' => $data['category_id'] ?? null,
            'status' => $data['status'],
            'level' => $data['level'] ?? null,
        ]);

        return redirect()->route('admin.courses.show', $course)->with('success', 'Course created.');
    }

    public function update(CourseUpdateRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $data = $request->validated();

        $course->update([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['slug'] ?? Str::slug($data['title']), $course->tenant_id, $course->id),
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'status' => $data['status'],
            'level' => $data['level'] ?? null,
        ]);

        return back()->with('success', 'Course updated.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course deleted.');
    }

    private function teacherOptions(?User $user)
    {
        $query = User::query()->whereIn('role', [UserRole::Teacher, UserRole::Admin]);

        if ($user?->role === UserRole::Admin) {
            $query->where('tenant_id', $user->tenant_id);
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
}
