'use client';

import { useState } from 'react';
import { addProjectItem } from '@/actions/project';

import type { User } from '@repo/database';

interface GapInjectorProps {
    projectId: string;
    nextItemId: string; // The item that will be blocked by this new task
    currentUser: User | null;
}

export function GapInjector({ projectId, nextItemId, currentUser }: GapInjectorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Hide for non-admin
    if (currentUser?.role !== 'ADMIN') return null;

    if (isExpanded) {
        return (
            <div className="md:pl-14 py-2 animate-in zoom-in slide-in-from-top-2 duration-200">
                <form
                    action={async (formData) => {
                        const title = formData.get('title') as string;
                        if (title) {
                            // Automatically set nextItemId as the blocked item
                            await addProjectItem(projectId, title, nextItemId);
                            setIsExpanded(false);
                        }
                    }}
                    className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xl shadow-indigo-500/10 flex gap-2 items-center dark:bg-slate-900 dark:border-indigo-900 dark:shadow-none"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0 dark:bg-indigo-900/50 dark:text-indigo-400">
                        +
                    </div>
                    <input
                        name="title"
                        required
                        autoFocus
                        placeholder="New intermediate task..."
                        className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:text-slate-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                            Inject
                        </button>
                    </div>
                </form>

                {/* Visual Connector to indicate this task pushes the next one down */}
                <div className="flex justify-center mt-2">
                    <div className="text-[10px] text-indigo-400 font-mono bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 italic">
                        ↓ Will block item below
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="h-5 relative z-10 group flex items-center justify-center md:pl-14 cursor-pointer w-full transition-all hover:h-8" // h-16 -> h-5, pl-28 -> pl-14
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsExpanded(true)}
        >
            <div className="relative w-full max-w-2xl flex items-center justify-center">
                {/* The Line (Visible on hover) */}
                <div className={`w-full h-0.5 bg-indigo-500/20 transition-all duration-300 ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'}`}></div>

                {/* The Plus Button */}
                <div className={`
                    absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-5 h-5 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 
                    flex items-center justify-center transition-all duration-300 transform
                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                `}>
                    <span className="text-xs font-bold pb-0.5">+</span>
                </div>
            </div>
        </div>
    );
}
