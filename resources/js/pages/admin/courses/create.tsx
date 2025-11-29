import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import { CourseForm } from './_form';

type Option = { id: string; name: string };

type PageProps = {
    teachers: Option[];
    tenants: Option[];
    categories: Option[];
};

export default function CourseCreate({ teachers, tenants, categories }: PageProps) {
    const { url } = usePage();
    const isTeacherRoute = url.startsWith('/teacher/');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: isTeacherRoute ? '/teacher/courses' : '/admin/courses' },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create course" />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Create course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CourseForm
                            teachers={teachers}
                            tenants={tenants}
                            categories={categories}
                            isTeacherRoute={isTeacherRoute}
                            submitUrl={isTeacherRoute ? '/teacher/courses' : '/admin/courses'}
                            method="post"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
