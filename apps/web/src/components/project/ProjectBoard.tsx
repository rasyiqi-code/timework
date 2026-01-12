'use client';

import { updateItemStatus } from '@/actions/project';
import { type ProjectItem, type ItemDependency, type Project } from '@repo/database';

type ProjectItemWithRelations = ProjectItem & {
    type?: 'TASK' | 'NOTE' | 'GROUP';
    parentId?: string | null;
    order?: number;
    dependsOn: (ItemDependency & { prerequisite: ProjectItem })[]; // Adjusted type
    requiredBy: ItemDependency[];
};

import { ProjectItemCard } from './ProjectItemCard';
import { GapInjector } from './GapInjector';

import type { User } from '@repo/database';
import { type Dictionary } from '@/i18n/dictionaries';

export function ProjectBoard({ project, users, currentUser, dict }: {
    project: Project & { items: ProjectItemWithRelations[] },
    users: { id: string, name: string | null }[],
    currentUser: User | null,
    dict: Dictionary
}) {
    // Topological Sort to respect dependency chain (Step 1 -> Step 2 -> Step 3)
    // We want to visualize the workflow "Script" regardless of current status.

    const sortedItems = (() => {
        // Hierarchical Sort (Respect Protocol Order)
        const items = [...project.items];
        const itemMap = new Map(items.map(i => [i.id, i]));

        // 1. Group by Parent
        const childrenMap = new Map<string, typeof items>();
        const roots: typeof items = [];

        items.forEach(item => {
            if (item.parentId) {
                if (!childrenMap.has(item.parentId)) childrenMap.set(item.parentId, []);
                childrenMap.get(item.parentId)?.push(item);
            } else {
                roots.push(item);
            }
        });

        // 2. Recursive Flatten items
        const result: typeof items = [];

        const traverse = (nodes: typeof items) => {
            // Sort by Order
            nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            nodes.forEach(node => {
                result.push(node);
                const children = childrenMap.get(node.id);
                if (children) {
                    traverse(children);
                }
            });
        };

        traverse(roots);
        return result;
    })();


    const isSatuan = project.category === 'SATUAN';

    if (isSatuan) {
        // --- SATUAN MODE (Compact Ticket View) ---
        return (
            <div className="w-full pb-12 pt-4">
                <div className="flex items-center gap-2 mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl dark:bg-purple-900/20 dark:border-purple-800">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-300">{dict.project.fastTrack}</h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">{dict.project.fastTrackDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedItems.map((item) => (
                        <div key={item.id} className={`
                            relative p-5 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800
                            ${item.status === 'DONE' ? 'bg-white border-emerald-500 dark:bg-slate-900 dark:border-l-emerald-500/50' :
                                item.status === 'IN_PROGRESS' ? 'bg-white border-blue-500 ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-blue-900 dark:border-l-blue-500' :
                                    'bg-slate-50 border-slate-300 opacity-80 dark:bg-slate-800/50 dark:border-l-slate-600'}
                        `}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                    item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                        'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                                {item.status === 'DONE' && <span className="text-emerald-500 text-lg">✓</span>}
                            </div>
                            <h3 className="font-bold text-slate-800 leading-snug mb-1 dark:text-slate-100">{item.title}</h3>
                            {item.description && <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-400">{item.description}</p>}

                            {/* Quick Action for Admin */}
                            {item.status !== 'DONE' && item.status !== 'LOCKED' && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end dark:border-slate-800">
                                    <button
                                        onClick={() => updateItemStatus(item.id, 'DONE')}
                                        className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                    >
                                        {dict.project.markDone}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- SPT MODE (Standard Timeline) ---
    return (
        <div className="relative w-full pb-12 pt-4">

            <div className="relative w-full pb-20">

                {/* Continuous Vertical Line */}
                <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent -z-10 hidden md:block dark:from-indigo-900 dark:via-slate-800"></div>

                {sortedItems.map((item, index) => (
                    <div key={item.id}>
                        {/* Inline Injection Point */}
                        <GapInjector projectId={project.id} nextItemId={item.id} currentUser={currentUser} />

                        <ProjectItemCard
                            item={item}
                            users={users}
                            index={index}
                            currentUser={currentUser}
                            dict={dict}
                            projectOwnerId={project.createdById}
                        />
                    </div>
                ))}

                {/* End Node */}
                <div className="relative pl-24 opacity-40">
                    <div className="absolute left-[35px] top-0 w-2.5 h-2.5 bg-slate-300 rounded-full dark:bg-slate-700"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pt-1 dark:text-slate-600">{dict.project.endOfWorkflow}</p>
                </div>
            </div>
        </div>
    );
}
