import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

type Teacher = {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    courses_count: number;
    initials: string;
};

export default function TeachersIndex({ teachers }: { teachers: Teacher[] }) {
    const [search, setSearch] = useState('');
    const filtered = useMemo(
        () =>
            teachers.filter((teacher) => {
                const haystack = `${teacher.name} ${teacher.bio ?? ''}`.toLowerCase();
                return haystack.includes(search.toLowerCase());
            }),
        [teachers, search],
    );

    return (
        <PublicLayout>
            <Head title="Teachers" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-8 md:px-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                    <div className="flex flex-col gap-3">
                        <h1 className="font-serif text-3xl font-light text-rose-600 dark:text-rose-300">Teachers</h1>
                        <p className="text-sm text-slate-600 dark:text-blue-100/70">
                            Temukan pengajar dan lihat course yang mereka kelola.
                        </p>
                        <div className="relative max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-rose-400 dark:text-rose-300" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau bio"
                                className="w-full rounded-full border-2 border-rose-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-rose-200 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-rose-500/40 dark:bg-slate-900 dark:text-white dark:placeholder:text-rose-200/60 dark:focus:border-rose-400 dark:focus:ring-rose-900/40"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {filtered.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="flex flex-col gap-4 rounded-xl border border-rose-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-lg font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                                    {teacher.initials}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {teacher.name}
                                        </h2>
                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                            {teacher.courses_count} courses
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-blue-100/80">
                                        {teacher.bio ?? 'Belum ada bio.'}
                                    </p>
                                </div>
                                <Link
                                    href={`/teachers/${teacher.slug}`}
                                    className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:text-rose-800 dark:border-rose-500/40 dark:text-rose-200 dark:hover:border-rose-300 dark:hover:text-white"
                                >
                                    Lihat profil
                                </Link>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-white/20 dark:text-blue-100/70">
                            Tidak ada teacher yang cocok dengan pencarian.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
