import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    const isFirstRender = useRef(true);

    const categoriesWithAll = useMemo(
        () => [{ id: '', name: 'All' }, ...categories],
        [categories],
    );

    const applyFilters = (key: string, value: string) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handle = setTimeout(() => {
            router.get('/courses', localFilters, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localFilters.search, localFilters.category_id]);

    return (
        <PublicLayout>
            <Head title="Courses" />
            <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="flex flex-col gap-12 lg:flex-row">
                        {/* Sidebar Filters */}
                        <aside className="w-full space-y-8 lg:w-80">
                            <div className="space-y-2">
                                <h1 className="font-serif text-5xl font-light leading-tight text-rose-600 dark:text-rose-400">
                                    Regular
                                </h1>
                                <h2 className="font-serif text-5xl font-light leading-tight text-rose-600 dark:text-rose-400">
                                    courses
                                </h2>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-4">
                                <label className="block font-serif text-sm uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                    Specialty
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categoriesWithAll.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => applyFilters('category_id', category.id)}
                                            className={`rounded-full border-2 px-4 py-2 font-serif text-xs uppercase tracking-wide transition ${
                                                localFilters.category_id === category.id
                                                    ? 'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500'
                                                    : 'border-rose-600 bg-transparent text-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Filter */}
                            <div className="space-y-4">
                                <label className="block font-serif text-sm uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-rose-400 dark:text-rose-500" />
                                    <input
                                        value={localFilters.search}
                                        onChange={(event) => applyFilters('search', event.target.value)}
                                        placeholder="Cari judul/deskripsi"
                                        className="w-full rounded-full border-2 border-rose-600 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-rose-300 focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-500 dark:bg-slate-900 dark:text-white dark:placeholder:text-rose-500/50 dark:focus:border-rose-400 dark:focus:ring-rose-900"
                                    />
                                </div>
                            </div>
                        </aside>

                        {/* Courses Grid */}
                        <section className="flex-1 space-y-10">
                            {/* Info Banner */}
                            <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
                                <p className="font-serif text-lg leading-relaxed text-rose-600 dark:text-rose-400">
                                    Regular courses taught at our academy. Semua kelas sedang berjalan dan siap kamu ikuti.
                                </p>
                            </div>

                            {/* Courses Grid */}
                            <div className="grid gap-8 md:grid-cols-2">
                                {courses.map((course) => (
                                    <article
                                        key={course.id}
                                        className="group space-y-4 border-t-4 border-rose-600 pt-4 dark:border-rose-500"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="font-serif text-2xl font-light text-rose-600 transition group-hover:text-rose-700 dark:text-rose-400 dark:group-hover:text-rose-300"
                                            >
                                                {course.title}
                                            </Link>
                                            <span className="shrink-0 rounded-sm bg-rose-100 px-3 py-1 font-serif text-xs uppercase tracking-wider text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                {course.status === 'published' ? 'Open' : 'Closed'}
                                            </span>
                                        </div>

                                        {course.cover_image && (
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src={
                                                        course.cover_image.startsWith('http')
                                                            ? course.cover_image
                                                            : `/storage/${course.cover_image}`
                                                    }
                                                    alt={course.title}
                                                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="rounded-full border border-rose-600 px-3 py-1 text-xs text-rose-600 dark:border-rose-500 dark:text-rose-400">
                                                {course.level ?? 'All levels'}
                                            </span>
                                            {course.category && (
                                                <span className="text-sm text-gray-600 dark:text-slate-400">
                                                    {course.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="inline-flex items-center gap-2 font-serif text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                                            >
                                                Read more →
                                            </Link>
                                        </div>
                                    </article>
                                ))}

                                {courses.length === 0 && (
                                    <div className="col-span-full rounded-lg border border-dashed border-rose-300 p-12 text-center dark:border-rose-800">
                                        <p className="font-serif text-lg text-gray-600 dark:text-slate-400">
                                            Tidak ada course yang cocok. Ubah filter atau coba lagi nanti.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
