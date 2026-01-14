import { getProtocols } from '@/actions/protocol';
import { ProtocolForm } from '@/components/protocol/ProtocolForm';
import { ProtocolList } from '@/components/protocol/ProtocolList';
import { checkRole } from '@/lib/check-role';
import { getDictionary } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export default async function ProtocolsPage() {
    await checkRole('ADMIN');
    const protocols = await getProtocols();
    const dict = await getDictionary();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1 dark:text-slate-100">{dict.protocolLibrary.title}</h1>
                    <p className="text-slate-500 text-sm dark:text-slate-400">{dict.protocolLibrary.subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <ProtocolList protocols={protocols} dict={dict.protocolLibrary} />
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl sticky top-20 dark:bg-slate-900 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 dark:text-slate-200">
                        {dict.protocolLibrary.createTitle}
                    </h2>
                    <ProtocolForm dict={dict.protocolLibrary} />
                </div>
            </div>
        </div>
    );
}
