import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login } from '@/routes';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, User, Layers, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
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

type RelatedCourse = {
    id: string;
    slug: string;
    title: string;
    cover_image?: string | null;
    level?: string | null;
    teacher?: string | null;
    category?: string | null;
};

export default function PublicCourse({
    course,
    enrollment,
    comments,
    related_courses,
}: {
    course: Course;
    enrollment: Enrollment;
    comments: Comment[];
    related_courses: RelatedCourse[];
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

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-rose-50 text-[#3a1b14] transition-colors duration-300 dark:from-[#0b1021] dark:via-slate-900 dark:to-slate-950 dark:text-white">
                <Head title={course.title} />
                <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 md:px-6">
                    <div className="flex items-center gap-3 text-sm text-[#b23a22] dark:text-orange-200">
                        <ArrowLeft className="size-4" />
                        <Link href="/" className="hover:underline">
                            Back to courses
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-[#e3472420] bg-white/80 shadow-lg dark:border-orange-400/20 dark:bg-white/5">
                        <img
                            src={
                                course.cover_image && course.cover_image.startsWith('http')
                                    ? course.cover_image
                                    : course.cover_image
                                      ? `/storage/${course.cover_image}`
                                      : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60'
                            }
                            alt={course.title}
                            className="h-80 w-full object-cover"
                        />
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                        <div className="space-y-6">
                            <div className="space-y-2 border-t-4 border-[#e34724] pt-4 dark:border-orange-300">
                                <div className="text-xs uppercase tracking-[0.2em] text-[#c24b2c] dark:text-orange-200">
                                    {course.category ?? 'General'}
                                </div>
                                <h1 className="text-3xl font-semibold text-[#3a1b14] dark:text-orange-100">
                                    {course.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a3322] dark:text-orange-100">
                                    <Link
                                        href={course.teacher_slug ? `/teachers/${course.teacher_slug}` : '#'}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#e34724] px-3 py-1 text-[#e34724] transition hover:bg-[#e3472410] dark:border-orange-300 dark:text-orange-200 dark:hover:bg-orange-500/10"
                                    >
                                        <User className="size-4" />
                                        {course.teacher ?? 'TBD'}
                                    </Link>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#e34724] px-3 py-1 text-[#e34724] dark:border-orange-300 dark:text-orange-200">
                                        <ShieldCheck className="size-4" />
                                        {course.status}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#e34724] px-3 py-1 text-[#e34724] dark:border-orange-300 dark:text-orange-200">
                                        <BookOpen className="size-4" />
                                        {course.level ?? 'All levels'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-[#e3472420] pt-4 dark:border-orange-300/30">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#3a1b14] dark:text-orange-100">
                                    <Layers className="size-4" />
                                    Deskripsi Course
                                </div>
                                <p className="leading-relaxed text-[#3a1b14] dark:text-orange-100/90">
                                    {course.description ||
                                        'Tidak ada deskripsi. Course ini siap digunakan untuk pembelajaran.'}
                                </p>
                            </div>

                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                <div className="rounded-xl border border-[#e3472420] bg-white/70 px-4 py-3 text-[#3a1b14] shadow-sm dark:border-orange-300/20 dark:bg-white/5 dark:text-orange-50">
                                    <div className="text-xs uppercase tracking-[0.2em] text-[#c24b2c] dark:text-orange-200">
                                        Modules
                                    </div>
                                    <div className="text-xl font-semibold">{course.modules_count}</div>
                                </div>
                                <div className="rounded-xl border border-[#e3472420] bg-white/70 px-4 py-3 text-[#3a1b14] shadow-sm dark:border-orange-300/20 dark:bg-white/5 dark:text-orange-50">
                                    <div className="text-xs uppercase tracking-[0.2em] text-[#c24b2c] dark:text-orange-200">
                                        Lessons
                                    </div>
                                    <div className="text-xl font-semibold">{course.lessons_count}</div>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-4 rounded-2xl border border-[#e3472420] bg-white/80 p-5 shadow-sm dark:border-orange-300/20 dark:bg-white/5">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-[#e34724] dark:text-orange-200">Enroll</p>
                                <p className="text-xs text-[#7a3322] dark:text-orange-100/80">
                                    Course ini gratis. Klik enroll untuk mulai belajar.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={enroll}
                                disabled={!!enrollment}
                                className="w-full rounded-full border border-[#e34724] px-4 py-3 text-sm font-semibold text-[#e34724] transition hover:bg-[#e3472410] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:border-orange-300 dark:text-orange-200 dark:hover:bg-orange-500/10 dark:disabled:border-slate-600 dark:disabled:text-slate-500"
                            >
                                {enrollment ? `Enrolled (${enrollment.status})` : 'Enroll now'}
                            </button>
                            {!auth.user && (
                                <p className="text-xs text-[#7a3322] dark:text-orange-100/80">
                                    Log in untuk daftar:{' '}
                                    <Link href={login()} className="underline">
                                        Login
                                    </Link>{' '}
                                    atau{' '}
                                    <Link href={dashboard()} className="underline">
                                        Dashboard
                                    </Link>
                                </p>
                            )}
                        </aside>
                    </div>

                    <section className="space-y-4 border-t border-[#e3472420] pt-6 dark:border-orange-300/30">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#3a1b14] dark:text-orange-100">
                            <Sparkles className="size-4 text-[#e34724] dark:text-orange-200" />
                            Komentar
                        </div>
                        {isEnrolled && (
                            <form
                                onSubmit={submitComment}
                                className="space-y-2 rounded-xl border border-[#e3472420] bg-white/70 p-4 shadow-sm dark:border-orange-300/20 dark:bg-white/5"
                            >
                                <textarea
                                    className="w-full rounded-lg border border-[#e3472420] bg-transparent p-3 text-sm text-[#3a1b14] placeholder:text-[#c24b2c80] focus:border-[#e34724] focus:outline-none dark:border-orange-300/30 dark:text-orange-50 dark:placeholder:text-orange-200/60"
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
                                            className="rounded-full border border-[#e3472420] px-4 py-2 text-sm text-[#3a1b14] transition hover:bg-[#e3472410] dark:border-orange-300/30 dark:text-orange-100 dark:hover:bg-orange-500/10"
                                        >
                                            Batal
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="rounded-full bg-[#e34724] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c63a1c] dark:bg-orange-300 dark:text-[#0b1021] dark:hover:bg-orange-200"
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
                                    className="rounded-xl border border-[#e3472420] bg-white/70 p-4 shadow-sm dark:border-orange-300/20 dark:bg-white/5"
                                >
                                    <div className="flex items-center justify-between text-xs text-[#7a3322] dark:text-orange-100/80">
                                        <span className="font-semibold text-[#3a1b14] dark:text-orange-100">
                                            {comment.user ?? 'Student'}
                                        </span>
                                        <span>{comment.created_at ?? ''}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-[#3a1b14] dark:text-orange-50">
                                        {comment.body}
                                    </p>
                                    {comment.can_edit && (
                                        <div className="mt-2 flex gap-2 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(comment)}
                                                className="text-[#e34724] hover:underline dark:text-orange-200"
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
                                <div className="rounded-xl border border-dashed border-[#e3472440] p-4 text-sm text-[#7a3322] dark:border-orange-300/30 dark:text-orange-100/80">
                                    Belum ada komentar.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-[#e3472420] pt-8 dark:border-orange-300/30">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#e34724] dark:text-orange-200">
                            Course lainnya
                        </div>
                        {related_courses && related_courses.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-3">
                                {related_courses.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/courses/${item.slug}`}
                                        className="group block rounded-2xl border border-[#e3472420] bg-white/70 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-orange-300/30 dark:bg-white/5"
                                    >
                                        {item.cover_image && (
                                            <div className="mb-3 overflow-hidden rounded-xl border border-[#e3472420] bg-[#f6e9e3] dark:border-orange-300/30 dark:bg-orange-500/10">
                                                <img
                                                    src={
                                                        item.cover_image.startsWith('http')
                                                            ? item.cover_image
                                                            : `/storage/${item.cover_image}`
                                                    }
                                                    alt={item.title}
                                                    className="h-32 w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase tracking-[0.15em] text-[#c24b2c] dark:text-orange-200">
                                                {item.category ?? 'General'}
                                            </p>
                                            <p className="text-lg font-semibold text-[#3a1b14] transition group-hover:text-[#e34724] dark:text-orange-100 dark:group-hover:text-orange-200">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-[#7a3322] dark:text-orange-100/80">
                                                {item.teacher ?? 'Instruktur TBD'} · {item.level ?? 'All levels'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-[#e3472440] p-4 text-sm text-[#7a3322] dark:border-orange-300/30 dark:text-orange-100/80">
                                Belum ada course lain yang direkomendasikan.
                            </div>
                        )}
                    </section>
                </header>
            </div>
        </PublicLayout>
    );
}
