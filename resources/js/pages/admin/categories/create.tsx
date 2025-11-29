import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { CategoryForm } from './_form';

type Option = { id: string; name: string };
type Category = { id: string; name: string; tenant_id?: string | null };

export default function CategoryCreate({
    tenants,
    categories,
}: {
    tenants: Option[];
    categories: Category[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Categories', href: '/admin/categories' },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create category" />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Create category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm
                            tenants={tenants}
                            categories={categories}
                            submitUrl="/admin/categories"
                            method="post"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
