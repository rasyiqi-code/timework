import { Skeleton } from "@/components/ui/skeleton";

export default function ProtocolsLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Protocol List (2 spans) */}
                <div className="lg:col-span-2 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <Skeleton className="h-5 w-40" /> {/* Name */}
                                <Skeleton className="h-5 w-16 rounded" /> {/* Step Count */}
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-4" />

                            <div className="border-t border-slate-50 pt-2 flex justify-between dark:border-slate-800">
                                <Skeleton className="h-3 w-24" /> {/* Date */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Sticky Create Form (1 span) */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl sticky top-20 dark:bg-slate-900 dark:border-slate-800">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full rounded" /> {/* Name Input */}
                        <Skeleton className="h-20 w-full rounded" /> {/* Desc Input */}
                        <Skeleton className="h-10 w-full rounded-lg" /> {/* Submit Btn */}
                    </div>
                </div>
            </div>
        </div>
    );
}
