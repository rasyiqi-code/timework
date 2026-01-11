'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AccountSettings } from '@stackframe/stack';
import { SettingsSidebar } from '@/components/account-settings/SettingsSidebar';
import { ActiveSessions } from '@/components/account-settings/ActiveSessions';
import { MyProfile } from '@/components/account-settings/MyProfile';
import { TeamsList } from '@/components/account-settings/TeamsList';
import { EmailsAndAuth } from '@/components/account-settings/EmailsAndAuth';
import { Notifications } from '@/components/account-settings/Notifications';
import { GeneralSettings } from '@/components/account-settings/GeneralSettings';
import { TeamSettings } from '@/components/account-settings/TeamSettings';
import { Loader2 } from 'lucide-react';

function AccountSettingsContent() {
    const params = useParams();
    // params.index can be undefined (root), or array string
    // e.g. /account-settings -> undefined
    // /account-settings/security -> ['security']
    const tab = params?.index?.[0] || 'profile';

    // If user requests "Advanced", show the raw Stack component
    // Note: This might render a nested sidebar, but gives access to all features
    if (tab === 'advanced') {
        return (
            <div className="w-full max-w-5xl mx-auto py-8 px-4">
                <div className="mb-4">
                    <Link href="/account-settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to Custom View</Link>
                </div>
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm dark:bg-slate-950/50 dark:text-white [&_span]:dark:text-white [&_p]:dark:text-white [&_h1]:dark:text-white [&_h2]:dark:text-white [&_h3]:dark:text-white [&_div]:dark:text-white">
                    <AccountSettings fullPage={false} />
                </div>
            </div>
        );
    }

    // Define content for custom tabs
    let content;
    switch (tab) {
        case 'profile':
            content = <MyProfile />;
            break;
        case 'security':
            content = <ActiveSessions />;
            break;
        case 'teams':
            if (params?.index?.[1] && params?.index?.[1] !== 'create') {
                content = <TeamSettings teamId={params.index[1]} />;
            } else {
                content = <TeamsList />;
            }
            break;
        case 'auth':
            content = <EmailsAndAuth />;
            break;
        case 'notifications':
            content = <Notifications />;
            break;
        case 'general':
            content = <GeneralSettings />;
            break;
        default:
            // Fallback for unknown routes
            content = <MyProfile />;
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8 w-full max-w-6xl mx-auto px-4 sm:px-6">
            <SettingsSidebar />
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-500">
                {content}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
            <AccountSettingsContent />
        </Suspense>
    );
}
