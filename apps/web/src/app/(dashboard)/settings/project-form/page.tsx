import { FormBuilder } from '@/components/settings/FormBuilder';
import { getFormTemplate } from '@/actions/form-template';


export default async function ProjectFormSettingsPage() {
    const fields = await getFormTemplate();

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Form Builder</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Customize the fields required when creating a new project. Changes will apply immediately to the &quot;Create Project&quot; form.
                </p>
            </div>

            <FormBuilder initialFields={fields} />
        </div>
    );
}
