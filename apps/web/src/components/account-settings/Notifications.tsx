'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, Slack, Check } from 'lucide-react';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    email: boolean;
    push: boolean;
    slack: boolean;
}

export function Notifications() {
    const [settings, setSettings] = useState<NotificationSetting[]>([
        {
            id: 'activity',
            title: 'Project Activity',
            description: 'New tasks, comments, and status updates in your projects.',
            email: true,
            push: true,
            slack: false,
        },
        {
            id: 'mentions',
            title: 'Mentions & Assignments',
            description: 'When someone mentions you or assigns a task to you.',
            email: true,
            push: true,
            slack: true,
        },
        {
            id: 'reminders',
            title: 'Reminders',
            description: 'Upcoming due dates and overdue tasks.',
            email: true,
            push: true,
            slack: false,
        },
        {
            id: 'security',
            title: 'Security Alerts',
            description: 'New sign-ins, password changes, and sensitive actions.',
            email: true,
            push: true,
            slack: true,
        },
        {
            id: 'marketing',
            title: 'Product Updates',
            description: 'News about new features and improvements.',
            email: false,
            push: false,
            slack: false,
        },
    ]);

    const toggle = (id: string, channel: 'email' | 'push' | 'slack') => {
        setSettings(prev => prev.map(s =>
            s.id === id ? { ...s, [channel]: !s[channel] } : s
        ));
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Bell className="w-6 h-6 text-indigo-500" />
                    Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure how and when you want to be notified.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-6 md:col-span-5">Activity Type</div>
                    <div className="col-span-2 text-center flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Email</span>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="hidden sm:inline">Push</span>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center gap-2">
                        <Slack className="w-4 h-4" />
                        <span className="hidden sm:inline">Slack</span>
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {settings.map((setting) => (
                        <div key={setting.id} className="grid grid-cols-12 gap-4 px-6 py-6 items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                            <div className="col-span-6 md:col-span-5 pr-4">
                                <div className="font-medium text-foreground">{setting.title}</div>
                                <div className="text-sm text-muted-foreground mt-0.5">{setting.description}</div>
                            </div>

                            {['email', 'push', 'slack'].map((channel) => (
                                <div key={channel} className="col-span-2 flex justify-center">
                                    <button
                                        onClick={() => toggle(setting.id, channel as 'email' | 'push' | 'slack')}
                                        className={`w-10 h-6 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${setting[channel as keyof NotificationSetting]
                                            ? 'bg-indigo-600 dark:bg-indigo-500'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                    >
                                        <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform transform flex items-center justify-center ${setting[channel as keyof NotificationSetting] ? 'translate-x-4' : 'translate-x-0'
                                            }`}>
                                            {setting[channel as keyof NotificationSetting] && <Check className="w-3 h-3 text-indigo-600" />}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    Save Preference
                </button>
            </div>
        </div>
    );
}
