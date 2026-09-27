#!/usr/bin/env node

const {
    buildJevRequest,
    evaluateJevResponse
} = require('../jev-evaluator.js');

const API_URL = 'https://api.typesafe.ai/v1/systemone';
const API_KEY = process.env.TYPESAFE_API_KEY;
const MODEL = process.env.TYPESAFE_MODEL || 'jev-latest';

if (!API_KEY) {
    console.error('Set TYPESAFE_API_KEY before running the live calibration.');
    process.exit(2);
}

const cases = [
    {
        name: 'future-valid',
        expected: 'accepted',
        attempt: 'Ich werde morgen einen Apfel haben.',
        step: {
            name: 'Prediction',
            prompt: 'Use Futur I (werden + haben) to say that you will have the apple.',
            acceptanceCriteria: 'A finite form of werden is used with the infinitive haben to express the future.',
            hint: 'Use: ich werde ... haben.',
            example: 'Ich werde morgen einen Apfel haben.'
        }
    },
    {
        name: 'future-wrong-tense',
        expected: 'not accepted',
        attempt: 'Ich hatte gestern einen Apfel.',
        step: {
            name: 'Prediction',
            prompt: 'Use Futur I (werden + haben) to say that you will have the apple.',
            acceptanceCriteria: 'A finite form of werden is used with the infinitive haben to express the future.',
            hint: 'Use: ich werde ... haben.',
            example: 'Ich werde morgen einen Apfel haben.'
        }
    },
    {
        name: 'dass-valid',
        expected: 'accepted',
        attempt: 'Ich weiß, dass ich einen Apfel habe.',
        step: {
            name: 'Subordinate Clause: dass',
            prompt: 'Create a subordinate clause with dass and place the finite form of haben at the end.',
            acceptanceCriteria: 'A dass subordinate clause is present and its finite form of haben appears in clause-final position.',
            hint: 'Use: Ich weiß, dass ich ... habe.',
            example: 'Ich weiß, dass ich einen Apfel habe.'
        }
    },
    {
        name: 'dass-wrong-order',
        expected: 'not accepted',
        attempt: 'Ich weiß, dass ich habe einen Apfel.',
        step: {
            name: 'Subordinate Clause: dass',
            prompt: 'Create a subordinate clause with dass and place the finite form of haben at the end.',
            acceptanceCriteria: 'A dass subordinate clause is present and its finite form of haben appears in clause-final position.',
            hint: 'Use: Ich weiß, dass ich ... habe.',
            example: 'Ich weiß, dass ich einen Apfel habe.'
        }
    },
    {
        name: 'reported-speech-valid',
        expected: 'accepted',
        attempt: 'Er sagt, er habe einen Apfel.',
        step: {
            name: 'Konjunktiv I',
            prompt: 'Use Konjunktiv I habe in indirect speech.',
            acceptanceCriteria: 'The form habe reports another person\'s statement in indirect speech.',
            hint: 'Use: Er sagt, er habe ...',
            example: 'Er sagt, er habe einen Apfel.'
        }
    },
    {
        name: 'reported-speech-indicative',
        expected: 'not accepted',
        attempt: 'Er sagt, er hat einen Apfel.',
        step: {
            name: 'Konjunktiv I',
            prompt: 'Use Konjunktiv I habe in indirect speech.',
            acceptanceCriteria: 'The form habe reports another person\'s statement in indirect speech.',
            hint: 'Use: Er sagt, er habe ...',
            example: 'Er sagt, er habe einen Apfel.'
        }
    }
];

async function evaluateCase(testCase) {
    const payload = buildJevRequest({
        model: MODEL,
        startSentence: 'Ich habe einen Apfel.',
        targetVerb: 'haben',
        step: testCase.step,
        userAttempt: testCase.attempt
    });

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`${testCase.name}: Jev returned HTTP ${response.status}.`);
    }

    const evaluation = evaluateJevResponse(await response.json());
    const actual = evaluation.isAccepted ? 'accepted' : 'not accepted';

    return {
        case: testCase.name,
        expected: testCase.expected,
        actual,
        rule: `${Math.round(evaluation.dimensions.rule.normalized * 100)}%`,
        german: `${Math.round(evaluation.dimensions.language.normalized * 100)}%`,
        relevance: `${Math.round(evaluation.dimensions.relevance.probability * 100)}%`,
        certainty: `${Math.round(evaluation.decisionCertainty * 100)}%`,
        pass: actual === testCase.expected ? 'yes' : 'NO'
    };
}

(async () => {
    const results = [];

    for (const testCase of cases) {
        results.push(await evaluateCase(testCase));
    }

    console.table(results);

    const failures = results.filter(result => result.pass === 'NO');
    if (failures.length > 0) {
        console.error(`${failures.length} calibration case(s) did not match the expected decision.`);
        process.exitCode = 1;
    } else {
        console.log(`All ${results.length} live calibration cases matched.`);
    }
})().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
