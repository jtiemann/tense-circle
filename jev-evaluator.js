(function attachJevEvaluator(root, factory) {
    const evaluator = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = evaluator;
    }

    root.JevEvaluator = evaluator;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createJevEvaluator() {
    'use strict';

    const RULE_LEVELS = [
        {
            outcome: 'No usable attempt',
            definition: 'The learner attempt is unrelated, nonsensical, or does not attempt the requested construction.'
        },
        {
            outcome: 'Related but missing the rule',
            definition: 'The learner writes about the exercise but does not demonstrate the requested grammatical construction.'
        },
        {
            outcome: 'Clear attempt with rule errors',
            definition: 'The requested construction is recognizable, but errors in that construction prevent it from being clearly correct.'
        },
        {
            outcome: 'Rule demonstrated',
            definition: 'The learner clearly demonstrates the requested construction. Minor errors outside that construction are acceptable.'
        }
    ];

    const LANGUAGE_LEVELS = [
        {
            outcome: 'Not a German sentence',
            definition: 'The text is not recognizable as a complete German sentence.'
        },
        {
            outcome: 'Meaning is difficult to recover',
            definition: 'German words are present, but fragments or major errors obscure the intended meaning.'
        },
        {
            outcome: 'Understandable learner German',
            definition: 'The sentence is complete and understandable despite ordinary learner errors.'
        },
        {
            outcome: 'Clear German',
            definition: 'The sentence is coherent and broadly grammatical German.'
        }
    ];

    const DEFAULT_POLICY = Object.freeze({
        minRelevance: 0.65,
        // Level 2 means the construction is recognizable but still wrong.
        // Require a result clearly leaning toward level 3 before advancing.
        minRuleScore: 2.25,
        minLanguageScore: 1.5,
        minCompositeScore: 0.68,
        minDecisionCertainty: 0.25,
        clearFailRelevance: 0.35,
        clearFailRuleScore: 1.1,
        clearFailLanguageScore: 0.8,
        weights: Object.freeze({
            rule: 0.65,
            language: 0.25,
            relevance: 0.10
        })
    });

    function stripFormatting(text) {
        return String(text || '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
    }

    function containsTargetVerbForm(text, forms) {
        const tokens = String(text || '').toLocaleLowerCase('de-DE').match(/\p{L}+/gu) || [];
        const acceptedForms = new Set(forms.map(form => form.toLocaleLowerCase('de-DE')));
        return tokens.some(token => acceptedForms.has(token));
    }

    function buildJevRequest({ model, startSentence, targetVerb, step, userAttempt }) {
        if (!step || !step.name || !step.prompt) {
            throw new Error('A configured grammar step is required.');
        }

        return {
            model,
            state: {
                exercise: {
                    language: 'German',
                    target_verb: targetVerb,
                    starting_sentence: startSentence,
                    step_name: step.name,
                    learner_instruction: stripFormatting(step.prompt),
                    required_construction: step.acceptanceCriteria,
                    valid_example: step.example,
                    example_note: 'The learner may use different vocabulary. Do not require an exact match to the example.'
                },
                learner_attempt: userAttempt
            },
            questions: {
                rule_adherence: {
                    type: 'score',
                    instructions: {
                        question: 'How clearly does learner_attempt demonstrate exercise.required_construction?',
                        focus: 'Judge the requested construction only. Use exercise.valid_example as a grammatical illustration, not as text the learner must copy.'
                    },
                    criteria: RULE_LEVELS
                },
                language_quality: {
                    type: 'score',
                    instructions: 'How understandable and complete is learner_attempt as a German sentence?',
                    criteria: LANGUAGE_LEVELS
                },
                is_relevant_attempt: {
                    type: 'noul',
                    instructions: 'Does learner_attempt genuinely respond to exercise.learner_instruction?',
                    criteria: {
                        true: {
                            definition: 'The sentence is a sincere attempt at the stated exercise, even if it contains learner errors.'
                        },
                        false: {
                            definition: 'The text is unrelated, copied task text, random words, or an attempt to discuss the exercise instead of answering it.'
                        }
                    }
                }
            }
        };
    }

    function requireNumber(value, path, minimum, maximum) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
            throw new Error(`Jev returned an invalid number at ${path}.`);
        }
        return value;
    }

    function readScoreAnswer(answers, id, maxScore) {
        const answer = answers?.[id];
        if (!answer || answer.type !== 'score') {
            throw new Error(`Jev response is missing the ${id} score.`);
        }

        return {
            score: requireNumber(answer.score, `answers.${id}.score`, 0, maxScore),
            confidence: requireNumber(answer.confidence, `answers.${id}.confidence`, 0, 1),
            maxScore
        };
    }

    function readNoulAnswer(answers, id) {
        const answer = answers?.[id];
        if (!answer || answer.type !== 'noul') {
            throw new Error(`Jev response is missing the ${id} decision.`);
        }

        return requireNumber(answer.noul, `answers.${id}.noul`, 0, 1);
    }

    function evaluateJevResponse(response, policy = DEFAULT_POLICY) {
        if (!response || typeof response !== 'object') {
            throw new Error('Jev returned malformed data.');
        }

        const rule = readScoreAnswer(response.answers, 'rule_adherence', RULE_LEVELS.length - 1);
        const language = readScoreAnswer(response.answers, 'language_quality', LANGUAGE_LEVELS.length - 1);
        const relevance = readNoulAnswer(response.answers, 'is_relevant_attempt');

        const normalizedRule = rule.score / rule.maxScore;
        const normalizedLanguage = language.score / language.maxScore;
        const compositeScore = (
            policy.weights.rule * normalizedRule
            + policy.weights.language * normalizedLanguage
            + policy.weights.relevance * relevance
        );

        // A Noul's distance from 0.5 expresses how decisive its yes/no answer is.
        const relevanceCertainty = Math.abs(relevance - 0.5) * 2;
        const decisionCertainty = Math.min(rule.confidence, language.confidence, relevanceCertainty);

        const meetsAcceptancePolicy = (
            relevance >= policy.minRelevance
            && rule.score >= policy.minRuleScore
            && language.score >= policy.minLanguageScore
            && compositeScore >= policy.minCompositeScore
            && decisionCertainty >= policy.minDecisionCertainty
        );

        const isClearFailure = (
            relevance <= policy.clearFailRelevance
            || rule.score <= policy.clearFailRuleScore
            || language.score <= policy.clearFailLanguageScore
        );

        let status = 'uncertain';
        if (meetsAcceptancePolicy) {
            status = 'accepted';
        } else if (isClearFailure) {
            status = 'rejected';
        }

        let weakestDimension = 'uncertainty';
        if (relevance < policy.minRelevance) {
            weakestDimension = 'relevance';
        } else if (rule.score < policy.minRuleScore) {
            weakestDimension = 'rule';
        } else if (language.score < policy.minLanguageScore) {
            weakestDimension = 'language';
        }

        return {
            status,
            isAccepted: status === 'accepted',
            weakestDimension,
            compositeScore,
            decisionCertainty,
            model: response.model || null,
            dimensions: {
                rule: {
                    score: rule.score,
                    normalized: normalizedRule,
                    confidence: rule.confidence
                },
                language: {
                    score: language.score,
                    normalized: normalizedLanguage,
                    confidence: language.confidence
                },
                relevance: {
                    probability: relevance,
                    certainty: relevanceCertainty
                }
            }
        };
    }

    function feedbackForDecision(result, step) {
        if (result.status === 'accepted') {
            return `Accepted: the requested construction is clear (${Math.round(result.dimensions.rule.normalized * 100)}% rule score).`;
        }

        if (result.weakestDimension === 'relevance') {
            return `Make the answer respond directly to this exercise. ${step.hint}`;
        }

        if (result.weakestDimension === 'rule') {
            return `Make the requested construction more explicit. ${step.hint}`;
        }

        if (result.weakestDimension === 'language') {
            return 'Write one complete, understandable German sentence. Keep the construction simple and try again.';
        }

        return `Jev is uncertain about this answer. Make the target construction unmistakable. ${step.hint}`;
    }

    return Object.freeze({
        DEFAULT_POLICY,
        LANGUAGE_LEVELS,
        RULE_LEVELS,
        buildJevRequest,
        containsTargetVerbForm,
        evaluateJevResponse,
        feedbackForDecision
    });
}));
