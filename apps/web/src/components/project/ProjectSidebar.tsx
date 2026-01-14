'use client';

import Link from 'next/link';
import { type Project, type User, type ProjectItem } from '@repo/database';
import { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectDetails } from '@/actions/project';
import { type Dictionary } from '@/i18n/dictionaries';
import { type FormField } from '@/actions/form-template';

interface ProjectSidebarProps {
    project: Project & { items: ProjectItem[] };
    users: User[];
    currentUser: User | null;
    dict: Dictionary;
    fields: FormField[];
}

export function ProjectSidebar({ project, users, currentUser, dict, fields }: ProjectSidebarProps) {
    const totalItems = project.items.length;
    const completedItems = project.items.filter(i => i.status === 'DONE').length;
    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
    const isManager = currentUser?.role === 'MANAGER';
    const isStaff = currentUser?.role === 'STAFF';
    const isCreator = currentUser?.id === project.createdById;
    const canEdit = isAdmin || isCreator || isManager || isStaff;

    const [isEditMode, setIsEditMode] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [optimisticProject, setOptimisticProject] = useOptimistic(
        project,
        (state, newValues: { title: string; description: string }) => ({
            ...state,
            ...newValues
        })
    );

    // Edit State for controlled inputs
    const [editTitle, setEditTitle] = useState(project.title);
    const [editDesc, setEditDesc] = useState(project.description || '');

    const handleSave = async (formData: FormData) => {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        startTransition(async () => {
            // 1. Optimistic Update
            setOptimisticProject({ title, description });
            setIsEditMode(false);

            // 2. Server Action
            await updateProjectDetails(project.id, { title, description });
            router.refresh();
        });
    };

    return (
        <aside className="w-full md:w-64 shrink-0 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 md:sticky md:top-20 self-start">
            {/* Project Header Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500">

                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase mb-1 block dark:text-indigo-400">{dict.project.detail.project}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${project.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                                {project.status}
                            </span>
                            {canEdit && !isEditMode && (
                                <button
                                    onClick={() => {
                                        setEditTitle(optimisticProject.title);
                                        setEditDesc(optimisticProject.description || '');
                                        setIsEditMode(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                    title="Edit Project Details"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditMode ? (
                        <form action={handleSave} className="space-y-3 mt-2">
                            <input
                                name="title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                                className="w-full text-sm font-bold bg-slate-50 border border-indigo-300 rounded px-2 py-1 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            />
                            <textarea
                                name="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={3}
                                className="w-full text-xs bg-slate-50 border border-indigo-300 rounded px-2 py-1 text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditMode(false)}
                                    disabled={isPending}
                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                >
                                    {isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1 className="text-lg font-bold text-slate-900 mb-2 leading-tight dark:text-slate-100">{optimisticProject.title}</h1>
                            <p className="text-slate-500 text-xs leading-relaxed dark:text-slate-400 whitespace-pre-wrap">
                                {optimisticProject.description || dict.project.detail.noDescription}
                            </p>
                        </>
                    )}

                    {/* Metadata Section */}
                    {project.metadata && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            {fields.map(field => {
                                const value = (project.metadata as Record<string, unknown>)?.[field.key];
                                if (!value) return null;
                                return (
                                    <div key={field.key} className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
