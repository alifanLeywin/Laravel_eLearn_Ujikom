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
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Sparkles, Compass } from 'lucide-react';

type Enrollment = {
    id: string;
    status: string;
    progress: number;
    course: {
        id: string | undefined;
        title: string | undefined;
        level: string | null | undefined;
        slug?: string | undefined;
    } | null;
};

export default function StudentDashboard({
    enrollments,
}: {
    enrollments: Enrollment[];
}) {
    const activeCourses = enrollments.filter((enrollment) => enrollment.status === 'active');
    const completedCourses = enrollments.filter((enrollment) => enrollment.progress >= 100);
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/student/dashboard' },
                { title: 'Student', href: '/student/dashboard' },
            ]}
        >
            <Head title="Student Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-border/70">
                        <CardHeader>
                            <CardTitle>Ringkasan</CardTitle>
                            <CardDescription>Progress belajar kamu.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3 text-sm">
                            <div className="flex flex-1 items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2">
                                <span className="text-muted-foreground">Active</span>
                                <span className="text-lg font-semibold text-foreground">
                                    {activeCourses.length}
                                </span>
                            </div>
                            <div className="flex flex-1 items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="text-lg font-semibold text-foreground">
                                    {completedCourses.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Rekomendasi</CardTitle>
                                <CardDescription>Jelajahi course baru.</CardDescription>
                            </div>
                            <Button asChild size="sm" variant="secondary">
                                <Link href="/courses">
                                    <Compass className="mr-2 size-4" />
                                    Lihat katalog
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Cari course yang belum pernah kamu ikuti untuk menambah skill baru.
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Progress kamu</CardTitle>
                            <CardDescription>
                                Lanjutkan belajar dan tuntaskan course yang
                                sedang diikuti.
                            </CardDescription>
                        </div>
                        <Badge className="gap-1 rounded-full" variant="secondary">
                            <Sparkles className="size-4" />
                            Keep it up
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {enrollments.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground dark:border-foreground/15">
                                Kamu belum terdaftar di course manapun. Coba
                                jelajahi katalog course di halaman utama.
                            </div>
                        )}
                        {enrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm dark:border-foreground/15"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <GraduationCap className="size-4 text-muted-foreground" />
                                        {enrollment.course?.title ??
                                            'Course tidak ditemukan'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {enrollment.status}
                                        </Badge>
                                        {enrollment.course?.id && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Link
                                                    href={`/student/courses/${enrollment.course.id}`}
                                                >
                                                    Lanjutkan
                                                </Link>
                                            </Button>
                                        )}
                                        {enrollment.course?.id && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs"
                                            >
                                                <Link
                                                    href={`/courses/${enrollment.course.id}/enroll`}
                                                    method="delete"
                                                    as="button"
                                                >
                                                    Unenroll
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {enrollment.course?.level ?? 'All levels'}
                                </p>
                                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{
                                            width: `${Math.min(enrollment.progress, 100)}%`,
                                        }}
                                    />
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {enrollment.progress}% selesai
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
