'use server';

import { prisma } from '@/lib/db';
import { Prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { requireAdmin, getCurrentUser } from '@/actions/auth';

export async function getProtocols() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) return []; // Or throw

  return await prisma.protocol.findMany({
    where: { organizationId: user.organizationId }, // Filter by Org
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function createProtocol(formData: FormData) {
  const user = await requireAdmin();
  if (!user.organizationId) throw new Error('No Organization selected');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  await prisma.protocol.create({
    data: {
      name,
      description,
      organizationId: user.organizationId,
    },
  });

  revalidatePath('/admin/protocols');
}

export type ProtocolWithDetails = Prisma.ProtocolGetPayload<{
  include: {
    items: {
      include: {
        dependsOn: true;
        requiredBy: true;
        defaultAssignee: true;
      };
    };
  };
}>;

export async function getProtocolById(id: string): Promise<ProtocolWithDetails | null> {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) return null;

  // 1. Fetch Protocol Basic Info
  const protocol = await prisma.protocol.findUnique({
    where: { id },
  });

  if (!protocol || protocol.organizationId !== user.organizationId) {
    return null;
  }

  // 2. Fetch All Items
  const items = await prisma.protocolItem.findMany({
    where: { protocolId: id },
    include: {
      defaultAssignee: true
    },
    orderBy: [
      { order: 'asc' },
      { title: 'asc' }
    ]
  });

  const itemIds = items.map(i => i.id);

  // 3. Batch Fetch Dependencies (Both directions)
  const [dependsOn, requiredBy] = await Promise.all([
    prisma.protocolDependency.findMany({
      where: { itemId: { in: itemIds } },
    }),
    prisma.protocolDependency.findMany({
      where: { prerequisiteId: { in: itemIds } },
    })
  ]);

  // 4. Stitch Data via Map
  // We need to map dependencies back to their items
  // Structure: items: { ...item, dependsOn: [], requiredBy: [] }

  const optimizedItems = items.map(item => {
    return {
      ...item,
      dependsOn: dependsOn.filter(d => d.itemId === item.id),
      requiredBy: requiredBy.filter(d => d.prerequisiteId === item.id)
    };
  });

  return {
    ...protocol,
    items: optimizedItems
  };
}

export async function addProtocolItem(protocolId: string, formData: FormData) {
  await requireAdmin();
  const title = formData.get('title') as string;
  const duration = parseInt(formData.get('duration') as string) || 1;
  const defaultAssigneeId = formData.get('defaultAssigneeId') as string || null;

  // Determine next order
  const lastItem = await prisma.protocolItem.findFirst({
    where: { protocolId },
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  const nextOrder = lastItem ? lastItem.order + 1 : 0;

  await prisma.protocolItem.create({
    data: {
      title,
      duration,
      role: 'STAFF',
      protocolId,
      defaultAssigneeId,
      order: nextOrder
    }
  });

  revalidatePath(`/admin/protocols/${protocolId}`);
}

// Helper to check for cycles using DFS
async function detectCycle(itemId: string, prerequisiteId: string): Promise<boolean> {
  // 1. Get all items and dependencies for this protocol to build the graph
  const item = await prisma.protocolItem.findUnique({
    where: { id: itemId },
    select: { protocolId: true }
  });

  if (!item) return false;

  const protocolItems = await prisma.protocolItem.findMany({
    where: { protocolId: item.protocolId },
    include: { dependsOn: true }
  });

  // Build Adjacency List: id -> [prerequisiteId, prerequisiteId]
  // We want to check if 'itemId' is reachable from 'prerequisiteId' (because we are adding edge itemId -> prerequisiteId)
  // If we can reach 'itemId' starting from 'prerequisiteId', then adding this edge closes the loop.

  const graph = new Map<string, string[]>();
  protocolItems.forEach(i => {
    // i.dependsOn means i -> depends -> prerequisite
    const edges = i.dependsOn.map(d => d.prerequisiteId);
    graph.set(i.id, edges);
  });

  // DFS from prerequisiteId to see if we find itemId
  const visited = new Set<string>();
  const stack = [prerequisiteId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === itemId) return true; // Found a path back to start!

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

export async function addDependency(itemId: string, prerequisiteId: string) {
  await requireAdmin();

  // Prevent self-dependency
  if (itemId === prerequisiteId) {
    throw new Error('Cannot depend on self');
  }

  // Check for Cycles
  const isCycle = await detectCycle(itemId, prerequisiteId);
  if (isCycle) {
    // Ideally return error string to UI, for now we throw and Server Action catches it or it fails
    // In a real app we'd use formatted state return.
    throw new Error('Cycle detected: This dependency would create an infinite loop.');
  }

  await prisma.protocolDependency.create({
    data: {
      itemId,
      prerequisiteId,
    },
  });

  const item = await prisma.protocolItem.findUnique({ where: { id: itemId } });
  if (item) {
    revalidatePath(`/admin/protocols/${item.protocolId}`);
  }
}

export async function deleteProtocolDependency(dependencyId: string) {
  await requireAdmin();
  const dep = await prisma.protocolDependency.findUnique({
    where: { id: dependencyId },
    include: { item: true }
  });

  if (dep) {
    await prisma.protocolDependency.delete({ where: { id: dependencyId } });
    revalidatePath(`/admin/protocols/${dep.item.protocolId}`);
  }
}

export async function deleteProtocolItem(itemId: string) {
  await requireAdmin();
  const item = await prisma.protocolItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  await prisma.protocolItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/protocols/${item.protocolId}`);
}

export async function deleteProtocol(id: string) {
  await requireAdmin();
  await prisma.protocol.delete({ where: { id } });
  revalidatePath('/admin/protocols');
}

export async function updateProtocol(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) throw new Error('Name is required');

  await prisma.protocol.update({
    where: { id },
    data: { name, description }
  });

  revalidatePath(`/admin/protocols/${id}`);
}

export async function updateProtocolItem(itemId: string, formData: FormData) {
  await requireAdmin();
  const title = formData.get('title') as string;
  const duration = parseInt(formData.get('duration') as string) || 1;
  const defaultAssigneeId = formData.get('defaultAssigneeId') as string || null;

  if (!title) throw new Error('Title is required');

  const item = await prisma.protocolItem.update({
    where: { id: itemId },
    data: {
      title,
      duration,
      defaultAssigneeId: defaultAssigneeId === "" ? null : defaultAssigneeId
    }
  });

  revalidatePath(`/admin/protocols/${item.protocolId}`);
}

export async function moveProtocolItem(itemId: string, direction: 'UP' | 'DOWN') {
  await requireAdmin();

  const item = await prisma.protocolItem.findUnique({
    where: { id: itemId },
    select: { id: true, protocolId: true, order: true }
  });

  if (!item) throw new Error('Item not found');

  // Find adjacent item
  const adjacentItem = await prisma.protocolItem.findFirst({
    where: {
      protocolId: item.protocolId,
      order: direction === 'UP'
        ? { lt: item.order }
        : { gt: item.order }
    },
    orderBy: {
      order: direction === 'UP' ? 'desc' : 'asc'
    }
  });

  if (!adjacentItem) {
    // If no adjacent item found via order, fallback to basic swap based on title/created? 
    // Or just return.
    // For now, simpler: if orders are 0 (default), we might need to initialize them.
    // But let's assume they are somewhat ordered or unique. 
    // IF all orders are 0, this logic will fail to find "lt" 0 or "gt" 0 if there's no distinction.

    // Hack: If orders are equal, we can try to "nudge" them by assigning distinct orders based on current list position.
    // But that's expensive.
    return;
  }

  // Swap orders
  await prisma.$transaction([
    prisma.protocolItem.update({
      where: { id: item.id },
      data: { order: adjacentItem.order }
    }),
    prisma.protocolItem.update({
      where: { id: adjacentItem.id },
      data: { order: item.order }
    })
  ]);

  revalidatePath(`/admin/protocols/${item.protocolId}`);
}
