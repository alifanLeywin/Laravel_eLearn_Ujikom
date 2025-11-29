import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import { CourseForm } from './_form';

type Option = { id: string; name: string };

type PageProps = {
    course: {
        id: string;
        title: string;
        slug: string | null;
        description: string | null;
        tenant_id: string | null;
        teacher_id: string | null;
        category_id: string | null;
        status: string;
        level: string | null;
    };
    teachers: Option[];
    tenants: Option[];
    categories: Option[];
};

export default function CourseEdit({ course, teachers, tenants, categories }: PageProps) {
    const { url } = usePage();
    const isTeacherRoute = url.startsWith('/teacher/');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: isTeacherRoute ? '/teacher/courses' : '/admin/courses' },
                { title: course.title, href: isTeacherRoute ? `/teacher/courses/${course.id}` : `/admin/courses/${course.id}` },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${course.title}`} />
            <div className="p-4">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Edit course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CourseForm
                            initialValues={course}
                            teachers={teachers}
                            tenants={tenants}
                            categories={categories}
                            isTeacherRoute={isTeacherRoute}
                            submitUrl={
                                isTeacherRoute
                                    ? `/teacher/courses/${course.id}`
                                    : `/admin/courses/${course.id}`
                            }
                            method="put"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
