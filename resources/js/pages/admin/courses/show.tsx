import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Lesson = {
    id: string;
    title: string;
    type: string;
    sort_order: number;
    is_preview: boolean;
    content?: string | null;
    video_url?: string | null;
    duration?: number | null;
    quiz?: {
        id: string;
        passing_grade?: number | null;
        time_limit?: number | null;
        questions: {
            id: string;
            question_text: string;
            type: string;
            score: number;
        }[];
    } | null;
    assignment?: {
        id: string;
        due_date?: string | null;
        max_score?: number | null;
    } | null;
};

type Module = {
    id: string;
    title: string;
    sort_order: number;
    lessons: Lesson[];
};

type Course = {
    id: string;
    title: string;
    slug: string;
    status: string;
    level: string | null;
    description?: string | null;
    teacher?: string | null;
    category?: string | null;
};

type PageProps = {
    course: Course;
    modules: Module[];
};

export default function CourseShow({ course, modules }: PageProps) {
    const { url } = usePage();
    const isTeacherRoute = url.startsWith('/teacher/');

    const moduleForm = useForm({
        title: '',
        sort_order: 0,
    });

    const lessonForm = useForm({
        module_id: '',
        title: '',
        type: 'text',
        sort_order: 0,
        is_preview: false,
        content: '',
        video_url: '',
        duration: null as number | null,
    });

    const moduleBaseUrl = isTeacherRoute
        ? `/teacher/courses/${course.id}/modules`
        : `/admin/courses/${course.id}/modules`;

    const lessonBaseUrl = (moduleId: string) =>
        isTeacherRoute
            ? `/teacher/courses/${course.id}/modules/${moduleId}/lessons`
            : `/admin/courses/${course.id}/modules/${moduleId}/lessons`;

    const onModuleSubmit = (event: FormEvent) => {
        event.preventDefault();
        moduleForm.post(moduleBaseUrl, {
            preserveScroll: true,
            onSuccess: () => moduleForm.reset(),
        });
    };

    const onLessonSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!lessonForm.data.module_id) {
            return;
        }

        lessonForm.post(lessonBaseUrl(lessonForm.data.module_id), {
            preserveScroll: true,
            onSuccess: () => lessonForm.reset(),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: isTeacherRoute ? '/teacher/courses' : '/admin/courses' },
                { title: course.title, href: '#' },
            ]}
        >
            <Head title={course.title} />
            <div className="flex flex-col gap-4 p-4">
            <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle>{course.title}</CardTitle>
                            {isTeacherRoute && (
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={`/teacher/courses/${course.id}/students`}>
                                        Students
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {course.teacher ?? 'No teacher'} ·{' '}
                            {course.category ?? 'No category'} · {course.status}
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        <form onSubmit={onModuleSubmit} className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Add module</p>
                            <Input
                                required
                                placeholder="Module title"
                                value={moduleForm.data.title}
                                onChange={(event) =>
                                    moduleForm.setData('title', event.target.value)
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Sort order"
                                value={moduleForm.data.sort_order}
                                onChange={(event) =>
                                    moduleForm.setData('sort_order', Number(event.target.value))
                                }
                            />
                            <Button type="submit" disabled={moduleForm.processing}>
                                {moduleForm.processing ? 'Saving...' : 'Create module'}
                            </Button>
                        </form>

                        <form onSubmit={onLessonSubmit} className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Add lesson</p>
                            <select
                                required
                                value={lessonForm.data.module_id}
                                onChange={(event) =>
                                    lessonForm.setData('module_id', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                            >
                                <option value="">Select module</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.title}
                                    </option>
                                ))}
                            </select>
                            <Input
                                required
                                placeholder="Lesson title"
                                value={lessonForm.data.title}
                                onChange={(event) =>
                                    lessonForm.setData('title', event.target.value)
                                }
                            />
                            <select
                                value={lessonForm.data.type}
                                onChange={(event) =>
                                    lessonForm.setData('type', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                            >
                                <option value="text">Text</option>
                                <option value="video">Video</option>
                                <option value="quiz">Quiz</option>
                                <option value="assignment">Assignment</option>
                            </select>
                            <Input
                                placeholder="Video URL (opsional)"
                                value={lessonForm.data.video_url}
                                onChange={(event) =>
                                    lessonForm.setData('video_url', event.target.value)
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Durasi (menit)"
                                value={lessonForm.data.duration ?? ''}
                                onChange={(event) =>
                                    lessonForm.setData(
                                        'duration',
                                        event.target.value === ''
                                            ? null
                                            : Number(event.target.value),
                                    )
                                }
                            />
                            <textarea
                                placeholder="Konten / deskripsi (opsional)"
                                value={lessonForm.data.content}
                                onChange={(event) =>
                                    lessonForm.setData('content', event.target.value)
                                }
                                className="h-24 w-full rounded-lg border border-border bg-background p-3 text-sm"
                            />
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={lessonForm.data.is_preview}
                                    onChange={(event) =>
                                        lessonForm.setData('is_preview', event.target.checked)
                                    }
                                />
                                Preview
                            </label>
                            <Button type="submit" disabled={lessonForm.processing}>
                                {lessonForm.processing ? 'Saving...' : 'Create lesson'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Modules & lessons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {modules.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                Belum ada modul.
                            </div>
                        )}
                        {modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                moduleBaseUrl={moduleBaseUrl}
                                lessonBaseUrl={lessonBaseUrl}
                                isTeacherRoute={isTeacherRoute}
                                courseId={course.id}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function ModuleCard({
    module,
    moduleBaseUrl,
    lessonBaseUrl,
    isTeacherRoute,
    courseId,
}: {
    module: Module;
    moduleBaseUrl: string;
    lessonBaseUrl: (moduleId: string) => string;
    isTeacherRoute: boolean;
    courseId: string;
}) {
    const form = useForm({
        title: module.title,
        sort_order: module.sort_order,
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        form.put(`${moduleBaseUrl}/${module.id}`, {
            preserveScroll: true,
        });
    };

    const onDelete = () => {
        router.delete(`${moduleBaseUrl}/${module.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-3 rounded-lg border border-border/70 p-3">
            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-3 rounded-md bg-muted/30 p-3 text-sm md:flex-row md:items-end"
            >
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        className="md:max-w-sm"
                    />
                    <Input
                        type="number"
                        value={form.data.sort_order}
                        onChange={(event) =>
                            form.setData('sort_order', Number(event.target.value))
                        }
                        className="md:w-28"
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onDelete}>
                        Delete
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </div>
            </form>

            <div className="space-y-2 rounded-lg border border-dashed border-border/60 p-2">
                {module.lessons.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Belum ada lesson di modul ini.
                    </p>
                )}
                {module.lessons.map((lesson) => (
                    <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        moduleId={module.id}
                        lessonBaseUrl={lessonBaseUrl}
                        isTeacherRoute={isTeacherRoute}
                        courseId={courseId}
                    />
                ))}
            </div>
        </div>
    );
}

function LessonRow({
    lesson,
    moduleId,
    lessonBaseUrl,
    isTeacherRoute,
    courseId,
}: {
    lesson: Lesson;
    moduleId: string;
    lessonBaseUrl: (moduleId: string) => string;
    isTeacherRoute: boolean;
    courseId: string;
}) {
    const form = useForm({
        title: lesson.title,
        type: lesson.type,
        sort_order: lesson.sort_order,
        is_preview: lesson.is_preview,
        content: lesson.content ?? '',
        video_url: lesson.video_url ?? '',
        duration: lesson.duration ?? null,
        module_id: moduleId,
    });
    const quizForm = useForm({
        passing_grade: lesson.quiz?.passing_grade ?? '',
        time_limit: lesson.quiz?.time_limit ?? '',
    });
    const questionForm = useForm({
        type: 'multiple_choice',
        question_text: '',
        score: 10,
        choice_a: '',
        choice_b: '',
        choice_c: '',
        choice_d: '',
        answer: 'A',
    });
    const assignmentForm = useForm({
        due_date: lesson.assignment?.due_date ?? '',
        max_score: lesson.assignment?.max_score ?? 100,
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        form.put(`${lessonBaseUrl(moduleId)}/${lesson.id}`, {
            preserveScroll: true,
        });
    };

    const onDelete = () => {
        router.delete(`${lessonBaseUrl(moduleId)}/${lesson.id}`, {
            preserveScroll: true,
        });
    };

    const basePrefix = isTeacherRoute ? '/teacher' : '/admin';
    const quizBaseUrl = `${basePrefix}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/quizzes`;
    const questionBaseUrl = (quizId: string) =>
        `${basePrefix}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/quizzes/${quizId}/questions`;
    const assignmentUrl = `${basePrefix}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/assignments${
        lesson.assignment ? `/${lesson.assignment.id}` : ''
    }`;

    return (
        <div className="space-y-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        className="md:max-w-xs"
                    />
                    <select
                        value={form.data.type}
                        onChange={(event) => form.setData('type', event.target.value)}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm md:w-32"
                    >
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                    </select>
                    <Input
                        type="number"
                        value={form.data.sort_order}
                        onChange={(event) =>
                            form.setData('sort_order', Number(event.target.value))
                        }
                        className="md:w-24"
                    />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={form.data.is_preview}
                            onChange={(event) =>
                                form.setData('is_preview', event.target.checked)
                            }
                        />
                        Preview
                    </label>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onDelete}>
                        Delete
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </div>
            </form>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2 rounded-md border border-border/60 bg-background p-3">
                    <p className="text-xs font-semibold text-foreground">Konten</p>
                    <Input
                        placeholder="Video URL (opsional)"
                        value={form.data.video_url}
                        onChange={(event) => form.setData('video_url', event.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Durasi (menit)"
                        value={form.data.duration ?? ''}
                        onChange={(event) =>
                            form.setData(
                                'duration',
                                event.target.value === '' ? null : Number(event.target.value),
                            )
                        }
                    />
                    <textarea
                        placeholder="Deskripsi / konten teks"
                        value={form.data.content}
                        onChange={(event) => form.setData('content', event.target.value)}
                        className="h-20 w-full rounded-md border border-border bg-background p-2 text-xs"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            form.put(`${lessonBaseUrl(moduleId)}/${lesson.id}`, {
                                preserveScroll: true,
                            });
                        }}
                        disabled={form.processing}
                    >
                        Update konten
                    </Button>
                </div>

                {lesson.type === 'quiz' && (
                    <div className="space-y-2 rounded-md border border-border/60 bg-background p-3">
                        <p className="text-xs font-semibold text-foreground">Quiz</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <Input
                                placeholder="Passing grade"
                                type="number"
                                value={quizForm.data.passing_grade ?? ''}
                                onChange={(event) =>
                                    quizForm.setData(
                                        'passing_grade',
                                        event.target.value === ''
                                            ? ''
                                            : Number(event.target.value),
                                    )
                                }
                            />
                            <Input
                                placeholder="Time limit (detik)"
                                type="number"
                                value={quizForm.data.time_limit ?? ''}
                                onChange={(event) =>
                                    quizForm.setData(
                                        'time_limit',
                                        event.target.value === ''
                                            ? ''
                                            : Number(event.target.value),
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                            <span>Pertanyaan: {lesson.quiz?.questions.length ?? 0}</span>
                            {lesson.quiz?.passing_grade && (
                                <span>Lulus ≥ {lesson.quiz?.passing_grade}</span>
                            )}
                        </div>
                        <div className="space-y-1 rounded-md border border-dashed border-border/60 p-2">
                            <p className="text-xs font-semibold">Tambah pertanyaan</p>
                            <Input
                                placeholder="Teks pertanyaan"
                                value={questionForm.data.question_text}
                                onChange={(event) =>
                                    questionForm.setData('question_text', event.target.value)
                                }
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {['A', 'B', 'C', 'D'].map((label) => (
                                    <Input
                                        key={label}
                                        placeholder={`Pilihan ${label}`}
                                        value={
                                            (questionForm.data as any)[
                                                `choice_${label.toLowerCase()}`
                                            ] ?? ''
                                        }
                                        onChange={(event) =>
                                            questionForm.setData(
                                                `choice_${label.toLowerCase()}` as
                                                    | 'choice_a'
                                                    | 'choice_b'
                                                    | 'choice_c'
                                                    | 'choice_d',
                                                event.target.value,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={questionForm.data.answer}
                                    onChange={(event) => questionForm.setData('answer', event.target.value)}
                                    className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                                >
                                    {['A', 'B', 'C', 'D'].map((label) => (
                                        <option key={label} value={label}>
                                            Jawaban {label}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Skor"
                                    value={questionForm.data.score}
                                    onChange={(event) =>
                                        questionForm.setData('score', Number(event.target.value) || 0)
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                disabled={questionForm.processing || !lesson.quiz}
                                onClick={() => {
                                    if (!lesson.quiz) {
                                        return;
                                    }
                                    router.post(
                                        questionBaseUrl(lesson.quiz.id),
                                        {
                                            question_text: questionForm.data.question_text,
                                            type: 'multiple_choice',
                                            score: questionForm.data.score,
                                            options: {
                                                choices: [
                                                    { label: 'A', value: questionForm.data.choice_a },
                                                    { label: 'B', value: questionForm.data.choice_b },
                                                    { label: 'C', value: questionForm.data.choice_c },
                                                    { label: 'D', value: questionForm.data.choice_d },
                                                ],
                                                answer: questionForm.data.answer,
                                            },
                                        },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => questionForm.reset(),
                                        },
                                    );
                                }}
                            >
                                Tambah pertanyaan
                            </Button>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={quizForm.processing}
                                onClick={() => {
                                    const method = lesson.quiz ? quizForm.put : quizForm.post;
                                    const url = lesson.quiz
                                        ? `${quizBaseUrl}/${lesson.quiz.id}`
                                        : quizBaseUrl;
                                    quizForm.transform((data) => ({
                                        passing_grade:
                                            data.passing_grade === '' ? null : data.passing_grade,
                                        time_limit: data.time_limit === '' ? null : data.time_limit,
                                    }));
                                    method(url, {
                                        preserveScroll: true,
                                        onFinish: () =>
                                            quizForm.transform((data) => ({
                                                ...data,
                                            })),
                                    });
                                }}
                            >
                                Simpan quiz
                            </Button>
                        </div>
                    </div>
                )}

                {lesson.type === 'assignment' && (
                    <div className="space-y-2 rounded-md border border-border/60 bg-background p-3">
                        <p className="text-xs font-semibold text-foreground">Assignment</p>
                        <Input
                            type="datetime-local"
                            value={assignmentForm.data.due_date ?? ''}
                            onChange={(event) =>
                                assignmentForm.setData('due_date', event.target.value)
                            }
                        />
                        <Input
                            type="number"
                            value={assignmentForm.data.max_score}
                            onChange={(event) =>
                                assignmentForm.setData(
                                    'max_score',
                                    Number(event.target.value) || 100,
                                )
                            }
                        />
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={assignmentForm.processing}
                                onClick={() => {
                                    const method = lesson.assignment
                                        ? assignmentForm.put
                                        : assignmentForm.post;
                                    assignmentForm.transform((data) => ({
                                        due_date: data.due_date === '' ? null : data.due_date,
                                        max_score: data.max_score,
                                    }));
                                    method(assignmentUrl, {
                                        preserveScroll: true,
                                        onFinish: () =>
                                            assignmentForm.transform((data) => ({
                                                ...data,
                                            })),
                                    });
                                }}
                            >
                                Simpan assignment
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
