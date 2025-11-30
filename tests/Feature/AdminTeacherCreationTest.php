<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTeacherCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_teacher_with_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('admin.teachers.store'), [
                'name' => 'New Teacher',
                'email' => 'teacher@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'tenant_id' => $tenant->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas(User::class, [
            'email' => 'teacher@example.com',
            'role' => \App\Enums\UserRole::Teacher->value,
            'tenant_id' => $tenant->id,
        ]);
    }
}
