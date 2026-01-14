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

import { ProtocolSchema, ProtocolItemSchema } from '@/lib/validation';

export async function createProtocol(formData: FormData) {
  const user = await requireAdmin();
  if (!user.organizationId) throw new Error('No Organization selected');

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validated = ProtocolSchema.parse(rawData);

  await prisma.protocol.create({
    data: {
      name: validated.name,
      description: validated.description,
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
        children: {
          include: {
            defaultAssignee: true
          }
        };
      };
    };
  };
}>;

export async function getProtocolById(id: string): Promise<ProtocolWithDetails | null> {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) return null;

  // 1. Fetch Protocol Basic Info
  const protocol = await prisma.protocol.findUnique({
    where: { id, organizationId: user.organizationId }, // Scope by Org
  });

  if (!protocol) {
    return null;
  }

  // 2. Fetch All Items (including subtasks via children relation)
  const items = await prisma.protocolItem.findMany({
    where: { protocolId: id },
    include: {
      defaultAssignee: true,
      children: {
        include: {
          defaultAssignee: true
        }
      }
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
  const user = await requireAdmin();

  // Verify Ownership
  const protocol = await prisma.protocol.findFirst({
    where: { id: protocolId, organizationId: user.organizationId || '' }
  });
  if (!protocol) throw new Error('Protocol not found or unauthorized');

  const rawData = {
    title: formData.get('title'),
    duration: formData.get('duration'),
    defaultAssigneeId: formData.get('defaultAssigneeId') === "" ? null : formData.get('defaultAssigneeId'),
    type: formData.get('type'),
    description: formData.get('description'),
    parentId: formData.get('parentId')
  };

  const validated = ProtocolItemSchema.parse(rawData);

  // Determine next order
  const lastItem = await prisma.protocolItem.findFirst({
    where: { protocolId },
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  const nextOrder = lastItem ? lastItem.order + 1 : 0;

  await prisma.protocolItem.create({
    data: {
      title: validated.title,
      duration: validated.duration,
      role: 'STAFF',
      protocolId,
      defaultAssigneeId: validated.defaultAssigneeId,
      order: nextOrder,
      type: validated.type,
      description: validated.description,
      parentId: validated.parentId
    }
  });

  revalidatePath(`/admin/protocols/${protocolId}`);
}

// Helper to check for cycles using DFS
async function detectCycle(itemId: string, prerequisiteId: string): Promise<boolean> {
  const item = await prisma.protocolItem.findUnique({
    where: { id: itemId },
    select: { protocolId: true }
  });

  if (!item) return false;

  const protocolItems = await prisma.protocolItem.findMany({
    where: { protocolId: item.protocolId },
    include: { dependsOn: true }
  });

  const graph = new Map<string, string[]>();
  protocolItems.forEach(i => {
    const edges = i.dependsOn.map(d => d.prerequisiteId);
    graph.set(i.id, edges);
  });

  const visited = new Set<string>();
  const stack = [prerequisiteId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === itemId) return true;

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
  const user = await requireAdmin();

  // Validate Ownership via Protocol
  const item = await prisma.protocolItem.findFirst({
    where: {
      id: itemId,
      protocol: { organizationId: user.organizationId || '' }
    }
  });
  if (!item) throw new Error('Item not found or unauthorized');

  if (itemId === prerequisiteId) {
    throw new Error('Cannot depend on self');
  }

  const isCycle = await detectCycle(itemId, prerequisiteId);
  if (isCycle) {
    throw new Error('Cycle detected: This dependency would create an infinite loop.');
  }

  await prisma.protocolDependency.create({
    data: {
      itemId,
      prerequisiteId,
    },
  });

  revalidatePath(`/admin/protocols/${item.protocolId}`);
}

export async function deleteProtocolDependency(dependencyId: string) {
  const user = await requireAdmin();
  const dep = await prisma.protocolDependency.findFirst({
    where: {
      id: dependencyId,
      item: { protocol: { organizationId: user.organizationId || '' } }
    },
    include: { item: true }
  });

  if (dep) {
    await prisma.protocolDependency.delete({ where: { id: dependencyId } });
    revalidatePath(`/admin/protocols/${dep.item.protocolId}`);
  }
}

export async function deleteProtocolItem(itemId: string) {
  const user = await requireAdmin();
  const item = await prisma.protocolItem.findFirst({
    where: {
      id: itemId,
      protocol: { organizationId: user.organizationId || '' }
    }
  });
  if (!item) return;

  await prisma.protocolItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/protocols/${item.protocolId}`);
}

export async function deleteProtocol(id: string) {
  const user = await requireAdmin();
  // Ensure protocol belongs to user's org
  const existing = await prisma.protocol.findFirst({
    where: { id, organizationId: user.organizationId || '' }
  });
  if (!existing) throw new Error('Unauthorized or not found');

  await prisma.protocol.delete({ where: { id } });
  revalidatePath('/admin/protocols');
}

export async function updateProtocol(id: string, formData: FormData) {
  const user = await requireAdmin();

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validated = ProtocolSchema.parse(rawData);

  // Validate Ownership
  const existing = await prisma.protocol.findFirst({
    where: { id, organizationId: user.organizationId || '' }
  });
  if (!existing) throw new Error('Unauthorized or not found');

  await prisma.protocol.update({
    where: { id },
    data: { name: validated.name, description: validated.description }
  });

  revalidatePath(`/admin/protocols/${id}`);
}

export async function updateProtocolItem(itemId: string, formData: FormData) {
  const user = await requireAdmin();

  const rawData = {
    title: formData.get('title'),
    duration: formData.get('duration'),
    defaultAssigneeId: formData.get('defaultAssigneeId') === "" ? null : formData.get('defaultAssigneeId'),
    type: formData.get('type'),
    description: formData.get('description'),
    parentId: formData.get('parentId') // Usually not updated here but schema has it
  };

  // We actully don't update parentId here often via FormData in basic edit, but if sent it's validated.
  const validated = ProtocolItemSchema.parse(rawData);

  // Verify Ownership
  const item = await prisma.protocolItem.findFirst({
    where: {
      id: itemId,
      protocol: { organizationId: user.organizationId || '' }
    }
  });
  if (!item) throw new Error('Item not found or unauthorized');

  await prisma.protocolItem.update({
    where: { id: itemId },
    data: {
      title: validated.title,
      duration: validated.duration,
      defaultAssigneeId: validated.defaultAssigneeId,
      description: validated.description,
      type: validated.type
    }
  });

  revalidatePath(`/admin/protocols/${item.protocolId}`);
}

export async function moveProtocolItem(itemId: string, direction: 'UP' | 'DOWN') {
  const user = await requireAdmin();

  const item = await prisma.protocolItem.findFirst({
    where: {
      id: itemId,
      protocol: { organizationId: user.organizationId || '' }
    },
    select: { id: true, protocolId: true, order: true }
  });

  if (!item) throw new Error('Item not found or unauthorized');

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

export async function reorderProtocolItems(protocolId: string, newOrderIds: string[]) {
  const user = await requireAdmin();

  // Validate Protocol Ownership
  const protocol = await prisma.protocol.findFirst({
    where: { id: protocolId, organizationId: user.organizationId || '' }
  });
  if (!protocol) throw new Error('Protocol not found or unauthorized');

  // Validate all items belong to this protocol (Implicitly checks ownership if protocol is owned)
  // Actually, for maximum security, we should check items. But checking protocol is good enough as items are scoped to protocol.
  // HOWEVER, a user could theoretically pass OrderIds from another protocol?
  // Prisma update { where: { id } } will work globally.
  // We MUST ensure the IDs in `newOrderIds` actually belong to `protocolId`.

  const count = await prisma.protocolItem.count({
    where: {
      id: { in: newOrderIds },
      protocolId: protocolId
    }
  });

  if (count !== newOrderIds.length) {
    throw new Error('Invalid Item IDs provided for reorder');
  }

  const moves = newOrderIds.map((id, index) =>
    prisma.protocolItem.update({
      where: { id },
      data: { order: index }
    })
  );

  await prisma.$transaction(moves);
  revalidatePath(`/admin/protocols/${protocolId}`);
}
