import { getMyTasks } from '@/actions/user';
import { getCurrentUser } from '@/actions/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export default async function MyTasksPage() {
    const user = await getCurrentUser();
    const dict = await getDictionary();

    if (!user) {
        redirect('/');
    }

    const tasks = await getMyTasks(user.id);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{dict.myTasks.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {dict.myTasks.subtitle.replace('{name}', user.name || 'User').replace('{count}', tasks.length.toString())}
                    </p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tasks.length === 0 ? (
                    <div className="col-span-full py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                        <div className="text-2xl mb-2">🎉</div>
                        <p className="text-sm font-bold text-slate-700">{dict.myTasks.allCaughtUp}</p>
                        <p className="text-xs text-slate-500">{dict.myTasks.noActiveTasks}</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="group bg-white border border-slate-200 p-4 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between h-full dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[70%] dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                                        {task.project.title}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'OPEN' ? 'bg-indigo-500' :
                                        task.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                            task.status === 'DONE' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}></div>
                                </div>

                                <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-tight min-h-[2.5rem] dark:text-slate-100">
                                    {task.title}
                                </h3>

                                {task.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-1.5 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-2 dark:border-slate-800">
                                <span className={`text-[10px] font-bold uppercase ${task.status === 'OPEN' ? 'text-indigo-600 dark:text-indigo-400' :
                                    task.status === 'IN_PROGRESS' ? 'text-amber-600 dark:text-amber-400' :
                                        task.status === 'DONE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                    {dict.project.status[task.status as keyof typeof dict.project.status] || task.status.replace('_', ' ')}
                                </span>

                                <Link
                                    href={`/projects/${task.projectId}`}
                                    className="text-white bg-slate-900 hover:bg-black text-[10px] font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                >
                                    {dict.myTasks.openProject}
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
