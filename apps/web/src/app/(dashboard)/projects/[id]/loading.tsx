import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
    return (
        <div className="w-full px-4 py-8 min-h-screen mb-20">
            <div className="container mx-auto flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar Skeleton (Matches ProjectSidebar.tsx) */}
                <aside className="w-full md:w-64 shrink-0 space-y-4 md:sticky md:top-20">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-5 w-14 rounded" />
                            </div>
                            <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
                            <Skeleton className="h-3 w-full mb-1" /> {/* Desc */}
                            <Skeleton className="h-3 w-2/3" />
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="space-y-1">
                                <Skeleton className="h-2 w-12" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-8 w-full rounded-lg" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <Skeleton className="h-3 w-24 mb-3" />
                        <div className="flex gap-1.5">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                        </div>
                    </div>
                </aside>

                {/* Main Board Skeleton (Matches Timeline View in ProjectBoard.tsx) */}
                <main className="flex-1 w-full min-w-0">
                    <div className="relative w-full pb-20 pt-4">
                        {/* Vertical Line */}
                        <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10 hidden md:block"></div>

                        {/* Timeline Items */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="mb-4 pl-0 md:pl-24 relative">
                                {/* Connector Dot (Mobile hidden, Desktop visible) */}
                                <div className="absolute left-[35px] top-6 w-2.5 h-2.5 bg-slate-200 rounded-full hidden md:block dark:bg-slate-700 ring-4 ring-white dark:ring-slate-950"></div>

                                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <Skeleton className="h-5 w-16 rounded" /> {/* Status Badge */}
                                        <Skeleton className="h-6 w-24 rounded-lg" /> {/* Action Button */}
                                    </div>
                                    <Skeleton className="h-6 w-1/2 mb-2" /> {/* Item Title */}
                                    <Skeleton className="h-3 w-full mb-1" /> {/* Item Desc */}
                                    <Skeleton className="h-3 w-3/4" />

                                    <div className="mt-4 pt-3 border-t border-slate-50 flex gap-4 dark:border-slate-800">
                                        <Skeleton className="h-4 w-24" /> {/* Assignee */}
                                        <Skeleton className="h-4 w-24" /> {/* Date */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

            </div>
        </div>
    );
}
