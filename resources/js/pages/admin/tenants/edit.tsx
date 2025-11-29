import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { TenantForm } from './_form';

type Tenant = {
    id: string;
    name: string;
    slug: string;
    subscription_status: string;
};

export default function TenantEdit({ tenant }: { tenant: Tenant }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Tenants', href: '/admin/tenants' },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${tenant.name}`} />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Edit tenant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TenantForm
                            initialValues={tenant}
                            submitUrl={`/admin/tenants/${tenant.id}`}
                            method="put"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
