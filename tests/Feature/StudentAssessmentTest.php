<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Submission;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentAssessmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_submit_quiz_attempt(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $student = User::factory()->student()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create(['status' => 'published']);
        $module = Module::factory()->for($course)->create();
        $lesson = Lesson::factory()->for($module)->create(['type' => 'quiz']);
        $quiz = Quiz::factory()->for($lesson)->create(['passing_grade' => 10]);
        $question = Question::factory()->for($quiz)->create([
            'type' => 'multiple_choice',
            'options' => [
                'choices' => [
                    ['label' => 'A', 'value' => 'Jawaban A'],
                    ['label' => 'B', 'value' => 'Jawaban B'],
                ],
                'answer' => 'A',
            ],
            'score' => 10,
        ]);

        $student->enrollments()->create([
            'course_id' => $course->id,
            'status' => 'active',
        ]);

        $this->actingAs($student)
            ->get(route('student.quizzes.show', [$course, $lesson]))
            ->assertOk()
            ->assertSee($question->question_text);

        $this->actingAs($student)
            ->post(route('student.quizzes.submit', [$course, $lesson]), [
                'answers' => [
                    ['question_id' => $question->id, 'value' => 'A'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $student->id,
            'passed' => true,
            'score' => 10,
        ]);

        $this->assertDatabaseHas('course_progress', [
            'lesson_id' => $lesson->id,
            'enrollment_id' => $student->enrollments()->first()->id,
        ]);
    }

    public function test_student_can_submit_assignment_file(): void
    {
        Storage::fake('public');

        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $student = User::factory()->student()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->for($teacher, 'teacher')->create(['status' => 'published']);
        $module = Module::factory()->for($course)->create();
        $lesson = Lesson::factory()->for($module)->create(['type' => 'assignment']);
        $assignment = Assignment::factory()->for($lesson)->create();

        $student->enrollments()->create([
            'course_id' => $course->id,
            'status' => 'active',
        ]);

        $file = UploadedFile::fake()->create('task.pdf', 200, 'application/pdf');

        $this->actingAs($student)
            ->post(route('student.assignments.submit', [$course, $lesson]), [
                'file' => $file,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas(Submission::class, [
            'assignment_id' => $assignment->id,
            'user_id' => $student->id,
        ]);

        $storedPath = Submission::query()->first()->file_path;
        Storage::disk('public')->assertExists($storedPath);

        $this->assertDatabaseHas('course_progress', [
            'lesson_id' => $lesson->id,
            'enrollment_id' => $student->enrollments()->first()->id,
        ]);
    }
}
