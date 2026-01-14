import { PrismaClient } from '@repo/database';

/**
 * Pure function to detect cycle in a graph.
 * Returns true if adding the edge (from -> to) would create a cycle.
 */
export function detectCycle(graph: Map<string, string[]>, from: string, to: string): boolean {
    const visited = new Set<string>();
    const stack = [to];

    while (stack.length > 0) {
        const current = stack.pop()!;
        if (current === from) return true;

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
 * Fetches dependency graph for a project context
 */
export async function buildDependencyGraph(prisma: PrismaClient, projectId: string): Promise<Map<string, string[]>> {
    const projectItems = await prisma.projectItem.findMany({
        where: { projectId },
        select: {
            id: true,
            dependsOn: {
                select: { prerequisiteId: true }
            }
        }
    });

    const graph = new Map<string, string[]>();
    projectItems.forEach(i => {
        const edges = i.dependsOn.map(d => d.prerequisiteId);
        graph.set(i.id, edges);
    });

    return graph;
}
