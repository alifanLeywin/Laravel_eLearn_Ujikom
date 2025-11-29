<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function view(User $user, Course $course): bool
    {
        return $this->isSameTenant($user, $course)
            || $user->role === UserRole::SuperAdmin;
    }

    public function update(User $user, Course $course): bool
    {
        if ($user->role === UserRole::SuperAdmin) {
            return true;
        }

        if ($user->role === UserRole::Admin) {
            return $this->isSameTenant($user, $course);
        }

        if ($user->role === UserRole::Teacher) {
            return $course->teacher_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    private function isSameTenant(User $user, Course $course): bool
    {
        return $user->tenant_id !== null && $user->tenant_id === $course->tenant_id;
    }
}
