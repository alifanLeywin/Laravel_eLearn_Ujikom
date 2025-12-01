import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState, useEffect, useRef } from 'react';
import { type SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useAppearance } from '@/hooks/use-appearance';
import PublicFooter from '@/components/public-footer';
import { Menu, X } from 'lucide-react';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLAnchorElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    const links: NavLink[] = navLinks.length
        ? navLinks
        : [
              { href: '/', label: 'Home', active: currentUrl === '/' },
              { href: '/courses', label: 'Courses', active: currentUrl.startsWith('/courses') },
              { href: '/teachers', label: 'Teachers', active: currentUrl.startsWith('/teachers') },
          ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    // GSAP-like animations using CSS transitions and transforms
    useEffect(() => {
        // Animate logo on mount
        if (logoRef.current) {
            logoRef.current.style.opacity = '0';
            logoRef.current.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (logoRef.current) {
                    logoRef.current.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    logoRef.current.style.opacity = '1';
                    logoRef.current.style.transform = 'translateY(0)';
                }
            }, 100);
        }

        // Animate nav links on mount
        if (linksRef.current) {
            const linkElements = linksRef.current.querySelectorAll('a');
            linkElements.forEach((link, index) => {
                (link as HTMLElement).style.opacity = '0';
                (link as HTMLElement).style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    (link as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    (link as HTMLElement).style.opacity = '1';
                    (link as HTMLElement).style.transform = 'translateY(0)';
                }, 200 + index * 100);
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
            <nav
                ref={navRef}
                className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                    scrolled
                        ? 'border-rose-200 bg-white/95 shadow-lg shadow-rose-100/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-slate-950/50'
                        : 'border-rose-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-950/80'
                }`}
            >
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                    {/* Logo with hover animation */}
                    <Link
                        ref={logoRef}
                        href="/"
                        className="group relative font-serif text-2xl font-light tracking-tight text-rose-600 transition-all duration-300 hover:scale-105 md:text-3xl dark:text-rose-400"
                    >
                        <span className="relative z-10">
                            e <span className="font-normal">Learn</span>
                        </span>
                        <span className="absolute inset-0 -z-10 scale-0 rounded-lg bg-rose-50 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 dark:bg-rose-900/20" />
                    </Link>

                    {/* Desktop Navigation Links - Centered */}
                    <div ref={linksRef} className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group relative overflow-hidden font-serif transition-all duration-300 hover:scale-105 ${
                                    link.active
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-gray-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
                                }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 bg-rose-600 transition-all duration-300 dark:bg-rose-400 ${
                                        link.active ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Right side - Auth Buttons & Theme Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="hidden transition-all duration-300 hover:scale-110 md:block">
                            <AppearanceToggleDropdown />
                        </div>
                        
                        {/* Desktop Auth Buttons */}
                        {auth.user ? (
                            <div className="relative hidden md:block">
                                <button
                                    type="button"
                                    onClick={() => setOpenMenu((prev) => !prev)}
                                    className="group inline-flex items-center gap-2 rounded-full border-2 border-rose-600 bg-transparent px-6 py-2.5 font-serif text-sm uppercase tracking-widest text-rose-600 transition-all duration-300 hover:scale-105 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200 dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white dark:hover:shadow-rose-900/50"
                                >
                                    {auth.user.name}
                                    <span
                                        className={`text-xs transition-transform duration-300 ${openMenu ? 'rotate-180' : ''}`}
                                    >
                                        ▼
                                    </span>
                                </button>
                                {openMenu && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-lg border border-rose-200 bg-white shadow-xl duration-200 dark:border-slate-700 dark:bg-slate-900">
                                        <Link
                                            href="/dashboard"
                                            className="block rounded-t-lg px-4 py-3 font-serif text-sm text-gray-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full rounded-b-lg px-4 py-3 text-left font-serif text-sm text-gray-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden items-center gap-3 md:flex">
                                <Link
                                    href="/login"
                                    className="rounded-full border-2 border-rose-600 bg-transparent px-6 py-2.5 font-serif text-sm uppercase tracking-widest text-rose-600 transition-all duration-300 hover:scale-105 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200 dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white dark:hover:shadow-rose-900/50"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full border-2 border-rose-600 bg-rose-600 px-6 py-2.5 font-serif text-sm uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200 dark:border-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600 dark:hover:shadow-rose-900/50"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg p-2 text-rose-600 transition-all hover:bg-rose-50 md:hidden dark:text-rose-400 dark:hover:bg-slate-800"
                        >
                            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-rose-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
                        <div className="space-y-1 px-4 py-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block rounded-lg px-4 py-3 font-serif transition-all ${
                                        link.active
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                            : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            
                            {/* Mobile Theme Toggle */}
                            <div className="space-y-2 rounded-lg border border-rose-200 px-4 py-3 dark:border-slate-800">
                                <p className="font-serif text-sm uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                    Theme
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Light', value: 'light' },
                                        { label: 'Dark', value: 'dark' },
                                        { label: 'System', value: 'system' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateAppearance(option.value as 'light' | 'dark' | 'system')}
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                appearance === option.value
                                                    ? 'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500'
                                                    : 'border-rose-300 text-rose-700 hover:border-rose-500 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500 dark:hover:text-rose-300'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Auth Buttons */}
                            {auth.user ? (
                                <div className="space-y-2 border-t border-rose-200 pt-4 dark:border-slate-800">
                                    <div className="px-4 py-2 font-serif text-sm text-gray-600 dark:text-slate-400">
                                        {auth.user.name}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block rounded-lg px-4 py-3 font-serif text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full rounded-lg px-4 py-3 text-left font-serif text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2 border-t border-rose-200 pt-4 dark:border-slate-800">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block rounded-full border-2 border-rose-600 bg-transparent px-6 py-3 text-center font-serif text-sm uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-600 hover:text-white dark:border-rose-500 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block rounded-full border-2 border-rose-600 bg-rose-600 px-6 py-3 text-center font-serif text-sm uppercase tracking-widest text-white transition-all hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <main className="relative">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
