'use client';

import { assignUserToItem } from '@/actions/user';
import { useRouter } from 'next/navigation';

export function AssigneeSelector({
    itemId,
    currentUserId,
    users,
    isEditMode = false
}: {
    itemId: string,
    currentUserId: string | null,
    users: { id: string, name: string | null }[],
    isEditMode?: boolean
}) {
    const router = useRouter();
    const currentUser = users.find(u => u.id === currentUserId);

    if (!isEditMode) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100/50 w-full md:w-auto opacity-80 dark:bg-slate-800 dark:border-slate-700" title="Enable Edit Mode to change">
                <span className="text-xs grayscale opacity-50 dark:opacity-70">
                    {currentUser ? '👤' : '⚪'}
                </span>
                <div className="flex-1 text-xs font-medium text-slate-500 min-w-[80px] dark:text-slate-400">
                    {currentUser ? currentUser.name : 'Unassigned'}
                </div>
            </div>
        );
    }

    return (
        <div className="relative group/select">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-colors cursor-pointer w-full md:w-auto shadow-sm shadow-indigo-100/50 animate-in fade-in duration-300 dark:bg-indigo-900/20 dark:border-indigo-800 dark:hover:bg-indigo-900/30">
                <span className="text-xs">
                    {currentUser ? '👤' : '⚪'}
                </span>
                <select
                    value={currentUserId || ''}
                    onChange={async (e) => {
                        await assignUserToItem(itemId, e.target.value);
                        router.refresh();
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-slate-900 dark:bg-slate-900 dark:text-white"
                    title="Change Assignee"
                >
                    <option value="" className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">Unassigned</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">{u.name || 'Unnamed'}</option>
                    ))}
                </select>
                <div className="flex-1 text-xs font-bold text-indigo-700 min-w-[80px] dark:text-indigo-400">
                    {currentUser ? currentUser.name : 'Unassigned'}
                </div>
                <span className="text-[10px] text-indigo-300 dark:text-indigo-500">▼</span>
            </div>
        </div>
    );
}
