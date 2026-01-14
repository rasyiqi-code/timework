import { PrismaClient, ProjectItem } from '@repo/database';
import { ProjectContext } from '../types';
import { logAction } from '../utils/audit';
import { detectCycle, buildDependencyGraph } from '../utils/graph';

export async function addItem(prisma: PrismaClient, ctx: ProjectContext, projectId: string, title: string, blockedItemId?: string): Promise<ProjectItem> {
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';
    if (!isAdmin) throw new Error('Unauthorized');

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true }
    });

    if (!project || project.organizationId !== ctx.organizationId) {
        throw new Error('Project not found or unauthorized');
    }

    const newItem = await prisma.projectItem.create({
        data: {
            title,
            projectId,
            status: 'OPEN',
        }
    });

    await logAction(prisma, projectId, 'ITEM_ADDED', `Ad-hoc item "${title}" added`);

    if (blockedItemId) {
        await addDependency(prisma, ctx, blockedItemId, newItem.id);
        await logAction(prisma, projectId, 'DEPENDENCY_ADDED', `"${title}" now blocks item ${blockedItemId}`);
    }

    return newItem;
}

import { calculateCompletionCascades, calculateReversionCascades, type DependentItem, type DependencyWithPrerequisite } from '../utils/status-engine';

export async function updateItemStatus(prisma: PrismaClient, ctx: ProjectContext, itemId: string, newStatus: string): Promise<ProjectItem> {
    // 1. Fetch item to check ownership
    const itemToCheck = await prisma.projectItem.findUnique({
        where: { id: itemId },
        select: {
            assignedToId: true,
            projectId: true,
            title: true,
            project: {
                select: { createdById: true }
            }
        }
    });

    if (!itemToCheck) throw new Error('Item not found');

    // 2. Enforce Ownership or Admin
    const isCreator = itemToCheck.project.createdById === ctx.userId;
    const isAssignee = itemToCheck.assignedToId === ctx.userId;
    const isUnassigned = itemToCheck.assignedToId === null;
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';

    if (!isAdmin && !isCreator && !isAssignee && !isUnassigned) {
        throw new Error('Forbidden: You can only update your own tasks or unassigned tasks');
    }

    const item = await prisma.projectItem.update({
        where: { id: itemId },
        data: { status: newStatus },
        include: { project: true }
    });

    await logAction(prisma, item.projectId, 'STATUS_CHANGE', `Item "${item.title}" marked as ${newStatus}`);

    // Logic: If status is DONE, check dependents to UNLOCK
    if (newStatus === 'DONE') {
        const dependents = await prisma.itemDependency.findMany({
            where: { prerequisiteId: itemId },
            include: { item: { select: { id: true, status: true } } }
        });

        const dependentIds = dependents.map((d) => d.item.id);

        if (dependentIds.length > 0) {
            const allPrereqs = await prisma.itemDependency.findMany({
                where: { itemId: { in: dependentIds } },
                include: { prerequisite: { select: { status: true } } }
            });

            // Cast types to match our lightweight engine type
            const updates = calculateCompletionCascades(
                itemId,
                dependents as unknown as DependentItem[],
                allPrereqs as unknown as DependencyWithPrerequisite[]
            );

            if (updates.length > 0) {
                await prisma.$transaction(
                    updates.map(u =>
                        prisma.projectItem.update({
                            where: { id: u.id },
                            data: { status: u.status }
                        })
                    )
                );
            }
        }
    }
    else {
        // Reverting from DONE (or just random change) -> LOCK Dependencies
        // NOTE: This runs even if we go OPEN -> IN_PROGRESS. We should probably restrict to "If Was DONE" check?
        // But we don't know previous status here without another query.
        // Assuming strictness: If parent is NOT DONE, child MUST be LOCKED (unless child is done).

        const dependents = await prisma.itemDependency.findMany({
            where: { prerequisiteId: itemId },
            include: { item: { select: { id: true, status: true } } }
        });

        const updates = calculateReversionCascades(itemId, dependents as unknown as DependentItem[]);

        if (updates.length > 0) {
            await prisma.$transaction(
                updates.map(u =>
                    prisma.projectItem.update({
                        where: { id: u.id },
                        data: { status: u.status }
                    })
                )
            );
        }
    }

    return item;
}

export async function updateItemDetails(prisma: PrismaClient, ctx: ProjectContext, itemId: string, data: { title?: string, description?: string }): Promise<ProjectItem> {
    // 1. Fetch item to check ownership
    const itemToCheck = await prisma.projectItem.findUnique({
        where: { id: itemId },
        select: {
            assignedToId: true,
            projectId: true,
            project: {
                select: { createdById: true, organizationId: true }
            }
        }
    });

    if (!itemToCheck) throw new Error('Item not found');
    if (itemToCheck.project.organizationId !== ctx.organizationId) throw new Error('Unauthorized');

    // 2. Enforce Permissions (Same as updateItemStatus)
    const isCreator = itemToCheck.project.createdById === ctx.userId;
    const isAssignee = itemToCheck.assignedToId === ctx.userId;
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';

    if (!isAdmin && !isCreator && !isAssignee) {
        throw new Error('Forbidden: You can only edit your own tasks');
    }

    const item = await prisma.projectItem.update({
        where: { id: itemId },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description !== undefined && { description: data.description })
        },
    });
    return item;
}

export async function addDependency(prisma: PrismaClient, ctx: ProjectContext, itemId: string, prerequisiteId: string): Promise<ProjectItem | null> {
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';
    if (!isAdmin) throw new Error('Unauthorized');

    if (itemId === prerequisiteId) {
        throw new Error('Cannot depend on self');
    }

    // Verify Ownership
    const item = await prisma.projectItem.findUnique({
        where: { id: itemId },
        include: { project: true }
    });

    if (!item || item.project.organizationId !== ctx.organizationId) {
        throw new Error('Item not found or unauthorized');
    }

    const prerequisite = await prisma.projectItem.findUnique({
        where: { id: prerequisiteId },
        include: { project: true }
    });

    if (!prerequisite || prerequisite.project.organizationId !== ctx.organizationId) {
        throw new Error('Prerequisite item not found or unauthorized');
    }

    const graph = await buildDependencyGraph(prisma, item.projectId);
    const isCycle = detectCycle(graph, itemId, prerequisiteId);
    if (isCycle) {
        throw new Error('Cycle detected: This dependency would create an infinite loop.');
    }

    await prisma.itemDependency.create({
        data: {
            itemId,
            prerequisiteId
        }
    });

    if (item.status !== 'DONE') {
        if (prerequisite.status !== 'DONE') {
            await prisma.projectItem.update({
                where: { id: itemId },
                data: { status: 'LOCKED' }
            });
        }
    }
    return item;
}
