'use client';

import { createProtocol } from '@/actions/protocol';
import { type Dictionary } from '@/i18n/dictionaries';

interface ProtocolFormProps {
    dict: Dictionary['protocolLibrary'];
}

export function ProtocolForm({ dict }: ProtocolFormProps) {
    // We can use useActionState for better error handling in future, simple form action for now

    return (
        <form action={createProtocol} className="space-y-3">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-slate-300">{dict.nameLabel}</label>
                <input
                    type="text"
                    name="name"
                    required
                    className="w-full rounded bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm py-1.5 px-3 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={dict.namePlaceholder}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-slate-300">{dict.descLabel}</label>
                <textarea
                    name="description"
                    rows={3}
                    className="w-full rounded bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm py-1.5 px-3 placeholder:text-slate-400 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={dict.descPlaceholder}
                />
            </div>
            <button
                type="submit"
                className="w-full justify-center rounded bg-indigo-600 py-2 px-4 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
            >
                {dict.createButton}
            </button>
        </form>
    );
}
