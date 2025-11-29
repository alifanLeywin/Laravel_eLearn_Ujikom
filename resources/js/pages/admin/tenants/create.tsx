import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { TenantForm } from './_form';

export default function TenantCreate() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Tenants', href: '/admin/tenants' },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create tenant" />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Create tenant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TenantForm submitUrl="/admin/tenants" method="post" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
