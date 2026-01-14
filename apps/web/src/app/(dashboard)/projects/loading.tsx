import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
    return (
        <div className="container mx-auto py-12 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40 rounded-lg" /> {/* Create Button */}
            </div>

            {/* Table Skeleton */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Table Header */}
                <div className="flex items-center border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    <Skeleton className="h-4 w-32 mr-auto" /> {/* Title Column */}
                    <div className="hidden md:flex gap-8 px-8">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12 ml-4" /> {/* Actions */}
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30">
                        <div className="flex-1 min-w-0 pr-4">
                            <Skeleton className="h-5 w-48 mb-1.5" /> {/* Project Title */}
                            <Skeleton className="h-4 w-16 rounded" /> {/* Status Badge */}
                        </div>

                        {/* Simulated Dynamic Columns (Hidden on mobile usually or scrollable) */}
                        <div className="hidden md:flex gap-8 px-8 opacity-50">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>

                        <Skeleton className="h-8 w-8 rounded ml-4" /> {/* Delete Action */}
                    </div>
                ))}
            </div>
        </div>
    );
}
