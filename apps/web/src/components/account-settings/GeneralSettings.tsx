'use client';

import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Globe, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';


export function GeneralSettings() {
    const { theme, setTheme } = useTheme();
    // const app = useStackApp();
    const [lang, setLang] = useState('en-US');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const savedLang = localStorage.getItem('timework-language');
        if (savedLang) setLang(savedLang);
    }, []);

    const handleLangChange = (val: string) => {
        setLang(val);
        localStorage.setItem('timework-language', val);
    };

    if (!mounted) return null;

    return (
        <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-500" />
                    General Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Customize your workspace experience.
                </p>
            </div>

            {/* Theme */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'light'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-muted-foreground'
                            }`}
                    >
                        <Sun className="w-6 h-6" />
                        <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-muted-foreground'
                            }`}
                    >
                        <Moon className="w-6 h-6" />
                        <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'system'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-muted-foreground'
                            }`}
                    >
                        <Monitor className="w-6 h-6" />
                        <span className="text-sm font-medium">System</span>
                    </button>
                </div>
            </section>



            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Language */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Language & Region</h3>
                <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-muted-foreground border border-slate-200 dark:border-slate-800">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Interface Language</p>
                            <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                        </div>
                    </div>
                    <div className="relative min-w-[200px]">
                        <select
                            value={lang}
                            onChange={(e) => handleLangChange(e.target.value)}
                            className="w-full appearance-none h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground transition-all cursor-pointer hover:border-indigo-500/50"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="id-ID">Bahasa Indonesia</option>
                            <option value="es-ES">Spanish</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Danger Zone */}
            <section className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">Danger Zone</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-red-900 dark:text-red-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Delete Account
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300/70 mt-1 max-w-md">
                            Permanently remove your Personal Account and all of its contents from the Timework platform. This action is not reversible.
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm whitespace-nowrap">
                        Delete Personal Account
                    </button>
                </div>
            </section>
        </div>
    );
}
