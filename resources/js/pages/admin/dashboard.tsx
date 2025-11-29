import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { BookOpen, GraduationCap, ShieldCheck, Users } from 'lucide-react';

type Stats = {
    courses: number;
    students: number;
    teachers: number;
    activeEnrollments: number;
};

export default function AdminDashboard({ stats }: { stats: Stats }) {
    const cards = [
        {
            title: 'Total Courses',
            value: stats.courses,
            icon: BookOpen,
            accent: 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
        },
        {
            title: 'Active Students',
            value: stats.students,
            icon: GraduationCap,
            accent: 'bg-sky-500/10 text-sky-700 dark:text-sky-200',
        },
        {
            title: 'Instructors',
            value: stats.teachers,
            icon: ShieldCheck,
            accent: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
        },
        {
            title: 'Active Enrollments',
            value: stats.activeEnrollments,
            icon: Users,
            accent: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200',
        },
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Admin', href: '/admin/dashboard' },
            ]}
        >
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.title} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <div
                                    className={`flex size-10 items-center justify-center rounded-full ${card.accent}`}
                                >
                                    <card.icon className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold leading-tight text-foreground">
                                    {card.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Operational Checklist</CardTitle>
                            <CardDescription>
                                Quick actions to keep your tenant healthy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {[
                                'Create category',
                                'Publish a course',
                                'Invite teachers',
                                'Approve content',
                                'Review enrollments',
                                'Send announcement',
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground dark:border-foreground/20"
                                >
                                    {item}
                                </span>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Health</CardTitle>
                            <CardDescription>
                                Snapshot of activity across your school.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Published courses
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {stats.courses}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Active students
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {stats.students}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Instructors onboarded
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {stats.teachers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Active enrollments
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {stats.activeEnrollments}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
