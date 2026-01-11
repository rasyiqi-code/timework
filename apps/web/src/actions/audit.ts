'use server';

import { prisma } from '@/lib/db';


/**
 * Log an action to the Project History
 */
export async function logProjectAction(projectId: string, action: string, details?: string) {
    try {
        await prisma.projectHistory.create({
            data: {
                projectId,
                action,
                details
            }
        });
    } catch (error) {
        console.error('Failed to log project action:', error);
        // We don't throw here to avoid blocking the main action if logging fails
    }
}

/**
 * Fetch history for a project
 */
export async function getProjectHistory(projectId: string) {
    return await prisma.projectHistory.findMany({
        where: { projectId },
        orderBy: { timestamp: 'desc' },
        take: 50 // Limit to last 50 actions for now
    });
}
