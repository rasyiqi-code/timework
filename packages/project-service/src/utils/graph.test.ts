import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectCycle } from './graph';

describe('detectCycle', () => {
    it('should return false for empty graph', () => {
        const nodes = new Map();
        assert.strictEqual(detectCycle(nodes, 'A', 'B'), false);
    });

    it('should return false for linear graph (A -> B -> C)', () => {
        const nodes = new Map([
            ['A', []],
            ['B', ['A']],
            ['C', ['B']],
        ]);
        // Adding C->D
        assert.strictEqual(detectCycle(nodes, 'D', 'C'), false);
    });

    it('should detect simple cycle (A -> B -> A)', () => {
        const nodes = new Map([
            ['A', ['B']],
            ['B', []],
        ]);
        // Try to add B -> A (creates loop)
        assert.strictEqual(detectCycle(nodes, 'B', 'A'), true);
    });

    it('should detect indirect cycle', () => {
        // A -> B -> C -> D
        const nodes = new Map([
            ['A', []],
            ['B', ['A']],
            ['C', ['B']],
            ['D', ['C']],
        ]);
        // Try to add A -> D (Cycle: D -> C -> B -> A -> D)
        assert.strictEqual(detectCycle(nodes, 'A', 'D'), true);
    });

    it('should detect complex branching cycle', () => {
        // A -> B -> D
        // A -> C -> D
        const nodes = new Map([
            ['A', []],
            ['B', ['A']],
            ['C', ['A']],
            ['D', ['B', 'C']],
        ]);
        // Try to add A -> D (Cycle: A -> D -> B -> A)
        assert.strictEqual(detectCycle(nodes, 'A', 'D'), true);
    });
});
