'use client';

import { useState } from 'react';
import { updateProtocolItem, deleteProtocolItem, addDependency, deleteProtocolDependency, moveProtocolItem } from '@/actions/protocol';
import { ProtocolItem, ProtocolDependency } from '@repo/database';
import { Pencil, Check, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

type ItemWithRelations = ProtocolItem & {
    dependsOn: ProtocolDependency[];
    requiredBy: ProtocolDependency[];
    defaultAssignee: { id: string, name: string | null } | null;
};

interface ProtocolItemRowProps {
    item: ItemWithRelations;
    index: number;
    allItems: ItemWithRelations[];
    users: { id: string, name: string | null }[];
}

export function ProtocolItemRow({ item, index, allItems, users }: ProtocolItemRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit State
    const [title, setTitle] = useState(item.title);
    const [duration, setDuration] = useState(item.duration);
    const [assigneeId, setAssigneeId] = useState(item.defaultAssigneeId || '');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('duration', duration.toString());
            formData.append('defaultAssigneeId', assigneeId);

            await updateProtocolItem(item.id, formData);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert('Failed to update item');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(item.title);
        setDuration(item.duration);
        setAssigneeId(item.defaultAssigneeId || '');
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="relative group flex items-start opacity-100 scale-100 transition-all">
                <div className="flex-1 bg-white border-2 border-indigo-500 rounded-lg p-2 shadow-md flex flex-col md:flex-row gap-2 md:items-center dark:bg-slate-900 dark:border-indigo-500 z-10">
                    {/* EDIT FORM */}
                    <div className="flex-1 w-full flex gap-2">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm font-bold border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="Task Title"
                            autoFocus
                        />
                        <div className="w-20 shrink-0">
                            <input
                                type="number"
                                min={1}
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 text-sm font-bold text-center border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                title="Duration (Days)"
                            />
                        </div>
                        <div className="w-32 shrink-0">
                            <select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            >
                                <option value="">No Assignee</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name || 'User'}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative group flex items-start">
            {/* Connector Line */}
            {index < allItems.length - 1 && (
                <div className="absolute left-[19px] top-8 h-full w-px bg-slate-200 -z-10 group-hover:bg-indigo-300 dark:bg-slate-800 dark:group-hover:bg-indigo-500/50"></div>
            )}

            <div className="w-[40px] flex justify-center shrink-0 pt-3">
                <div className="w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white group-hover:bg-indigo-500 transition-colors dark:bg-slate-700 dark:ring-slate-950 dark:group-hover:bg-indigo-500"></div>
            </div>

            <div className="flex-1 bg-white border border-slate-100 rounded-lg p-2 hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col md:flex-row gap-2 md:items-center dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/50">
                {/* Left: Title & Meta */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{index + 1}</span>
                        <h4 className="font-bold text-sm text-slate-800 truncate dark:text-slate-200 cursor-pointer hover:text-indigo-600" onClick={() => setIsEditing(true)}>{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">

                        {item.defaultAssignee && (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                👤 {item.defaultAssignee.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Middle: Dependencies */}
                <div className="flex-1 md:border-l md:border-slate-100 md:pl-3 min-w-0 dark:md:border-slate-800">
                    {item.dependsOn.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {item.dependsOn.map(dep => {
                                const prereq = allItems.find(i => i.id === dep.prerequisiteId);
                                return (
                                    <span key={dep.id} className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] border border-amber-100 flex items-center gap-1 group/badge truncate max-w-full dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                        <span className="truncate">{prereq?.title || '?'}</span>
                                        <button
                                            onClick={() => deleteProtocolDependency(dep.id)}
                                            className="w-3 h-3 flex items-center justify-center rounded-full hover:bg-amber-200 text-amber-500 hover:text-red-500 opacity-0 group-hover/badge:opacity-100 transition-opacity dark:hover:bg-amber-900/50"
                                            title="Remove"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-[10px] text-slate-300 italic dark:text-slate-600">No prerequisites</span>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-50 shrink-0 dark:border-slate-800">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 mr-1">
                        <button
                            onClick={() => moveProtocolItem(item.id, 'UP')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
                            title="Move Up"
                        >
                            <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => moveProtocolItem(item.id, 'DOWN')}
                            disabled={index === allItems.length - 1}
                            className="p-0.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
                            title="Move Down"
                        >
                            <ArrowDown className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors dark:text-slate-600 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100"
                        title="Edit Task"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Prerequisite Selector */}
                    <form action={(formData) => {
                        const prereqId = formData.get('prerequisiteId') as string;
                        if (prereqId) addDependency(item.id, prereqId);
                    }} className="w-24">
                        <select
                            name="prerequisiteId"
                            className="w-full py-1 pl-1 pr-4 text-[10px] rounded bg-slate-50 border-0 ring-1 ring-slate-100 focus:ring-indigo-300 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                            onChange={(e) => e.target.value && e.target.form?.requestSubmit()}
                            defaultValue=""
                        >
                            <option value="" disabled>+ Dep</option>
                            {allItems
                                .filter(i => i.id !== item.id)
                                .filter(i => !item.dependsOn.some(d => d.prerequisiteId === i.id))
                                .map(i => (
                                    <option key={i.id} value={i.id}>{i.title}</option>
                                ))
                            }
                        </select>
                    </form>

                    <button
                        onClick={() => {
                            if (confirm("Delete this task?")) {
                                deleteProtocolItem(item.id);
                            }
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors dark:text-slate-600 dark:hover:bg-red-900/20"
                        title="Delete Task"
                        type="button"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
