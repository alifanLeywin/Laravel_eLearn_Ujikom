import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Option = { id: string; name: string };
type Category = { id: string; name: string; tenant_id?: string | null };

type CategoryFormProps = {
    initialValues?: {
        name?: string;
        tenant_id?: string | null;
        parent_id?: string | null;
    };
    tenants: Option[];
    categories: Category[];
    submitUrl: string;
    method?: 'post' | 'put';
};

export function CategoryForm({
    initialValues,
    tenants,
    categories,
    submitUrl,
    method = 'post',
}: CategoryFormProps) {
    const { data, setData, processing, reset, errors, clearErrors, ...form } = useForm({
        name: initialValues?.name ?? '',
        tenant_id: initialValues?.tenant_id ?? tenants[0]?.id ?? '',
        parent_id: initialValues?.parent_id ?? '',
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        clearErrors();
        form[method](submitUrl, {
            preserveScroll: true,
            onSuccess: () => {
                const isCreate = method === 'post';
                window.alert(isCreate ? 'Kategori berhasil dibuat.' : 'Kategori berhasil diperbarui.');
                router.visit('/admin/categories');
                if (isCreate) {
                    reset('name', 'parent_id');
                }
            },
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Name</label>
                    <Input
                        required
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Tenant</label>
                    <select
                        value={data.tenant_id ?? ''}
                        onChange={(event) =>
                            setData('tenant_id', event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
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
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Parent</label>
                <select
                    value={data.parent_id ?? ''}
                    onChange={(event) => setData('parent_id', event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="">No parent</option>
                    {categories
                        .filter(
                            (category) =>
                                !data.tenant_id ||
                                category.tenant_id === data.tenant_id,
                        )
                        .map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                </select>
                <p className="text-xs text-muted-foreground">
                    Hanya kategori pada tenant yang sama yang bisa dipilih.
                </p>
                {errors.parent_id && (
                    <p className="text-xs text-red-500">{errors.parent_id}</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save category'}
                </Button>
            </div>
        </form>
    );
}
