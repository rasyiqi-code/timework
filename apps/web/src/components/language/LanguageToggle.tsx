'use client';

import { setLanguage } from '@/actions/language';
import { useTransition } from 'react';

export function LanguageToggle({ currentLocale }: { currentLocale: 'id' | 'en' }) {
    const [isPending, startTransition] = useTransition();

    const toggle = () => {
        const nextLocale = currentLocale === 'id' ? 'en' : 'id';
        startTransition(async () => {
            await setLanguage(nextLocale);
        });
    };

    return (
        <button
            onClick={toggle}
            disabled={isPending}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs text-slate-600 dark:text-slate-300"
            title={currentLocale === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
        >
            {isPending ? '...' : (currentLocale === 'id' ? 'ID' : 'EN')}
        </button>
    );
}
