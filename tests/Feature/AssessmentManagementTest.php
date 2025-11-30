<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_assignments_quizzes_and_questions(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create();
        $module = Module::factory()->for($course)->create();
        $lesson = Lesson::factory()->for($module)->create();

        $this->actingAs($admin)
            ->post(route('admin.assignments.store', [$course, $module, $lesson]), [
                'due_date' => now()->addDays(3)->toDateTimeString(),
                'max_score' => 100,
            ])
            ->assertRedirect();

        $assignment = Assignment::firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.quizzes.store', [$course, $module, $lesson]), [
                'time_limit' => 600,
                'passing_grade' => 70,
            ])
            ->assertRedirect();

        $quiz = Quiz::firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.questions.store', [$course, $module, $lesson, $quiz]), [
                'type' => 'multiple_choice',
                'question_text' => 'What is 2+2?',
                'options' => ['choices' => [['label' => 'A', 'value' => '4']], 'answer' => 'A'],
                'score' => 5,
            ])
            ->assertRedirect();

        $question = Question::firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.assignments.update', [$course, $module, $lesson, $assignment]), [
                'due_date' => now()->addDays(5)->toDateTimeString(),
                'max_score' => 90,
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->delete(route('admin.questions.destroy', [$course, $module, $lesson, $quiz, $question]))
            ->assertRedirect();

        $this->assertSoftDeleted($question);
    }
}
