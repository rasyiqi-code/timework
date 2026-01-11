'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Settings, Bell, Monitor, Plus } from 'lucide-react';
import { useUser } from '@stackframe/stack';

// Fallback for cn since @/lib/utils is missing
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}


export function SettingsSidebar() {
    const pathname = usePathname();
    const user = useUser();
    const teams = user?.useTeams() || [];

    const ACCOUNT_ITEMS = [
        { label: 'My Profile', href: '/account-settings', icon: User, matchExact: true },
        { label: 'Emails & Auth', href: '/account-settings/auth', icon: Shield },
        { label: 'Notifications', href: '/account-settings/notifications', icon: Bell },
        { label: 'Active Sessions', href: '/account-settings/security', icon: Monitor },
        { label: 'General', href: '/account-settings/general', icon: Settings },
    ];

    return (
        <nav className="w-full md:w-64 shrink-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Account Section */}
            <div>
                <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Account Settings
                </h3>
                <div className="space-y-1">
                    {ACCOUNT_ITEMS.map((item) => {
                        const isActive = item.matchExact
                            ? pathname === item.href
                            : pathname?.startsWith(item.href);

                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/70")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Teams Section */}
            <div>
                <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Teams
                </h3>
                <div className="space-y-1">
                    {teams.map((team) => {
                        const href = `/account-settings/teams/${team.id}`;
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={team.id}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {team.displayName.charAt(0).toUpperCase()}
                                </div>
                                {team.displayName}
                            </Link>
                        );
                    })}

                    <Link
                        href="/account-settings/teams/create"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-all duration-200"
                    >
                        <Plus className="w-4 h-4 text-muted-foreground/70" />
                        Create a team
                    </Link>
                </div>
            </div>

            {/* Advanced Section */}
            <div className="pt-4 mt-4 border-t border-border/50">
                <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Advanced
                </h3>
                <Link
                    href="/account-settings/advanced"
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                        pathname === '/account-settings/advanced'
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    <Settings className="w-4 h-4" />
                    Full Settings
                </Link>
            </div>
        </nav>
    );
}
