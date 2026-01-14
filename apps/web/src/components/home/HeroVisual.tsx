'use client';

import { motion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroVisual() {
    const [step, setStep] = useState(0);

    // Animation Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-sm mx-auto p-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Gloss Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
                    <span>Workflow Preview</span>
                    <span className="flex items-center gap-1.5 text-primary">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Live
                    </span>
                </div>

                {/* Task 1: Design Phase */}
                <TaskCard
                    title="1. Design System"
                    status={step >= 1 ? 'completed' : 'active'}
                    delay={0}
                />

                {/* Connecting Line */}
                <div className="relative h-6 w-0.5 bg-border mx-6">
                    <motion.div
                        className="absolute top-0 left-0 w-full bg-primary"
                        initial={{ height: 0 }}
                        animate={{ height: step >= 1 ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Task 2: Implementation */}
                <TaskCard
                    title="2. Component Library"
                    status={step >= 2 ? 'active' : step >= 1 ? 'open' : 'locked'}
                    delay={1}
                />

                {/* Connecting Line 2 */}
                <div className="relative h-6 w-0.5 bg-border mx-6">
                    <motion.div
                        className="absolute top-0 left-0 w-full bg-primary"
                        initial={{ height: 0 }}
                        animate={{ height: step >= 2 ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Task 3: Review */}
                <TaskCard
                    title="3. User Review"
                    status={step >= 3 ? 'active' : step >= 2 ? 'open' : 'locked'}
                    delay={2}
                />
            </div>
        </div>
    );
}

function TaskCard({ title, status, delay }: { title: string, status: 'locked' | 'open' | 'active' | 'completed', delay: number }) {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <motion.div
            className={`
                relative flex items-center gap-4 p-3 rounded-lg border transition-all duration-500
                ${isLocked ? 'bg-secondary/20 border-white/5 text-muted-foreground' :
                    isCompleted ? 'bg-primary/10 border-primary/20 text-primary-foreground' :
                        isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' :
                            'bg-card border-border text-foreground'}
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.2 }}
        >
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold transition-all duration-500
                ${isLocked ? 'border-white/10 bg-white/5 text-muted-foreground' :
                    isCompleted ? 'border-primary bg-primary text-white' :
                        isActive ? 'border-white bg-white/20 text-white' :
                            'border-primary/50 text-primary'}
            `}>
                {isLocked ? <Lock size={12} /> : isCompleted ? <Check size={14} /> : isActive ? <Play size={12} fill="currentColor" /> : <div className="w-2 h-2 rounded-full bg-current" />}
            </div>

            <span className="flex-1 font-medium">{title}</span>

            {status === 'active' && (
                <div className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded text-white animate-pulse">
                    IN PROGRESS
                </div>
            )}
        </motion.div>
    )
}
