import { Input } from '@/components/ui/input';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import PublicLayout from '@/layouts/public-layout';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

type Course = {
    id: string;
    title: string;
    slug: string;
    status: string;
    description?: string | null;
    cover_image?: string | null;
    level?: string | null;
    price?: string | number | null;
    teacher?: string | null;
    category?: string | null;
};

type Category = {
    id: string;
    name: string;
};

export default function PublicHome({
    courses,
    categories,
    filters,
    canRegister,
}: {
    courses: Course[];
    categories: Category[];
    filters: { search?: string | null };
    canRegister: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/',
                { search },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const heroCta = useMemo(() => {
        if (auth.user) {
            return {
                href: dashboard(),
                label: 'Go to Dashboard',
            };
        }

        return {
            href: login(),
            label: 'Log in',
        };
    }, [auth.user]);

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Head title="E-Learn" />
                

                {/* Hero Section */}
                <header className="mx-auto max-w-7xl px-6 py-20">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                        {/* Left Column - Text */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-block rounded-sm bg-rose-100 px-4 py-2 dark:bg-rose-900/30">
                                    <span className="font-serif text-xs uppercase tracking-widest text-rose-700 dark:text-rose-400">
                                        Enterprise-ready LMS
                                    </span>
                                </div>
                                <h1 className="font-serif text-6xl font-light leading-tight text-gray-900 dark:text-white lg:text-7xl">
                                    Bangun kurikulum yang rapi
                                </h1>
                                <p className="font-serif text-xl leading-relaxed text-gray-700 dark:text-slate-300">
                                    Jelajahi course, kelola tenant sekolah, dan buat kelas interaktif dengan quiz, assignment, dan progress tracking real-time.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={heroCta.href}
                                    className="inline-flex items-center gap-2 rounded-sm border-2 border-rose-600 bg-rose-600 px-8 py-4 font-serif text-sm uppercase tracking-widest text-white transition hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600"
                                >
                                    {heroCta.label}
                                    <ArrowRight className="size-4" />
                                </Link>
                                {canRegister && !auth.user && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-sm border-2 border-rose-600 bg-transparent px-8 py-4 font-serif text-sm uppercase tracking-widest text-rose-600 transition hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white"
                                    >
                                        Register
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Image */}
                        <div className="relative">
                            <div className="overflow-hidden rounded-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
                                    alt="Students learning"
                                    className="h-[600px] w-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 rounded-sm bg-white p-6 shadow-lg dark:bg-slate-900 dark:shadow-slate-950">
                                <div className="space-y-2">
                                    <div className="font-serif text-sm uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                        Course Builder
                                    </div>
                                    <p className="text-2xl font-light text-gray-900 dark:text-white">Terstruktur</p>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        Hierarki Course → Module → Lesson
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Search Section */}
                <section className="border-t-2 border-rose-600 bg-white py-16 dark:border-rose-500 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 grid gap-8 lg:grid-cols-2 lg:items-center">
                            <div className="space-y-4">
                                <h2 className="font-serif text-4xl font-light text-gray-900 dark:text-white">
                                    Explore Our Courses
                                </h2>
                                <p className="font-serif text-lg text-gray-700 dark:text-slate-300">
                                    Cari materi yang kamu butuhkan dari berbagai kategori
                                </p>
                            </div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search courses..."
                                    className="w-full rounded-sm border-2 border-gray-200 bg-white py-6 pl-12 font-serif text-gray-900 placeholder:text-gray-400 focus:border-rose-600 focus:outline-none focus:ring-0 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-rose-500"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="mb-8 flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    className="rounded-sm border border-rose-600 bg-transparent px-4 py-2 font-serif text-xs uppercase tracking-widest text-rose-600 transition hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white"
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Courses Grid */}
                <main className="mx-auto max-w-7xl px-6 py-16">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="group block space-y-4"
                            >
                                {/* Course Image */}
                                <div className="overflow-hidden rounded-sm">
                                    <img
                                        src={
                                            course.cover_image
                                                ? course.cover_image.startsWith('http')
                                                    ? course.cover_image
                                                    : `/storage/${course.cover_image}`
                                                : 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80'
                                        }
                                        alt={course.title}
                                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>

                                {/* Course Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-sm bg-rose-100 px-3 py-1 font-serif text-xs uppercase tracking-wider text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                            {course.category ?? 'General'}
                                        </span>
                                        <span className="rounded-sm bg-gray-100 px-3 py-1 font-serif text-xs uppercase tracking-wider text-gray-700 dark:bg-slate-800 dark:text-slate-400">
                                            {course.status}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl font-light text-gray-900 transition group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                                        {course.title}
                                    </h3>

                                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                                        {course.description ?? 'Materi terkurasi dengan quiz, assignment, dan progress tracking.'}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-400">
                                        <span>{course.teacher ?? 'Instructor TBD'}</span>
                                        <span>{course.level ?? 'All levels'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-serif text-lg font-light text-gray-900 dark:text-white">
                                            {course.price ? `Rp ${course.price}` : 'FREE'}
                                        </span>
                                        <span className="font-serif text-sm uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="rounded-sm border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
                            <p className="font-serif text-lg text-gray-600 dark:text-slate-400">
                                Tidak ada course yang cocok. Coba ubah kata kunci atau cek kembali nanti.
                            </p>
                        </div>
                    )}
                </main>

                {/* Footer CTA */}
                <section className="border-t-2 border-rose-600 bg-gradient-to-b from-white to-rose-50 py-20 dark:border-rose-500 dark:from-slate-900 dark:to-slate-950">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-6 font-serif text-5xl font-light text-gray-900 dark:text-white">
                            Ready to Start Learning?
                        </h2>
                        <p className="mb-8 font-serif text-xl text-gray-700 dark:text-slate-300">
                            Join thousands of students already learning with us
                        </p>
                        <Link
                            href={heroCta.href}
                            className="inline-flex items-center gap-2 rounded-sm border-2 border-rose-600 bg-rose-600 px-8 py-4 font-serif text-sm uppercase tracking-widest text-white transition hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600"
                        >
                            Get Started Now
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}