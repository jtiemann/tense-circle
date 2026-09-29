const test = require('node:test');
const assert = require('node:assert/strict');
const { MODES, isMode, pickFirstStep, pickNextStep } = require('../step-order.js');

test('sequential order advances to the next step and wraps to unfinished ones', () => {
    const base = { mode: MODES.SEQUENTIAL, total: 4 };
    assert.equal(pickFirstStep(base), 0);
    assert.equal(pickNextStep({ ...base, current: 0, completed: new Set([0]) }), 1);
    assert.equal(pickNextStep({ ...base, current: 3, completed: new Set([3, 1, 2]) }), 0);
    assert.equal(pickNextStep({ ...base, current: 1, completed: new Set([0, 1, 3]) }), 2);
});

test('random order only draws unfinished steps and covers every step exactly once', () => {
    const completed = new Set();
    const seen = [];
    let current = pickFirstStep({ mode: MODES.RANDOM, total: 11 });
    while (current !== null) {
        assert.ok(!completed.has(current));
        seen.push(current);
        completed.add(current);
        current = pickNextStep({ mode: MODES.RANDOM, current, completed, total: 11 });
    }
    assert.deepEqual([...seen].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('random order handles the extremes of the random source', () => {
    const args = { mode: MODES.RANDOM, current: 0, completed: new Set([1]), total: 4 };
    assert.equal(pickNextStep({ ...args, random: () => 0 }), 0);
    assert.equal(pickNextStep({ ...args, random: () => 0.999999 }), 3);
    assert.equal(pickNextStep({ ...args, random: () => 1 }), 3);
});

test('returns null when every step is complete', () => {
    assert.equal(pickNextStep({ mode: MODES.SEQUENTIAL, current: 2, completed: new Set([0, 1, 2]), total: 3 }), null);
});

test('isMode accepts only known modes', () => {
    assert.equal(isMode('random'), true);
    assert.equal(isMode('sequential'), true);
    assert.equal(isMode('shuffle'), false);
    assert.equal(isMode(null), false);
});
