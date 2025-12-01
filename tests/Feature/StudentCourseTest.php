<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentCourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_view_enrolled_course_and_complete_lesson(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $student = User::factory()->student()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create(['status' => 'published']);
        $module = Module::factory()->for($course)->create();
        $lesson = Lesson::factory()->for($module)->create();

        $student->enrollments()->create([
            'course_id' => $course->id,
            'status' => 'active',
        ]);

        $this->actingAs($student)
            ->get(route('student.courses.show', $course))
            ->assertOk()
            ->assertSee($lesson->title);

        $this->actingAs($student)
            ->post(route('student.courses.lessons.complete', [$course, $lesson]))
            ->assertRedirect();

        $this->assertDatabaseHas(CourseProgress::class, [
            'lesson_id' => $lesson->id,
            'enrollment_id' => $student->enrollments()->first()->id,
        ]);

        $this->actingAs($student)
            ->delete(route('student.courses.lessons.incomplete', [$course, $lesson]))
            ->assertRedirect();

        $this->assertDatabaseMissing(CourseProgress::class, [
            'lesson_id' => $lesson->id,
            'enrollment_id' => $student->enrollments()->first()->id,
            'deleted_at' => null,
        ]);
    }
}
