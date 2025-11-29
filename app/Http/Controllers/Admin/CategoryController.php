<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryStoreRequest;
use App\Http\Requests\Admin\CategoryUpdateRequest;
use App\Models\Category;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user();
        $categories = $this->categoryList($user);

        return Inertia::render('admin/categories/create', [
            'tenants' => $this->tenants($user),
            'categories' => $categories,
        ]);
    }

    public function edit(Request $request, Category $category): Response
    {
        $user = $request->user();

        if ($user?->tenant_id && $category->tenant_id !== $user->tenant_id) {
            abort(403);
        }

        $categories = $this->categoryList($user);

        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'tenant_id' => $category->tenant_id,
                'parent_id' => $category->parent_id,
            ],
            'tenants' => $this->tenants($user),
            'categories' => $categories,
        ]);
    }

    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = (string) $request->input('search', '');
        $tenantFilter = (string) $request->input('tenant_id', '');

        $categories = Category::query()
            ->with(['tenant:id,name', 'parent:id,name'])
            ->when(
                $user?->tenant_id,
                fn ($query) => $query->where('tenant_id', $user->tenant_id),
            )
            ->when(filled($tenantFilter), fn ($query) => $query->where('tenant_id', $tenantFilter))
            ->when(filled($search), fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->latest()
            ->get()
            ->values()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'tenant_id' => $category->tenant_id,
                'tenant' => $category->tenant?->name,
                'parent_id' => $category->parent_id,
                'parent_name' => $category->parent?->name,
            ]);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'tenants' => $this->tenants($user),
            'filters' => [
                'search' => $search,
                'tenant_id' => $tenantFilter ?: ($user?->tenant_id ?? ''),
            ],
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(CategoryStoreRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $tenantId = $user?->tenant_id ?? $data['tenant_id'] ?? null;
        $parentId = $data['parent_id'] ?? null;

        if ($parentId) {
            $parentTenantId = Category::query()->whereKey($parentId)->value('tenant_id');
            if ($parentTenantId !== $tenantId) {
                abort(403, 'Parent category must belong to the same tenant.');
            }
        }

        Category::create([
            'name' => $data['name'],
            'tenant_id' => $tenantId,
            'parent_id' => $parentId,
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category created.');
    }

    /**
     * Update the specified category.
     */
    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $user = $request->user();
        $data = $request->validated();

        $tenantId = $user?->tenant_id ?? $data['tenant_id'];

        if ($user?->tenant_id && $category->tenant_id !== $user->tenant_id) {
            abort(403);
        }

        $parentId = $data['parent_id'] ?? null;

        if ($parentId) {
            $parentTenantId = Category::query()->whereKey($parentId)->value('tenant_id');
            if ($parentTenantId !== $tenantId) {
                abort(403, 'Parent category must belong to the same tenant.');
            }
        }

        $category->update([
            'name' => $data['name'],
            'tenant_id' => $tenantId,
            'parent_id' => $parentId,
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Request $request, Category $category)
    {
        $user = $request->user();

        if ($user?->tenant_id && $category->tenant_id !== $user->tenant_id) {
            abort(403);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted.');
    }

    /**
     * Remove multiple categories.
     */
    public function bulkDestroy(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid', 'exists:categories,id'],
        ]);

        Category::query()
            ->when($user?->tenant_id, fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->whereIn('id', $validated['ids'])
            ->delete();

        return back()->with('success', 'Selected categories deleted.');
    }

    private function tenants(?User $user)
    {
        return Tenant::query()
            ->when($user?->tenant_id, fn ($query) => $query->whereKey($user->tenant_id))
            ->latest()
            ->get(['id', 'name']);
    }

    private function categoryList(?User $user)
    {
        return Category::query()
            ->when(
                $user?->tenant_id,
                fn ($query) => $query->where('tenant_id', $user->tenant_id),
            )
            ->latest()
            ->get(['id', 'name', 'tenant_id', 'parent_id']);
    }
}
