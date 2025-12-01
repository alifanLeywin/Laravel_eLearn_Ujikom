import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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

    const accent = 'text-[#e34724] dark:text-orange-300';
    const accentBg = 'bg-[#e34724] dark:bg-orange-400';
    const borderAccent = 'border-[#e34724] dark:border-orange-400';

    const categoriesWithAll = useMemo(
        () => [{ id: '', name: 'All' }, ...categories],
        [categories],
    );

    const applyFilters = (key: string, value: string) => {
        const next = { ...localFilters, [key]: value };
        setLocalFilters(next);
        router.get('/courses', next, { preserveScroll: true, replace: true });
    };

    return (
        <PublicLayout>
            <Head title="Courses" />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 pb-16 pt-10 text-[#3a1b14] dark:from-[#0b1021] dark:via-slate-900 dark:to-slate-950 dark:text-white md:px-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
                    <aside className="w-full max-w-xs space-y-8">
                        <div className="space-y-2">
                            <p className={`${accent} text-3xl font-semibold`}>Regular</p>
                            <p className={`${accent} text-3xl font-semibold`}>courses</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase tracking-[0.2em] text-[#c24b2c] dark:text-orange-200">
                                    Specialty
                                </label>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {categoriesWithAll.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => applyFilters('category_id', category.id)}
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                localFilters.category_id === category.id
                                                    ? `${accentBg} border-transparent text-white dark:text-[#0b1021]`
                                                    : `${borderAccent} text-[#e34724] dark:text-orange-200 hover:bg-[#e3472410] dark:hover:bg-orange-500/10`
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-[#c24b2c] dark:text-orange-200">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#e34724]" />
                                    <input
                                        value={localFilters.search}
                                        onChange={(event) => applyFilters('search', event.target.value)}
                                        placeholder="Cari judul/deskripsi"
                                        className="w-full rounded-full border border-[#e34724] bg-transparent px-10 py-2 text-sm text-[#3a1b14] placeholder:text-[#e3472470] focus:border-[#e34724] focus:outline-none dark:border-orange-400 dark:text-white dark:placeholder:text-orange-200/70 dark:focus:border-orange-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="flex-1 space-y-8">
                        <div className="rounded-2xl border border-[#e3472420] bg-white/80 p-6 shadow-sm dark:border-orange-400/30 dark:bg-white/5">
                            <p className={`${accent} text-lg font-semibold`}>
                                Regular courses taught at our academy. Semua kelas sedang berjalan dan siap
                                kamu ikuti.
                            </p>
                        </div>

                        <div className="grid gap-10 md:grid-cols-2">
                            {courses.map((course) => (
                                <article
                                    key={course.id}
                                    className="space-y-3 border-t-4 border-[#e34724] pt-4 dark:border-orange-300"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <Link
                                            href={`/courses/${course.slug}`}
                                            className="text-2xl font-semibold text-[#e34724] hover:text-[#b8321b] dark:text-orange-200 dark:hover:text-white"
                                        >
                                            {course.title}
                                        </Link>
                                        <span className="text-xs uppercase tracking-[0.2em] text-[#a0331d]">
                                            {course.status === 'published' ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                    {course.cover_image && (
                                        <div className="overflow-hidden rounded-lg border border-[#e3472420] bg-[#f6e9e3] dark:border-orange-400/30 dark:bg-orange-500/10">
                                            <img
                                                src={
                                                    course.cover_image.startsWith('http')
                                                        ? course.cover_image
                                                        : `/storage/${course.cover_image}`
                                                }
                                                alt={course.title}
                                                className="h-48 w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-[#7a3322]">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-[#e34724] px-3 py-1 text-[11px] text-[#e34724] dark:border-orange-300 dark:text-orange-200">
                                                {course.level ?? 'All levels'}
                                            </span>
                                            <span className="text-[#7a3322] dark:text-orange-100">
                                                {course.category ?? 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-semibold text-[#e34724]">
                                        <Link
                                            href={`/courses/${course.slug}`}
                                            className="hover:text-[#b8321b] dark:text-orange-200 dark:hover:text-white"
                                        >
                                            Read more →
                                        </Link>
                                    </div>
                                </article>
                            ))}
                            {courses.length === 0 && (
                                <div className="col-span-full rounded-xl border border-dashed border-[#e3472440] p-6 text-center text-sm text-[#7a3322] dark:border-orange-300/40 dark:text-orange-100">
                                    Tidak ada course yang cocok. Ubah filter atau coba lagi nanti.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
