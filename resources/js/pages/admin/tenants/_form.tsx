import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type TenantFormProps = {
    initialValues?: {
        name?: string;
        slug?: string;
        subscription_status?: string;
    };
    submitUrl: string;
    method?: 'post' | 'put';
};

export function TenantForm({ initialValues, submitUrl, method = 'post' }: TenantFormProps) {
    const { data, setData, processing, reset, errors, clearErrors, ...form } = useForm({
        name: initialValues?.name ?? '',
        slug: initialValues?.slug ?? '',
        subscription_status: initialValues?.subscription_status ?? 'active',
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        clearErrors();
        form[method](submitUrl, {
            preserveScroll: true,
            onSuccess: () => {
                if (method === 'post') {
                    reset();
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
                    <label className="text-sm font-semibold text-foreground">Slug</label>
                    <Input
                        required
                        value={data.slug}
                        onChange={(event) => setData('slug', event.target.value)}
                    />
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <select
                    value={data.subscription_status}
                    onChange={(event) =>
                        setData('subscription_status', event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                </select>
                {errors.subscription_status && (
                    <p className="text-xs text-red-500">{errors.subscription_status}</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save tenant'}
                </Button>
            </div>
        </form>
    );
}
