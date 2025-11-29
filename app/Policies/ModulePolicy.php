<?php

namespace App\Policies;

use App\Models\Module;
use App\Models\User;

class ModulePolicy
{
    public function view(User $user, Module $module): bool
    {
        return $user->can('view', $module->course);
    }

    public function update(User $user, Module $module): bool
    {
        $course = $module->course;

        return $user->can('update', $course);
    }

    public function delete(User $user, Module $module): bool
    {
        return $user->can('update', $module->course);
    }
}
