import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Teacher = {
    id: string;
    name: string;
    email: string;
    tenant?: string | null;
    courses_count: number;
    created_at?: string | null;
    slug?: string | null;
};

export default function TeachersIndex({ teachers }: { teachers: Teacher[] }) {
    const onDelete = (id: string) => {
        if (!confirm('Delete this teacher?')) {
            return;
        }

        router.delete(`/admin/teachers/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Teachers', href: '/admin/teachers' },
            ]}
        >
            <Head title="Teachers" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/teachers/create">
                        <Button>Create teacher</Button>
                    </Link>
                </div>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Teachers</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/60">
                        {teachers.length === 0 && (
                            <div className="py-6 text-sm text-muted-foreground">
                                Belum ada teacher.
                            </div>
                        )}
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-foreground">{teacher.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {teacher.email} · {teacher.tenant ?? 'No tenant'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Courses: {teacher.courses_count} · {teacher.created_at ?? ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/teachers/${teacher.slug ?? teacher.id}`}
                                        className="text-foreground hover:underline"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/admin/teachers/${teacher.id}/edit`}
                                        className="text-foreground hover:underline"
                                    >
                                        Edit
                                    </Link>
                                    <Button variant="outline" onClick={() => onDelete(teacher.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
