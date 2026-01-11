import { getProjectHistory } from '@/actions/audit';

export async function HistoryFeed({ projectId }: { projectId: string }) {
    const history = await getProjectHistory(projectId);

    return (
        <div className="space-y-4">
            {history.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No history recorded yet.</p>
            ) : (
                history.map((log) => (
                    <div key={log.id} className="flex gap-3 text-sm">
                        <div className="text-gray-400 min-w-[130px] font-mono text-xs pt-0.5 dark:text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700 mr-2 dark:text-gray-300">{log.action.replace('_', ' ')}</span>
                            <span className="text-gray-600 dark:text-gray-400">{log.details}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
