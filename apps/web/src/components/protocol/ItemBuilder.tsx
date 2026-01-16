'use client';

import { addProtocolItem, reorderProtocolItems } from '@/actions/protocol';
import { type ProtocolItem, type ProtocolDependency } from '@repo/database';
import { ProtocolItemRow } from './ProtocolItemRow';
import { type Dictionary } from '@/i18n/dictionaries';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';

type ItemWithRelations = ProtocolItem & {
    dependsOn: ProtocolDependency[];
    requiredBy: ProtocolDependency[];
    defaultAssignee: { id: string, name: string | null } | null;
    children: (ProtocolItem & {
        defaultAssignee: { id: string, name: string | null } | null;
    })[];
};

interface ItemBuilderProps {
    protocolId: string;
    items: ItemWithRelations[];
    users: { id: string, name: string | null }[];
    dict: Dictionary['protocol'];
}

export function ItemBuilder({ protocolId, items: initialItems, users, dict }: ItemBuilderProps) {
    const [items, setItems] = useState(initialItems);
    const [itemType, setItemType] = useState<'TASK' | 'NOTE' | 'GROUP'>('TASK');
    const [, startTransition] = useTransition();

    // Sync state if initialItems change (e.g. from server revalidation)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);

            // Optimistic update
            setItems(newItems);

            // Trigger Server Action
            startTransition(async () => {
                try {
                    await reorderProtocolItems(protocolId, newItems.map(i => i.id));
                } catch {
                    toast.error('Failed to save order');
                }
            });
        }
    }

    return (
        <div className="space-y-8">
            {/* Add Item Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all dark:bg-slate-900 dark:border-slate-800 dark:focus-within:ring-indigo-500/10 dark:focus-within:border-indigo-600">
                <form action={(formData) => {
                    addProtocolItem(protocolId, formData);
                    // Reset form can be handled by key reset or controlled inputs if needed
                }} className="flex flex-col md:flex-row gap-3 items-start">

                    {/* Left: Type Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1 shrink-0 dark:bg-slate-800 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                        <label className="cursor-pointer">
                            <input type="radio" name="type" value="TASK" defaultChecked className="peer sr-only" onChange={() => setItemType('TASK')} />
                            <span className="px-3 py-1.5 rounded-md flex items-center gap-1 peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 transition-all dark:peer-checked:bg-indigo-900/50 dark:peer-checked:text-indigo-300">
                                Task
                            </span>
                        </label>
                        <label className="cursor-pointer">
                            <input type="radio" name="type" value="NOTE" className="peer sr-only" onChange={() => setItemType('NOTE')} />
                            <span className="px-3 py-1.5 rounded-md flex items-center gap-1 peer-checked:bg-white peer-checked:text-amber-600 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 transition-all dark:peer-checked:bg-amber-900/50 dark:peer-checked:text-amber-300">
                                Note
                            </span>
                        </label>
                        <label className="cursor-pointer">
                            <input type="radio" name="type" value="GROUP" className="peer sr-only" onChange={() => setItemType('GROUP')} />
                            <span className="px-3 py-1.5 rounded-md flex items-center gap-1 peer-checked:bg-white peer-checked:text-slate-800 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 transition-all dark:peer-checked:bg-slate-700 dark:peer-checked:text-slate-200">
                                Group
                            </span>
                        </label>
                    </div>

                    {/* Right: Inputs & Actions */}
                    <div className="flex-1 w-full space-y-3">
                        {/* Title & Desc */}
                        <div className="space-y-2">
                            <input
                                name="title"
                                required
                                placeholder={itemType === 'TASK' ? dict.titlePlaceholder : "Note Title (e.g. Phase 1)"}
                                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 shadow-sm"
                            />

                            <textarea
                                name="description"
                                placeholder={itemType === 'TASK' ? "Description & details (Optional)" : "Note details..."}
                                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 resize-y min-h-[40px] shadow-sm"
                                rows={1}
                            />
                        </div>

                        {/* Footer Bar: Controls & Add Button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-3">
                                {/* Assignee Select */}
                                <select
                                    name="defaultAssigneeId"
                                    className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500 hover:border-slate-300 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                >
                                    <option value="">{dict.noAssignee}</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name || 'User'}</option>
                                    ))}
                                </select>

                                {/* Divider */}
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>

                                {/* Require File Checkbox */}
                                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-200">
                                    <input type="checkbox" name="requireAttachment" value="true" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700" />
                                    <span>Require File</span>
                                </label>
                            </div>

                            {/* Add Button */}
                            <button
                                type="submit"
                                className="px-6 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:shadow-none ml-auto"
                            >
                                {dict.add}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Items List */}
            < DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {items.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                                <p className="text-slate-400 text-sm">{dict.noSteps}</p>
                            </div>
                        )}

                        {items.filter(i => !i.parentId).map((item, index) => (
                            <ProtocolItemRow
                                key={item.id}
                                item={item}
                                index={index}
                                allItems={items} // Pass ALL items for dependency checks, even subtasks? Yes.
                                users={users}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext >
        </div >
    );
}
