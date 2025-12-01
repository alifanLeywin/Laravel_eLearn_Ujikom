import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, Home } from 'lucide-react';

export default function Forbidden() {
    const page = usePage<{ message?: string }>();
    const message =
        page.props.message ??
        'Kamu tidak memiliki izin untuk membuka halaman ini. Coba kembali ke beranda atau masuk dengan akun yang sesuai.';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">
            <Head title="403 Forbidden" />
            <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                    <LockKeyhole className="size-8 text-emerald-300" />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Error 403</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                    Akses ditolak
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-300">{message}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:translate-y-[-2px] hover:bg-emerald-300"
                    >
                        <Home className="size-4" />
                        Kembali ke Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white hover:bg-white/10"
                    >
                        <ArrowLeft className="size-4" />
                        Ke Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
