import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Option = { id: string; name: string };

type CourseFormProps = {
    initialValues?: {
        title?: string;
        slug?: string | null;
        description?: string | null;
        cover_image?: string | null;
        tenant_id?: string | null;
        teacher_id?: string | null;
        category_id?: string | null;
        status?: string;
        level?: string | null;
        price?: string | number | null;
    };
    tenants: Option[];
    teachers: Option[];
    categories: Option[];
    isTeacherRoute?: boolean;
    submitUrl: string;
    method?: 'post' | 'put';
};

export function CourseForm({
    initialValues,
    tenants,
    teachers,
    categories,
    isTeacherRoute = false,
    submitUrl,
    method = 'post',
}: CourseFormProps) {
    const { data, setData, processing, reset, errors, clearErrors, ...form } = useForm({
        title: initialValues?.title ?? '',
        slug: initialValues?.slug ?? '',
        description: initialValues?.description ?? '',
        cover_image: null as File | null,
        tenant_id: initialValues?.tenant_id ?? '',
        teacher_id:
            initialValues?.teacher_id ??
            (isTeacherRoute ? teachers[0]?.id ?? '' : teachers[0]?.id ?? ''),
        category_id: initialValues?.category_id ?? '',
        status: initialValues?.status ?? 'draft',
        level: initialValues?.level ?? '',
        price: initialValues?.price ?? '',
        _method: method === 'put' ? 'put' : 'post',
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        clearErrors();
        form.post(submitUrl, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                const isCreate = method === 'post';
                window.alert(isCreate ? 'Berhasil membuat course.' : 'Berhasil memperbarui course.');
                router.visit(isTeacherRoute ? '/teacher/courses' : '/admin/courses');
                if (isCreate) {
                    reset('title', 'slug', 'description', 'category_id', 'level', 'cover_image', 'price');
                }
            },
        });
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Title</label>
                <Input
                    required
                    value={data.title}
                    onChange={(event) => setData('title', event.target.value)}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Slug (optional)</label>
                <Input
                    value={data.slug ?? ''}
                    onChange={(event) => setData('slug', event.target.value)}
                    placeholder="auto-generate if empty"
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Cover image</label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                        setData('cover_image', event.target.files?.[0] ?? null)
                    }
                />
                {errors.cover_image && (
                    <p className="text-xs text-red-500">{errors.cover_image}</p>
                )}
            </div>

            {!isTeacherRoute && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Tenant</label>
                        <select
                            value={data.tenant_id ?? ''}
                            onChange={(event) => setData('tenant_id', event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                        >
                            <option value="" disabled>
                                Select tenant
                            </option>
                            {tenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </option>
                            ))}
                        </select>
                        {errors.tenant_id && (
                            <p className="text-xs text-red-500">{errors.tenant_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Teacher</label>
                        <select
                            value={data.teacher_id ?? ''}
                            onChange={(event) => setData('teacher_id', event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                            disabled={isTeacherRoute}
                        >
                            {!isTeacherRoute && (
                                <option value="" disabled>
                                    Assign teacher
                                </option>
                            )}
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                        {isTeacherRoute && (
                            <input type="hidden" name="teacher_id" value={data.teacher_id ?? ''} />
                        )}
                        {errors.teacher_id && (
                            <p className="text-xs text-red-500">{errors.teacher_id}</p>
                        )}
                    </div>
                </>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category</label>
                <select
                    value={data.category_id ?? ''}
                    onChange={(event) => setData('category_id', event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="" disabled>
                        Select category (optional)
                    </option>
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && (
                    <p className="text-xs text-red-500">{errors.category_id}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <select
                    value={data.status}
                    onChange={(event) => setData('status', event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Level</label>
                <select
                    value={data.level ?? ''}
                    onChange={(event) => setData('level', event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                    <option value="" disabled>
                        Select level
                    </option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Description</label>
                <Textarea
                    value={data.description ?? ''}
                    onChange={(event) => setData('description', event.target.value)}
                    rows={4}
                    placeholder="Optional description"
                />
                {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                )}
            </div>

            <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save course'}
                </Button>
            </div>
        </form>
    );
}
