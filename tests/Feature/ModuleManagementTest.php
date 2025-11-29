<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_create_module_without_sending_course_id(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $course = Course::factory()
            ->for($tenant)
            ->for($teacher, 'teacher')
            ->create();

        $response = $this->actingAs($teacher)
            ->from(route('teacher.courses.show', $course))
            ->post(route('teacher.modules.store', $course), [
                'title' => 'Intro Module',
                'sort_order' => 1,
            ]);

        $response->assertRedirect(route('teacher.courses.show', $course));

        $this->assertDatabaseHas(Module::class, [
            'course_id' => $course->id,
            'title' => 'Intro Module',
            'sort_order' => 1,
        ]);
    }
}
