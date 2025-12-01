import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { CheckCircle2, BookOpen, User } from 'lucide-react';

type Lesson = {
    id: string;
    title: string;
    module: string | null;
    type: string;
    completed: boolean;
    assignment?: {
        grade: number | null;
        feedback_text: string | null;
        submitted_at: string | null;
    } | null;
    quiz?: {
        score: number | null;
        passed: boolean;
        submitted_at: string | null;
    } | null;
};

export default function StudentProgress({
    course,
    student,
    lessons,
}: {
    course: { id: string; title: string; level: string | null };
    student: { id: string | null; name: string | null; email: string | null };
    lessons: Lesson[];
}) {
    const completedCount = lessons.filter((lesson) => lesson.completed).length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Courses', href: '/teacher/courses' },
                { title: course.title, href: `/teacher/courses/${course.id}` },
                { title: 'Students', href: `/teacher/courses/${course.id}/students` },
                { title: student.name ?? 'Student', href: '#' },
            ]}
        >
            <Head title={`Progress - ${student.name ?? 'Student'}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <CardDescription>{course.level ?? 'All levels'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <BookOpen className="size-4" />
                                {lessons.length} lesson
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Student</CardTitle>
                            <CardDescription>Progres course ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <User className="size-4 text-muted-foreground" />
                                {student.name ?? 'Student'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {student.email ?? '-'}
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{
                                        width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {completedCount}/{lessons.length} selesai
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail lesson</CardTitle>
                        <CardDescription>Progress, quiz, dan assignment per lesson.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lessons.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                                Belum ada lesson.
                            </div>
                        )}
                        {lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="rounded-lg border border-border/70 bg-card/60 p-4 text-sm shadow-sm dark:border-foreground/15"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-foreground">{lesson.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {lesson.module ?? 'Tanpa modul'} • {lesson.type}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {lesson.completed ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 className="size-4" />
                                                Selesai
                                            </span>
                                        ) : (
                                            <Badge variant="outline">Belum</Badge>
                                        )}
                                    </div>
                                </div>
                                {lesson.assignment && (
                                    <div className="mt-2 rounded-md border border-dashed border-border/60 p-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span>Assignment</span>
                                            {lesson.assignment.grade !== null && (
                                                <Badge variant="secondary">
                                                    Nilai {lesson.assignment.grade}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            {lesson.assignment.submitted_at ?? 'Belum submit'}
                                        </div>
                                        {lesson.assignment.feedback_text && (
                                            <div className="mt-1 text-muted-foreground">
                                                Feedback: {lesson.assignment.feedback_text}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {lesson.quiz && (
                                    <div className="mt-2 rounded-md border border-dashed border-border/60 p-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span>Quiz</span>
                                            {lesson.quiz.score !== null && (
                                                <Badge variant="secondary" className="gap-1">
                                                    {lesson.quiz.score} pts
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            {lesson.quiz.submitted_at ?? 'Belum attempt'}
                                        </div>
                                        {lesson.quiz.passed !== undefined && (
                                            <div className="mt-1 text-muted-foreground">
                                                Status: {lesson.quiz.passed ? 'Lulus' : 'Belum lulus'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
