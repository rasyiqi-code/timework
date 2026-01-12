'use client';

import { useState, useTransition } from 'react';
import { updateItemStatus } from '@/actions/project';
import { useRouter } from 'next/navigation';
import { AssigneeSelector } from './AssigneeSelector';
import { type ProjectItem, type ItemDependency } from '@repo/database';
import { type Dictionary } from '@/i18n/dictionaries';

type ProjectItemWithRelations = ProjectItem & {
    dependsOn: (ItemDependency & { prerequisite: ProjectItem })[];
    requiredBy: ItemDependency[];
};

import type { User } from '@repo/database';

interface ProjectItemCardProps {
    item: ProjectItemWithRelations;
    users: { id: string, name: string | null }[];
    index: number;
    currentUser: User | null;
    dict: Dictionary;
}

export function ProjectItemCard({ item, users, index, currentUser, dict }: ProjectItemCardProps) {
    const router = useRouter();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (itemId: string, newStatus: string) => {
        startTransition(async () => {
            await updateItemStatus(itemId, newStatus);
            router.refresh();
        });
    };

    return (
        <div key={item.id} className="relative group md:pl-14 py-0.5">
            {/* Timeline Dot / Connector */}
            <div className={`absolute left-[34px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 hidden md:block
                ${item.status === 'DONE' ? 'bg-emerald-500 ring-2 ring-emerald-50' :
                    item.status === 'OPEN' ? 'bg-indigo-500 ring-2 ring-indigo-50' : 'bg-slate-300'}
            `}></div>

            {/* Connection to Card */}
            <div className="absolute left-[38px] top-[29px] w-5 h-px bg-slate-200 hidden md:block group-hover:bg-indigo-300 transition-colors"></div>

            {/* Compact Card */}
            <div className={`
                w-full px-4 py-3 rounded-lg border transition-all duration-200 relative
                ${item.status === 'LOCKED'
                    ? 'bg-slate-50 border-slate-200/60 grayscale opacity-70 dark:bg-slate-900/50 dark:border-slate-800'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500'
                }
            `}>
                {/* Per-Card Edit Toggle - Top Right - Subtle */}
                {item.status !== 'LOCKED' && currentUser?.role === 'ADMIN' && (
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`absolute top-2 right-2 p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-all dark:hover:bg-slate-800 ${isEditMode ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/40' : ''}`}
                        title={isEditMode ? dict.project.detail.lockAssignments : dict.project.detail.unlockAssignments}
                    >
                        <span className="text-[10px] block w-4 h-4 text-center leading-4">{isEditMode ? '🔓' : '🔒'}</span>
                    </button>
                )}

                <div className="flex flex-col md:flex-row gap-3 items-center">

                    {/* LEFT: Status & Title - Growing to fill space */}
                    <div className="flex items-center gap-3 w-full md:flex-1 min-w-0">
                        {/* Status Pill */}
                        <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${item.status === 'OPEN' ? 'bg-indigo-500' :
                            item.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                item.status === 'DONE' ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}></div>

                        <div className="min-w-0 flex-1">
                            {isEditMode ? (
                                <input
                                    type="text"
                                    defaultValue={item.title}
                                    onBlur={(e) => {
                                        if (e.target.value !== item.title) {
                                            import('@/actions/project').then(mod => mod.updateProjectItemDetails(item.id, { title: e.target.value }));
                                        }
                                    }}
                                    className="text-sm font-semibold w-full bg-slate-50 border border-indigo-200 rounded px-2 py-0.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-indigo-900 dark:text-slate-100"
                                />
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <h3 className={`text-sm font-semibold truncate ${item.status === 'LOCKED' ? 'text-slate-500 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.title}
                                    </h3>
                                    {/* Date (Mock) */}
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-600 shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                        Jan 0{index + 1}
                                    </span>
                                </div>
                            )}

                            {/* Description / Dependencies - Expandable but maximizes width first */}
                            <div
                                onClick={() => !isEditMode && setIsDetailsExpanded(!isDetailsExpanded)}
                                className={`
                                    text-[11px] text-slate-500 transition-all cursor-pointer hover:bg-slate-50 rounded px-1 -ml-1 mt-0.5 dark:text-slate-400 dark:hover:bg-slate-800
                                    ${isDetailsExpanded ? 'h-auto whitespace-normal' : 'h-5 flex items-center gap-2'}
                                `}
                                title={!isDetailsExpanded ? dict.project.detail.clickToExpand : dict.project.detail.clickToCollapse}
                            >
                                {isEditMode ? (
                                    <textarea
                                        defaultValue={item.description || ''}
                                        placeholder={dict.project.detail.descriptionPlaceholder}
                                        onBlur={(e) => {
                                            if (e.target.value !== item.description) {
                                                import('@/actions/project').then(mod => mod.updateProjectItemDetails(item.id, { description: e.target.value }));
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        rows={1}
                                        className="w-full bg-slate-50 border border-indigo-200 rounded px-1 py-1 cursor-text min-h-[1.5rem] resize-y leading-tight focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-indigo-900 dark:text-slate-100"
                                    />
                                ) : (
                                    <>
                                        {/* Description */}
                                        <div className={`${isDetailsExpanded ? 'mb-1' : 'truncate'}`}>
                                            {item.description || <span className="italic opacity-50">{dict.project.detail.noDetails}</span>}
                                        </div>

                                        {/* Dependencies */}
                                        {item.dependsOn && item.dependsOn.length > 0 && (
                                            <div className={`
                                                ${isDetailsExpanded ? 'flex flex-col gap-1 border-t border-slate-100 pt-1 mt-1 dark:border-slate-800' : 'flex items-center gap-1 pl-2 border-l border-slate-200 min-w-0 dark:border-slate-700'}
                                            `}>
                                                {isDetailsExpanded ? (
                                                    item.dependsOn.map(dep => (
                                                        <div key={dep.id} className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit dark:bg-amber-900/30 dark:text-amber-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                            <span className="font-medium">{dict.project.detail.waitsFor} {dep.prerequisite.title}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // Collapsed View - show as much as possible
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0"></span>
                                                        <span className="truncate">
                                                            {dict.project.detail.waitsFor} {item.dependsOn[0].prerequisite.title}
                                                            {item.dependsOn.length > 1 && ` (+${item.dependsOn.length - 1})`}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Assignee & Actions - Fixed width or shrink-0 */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-50 dark:border-slate-800">
                        <div className="scale-90 origin-right">
                            <AssigneeSelector
                                itemId={item.id}
                                currentUserId={item.assignedToId}
                                users={users}
                                isEditMode={isEditMode}
                            />
                        </div>

                        {item.status !== 'LOCKED' && (
                            (() => {
                                const isUnassigned = !item.assignedToId;
                                const isAssignedToMe = currentUser?.id === item.assignedToId;
                                const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
                                // Assuming we don't have project Creator ID here yet (passed in props?), but backend handles it.
                                // For UI, we'll implement: Admin OR Me OR Unassigned.
                                // If I am NOT Admin, NOT Me, and NOT Unassigned -> Hide button.

                                const canEdit = isAdmin || isAssignedToMe || isUnassigned;

                                if (!canEdit) return null; // Or render disabled button

                                return (
                                    <button
                                        onClick={() => handleStatusChange(item.id, item.status === 'DONE' ? 'OPEN' : 'DONE')}
                                        disabled={isPending}
                                        className={`
                                            h-7 px-3 rounded-md text-xs font-semibold transition-all border shadow-sm flex items-center gap-1.5 cursor-pointer
                                            ${isPending ? 'opacity-70 cursor-wait' : ''}
                                            ${item.status === 'DONE'
                                                ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                                                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500'}
                                        `}
                                    >
                                        {isPending ? (
                                            '...'
                                        ) : item.status === 'DONE' ? (
                                            dict.project.detail.reopen
                                        ) : isUnassigned ? (
                                            dict.project.detail.take
                                        ) : (
                                            <><span>✓</span> {dict.project.detail.done}</>
                                        )}
                                    </button>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
