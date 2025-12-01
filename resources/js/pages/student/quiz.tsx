import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock3, ClipboardList } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

type Choice = {
    label: string;
    value: string;
};

type Question = {
    id: string;
    question_text: string;
    type: string;
    score: number;
    choices: Choice[];
};

type Attempt = {
    id: string;
    score: number | null;
    passed: boolean;
    submitted_at: string | null;
};

export default function StudentQuiz({
    course,
    lesson,
    quiz,
    attempts,
}: {
    course: { id: string; title: string };
    lesson: { id: string; title: string };
    quiz: {
        id: string;
        time_limit?: number | null;
        passing_grade?: number | null;
        questions: Question[];
    };
    attempts: Attempt[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        answers: { question_id: string; value: string }[];
    }>({
        answers: quiz.questions.map((question) => ({
            question_id: question.id,
            value: '',
        })),
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        post(`/student/courses/${course.id}/lessons/${lesson.id}/quiz`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const answersByQuestion = useMemo(() => {
        const map: Record<string, string> = {};
        data.answers.forEach((answer) => {
            map[answer.question_id] = answer.value;
        });
        return map;
    }, [data.answers]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/student/dashboard' },
                { title: course.title, href: `/student/courses/${course.id}` },
                { title: 'Quiz', href: '#' },
            ]}
        >
            <Head title={`Quiz - ${lesson.title}`} />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="gap-1">
                                <ClipboardList className="size-3.5" />
                                {lesson.title}
                            </Badge>
                            {quiz.passing_grade && (
                                <Badge variant="outline">Lulus: {quiz.passing_grade} pts</Badge>
                            )}
                            {quiz.time_limit && (
                                <Badge variant="outline" className="gap-1">
                                    <Clock3 className="size-3.5" />
                                    {quiz.time_limit} menit
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-xl">
                            Kerjakan quiz • {quiz.questions.length} soal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={onSubmit}>
                            {quiz.questions.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada soal untuk quiz ini.
                                </p>
                            )}
                            {quiz.questions.map((question, index) => {
                                const isEssay = question.type === 'essay';

                                return (
                                    <div
                                        key={question.id}
                                        className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {index + 1}. {question.question_text}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {question.type} • {question.score} pts
                                                </p>
                                            </div>
                                            <Badge variant="outline">{isEssay ? 'Essay' : 'MCQ'}</Badge>
                                        </div>
                                        {isEssay ? (
                                            <textarea
                                                className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                                                rows={3}
                                                placeholder="Tuliskan jawabanmu..."
                                                value={answersByQuestion[question.id] ?? ''}
                                                onChange={(event) => {
                                                    setData('answers', data.answers.map((answer) =>
                                                        answer.question_id === question.id
                                                            ? { ...answer, value: event.target.value }
                                                            : answer,
                                                    ));
                                                }}
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                {question.choices.map((choice) => (
                                                    <label
                                                        key={choice.label}
                                                        className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm hover:border-emerald-500/60"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={question.id}
                                                            value={choice.label}
                                                            className="h-4 w-4"
                                                            checked={answersByQuestion[question.id] === choice.label}
                                                            onChange={() => {
                                                                setData('answers', data.answers.map((answer) =>
                                                                    answer.question_id === question.id
                                                                        ? { ...answer, value: choice.label }
                                                                        : answer,
                                                                ));
                                                            }}
                                                        />
                                                        <span className="font-semibold">{choice.label}</span>
                                                        <span className="text-muted-foreground">
                                                            {choice.value}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="flex items-center justify-between gap-3">
                                <Link
                                    href={`/student/courses/${course.id}`}
                                    className="text-sm text-foreground underline"
                                >
                                    Kembali ke course
                                </Link>
                                <Button type="submit" disabled={processing || quiz.questions.length === 0}>
                                    Kirim jawaban
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Riwayat attempt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {attempts.length === 0 && (
                            <p className="text-sm text-muted-foreground">Belum ada attempt.</p>
                        )}
                        {attempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">
                                        Skor {attempt.score ?? 0} pts
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {attempt.submitted_at ?? '-'}
                                    </span>
                                </div>
                                {attempt.passed ? (
                                    <Badge
                                        variant="secondary"
                                        className="inline-flex items-center gap-1 text-emerald-600"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Lulus
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Belum lulus</Badge>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
                {Object.keys(errors).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Form error</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-destructive">
                            {Object.values(errors).map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
