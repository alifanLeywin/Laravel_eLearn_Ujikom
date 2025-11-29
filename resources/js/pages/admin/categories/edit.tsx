import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { CategoryForm } from './_form';

type Option = { id: string; name: string };
type Category = { id: string; name: string; tenant_id?: string | null; parent_id?: string | null };

export default function CategoryEdit({
    category,
    tenants,
    categories,
}: {
    category: Category;
    tenants: Option[];
    categories: Category[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Categories', href: '/admin/categories' },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${category.name}`} />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Edit category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm
                            initialValues={category}
                            tenants={tenants}
                            categories={categories}
                            submitUrl={`/admin/categories/${category.id}`}
                            method="put"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
