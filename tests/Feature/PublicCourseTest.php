<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_published_course_detail(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create([
            'status' => 'published',
            'title' => 'Public Course',
        ]);

        $this->get(route('courses.show', $course->slug))
            ->assertOk()
            ->assertSee('Public Course');
    }

    public function test_authenticated_user_can_self_enroll(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $student = User::factory()->student()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create([
            'status' => 'published',
        ]);

        $this->actingAs($student)
            ->post(route('courses.enroll', $course->slug))
            ->assertRedirect();

        $this->assertDatabaseHas(Enrollment::class, [
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_courses_index_lists_published_courses(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create([
            'status' => 'published',
            'title' => 'List Course',
        ]);

        $this->get(route('courses.index'))
            ->assertOk()
            ->assertSee('List Course');
    }

    public function test_teacher_cannot_enroll(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create([
            'status' => 'published',
        ]);

        $this->actingAs($teacher)
            ->post(route('courses.enroll', $course->slug))
            ->assertForbidden();

        $this->assertDatabaseMissing(Enrollment::class, [
            'user_id' => $teacher->id,
            'course_id' => $course->id,
        ]);
    }
}
