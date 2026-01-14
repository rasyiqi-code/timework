import { ItemDependency } from '@repo/database';

export type DependencyWithPrerequisite = ItemDependency & {
    prerequisite: { status: string };
};

export type ItemWithStatus = {
    id: string;
    status: string;
};

export type DependentItem = ItemDependency & {
    item: ItemWithStatus;
};

/**
 * Calculates cascading status updates when an item completes.
 * Returns a list of Item IDs and their new status (OPEN).
 */
export function calculateCompletionCascades(
    completedItemId: string,
    dependents: DependentItem[],
    allPrerequisites: DependencyWithPrerequisite[]
): { id: string; status: 'OPEN' }[] {
    const updates: { id: string; status: 'OPEN' }[] = [];

    for (const dep of dependents) {
        const childItem = dep.item;

        // Find all prerequisites for this child
        const childPrereqs = allPrerequisites.filter(p => p.itemId === childItem.id);

        // Check if ALL prerequisites are now DONE
        // Note: The 'completedItemId' is one of them, and we assume it IS 'DONE' effectively,
        // even if the passed data isn't updated yet (though usually it is).
        // Safest is to check strictly status='DONE' in the list.
        const allDone = childPrereqs.every(p => p.prerequisite.status === 'DONE');

        if (allDone) {
            // Only update if it's currently LOCKED (or technically anything usually, but let's stick to logic)
            // Existing logic was: just set to OPEN.
            // But we should probably avoid resetting if it's already OPEN or DONE?
            // Original code: if (allDone) updates.push({ ... status: 'OPEN' })
            // We'll mimic strict 'unlocking' behavior.

            if (childItem.status === 'LOCKED') {
                updates.push({ id: childItem.id, status: 'OPEN' });
            }
        }
    }
    return updates;
}

/**
 * Calculates cascading locks when an item is REVERTED from DONE.
 * Returns a list of Item IDs and their new status (LOCKED).
 */
export function calculateReversionCascades(
    revertedItemId: string,
    dependents: DependentItem[]
): { id: string; status: 'LOCKED' }[] {
    const updates: { id: string; status: 'LOCKED' }[] = [];

    for (const dep of dependents) {
        const childItem = dep.item;

        // If an item is reverted, its children must be LOCKED,
        // unless they are already DONE (don't lock finished work?) or LOCKED.
        // Original Logic: if (status !== 'DONE' && status !== 'LOCKED') -> LOCK IT.

        if (childItem.status !== 'DONE' && childItem.status !== 'LOCKED') {
            updates.push({ id: childItem.id, status: 'LOCKED' });
        }
    }
    return updates;
}
