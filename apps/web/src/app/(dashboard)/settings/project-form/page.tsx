import { FormBuilder } from '@/components/settings/FormBuilder';
import { getFormTemplate } from '@/actions/form-template';


import { getDictionary } from '@/i18n/server';

export default async function ProjectFormSettingsPage() {
    const fields = await getFormTemplate();
    const dict = await getDictionary();

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{dict.formBuilder.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {dict.formBuilder.subtitle}
                </p>
            </div>

            <FormBuilder initialFields={fields} dict={dict.formBuilder} />
        </div>
    );
}
