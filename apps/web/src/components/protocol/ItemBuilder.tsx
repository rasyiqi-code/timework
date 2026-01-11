'use client';

import { addProtocolItem } from '@/actions/protocol';
import { type ProtocolItem, type ProtocolDependency } from '@repo/database';
import { ProtocolItemRow } from './ProtocolItemRow';

type ItemWithRelations = ProtocolItem & {
    dependsOn: ProtocolDependency[];
    requiredBy: ProtocolDependency[];
    defaultAssignee: { id: string, name: string | null } | null;
};

import { type Dictionary } from '@/i18n/dictionaries';

interface ItemBuilderProps {
    protocolId: string;
    items: ItemWithRelations[];
    users: { id: string, name: string | null }[];
    dict: Dictionary['protocol'];
}

export function ItemBuilder({ protocolId, items, users, dict }: ItemBuilderProps) {
    return (
        <div className="space-y-8">
            {/* Add Item Form - Converted to compact row */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all dark:bg-slate-900 dark:border-slate-800 dark:focus-within:ring-indigo-500/10 dark:focus-within:border-indigo-600">
                <form action={(formData) => addProtocolItem(protocolId, formData)} className="flex flex-col md:flex-row gap-2 items-center">
                    <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0 dark:bg-indigo-900/30 dark:text-indigo-400">
                        ＋
                    </div>

                    <div className="flex-1 w-full">
                        <input
                            name="title"
                            required
                            placeholder={dict.titlePlaceholder}
                            className="w-full px-3 py-1.5 rounded bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="w-20 shrink-0">
                        <input
                            name="duration"
                            type="number"
                            defaultValue={1}
                            min={1}
                            placeholder={dict.daysPlaceholder}
                            className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-sm font-bold text-center text-slate-700 focus:outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                            title="Format: Days"
                        />
                    </div>

                    <div className="w-32 shrink-0 flex flex-col gap-1">
                        <select
                            name="defaultAssigneeId"
                            className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        >
                            <option value="">{dict.noAssignee}</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name || 'User'}</option>
                            ))}
                        </select>
                        <p className="text-[9px] text-slate-400 leading-tight">
                            {dict.loginTip}
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-1.5 rounded bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors shrink-0 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                        {dict.add}
                    </button>
                </form>
            </div>

            {/* Items List */}
            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-slate-400 text-sm">{dict.noSteps}</p>
                    </div>
                )}

                {items.map((item, index) => (
                    <ProtocolItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        allItems={items}
                        users={users}
                    />
                ))}
            </div>
        </div>
    );
}
