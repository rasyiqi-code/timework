'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { requireAdmin, getCurrentUser } from '@/actions/auth';
import { ProjectService } from '@repo/project-service';

const projectService = new ProjectService(prisma);

import { ProjectSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * Instantiate a new Project from a Protocol Template
 */
export async function createProjectFromProtocol(protocolId: string, title: string, metadata: Record<string, unknown> | null = null) {
    const user = await getCurrentUser(); // Enforce Login check
    if (!user || !user.organizationId) throw new Error('No Organization selected');

    // Validation
    ProjectSchema.pick({ title: true }).parse({ title });

    const ctx = { userId: user.id, organizationId: user.organizationId, role: user.role };

    const project = await projectService.createFromProtocol(ctx, protocolId, title, metadata);

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
    const ctx = { userId: currentUser.id, organizationId: currentUser.organizationId || '', role: currentUser.role };

    const item = await projectService.updateItemStatus(ctx, itemId, newStatus);

    revalidatePath(`/projects/${item.projectId}`);
}

export async function getProjects() {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return [];

    const ctx = { userId: user.id, organizationId: user.organizationId, role: user.role };
    return await projectService.getProjects(ctx);
}

/**
 * Fetch Projects for Matrix View (Table)
 * Returns Projects with items + Normalized Headers (Protocol Steps)
 */
export async function getProjectsMatrix(limit: number = 50, cursor?: string) {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return { projects: [], headers: [] };

    const ctx = { userId: user.id, organizationId: user.organizationId, role: user.role };
    return await projectService.getProjectsMatrix(ctx, limit, cursor);
}

export async function getProjectById(id: string) {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return null;

    const ctx = { userId: user.id, organizationId: user.organizationId, role: user.role };
    return await projectService.getById(ctx, id);
}

/**
 * Ad-Hoc Injection: Add a new item to an Active Project
 */
export async function addProjectItem(projectId: string, title: string, blockedItemId?: string) {
    const admin = await requireAdmin();

    const result = z.string().min(1).safeParse(title);
    if (!result.success) throw new Error("Title is required");

    const ctx = { userId: admin.id, organizationId: admin.organizationId || '', role: admin.role };

    await projectService.addItem(ctx, projectId, title, blockedItemId);

    revalidatePath(`/projects/${projectId}`);
}

// Helper to check for cycles using DFS (Adapted for Project Items)
// detectProjectCycle removed (in service)

/**
 * Ad-Hoc Injection: Create a dependency between two project items
 */
export async function addProjectDependency(itemId: string, prerequisiteId: string) {
    const admin = await requireAdmin();
    const ctx = { userId: admin.id, organizationId: admin.organizationId || '', role: admin.role };

    const item = await projectService.addDependency(ctx, itemId, prerequisiteId);

    if (item && item.projectId) {
        revalidatePath(`/projects/${item.projectId}`);
    }
}

export async function updateProjectItemDetails(itemId: string, data: { title?: string, description?: string }) {
    // Current user check if needed, but for now we assume caller handles auth or service handles it. 
    // Wait, updateProjectItemDetails had no auth check in original code?! 
    // Ah, it was probably protected by layout or earlier checks? 
    // Wait, line 319 in original had `const item = await prisma...`. No auth check.
    // I should add auth check.
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');
    const ctx = { userId: currentUser.id, organizationId: currentUser.organizationId || '', role: currentUser.role };

    const item = await projectService.updateItemDetails(ctx, itemId, data);

    revalidatePath(`/projects/${item.projectId}`);
}

export async function updateProjectDetails(projectId: string, data: { title?: string, description?: string }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');
    if (!currentUser.organizationId) throw new Error('No Organization');

    ProjectSchema.partial().parse(data);

    const ctx = { userId: currentUser.id, organizationId: currentUser.organizationId, role: currentUser.role };

    await projectService.updateDetails(ctx, projectId, data);

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
    const admin = await requireAdmin();
    if (!admin.organizationId) throw new Error('No Organization');

    const ctx = { userId: admin.id, organizationId: admin.organizationId, role: admin.role };

    await projectService.delete(ctx, projectId);

    revalidatePath('/projects');
}
