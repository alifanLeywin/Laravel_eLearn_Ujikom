<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleDashboardTest extends TestCase
{
    /**
     * This trait refreshes the database.
     */
    use RefreshDatabase;

    public function test_public_home_page_renders(): void
    {
        $this->get(route('home'))->assertOk();
    }

    public function test_dashboard_redirects_admin_to_admin_panel(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_dashboard_redirects_teacher_to_teacher_panel(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertRedirect(route('teacher.dashboard', absolute: false));
    }

    public function test_dashboard_redirects_student_to_student_panel(): void
    {
        $student = User::factory()->student()->create();

        $this->actingAs($student)
            ->get(route('dashboard'))
            ->assertRedirect(route('student.dashboard', absolute: false));
    }

    public function test_admin_dashboard_requires_admin_role(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->student()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk();

        $this->actingAs($student)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }
}
