<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_tenants(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('admin.tenants.index'))
            ->assertOk();
    }

    public function test_admin_cannot_access_tenants(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.tenants.index'))
            ->assertForbidden();
    }

    public function test_admin_can_access_categories_for_their_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        $category = Category::factory()->for($tenant)->create();

        $this->actingAs($admin)
            ->get(route('admin.categories.index'))
            ->assertOk()
            ->assertSee($category->name);
    }

    public function test_teacher_cannot_access_admin_categories(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)
            ->get(route('admin.categories.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_crud_tenant(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('admin.tenants.store'), [
                'name' => 'Tenant A',
                'slug' => 'tenant-a',
                'subscription_status' => 'active',
            ])
            ->assertRedirect();

        $tenant = Tenant::firstOrFail();

        $this->actingAs($superAdmin)
            ->put(route('admin.tenants.update', $tenant), [
                'name' => 'Tenant A Updated',
                'slug' => 'tenant-a-updated',
                'subscription_status' => 'trial',
            ])
            ->assertRedirect();

        $this->actingAs($superAdmin)
            ->delete(route('admin.tenants.destroy', $tenant))
            ->assertRedirect();

        $this->assertSoftDeleted($tenant);
    }

    public function test_admin_can_crud_categories_for_their_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        $parent = Category::factory()->for($tenant)->create(['name' => 'Parent']);

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Category One',
                'parent_id' => $parent->id,
            ])
            ->assertRedirect();

        $category = Category::where('name', 'Category One')->firstOrFail();
        $this->assertSame($tenant->id, $category->tenant_id);
        $this->assertSame($parent->id, $category->parent_id);

        $this->actingAs($admin)
            ->put(route('admin.categories.update', $category), [
                'name' => 'Category Updated',
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirect();

        $this->assertSoftDeleted($category);
    }

    public function test_super_admin_can_create_category_for_specific_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('admin.categories.store'), [
                'name' => 'Global Category',
                'tenant_id' => $tenant->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas(Category::class, [
            'name' => 'Global Category',
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_admin_cannot_duplicate_category_name_in_same_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        Category::factory()->for($tenant)->create(['name' => 'Duplicate']);

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Duplicate',
            ])
            ->assertSessionHasErrors('name');
    }

    public function test_same_category_name_allowed_on_other_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();

        Category::factory()->for($tenantA)->create(['name' => 'Shared']);

        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('admin.categories.store'), [
                'name' => 'Shared',
                'tenant_id' => $tenantB->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas(Category::class, [
            'name' => 'Shared',
            'tenant_id' => $tenantB->id,
        ]);
    }

    public function test_super_admin_can_view_tenants_without_status_filter(): void
    {
        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('admin.tenants.index'))
            ->assertOk()
            ->assertSee($tenant->name);
    }

    public function test_admin_sees_courses_for_their_tenant_without_filters(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        $course = Course::factory()->for($tenant)->create();

        $this->actingAs($admin)
            ->get(route('admin.courses.index'))
            ->assertOk()
            ->assertSee($course->title);
    }

    public function test_super_admin_requires_tenant_and_teacher_when_creating_course(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('admin.courses.store'), [
                'title' => 'No Tenant',
                'status' => 'draft',
            ])
            ->assertSessionHasErrors(['tenant_id', 'teacher_id']);
    }

    public function test_super_admin_can_create_course_with_tenant_and_teacher(): void
    {
        $tenant = Tenant::factory()->create();
        $teacher = User::factory()->teacher()->for($tenant)->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.courses.store'), [
                'title' => 'Tenant Course',
                'status' => 'published',
                'tenant_id' => $tenant->id,
                'teacher_id' => $teacher->id,
                'price' => 123.45,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas(Course::class, [
            'title' => 'Tenant Course',
            'tenant_id' => $tenant->id,
            'teacher_id' => $teacher->id,
            'price' => 123.45,
            'status' => 'published',
        ]);

        $this->assertNotNull(Course::where('title', 'Tenant Course')->first()->published_at);
    }

    public function test_super_admin_can_bulk_delete_tenants(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $tenants = Tenant::factory()->count(2)->create();

        $this->actingAs($superAdmin)
            ->delete(route('admin.tenants.bulk-destroy'), [
                'ids' => $tenants->pluck('id')->all(),
            ])
            ->assertRedirect();

        foreach ($tenants as $tenant) {
            $this->assertSoftDeleted($tenant);
        }
    }

    public function test_admin_can_bulk_delete_categories_for_their_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->admin()->for($tenant)->create();
        $categories = Category::factory()->count(2)->for($tenant)->create();

        $this->actingAs($admin)
            ->delete(route('admin.categories.bulk-destroy'), [
                'ids' => $categories->pluck('id')->all(),
            ])
            ->assertRedirect();

        foreach ($categories as $category) {
            $this->assertSoftDeleted($category);
        }
    }
}
