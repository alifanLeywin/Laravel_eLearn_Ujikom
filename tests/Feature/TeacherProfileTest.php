<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_profile_shows_only_their_courses(): void
    {
        $tenant = Tenant::factory()->create();
        $teacherA = User::factory()->teacher()->for($tenant)->create(['name' => 'Teacher A']);
        $teacherB = User::factory()->teacher()->for($tenant)->create(['name' => 'Teacher B']);
        Course::factory()->for($tenant)->for($teacherA, 'teacher')->create(['title' => 'Course A', 'status' => 'published']);
        Course::factory()->for($tenant)->for($teacherB, 'teacher')->create(['title' => 'Course B', 'status' => 'published']);

        $this->get("/teachers/{$teacherA->slug}")
            ->assertOk()
            ->assertSee('Course A')
            ->assertDontSee('Course B');
    }
}
