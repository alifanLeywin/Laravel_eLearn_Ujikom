<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
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
            ]
        );

        User::factory()
            ->teacher()
            ->for($tenant)
            ->withoutTwoFactor()
            ->state([
                'name' => 'Teacher User',
                'email' => 'teacher@example.com',
            ])
            ->create();
    }
}
