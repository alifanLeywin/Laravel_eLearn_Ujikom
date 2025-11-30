<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'academy-one'],
            [
                'name' => 'Academy One',
                'subscription_status' => 'active',
            ],
        );

        $teacher = User::query()
            ->where('role', \App\Enums\UserRole::Teacher)
            ->where('tenant_id', $tenant->id)
            ->first()
            ?? User::factory()
                ->teacher()
                ->for($tenant)
                ->create([
                    'name' => 'PHP Instructor',
                    'email' => 'php-teacher@example.com',
                ]);

        $category = Category::firstOrCreate(
            ['name' => 'Programming', 'tenant_id' => $tenant->id],
            ['parent_id' => null],
        );

        $course = Course::firstOrCreate(
            ['slug' => 'php-fundamentals'],
            [
                'title' => 'PHP Fundamentals',
                'description' => 'Pelajari dasar PHP 8 untuk membangun aplikasi web modern dengan Laravel.',
                'tenant_id' => $tenant->id,
                'teacher_id' => $teacher->id,
                'category_id' => $category->id,
                'status' => 'published',
                'level' => 'beginner',
                'price' => 0,
                'published_at' => now(),
            ],
        );

        if ($course->modules()->count() === 0) {
            $modules = [
                ['title' => 'Pengenalan PHP', 'sort_order' => 1],
                ['title' => 'Sintaks Dasar & Control Flow', 'sort_order' => 2],
                ['title' => 'OOP di PHP', 'sort_order' => 3],
            ];

            foreach ($modules as $moduleData) {
                $module = Module::create([
                    'course_id' => $course->id,
                    'title' => $moduleData['title'],
                    'sort_order' => $moduleData['sort_order'],
                ]);

                Lesson::create([
                    'module_id' => $module->id,
                    'title' => 'Materi: '.$moduleData['title'],
                    'type' => 'text',
                    'content' => 'Ringkasan materi '.$moduleData['title'].' dengan contoh kode.',
                    'sort_order' => 1,
                ]);
            }
        }
    }
}
