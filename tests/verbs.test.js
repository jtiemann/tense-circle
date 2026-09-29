const test = require('node:test');
const assert = require('node:assert/strict');
const Verbs = require('../verbs.js');

const { VERB_PRESETS, buildSteps, getAllVerbForms, getConjugation } = Verbs;

test('offers all 51 preset verbs, each with three starting sentences', () => {
    assert.equal(VERB_PRESETS.length, 51);
    assert.equal(new Set(VERB_PRESETS.map(preset => preset.verb)).size, 51);
    for (const preset of VERB_PRESETS) {
        assert.equal(preset.sentences.length, 3, preset.verb);
        assert.ok(preset.label.startsWith(`${preset.verb} (`), preset.verb);
    }
});

test('every preset verb builds eleven complete steps', () => {
    for (const { verb } of VERB_PRESETS) {
        const steps = buildSteps(getConjugation(verb));
        assert.equal(steps.length, 11, verb);
        for (const step of steps) {
            for (const key of ['name', 'prompt', 'voicePrompt', 'acceptanceCriteria', 'hint', 'example', 'theme', 'color']) {
                assert.ok(step[key], `${verb} / ${step.name} is missing ${key}`);
            }
            assert.ok(!/undefined|NaN/.test(JSON.stringify(step)), `${verb} / ${step.name}`);
        }
    }
});

test('every generated example contains a form the local check accepts', () => {
    const { containsTargetVerbForm } = require('../jev-evaluator.js');
    for (const { verb } of VERB_PRESETS) {
        const conjugation = getConjugation(verb);
        const forms = getAllVerbForms(conjugation);
        for (const step of buildSteps(conjugation)) {
            assert.ok(containsTargetVerbForm(step.example, forms), `${verb}: "${step.example}"`);
        }
    }
});

test('every preset starting sentence contains a form of its verb', () => {
    const { containsTargetVerbForm } = require('../jev-evaluator.js');
    for (const { verb, sentences } of VERB_PRESETS) {
        const forms = getAllVerbForms(getConjugation(verb));
        for (const sentence of sentences) {
            assert.ok(containsTargetVerbForm(sentence, forms), `${verb}: "${sentence}"`);
        }
    }
});

test('separable verbs split in main clauses and rejoin in subordinate clauses', () => {
    const steps = Object.fromEntries(buildSteps(getConjugation('aufstehen')).map(step => [step.name, step]));
    assert.equal(steps['Simple Past'].example, 'Er stand gestern auf.');
    assert.equal(steps['Subordinate Clause: dass'].example, 'Ich weiß, dass er morgen aufsteht.');
    assert.equal(steps.Perfect.example, 'Er ist gestern aufgestanden.');
});
