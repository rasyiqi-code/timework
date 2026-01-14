'use client';

import { useRouter } from 'next/navigation';
import { type Protocol } from '@repo/database';
import { DeleteProtocolButton } from './DeleteProtocolButton';
import { type Dictionary } from '@/i18n/dictionaries';

interface ProtocolListProps {
    protocols: (Protocol & { _count: { items: number } })[];
    dict: Dictionary['protocolLibrary'];
}

export function ProtocolList({ protocols, dict }: ProtocolListProps) {
    const router = useRouter();

    if (protocols.length === 0) {
        return <div className="text-gray-500 text-center py-8">{dict.noProtocols}</div>;
    }

    return (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {protocols.map((protocol) => (
                <div
                    key={protocol.id}
                    onClick={() => router.push(`/admin/protocols/${protocol.id}`)}
                    className="group relative p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-sm transition-all duration-200 cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500"
                >
                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[80%] dark:text-slate-100 dark:group-hover:text-indigo-400">
                                {protocol.name}
                            </h5>
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">
                                {protocol._count.items} {dict.steps}
                            </span>
                        </div>
                        <p className="text-slate-500 mb-4 line-clamp-2 text-xs leading-relaxed h-8 dark:text-slate-400">
                            {protocol.description || dict.noDesc}
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-800">
                            <div className="flex items-center text-[10px] text-slate-400 font-mono dark:text-slate-500">
                                <span>{dict.updated} {new Date(protocol.updatedAt).toLocaleDateString()}</span>
                            </div>

                            {/* Delete Button - Stop Propagation to prevent navigation */}
                            <div
                                className="scale-90 origin-right opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DeleteProtocolButton id={protocol.id} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
