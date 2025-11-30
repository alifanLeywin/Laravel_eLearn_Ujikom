import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search } from 'lucide-react';

type Course = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    cover_image?: string | null;
    price?: string | number | null;
    level?: string | null;
    status: string;
    teacher?: string | null;
    category?: string | null;
};

type Category = {
    id: string;
    name: string;
};

export default function PublicCoursesIndex({
    courses,
    categories,
    filters,
}: {
    courses: Course[];
    categories: Category[];
    filters: { search?: string | null; category_id?: string | null };
}) {
    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        category_id: filters.category_id ?? '',
    });

    const applyFilters = (key: string, value: string) => {
        const next = { ...localFilters, [key]: value };
        setLocalFilters(next);
        router.get('/courses', next, { preserveScroll: true, replace: true });
    };

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
            <Head title="Courses" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 md:px-6">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-blue-100/70">Jelajahi course</p>
                            <h1 className="text-2xl font-semibold text-foreground">Semua course tersedia</h1>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative md:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-blue-100/60" />
                                <Input
                                    value={localFilters.search}
                                    onChange={(event) => applyFilters('search', event.target.value)}
                                    placeholder="Cari judul atau deskripsi"
                                    className="w-full rounded-full border-slate-200 bg-white pl-10 text-sm text-foreground placeholder:text-slate-400 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-blue-100/60"
                                />
                            </div>
                            <select
                                value={localFilters.category_id}
                                onChange={(event) => applyFilters('category_id', event.target.value)}
                                className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="border-slate-200 bg-white/90 text-slate-900 ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:ring-white/10"
                        >
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
                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                <CardDescription className="text-slate-600 dark:text-blue-100/70">
                                    {course.category ?? 'General'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="line-clamp-3 text-sm text-slate-700 dark:text-blue-100/80">
                                    {course.description ??
                                        'Materi terkurasi dengan quiz, assignment, dan progress tracking.'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-blue-100/70">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                                        {course.level ?? 'All levels'}
                                    </span>
                                    <span>{course.teacher ?? 'Instruktur TBD'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700 dark:text-blue-100/70">
                                        {formatIDR(course.price)}
                                    </span>
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-white"
                                    >
                                        Lihat detail →
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-white/20 dark:text-blue-100/70">
                            Tidak ada course yang cocok. Ubah filter atau coba lagi nanti.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
