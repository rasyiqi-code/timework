import { PrismaClient } from '@repo/database';

export async function logAction(prisma: PrismaClient, projectId: string, action: string, details?: string): Promise<void> {
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
    }
}
