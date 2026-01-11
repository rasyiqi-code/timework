'use client';

import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, Users, Plus, Settings, CheckCircle2 } from 'lucide-react';

export function TeamsList() {
    const user = useUser();
    const teams = user?.useTeams(); // This is a hook-like property in Stack
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [creating, setCreating] = useState(false);

    if (!user || !teams) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        setCreating(true);
        try {
            await user.createTeam({ displayName: newTeamName });
            setNewTeamName('');
            setIsCreating(false);
            // Stack hooks should auto-update the list
        } catch (error) {
            console.error('Failed to create team', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        My Teams
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage the workspaces you belong to.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Team
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <form onSubmit={handleCreateTeam} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Team Name</label>
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="e.g. Engineering"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating || !newTeamName}
                            className="h-10 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                    <div key={team.id} className="group relative bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                                {team.displayName.substring(0, 2).toUpperCase()}
                            </div>
                            {user.selectedTeam?.id === team.id && (
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Current
                                </span>
                            )}
                        </div>

                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate" title={team.displayName}>
                            {team.displayName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            ID: <span className="font-mono">{team.id.substring(0, 8)}...</span>
                        </p>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => user.setSelectedTeam(team)}
                                disabled={user.selectedTeam?.id === team.id}
                                className="flex-1 text-xs font-medium py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Switch
                            </button>
                            {/* We can link to specific team settings if we make dynamic routes later, for now just show we can't deep-link without id in url */}
                            <Link href={`/account-settings/teams/${team.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Manage Team Settings">
                                <Settings className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {teams.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No teams found</p>
                        <p className="text-sm text-slate-400">Create one to get started collaborating.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
