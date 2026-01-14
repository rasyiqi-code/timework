'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowRight, Layout, Lock, Zap, CheckCircle2, Menu, X, ChevronDown, Github, Twitter } from 'lucide-react';
import Link from "next/link";
import React, { useState } from 'react';
import { Dictionary } from '@/i18n/dictionaries';
import { HeroDashboardDemo } from './HeroDashboardDemo';

interface LandingContentProps {
    dict: Dictionary;
    currentUser?: any; // Using any for simplicity as strict type isn't critical for just checking existence
}

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 20
        }
    }
};

export function LandingContent({ dict, currentUser }: LandingContentProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

            {/* Background Gradients */}
            {/* Background - Clean Enterprise Style */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-70"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md support-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <span className="text-slate-900">{dict.nav.brand}</span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">{dict.nav.features}</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">{dict.nav.howItWorks}</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-foreground transition-colors">{dict.nav.faq}</button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {!currentUser ? (
                            <Link href="/api/auth/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {dict.nav.signIn}
                            </Link>
                        ) : null}
                        <Link href="/projects" className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10">
                            {currentUser ? "Go to Dashboard" : dict.nav.getStarted}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-muted-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-b border-slate-200 bg-white"
                        >
                            <div className="flex flex-col p-4 gap-4 text-sm font-medium">
                                <button onClick={() => scrollToSection('features')}>{dict.nav.features}</button>
                                <button onClick={() => scrollToSection('how-it-works')}>{dict.nav.howItWorks}</button>
                                <button onClick={() => scrollToSection('faq')}>{dict.nav.faq}</button>
                                <div className="h-px bg-border/50 my-2" />
                                {!currentUser && (
                                    <Link href="/api/auth/signin">{dict.nav.signIn}</Link>
                                )}
                                <Link href="/projects" className="text-primary font-bold">
                                    {currentUser ? "Dashboard" : dict.nav.getStarted}
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-12 lg:pt-28 lg:pb-16 container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            {dict.home.badge}
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                            {dict.home.title} <br />
                            <span className="text-blue-600">
                                {dict.home.titleHighlight}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium mb-8">
                            {dict.home.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href="/projects"
                                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10 hover:-translate-y-0.5"
                            >
                                {dict.home.openProjects}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/admin/protocols"
                                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all hover:-translate-y-0.5"
                            >
                                {dict.home.viewProtocols}
                            </Link>
                        </div>


                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 w-full mx-auto">
                            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden md:aspect-[16/10] aspect-[4/3] border border-slate-200">
                                <HeroDashboardDemo />
                            </div>

                            {/* Decorative element behind */}
                            <div className="absolute -z-10 top-4 right-[-20px] w-full h-full bg-slate-200/50 rounded-xl" />
                        </div>
                    </motion.div>
                </div>
            </section>


            <section className="py-12 border-b border-slate-100 bg-white">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by innovative teams</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* Pro Logos */}
                        <svg className="h-8 w-auto text-slate-900" viewBox="0 0 100 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Acme">
                            <path d="M10.9,13.7L5.5,5.2L0,13.7H10.9z M19.4,5.2h-3.3l-2.2,3.5l-2.2-3.5H8.4l3.9,6.1l-4,6.4h3.3l2.3-3.7l2.3,3.7h3.3L15.6,11.3L19.4,5.2z M25,5.2h-3.3v10.3H25V13h4.6v2.5H33V5.2h-3.3v5.8h-4.6V5.2z M41.8,5.2h-8.3v10.3h8.3v-2.5h-5v-1.4h4.4V9.1h-4.4V7.8h5V5.2z" />
                        </svg>
                        <svg className="h-8 w-auto text-slate-900" viewBox="0 0 100 30" fill="currentColor" aria-label="Tuple">
                            <path d="M13.5,15.5h-4.4V5.2H5.8v10.3H1.4V2.7h12.1V15.5z M23.9,2.7v7.8c0,1.6-0.8,2.7-2.3,2.7s-2.3-1.1-2.3-2.7V2.7H15v7.8c0,3,2,5.2,6.6,5.2c4.6,0,6.6-2.2,6.6-5.2V2.7H23.9z M39.3,8L39.3,8c0-2.4-1.6-3-3.5-3c-1.8,0-3.3,0.9-3.3,3h-4.3c0.1-4.2,3.3-5.5,7.6-5.5c4.7,0,7.8,2.1,7.8,6.1v6.9h-4.3v-1.3c-1,1-2.5,1.5-4.2,1.5c-3.5,0-5.8-2-5.8-4.9c0-3.1,2.5-4.8,6.3-4.8h3.7V8z M39.3,10.6h-3.1c-1.9,0-2.8,0.7-2.8,2c0,1.3,0.9,2.1,2.8,2.1c1.9,0,3.1-0.9,3.1-2.3V10.6z" />
                        </svg>
                        <svg className="h-8 w-auto text-slate-900" viewBox="0 0 100 30" fill="currentColor" aria-label="Mirage">
                            <path d="M6.3,15.5V5.9L2.8,11L0,6.5l5.5-3.8h3.3v12.8H6.3z M18.4,15.5V5.5h-3.3V13h-0.1L9.6,5.5H6.2v10h3.3V7.8h0.1l5.4,7.8H18.4z M22.7,4.5c1.1,0,2.1-0.9,2.1-2.1c0-1.1-0.9-2.1-2.1-2.1c-1.1,0-2.1,0.9-2.1,2.1C20.6,3.6,21.6,4.5,22.7,4.5z M24.4,15.5h-3.3V5.5h3.3V15.5z M30.8,7.9c-0.1-1.3,0.6-2.6,2.3-2.6c1.2,0,2,0.6,2.2,1.8h3.3C38.3,4.4,36,2.7,33.1,2.7s-5.6,2-5.6,6c0,4,2.3,6.8,6,6.8c1.9,0,3.7-0.8,4.5-3.4h-3.4c-0.3,0.7-0.9,1.1-1.6,1.1c-1.6,0-2.3-1.6-2.2-3.1V7.9z" />
                        </svg>
                        <svg className="h-8 w-auto text-slate-900" viewBox="0 0 100 30" fill="currentColor" aria-label="StaticKit">
                            <path d="M6,13.2C4.1,13.7,3.6,14.1,3.6,15c0,0.9,0.8,1.4,2.2,1.4c1.5,0,2.5-0.6,2.6-1.9h3.6c-0.3,3-3.2,4.6-6.2,4.6c-3.6,0-5.8-1.9-5.8-4.9c0-3.3,2.4-4.5,5.5-5.2l2.3-0.5C9.4,8,9.7,7.6,9.7,7c0-1-1-1.6-2.5-1.6c-1.5,0-2.6,0.7-2.7,2H0.9c0.2-2.9,3-4.6,6.3-4.6c3.2,0,5.8,1.8,5.8,4.7c0,3-2.1,4.4-4.9,5L6,13.2z M21.9,5.4v2.5h-2.9v5.9c0,1,0.4,1.4,1.4,1.4h1.5v2.7h-2.4c-2.4,0-3.8-1-3.8-4V7.9h-1.8V5.4h1.8V3h3.3v2.4H21.9z M31.6,15.5h-3.1l-0.5-1.5c-0.8,1-2,1.7-3.6,1.7c-2.6,0-4.3-1.8-4.3-4.4c0-2.9,2.2-5,5.2-5c1.4,0,2.6,0.6,3.3,1.6V2.7h3.1V15.5z M28.5,10.6c0-1.5-1-2.6-2.3-2.6c-1.4,0-2.4,1.1-2.4,2.6c0,1.5,1,2.6,2.4,2.6C27.5,13.2,28.5,12.1,28.5,10.6z" />
                        </svg>
                        <svg className="h-8 w-auto text-slate-900" viewBox="0 0 100 30" fill="currentColor" aria-label="Transistor">
                            <path d="M6,5.2v10.3H2.7V5.2H6z M4.3,4.5C3.1,4.5,2.1,3.6,2.1,2.4S3.1,0.3,4.3,0.3s2.3,0.9,2.3,2.1S5.6,4.5,4.3,4.5z M18.4,5.2v2.1c-0.7-0.3-1.4-0.4-2.1-0.4c-1.5,0-2.6,0.9-2.8,2.5V15.5H10.1V5.2h3.3l0,1.8c0.8-1.5,2.1-1.9,3.8-1.9C17.6,5,18,5,18.4,5.2z M28.5,15.5h-3.1l-0.5-1.5c-0.8,1-2,1.7-3.6,1.7c-2.6,0-4.3-1.8-4.3-4.4c0-2.9,2.2-5,5.2-5c1.4,0,2.6,0.6,3.3,1.6V2.7h3.1V15.5z M25.4,10.6c0-1.5-1-2.6-2.3-2.6c-1.4,0-2.4,1.1-2.4,2.6c0,1.5,1,2.6,2.4,2.6C24.4,13.2,25.4,12.1,25.4,10.6z" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Features Section - Clean Grid */}
            <section id="features" className="py-24 bg-white border-y border-slate-100">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">{dict.home.features.title || "Supercharge your workflow"}</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">{dict.home.features.subtitle || "Everything you need to ship projects faster, all in one place."}</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {/* Uniform Cards */}
                        <FeatureCard
                            icon={<Layout className="w-6 h-6 text-blue-600" />}
                            title={dict.home.features.standardized.title}
                            desc={dict.home.features.standardized.desc}
                        />
                        <FeatureCard
                            icon={<Lock className="w-6 h-6 text-blue-600" />}
                            title={dict.home.features.dependencies.title}
                            desc={dict.home.features.dependencies.desc}
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-blue-600" />}
                            title={dict.home.features.parallel.title}
                            desc={dict.home.features.parallel.desc}
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
                            title="Automated Execution"
                            desc="Protocols run themselves. Just set the rules and watch it go."
                        />
                        <FeatureCard
                            icon={<ArrowRight className="w-6 h-6 text-blue-600" />}
                            title="Real-time Sync"
                            desc="Changes propagate instantly across your team."
                        />
                        <FeatureCard
                            icon={<Menu className="w-6 h-6 text-blue-600" />}
                            title="Audit Trails"
                            desc="Track every action and revert changes with a click."
                        />
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <span className="text-primary font-bold tracking-wider uppercase text-sm">{dict.home.howItWorks.subtitle}</span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2">{dict.home.howItWorks.title}</h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
                >
                    {/* Connecting Line (Desktop) */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-border -z-10 origin-left"
                    />

                    <HowToStep
                        number="01"
                        title={dict.home.howItWorks.steps.define.title}
                        desc={dict.home.howItWorks.steps.define.desc}
                    />
                    <HowToStep
                        number="02"
                        title={dict.home.howItWorks.steps.execute.title}
                        desc={dict.home.howItWorks.steps.execute.desc}
                    />
                    <HowToStep
                        number="03"
                        title={dict.home.howItWorks.steps.automate.title}
                        desc={dict.home.howItWorks.steps.automate.desc}
                    />
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-16 bg-card border-y border-border/40">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold text-center mb-12"
                    >
                        {dict.home.faq.title}
                    </motion.h2>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <FaqItem
                            question={dict.home.faq.items.free.q}
                            answer={dict.home.faq.items.free.a}
                            isOpen={openFaqIndex === 0}
                            onClick={() => toggleFaq(0)}
                        />
                        <FaqItem
                            question={dict.home.faq.items.team.q}
                            answer={dict.home.faq.items.team.a}
                            isOpen={openFaqIndex === 1}
                            onClick={() => toggleFaq(1)}
                        />
                        <FaqItem
                            question={dict.home.faq.items.limit.q}
                            answer={dict.home.faq.items.limit.a}
                            isOpen={openFaqIndex === 2}
                            onClick={() => toggleFaq(2)}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Bottom CTA Banner - Clean */}
            <section className="py-24 container mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden bg-blue-600 text-white shadow-xl shadow-blue-900/20">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[gradient_8s_linear_infinite]" />

                    <div className="relative z-10 px-6 py-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                                Save 6-7 hours<br />every single week.
                            </h2>

                            <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 font-medium">
                                Join 10,000+ teams who have switched from chaotic chats to structured protocols.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/projects"
                                    className="px-8 py-3.5 text-base font-bold bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:transform hover:-translate-y-1"
                                >
                                    Start for Free
                                </Link>
                                <Link
                                    href="/admin/protocols"
                                    className="px-8 py-3.5 text-base font-bold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all border border-blue-500"
                                >
                                    View Demo
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border bg-background pt-20">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 font-bold text-lg mb-2">
                            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
                                <Zap size={14} fill="currentColor" />
                            </div>
                            {dict.home.footer.brand}
                        </div>
                        <p className="text-sm text-muted-foreground">{dict.home.footer.desc}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">{dict.home.footer.links.github}</a>
                        <a href="#" className="hover:text-foreground transition-colors">{dict.home.footer.links.twitter}</a>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {dict.home.footer.copyright}
                    </div>
                </div>
            </footer>
        </div >
    );
}

// --- Sub Components ---

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div variants={itemVariants} className="group p-8 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg shadow-sm">
            <div className="mb-5 p-3 rounded-lg bg-blue-50 text-blue-600 w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-3 text-slate-900">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
        </motion.div>
    );
}

function HowToStep({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center bg-white p-6 rounded-2xl z-10 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 mb-6">
                {number}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
            <p className="text-slate-600">{desc}</p>
        </motion.div>
    )
}

function FaqItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
    return (
        <motion.div variants={itemVariants} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
            <button className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors" onClick={onClick}>
                {question}
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100/50">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
