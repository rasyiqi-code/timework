import { getProjectsMatrix } from '@/actions/project';
import { getProtocols } from '@/actions/protocol';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { ProjectTable } from '@/components/project/ProjectTable';
import { getDictionary } from '@/i18n/server';

import { getFormTemplate } from '@/actions/form-template';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const { projects, headers, nextCursor } = await getProjectsMatrix();
    const protocols = await getProtocols();
    const formFields = await getFormTemplate();
    const dict = await getDictionary();

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{dict.project.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{dict.project.subtitle}</p>
                </div>
                <CreateProjectModal protocols={protocols} dict={dict} fields={formFields} />
            </div>

            <ProjectTable projects={projects} headers={headers} dict={dict} nextCursor={nextCursor} />
        </div>
    );
}
