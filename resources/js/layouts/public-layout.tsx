import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState } from 'react';
import { type SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import PublicFooter from '@/components/public-footer';

type NavLink = {
    href: string;
    label: string;
    active?: boolean;
};

export default function PublicLayout({
    children,
    navLinks = [],
}: PropsWithChildren<{ navLinks?: NavLink[] }>) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentUrl = page.url ?? '';
    const [openMenu, setOpenMenu] = useState(false);

    const links: NavLink[] = navLinks.length
        ? navLinks
        : [
              { href: '/', label: 'Home', active: currentUrl === '/' },
              { href: '/courses', label: 'Courses', active: currentUrl.startsWith('/courses') },
              { href: '/teachers', label: 'Teachers', active: currentUrl.startsWith('/teachers') },
          ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1021] dark:text-white">
            <nav className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0f162e]/90">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
                    <Link href="/" className="text-xl font-semibold text-[#e34724] dark:text-orange-300">
                        eLearn
                    </Link>
                    <div className="hidden items-center gap-2 text-sm md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 font-semibold transition ${
                                    link.active
                                        ? 'text-[#e34724] underline decoration-2 underline-offset-8 dark:text-orange-200'
                                        : 'text-slate-700 hover:text-[#e34724] dark:text-blue-100 dark:hover:text-orange-200'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <AppearanceToggleDropdown />
                        {auth.user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenMenu((prev) => !prev)}
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-black dark:bg-white dark:text-[#0b1021] dark:hover:bg-white/90"
                                >
                                    {auth.user.name}
                                    <span className="text-xs text-slate-300 dark:text-slate-700">▼</span>
                                </button>
                                {openMenu && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white text-sm shadow-lg ring-1 ring-black/5 dark:border-white/10 dark:bg-[#0f172a]">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full px-4 py-2 text-left text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-full px-4 py-2 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:text-blue-100 dark:ring-white/20 dark:hover:bg-white/10"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-black dark:bg-white dark:text-[#0b1021] dark:hover:bg-white/90"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main>{children}</main>
            <PublicFooter />
        </div>
    );
}
