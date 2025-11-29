import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';

type Tenant = {
    id: string;
    name: string;
    slug: string;
    subscription_status: string;
    users_count: number;
    courses_count: number;
};

export default function TenantsIndex({ tenants }: { tenants: Tenant[] }) {
    const [selected, setSelected] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        subscription_status: '',
    });

    const subscriptionOptions = useMemo(
        () => [
            { value: 'active', label: 'Active' },
            { value: 'trial', label: 'Trial' },
            { value: 'suspended', label: 'Suspended' },
            { value: '', label: 'All' },
        ],
        [],
    );

    const applyFilters = (key: string, value: string) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        router.get('/admin/tenants', next, {
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

        router.delete('/admin/tenants', {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Tenants', href: '/admin/tenants' },
            ]}
        >
            <Head title="Tenants" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search by name or slug"
                        value={filters.search}
                        onChange={(event) =>
                            applyFilters('search', event.target.value)
                        }
                        className="max-w-xs"
                    />
                    <select
                        value={filters.subscription_status}
                        onChange={(event) =>
                            applyFilters('subscription_status', event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                    >
                        {subscriptionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <Link href="/admin/tenants/create" className="ml-auto">
                        <Button>Create tenant</Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={bulkDelete}
                        disabled={selected.length === 0}
                    >
                        Delete selected
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.map((tenant) => (
                        <Card key={tenant.id} className="border-border/70">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-lg">
                                    <input
                                        type="checkbox"
                                        className="mr-2 h-4 w-4 rounded border-border"
                                        checked={selected.includes(tenant.id)}
                                        onChange={() => toggleSelection(tenant.id)}
                                    />
                                    {tenant.name}
                                </CardTitle>
                                <Badge variant="outline" className="w-fit">
                                    {tenant.slug}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>Status</span>
                                    <Badge variant="secondary">
                                        {tenant.subscription_status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Users</span>
                                    <span className="font-semibold text-foreground">
                                        {tenant.users_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Courses</span>
                                    <span className="font-semibold text-foreground">
                                        {tenant.courses_count}
                                    </span>
                                </div>
                                <Link
                                    href={`/admin/tenants/${tenant.id}/edit`}
                                    className="text-foreground hover:underline"
                                >
                                    Edit
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                    {tenants.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                Belum ada tenant. Tambahkan tenant baru untuk
                                mulai mengelola instansi.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
