'use server';

import { prisma } from '@/lib/db';
import { stackServerApp } from '@/stack';
import { seedOrganizationData } from '@/lib/seed';



import { cache } from 'react';

// ... existing imports ...

// Internal implementation
// Internal implementation
const getCurrentUserImpl = async () => {
    // 1. Get Stack User
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) return null;

    const email = stackUser.primaryEmail;
    if (!email) return null;

    // 2. Determine Expected Role & Org ID
    const selectedTeam = stackUser.selectedTeam;
    let expectedRole = 'STAFF';
    const expectedOrganizationId = selectedTeam?.id || null;
    let isNewOrganization = false;

    // Determine Role
    if (selectedTeam) {
        try {
            const permissions = await stackUser.listPermissions(selectedTeam);
            const hasAdminPermission = permissions.some(p =>
                p.id === 'update_team' ||
                p.id.includes('delete') ||
                p.id.includes('manage') ||
                p.id === 'admin'
            );
            if (hasAdminPermission) expectedRole = 'ADMIN';
        } catch (e) {
            console.warn("Auth: Failed to check Stack permissions", e);
        }
    }

    // Super Admin Check
    if (process.env.SUPER_ADMIN_EMAIL && email === process.env.SUPER_ADMIN_EMAIL) {
        expectedRole = 'SUPER_ADMIN';
    }

    // 3. Fetch Existing DB User (Optimized: Single Query)
    const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
            organization: true,
            memberships: {
                where: { organizationId: expectedOrganizationId || '' }
            }
        }
    });

    // 4. Fast Path: Return if everything matches AND membership exists
    if (dbUser) {
        const roleMatches = dbUser.role === expectedRole;
        const orgMatches = dbUser.organizationId === expectedOrganizationId;
        const membershipExists = dbUser.memberships.length > 0;

        if (roleMatches && orgMatches && membershipExists) {
            return dbUser;
        }
        // If mismatch OR membership missing, proceed to sync
    }

    // 5. Slow Path: Sync Needed
    // ... existing sync logic ...

    // 6. Create or Update User
    let finalDbUser = dbUser;

    try {
        if (dbUser) {
            // Update
            finalDbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    organizationId: expectedOrganizationId,
                    role: expectedRole as 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
                },
                include: { organization: true, memberships: true }
            });
        } else {
            // Create
            isNewOrganization = !!selectedTeam;
            finalDbUser = await prisma.user.create({
                data: {
                    email,
                    name: stackUser.displayName || email.split('@')[0],
                    role: expectedRole as 'SUPER_ADMIN' | 'ADMIN' | 'STAFF',
                    organizationId: expectedOrganizationId
                },
                include: { organization: true, memberships: true }
            });
        }

        // 6b. Sync Membership (Persistent Record)
        if (expectedOrganizationId && finalDbUser) {
            // Use Upsert to be safe
            await prisma.organizationMember.upsert({
                where: {
                    userId_organizationId: {
                        userId: finalDbUser.id,
                        organizationId: expectedOrganizationId
                    }
                },
                create: {
                    userId: finalDbUser.id,
                    organizationId: expectedOrganizationId,
                    role: expectedRole
                },
                update: {
                    role: expectedRole
                }
            });
        }
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = error as any;
        if (e.code === 'P2002') {
            // Race condition handle
            finalDbUser = await prisma.user.findUnique({
                where: { email },
                include: { organization: true, memberships: true }
            });
        } else {
            console.error('Auth: Error syncing user', error);
            return null;
        }
    }

    // 7. Seed Organization Data if needed
    if (expectedOrganizationId && isNewOrganization && finalDbUser) {
        try {
            // Only seed if project count is 0 to be safe? 
            // Or rely on seed function idempotency.
            // For now, keep original logic: New Org Creation triggers seed.
            // But wait, 'isNewOrganization' flag above is tricky if we just returned early.
            // Logic: We only reach here if sync was performed.

            // Check if seeding is actually needed (e.g. check for projects)
            const projectCount = await prisma.project.count({
                where: { organizationId: expectedOrganizationId }
            });

            if (projectCount === 0) {
                await seedOrganizationData(expectedOrganizationId, finalDbUser.id);
            }
        } catch {
            // ignore seed errors
        }
    }

    return finalDbUser;
};

// Cached version for Request Memoization
const getCurrentUserCached = cache(getCurrentUserImpl);

export async function getCurrentUser() {
    return getCurrentUserCached();
}

export async function requireAdmin() {
    const user = await getCurrentUser();

    // Check if user exists and has ADMIN role
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        // In a real app we might redirect to a friendly "Unauthorized" page
        throw new Error('Unauthorized: Admin access required');
    }
    return user;
}

export async function requireSuperAdmin() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized: Super Admin access required');
    }
    return user;
}
