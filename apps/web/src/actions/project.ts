'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logProjectAction } from '@/actions/audit';
import { requireAdmin, getCurrentUser } from '@/actions/auth';

/**
 * Instantiate a new Project from a Protocol Template
 */
export async function createProjectFromProtocol(protocolId: string, title: string) {
    const admin = await requireAdmin(); // Enforce Admin check
    if (!admin.organizationId) throw new Error('No Organization selected');

    // 1. Fetch Protocol with Items and Dependencies
    const protocol = await prisma.protocol.findUnique({
        where: { id: protocolId },
        include: {
            items: {
                include: {
                    dependsOn: true // these are ProtocolDependency
                }
            }
        }
    });

    if (!protocol) throw new Error('Protocol not found');
    if (protocol.organizationId !== admin.organizationId) throw new Error('Protocol not found (Org mismatch)');

    // 2. Create Project Shell
    const project = await prisma.project.create({
        data: {
            title,
            description: protocol.description,
            createdById: admin.id,
            status: 'ACTIVE',
            organizationId: admin.organizationId
        }
    });

    // 3. Map ProtocolItems to ProjectItems (Optimized Parallel Creation)
    // We need a map to store OldID (ProtocolItem) -> NewID (ProjectItem)
    const itemIdMap = new Map<string, string>();

    // First pass: Create all items in parallel to get IDs
    // Note: SQLite might lock if concurrency is too high, but for typical protocols (10-50 items) it's fine.
    const createdItems = await Promise.all(protocol.items.map(async (pItem) => {
        const newItem = await prisma.projectItem.create({
            data: {
                title: pItem.title,
                description: pItem.description,
                status: 'LOCKED', // Default all to LOCKED initially
                projectId: project.id,
                originProtocolItemId: pItem.id,
                assignedToId: pItem.defaultAssigneeId
            }
        });
        return { originalId: pItem.id, newItem };
    }));

    createdItems.forEach(({ originalId, newItem }) => {
        itemIdMap.set(originalId, newItem.id);
    });

    // Second pass: Create dependencies in parallel
    // We also identify items that have NO dependencies to set them as OPEN
    const dependencyPromises: Promise<unknown>[] = [];
    const openStatusPromises: Promise<unknown>[] = [];

    for (const pItem of protocol.items) {
        const newDependentId = itemIdMap.get(pItem.id);
        if (!newDependentId) continue;

        if (pItem.dependsOn.length > 0) {
            // Create dependencies
            const depCreates = pItem.dependsOn.map(dep => {
                const newPrerequisiteId = itemIdMap.get(dep.prerequisiteId);
                if (newPrerequisiteId) {
                    return prisma.itemDependency.create({
                        data: {
                            itemId: newDependentId,
                            prerequisiteId: newPrerequisiteId
                        }
                    });
                }
                return Promise.resolve();
            });
            dependencyPromises.push(...depCreates);
        } else {
            // No dependencies? It should be OPEN to start
            openStatusPromises.push(
                prisma.projectItem.update({
                    where: { id: newDependentId },
                    data: { status: 'OPEN' }
                })
            );
        }
    }

    await Promise.all([...dependencyPromises, ...openStatusPromises]);

    // 4. Log Creation
    await logProjectAction(project.id, 'PROJECT_CREATED', `Created from protocol: ${protocol.name}`);

    revalidatePath('/projects');
    return project;
}

// Helper to handle user creation if not exists (for demo)
// async function getOrCreateDemoUser() { ... } // Removed or commented out if unused


/**
 * The Brain: Update Status and Unlock Dependencies
 */
export async function updateItemStatus(itemId: string, newStatus: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // 1. Fetch item to check ownership
    // 1. Fetch item to check ownership
    const itemToCheck = await prisma.projectItem.findUnique({
        where: { id: itemId },
        select: {
            assignedToId: true,
            project: {
                select: { createdById: true }
            }
        }
    });

    if (!itemToCheck) throw new Error('Item not found');

    // 2. Enforce Ownership or Admin
    const isCreator = itemToCheck.project.createdById === currentUser.id;
    const isAssignee = itemToCheck.assignedToId === currentUser.id;
    const isUnassigned = itemToCheck.assignedToId === null;
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

    if (!isAdmin && !isCreator && !isAssignee && !isUnassigned) {
        throw new Error('Forbidden: You can only update your own tasks or unassigned tasks');
    }

    const item = await prisma.projectItem.update({
        where: { id: itemId },
        data: { status: newStatus },
        include: { project: true }
    });

    await logProjectAction(item.projectId, 'STATUS_CHANGE', `Item "${item.title}" marked as ${newStatus}`);

    // Logic: If status is DONE, check dependents to UNLOCK
    if (newStatus === 'DONE') {
        const dependents = await prisma.itemDependency.findMany({
            where: { prerequisiteId: itemId },
            include: { item: true }
        });

        // Optimization: Batch Check
        // For ALL dependents, we need to know if ALL their prerequisites are met.
        // We can fetch ALL prerequisites for ALL dependents in one query.
        const dependentIds = dependents.map((d) => d.item.id);

        if (dependentIds.length > 0) {
            const allPrereqs = await prisma.itemDependency.findMany({
                where: { itemId: { in: dependentIds } },
                include: { prerequisite: true }
            });

            const updates = [];

            for (const dep of dependents) {
                const childItem = dep.item;
                // Filter prereqs for this specific child
                const childPrereqs = allPrereqs.filter((p) => p.itemId === childItem.id);
                // Check if all are DONE
                const allDone = childPrereqs.every((p) => p.prerequisite.status === 'DONE');

                if (allDone) {
                    updates.push(
                        prisma.projectItem.update({
                            where: { id: childItem.id },
                            data: { status: 'OPEN' }
                        })
                    );
                }
            }

            await prisma.$transaction(updates);
        }
    }
    // Logic: If status is NOT DONE (e.g. reverted to OPEN/IN_PROGRESS), check dependents to RE-LOCK
    else {
        const dependents = await prisma.itemDependency.findMany({
            where: { prerequisiteId: itemId },
            include: { item: true }
        });

        const updates = [];

        for (const dep of dependents) {
            const childItem = dep.item;

            // If the child was previously unlocked (OPEN/IN_PROGRESS), re-lock it
            // because one of its prerequisites is no longer DONE.
            if (childItem.status !== 'DONE' && childItem.status !== 'LOCKED') {
                updates.push(
                    prisma.projectItem.update({
                        where: { id: childItem.id },
                        data: { status: 'LOCKED' }
                    })
                );
            }
        }
        await prisma.$transaction(updates);
    }

    revalidatePath(`/projects/${item.projectId}`);
}

