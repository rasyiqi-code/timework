'use client';

import { createProjectFromProtocol } from '@/actions/project';
import { type Protocol } from '@repo/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type Dictionary } from '@/i18n/dictionaries';
import { type FormField } from '@/actions/form-template';

export function CreateProjectModal({ protocols, dict, fields }: { protocols: Protocol[], dict: Dictionary, fields: FormField[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Init state for Dynamic Logic
    const [formValues, setFormValues] = useState<Record<string, string | string[]>>({});

    const handleChange = (key: string, value: string | string[]) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
                <span>＋</span> {dict.project.newProject}
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto scrollbar-hover">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dict.project.createTitle}</h3>
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
                        if (field.type === 'checkbox-group') {
                            const values = formData.getAll(field.key);
                            if (values.length > 0) metadata[field.key] = values;
                        } else {
                            const value = formData.get(field.key);
                            if (value) metadata[field.key] = value;
                        }
                    });

                    await createProjectFromProtocol(protocolId, title, metadata);
                    setIsOpen(false);
                    router.refresh();
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Project Name - Full Width */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{dict.project.nameLabel}</label>
                        <input
                            name="title"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                            placeholder="e.g. My New Book Project"
                        />
                    </div>

                    {/* Dynamic Fields - Grid */}
                    {fields.map(field => {
                        // Check Visibility
                        if (field.visibility) {
                            const currentVal = formValues[field.visibility.fieldKey];
                            const { operator, value } = field.visibility;

                            let isVisible = false;
                            if (operator === 'eq') isVisible = currentVal === value;
                            else if (operator === 'neq') isVisible = currentVal !== value;
                            else if (operator === 'in' && Array.isArray(value)) isVisible = value.includes(currentVal as string);

                            if (!isVisible) return null;
                        }

                        return (
                            <div key={field.key} className="col-span-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{field.label}</label>

                                {field.type === 'select' ? (
                                    <select
                                        name={field.key}
                                        required={field.required}
                                        value={formValues[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 cursor-pointer dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                                    >
                                        <option value="" disabled>{dict.common.select} {field.label}</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'checkbox-group' ? (
                                    <div className="space-y-2 p-3 border border-slate-200 rounded-lg dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        {field.options?.map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name={field.key}
                                                    value={opt}
                                                    checked={((formValues[field.key] as string[]) || []).includes(opt)}
                                                    onChange={(e) => {
                                                        const current = (formValues[field.key] as string[]) || [];
                                                        const newVal = e.target.checked
                                                            ? [...current, opt]
                                                            : current.filter(v => v !== opt);
                                                        handleChange(field.key, newVal);
                                                    }}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        name={field.key}
                                        type={field.type}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        value={formValues[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all py-2 px-3 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Protocol Selection */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{dict.project.protocolLabel}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {protocols.map(protocol => (
                                <label key={protocol.id} className="cursor-pointer group relative">
                                    <input type="radio" name="protocolId" value={protocol.id} required className="peer sr-only" />
                                    <div className="p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-900 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-indigo-500 dark:peer-checked:bg-indigo-900/20 dark:peer-checked:text-indigo-100">
                                        <div className="text-sm font-bold mb-0.5">{protocol.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{protocol.description}</div>
                                        <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-indigo-600 dark:text-indigo-400">
                                            ✔
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            {dict.project.cancel}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            {dict.project.create}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


