(function attachStepOrder(root, factory) {
    const stepOrder = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = stepOrder;
    }

    root.StepOrder = stepOrder;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createStepOrder() {
    'use strict';

    const MODES = Object.freeze({
        SEQUENTIAL: 'sequential',
        RANDOM: 'random'
    });

    function isMode(value) {
        return Object.values(MODES).includes(value);
    }

    function remainingSteps(total, completed) {
        return Array.from({ length: total }, (_, index) => index)
            .filter(index => !completed.has(index));
    }

    // Picks the next step to practice. Sequential order continues from the
    // current step, wrapping past the end to any step still unfinished; random
    // order draws from the unfinished steps. Returns null once every step is done.
    function pickNextStep({ mode, current, completed, total, random = Math.random }) {
        const remaining = remainingSteps(total, completed);
        if (remaining.length === 0) return null;

        if (mode === MODES.RANDOM) {
            return remaining[Math.min(Math.floor(random() * remaining.length), remaining.length - 1)];
        }

        const ahead = remaining.find(index => index > current);
        return ahead === undefined ? remaining[0] : ahead;
    }

    // The step a fresh circle starts on.
    function pickFirstStep({ mode, total, random = Math.random }) {
        return pickNextStep({ mode, current: -1, completed: new Set(), total, random });
    }

    return Object.freeze({ MODES, isMode, pickFirstStep, pickNextStep });
}));
