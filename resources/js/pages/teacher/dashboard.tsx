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
import { BookOpen, CheckCircle2, Clock, Eye } from 'lucide-react';

type CourseSummary = {
    id: string;
    title: string;
    status: string;
    level: string | null;
    published_at?: string | null;
    enrollments_count: number;
};

type LessonSummary = {
    id: string;
    title: string;
    type: string;
    course?: string | null;
    is_preview: boolean;
};

export default function TeacherDashboard({
    courses,
    lessons,
}: {
    courses: CourseSummary[];
    lessons: LessonSummary[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/teacher/dashboard' },
                { title: 'Teacher', href: '/teacher/dashboard' },
            ]}
        >
            <Head title="Teacher Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Your Courses</CardTitle>
                                <CardDescription>
                                    Monitor enrollments and publish status.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full">
                                {courses.length} live
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {courses.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground dark:border-foreground/15">
                                    Belum ada course. Mulai buat struktur
                                    kurikulum pertama kamu.
                                </div>
                            )}
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card/60 px-4 py-3 shadow-sm dark:border-foreground/15"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-200">
                                            <BookOpen className="size-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {course.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {course.level ?? 'All levels'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <Badge variant="secondary">
                                            {course.status}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                            {course.enrollments_count} siswa
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>
                                Fokus di langkah paling penting hari ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                'Buat modul baru',
                                'Susun bank soal quiz',
                                'Jadwalkan live session',
                                'Kirim pengumuman kelas',
                                'Review tugas yang masuk',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 text-sm text-foreground"
                                >
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Upcoming lessons</CardTitle>
                            <CardDescription>
                                Materi yang akan segera tayang ke peserta.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                            {lessons.length} items
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lessons.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground dark:border-foreground/15">
                                Belum ada lesson terjadwal. Tambahkan video,
                                teks, atau quiz untuk melengkapinya.
                            </div>
                        )}
                        {lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card/60 px-4 py-3 shadow-sm transition hover:border-foreground/20 dark:border-foreground/15"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Clock className="size-4 text-muted-foreground" />
                                        {lesson.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Badge variant="secondary">
                                            {lesson.type}
                                        </Badge>
                                        {lesson.is_preview && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 rounded-full text-amber-700 dark:text-amber-200"
                                            >
                                                <Eye className="size-3" />
                                                Preview
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {lesson.course ?? 'Tanpa kursus'}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
