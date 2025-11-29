<?php

namespace Database\Factories;

use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $options = [
            ['label' => 'A', 'value' => $this->faker->sentence(2)],
            ['label' => 'B', 'value' => $this->faker->sentence(2)],
            ['label' => 'C', 'value' => $this->faker->sentence(2)],
            ['label' => 'D', 'value' => $this->faker->sentence(2)],
        ];

        return [
            'quiz_id' => Quiz::factory(),
            'type' => 'multiple_choice',
            'question_text' => $this->faker->sentence(6),
            'options' => [
                'choices' => $options,
                'answer' => 'A',
            ],
            'score' => 10,
        ];
    }
}
