import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

type Teacher = {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    courses_count: number;
    initials: string;
};

export default function TeachersIndex({ teachers }: { teachers: Teacher[] }) {
    return (
        <PublicLayout>
            <Head title="Teachers" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 md:px-6">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                    <h1 className="text-2xl font-semibold text-foreground">Teachers</h1>
                    <p className="text-sm text-slate-600 dark:text-blue-100/70">
                        Lihat profil pengajar dan course yang mereka kelola.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teachers.map((teacher) => (
                        <Card key={teacher.id} className="border-slate-200 dark:border-white/10">
                            <CardHeader className="flex flex-row items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
                                    {teacher.initials}
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-foreground">{teacher.name}</CardTitle>
                                    <p className="text-xs text-slate-500 dark:text-blue-100/70">
                                        {teacher.courses_count} courses
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm text-slate-600 dark:text-blue-100/70">
                                <p className="line-clamp-2">{teacher.bio ?? 'Belum ada bio.'}</p>
                                <Link
                                    href={`/teachers/${teacher.slug}`}
                                    className="mt-3 inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-white"
                                >
                                    Lihat profil →
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                    {teachers.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-white/20 dark:text-blue-100/70">
                            Belum ada teacher.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