export async function getProjects() {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return [];

    return await prisma.project.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: { select: { items: true } }
        }
    });
}

export async function getProjectById(id: string) {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return null;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    dependsOn: {
                        include: {
                            prerequisite: true
                        }
                    },
                    requiredBy: true
                },
                orderBy: { title: 'asc' } // temporary sort
            }
        }
    });

    if (project && project.organizationId !== user.organizationId) {
        return null;
    }

    return project;
}

/**
 * Ad-Hoc Injection: Add a new item to an Active Project
 */
export async function addProjectItem(projectId: string, title: string, blockedItemId?: string) {
    await requireAdmin();
    const newItem = await prisma.projectItem.create({
        data: {
            title,
            projectId,
            status: 'OPEN', // New ad-hoc items start as OPEN unless we link them immediately
        }
    });

    await logProjectAction(projectId, 'ITEM_ADDED', `Ad-hoc item "${title}" added`);

    // If this new item is supposed to block an existing item (Injection Logic)
    if (blockedItemId) {
        await addProjectDependency(blockedItemId, newItem.id);
        await logProjectAction(projectId, 'DEPENDENCY_ADDED', `"${title}" now blocks item ${blockedItemId}`);
    }

    revalidatePath(`/projects/${projectId}`);
}

// Helper to check for cycles using DFS (Adapted for Project Items)
async function detectProjectCycle(itemId: string, prerequisiteId: string): Promise<boolean> {
    // 1. Get project context
    const item = await prisma.projectItem.findUnique({
        where: { id: itemId },
        select: { projectId: true }
    });

    if (!item) return false;

    // 2. Fetch all items in the project to build the graph
    // We could optimize this to only fetch reachable nodes, but for typical project sizes (10-100 items), this is safe.
    const projectItems = await prisma.projectItem.findMany({
        where: { projectId: item.projectId },
        include: { dependsOn: true }
    });

    // 3. Build Adjacency List
    // We want to check if 'itemId' is reachable from 'prerequisiteId'
    const graph = new Map<string, string[]>();
    projectItems.forEach(i => {
        // i.dependsOn means i -> depends -> prerequisite
        const edges = i.dependsOn.map(d => d.prerequisiteId);
        graph.set(i.id, edges);
    });

    // 4. DFS from prerequisiteId
    const visited = new Set<string>();
    const stack = [prerequisiteId];

    while (stack.length > 0) {
        const current = stack.pop()!;
        if (current === itemId) return true; // Cycle detected!

        if (!visited.has(current)) {
            visited.add(current);
            const neighbors = graph.get(current) || [];
            for (const neighbor of neighbors) {
                stack.push(neighbor);
            }
        }
    }

    return false;
}

/**
 * Ad-Hoc Injection: Create a dependency between two project items
 */
export async function addProjectDependency(itemId: string, prerequisiteId: string) {
    await requireAdmin();

    // Prevent self-dependency
    if (itemId === prerequisiteId) {
        throw new Error('Cannot depend on self');
    }

    // Check for Cycles
    const isCycle = await detectProjectCycle(itemId, prerequisiteId);
    if (isCycle) {
        throw new Error('Cycle detected: This dependency would create an infinite loop.');
    }

    // 1. Create the dependency link
    await prisma.itemDependency.create({
        data: {
            itemId,
            prerequisiteId
        }
    });

    // 2. Lock the item if the prerequisite is not DONE
    // Fix: Do NOT lock if the item is already DONE (don't regress progress)
    const prerequisite = await prisma.projectItem.findUnique({ where: { id: prerequisiteId } });
    const item = await prisma.projectItem.findUnique({ where: { id: itemId }, select: { status: true, projectId: true } });

    if (item && item.status !== 'DONE') {
        if (prerequisite && prerequisite.status !== 'DONE') {
            await prisma.projectItem.update({
                where: { id: itemId },
                data: { status: 'LOCKED' }
            });
        }
    }

    // Explicitly revalidate the project page
    if (item) {
        revalidatePath(`/projects/${item.projectId}`);
    }
}

export async function updateProjectItemDetails(itemId: string, data: { title?: string, description?: string }) {
    const item = await prisma.projectItem.update({
        where: { id: itemId },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description !== undefined && { description: data.description })
        },
        select: { projectId: true }
    });

    revalidatePath(`/projects/${item.projectId}`);
}
