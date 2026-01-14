'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Clock, MoreHorizontal, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock Data for the Demo
const DEMO_ITEMS = [
    {
        id: '1',
        title: 'Project Kickoff & Requirements',
        status: 'DONE',
        assignee: 'Alex',
        assigneeColor: 'bg-blue-500',
        date: 'Oct 24, 09:00',
    },
    {
        id: '2',
        title: 'Database Schema Design',
        status: 'DONE',
        assignee: 'Sarah',
        assigneeColor: 'bg-emerald-500',
        date: 'Oct 24, 14:30',
        description: 'Define users, projects, and protocol tables with relations.'
    },
    {
        id: '3',
        title: 'API Implementation',
        status: 'IN_PROGRESS',
        assignee: 'Mike',
        assigneeColor: 'bg-amber-500',
        date: 'Today, 10:00',
        description: 'Implement FAST endpoint for protocol generation.'
    },
    {
        id: '4',
        title: 'Frontend Integration',
        status: 'OPEN',
        assignee: null,
        date: 'Tomorrow',
    },
    {
        id: '5',
        title: 'Final Deployment',
        status: 'LOCKED',
        assignee: null,
        date: 'Pending',
    }
];

export function HeroDashboardDemo() {
    // Auto-animate status for the "In Progress" item to simulate activity
    const [activePulse, setActivePulse] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePulse(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-slate-50/50 p-6 overflow-hidden rounded-xl border border-slate-200 shadow-inner select-none cursor-default">
            {/* Fake Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900">Backend System Overhaul</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> Timeline View</span>
                            <span>•</span>
                            <span>5 Items</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 mr-4">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-xs text-white font-bold">A</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">S</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-xs text-white font-bold">M</div>
                    </div>
                    <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50">
                        <MoreHorizontal size={16} />
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700">
                        New Item
                    </button>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="relative pl-4 md:pl-8 py-2">
                {/* Continuous Vertical Line */}
                <div className="absolute left-[27px] md:left-[43px] top-0 bottom-0 w-0.5 bg-slate-200 -z-10"></div>

                <div className="space-y-6">
                    {DEMO_ITEMS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                            className="relative pl-12 md:pl-16"
                        >
                            {/* Timeline Dot */}
                            <div className={`absolute left-[21px] md:left-[37px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10
                                ${item.status === 'DONE' ? 'bg-emerald-500' :
                                    item.status === 'IN_PROGRESS' ? 'bg-amber-500 ring-4 ring-amber-100' :
                                        item.status === 'LOCKED' ? 'bg-slate-300' : 'bg-blue-500'}
                            `}></div>

                            {/* Card Connector Line */}
                            <div className="absolute left-[28px] md:left-[44px] top-1/2 -translate-y-1/2 w-6 md:w-8 h-px bg-slate-200"></div>

                            {/* Card */}
                            <div className={`
                                group relative p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4
                                ${item.status === 'DONE' ? 'bg-white border-slate-200 shadow-sm' :
                                    item.status === 'IN_PROGRESS' ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-50 transform scale-[1.02]' :
                                        item.status === 'LOCKED' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}
                            `}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`
                                        shrink-0 p-2 rounded-lg
                                        ${item.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' :
                                            item.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                                                item.status === 'LOCKED' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}
                                    `}>
                                        {item.status === 'DONE' ? <CheckCircle2 size={18} /> :
                                            item.status === 'LOCKED' ? <CheckSquare size={18} /> :
                                                <Circle size={18} className={item.status === 'IN_PROGRESS' ? 'animate-pulse' : ''} />}
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${item.status === 'LOCKED' ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                                {item.date}
                                            </span>
                                            {item.description && (
                                                <span className="text-[10px] text-slate-400 truncate max-w-[150px] hidden sm:block">
                                                    - {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {item.assignee && (
                                        <div className={`w-6 h-6 rounded-full ${item.assigneeColor} flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white`}>
                                            {item.assignee.charAt(0)}
                                        </div>
                                    )}
                                    {item.status === 'IN_PROGRESS' && (
                                        <div className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 animate-pulse">
                                            Active
                                        </div>
                                    )}
                                    {item.status === 'OPEN' && (
                                        <button className="p-1.5 rounded bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
