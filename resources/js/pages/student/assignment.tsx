import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarClock, Upload } from 'lucide-react';
import { FormEvent } from 'react';

export default function StudentAssignment({
    course,
    lesson,
    assignment,
    submission,
}: {
    course: { id: string; title: string };
    lesson: { id: string; title: string };
    assignment: {
        id: string;
        due_date?: string | null;
        max_score?: number | null;
    };
    submission: {
        id: string;
        file_url: string | null;
        grade: number | null;
        feedback_text: string | null;
        submitted_at: string | null;
    } | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
        submission_id?: string | null;
    }>({
        file: null,
        submission_id: submission?.id ?? null,
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        post(`/student/courses/${course.id}/lessons/${lesson.id}/assignment`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/student/dashboard' },
                { title: course.title, href: `/student/courses/${course.id}` },
                { title: 'Assignment', href: '#' },
            ]}
        >
            <Head title={`Assignment - ${lesson.title}`} />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">{lesson.title}</Badge>
                            {assignment.due_date && (
                                <Badge variant="outline" className="gap-1">
                                    <CalendarClock className="size-3.5" />
                                    Due {assignment.due_date}
                                </Badge>
                            )}
                            <Badge variant="outline">
                                Maksimal skor {assignment.max_score ?? 100}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl">Kumpulkan tugas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {submission && (
                            <div className="mb-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">
                                        Sudah dikumpulkan
                                    </span>
                                    {submission.grade !== null && (
                                        <Badge variant="secondary">Nilai {submission.grade}</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Terakhir: {submission.submitted_at ?? '-'}
                                </p>
                                {submission.feedback_text && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Feedback: {submission.feedback_text}
                                    </p>
                                )}
                {submission.file_url && (
                    <a
                        href={`/submissions/${submission.id}/download`}
                        className="mt-2 inline-flex text-sm text-foreground underline"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Lihat / unduh file
                    </a>
                )}
            </div>
        )}

                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="rounded-lg border border-dashed border-border/70 p-4">
                                <label className="text-sm font-semibold text-foreground">
                                    Upload file tugas (PDF/ZIP)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                                    className="mt-2 block w-full text-sm"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        setData('file', file ?? null);
                                    }}
                                />
                                {errors.file && (
                                    <p className="mt-1 text-xs text-destructive">{errors.file}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Link
                                    href={`/student/courses/${course.id}`}
                                    className="text-sm text-foreground underline"
                                >
                                    Kembali ke course
                                </Link>
                                <Button type="submit" disabled={processing || !data.file}>
                                    <Upload className="mr-2 size-4" />
                                    Kirim tugas
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
