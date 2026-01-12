'use client';

import { useState, useTransition } from 'react';
import { updateProtocolItem, deleteProtocolItem, addDependency, deleteProtocolDependency, addProtocolItem } from '@/actions/protocol';
import { ProtocolItem, ProtocolDependency } from '@repo/database';
import { Pencil, Check, X, Trash2, GripVertical, Plus, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ItemWithRelations = ProtocolItem & {
    dependsOn: ProtocolDependency[];
    requiredBy: ProtocolDependency[];
    defaultAssignee: { id: string, name: string | null } | null;
    children: (ProtocolItem & {
        defaultAssignee: { id: string, name: string | null } | null;
    })[];
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
    const [isPending, startTransition] = useTransition();
    const [isAddingSubtask, setIsAddingSubtask] = useState(false); // New State for Subtask Form
    const [showDescription, setShowDescription] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
    };

    // Edit State
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description || ''); // New Description State
    const [assigneeId, setAssigneeId] = useState(item.defaultAssigneeId || '');
    const [type, setType] = useState(item.type);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description); // Append description
            formData.append('defaultAssigneeId', assigneeId);
            formData.append('type', type);

            await updateProtocolItem(item.id, formData);
            setIsEditing(false);
            toast.success('Item updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update item');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(item.title);
        setDescription(item.description || '');
        setAssigneeId(item.defaultAssigneeId || '');
        setType(item.type);
        setIsEditing(false);
    }

    const handleAddDependency = (prereqId: string) => {
        if (!prereqId) return;

        startTransition(async () => {
            try {
                await addDependency(item.id, prereqId);
                toast.success('Dependency added');
            } catch (error) {
                console.error(error);
                if (error instanceof Error && error.message.includes('Cycle detected')) {
                    toast.error('Cannot add dependency: Cycle detected');
                } else {
                    toast.error('Failed to add dependency');
                }
            }
        });
    }

    const handleDeleteDependency = (depId: string) => {
        startTransition(async () => {
            try {
                await deleteProtocolDependency(depId);
                toast.success('Dependency removed');
            } catch (error) {
                console.error(error);
                toast.error('Failed to remove dependency');
            }
        });
    }

    // Check if it is a NOTE
    const isNote = item.type === 'NOTE';
    const isGroup = item.type === 'GROUP';

    if (isEditing) {
        return (
            <div ref={setNodeRef} style={style} className="relative group flex items-start opacity-100 scale-100 transition-all">
                <div className="flex-1 bg-white border-2 border-indigo-500 rounded-lg p-2 shadow-md flex flex-col gap-2 dark:bg-slate-900 dark:border-indigo-500 z-10">
                    {/* EDIT FORM */}
                    {/* EDIT FORM */}
                    <div className="flex flex-col gap-2">
                        {/* Type & Title Row */}
                        <div className="flex flex-col md:flex-row gap-2 md:items-center">
                            {/* Type Switcher */}
                            <div className="flex bg-slate-100 rounded p-1 gap-1 shrink-0 dark:bg-slate-800 text-[10px] font-bold w-fit">
                                <button type="button" onClick={() => setType('TASK')} className={`px-2 py-0.5 rounded transition-colors ${type === 'TASK' ? 'bg-white shadow text-indigo-600 dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Task</button>
                                <button type="button" onClick={() => setType('NOTE')} className={`px-2 py-0.5 rounded transition-colors ${type === 'NOTE' ? 'bg-white shadow text-amber-600 dark:bg-slate-700 dark:text-amber-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Note</button>
                                <button type="button" onClick={() => setType('GROUP')} className={`px-2 py-0.5 rounded transition-colors ${type === 'GROUP' ? 'bg-white shadow text-slate-800 dark:bg-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Group</button>
                            </div>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm font-bold border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                placeholder="Title"
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 resize-y"
                            placeholder="Description..."
                            rows={2}
                        />

                        {/* Footer: Assignee & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                            <div className="w-40">
                                {!isGroup && (
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
                                )}
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                >
                                    <Check className="w-3.5 h-3.5" /> Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Connector Line */}
            {index < allItems.length - 1 && (
                <div className="absolute left-[19px] top-8 h-full w-px bg-slate-200 -z-10 group-hover:bg-indigo-300 dark:bg-slate-800 dark:group-hover:bg-indigo-500/50"></div>
            )}

            <div className="flex items-start">
                <div className={`w-[40px] flex justify-center shrink-0 pt-3 cursor-grab active:cursor-grabbing hover:text-indigo-500 ${isNote ? 'text-amber-400' : 'text-slate-300'}`}
                    {...attributes} {...listeners}>
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className={`flex-1 border rounded-lg p-2 hover:shadow-sm transition-all flex flex-col gap-2 
                    ${isGroup
                        ? 'bg-slate-100 border-transparent shadow-none rounded-md mb-2 dark:bg-slate-800 dark:border-slate-700/50'
                        : isNote
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300 dark:bg-amber-900/10 dark:border-amber-900/50 dark:hover:border-amber-800'
                            : 'bg-white border-slate-100 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/50'
                    }`}>

                    {/* Top Section: Columns */}
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">

                        {/* Left: Title & Meta */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-mono ${isNote ? 'text-amber-600/50 dark:text-amber-500/50' : 'text-slate-400 dark:text-slate-500'}`}>#{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`truncate cursor-pointer hover:underline 
                                            ${isGroup
                                                ? 'font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400'
                                                : isNote
                                                    ? 'font-bold text-sm text-amber-900 dark:text-amber-100'
                                                    : 'font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600'
                                            }`} onClick={() => setIsEditing(true)}>
                                            {item.title}
                                        </h4>
                                        {item.description && (
                                            <button
                                                onClick={() => setShowDescription(!showDescription)}
                                                className={`transition-colors p-0.5 rounded ${showDescription ? 'text-indigo-500 bg-indigo-50' : 'text-slate-400 hover:text-indigo-500'}`}
                                                title="Show Note/Description"
                                            >
                                                <StickyNote className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pl-6">
                                {!isGroup && item.defaultAssignee && (
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                        👤 {item.defaultAssignee.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Middle: Dependencies (Show mostly for tasks, but Notes can be dependants too) */}
                        <div className="flex-1 md:border-l md:border-slate-100 md:pl-3 min-w-0 dark:md:border-slate-800">
                            {!isGroup && (
                                item.dependsOn.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {item.dependsOn.map(dep => {
                                            const prereq = allItems.find(i => i.id === dep.prerequisiteId);
                                            return (
                                                <span key={dep.id} className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] border border-amber-100 flex items-center gap-1 group/badge truncate max-w-full dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                    <span className="truncate">{prereq?.title || '?'}</span>
                                                    <button
                                                        onClick={() => handleDeleteDependency(dep.id)}
                                                        className="w-3 h-3 flex items-center justify-center rounded-full hover:bg-amber-200 text-amber-500 hover:text-red-500 opacity-0 group-hover/badge:opacity-100 transition-opacity dark:hover:bg-amber-900/50"
                                                        title="Remove"
                                                        type="button"
                                                        disabled={isPending}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-slate-300 italic dark:text-slate-600">No prerequisites</span>
                                )
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-50 shrink-0 dark:border-slate-800">

                            {/* Add Subtask Button (Only for top-level items) */}
                            {!item.parentId && (
                                <button
                                    onClick={() => setIsAddingSubtask(!isAddingSubtask)}
                                    className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:text-slate-600 dark:hover:bg-indigo-900/20"
                                    title="Add Subtask"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 ${isNote ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-100' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:text-slate-600 dark:hover:bg-indigo-900/20'}`}
                                title="Edit Task"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Prerequisite Selector */}
                            {!isGroup && (
                                <div className="w-24">
                                    <select
                                        className="w-full py-1 pl-1 pr-4 text-[10px] rounded bg-slate-50 border-0 ring-1 ring-slate-100 focus:ring-indigo-300 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 disabled:opacity-50"
                                        onChange={(e) => {
                                            handleAddDependency(e.target.value);
                                            e.target.value = ''; // Reset
                                        }}
                                        defaultValue=""
                                        disabled={isPending}
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
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (confirm("Delete this?")) {
                                        deleteProtocolItem(item.id);
                                    }
                                }}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors dark:text-slate-600 dark:hover:bg-red-900/20"
                                title="Delete"
                                type="button"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Description Full Width */}
                    {item.description && showDescription && (
                        <div className="w-full mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                            <p className={`text-xs whitespace-pre-wrap p-2 rounded bg-slate-50 border border-slate-100 ${isNote ? 'text-amber-800 bg-amber-50/50 border-amber-100 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800/50' : 'text-slate-600 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                                {item.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtask Creation Form */}
            {isAddingSubtask && (
                <div className="ml-8 mt-2 p-2 border border-dashed border-indigo-200 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800">
                    <SubtaskForm
                        protocolId={item.protocolId}
                        parentId={item.id}
                        onCancel={() => setIsAddingSubtask(false)}
                        users={users}
                    />
                </div>
            )}

            {/* Render Children (Subtasks) Recursively */}
            {(() => {
                // Derived children from allItems for full feature support
                const children = allItems.filter(i => i.parentId === item.id).sort((a, b) => a.order - b.order);

                if (children.length === 0) return null;

                return (
                    <div className="ml-8 space-y-2 mt-2 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                        {children.map((child, i) => (
                            <ProtocolItemRow
                                key={child.id}
                                item={child}
                                index={i}
                                allItems={allItems} // Pass full context
                                users={users}
                            />
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}

function SubtaskForm({ protocolId, parentId, onCancel, users }: { protocolId: string, parentId: string, onCancel: () => void, users: { id: string, name: string | null }[] }) {
    return (
        <form action={async (formData) => {
            formData.append('parentId', parentId);
            await addProtocolItem(protocolId, formData);
            onCancel();
            toast.success('Subtask added');
        }} className="flex gap-2 items-center">
            <input
                name="title"
                placeholder="Subtask title..."
                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                autoFocus
                required
            />
            <input name="description" placeholder="Description..." className="hidden" /> {/* Optional, kept simple */}
            <select
                name="defaultAssigneeId"
                className="w-24 px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
                <option value="">User</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || 'User'}</option>
                ))}
            </select>
            <button type="submit" className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Add</button>
            <button type="button" onClick={onCancel} className="px-2 py-1 text-slate-500 text-xs hover:text-slate-700">Cancel</button>
        </form>
    )
}
