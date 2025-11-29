<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoursePolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_update_any_course(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $course = Course::factory()->create();

        $this->assertTrue($superAdmin->can('update', $course));
    }

    public function test_admin_can_update_course_in_same_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->create();

        $this->assertTrue($admin->can('update', $course));
    }

    public function test_admin_cannot_update_course_in_other_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $admin = User::factory()->admin()->for($tenant)->create();
        $course = Course::factory()->for($otherTenant)->create();

        $this->assertFalse($admin->can('update', $course));
    }

    public function test_teacher_can_update_own_course_only(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $otherTeacher = User::factory()->teacher()->for($tenant)->create();

        $ownCourse = Course::factory()->for($tenant)->for($teacher, 'teacher')->create();
        $otherCourse = Course::factory()->for($tenant)->for($otherTeacher, 'teacher')->create();

        $this->assertTrue($teacher->can('update', $ownCourse));
        $this->assertFalse($teacher->can('update', $otherCourse));
    }
}
