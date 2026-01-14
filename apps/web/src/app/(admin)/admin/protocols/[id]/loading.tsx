import { Skeleton } from "@/components/ui/skeleton";

export default function ProtocolDetailLoading() {
    return (
        <div className="container mx-auto py-12 px-4 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
                <div className="flex-1 w-full space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" /> {/* Back Link */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" /> {/* Icon */}
                        <div className="space-y-1">
                            <Skeleton className="h-6 w-48" /> {/* Title */}
                            <Skeleton className="h-4 w-96" /> {/* Desc */}
                        </div>
                    </div>
                </div>
                <Skeleton className="h-4 w-32" /> {/* Last Updated */}
            </div>

            {/* ItemBuilder Section */}
            <div className="space-y-8">
                {/* Form Row Skeleton */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-2 items-start">
                        <Skeleton className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-800" /> {/* Type Toggle */}
                        <div className="flex-1 w-full space-y-2">
                            <Skeleton className="h-9 w-full rounded" /> {/* Title Input */}
                            <Skeleton className="h-9 w-full rounded" /> {/* Desc Input */}
                        </div>
                        <div className="w-32 shrink-0 flex flex-col gap-2">
                            <Skeleton className="h-9 w-full rounded" /> {/* Assignee */}
                            <Skeleton className="h-9 w-full rounded bg-slate-900 dark:bg-indigo-600" /> {/* Add Btn */}
                        </div>
                    </div>
                </div>

                {/* Items List Skeleton */}
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <Skeleton className="h-6 w-4 cursor-move" /> {/* Drag Handle */}
                            <div className="flex-1">
                                <Skeleton className="h-5 w-48 mb-1" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" /> {/* Type Badge */}
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
