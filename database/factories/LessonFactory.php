<?php

namespace Database\Factories;

use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'title' => $this->faker->sentence(3),
            'type' => $this->faker->randomElement(['video', 'text', 'quiz', 'assignment']),
            'content' => $this->faker->paragraphs(2, true),
            'video_url' => $this->faker->url(),
            'duration' => $this->faker->numberBetween(300, 2400),
            'is_preview' => false,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}
