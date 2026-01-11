'use client';

import { createProjectFromProtocol } from '@/actions/project';
import { type Protocol } from '@repo/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type Dictionary } from '@/i18n/dictionaries';

export function CreateProjectModal({ protocols, dict }: { protocols: Protocol[], dict: Dictionary['project'] }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
            >
                <span>＋</span> {dict.newProject}
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md ring-1 ring-white/20">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{dict.createTitle}</h3>
                <form action={async (formData) => {
                    const title = formData.get('title') as string;
                    const protocolId = formData.get('protocolId') as string;
                    await createProjectFromProtocol(protocolId, title);
                    setIsOpen(false);
                    router.refresh();
                }} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">{dict.nameLabel}</label>
                        <input name="title" required className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all py-3 px-4" placeholder="My New Book Project" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">{dict.protocolLabel}</label>
                        <select name="protocolId" required className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all py-3 px-4 cursor-pointer">
                            {protocols.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-all">{dict.cancel}</button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">{dict.create}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
