<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
            ->superAdmin()
            ->withoutTwoFactor()
            ->state([
                'name' => 'Super Admin',
                'email' => 'superadmin@example.com',
            ])
            ->create();
    }
}
