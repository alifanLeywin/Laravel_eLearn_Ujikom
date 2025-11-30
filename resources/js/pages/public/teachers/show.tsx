import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

type Course = {
    id: string;
    slug: string;
    title: string;
    cover_image?: string | null;
    level?: string | null;
    price?: string | number | null;
    category?: string | null;
};

type Teacher = {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    initials: string;
    courses_count: number;
};

export default function TeacherShow({ teacher, courses }: { teacher: Teacher; courses: Course[] }) {
    const formatIDR = (value?: string | number | null) => {
        if (!value) {
            return 'Gratis';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    return (
        <PublicLayout>
            <Head title={teacher.name} />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 md:px-6">
                <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
                            {teacher.initials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">{teacher.name}</h1>
                            <p className="text-sm text-slate-600 dark:text-blue-100/70">
                                {teacher.courses_count} courses
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-blue-100/70">
                        {teacher.bio ?? 'Belum ada bio.'}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id} className="border-slate-200 dark:border-white/10">
                            {course.cover_image && (
                                <div className="h-40 w-full overflow-hidden rounded-t-xl border-b border-slate-100 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                                    <img
                                        src={
                                            course.cover_image.startsWith('http')
                                                ? course.cover_image
                                                : `/storage/${course.cover_image}`
                                        }
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader className={course.cover_image ? 'pb-3' : undefined}>
                                <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
                                <p className="text-xs text-slate-500 dark:text-blue-100/70">
                                    {course.category ?? 'General'}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-blue-100/70">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                                        {course.level ?? 'All levels'}
                                    </span>
                                    <span>{formatIDR(course.price)}</span>
                                </div>
                                <Link
                                    href={`/courses/${course.slug}`}
                                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-white"
                                >
                                    Lihat detail →
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-white/20 dark:text-blue-100/70">
                            Teacher ini belum memiliki course.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
