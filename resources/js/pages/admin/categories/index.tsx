import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

type Category = {
    id: string;
    name: string;
    tenant_id?: string | null;
    tenant?: string | null;
    parent_id?: string | null;
    parent_name?: string | null;
};

export default function CategoriesIndex({
    categories,
    tenants,
    filters,
}: {
    categories: Category[];
    tenants: { id: string; name: string }[];
    filters: { search?: string | null; tenant_id?: string | null };
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        tenant_id: filters.tenant_id ?? '',
    });

    const applyFilters = (key: string, value: string) => {
        const next = { ...localFilters, [key]: value };
        setLocalFilters(next);
        router.get('/admin/categories', next, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const toggleSelection = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    const bulkDelete = () => {
        if (selected.length === 0) {
            return;
        }

        router.delete('/admin/categories', {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Categories', href: '/admin/categories' },
            ]}
        >
            <Head title="Categories" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search categories"
                        value={localFilters.search}
                        onChange={(event) =>
                            applyFilters('search', event.target.value)
                        }
                        className="max-w-xs"
                    />
                    {tenants.length > 0 && (
                        <select
                            value={localFilters.tenant_id}
                            onChange={(event) =>
                                applyFilters('tenant_id', event.target.value)
                            }
                            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                        >
                            <option value="">All tenants</option>
                            {tenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <Link href="/admin/categories/create" className="ml-auto">
                        <Button>Create category</Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={bulkDelete}
                        disabled={selected.length === 0}
                    >
                        Delete selected
                    </Button>
                </div>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/60">
                        {categories.length === 0 && (
                            <div className="py-6 text-sm text-muted-foreground">
                                Belum ada kategori. Admin dapat menambahkan
                                kategori untuk tenant ini.
                            </div>
                        )}
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border"
                                        checked={selected.includes(category.id)}
                                        onChange={() => toggleSelection(category.id)}
                                    />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {category.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {category.parent_id
                                            ? `Child of ${category.parent_name ?? 'parent'}`
                                            : 'Root category'}
                                    </p>
                                </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {category.tenant && (
                                        <Badge variant="outline">{category.tenant}</Badge>
                                    )}
                                    <Link
                                        href={`/admin/categories/${category.id}/edit`}
                                        className="text-foreground hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
