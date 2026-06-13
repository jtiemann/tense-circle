/**
 * Unit tests for the pure conjugation / parsing / model-answer logic in app.js.
 * Run with:  node --test
 *
 * These focus on the sentence parser + model-answer generator, which previously
 * produced grammatically broken output for multi-word subjects and separable verbs.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    getConjugation,
    parseStartingSentence,
    buildModelAnswer,
    validateStep,
    VERB_PRESETS,
    NUM_STEPS,
} = require('./app.js');

// --- Conjugation engine sanity ---

test('getConjugation: irregular verb', () => {
    const c = getConjugation('fahren');
    assert.equal(c.praeteritum.er, 'fuhr');
    assert.equal(c.partizipII, 'gefahren');
    assert.equal(c.hilfsverb, 'sein');
});

test('getConjugation: regular fallback', () => {
    const c = getConjugation('kaufen');
    assert.equal(c.praesens.ich, 'kaufe');
    assert.equal(c.praeteritum.er, 'kaufte');
    assert.equal(c.partizipII, 'gekauft');
});

test('getConjugation: separable verb is detected and split', () => {
    const c = getConjugation('aufmachen');
    assert.equal(c.isSeparable, true);
    assert.equal(c.prefix, 'auf');
    assert.equal(c.partizipII, 'aufgemacht');
});

// --- Parser: the previously-broken cases ---

test('parse: multi-word noun subject keeps verb out of the payload', () => {
    const c = getConjugation('fallen');
    const { subject, conKey, payload } = parseStartingSentence('Der Apfel fällt vom Baum.', c);
    assert.equal(subject, 'Der Apfel');
    assert.equal(conKey, 'er');
    assert.equal(payload, 'vom Baum'); // "fällt" must NOT leak into the payload
});

test('parse: plural noun subject is inferred as 3rd-person plural', () => {
    const c = getConjugation('lernen');
    const { subject, conKey } = parseStartingSentence('Die Kinder lernen schnell neue Sprachen.', c);
    assert.equal(subject, 'Die Kinder');
    assert.equal(conKey, 'sie');
});

test('parse: separable prefix is stripped from the payload', () => {
    const c = getConjugation('aufmachen');
    const { subject, conKey, payload } = parseStartingSentence('Ich mache die Tür auf.', c);
    assert.equal(subject, 'Ich');
    assert.equal(conKey, 'ich');
    assert.equal(payload, 'die Tür'); // trailing "auf" prefix removed
});

test('parse: simple pronoun subject', () => {
    const c = getConjugation('lernen');
    const { subject, conKey, payload } = parseStartingSentence('Ich lerne Deutsch jeden Tag.', c);
    assert.equal(subject, 'Ich');
    assert.equal(conKey, 'ich');
    assert.equal(payload, 'Deutsch jeden Tag');
});

// --- Model answers: exact expected output for the fixed cases ---

const cases = [
    ['fallen',    'Der Apfel fällt vom Baum.',                 0, 'Der Apfel wird vom Baum fallen.'],
    ['fallen',    'Der Apfel fällt vom Baum.',                 3, 'Der Apfel fiel vom Baum.'],
    ['fallen',    'Der Apfel fällt vom Baum.',                 5, 'Der Apfel ist vom Baum gefallen.'],
    ['lernen',    'Die Kinder lernen schnell neue Sprachen.',  0, 'Die Kinder werden schnell neue Sprachen lernen.'],
    ['aufmachen', 'Ich mache die Tür auf.',                    0, 'Ich werde die Tür aufmachen.'],
    ['aufmachen', 'Ich mache die Tür auf.',                    3, 'Ich machte die Tür auf.'],
    ['aufmachen', 'Ich mache die Tür auf.',                    5, 'Ich habe die Tür aufgemacht.'],
    ['sein',      'Das Wetter ist heute wunderbar.',           0, 'Das Wetter wird heute wunderbar sein.'],
    ['lernen',    'Ich lerne Deutsch jeden Tag.',              0, 'Ich werde Deutsch jeden Tag lernen.'],
];

for (const [verb, sentence, step, expected] of cases) {
    test(`model answer: ${verb} / step ${step}`, () => {
        const c = getConjugation(verb);
        assert.equal(buildModelAnswer(step, sentence, c), expected);
    });
}

// --- Regression sweep: every preset, every step, must produce clean output ---

test('all presets produce clean model answers for every step', () => {
    for (const preset of VERB_PRESETS) {
        const c = getConjugation(preset.verb);
        for (const sentence of preset.sentences) {
            for (let step = 0; step < NUM_STEPS; step++) {
                const ans = buildModelAnswer(step, sentence, c);
                assert.ok(ans && ans.length > 0, `empty answer: ${preset.verb} step ${step}`);
                assert.ok(!ans.includes('undefined'), `"undefined" in: ${preset.verb} step ${step} → ${ans}`);
                // Separable prefix should never be left dangling before the bare base infinitive
                if (c.isSeparable) {
                    assert.ok(!ans.includes(` ${c.prefix} ${c.baseVerb}`),
                        `split separable verb in: ${preset.verb} step ${step} → ${ans}`);
                }
            }
        }
    }
});

// --- A couple of validation sanity checks ---

test('validateStep: Futur I requires werden + infinitive at the end', () => {
    const c = getConjugation('lernen');
    assert.equal(validateStep(0, 'Ich werde Deutsch lernen.', c).valid, true);
    assert.equal(validateStep(0, 'Ich lerne Deutsch.', c).valid, false);
});

test('validateStep: dass-clause requires the verb at the end', () => {
    const c = getConjugation('lernen');
    assert.equal(validateStep(7, 'Ich weiß, dass er Deutsch lernt.', c).valid, true);
    assert.equal(validateStep(7, 'Ich weiß, dass er lernt jeden Tag Deutsch.', c).valid, false);
});

test('validateStep: Konjunktiv-II wish (step 9) requires "wenn" to distinguish it from the plain Conditional', () => {
    const c = getConjugation('lernen');
    // Plain conditional (step 4) accepts würde + infinitive without "wenn"
    assert.equal(validateStep(4, 'Ich würde Deutsch lernen.', c).valid, true);
    // The unreal-wish step (9) needs the "wenn" framing
    assert.equal(validateStep(9, 'Ich würde Deutsch lernen.', c).valid, false);
    assert.equal(validateStep(9, 'Wenn ich nur Deutsch lernen würde!', c).valid, true);
});
