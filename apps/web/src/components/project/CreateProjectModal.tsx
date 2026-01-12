'use client';

import { createProjectFromProtocol } from '@/actions/project';
import { type Protocol } from '@repo/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type Dictionary } from '@/i18n/dictionaries';
import { type FormField } from '@/actions/form-template';

export function CreateProjectModal({ protocols, dict, fields }: { protocols: Protocol[], dict: Dictionary['project'], fields: FormField[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
                <span>＋</span> {dict.newProject}
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto scrollbar-hover">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dict.createTitle}</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        ✕
                    </button>
                </div>

                <form action={async (formData) => {
                    const title = formData.get('title') as string;
                    const protocolId = formData.get('protocolId') as string;

                    // Collect Dynamic Metadata
                    const metadata: Record<string, unknown> = {};
                    fields.forEach(field => {
                        const value = formData.get(field.key);
                        if (value) metadata[field.key] = value;
                    });

                    await createProjectFromProtocol(protocolId, title, metadata);
                    setIsOpen(false);
                    router.refresh();
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Project Name - Full Width */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{dict.nameLabel}</label>
                        <input
                            name="title"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                            placeholder="e.g. My New Book Project"
                        />
                    </div>

                    {/* Dynamic Fields - Grid */}
                    {fields.map(field => (
                        <div key={field.key} className="col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    name={field.key}
                                    required={field.required}
                                    className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 cursor-pointer dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                                >
                                    {field.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    name={field.key}
                                    type={field.type}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                                />
                            )}
                        </div>
                    ))}

                    {/* Protocol Selection - Full Width */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{dict.protocolLabel}</label>
                        <select
                            name="protocolId"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 cursor-pointer dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                        >
                            {protocols.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium transition-all dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            {dict.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                            {dict.create}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
