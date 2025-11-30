import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login } from '@/routes';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, ShoppingBag, User, Layers, BookOpen, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';

type Course = {
    id: string;
    title: string;
    slug: string;
    status: string;
    description?: string | null;
    cover_image?: string | null;
    price?: string | number | null;
    level?: string | null;
    teacher?: string | null;
    category?: string | null;
    modules_count: number;
    lessons_count: number;
    teacher_slug?: string | null;
};

type Enrollment = {
    id: string;
    status: string;
} | null;

type Comment = {
    id: string;
    body: string;
    user: string | null;
    user_id: string;
    created_at?: string | null;
    can_edit: boolean;
};

export default function PublicCourse({
    course,
    enrollment,
    comments,
}: {
    course: Course;
    enrollment: Enrollment;
    comments: Comment[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [body, setBody] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const isEnrolled = useMemo(() => !!enrollment, [enrollment]);

    const enroll = () => {
        if (!auth.user) {
            router.visit(login());
            return;
        }

        router.post(`/courses/${course.slug}/enroll`, {}, { preserveScroll: true });
    };

    const submitComment = (event: FormEvent) => {
        event.preventDefault();
        if (!body.trim()) {
            return;
        }

        if (editingId) {
            router.put(
                `/courses/${course.slug}/comments/${editingId}`,
                { body },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setBody('');
                        setEditingId(null);
                    },
                },
            );
        } else {
            router.post(
                `/courses/${course.slug}/comments`,
                { body },
                {
                    preserveScroll: true,
                    onSuccess: () => setBody(''),
                },
            );
        }
    };

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setBody(comment.body);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setBody('');
    };

    const deleteComment = (commentId: string) => {
        router.delete(`/courses/${course.slug}/comments/${commentId}`, {
            preserveScroll: true,
        });
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
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b1021] dark:text-white">
                <Head title={course.title} />
                <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6 md:pt-10">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-blue-100/70">
                    <div className="flex items-center gap-2">
                        <ArrowLeft className="size-4" />
                        <Link href="/" className="hover:underline">
                            Kembali ke katalog
                        </Link>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-blue-100/60">
                        Pastikan data benar sebelum mendaftar.
                    </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                        <div className="overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10">
                            <img
                                src={
                                    course.cover_image && course.cover_image.startsWith('http')
                                        ? course.cover_image
                                    : course.cover_image
                                            ? `/storage/${course.cover_image}`
                                            : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60'
                                }
                                alt={course.title}
                                className="h-72 w-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-blue-100/60">
                                {course.category ?? 'General'}
                            </div>
                            <h1 className="text-3xl font-semibold text-foreground">{course.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-blue-100/70">
                                <Link
                                    href={course.teacher_slug ? `/teachers/${course.teacher_slug}` : '#'}
                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/20"
                                >
                                    <User className="size-4" /> {course.teacher ?? 'TBD'}
                                </Link>
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                                    <ShieldCheck className="size-4" /> {course.status}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                                    <BookOpen className="size-4" /> {course.level ?? 'All levels'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-2 rounded-xl border border-slate-200/70 bg-white p-4 text-sm ring-1 ring-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
                            <div className="mb-2 flex items-center gap-2 text-foreground">
                                <Layers className="size-4" />
                                <span className="font-semibold">Deskripsi Course</span>
                            </div>
                            <p className="leading-relaxed text-slate-700 dark:text-blue-100/80">
                                {course.description ||
                                    'Tidak ada deskripsi. Course ini siap digunakan untuk pembelajaran.'}
                            </p>
                        </div>

                        <div className="grid gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm ring-1 ring-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:ring-white/10 md:grid-cols-2">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-blue-100/70">Modules</span>
                                <span className="font-semibold text-foreground">{course.modules_count}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-blue-100/70">Lessons</span>
                                <span className="font-semibold text-foreground">{course.lessons_count}</span>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                        <div className="space-y-1">
                            <p className="text-sm text-slate-600 dark:text-blue-100/70">Rincian Course</p>
                            <p className="text-2xl font-semibold text-foreground">{formatIDR(course.price)}</p>
                            <p className="text-xs text-slate-500 dark:text-blue-100/60">
                                {course.price ? 'Akses penuh setelah pembayaran.' : 'Gratis, daftar sekarang.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={enroll}
                            disabled={!!enrollment}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            <ShoppingBag className="size-4" />
                            {enrollment
                                ? `Enrolled (${enrollment.status})`
                                : course.price
                                    ? 'Beli sekarang'
                                    : 'Daftar sekarang'}
                        </button>
                        {!auth.user && (
                            <p className="text-xs text-slate-500 dark:text-blue-100/60">
                                Log in untuk daftar: <Link href={login()} className="underline">Login</Link> atau{' '}
                                <Link href={dashboard()} className="underline">Dashboard</Link>
                            </p>
                        )}
                    </aside>
                </div>

                <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-0">
                    <h2 className="text-lg font-semibold text-foreground">Komentar</h2>
                    {isEnrolled && (
                        <form onSubmit={submitComment} className="space-y-2 rounded-xl border border-slate-200/70 bg-white/80 p-4 ring-1 ring-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
                            <textarea
                                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-foreground placeholder:text-slate-400 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                rows={3}
                                placeholder="Tulis komentar sebagai student yang sudah enroll..."
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                            />
                            <div className="flex items-center justify-end gap-2">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-foreground transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    {editingId ? 'Update' : 'Kirim'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="rounded-xl border border-slate-200/70 bg-white/80 p-4 ring-1 ring-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:ring-white/10"
                            >
                                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-blue-100/70">
                                    <span className="font-semibold text-foreground">
                                        {comment.user ?? 'Student'}
                                    </span>
                                    <span>{comment.created_at ?? ''}</span>
                                </div>
                                <p className="mt-2 text-sm text-foreground">{comment.body}</p>
                                {comment.can_edit && (
                                    <div className="mt-2 flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(comment)}
                                            className="text-emerald-600 hover:underline dark:text-emerald-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteComment(comment.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-white/15 dark:text-blue-100/70">
                                Belum ada komentar.
                            </div>
                        )}
                    </div>
                </section>
            </header>
            </div>
        </PublicLayout>
    );
}
