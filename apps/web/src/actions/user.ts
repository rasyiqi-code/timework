'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/actions/auth';

/**
 * Get all users for assignment dropdown (Scoped to Organization)
 */
export async function getUsers() {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.organizationId) return [];

    return await prisma.user.findMany({
        where: {
            memberships: {
                some: {
                    organizationId: currentUser.organizationId
                }
            }
        },
        orderBy: { name: 'asc' }
    });
}

/**
 * Assign a user to a Project Item
 */
export async function assignUserToItem(itemId: string, userId: string) {
    // If userId is empty string, we treat it as unassignment (null)
    const assigneeId = userId || null;

    const item = await prisma.projectItem.update({
        where: { id: itemId },
        data: { assignedToId: assigneeId },
        include: {
            project: true,
            assignedTo: true
        }
    });

    if (item.project) {
        // We need to import logProjectAction dynamically or move it to a shared lib to avoid circular deps if any
        // Assuming clean architecture for now
        const { logProjectAction } = await import('./audit');
        const assigneeName = item.assignedTo ? item.assignedTo.name : 'Unassigned';
        await logProjectAction(item.projectId, 'ASSIGNMENT_CHANGE', `Item "${item.title}" assigned to ${assigneeName}`);
    }

    revalidatePath(`/projects/${item.projectId}`);
}

/**
 * Fetch tasks assigned to a specific user (or 'demo-user' if not provided)
 * In a real app, we would get the session user ID here.
 */
export async function getMyTasks(userId: string) {
    return await prisma.projectItem.findMany({
        where: {
            assignedToId: userId,
            status: { not: 'DONE' } // Only show active tasks
        },
        include: {
            project: {
                select: { title: true }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}
