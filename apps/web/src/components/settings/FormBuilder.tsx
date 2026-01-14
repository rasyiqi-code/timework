'use client';
import { useState } from 'react';
import { type FormField } from '@/actions/form-template';
import { updateFormTemplate } from '@/actions/form-template';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { type Dictionary } from '@/i18n/dictionaries';

interface FormBuilderProps {
    initialFields: FormField[];
    dict: Dictionary['formBuilder'];
}

type EditableField = FormField & { _id: string };

export function FormBuilder({ initialFields, dict }: FormBuilderProps) {
    // Initialize with stable IDs
    const [fields, setFields] = useState<EditableField[]>(() =>
        initialFields.map(f => ({ ...f, _id: Math.random().toString(36).substring(7) }))
    );
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const addField = () => {
        setFields([...fields, {
            key: `field_${Date.now()}`,
            label: 'New Field',
            type: 'text',
            required: false,
            _id: Math.random().toString(36).substring(7)
        }]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const updateField = (index: number, key: keyof FormField, value: unknown) => {
        setFields(prev => {
            const newFields = [...prev];
            newFields[index] = { ...newFields[index], [key]: value };
            return newFields;
        });
    };

    const handleSave = async () => {
        // Validation
        const emptyFields = fields.filter(f => !f.key.trim() || !f.label.trim());
        if (emptyFields.length > 0) {
            toast.error(dict.validation.empty);
            return;
        }

        setIsSaving(true);
        try {
            // Strip _id before saving
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const cleanFields = fields.map(({ _id, ...rest }) => rest);

            await updateFormTemplate(cleanFields);
            toast.success(dict.validation.success);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(dict.validation.error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field._id} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 group">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">{dict.label}</label>
                                    <input
                                        defaultValue={field.label}
                                        onBlur={(e) => updateField(index, 'label', e.target.value)}
                                        placeholder={dict.placeholders.label}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">{dict.key}</label>
                                    <input
                                        defaultValue={field.key}
                                        onBlur={(e) => updateField(index, 'key', e.target.value)}
                                        placeholder={dict.placeholders.key}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 font-mono text-xs bg-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">{dict.type}</label>
                                    <select
                                        defaultValue={field.type}
                                        onChange={(e) => updateField(index, 'type', e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
                                    >
                                        <option value="text">{dict.types.text}</option>
                                        <option value="number">{dict.types.number}</option>
                                        <option value="select">{dict.types.select}</option>
                                        <option value="date">{dict.types.date}</option>
                                        <option value="checkbox-group">{dict.types.checkboxGroup}</option>
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
                                        {dict.required}
                                    </label>
                                </div>

                                {(field.type === 'select' || field.type === 'checkbox-group') && (
                                    <div className="col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">{dict.options}</label>
                                        <input
                                            defaultValue={field.options?.join(', ') || ''}
                                            onBlur={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                            placeholder={dict.placeholders.options}
                                            className="w-full text-sm rounded-md border-slate-200 py-1.5 px-3 bg-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => removeField(index)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title={dict.remove}
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
                        + {dict.addField}
                    </button>
                </div>
            </div>

            <div className="flex justify-end sticky bottom-6 z-20">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? dict.saving : dict.save}
                </button>
            </div>
        </div>
    );
}
