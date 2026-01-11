'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function OnboardingCheck({
    hasOrganization,
    isAuthenticated,
    isSuperAdmin = false
}: {
    hasOrganization: boolean;
    isAuthenticated: boolean;
    isSuperAdmin?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If authenticated but no org, and not already on onboarding page
        // Exempt Super Admins from this check globally
        if (isAuthenticated && !hasOrganization && !isSuperAdmin && pathname !== '/onboarding' && !pathname?.startsWith('/handler') && !pathname?.startsWith('/account-settings') && !pathname?.startsWith('/super-admin')) {
            router.push('/onboarding');
        }
    }, [isAuthenticated, hasOrganization, isSuperAdmin, pathname, router]);

    return null;
}
