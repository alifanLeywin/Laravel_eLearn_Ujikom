<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $tenantId = $request->user()?->tenant_id;

        $courseCount = Course::query()
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->count();

        $studentCount = User::query()
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where('role', UserRole::Student)
            ->count();

        $teacherCount = User::query()
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where('role', UserRole::Teacher)
            ->count();

        $activeEnrollments = Enrollment::query()
            ->where('status', 'active')
            ->when($tenantId, fn ($query) => $query->whereHas('course', fn ($course) => $course->where('tenant_id', $tenantId)))
            ->count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'courses' => $courseCount,
                'students' => $studentCount,
                'teachers' => $teacherCount,
                'activeEnrollments' => $activeEnrollments,
            ],
        ]);
    }
}
