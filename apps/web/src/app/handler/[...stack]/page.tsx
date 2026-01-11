import { Suspense } from "react";
import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";

export default async function Handler(props: { params: Promise<{ stack: string[] }> | { stack: string[] }, searchParams: unknown }) {
    // Await params for Next.js 15 compatibility
    const params = await props.params;
    const stackPath = params.stack || [];
    const pageType = stackPath[0];

    const isAuthPage = ['sign-in', 'sign-up', 'forgot-password', 'reset-password', 'verify-email', 'oauth-callback'].includes(pageType);

    // Auth Pages: Centered, Focused
    if (isAuthPage) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
                <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
                        <StackHandler app={stackServerApp} {...props} fullPage={true} />
                    </Suspense>
                </div>
            </div>
        );
    }

    // Dashboard Style Pages (Settings, Teams)
    let title = "Account Management";
    let description = "Manage your profile, team settings, and preferences.";

    if (pageType === 'create-team') {
        title = "Create New Workspace";
        description = "Set up a new organization for your team.";
    } else if (pageType === 'account-settings') {
        title = "Account Settings";
        description = "Manage your profile, security, and team memberships.";
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
                </div>
            </div>

            <div className="w-full max-w-7xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {/* Stack Component should fill the container card completely */}
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
                    <StackHandler app={stackServerApp} {...props} fullPage={false} />
                </Suspense>
            </div>
        </div>
    );
}
