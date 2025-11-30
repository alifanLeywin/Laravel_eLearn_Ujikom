<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $users = DB::table('users')->whereNull('slug')->orWhere('slug', '')->get(['id', 'name']);

        foreach ($users as $user) {
            $base = Str::slug($user->name) ?: Str::random(6);
            $slug = $base;
            $counter = 1;

            while (DB::table('users')->where('slug', $slug)->exists()) {
                $slug = $base.'-'.$counter;
                $counter++;
            }

            DB::table('users')->where('id', $user->id)->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->update(['slug' => null]);
    }
};
