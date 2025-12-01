import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Users, ClipboardList } from 'lucide-react';

type Enrollment = {
    id: string;
    status: string;
    progress: number;
    completed: number;
    total_lessons: number;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
};

type Submission = {
    id: string;
    grade: number | null;
    feedback_text: string | null;
    submitted_at: string | null;
    file_url: string | null;
    assignment: {
        id: string;
        lesson: string | null;
        max_score: number | null;
    } | null;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
};

export default function TeacherCourseStudents({
    course,
    enrollments,
    submissions,
}: {
    course: { id: string; title: string; level: string | null; status: string };
    enrollments: Enrollment[];
    submissions: Submission[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: '/teacher/courses' },
                { title: course.title, href: `/teacher/courses/${course.id}` },
                { title: 'Students', href: '#' },
            ]}
        >
            <Head title={`Students - ${course.title}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <CardDescription>
                                {course.level ?? 'All levels'} · {course.status}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <Badge variant="secondary" className="gap-1">
                                <Users className="size-4" />
                                {enrollments.length} siswa
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Submissions menunggu</CardTitle>
                            <CardDescription>Koreksi tugas dan beri feedback.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline">{submissions.length} item terbaru</Badge>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Siswa terdaftar</CardTitle>
                            <CardDescription>Progress per siswa di course ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {enrollments.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                                    Belum ada siswa terdaftar.
                                </div>
                            )}
                            {enrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="rounded-lg border border-border/70 bg-card/60 p-4 text-sm shadow-sm dark:border-foreground/15"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {enrollment.user?.name ?? 'Student'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {enrollment.user?.email ?? '-'}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">{enrollment.status}</Badge>
                                    </div>
                                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{
                                                width: `${Math.min(enrollment.progress, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {enrollment.completed}/{enrollment.total_lessons} selesai
                                    </div>
                                    <div className="mt-3 flex gap-2 text-xs">
                                        <Button asChild size="sm" variant="outline">
                                            <Link
                                                href={`/teacher/courses/${course.id}/students/${enrollment.id}`}
                                            >
                                                Lihat progres
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tugas &amp; submission</CardTitle>
                            <CardDescription>Koreksi nilai dan kirim feedback.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {submissions.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                                    Belum ada submission.
                                </div>
                            )}
                            {submissions.map((submission) => (
                                <SubmissionRow key={submission.id} submission={submission} courseId={course.id} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function SubmissionRow({ submission, courseId }: { submission: Submission; courseId: string }) {
    const { data, setData, patch, processing } = useForm({
        grade: submission.grade ?? '',
        feedback_text: submission.feedback_text ?? '',
    });

    return (
        <div className="space-y-2 rounded-lg border border-border/70 bg-card/60 p-3 text-sm shadow-sm dark:border-foreground/15">
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                        {submission.user?.name ?? 'Student'}
                    </span>
                    <span className="text-xs text-muted-foreground">{submission.user?.email ?? '-'}</span>
                </div>
                <Badge variant="outline" className="gap-1">
                    <ClipboardList className="size-4" />
                    {submission.assignment?.lesson ?? 'Assignment'}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Max {submission.assignment?.max_score ?? 100}</span>
                <span>{submission.submitted_at ?? '-'}</span>
                {submission.id && (
                    <a
                        href={`/submissions/${submission.id}/download`}
                        className="text-foreground underline"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Lihat / unduh file
                    </a>
                )}
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr,2fr]">
                <Input
                    type="number"
                    placeholder="Nilai"
                    value={data.grade}
                    onChange={(event) => setData('grade', event.target.value === '' ? '' : Number(event.target.value))}
                />
                <Input
                    placeholder="Feedback"
                    value={data.feedback_text}
                    onChange={(event) => setData('feedback_text', event.target.value)}
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    size="sm"
                    onClick={() =>
                        patch(`/teacher/courses/${courseId}/submissions/${submission.id}`, {
                            preserveScroll: true,
                        })
                    }
                    disabled={processing}
                >
                    Simpan
                </Button>
                {submission.grade !== null && (
                    <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="size-4" />
                        Dinilai
                    </Badge>
                )}
            </div>
        </div>
    );
}
