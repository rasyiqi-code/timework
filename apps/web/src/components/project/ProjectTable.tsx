'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { type Dictionary } from '@/i18n/dictionaries';

interface ProjectTableProps {
    projects: {
        id: string;
        title: string;
        status: string;
        items: {
            id: string;
            title: string;
            status: string;
            updatedAt: Date;
            originProtocolItemId: string | null;
        }[];
    }[];
    headers: {
        id: string;
        title: string;
    }[];
    dict: Dictionary['project'];
}

export function ProjectTable({ projects, headers, dict }: ProjectTableProps) {
    if (projects.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    🚀
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 dark:text-slate-200">{dict.noProjects}</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto dark:text-slate-400">
                    {dict.noProjectsDesc}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto scrollbar-hover rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap sticky left-0 bg-slate-50 z-10 dark:bg-slate-900 dark:text-slate-400">
                            {dict.title}
                        </th>
                        {headers.map(header => (
                            <th key={header.id} className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap border-l border-slate-100 dark:border-slate-800 dark:text-slate-400">
                                {header.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.map(project => (
                        <tr key={project.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                            {/* Project Title Column */}
                            <td className="p-4 sticky left-0 bg-white z-10 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
                                <Link href={`/projects/${project.id}`} className="group block">
                                    <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors dark:text-slate-200 dark:group-hover:text-indigo-400">
                                        {project.title}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider mt-1">
                                        <span className={`px-1.5 py-0.5 rounded border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                            project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </Link>
                            </td>

                            {/* Dynamic Task Columns */}
                            {headers.map(header => {
                                // Find matching item in project
                                const item = project.items.find(i =>
                                    i.originProtocolItemId === header.id ||
                                    (i.title === header.title && !i.originProtocolItemId) // Fallback by Title
                                );

                                if (!item) {
                                    return <td key={header.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
                                        <span className="text-slate-300 text-xs dark:text-slate-700">-</span>
                                    </td>;
                                }

                                const isDone = item.status === 'DONE';

                                return (
                                    <td key={header.id} className={`p-4 border-l border-slate-100 dark:border-slate-800 min-w-[140px] ${isDone ? 'bg-emerald-50/10' : ''}`}>
                                        {isDone ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                    {format(new Date(item.updatedAt), 'dd/MM/yyyy')}
                                                </span>
                                                <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">
                                                    {format(new Date(item.updatedAt), 'HH:mm')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 opacity-50">
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'IN_PROGRESS' ? 'bg-amber-400' :
                                                    item.status === 'OPEN' ? 'bg-indigo-400' : 'bg-slate-300'
                                                    }`}></span>
                                                <span className="text-[10px] text-slate-400 uppercase font-medium dark:text-slate-600">
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
