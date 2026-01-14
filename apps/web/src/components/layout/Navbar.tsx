'use client';

import Link from 'next/link';
import { ThemeToggle } from '../theme/ThemeToggle';
import { UserButton, useUser } from "@stackframe/stack";

import { LanguageToggle } from '../language/LanguageToggle';
import { usePathname } from 'next/navigation';
import { Dictionary } from '@/i18n/dictionaries'; // Assuming Dictionary type is needed for props

// Navbar now expects dict and locale as props, as it's a client component
export function Navbar({ dict, locale, signInUrl, currentUser }: {
    dict: Dictionary,
    locale: string,
    signInUrl: string,
    currentUser: any // Using any strictly to bypass the immediate type errors, relying on the prop passed from server
}) {
    const pathname = usePathname();

    // Hide global navbar on landing page (root)
    if (pathname === '/') return null;

    return (
        <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
            <nav className="container mx-auto h-12 flex items-center justify-between px-4">
                <Link href="/" className="text-sm font-bold text-slate-800 flex items-center gap-2 hover:opacity-80 transition-opacity dark:text-slate-100">
                    <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px]">T</div>
                    {dict.nav.brand}
                </Link>
                {currentUser?.organization && (
                    <div className="hidden sm:flex items-center ml-2">
                        <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {currentUser.organization.name}
                        </span>
                    </div>
                )}

                <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Link href="/projects" className="px-3 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-all dark:hover:bg-slate-800 dark:hover:text-slate-100">
                        {dict.nav.projects}
                    </Link>
                    <Link href="/my-tasks" className="px-3 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-all dark:hover:bg-slate-800 dark:hover:text-slate-100">
                        {dict.nav.myTasks}
                    </Link>
                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                        <Link href="/admin/protocols" className="px-3 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-all dark:hover:bg-slate-800 dark:hover:text-slate-100">
                            {dict.nav.protocols}
                        </Link>
                    )}
                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                        <Link href="/settings/project-form" className="px-3 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-all dark:hover:bg-slate-800 dark:hover:text-slate-100">
                            {dict.nav.projectForm}
                        </Link>
                    )}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <Link href="/super-admin" className="px-3 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-bold dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                            {dict.nav.superAdmin}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium hidden md:inline-block text-slate-500 dark:text-slate-400">
                                {currentUser.name}
                            </span>
                            <UserButton />
                        </div>
                    ) : (
                        <Link
                            href={signInUrl}
                            className="text-xs font-bold px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                            {dict.nav.signIn}
                        </Link>
                    )}
                    <LanguageToggle currentLocale={locale as "id" | "en"} />
                    <ThemeToggle />
                </div>
            </nav>
        </div>
    );
}
