import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login } from '@/routes';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
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
    const [showDescription, setShowDescription] = useState(false);

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
            <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 text-[#3a1b14] transition-colors duration-300 dark:from-[#0b1021] dark:via-slate-900 dark:to-slate-950 dark:text-orange-50">
                <Head title={course.title} />
                
                {/* Back Link */}
                <div className="mx-auto max-w-7xl px-6 pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-serif text-sm text-gray-600 hover:text-rose-600 dark:text-orange-200 dark:hover:text-orange-100"
                    >
                        <ArrowLeft className="size-4" />
                        go back
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                        {/* Left Column - Image */}
                        <div className="overflow-hidden rounded-sm">
                            <img
                                src={
                                    course.cover_image && course.cover_image.startsWith('http')
                                        ? course.cover_image
                                        : course.cover_image
                                          ? `/storage/${course.cover_image}`
                                          : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60'
                                }
                                alt={course.title}
                                className="h-[500px] w-full object-cover"
                            />
                        </div>

                        {/* Right Column - Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="font-serif text-5xl font-light leading-tight text-rose-600 lg:text-6xl">
                                    {course.title}
                                </h1>
                                <p className="font-serif text-lg leading-relaxed text-gray-700">
                                    {course.description || 'Tidak ada deskripsi. Course ini siap digunakan untuk pembelajaran.'}
                                </p>
                            </div>

                            {/* Course Meta */}
                            <div className="space-y-4 border-t border-rose-200 pt-6">
                                <div className="font-serif text-sm uppercase tracking-widest text-rose-600">
                                    Enrollment
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Status</span>
                                        <span>{course.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Level</span>
                                        <span>{course.level ?? 'All levels'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Info */}
                            <div className="space-y-2 border-t border-rose-200 pt-6">
                                <div className="font-serif text-sm uppercase tracking-widest text-rose-600">
                                    TEACHER
                                </div>
                                <div className="text-gray-700">
                                    <Link 
                                        href={course.teacher_slug ? `/teachers/${course.teacher_slug}` : '#'}
                                        className="hover:text-rose-600"
                                    >
                                        {course.teacher ?? 'TBD'}
                                    </Link>
                                </div>
                            </div>

                            {/* Course Stats */}
                            <div className="grid grid-cols-2 gap-4 border-t border-rose-200 pt-6">
                                <div>
                                    <div className="font-serif text-xs uppercase tracking-widest text-rose-600">
                                        Modules
                                    </div>
                                    <div className="text-3xl font-light text-gray-900">{course.modules_count}</div>
                                </div>
                                <div>
                                    <div className="font-serif text-xs uppercase tracking-widest text-rose-600">
                                        Lessons
                                    </div>
                                    <div className="text-3xl font-light text-gray-900">{course.lessons_count}</div>
                                </div>
                            </div>

                            {/* Enroll Button */}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={enroll}
                                    disabled={!!enrollment}
                                    className="w-full rounded-sm border-2 border-rose-600 bg-transparent px-8 py-4 font-serif text-sm uppercase tracking-widest text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                >
                                    {enrollment ? `ENROLLED (${enrollment.status})` : 'RESERVE →'}
                                </button>
                                {!auth.user && (
                                    <p className="mt-4 text-center text-xs text-gray-600">
                                        <Link href={login()} className="underline hover:text-rose-600">
                                            Log in
                                        </Link>{' '}
                                        to enroll in this course
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section with Toggle */}
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="border-t-2 border-rose-600 pt-8">
                        <button
                            onClick={() => setShowDescription(!showDescription)}
                            className="flex w-full items-center justify-between pb-8"
                        >
                            <h2 className="font-serif text-4xl font-light text-gray-900">Course Details</h2>
                            <span className="text-3xl text-rose-600">{showDescription ? '×' : '+'}</span>
                        </button>
                        
                        {showDescription && (
                            <div className="space-y-6 pb-8">
                                <div className="space-y-4">
                                    <h3 className="font-serif text-2xl font-light text-gray-900">About This Course</h3>
                                    <p className="leading-relaxed text-gray-700">
                                        {course.description || 'Tidak ada deskripsi. Course ini siap digunakan untuk pembelajaran.'}
                                    </p>
                                </div>

                                <div className="border-t-2 border-rose-600 pt-6">
                                    <h3 className="font-serif text-2xl font-light text-gray-900">Category</h3>
                                    <p className="mt-2 text-gray-700">{course.category ?? 'General'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                {isEnrolled && (
                    <div className="border-t border-rose-200 bg-white py-16">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="space-y-8">
                                <h2 className="font-serif text-3xl font-light text-gray-900">
                                    <Sparkles className="mb-1 mr-2 inline size-5 text-rose-600" />
                                    Comments
                                </h2>

                                {/* Comment Form */}
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full rounded-sm border border-rose-200 p-4 text-gray-900 placeholder:text-gray-400 focus:border-rose-600 focus:outline-none"
                                        rows={4}
                                        placeholder="Share your thoughts as an enrolled student..."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-3">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="rounded-sm border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => submitComment(e as any)}
                                            className="rounded-sm border-2 border-rose-600 bg-rose-600 px-6 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                                        >
                                            {editingId ? 'Update' : 'Submit'}
                                        </button>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="border-l-2 border-rose-600 pl-6">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="font-semibold text-gray-900">{comment.user ?? 'Student'}</span>
                                                <span className="text-gray-500">{comment.created_at ?? ''}</span>
                                            </div>
                                            <p className="mb-3 text-gray-700">{comment.body}</p>
                                            {comment.can_edit && (
                                                <div className="flex gap-4 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(comment)}
                                                        className="text-rose-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteComment(comment.id)}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <div className="rounded-sm border border-dashed border-rose-300 p-8 text-center text-sm text-gray-600">
                                            No comments yet. Be the first to share your thoughts!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Courses */}
                {related_courses && related_courses.length > 0 && (
                    <div className="border-t border-rose-200 py-16">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="mb-8 font-serif text-sm uppercase tracking-widest text-rose-600">
                                You may be interested in them
                            </div>
                            <div className="grid gap-8 md:grid-cols-3">
                                {related_courses.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/courses/${item.slug}`}
                                        className="group block space-y-4"
                                    >
                                        {item.cover_image && (
                                            <div className="overflow-hidden rounded-sm">
                                                <img
                                                    src={
                                                        item.cover_image.startsWith('http')
                                                            ? item.cover_image
                                                            : `/storage/${item.cover_image}`
                                                    }
                                                    alt={item.title}
                                                    className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <p className="text-xs uppercase tracking-[0.15em] text-rose-600">
                                                {item.category ?? 'General'}
                                            </p>
                                            <h3 className="font-serif text-2xl font-light text-gray-900 transition group-hover:text-rose-600">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {item.teacher ?? 'Instruktur TBD'} · {item.level ?? 'All levels'}
                                            </p>
                                            <div className="pt-2">
                                                <span className="font-serif text-sm uppercase tracking-widest text-rose-600">
                                                    READ MORE →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
