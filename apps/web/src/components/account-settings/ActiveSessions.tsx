'use client';

import { useUser } from '@stackframe/stack';
import { useEffect, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Monitor, Smartphone, Trash2, Globe, Laptop, ShieldCheck } from 'lucide-react';

interface ActiveSession {
    id: string;
    userId: string;
    createdAt: Date;
    isImpersonation: boolean;
    lastUsedAt: Date | undefined;
    isCurrentSession: boolean;
    geoInfo?: {
        ip?: string;
        cityName?: string | null;
        countryName?: string | null;
        countryCode?: string | null;
        regionCode?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    };
    userAgent?: string;
}

function getDeviceIcon(userAgent?: string) {
    if (!userAgent) return <Monitor className="w-5 h-5" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
        return <Smartphone className="w-5 h-5" />;
    }
    return <Laptop className="w-5 h-5" />;
}

function getDeviceName(userAgent?: string) {
    if (!userAgent) return 'Unknown Device';
    const ua = userAgent.toLowerCase();
    if (ua.includes('macintosh')) return 'Mac';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('linux')) return 'Linux Machine';
    return 'Unknown Device';
}

export function ActiveSessions() {
    const user = useUser();
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const loadSessions = useCallback(async () => {
        try {
            setLoading(true);
            // @ts-expect-error - getActiveSessions is available in newer SDK versions
            const data = await user.getActiveSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadSessions();
        }
    }, [user, loadSessions]);

    const handleRevoke = async (sessionId: string) => {
        try {
            setRevokingId(sessionId);
            await user?.revokeSession(sessionId);
            await loadSessions();
        } catch (error) {
            console.error('Failed to revoke session', error);
        } finally {
            setRevokingId(null);
        }
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Active Sessions
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage devices where your account is currently logged in.
                    </p>
                </div>
                {/* Placeholder for future Revoke All */}
                {/* <button className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
                    Revoke All Unknown
                </button> */}
            </div>

            {/* Sessions Card */}
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                        >
                            {/* Device Info */}
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl flex-shrink-0 ${session.isCurrentSession
                                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    : 'bg-slate-100 text-muted-foreground dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {getDeviceIcon(session.userAgent)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm text-foreground">
                                            {session.isCurrentSession ? 'Current Session' : getDeviceName(session.userAgent)}
                                        </h3>
                                        {session.isCurrentSession && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                Active Now
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {session.geoInfo?.cityName || 'Unknown Location'}
                                            {session.geoInfo?.ip && <span className="text-slate-300 dark:text-slate-600">•</span>}
                                            {session.geoInfo?.ip}
                                        </div>
                                        <div>
                                            Signed in {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pl-16 sm:pl-0">
                                {!session.isCurrentSession && (
                                    <button
                                        onClick={() => handleRevoke(session.id)}
                                        disabled={!!revokingId}
                                        className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-2 group-hover:opacity-100 sm:opacity-0 focus:opacity-100"
                                    >
                                        {revokingId === session.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="sm:hidden">Revoke</span>
                                                <Trash2 className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                                {session.isCurrentSession && (
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-900/30 rounded-lg p-4 flex gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-indigo-500" />
                <p>
                    If you see a session you don&apos;t recognize, revoke it immediately and change your password.
                </p>
            </div>
        </div>
    );
}
