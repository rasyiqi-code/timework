'use client';

import { useState } from 'react';
import { type FormField } from '@/actions/form-template';
import { updateFormTemplate } from '@/actions/form-template';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FormBuilderProps {
    initialFields: FormField[];
}

export function FormBuilder({ initialFields }: FormBuilderProps) {
    const [fields, setFields] = useState<FormField[]>(initialFields);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const addField = () => {
        setFields([...fields, { key: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false }]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const updateField = (index: number, key: keyof FormField, value: unknown) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateFormTemplate(fields);
            toast.success('Form template saved successfully');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save form template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 group">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Label</label>
                                    <input
                                        value={field.label}
                                        onChange={(e) => updateField(index, 'label', e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Key (ID)</label>
                                    <input
                                        value={field.key}
                                        onChange={(e) => updateField(index, 'key', e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 font-mono text-xs bg-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Type</label>
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateField(index, 'type', e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
                                    >
                                        <option value="text">Text Input</option>
                                        <option value="number">Number Input</option>
                                        <option value="select">Dropdown (Select)</option>
                                        <option value="date">Date Picker</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Required Field
                                    </label>
                                </div>

                                {field.type === 'select' && (
                                    <div className="col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Options (comma separated)</label>
                                        <input
                                            value={field.options?.join(', ') || ''}
                                            onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                            placeholder="Option A, Option B, Option C"
                                            className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => removeField(index)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={addField}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        + Add Field
                    </button>
                </div>
            </div>

            <div className="flex justify-end sticky bottom-6 z-20">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Form Template'}
                </button>
            </div>
        </div>
    );
}
