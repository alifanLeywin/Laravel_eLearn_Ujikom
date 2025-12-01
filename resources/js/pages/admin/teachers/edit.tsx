import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormEvent } from 'react';

type Option = { id: string; name: string };

export default function TeacherEdit({
    teacher,
    tenants,
}: {
    teacher: {
        id: string;
        name: string;
        email: string;
        slug?: string | null;
        bio?: string | null;
        tenant_id?: string | null;
    };
    tenants: Option[];
}) {
    const { data, setData, processing, errors, clearErrors, put } = useForm({
        name: teacher.name,
        email: teacher.email,
        slug: teacher.slug ?? '',
        bio: teacher.bio ?? '',
        tenant_id: teacher.tenant_id ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        clearErrors();
        put(`/admin/teachers/${teacher.id}`, {
            preserveScroll: true,
            onSuccess: () => window.alert('Teacher updated.'),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Teachers', href: '/admin/teachers' },
                { title: teacher.name, href: '#' },
            ]}
        >
            <Head title={`Edit teacher - ${teacher.name}`} />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Edit teacher</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Name</label>
                                <Input
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Email</label>
                                <Input
                                    required
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Slug</label>
                                <Input
                                    value={data.slug ?? ''}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="teacher-slug"
                                />
                                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Tenant</label>
                                <select
                                    value={data.tenant_id ?? ''}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                                >
                                    <option value="" disabled>
                                        Assign tenant
                                    </option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.tenant_id && (
                                    <p className="text-xs text-red-500">{errors.tenant_id}</p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-foreground">Bio</label>
                                <Textarea
                                    value={data.bio ?? ''}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={3}
                                    placeholder="Perkenalkan diri, pengalaman mengajar, dll."
                                />
                                {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">New Password</label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Confirm Password
                                </label>
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between">
                                <Link href="/admin/teachers" className="text-sm text-muted-foreground underline">
                                    Back
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save teacher'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
