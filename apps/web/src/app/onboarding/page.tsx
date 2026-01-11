import { Suspense } from "react";
import { stackServerApp } from "@/stack";
import { ClientOnboarding } from "@/components/onboarding/ClientOnboarding";

export default async function OnboardingPage() {
    const user = await stackServerApp.getUser();

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading onboarding...</div>}>
            <ClientOnboarding
                hasTeam={!!user?.selectedTeam}
                accountSettingsUrl={stackServerApp.urls.accountSettings}
            />
        </Suspense>
    );
}
