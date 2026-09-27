const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildJevRequest,
    containsTargetVerbForm,
    evaluateJevResponse,
    feedbackForDecision
} = require('../jev-evaluator.js');

const step = {
    name: 'Prediction',
    prompt: 'Use Futur I (werden + haben).',
    acceptanceCriteria: 'A finite form of werden is used with the infinitive haben.',
    hint: 'Use: ich werde ... haben.',
    example: 'Ich werde morgen einen Apfel haben.'
};

function response({
    ruleScore = 2.7,
    ruleConfidence = 0.85,
    languageScore = 2.5,
    languageConfidence = 0.8,
    relevance = 0.92
} = {}) {
    return {
        model: 'jev-test',
        answers: {
            rule_adherence: {
                type: 'score',
                score: ruleScore,
                confidence: ruleConfidence
            },
            language_quality: {
                type: 'score',
                score: languageScore,
                confidence: languageConfidence
            },
            is_relevant_attempt: {
                type: 'noul',
                noul: relevance
            }
        }
    };
}

test('buildJevRequest separates state from three focused questions', () => {
    const request = buildJevRequest({
        model: 'jev-latest',
        startSentence: 'Ich habe einen Apfel.',
        targetVerb: 'haben',
        step,
        userAttempt: 'Ich werde morgen einen Apfel haben.'
    });

    assert.equal(request.model, 'jev-latest');
    assert.equal(request.state.exercise.required_construction, step.acceptanceCriteria);
    assert.equal(request.state.learner_attempt, 'Ich werde morgen einen Apfel haben.');
    assert.deepEqual(Object.keys(request.questions), [
        'rule_adherence',
        'language_quality',
        'is_relevant_attempt'
    ]);
    assert.equal(request.questions.rule_adherence.type, 'score');
    assert.equal(request.questions.language_quality.type, 'score');
    assert.equal(request.questions.is_relevant_attempt.type, 'noul');
});

test('target verb validation uses complete words instead of substrings', () => {
    const forms = ['habe', 'hast', 'hat', 'haben', 'gehabt'];

    assert.equal(containsTargetVerbForm('Ich werde einen Apfel haben.', forms), true);
    assert.equal(containsTargetVerbForm('Er hat einen Apfel.', forms), true);
    assert.equal(containsTargetVerbForm('Der Schatten ist lang.', forms), false);
    assert.equal(containsTargetVerbForm('Das ist überhaupt nicht relevant.', forms), false);
});

test('strong scores produce an accepted decision', () => {
    const result = evaluateJevResponse(response());

    assert.equal(result.status, 'accepted');
    assert.equal(result.isAccepted, true);
    assert.ok(result.compositeScore > 0.8);
    assert.ok(result.decisionCertainty > 0.7);
    assert.equal(result.model, 'jev-test');
});

test('a clear rule failure is rejected with rule-focused feedback', () => {
    const result = evaluateJevResponse(response({
        ruleScore: 0.8,
        ruleConfidence: 0.9,
        languageScore: 2.8,
        languageConfidence: 0.9,
        relevance: 0.9
    }));

    assert.equal(result.status, 'rejected');
    assert.equal(result.weakestDimension, 'rule');
    assert.match(feedbackForDecision(result, step), /requested construction/i);
    assert.match(feedbackForDecision(result, step), /werde/i);
});

test('a recognizable construction with a material rule error does not advance', () => {
    const result = evaluateJevResponse(response({
        ruleScore: 2.01,
        ruleConfidence: 0.84,
        languageScore: 2.01,
        languageConfidence: 0.84,
        relevance: 0.92
    }));

    assert.equal(result.isAccepted, false);
    assert.equal(result.status, 'uncertain');
    assert.equal(result.weakestDimension, 'rule');
    assert.match(feedbackForDecision(result, step), /requested construction/i);
});

test('an unrelated answer is rejected before a high grammar score can pass it', () => {
    const result = evaluateJevResponse(response({
        ruleScore: 2.8,
        languageScore: 2.8,
        relevance: 0.12
    }));

    assert.equal(result.status, 'rejected');
    assert.equal(result.weakestDimension, 'relevance');
});

test('ambiguous probabilities stay on the current step as uncertain', () => {
    const result = evaluateJevResponse(response({
        ruleScore: 2.2,
        ruleConfidence: 0.15,
        languageScore: 2.1,
        languageConfidence: 0.2,
        relevance: 0.62
    }));

    assert.equal(result.status, 'uncertain');
    assert.equal(result.isAccepted, false);
    assert.match(feedbackForDecision(result, step), /uncertain|directly/i);
});

test('malformed Jev data fails closed', () => {
    assert.throws(
        () => evaluateJevResponse({ answers: {} }),
        /rule_adherence/
    );

    assert.throws(
        () => evaluateJevResponse(response({ relevance: 1.4 })),
        /invalid number/
    );
});
