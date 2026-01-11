'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Loader2, Plus, Users } from 'lucide-react';

interface ClientOnboardingProps {
    hasTeam: boolean; // Computed from server-side user check, but we'll use client hook for actions
    accountSettingsUrl: string;
}

export function ClientOnboarding({ hasTeam }: ClientOnboardingProps) {
    const router = useRouter();
    const user = useUser();
    const teams = user?.useTeams() || [];

    // Safety check: if props say we have a team (selected), redirect immediately
    useEffect(() => {
        if (hasTeam) {
            router.replace('/');
        }
    }, [hasTeam, router]);


    const [newTeamName, setNewTeamName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const team = await user.createTeam({ displayName: newTeamName });
            // Auto-select the new team
            if (team) {
                await user.setSelectedTeam(team);
                window.location.href = '/'; // Hard refresh to ensure everything syncs
            }
        } catch (error) {
            console.error('Failed to create team', error);
            setIsSubmitting(false);
        }
    };

    const handleSelectTeam = async (team: typeof teams[number]) => {
        if (!user) return;
        setIsSubmitting(true);
        await user.setSelectedTeam(team);
        window.location.href = '/';
    };

    if (hasTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-indigo-600 rounded-full mb-4"></div>
                    <p className="text-slate-500 text-sm">Redirecting to Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="max-w-xl w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Let&apos;s Get Started
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        You need a workspace to continue. Join one of your existing teams or create a new one.
                    </p>
                </div>

                {/* Existing Teams List */}
                {teams.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            Your Available Teams
                        </label>
                        <div className="grid gap-3 max-h-60 overflow-y-auto">
                            {teams.map((team) => (
                                <button
                                    key={team.id}
                                    onClick={() => handleSelectTeam(team)}
                                    disabled={isSubmitting}
                                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-200 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            {team.displayName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                {team.displayName}
                                            </p>
                                            <p className="text-xs text-slate-500">ID: {team.id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <Users className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create New Team Form */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            Create New Workspace
                        </label>
                    </div>

                    <form onSubmit={handleCreateTeam} className="flex gap-2">
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="My New Workspace Name"
                            disabled={isSubmitting}
                            className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !newTeamName.trim()}
                            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create
                        </button>
                    </form>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-xs text-center text-slate-500">
                    <p>Don&apos;t see your team? Ask your admin to send you an invite email.</p>
                </div>
            </div>
        </div>
    );
}
