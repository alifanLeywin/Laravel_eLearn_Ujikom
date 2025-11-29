import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Course = {
    id: string;
    title: string;
    slug: string;
    status: string;
    level: string | null;
    teacher?: string | null;
    category?: string | null;
    modules_count: number;
    lessons_count: number;
};

type PageProps = {
    courses: Course[];
    filters: { search?: string | null; status?: string | null };
};

export default function CoursesIndex({ courses, filters }: PageProps) {
    const { url } = usePage();
    const isTeacherRoute = url.startsWith('/teacher/');
    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = (key: string, value: string) => {
        const next = { ...localFilters, [key]: value };
        setLocalFilters(next);
        router.get(isTeacherRoute ? '/teacher/courses' : '/admin/courses', next, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: isTeacherRoute ? '/teacher/dashboard' : '/admin/dashboard' },
                { title: 'Courses', href: '#' },
            ]}
        >
            <Head title="Courses" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search title or slug"
                        value={localFilters.search}
                        onChange={(event) => applyFilters('search', event.target.value)}
                        className="max-w-xs"
                    />
                    <select
                        value={localFilters.status}
                        onChange={(event) => applyFilters('status', event.target.value)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Link
                        href={isTeacherRoute ? '/teacher/courses/create' : '/admin/courses/create'}
                        className="ml-auto"
                    >
                        <Button>Create course</Button>
                    </Link>
                </div>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/60">
                        {courses.length === 0 && (
                            <div className="py-6 text-sm text-muted-foreground">
                                Belum ada course.
                            </div>
                        )}
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-foreground">{course.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {course.slug} · {course.status} · {course.level || 'All levels'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {course.teacher ?? 'No teacher'} ·{' '}
                                        {course.category ?? 'No category'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Modules {course.modules_count}</span>
                                    <span>Lessons {course.lessons_count}</span>
                                    <Link
                                        href={
                                            isTeacherRoute
                                                ? `/teacher/courses/${course.id}`
                                                : `/admin/courses/${course.id}`
                                        }
                                        className="text-foreground hover:underline"
                                    >
                                        Manage
                                    </Link>
                                    <Link
                                        href={
                                            isTeacherRoute
                                                ? `/teacher/courses/${course.id}/edit`
                                                : `/admin/courses/${course.id}/edit`
                                        }
                                        className="text-foreground hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
