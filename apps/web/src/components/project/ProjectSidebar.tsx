'use client';

import Link from 'next/link';
import { type Project, type User, type ProjectItem } from '@repo/database';
import { type Dictionary } from '@/i18n/dictionaries';

interface ProjectSidebarProps {
    project: Project & { items: ProjectItem[] };
    users: User[];
    currentUser: User | null;
    dict: Dictionary;
}

export function ProjectSidebar({ project, users, currentUser, dict }: ProjectSidebarProps) {
    const totalItems = project.items.length;
    const completedItems = project.items.filter(i => i.status === 'DONE').length;
    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <aside className="w-full md:w-64 shrink-0 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 md:sticky md:top-20 self-start">
            {/* Project Header Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500">

                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase mb-1 block dark:text-indigo-400">{dict.project.detail.project}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${project.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                            {project.status}
                        </span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mb-2 leading-tight dark:text-slate-100">{project.title}</h1>
                    <p className="text-slate-500 text-xs leading-relaxed dark:text-slate-400">
                        {project.description || dict.project.detail.noDescription}
                    </p>
                </div>

                <div className="space-y-3 mb-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{dict.project.detail.progress}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-400 text-center dark:text-slate-500">
                        {completedItems}/{totalItems} {dict.project.detail.tasksCompleted}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link href="/projects" className="flex-1 py-1.5 text-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700">
                        ← {dict.project.detail.back}
                    </Link>
                    {isAdmin && (
                        <button className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500">
                            {dict.project.detail.settings}
                        </button>
                    )}
                </div>
            </div>

            {/* Team Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{dict.project.detail.teamMembers}</h3>
                <div className="flex flex-wrap gap-1.5">
                    {users.map(u => (
                        <div key={u.id} className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" title={u.name || 'User'}>
                            {(u.name || 'User').substring(0, 2).toUpperCase()}
                        </div>
                    ))}
                    {isAdmin && (
                        <button className="w-6 h-6 rounded bg-white text-slate-400 text-[10px] flex items-center justify-center font-bold border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-500 transition-colors dark:bg-transparent dark:border-slate-700">
                            +
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
