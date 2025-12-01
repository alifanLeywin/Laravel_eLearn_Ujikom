import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';

type Course = {
    id: string;
    slug: string;
    title: string;
    cover_image?: string | null;
    level?: string | null;
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
    return (
        <PublicLayout>
            <Head title={teacher.name} />
            <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 px-4 pb-16 pt-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white md:px-6">
                {/* Hero */}
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-rose-100 backdrop-blur-md dark:bg-slate-900/70 dark:ring-white/10 md:flex-row md:items-center md:justify-between md:p-10">
                    <div className="flex items-start gap-5">
                        <div className="flex size-16 items-center justify-center rounded-full bg-rose-100 text-xl font-semibold text-rose-700 shadow-sm dark:bg-rose-900/30 dark:text-rose-200">
                            {teacher.initials}
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-serif text-3xl font-light text-rose-700 dark:text-rose-200">
                                {teacher.name}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-200">
                                {teacher.bio ?? 'Belum ada bio.'}
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                                {teacher.courses_count} course
                                {teacher.courses_count === 1 ? '' : 's'}
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/courses"
                        className="inline-flex items-center justify-center rounded-full border-2 border-rose-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-500 hover:text-white dark:border-rose-300 dark:text-rose-200 dark:hover:bg-rose-300 dark:hover:text-slate-900"
                    >
                        Lihat semua course
                    </Link>
                </div>

                {/* Courses List */}
                <div className="mx-auto mt-10 flex w-full max-w-5xl flex-col gap-4">
                    <h2 className="font-serif text-2xl font-light text-rose-700 dark:text-rose-200">
                        Course oleh {teacher.name}
                    </h2>
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="group flex flex-col gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-rose-200 dark:bg-slate-900/70 dark:ring-white/10 md:flex-row md:items-center md:p-5"
                            >
                                <div className="flex h-28 w-full overflow-hidden rounded-xl bg-rose-50 shadow-sm ring-1 ring-rose-100 dark:bg-slate-800 dark:ring-white/10 md:h-24 md:w-40">
                                    <img
                                        src={
                                            course.cover_image
                                                ? course.cover_image.startsWith('http')
                                                    ? course.cover_image
                                                    : `/storage/${course.cover_image}`
                                                : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60'
                                        }
                                        alt={course.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-serif text-xl font-light text-slate-900 transition group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-200">
                                            {course.title}
                                        </h3>
                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                                            {course.category ?? 'General'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-200">
                                        Level: {course.level ?? 'All levels'}
                                    </p>
                                    <span className="inline-flex text-sm font-semibold text-rose-600 transition group-hover:text-rose-700 dark:text-rose-200 dark:group-hover:text-rose-100">
                                        Lihat detail →
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {courses.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-rose-200 bg-white/60 p-8 text-center text-sm text-slate-600 dark:border-white/20 dark:bg-slate-900/50 dark:text-slate-200">
                                Teacher ini belum memiliki course.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
