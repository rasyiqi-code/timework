import { getProjectById } from '@/actions/project';
import { ProjectBoard } from '@/components/project/ProjectBoard';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';
import { getUsers } from '@/actions/user';
import { getCurrentUser } from '@/actions/auth';
import { HistoryFeed } from '@/components/project/HistoryFeed';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/server';

// Ensure this page is always dynamic to show latest statuses
export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const project = await getProjectById(id);
    const users = await getUsers();
    const currentUser = await getCurrentUser();
    const dict = await getDictionary();

    if (!project) notFound();

    return (
        <div className="w-full px-4 py-8 min-h-screen mb-20">
            <div className="container mx-auto flex flex-col md:flex-row gap-8 items-start">
                <ProjectSidebar project={project} users={users} currentUser={currentUser} dict={dict} />

                <main className="flex-1 w-full min-w-0">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <ProjectBoard project={project} users={users} currentUser={currentUser} dict={dict} />
                    </div>

                    <div className="mt-12 opacity-90 transition-opacity max-w-2xl mx-auto md:pl-14">
                        <div className="flex items-center gap-3 mb-4 ml-0">
                            <div className="h-px bg-slate-200 flex-1 dark:bg-slate-800"></div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">{dict.project.detail.activityLog}</h3>
                            <div className="h-px bg-slate-200 flex-1 dark:bg-slate-800"></div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
                            <HistoryFeed projectId={id} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
