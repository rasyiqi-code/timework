import { getProtocolById } from '@/actions/protocol';
import { getDictionary } from '@/i18n/server';
import { getUsers } from '@/actions/user';
import { ItemBuilder } from '@/components/protocol/ItemBuilder';
import { ProtocolHeader } from '@/components/protocol/ProtocolHeader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { checkRole } from '@/lib/check-role';

export const dynamic = 'force-dynamic';

export default async function ProtocolDetailPage({ params }: { params: { id: string } }) {
    await checkRole('ADMIN');
    // Await params first (Next.js 15 requirement for dynamic routes)
    const { id } = await params;

    const protocol = await getProtocolById(id);
    const users = await getUsers();
    const dict = await getDictionary();

    if (!protocol) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4 space-y-8">
            {/* Breadcrumb / Back */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
                <div className="flex-1 w-full">
                    {/* Breadcrumb / Back */}
                    <Link
                        href="/admin/protocols"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors font-medium text-xs mb-2 dark:hover:text-slate-200"
                    >
                        <span>←</span> Back to Library
                    </Link>

                    <ProtocolHeader protocol={protocol} />
                </div>

                <div className="text-right text-xs text-slate-400 font-mono dark:text-slate-500">
                    Last updated {new Date(protocol.updatedAt).toLocaleDateString()}
                </div>
            </div>

            {/* Builder Section */}
            <div className="space-y-4">
                <ItemBuilder protocolId={protocol.id} items={protocol.items} users={users} dict={dict.protocol} />
            </div>
        </div>
    );
}
