import { Link } from '@inertiajs/react';

export default function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/20 bg-black text-white dark:border-white/10 dark:bg-[#0b1021] dark:text-white">
            <div className="relative mx-auto w-full max-w-7xl px-6 py-16 md:px-12 lg:px-20">
                <div className="flex flex-col justify-between gap-8 text-sm font-semibold uppercase md:flex-row">
                    <div className="space-y-2">
                        <p>eLearn</p>
                    </div>
                    <div className="grid grid-cols-2 gap-12 text-right">
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="hover:underline">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/courses" className="hover:underline">
                                    Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/teachers" className="hover:underline">
                                    Teachers
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:underline">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16">
                    <h1 className="text-[14vw] font-extrabold leading-none tracking-tight text-white md:text-[10vw]">
                        eLEARN
                    </h1>
                </div>

                <div className="mt-12 flex items-center justify-between text-xs font-medium md:text-sm">
                    <span>@elearn {currentYear}</span>
                    <div className="space-x-6" />
                </div>
            </div>
        </footer>
    );
}
