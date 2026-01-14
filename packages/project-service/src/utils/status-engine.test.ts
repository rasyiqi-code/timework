import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCompletionCascades, calculateReversionCascades, type DependentItem, type DependencyWithPrerequisite } from './status-engine';

describe('Status Engine', () => {
    describe('calculateCompletionCascades (Unlock Logic)', () => {
        it('should unlock child when single prerequisite finishes', () => {
            const completedId = 'A';
            const child = { id: 'B', status: 'LOCKED' };

            // Dependence: B -> A
            const dependents = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'DONE' }
            }];

            const allPrereqs = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'DONE' }
            }];

            const updates = calculateCompletionCascades(
                completedId,
                dependents as unknown as DependentItem[],
                allPrereqs as unknown as DependencyWithPrerequisite[]
            );

            assert.strictEqual(updates.length, 1);
            assert.strictEqual(updates[0].id, 'B');
            assert.strictEqual(updates[0].status, 'OPEN');
        });

        it('should NOT unlock if another prerequisite is pending', () => {
            const completedId = 'A';
            const child = { id: 'C', status: 'LOCKED' };

            // Dependence: C -> A, C -> B (B is pending)
            const dependents = [{
                id: 'dep1', itemId: 'C', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'DONE' }
            }];

            const allPrereqs = [
                { id: 'dep1', itemId: 'C', prerequisiteId: 'A', prerequisite: { status: 'DONE' } },
                { id: 'dep2', itemId: 'C', prerequisiteId: 'B', prerequisite: { status: 'OPEN' } }
            ];

            const updates = calculateCompletionCascades(
                completedId,
                dependents as unknown as DependentItem[],
                allPrereqs as unknown as DependencyWithPrerequisite[]
            );

            assert.strictEqual(updates.length, 0);
        });

        it('should unlock only when ALL prerequisites are DONE', () => {
            const completedId = 'B'; // A was already done, now B finishes
            const child = { id: 'C', status: 'LOCKED' };

            const dependents = [{
                id: 'dep2', itemId: 'C', prerequisiteId: 'B',
                item: child, prerequisite: { status: 'DONE' }
            }];

            const allPrereqs = [
                { id: 'dep1', itemId: 'C', prerequisiteId: 'A', prerequisite: { status: 'DONE' } },
                { id: 'dep2', itemId: 'C', prerequisiteId: 'B', prerequisite: { status: 'DONE' } }
            ];

            const updates = calculateCompletionCascades(
                completedId,
                dependents as unknown as DependentItem[],
                allPrereqs as unknown as DependencyWithPrerequisite[]
            );

            assert.strictEqual(updates.length, 1);
            assert.strictEqual(updates[0].id, 'C');
        });

        it('should NOT reset if child already OPEN or DONE', () => {
            const completedId = 'A';
            const child = { id: 'B', status: 'IN_PROGRESS' }; // User already started it forcefully

            const dependents = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'DONE' }
            }];
            const allPrereqs = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A', prerequisite: { status: 'DONE' }
            }];

            const updates = calculateCompletionCascades(
                completedId,
                dependents as unknown as DependentItem[],
                allPrereqs as unknown as DependencyWithPrerequisite[]
            );

            assert.strictEqual(updates.length, 0); // Should respect current status
        });
    });

    describe('calculateReversionCascades (Lock Logic)', () => {
        it('should LOCK dependent if parent reverts', () => {
            const revertedId = 'A';
            const child = { id: 'B', status: 'OPEN' }; // Was open, now must lock

            const dependents = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'OPEN' }
            }];

            const updates = calculateReversionCascades(revertedId, dependents as unknown as DependentItem[]);

            assert.strictEqual(updates.length, 1);
            assert.strictEqual(updates[0].id, 'B');
            assert.strictEqual(updates[0].status, 'LOCKED');
        });

        it('should NOT lock if dependent is DONE', () => {
            const revertedId = 'A';
            const child = { id: 'B', status: 'DONE' }; // Child already finished

            const dependents = [{
                id: 'dep1', itemId: 'B', prerequisiteId: 'A',
                item: child, prerequisite: { status: 'OPEN' }
            }];

            const updates = calculateReversionCascades(revertedId, dependents as unknown as DependentItem[]);

            assert.strictEqual(updates.length, 0); // Checkpoint logic: Don't lock finished work
        });
    });
});
