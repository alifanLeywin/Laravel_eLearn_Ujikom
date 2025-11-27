<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_uses_uuid_and_student_role_by_default(): void
    {
        $user = User::factory()->create();

        $this->assertTrue(Str::isUuid($user->id));
        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertSame(UserRole::Student, $user->role);
    }

    public function test_user_factory_role_states_apply_expected_roles(): void
    {
        $this->assertSame(UserRole::SuperAdmin, User::factory()->superAdmin()->create()->role);
        $this->assertSame(UserRole::Admin, User::factory()->admin()->create()->role);
        $this->assertSame(UserRole::Teacher, User::factory()->teacher()->create()->role);
    }
}
