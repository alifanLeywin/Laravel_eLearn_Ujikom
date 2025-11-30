<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TeacherStoreRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $teachers = User::query()
            ->where('role', \App\Enums\UserRole::Teacher)
            ->when(
                $user?->role === \App\Enums\UserRole::Admin,
                fn ($query) => $query->where('tenant_id', $user->tenant_id),
            )
            ->with('tenant:id,name')
            ->withCount('taughtCourses')
            ->latest()
            ->get()
            ->map(fn (User $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'tenant' => $teacher->tenant?->name,
                'courses_count' => $teacher->taught_courses_count,
                'created_at' => $teacher->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/teachers/index', [
            'teachers' => $teachers,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        $tenants = $user?->role === \App\Enums\UserRole::SuperAdmin
            ? Tenant::query()->get(['id', 'name'])
            : ($user && $user->tenant_id
                ? Tenant::query()->whereKey($user->tenant_id)->get(['id', 'name'])
                : collect());

        return Inertia::render('admin/teachers/create', [
            'tenants' => $tenants,
        ]);
    }

    public function store(TeacherStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $creator = $request->user();

        $tenantId = $creator?->role === \App\Enums\UserRole::SuperAdmin
            ? $data['tenant_id'] ?? null
            : $creator?->tenant_id;

        User::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => \App\Enums\UserRole::Teacher,
            'bio' => $data['bio'] ?? null,
        ]);

        return redirect()->route('admin.courses.index')->with('success', 'Teacher created.');
    }

    public function destroy(Request $request, User $teacher): RedirectResponse
    {
        $user = $request->user();

        if ($teacher->role !== \App\Enums\UserRole::Teacher) {
            abort(404);
        }

        if ($user?->role === \App\Enums\UserRole::Admin && $teacher->tenant_id !== $user->tenant_id) {
            abort(403);
        }

        $teacher->delete();

        return back()->with('success', 'Teacher deleted.');
    }
}
