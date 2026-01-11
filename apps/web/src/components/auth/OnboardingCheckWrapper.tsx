import { getCurrentUser } from "@/actions/auth";
import { OnboardingCheck } from "@/components/auth/OnboardingCheck";

export async function OnboardingCheckWrapper() {
    let user = null;
    try {
        user = await getCurrentUser();
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = e as any;
        if (err.digest === 'DYNAMIC_SERVER_USAGE') {
            throw err;
        }
        // If DB fails (timeout etc), we treat as not authenticated to avoid crashing the whole page.
        // This allows the RootLayout to finish rendering (providing StackProvider).
        console.error("Critical Auth Error in Layout:", e);
    }

    // User is authenticated if user object exists.
    // Has organization if organizationId is present.
    // However, getCurrentUser might return null if not logged in at all.

    // We need to distinguish between "Not Logged In" and "Logged In but No Org".

    // If user is null, they might be logged out. Authenticated = false.
    // If user exists, Authenticated = true. 
    // HasOrg = !!user.organizationId.

    return (
        <OnboardingCheck
            isAuthenticated={!!user}
            hasOrganization={!!user?.organizationId}
            isSuperAdmin={user?.role === 'SUPER_ADMIN'}
        />
    );
}
