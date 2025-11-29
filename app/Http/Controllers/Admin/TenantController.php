<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TenantStoreRequest;
use App\Http\Requests\Admin\TenantUpdateRequest;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/tenants/create');
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('admin/tenants/edit', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'subscription_status' => $tenant->subscription_status,
            ],
        ]);
    }

    /**
     * Display a listing of tenants.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $status = (string) $request->input('subscription_status', '');

        $tenants = Tenant::query()
            ->withCount(['users', 'courses'])
            ->when(filled($search), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('slug', 'like', '%'.$search.'%');
                });
            })
            ->when(filled($status), fn ($query) => $query->where('subscription_status', $status))
            ->latest()
            ->get()
            ->values()
            ->map(fn (Tenant $tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'subscription_status' => $tenant->subscription_status,
                'users_count' => $tenant->users_count,
                'courses_count' => $tenant->courses_count,
            ]);

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
            'filters' => [
                'search' => $search,
                'subscription_status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created tenant.
     */
    public function store(TenantStoreRequest $request)
    {
        Tenant::create($request->validated());

        return redirect()->route('admin.tenants.index')->with('success', 'Tenant created.');
    }

    /**
     * Update the specified tenant.
     */
    public function update(TenantUpdateRequest $request, Tenant $tenant)
    {
        $tenant->update($request->validated());

        return redirect()->route('admin.tenants.index')->with('success', 'Tenant updated.');
    }

    /**
     * Remove the specified tenant.
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('admin.tenants.index')->with('success', 'Tenant deleted.');
    }

    /**
     * Remove multiple tenants.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid', 'exists:tenants,id'],
        ]);

        Tenant::query()->whereIn('id', $validated['ids'])->delete();

        return back()->with('success', 'Selected tenants deleted.');
    }
}
