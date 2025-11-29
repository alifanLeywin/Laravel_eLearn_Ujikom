<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'assignment_id' => Assignment::factory(),
            'user_id' => User::factory()->student(),
            'file_path' => 'uploads/sample.pdf',
            'grade' => $this->faker->numberBetween(60, 100),
            'feedback_text' => $this->faker->sentence(),
            'submitted_at' => now(),
        ];
    }
}
