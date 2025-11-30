<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_enroll_update_and_remove_student(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $student = User::factory()->student()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create();

        $this->actingAs($admin)
            ->post(route('admin.enrollments.store', $course), [
                'user_id' => $student->id,
            ])
            ->assertRedirect();

        $enrollment = Enrollment::firstOrFail();
        $this->assertSame('active', $enrollment->status);

        $this->actingAs($admin)
            ->put(route('admin.enrollments.update', [$course, $enrollment]), [
                'status' => 'completed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas(Enrollment::class, [
            'id' => $enrollment->id,
            'status' => 'completed',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.enrollments.destroy', [$course, $enrollment]))
            ->assertRedirect();

        $this->assertSoftDeleted($enrollment);
    }
}
