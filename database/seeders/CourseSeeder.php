<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Question;
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

        $webCategory = Category::firstOrCreate(
            ['name' => 'Web Development', 'tenant_id' => $tenant->id],
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
                'published_at' => now(),
            ],
        );

        $jsTeacher = User::query()
            ->where('role', \App\Enums\UserRole::Teacher)
            ->where('tenant_id', $tenant->id)
            ->where('email', 'js-teacher@example.com')
            ->first()
            ?? User::factory()
                ->teacher()
                ->for($tenant)
                ->create([
                    'name' => 'JavaScript Instructor',
                    'email' => 'js-teacher@example.com',
                ]);

        $jsCourse = Course::firstOrCreate(
            ['slug' => 'javascript-essentials'],
            [
                'title' => 'JavaScript Essentials',
                'description' => 'Belajar dasar JavaScript modern: DOM, async/await, dan modularisasi.',
                'tenant_id' => $tenant->id,
                'teacher_id' => $jsTeacher->id,
                'category_id' => $webCategory->id,
                'status' => 'published',
                'level' => 'beginner',
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

        if ($jsCourse->modules()->count() === 0) {
            $modules = [
                ['title' => 'Dasar JavaScript', 'sort_order' => 1],
                ['title' => 'DOM & Events', 'sort_order' => 2],
                ['title' => 'Async & API', 'sort_order' => 3],
            ];

            foreach ($modules as $moduleData) {
                $module = Module::create([
                    'course_id' => $jsCourse->id,
                    'title' => $moduleData['title'],
                    'sort_order' => $moduleData['sort_order'],
                ]);

                Lesson::create([
                    'module_id' => $module->id,
                    'title' => 'Materi: '.$moduleData['title'],
                    'type' => 'text',
                    'content' => 'Ringkasan materi '.$moduleData['title'].' dengan contoh kode ES6.',
                    'sort_order' => 1,
                ]);
            }
        }

        $goTeacher = User::query()
            ->where('role', \App\Enums\UserRole::Teacher)
            ->where('tenant_id', $tenant->id)
            ->where('email', 'go-teacher@example.com')
            ->first()
            ?? User::factory()
                ->teacher()
                ->for($tenant)
                ->create([
                    'name' => 'Go Instructor',
                    'email' => 'go-teacher@example.com',
                ]);

        $backendCategory = Category::firstOrCreate(
            ['name' => 'Backend Engineering', 'tenant_id' => $tenant->id],
            ['parent_id' => null],
        );

        $goCourse = Course::firstOrCreate(
            ['slug' => 'golang-bootcamp'],
            [
                'title' => 'Go Lang Bootcamp',
                'description' => 'Belajar dasar Go: tooling, goroutine, channel, testing, dan deployment.',
                'tenant_id' => $tenant->id,
                'teacher_id' => $goTeacher->id,
                'category_id' => $backendCategory->id,
                'status' => 'published',
                'level' => 'intermediate',
                'published_at' => now(),
            ],
        );

        if ($goCourse->modules()->count() === 0) {
            $modules = [
                ['title' => 'Fondasi Go', 'sort_order' => 1],
                ['title' => 'Concurrency', 'sort_order' => 2],
            ];

            foreach ($modules as $moduleData) {
                $module = Module::create([
                    'course_id' => $goCourse->id,
                    'title' => $moduleData['title'],
                    'sort_order' => $moduleData['sort_order'],
                ]);

                if ($moduleData['title'] === 'Fondasi Go') {
                    Lesson::create([
                        'module_id' => $module->id,
                        'title' => 'Intro & Setup',
                        'type' => 'video',
                        'video_url' => 'https://youtu.be/446E-r0rXHI?si=1Mpd5UlpdT4uhaP1',
                        'content' => 'Instalasi Go, GOPATH, go mod init, dan struktur proyek.',
                        'duration' => 20,
                        'sort_order' => 1,
                    ]);

                    Lesson::create([
                        'module_id' => $module->id,
                        'title' => 'Dasar Sintaks',
                        'type' => 'text',
                        'content' => 'Variable, fungsi, error handling, dan package di Go.',
                        'sort_order' => 2,
                    ]);

                    $quizLesson = Lesson::create([
                        'module_id' => $module->id,
                        'title' => 'Quiz Fondasi',
                        'type' => 'quiz',
                        'sort_order' => 3,
                    ]);

                    $quiz = Quiz::create([
                        'lesson_id' => $quizLesson->id,
                        'time_limit' => 600,
                        'passing_grade' => 20,
                    ]);

                    Question::create([
                        'quiz_id' => $quiz->id,
                        'type' => 'multiple_choice',
                        'question_text' => 'Perintah untuk memulai modul Go baru?',
                        'options' => [
                            'choices' => [
                                ['label' => 'A', 'value' => 'go mod init'],
                                ['label' => 'B', 'value' => 'go new'],
                                ['label' => 'C', 'value' => 'go start'],
                                ['label' => 'D', 'value' => 'go create'],
                            ],
                            'answer' => 'A',
                        ],
                        'score' => 10,
                    ]);

                    Question::create([
                        'quiz_id' => $quiz->id,
                        'type' => 'multiple_choice',
                        'question_text' => 'Tipe error di Go direpresentasikan dengan?',
                        'options' => [
                            'choices' => [
                                ['label' => 'A', 'value' => 'bool'],
                                ['label' => 'B', 'value' => 'string'],
                                ['label' => 'C', 'value' => 'error interface'],
                                ['label' => 'D', 'value' => 'int'],
                            ],
                            'answer' => 'C',
                        ],
                        'score' => 10,
                    ]);
                }

                if ($moduleData['title'] === 'Concurrency') {
                    $assignmentLesson = Lesson::create([
                        'module_id' => $module->id,
                        'title' => 'Goroutine & Channel',
                        'type' => 'assignment',
                        'content' => 'Buat worker pool sederhana menggunakan goroutine dan channel buffered.',
                        'sort_order' => 1,
                    ]);

                    Assignment::create([
                        'lesson_id' => $assignmentLesson->id,
                        'due_date' => now()->addDays(7),
                        'max_score' => 100,
                    ]);
                }
            }
        }
    }
}
