import { getProjects } from '@/actions/project';
import { getProtocols } from '@/actions/protocol';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import Link from 'next/link';

import { getDictionary } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const projects = await getProjects();
    const protocols = await getProtocols();
    const dict = await getDictionary();

    return (

        <div className="container mx-auto py-12 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{dict.project.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{dict.project.subtitle}</p>
                </div>
                <CreateProjectModal protocols={protocols} dict={dict.project} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group bg-white border border-slate-200 p-5 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500 block"
                    >
                        <div className="flex justify-between items-start mb-3 relative gap-2">
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                    project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}>
                                    {dict.project.status[project.status as keyof typeof dict.project.status] || project.status}
                                </span>
                                {project.category && (
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border flex items-center gap-1 ${project.category === 'SPT'
                                        ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                                        }`}>
                                        {project.category === 'SPT' ? 'SPT' : 'UMUM'}
                                    </span>
                                )}
                            </div>

                            <div className="text-slate-300 group-hover:text-indigo-600 transition-colors text-xs dark:text-slate-600 dark:group-hover:text-indigo-400">
                                ↗
                            </div>
                        </div>

                        <h2 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 dark:text-slate-100 dark:group-hover:text-indigo-400">{project.title}</h2>
                        <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed h-8 dark:text-slate-400">{project.description || dict.project.detail.noDescription}</p>

                        <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-auto dark:border-slate-800">
                            <div>
                                <div className="text-lg font-bold text-slate-700 leading-none dark:text-slate-300">{project._count.items}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">{dict.project.tasks}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-medium text-slate-400 mb-0.5 dark:text-slate-500">{dict.project.updated}</div>
                                <div className="text-[10px] font-bold text-slate-600 font-mono dark:text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full text-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm border border-slate-100">
                            🚀
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{dict.project.noProjects}</h3>
                        <p className="text-slate-500 text-xs max-w-xs mx-auto">
                            {dict.project.noProjectsDesc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
