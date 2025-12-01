import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock3, PlayCircle, BookOpenText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Lesson = {
    id: string;
    title: string;
    content?: string | null;
    type: string;
    is_preview: boolean;
    sort_order: number;
    completed: boolean;
    video_url?: string | null;
    duration?: number | null;
    quiz?: {
        id: string;
        passing_grade?: number | null;
        time_limit?: number | null;
        questions_count: number;
        last_attempt?: {
            score: number | null;
            passed: boolean;
            submitted_at: string | null;
        } | null;
    } | null;
    assignment?: {
        id: string;
        due_date?: string | null;
        max_score?: number | null;
        submission?: {
            submitted_at: string | null;
            grade: number | null;
            feedback_text: string | null;
        } | null;
    } | null;
};

type Module = {
    id: string;
    title: string;
    lessons: Lesson[];
};

type Course = {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    cover_image?: string | null;
    teacher?: {
        name?: string | null;
    };
};

type Progress = {
    total_lessons: number;
    completed_lessons: number;
    percentage: number;
};

export default function StudentCourse({
    course,
    modules,
    progress,
}: {
    course: Course;
    modules: Module[];
    progress: Progress;
}) {
    const initialLessonId = (() => {
        const flattened = modules.flatMap((module) => module.lessons);
        const firstIncomplete = flattened.find((lesson) => !lesson.completed);

        return firstIncomplete?.id ?? flattened[0]?.id ?? null;
    })();

    const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId);
    const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

    const allLessons = useMemo(
        () => modules.flatMap((module) => module.lessons),
        [modules],
    );

    useEffect(() => {
        if (!activeLessonId) {
            return;
        }

        const stillExists = allLessons.some((lesson) => lesson.id === activeLessonId);

        if (!stillExists) {
            setActiveLessonId(allLessons[0]?.id ?? null);
        }
    }, [activeLessonId, allLessons]);

    const activeLesson = useMemo(
        () => allLessons.find((lesson) => lesson.id === activeLessonId) ?? null,
        [activeLessonId, allLessons],
    );

    const parseYouTubeEmbed = (url?: string | null): { isYouTube: boolean; embed?: string } => {
        if (!url) {
            return { isYouTube: false };
        }

        try {
            const parsed = new URL(url);
            const host = parsed.hostname;

            if (!host.includes('youtube.com') && !host.includes('youtu.be')) {
                return { isYouTube: false };
            }

            let videoId: string | null = null;

            if (host.includes('youtu.be')) {
                videoId = parsed.pathname.replace('/', '') || null;
            }

            if (host.includes('youtube.com')) {
                if (parsed.pathname.startsWith('/embed/')) {
                    videoId = parsed.pathname.replace('/embed/', '') || null;
                } else {
                    videoId = parsed.searchParams.get('v');
                }
            }

            if (!videoId) {
                return { isYouTube: false };
            }

            const si = parsed.searchParams.get('si');
            const embed = `https://www.youtube.com/embed/${videoId}${
                si ? `?si=${si}` : ''
            }`;

            return { isYouTube: true, embed };
        } catch (error) {
            return { isYouTube: false };
        }
    };

    const lessonMediaUrl = activeLesson?.video_url
        ? activeLesson.video_url.startsWith('http')
            ? activeLesson.video_url
            : `/storage/${activeLesson.video_url}`
        : null;
    const youTubeMedia = parseYouTubeEmbed(lessonMediaUrl);

    const markComplete = (lessonId: string) => {
        setCompletingLessonId(lessonId);
        router.post(
            `/student/courses/${course.id}/lessons/${lessonId}/complete`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setCompletingLessonId(null),
                onSuccess: () => setActiveLessonId(lessonId),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/student/dashboard' },
                { title: course.title, href: '#' },
            ]}
        >
            <Head title={course.title} />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="gap-1">
                                    <BookOpenText className="size-3.5" />
                                    {course.teacher?.name ?? 'Teacher'}
                                </Badge>
                                <Badge variant="outline">Progress {progress.percentage}%</Badge>
                                <Badge variant="outline">
                                    {progress.completed_lessons}/{progress.total_lessons} lesson
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl">{course.title}</CardTitle>
                            {course.description && (
                                <p className="text-sm text-muted-foreground">
                                    {course.description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeLesson ? (
                                <>
                                    {course.cover_image && (
                                        <div className="overflow-hidden rounded-xl border border-border/60">
                                            <img
                                                src={
                                                    course.cover_image.startsWith('http')
                                                        ? course.cover_image
                                                        : `/storage/${course.cover_image}`
                                                }
                                                alt={course.title}
                                                className="h-56 w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary" className="gap-1">
                                                <PlayCircle className="size-4" />
                                                {activeLesson.type}
                                            </Badge>
                                            {activeLesson.duration && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock3 className="size-3.5" />
                                                    {activeLesson.duration} menit
                                                </Badge>
                                            )}
                                            {activeLesson.is_preview && (
                                                <Badge variant="outline">Preview</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activeLesson.completed ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                                                        <CheckCircle2 className="size-4" />
                                                        Selesai
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/student/courses/${course.id}/lessons/${activeLesson.id}/complete`,
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                    >
                                                        Batalkan
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => markComplete(activeLesson.id)}
                                                    disabled={completingLessonId === activeLesson.id}
                                                >
                                                    Tandai selesai
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {(activeLesson.quiz || activeLesson.assignment) && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {activeLesson.quiz && (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    <Link
                                                        href={`/student/courses/${course.id}/lessons/${activeLesson.id}/quiz`}
                                                    >
                                                        Kerjakan quiz
                                                    </Link>
                                                </Button>
                                            )}
                                            {activeLesson.assignment && (
                                                <Button asChild size="sm" variant="outline">
                                                    <Link
                                                        href={`/student/courses/${course.id}/lessons/${activeLesson.id}/assignment`}
                                                    >
                                                        Kumpulkan tugas
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {lessonMediaUrl && youTubeMedia.isYouTube && youTubeMedia.embed && (
                                        <div className="overflow-hidden rounded-xl border border-border/60 bg-black/70">
                                            <div className="relative w-full pb-[56.25%]">
                                                <iframe
                                                    className="absolute inset-0 h-full w-full"
                                                    src={youTubeMedia.embed}
                                                    title={activeLesson.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {lessonMediaUrl && !youTubeMedia.isYouTube && (
                                        <div className="overflow-hidden rounded-xl border border-border/60 bg-black/70">
                                            <video
                                                className="h-full w-full"
                                                controls
                                                poster={
                                                    course.cover_image
                                                        ? course.cover_image.startsWith('http')
                                                            ? course.cover_image
                                                            : `/storage/${course.cover_image}`
                                                        : undefined
                                                }
                                            >
                                                <source src={lessonMediaUrl} />
                                                <track kind="captions" />
                                                Browser kamu tidak mendukung video.
                                            </video>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
                                        <div className="text-sm font-semibold text-foreground">
                                            {activeLesson.title}
                                        </div>
                                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                                            {activeLesson.content ?? 'Belum ada konten pada lesson ini.'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                    Belum ada lesson yang bisa dipelajari.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                <span>Modul &amp; Lesson</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {progress.total_lessons > 0
                                        ? `${progress.completed_lessons}/${progress.total_lessons} selesai`
                                        : 'Belum ada lesson'}
                                </span>
                            </CardTitle>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{
                                        width: `${Math.min(progress.percentage ?? 0, 100)}%`,
                                    }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {modules.length === 0 && (
                                <p className="text-sm text-muted-foreground">Belum ada modul.</p>
                            )}
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="space-y-2 rounded-lg border border-border/60 p-3"
                                >
                                    <div className="text-sm font-semibold text-foreground">
                                        {module.title}
                                    </div>
                                    <div className="space-y-2">
                                        {module.lessons.map((lesson) => (
                                            <button
                                                key={lesson.id}
                                                type="button"
                                                onClick={() => setActiveLessonId(lesson.id)}
                                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                                                    lesson.id === activeLessonId
                                                        ? 'border-emerald-500/60 bg-emerald-500/10'
                                                        : 'border-border/60 bg-muted/40 hover:border-emerald-500/40'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-foreground">
                                                        {lesson.title}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {lesson.type}
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lesson.quiz && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[11px]"
                                                            >
                                                                Quiz • {lesson.quiz.questions_count} soal
                                                            </Badge>
                                                        )}
                                                        {lesson.assignment && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[11px]"
                                                            >
                                                                Tugas • max {lesson.assignment.max_score ?? 0}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {lesson.completed ? (
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="size-4" />
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-xs"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                router.delete(
                                                                    `/student/courses/${course.id}/lessons/${lesson.id}/complete`,
                                                                    { preserveScroll: true },
                                                                );
                                                            }}
                                                        >
                                                            Batalkan
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            markComplete(lesson.id);
                                                        }}
                                                        disabled={completingLessonId === lesson.id}
                                                    >
                                                        Selesai
                                                    </Button>
                                                )}
                                            </button>
                                        ))}
                                        {module.lessons.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Belum ada lesson.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Butuh kembali ke katalog?</span>
                    <Link href="/" className="text-foreground underline">
                        Lihat course publik
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
