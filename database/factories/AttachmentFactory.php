<?php

namespace Database\Factories;

use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attachment>
 */
class AttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'attachable_id' => Lesson::factory(),
            'attachable_type' => Lesson::class,
            'file_path' => 'uploads/files/'.$this->faker->uuid().'.pdf',
            'meta' => [
                'size' => $this->faker->numberBetween(1000, 1000000),
            ],
        ];
    }

    public function forLesson(): static
    {
        return $this->for(Lesson::factory(), 'attachable');
    }
}
