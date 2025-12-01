import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';

type Course = {
    id: string;
    title: string;
    slug: string;
    status: string;
    level: string | null;
    teacher?: string | null;
    deleted_at?: string | null;
};

export default function CoursesTrashed({ courses }: { courses: Course[] }) {
    const { url } = usePage();
    const isTeacherRoute = url.startsWith('/teacher/');

    const restore = (id: string) => {
        router.post(
            isTeacherRoute ? `/teacher/courses/${id}/restore` : `/admin/courses/${id}/restore`,
            {},
            { preserveScroll: true },
        );
    };

    const forceDelete = (id: string) => {
        if (!confirm('Hapus permanen course ini?')) return;
        router.delete(
            isTeacherRoute ? `/teacher/courses/${id}/force` : `/admin/courses/${id}/force`,
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: isTeacherRoute ? '/teacher/courses' : '/admin/courses' },
                { title: 'Trash', href: '#' },
            ]}
        >
            <Head title="Courses Trash" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Trash</h1>
                    <Link href={isTeacherRoute ? '/teacher/courses' : '/admin/courses'}>
                        <Button variant="outline">Back to courses</Button>
                    </Link>
                </div>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Deleted courses</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/60">
                        {courses.length === 0 && (
                            <div className="py-6 text-sm text-muted-foreground">Tidak ada course di trash.</div>
                        )}
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-foreground">{course.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {course.slug} · {course.status} · {course.level ?? 'All levels'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {course.teacher ?? 'No teacher'} · {course.deleted_at ?? ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <Button size="sm" variant="secondary" onClick={() => restore(course.id)}>
                                        Restore
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => forceDelete(course.id)}>
                                        Delete permanently
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
