import { PrismaClient, Project, ProjectItem, ProtocolItem } from '@repo/database';
import { ProjectContext } from '../types';
import { logAction } from '../utils/audit';

export async function getProjects(prisma: PrismaClient, ctx: ProjectContext): Promise<(Project & { _count: { items: number } })[]> {
    if (!ctx.organizationId) return [];

    return await prisma.project.findMany({
        where: { organizationId: ctx.organizationId },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: { select: { items: true } }
        }
    });
}

export async function getProjectsMatrix(
    prisma: PrismaClient,
    ctx: ProjectContext,
    limit: number = 50,
    cursor?: string
): Promise<{
    projects: (Project & { items: Pick<ProjectItem, 'id' | 'title' | 'status' | 'updatedAt' | 'originProtocolItemId'>[] })[],
    headers: Pick<ProtocolItem, 'id' | 'title'>[],
    nextCursor?: string
}> {
    if (!ctx.organizationId) return { projects: [], headers: [] };

    const take = limit + 1; // Fetch one extra to determine if there's a next page

    const projects = await prisma.project.findMany({
        where: { organizationId: ctx.organizationId },
        orderBy: { updatedAt: 'desc' },
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            items: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    updatedAt: true,
                    originProtocolItemId: true
                }
            }
        }
    });

    let nextCursor: string | undefined = undefined;
    if (projects.length > limit) {
        const nextItem = projects.pop(); // Remove the extra item
        nextCursor = nextItem?.id;
    }

    const originIds = new Set<string>();
    projects.forEach(p => {
        p.items.forEach(i => {
            if (i.originProtocolItemId) originIds.add(i.originProtocolItemId);
        });
    });

    const headers = await prisma.protocolItem.findMany({
        where: { id: { in: Array.from(originIds) } },
        orderBy: { order: 'asc' },
        select: { id: true, title: true }
    });

    return { projects, headers, nextCursor };
}

export async function createFromProtocol(prisma: PrismaClient, ctx: ProjectContext, protocolId: string, title: string, metadata: Record<string, unknown> | null = null): Promise<Project> {
    if (!ctx.organizationId) throw new Error('No Organization selected');

    return await prisma.$transaction(async (tx) => {
        console.time('Create Project Transaction');
        // 1. Fetch Protocol
        const protocol = await tx.protocol.findUnique({
            where: { id: protocolId },
            include: {
                items: {
                    include: { dependsOn: true }
                }
            }
        });

        if (!protocol) throw new Error('Protocol not found');
        if (protocol.organizationId !== ctx.organizationId) throw new Error('Protocol not found (Org mismatch)');

        // 2. Create Project Shell
        const project = await tx.project.create({
            data: {
                title,
                description: protocol.description,
                createdById: ctx.userId,
                status: 'ACTIVE',
                organizationId: ctx.organizationId,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                metadata: metadata as any
            }
        });

        // 3. Bulk Insert ProtocolItems
        const itemsToCreate = protocol.items.map(pItem => ({
            title: pItem.title,
            description: pItem.description,
            status: 'LOCKED',
            projectId: project.id,
            originProtocolItemId: pItem.id,
            assignedToId: pItem.defaultAssigneeId,
            type: pItem.type,
            order: pItem.order,
            requireAttachment: pItem.requireAttachment
        }));

        if (itemsToCreate.length > 0) {
            await tx.projectItem.createMany({
                data: itemsToCreate
            });
        }

        // 4. Fetch created items to Map IDs
        const createdItems = await tx.projectItem.findMany({
            where: { projectId: project.id },
            select: { id: true, originProtocolItemId: true }
        });

        const itemIdMap = new Map<string, string>();
        createdItems.forEach(item => {
            if (item.originProtocolItemId) {
                itemIdMap.set(item.originProtocolItemId, item.id);
            }
        });

        // 5. Dependencies & Hierarchy
        const dependencyData: { itemId: string, prerequisiteId: string }[] = [];
        const parentUpdates: Promise<unknown>[] = [];
        const openStatusIds: string[] = [];

        for (const pItem of protocol.items) {
            const newDependentId = itemIdMap.get(pItem.id);
            if (!newDependentId) continue;

            // Hierarchy Updates
            if (pItem.parentId) {
                const newParentId = itemIdMap.get(pItem.parentId);
                if (newParentId) {
                    parentUpdates.push(
                        tx.projectItem.update({
                            where: { id: newDependentId },
                            data: { parentId: newParentId }
                        })
                    );
                }
            }

            // Prepare Dependencies
            if (pItem.dependsOn.length > 0) {
                for (const dep of pItem.dependsOn) {
                    const newPrerequisiteId = itemIdMap.get(dep.prerequisiteId);
                    if (newPrerequisiteId) {
                        dependencyData.push({
                            itemId: newDependentId,
                            prerequisiteId: newPrerequisiteId
                        });
                    }
                }
            } else {
                // No dependencies = OPEN
                openStatusIds.push(newDependentId);
            }
        }

        // Bulk Insert Dependencies
        if (dependencyData.length > 0) {
            await tx.itemDependency.createMany({
                data: dependencyData
            });
        }

        // Execute Parent Updates (Parallel)
        console.time('Parent Updates');
        await Promise.all(parentUpdates);
        console.timeEnd('Parent Updates');

        // Update Status to OPEN for root items (Bulk Update)
        if (openStatusIds.length > 0) {
            await tx.projectItem.updateMany({
                where: { id: { in: openStatusIds } },
                data: { status: 'OPEN' }
            });
        }

        await tx.projectHistory.create({
            data: {
                projectId: project.id,
                action: 'PROJECT_CREATED',
                details: `Created from protocol: ${protocol.name}`
            }
        });

        console.timeEnd('Create Project Transaction');
        return project;
    }, {
        maxWait: 10000, // Wait max 10s for connection
        timeout: 60000 // Allow transaction to run for 60s
    });
}


export async function updateDetails(prisma: PrismaClient, ctx: ProjectContext, projectId: string, data: { title?: string, description?: string }): Promise<void> {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { createdById: true, organizationId: true }
    });

    if (!project) throw new Error('Project not found');

    // Permissions
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';
    const isManager = ctx.role === 'MANAGER';
    const isStaff = ctx.role === 'STAFF';
    const isCreator = project.createdById === ctx.userId;

    if (!isAdmin && !isCreator && !isManager && !isStaff) {
        throw new Error('Forbidden: You do not have permission to edit details');
    }

    await prisma.project.update({
        where: { id: projectId },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description !== undefined && { description: data.description })
        }
    });

    await logAction(prisma, projectId, 'PROJECT_UPDATED', `Project details updated`);
}


export async function deleteProject(prisma: PrismaClient, ctx: ProjectContext, projectId: string): Promise<void> {
    const isAdmin = ctx.role === 'ADMIN' || ctx.role === 'SUPER_ADMIN';
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true }
    });

    if (!project) throw new Error('Project not found');
    if (project.organizationId !== ctx.organizationId) throw new Error('Unauthorized');

    await prisma.project.delete({
        where: { id: projectId }
    });
}
