import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Search } from 'lucide-react';

type Course = {
    id: string;
    title: string;
    description?: string | null;
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
                label: 'Masuk dashboard',
            };
        }

        return {
            href: login(),
            label: 'Log in',
        };
    }, [auth.user]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-900 transition-colors duration-300 dark:from-[#0b1021] dark:via-[#0b1021] dark:to-[#0f162e] dark:text-white">
            <Head title="E-Learn" />
            <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-10 md:flex-row md:items-center md:justify-between md:pt-14">
                <div className="flex w-full items-center justify-end md:absolute md:right-6 md:top-6">
                    <AppearanceToggleDropdown />
                </div>
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-blue-900 ring-1 ring-black/10 dark:bg-white/5 dark:text-blue-100 dark:ring-white/10">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-200">
                            <GraduationCap className="size-3.5" />
                        </span>
                        Enterprise-ready LMS blueprint
                    </div>
                    <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 md:text-5xl dark:text-white">
                        Bangun kurikulum yang rapi, multi-tenant ready, dengan
                        peran yang jelas.
                    </h1>
                    <p className="text-pretty text-base text-slate-700 dark:text-blue-100/80">
                        Jelajahi course, kelola tenant sekolah, dan buat kelas
                        interaktif dengan quiz, assignment, dan progress
                        tracking real-time.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={heroCta.href}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-black hover:shadow-blue-500/30 dark:bg-white dark:text-[#0b1021] dark:hover:bg-white/90"
                        >
                            {heroCta.label}
                            <ArrowRight className="size-4" />
                        </Link>
                        {canRegister && !auth.user && (
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-white/10 dark:text-white dark:ring-white/20 dark:hover:bg-white/15"
                            >
                                Daftar sebagai student
                            </Link>
                        )}
                    </div>
                </div>
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 blur-3xl">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-300/30 via-pink-200/20 to-indigo-200/30 dark:from-blue-500/20 dark:via-fuchsia-400/10 dark:to-indigo-400/20" />
                    </div>
                    <div className="relative rounded-2xl bg-white/80 p-6 ring-1 ring-slate-200 backdrop-blur dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-blue-100/70">
                                    Fokus pada kurikulum
                                </p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Course builder terstruktur
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-700 dark:text-blue-100/80">
                            Hierarki Course → Module → Lesson dengan assessment
                            dan attachment bawaan.
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16">
                <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-blue-100/70">
                                Jelajahi course
                            </p>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Cari materi yang kamu butuhkan
                            </h2>
                        </div>
                        <div className="relative w-full max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-blue-100/60" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari judul atau deskripsi course"
                                className="w-full rounded-full border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-blue-100/60"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <span
                                key={category.id}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15"
                            >
                                {category.name}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="border-slate-200 bg-white/90 text-slate-900 ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:ring-white/10"
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {course.title}
                                </CardTitle>
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
                                    <span>
                                        {course.teacher ?? 'Instructor TBD'}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                                        {course.level ?? 'All levels'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700 dark:text-blue-100/70">
                                        {course.price
                                            ? `Rp ${course.price}`
                                            : 'Gratis'}
                                    </span>
                                    <Link
                                        href={auth.user ? dashboard() : register()}
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
                            Tidak ada course yang cocok. Coba ubah kata kunci
                            atau cek kembali nanti.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
