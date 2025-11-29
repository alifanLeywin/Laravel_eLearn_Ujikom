import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Lesson = {
    id: string;
    title: string;
    type: string;
    sort_order: number;
    is_preview: boolean;
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
                        <CardTitle>{course.title}</CardTitle>
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
}: {
    module: Module;
    moduleBaseUrl: string;
    lessonBaseUrl: (moduleId: string) => string;
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
}: {
    lesson: Lesson;
    moduleId: string;
    lessonBaseUrl: (moduleId: string) => string;
}) {
    const form = useForm({
        title: lesson.title,
        type: lesson.type,
        sort_order: lesson.sort_order,
        is_preview: lesson.is_preview,
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

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
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
    );
}
