const test = require('node:test');
const assert = require('node:assert/strict');

const {
    MODES,
    Controller,
    buildPromptSegments,
    parseVoiceCommand,
    recognitionErrorMessage
} = require('../voice-controller.js');

class FakeRecognition {
    static instances = [];

    constructor() {
        FakeRecognition.instances.push(this);
    }

    start() {
        this.onstart();
    }

    stop() {
        this.onend();
    }

    abort() {}
}

test('voice commands accept concise English and German variants', () => {
    assert.equal(parseVoiceCommand('Check answer!'), 'submit');
    assert.equal(parseVoiceCommand('Prüfen'), 'submit');
    assert.equal(parseVoiceCommand('Noch einmal'), 'retry');
    assert.equal(parseVoiceCommand('Frage wiederholen'), 'repeat');
    assert.equal(parseVoiceCommand('Tipp'), 'hint');
    assert.equal(parseVoiceCommand('Sprachmodus aus'), 'stop');
    assert.equal(parseVoiceCommand('Ich werde morgen einen Apfel haben'), null);
});

test('spoken prompts separate English coaching from the German sentence', () => {
    const segments = buildPromptSegments({
        stepNumber: 1,
        totalSteps: 11,
        name: 'Prediction',
        voicePrompt: 'Say that you will have the apple.',
        startSentence: 'Ich habe einen Apfel.'
    });

    assert.equal(segments[0].lang, 'en-US');
    assert.match(segments[0].text, /Step 1 of 11/);
    assert.equal(segments[1].lang, 'de-DE');
    assert.match(segments[1].text, /Ich habe einen Apfel/);
});

test('answer recognition uses German and publishes final transcript for review', async () => {
    FakeRecognition.instances = [];
    const events = [];
    const transcripts = [];
    const controller = new Controller({
        Recognition: FakeRecognition,
        mediaDevices: {
            getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] })
        },
        onStateChange: event => events.push(event.state),
        onTranscript: (text, isFinal) => transcripts.push({ text, isFinal })
    });
    controller.setMode(MODES.ASSISTED);

    assert.equal(await controller.startAnswerListening(), true);
    const recognition = FakeRecognition.instances[0];
    assert.equal(recognition.lang, 'de-DE');
    recognition.onresult({
        resultIndex: 0,
        results: Object.assign([[{ transcript: 'Ich werde einen Apfel haben' }]], {
            0: Object.assign([{ transcript: 'Ich werde einen Apfel haben' }], { isFinal: true })
        })
    });
    recognition.onend();

    assert.deepEqual(transcripts, [{ text: 'Ich werde einen Apfel haben', isFinal: true }]);
    assert.deepEqual(events, ['requesting-permission', 'listening-answer', 'review']);
});

test('microphone permission is checked before recognition starts', async () => {
    FakeRecognition.instances = [];
    let permissionChecks = 0;
    let stoppedTracks = 0;
    const errors = [];
    const controller = new Controller({
        Recognition: FakeRecognition,
        mediaDevices: {
            getUserMedia: async () => {
                permissionChecks += 1;
                return { getTracks: () => [{ stop: () => { stoppedTracks += 1; } }] };
            }
        },
        onError: message => errors.push(message)
    });
    controller.setMode(MODES.ASSISTED);

    assert.equal(await controller.startAnswerListening(), true);
    assert.equal(permissionChecks, 1);
    assert.equal(stoppedTracks, 1);
    assert.deepEqual(errors, []);
});

test('an immediate recognition end reports an embedded-browser failure', async () => {
    FakeRecognition.instances = [];
    const errors = [];
    const controller = new Controller({
        Recognition: FakeRecognition,
        mediaDevices: {
            getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] })
        },
        onError: message => errors.push(message)
    });
    controller.setMode(MODES.ASSISTED);

    await controller.startAnswerListening();
    FakeRecognition.instances[0].onend();

    assert.match(errors[0], /ended before microphone audio/i);
    assert.equal(controller.state, 'error');
});

test('recognition failures have actionable messages', () => {
    assert.match(recognitionErrorMessage('not-allowed'), /permission/i);
    assert.match(recognitionErrorMessage('audio-capture'), /microphone/i);
    assert.match(recognitionErrorMessage('network'), /could not be reached/i);
});
