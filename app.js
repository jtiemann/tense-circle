/**
 * Das Verb-Kreisspiel - Application Logic
 */

// --- Constants & Configuration ---
const DEFAULT_VERB = 'haben';
const DEFAULT_START_SENTENCE = 'Ich habe einen Apfel.';
const NUM_STEPS = 11;
const API_KEY_STORAGE_KEY = 'typesafe_jev_api_key_tense_circle';
const VOICE_MODE_STORAGE_KEY = 'tense_circle_voice_mode';
const VERB_STORAGE_KEY = 'tense_circle_verb';
const JEV_API_URL = '/api/jev';
const JEV_MODEL = 'jev-latest';

// Hand-written steps for the default verb. Every other verb uses Verbs.buildSteps().
const HABEN_STEPS = [
    {
        name: "Prediction",
        prompt: "Use Futur I (werden + haben) to say that you will have the apple.",
        voicePrompt: "Imagine tomorrow. Say that you will have the apple, using the future tense.",
        acceptanceCriteria: "A finite form of werden is used with the infinitive haben to express the future.",
        hint: "Use a form such as: ich werde ... haben.",
        example: "Ich werde morgen einen Apfel haben.",
        theme: "step-theme-blue",
        color: "#0ea5e9"
    },
    {
        name: "Modal (present)",
        prompt: "Use a present-tense modal verb with haben to express necessity or possibility.",
        voicePrompt: "Express necessity or possibility with a present-tense modal verb and the target verb.",
        acceptanceCriteria: "A finite present modal verb is paired with the infinitive haben.",
        hint: "Use a form such as: ich muss ... haben or ich kann ... haben.",
        example: "Ich muss einen Apfel haben.",
        theme: "step-theme-purple",
        color: "#9333ea"
    },
    {
        name: "Modal Perfect",
        prompt: "Use Perfekt with a modal verb and the double infinitive construction.",
        voicePrompt: "Now describe a completed situation using a modal verb and the double-infinitive construction.",
        acceptanceCriteria: "A finite auxiliary form of haben is followed by lexical haben and a modal infinitive, using the Ersatzinfinitiv pattern.",
        hint: "Use the pattern: ich habe ... haben müssen/können/dürfen.",
        example: "Ich habe einen Apfel haben müssen.",
        theme: "step-theme-purple",
        color: "#a855f7"
    },
    {
        name: "Simple Past",
        prompt: "Use the Präteritum form of haben.",
        voicePrompt: "Move into the simple past and say that you had the apple.",
        acceptanceCriteria: "A simple-past form of haben, such as hatte, is the main verb.",
        hint: "Use a form such as: ich hatte ...",
        example: "Ich hatte gestern einen Apfel.",
        theme: "step-theme-purple",
        color: "#c084fc"
    },
    {
        name: "Conditional",
        prompt: "Use Konjunktiv II Präsens with hätte or würde ... haben.",
        voicePrompt: "Express a present hypothetical situation using the conditional mood.",
        acceptanceCriteria: "The sentence expresses a present hypothetical using hätte or würde with haben.",
        hint: "Use hätte, or use würde + haben.",
        example: "Ich hätte gern einen Apfel.",
        theme: "step-theme-pink",
        color: "#ec4899"
    },
    {
        name: "Perfect",
        prompt: "Use Perfekt with haben + gehabt.",
        voicePrompt: "Create a present-perfect sentence saying that you had the apple.",
        acceptanceCriteria: "A finite form of haben is used as the auxiliary with the participle gehabt.",
        hint: "Use a form such as: ich habe ... gehabt.",
        example: "Ich habe gestern einen Apfel gehabt.",
        theme: "step-theme-pink",
        color: "#f43f5e"
    },
    {
        name: "Conditional (past)",
        prompt: "Use Konjunktiv II Perfekt with hätte + gehabt.",
        voicePrompt: "Express an unreal past situation using the past conditional.",
        acceptanceCriteria: "The sentence expresses an unreal past situation with hätte and gehabt.",
        hint: "Use a form such as: ich hätte ... gehabt.",
        example: "Ich hätte gestern einen Apfel gehabt.",
        theme: "step-theme-yellow",
        color: "#eab308"
    },
    {
        name: "Subordinate Clause: dass",
        prompt: "Create a subordinate clause with dass and place the finite form of haben at the end.",
        voicePrompt: "Create a subordinate clause beginning with dass, and put the finite verb at the end.",
        acceptanceCriteria: "A dass subordinate clause is present and its finite form of haben appears in clause-final position.",
        hint: "Use a form such as: Ich weiß, dass ich ... habe.",
        example: "Ich weiß, dass ich einen Apfel habe.",
        theme: "step-theme-yellow",
        color: "#ca8a04"
    },
    {
        name: "Subordinate Clause: weil",
        prompt: "Create a subordinate clause with weil and place the finite form of haben at the end.",
        voicePrompt: "Give a reason in a clause beginning with weil, and put the finite verb at the end.",
        acceptanceCriteria: "A weil subordinate clause is present and its finite form of haben appears in clause-final position.",
        hint: "Use a form such as: ..., weil ich ... habe.",
        example: "Ich bin zufrieden, weil ich einen Apfel habe.",
        theme: "step-theme-red",
        color: "#ef4444"
    },
    {
        name: "Konjunktiv II",
        prompt: "Use hätte in a present hypothetical sentence.",
        voicePrompt: "Create a present hypothetical sentence using the second subjunctive.",
        acceptanceCriteria: "The Konjunktiv II form hätte expresses a present unreal or hypothetical situation.",
        hint: "Use a form such as: Wenn ich ... hätte, ...",
        example: "Wenn ich einen Apfel hätte, wäre ich zufrieden.",
        theme: "step-theme-red",
        color: "#dc2626"
    },
    {
        name: "Konjunktiv I",
        prompt: "Use Konjunktiv I habe in indirect speech.",
        voicePrompt: "Report what another person says using the first subjunctive and indirect speech.",
        acceptanceCriteria: "The form habe reports another person's statement in indirect speech.",
        hint: "Use a form such as: Er sagt, er habe ...",
        example: "Er sagt, er habe einen Apfel.",
        theme: "step-theme-red",
        color: "#b91c1c"
    },
];

if (!window.Verbs) {
    throw new Error('Verbs must be loaded before app.js.');
}
if (!window.JevEvaluator) {
    throw new Error('JevEvaluator must be loaded before app.js.');
}
if (!window.VoiceController) {
    throw new Error('VoiceController must be loaded before app.js.');
}

let voiceController;

// --- Application State ---
let gameState = {
    apiKey: null,
    verb: DEFAULT_VERB,
    startSentence: DEFAULT_START_SENTENCE,
    steps: HABEN_STEPS,
    requiredVerbForms: [],
    currentStepIndex: 0,
    sentenceHistory: [],
    isProcessing: false
};

// --- DOM Elements ---
const dom = {
    // API Modal
    modal: document.getElementById('api-key-modal'),
    form: document.getElementById('api-key-form'),
    inputForm: document.getElementById('api-key-input'),
    errorMsg: document.getElementById('api-key-error'),

    // Game Container
    gameContainer: document.getElementById('game-container'),
    changeKeyBtn: document.getElementById('change-key-btn'),
    resetBtn: document.getElementById('reset-btn'),

    // Verb selection
    verbSelect: document.getElementById('verb-select'),
    centerVerb: document.getElementById('center-verb-label'),

    // Circle UI
    circleUI: document.getElementById('circle-ui'),
    orbitIndicator: document.getElementById('orbit-indicator'),

    // Interaction Panel
    progressTracker: document.getElementById('progress-tracker'),
    stepTitle: document.getElementById('current-step-title'),
    instructionText: document.getElementById('instruction-text'),
    sentenceInput: document.getElementById('sentence-input'),
    submitBtn: document.getElementById('check-button'),
    btnText: document.getElementById('button-text'),
    btnLoading: document.getElementById('button-loading'),
    messageBox: document.getElementById('message-box'),
    inputValidIcon: document.getElementById('input-validation-icon'),

    // Voice Experience
    voiceMode: document.getElementById('voice-mode'),
    voiceCapability: document.getElementById('voice-capability'),
    voiceActions: document.getElementById('voice-actions'),
    hearPromptBtn: document.getElementById('hear-prompt-btn'),
    hintVoiceBtn: document.getElementById('hint-voice-btn'),
    voiceAnswerBtn: document.getElementById('voice-answer-btn'),
    voiceAnswerLabel: document.getElementById('voice-answer-label'),
    voiceReviewActions: document.getElementById('voice-review-actions'),
    voiceSubmitBtn: document.getElementById('voice-submit-btn'),
    voiceRetryBtn: document.getElementById('voice-retry-btn'),
    voiceReadbackBtn: document.getElementById('voice-readback-btn'),
    voiceCommandBtn: document.getElementById('voice-command-btn'),
    voiceStatus: document.getElementById('voice-status'),

    // History Panel
    historyList: document.getElementById('history-list'),
    historyCount: document.getElementById('history-count'),
    emptyHistory: document.getElementById('empty-history'),
    historyTemplate: document.getElementById('history-item-template')
};

// --- Initialization ---
function initApp() {
    populateVerbSelect();
    setupEventListeners();
    initVoiceExperience();
    applyVerb(loadSavedVerb());

    // Check for saved Jev API key
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (savedKey) {
        gameState.apiKey = savedKey;
        hideModalAndStart();
    }
}

function setupEventListeners() {
    // API Form Submission
    dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = dom.inputForm.value.trim();

        if (key.length < 10) {
            showApiError("Please enter a valid TypeSafe API key.");
            return;
        }

        // Save and start
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        gameState.apiKey = key;
        hideModalAndStart();
    });

    // Change API Key Request
    dom.changeKeyBtn.addEventListener('click', () => {
        dom.inputForm.value = gameState.apiKey || '';
        dom.modal.classList.remove('opacity-0', 'pointer-events-none');
        dom.modal.classList.add('flex');
        dom.modal.classList.remove('hidden');
        setTimeout(() => dom.inputForm.focus(), 100);
    });

    // Reset Game button
    dom.resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset your progress?")) {
            gameState.currentStepIndex = 0;
            gameState.sentenceHistory = [];
            updateGameUI();
            renderHistory();
        }
    });

    // Verb selection
    dom.verbSelect.addEventListener('change', onVerbSelected);

    // Check Answer Submission
    dom.submitBtn.addEventListener('click', checkAnswer);

    // Voice controls
    dom.voiceMode.addEventListener('change', () => setVoiceMode(dom.voiceMode.value, true));
    dom.hearPromptBtn.addEventListener('click', speakCurrentPrompt);
    dom.hintVoiceBtn.addEventListener('click', showAndSpeakHint);
    dom.voiceAnswerBtn.addEventListener('click', toggleAnswerListening);
    dom.voiceSubmitBtn.addEventListener('click', checkAnswer);
    dom.voiceRetryBtn.addEventListener('click', retryVoiceAnswer);
    dom.voiceReadbackBtn.addEventListener('click', readBackTranscript);
    dom.voiceCommandBtn.addEventListener('click', toggleCommandListening);

    // Enable Enter key submission (Ctrl+Enter or Cmd+Enter for textarea)
    dom.sentenceInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            checkAnswer();
        }
    });

    // Input Validation Feedback
    dom.sentenceInput.addEventListener('input', () => {
        const val = dom.sentenceInput.value.trim();
        if (val.length >= 10 && window.JevEvaluator.containsTargetVerbForm(val, gameState.requiredVerbForms)) {
            dom.inputValidIcon.classList.remove('opacity-0');
            dom.inputValidIcon.classList.add('opacity-100');
            dom.sentenceInput.classList.remove('border-red-300');
            dom.sentenceInput.classList.add('border-brand-300', 'bg-brand-50/30');
        } else {
            dom.inputValidIcon.classList.remove('opacity-100');
            dom.inputValidIcon.classList.add('opacity-0');
            dom.sentenceInput.classList.remove('border-brand-300', 'bg-brand-50/30');
            // Only show red border if user has typed something but it's invalid
            if (val.length > 0) {
                dom.sentenceInput.classList.add('border-red-300');
            } else {
                dom.sentenceInput.classList.remove('border-red-300');
            }
        }
    });
}

// --- Verb Selection ---

function loadSavedVerb() {
    try {
        const saved = localStorage.getItem(VERB_STORAGE_KEY);
        if (saved && window.Verbs.findPreset(saved)) return saved;
    } catch (e) { /* storage unavailable */ }
    return DEFAULT_VERB;
}

function populateVerbSelect() {
    const groups = [
        { label: 'Regular & irregular', separable: false },
        { label: 'Separable (trennbare Verben)', separable: true }
    ];

    for (const { label, separable } of groups) {
        const group = document.createElement('optgroup');
        group.label = label;
        window.Verbs.VERB_PRESETS
            .filter(preset => window.Verbs.getConjugation(preset.verb).isSeparable === separable)
            .forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.verb;
                option.textContent = preset.label;
                group.appendChild(option);
            });
        dom.verbSelect.appendChild(group);
    }
}

function startSentenceFor(verb) {
    return verb === DEFAULT_VERB
        ? DEFAULT_START_SENTENCE
        : window.Verbs.findPreset(verb).sentences[0];
}

// Points the game at a verb: steps, starting sentence, and accepted forms.
function applyVerb(verb) {
    const conjugation = window.Verbs.getConjugation(verb);
    gameState.verb = verb;
    gameState.startSentence = startSentenceFor(verb);
    gameState.steps = verb === DEFAULT_VERB ? HABEN_STEPS : window.Verbs.buildSteps(conjugation);
    gameState.requiredVerbForms = window.Verbs.getAllVerbForms(conjugation);
    dom.verbSelect.value = verb;
    dom.centerVerb.textContent = verb;
}

function onVerbSelected() {
    const verb = dom.verbSelect.value;
    if (verb === gameState.verb) return;

    if (gameState.sentenceHistory.length > 0
        && !confirm('Switching verbs restarts the circle and clears your history. Continue?')) {
        dom.verbSelect.value = gameState.verb;
        return;
    }

    voiceController.stopAll();
    try { localStorage.setItem(VERB_STORAGE_KEY, verb); } catch (e) { /* storage unavailable */ }
    applyVerb(verb);
    gameState.currentStepIndex = 0;
    gameState.sentenceHistory = [];
    renderCircle();
    updateGameUI();
    renderHistory();
}

// --- Optional Voice Experience ---

function initVoiceExperience() {
    voiceController = new window.VoiceController.Controller({
        onStateChange: renderVoiceState,
        onTranscript: (transcript, isFinal) => {
            dom.sentenceInput.value = transcript;
            dom.sentenceInput.dispatchEvent(new Event('input', { bubbles: true }));

            if (isFinal) {
                dom.voiceReviewActions.classList.remove('hidden');
                if (voiceController.mode === window.VoiceController.MODES.VOICE_FIRST) {
                    setTimeout(() => {
                        if (voiceController.state === 'review' || voiceController.state === 'idle') {
                            readBackTranscript();
                        }
                    }, 500);
                }
            }
        },
        onCommand: handleVoiceCommand,
        onError: message => {
            dom.voiceStatus.textContent = message;
            showMessage(message, 'error');
        }
    });

    const savedMode = localStorage.getItem(VOICE_MODE_STORAGE_KEY);
    const mode = Object.values(window.VoiceController.MODES).includes(savedMode)
        ? savedMode
        : window.VoiceController.MODES.OFF;
    dom.voiceMode.value = mode;
    setVoiceMode(mode, false);
}

function setVoiceMode(mode, persist) {
    voiceController.setMode(mode);
    if (persist) localStorage.setItem(VOICE_MODE_STORAGE_KEY, mode);

    const { synthesis, recognition } = voiceController.capabilities;
    dom.voiceActions.classList.toggle('hidden', mode === window.VoiceController.MODES.OFF);
    dom.hearPromptBtn.disabled = !synthesis;
    dom.hintVoiceBtn.disabled = !synthesis;
    dom.voiceReadbackBtn.disabled = !synthesis;
    dom.voiceAnswerBtn.disabled = !recognition;
    dom.voiceCommandBtn.disabled = !recognition;

    if (synthesis && recognition) {
        dom.voiceCapability.textContent = mode === window.VoiceController.MODES.VOICE_FIRST
            ? 'Questions, read-back, and feedback will be spoken automatically.'
            : mode === window.VoiceController.MODES.ASSISTED
                ? 'Use the controls whenever you want to listen or dictate.'
                : 'Choose how much voice assistance you want.';
    } else if (synthesis) {
        dom.voiceCapability.textContent = 'This browser can speak prompts, but German dictation is unavailable.';
    } else if (recognition) {
        dom.voiceCapability.textContent = 'German dictation is available, but spoken prompts are unavailable.';
    } else {
        dom.voiceCapability.textContent = 'Voice features are unavailable in this browser; typing still works.';
        dom.voiceMode.value = window.VoiceController.MODES.OFF;
        voiceController.setMode(window.VoiceController.MODES.OFF);
        dom.voiceMode.disabled = true;
    }

    if (mode === window.VoiceController.MODES.OFF) {
        dom.voiceReviewActions.classList.add('hidden');
    } else if (persist && mode === window.VoiceController.MODES.VOICE_FIRST && gameState.apiKey) {
        speakCurrentPrompt();
    }
}

function renderVoiceState({ state, detail }) {
    const listeningForAnswer = state === 'listening-answer';
    const listeningForCommand = state === 'listening-command';
    const requestingPermission = state === 'requesting-permission';
    dom.voiceAnswerBtn.classList.toggle('is-listening', listeningForAnswer);
    dom.voiceAnswerBtn.setAttribute('aria-pressed', String(listeningForAnswer));
    dom.voiceAnswerBtn.disabled = gameState.isProcessing || requestingPermission || !voiceController.capabilities.recognition;
    dom.voiceAnswerLabel.textContent = requestingPermission
        ? 'Checking microphone permission…'
        : listeningForAnswer
            ? 'Listening… tap to stop'
            : 'Tap to answer in German';
    dom.voiceCommandBtn.textContent = listeningForCommand ? 'Listening… tap to stop' : 'Say a command';

    const statuses = {
        idle: 'Voice is ready.',
        'requesting-permission': 'Waiting for microphone permission…',
        speaking: 'Speaking…',
        'listening-answer': detail === 'speech'
            ? 'Speech detected. Keep speaking until your sentence is complete…'
            : detail === 'audio'
                ? 'Microphone connected. Listening for your German answer…'
                : 'Listening for your German answer…',
        'listening-command': 'Listening for: submit, try again, repeat, hint, or voice off…',
        review: 'Transcript ready. Review it before submitting.',
        error: 'Voice input stopped. You can retry or type instead.'
    };
    dom.voiceStatus.textContent = statuses[state] || 'Voice is ready.';
}

function currentVoicePrompt() {
    const step = gameState.steps[gameState.currentStepIndex];
    return {
        stepNumber: gameState.currentStepIndex + 1,
        totalSteps: NUM_STEPS,
        name: step.name,
        voicePrompt: step.voicePrompt,
        startSentence: gameState.startSentence
    };
}

function speakCurrentPrompt() {
    return voiceController.speakPrompt(currentVoicePrompt());
}

function showAndSpeakHint() {
    const step = gameState.steps[gameState.currentStepIndex];
    showMessage(`Example: ${step.example}`);
    return voiceController.speakHint(step.example);
}

function toggleAnswerListening() {
    if (voiceController.state === 'listening-answer') {
        voiceController.stopListening();
        return;
    }
    dom.voiceReviewActions.classList.add('hidden');
    voiceController.startAnswerListening();
}

function toggleCommandListening() {
    if (voiceController.state === 'listening-command') {
        voiceController.stopListening();
        return;
    }
    voiceController.startCommandListening();
}

function retryVoiceAnswer() {
    voiceController.stopAll();
    dom.sentenceInput.value = '';
    dom.sentenceInput.dispatchEvent(new Event('input', { bubbles: true }));
    dom.voiceReviewActions.classList.add('hidden');
    voiceController.startAnswerListening();
}

function readBackTranscript() {
    const transcript = dom.sentenceInput.value.trim();
    if (!transcript) {
        dom.voiceStatus.textContent = 'Record or type an answer before asking for read-back.';
        return Promise.resolve(false);
    }
    return voiceController.readBack(transcript);
}

function handleVoiceCommand(command, transcript) {
    if (!command) {
        const message = `I heard “${transcript}”, but not a supported command.`;
        dom.voiceStatus.textContent = message;
        voiceController.speakFeedback('I did not recognize that command.');
        return;
    }

    if (command === 'submit') {
        voiceController.stopAll();
        checkAnswer();
    } else if (command === 'retry') {
        retryVoiceAnswer();
    } else if (command === 'repeat') {
        speakCurrentPrompt();
    } else if (command === 'hint') {
        showAndSpeakHint();
    } else if (command === 'stop') {
        dom.voiceMode.value = window.VoiceController.MODES.OFF;
        setVoiceMode(window.VoiceController.MODES.OFF, true);
    }
}

function speakFeedbackIfVoiceFirst(message) {
    if (voiceController.mode === window.VoiceController.MODES.VOICE_FIRST) {
        return voiceController.speakFeedback(message);
    }
    return Promise.resolve(false);
}

function showApiError(msg) {
    dom.errorMsg.textContent = msg;
    dom.errorMsg.classList.remove('hidden');
    dom.inputForm.classList.add('border-red-500', 'ring-red-500');
}

function hideModalAndStart() {
    dom.modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        dom.modal.classList.add('hidden');
        dom.modal.classList.remove('flex');
        // Show main app
        dom.gameContainer.classList.remove('hidden');
        // Small delay to allow display to apply before fading in
        setTimeout(() => {
            dom.gameContainer.classList.remove('opacity-0', 'pointer-events-none');
            // Initialize Game UI once visible
            renderCircle();
            updateGameUI();
        }, 50);
    }, 300);
}

// --- UI Rendering ---

function renderCircle() {
    // Clear existing (except the center hub and tracks)
    const existingLabels = dom.circleUI.querySelectorAll('.step-label');
    existingLabels.forEach(el => el.remove());

    const angleIncrement = 360 / NUM_STEPS;

    // Base radius in percentage based on container, leaving room for labels
    // We position them relative to the center
    const radiusPercentage = 42;

    gameState.steps.forEach((step, index) => {
        // -90 to start at top (12 o'clock)
        const angle = (index * angleIncrement) - 90;
        const rad = angle * (Math.PI / 180);

        // Position on a circle using percentages (50% is center)
        const x = 50 + (radiusPercentage * Math.cos(rad));
        const y = 50 + (radiusPercentage * Math.sin(rad));

        const stepEl = document.createElement('div');
        stepEl.className = `step-label ${step.theme}`;
        stepEl.innerHTML = `<span>${index + 1}.</span> ${step.name}`;

        // Base positioning at the center
        stepEl.style.left = `${x}%`;
        stepEl.style.top = `${y}%`;

        // Critical: translate(-50%, -50%) centers the element exactly on the coordinate
        // We set the base transform, which gets overwritten by the .active state on updateUI
        stepEl.style.transform = `translate(-50%, -50%)`;
        stepEl.setAttribute('data-index', index);

        // Store base coordinate for active animation calculation
        stepEl.setAttribute('data-base-transform', `translate(-50%, -50%)`);

        dom.circleUI.appendChild(stepEl);
    });
}

function updateGameUI({ announce = true } = {}) {
    const currentStep = gameState.steps[gameState.currentStepIndex];

    // 1. Update Circle Visuals
    document.querySelectorAll('.step-label').forEach((el, index) => {
        const baseTransform = el.getAttribute('data-base-transform');

        if (index === gameState.currentStepIndex) {
            el.classList.add('active');
            // Combine positioning translation with scale up for active state
            el.style.transform = `${baseTransform} scale(1.15)`;

            // Move the orbit indicator ring
            const angle = (index * (360 / NUM_STEPS)) - 90;
            // The indicator dot is at the top of the ring, so rotating the ring moves the dot
            // Adding 90 to negate the -90 offset so the dot starts where the first element is
            dom.orbitIndicator.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;

        } else {
            el.classList.remove('active');
            el.style.transform = baseTransform; // Reset to base
        }

        // Visual history fading: steps we've passed become slightly more transparent
        if (index < gameState.currentStepIndex && gameState.sentenceHistory.length > 0) {
            el.style.opacity = '0.6';
        } else if (index > gameState.currentStepIndex) {
            el.style.opacity = '0.85'; // Default inactive
        }
    });

    // 2. Update Interaction Panel Texts
    // Animate title change
    dom.stepTitle.style.opacity = 0;
    setTimeout(() => {
        dom.stepTitle.textContent = `${gameState.currentStepIndex + 1}. ${currentStep.name}`;
        dom.stepTitle.style.opacity = 1;
    }, 150);

    dom.progressTracker.textContent = `Step ${gameState.currentStepIndex + 1} of ${NUM_STEPS}`;

    // Animate instructions change
    dom.instructionText.style.opacity = 0;
    setTimeout(() => {
        dom.instructionText.innerHTML = `
            <p class="mb-3 text-sm text-slate-500">Starting sentence:</p>
            <div class="bg-indigo-100/50 p-3 rounded-xl border border-indigo-200/50 mb-3 shadow-inner">
                 <span class="font-bold text-slate-800 text-lg sm:text-lg">"${gameState.startSentence}"</span>
            </div>
            <p class="font-medium text-slate-800">${currentStep.prompt}</p>
        `;
        dom.instructionText.style.opacity = 1;
    }, 150);

    // Reset Input
    dom.sentenceInput.value = '';
    dom.inputValidIcon.classList.remove('opacity-100');
    dom.inputValidIcon.classList.add('opacity-0');
    dom.sentenceInput.classList.remove('border-brand-300', 'bg-brand-50/30', 'border-red-300');
    dom.voiceReviewActions.classList.add('hidden');

    // Hide messages
    hideMessage();

    // Ensure focus is on input for quick typing if not on mobile
    if (window.innerWidth > 768) {
        setTimeout(() => dom.sentenceInput.focus(), 300);
    }

    if (announce && voiceController.mode === window.VoiceController.MODES.VOICE_FIRST) {
        setTimeout(speakCurrentPrompt, 350);
    }
}

function showMessage(text, type = 'success') {
    dom.messageBox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            ${type === 'error'
            ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />'}
        </svg>
        <div>${text}</div>
    `;

    dom.messageBox.className = `mt-4 p-4 rounded-xl text-sm font-medium flex items-start gap-3 transition-all duration-300 transform scale-100 opacity-100 ${type === 'error' ? 'msg-error' : 'msg-success'}`;
}

function hideMessage() {
    dom.messageBox.classList.remove('scale-100', 'opacity-100');
    dom.messageBox.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        if (dom.messageBox.classList.contains('opacity-0')) {
            dom.messageBox.className = 'hidden';
        }
    }, 300); // Wait for transition
}

function setLoadingState(isLoading) {
    gameState.isProcessing = isLoading;
    dom.submitBtn.disabled = isLoading;
    dom.sentenceInput.disabled = isLoading;
    dom.voiceAnswerBtn.disabled = isLoading || !voiceController.capabilities.recognition;
    dom.voiceSubmitBtn.disabled = isLoading;
    dom.voiceRetryBtn.disabled = isLoading;
    dom.voiceCommandBtn.disabled = isLoading || !voiceController.capabilities.recognition;

    if (isLoading) {
        voiceController.stopAll();
        dom.btnText.classList.add('opacity-0');
        dom.btnLoading.classList.remove('hidden');
    } else {
        dom.btnText.classList.remove('opacity-0');
        dom.btnLoading.classList.add('hidden');
    }
}

// --- Jev API Interaction ---

async function callJevAPI(currentStep, userAttempt) {
    const payload = window.JevEvaluator.buildJevRequest({
        model: JEV_MODEL,
        startSentence: gameState.startSentence,
        targetVerb: gameState.verb,
        step: currentStep,
        userAttempt
    });

    try {
        const response = await fetch(JEV_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${gameState.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Jev API key invalid or unauthorized.");
            }
            if (response.status === 429) {
                throw new Error("Jev quota or rate limit exceeded.");
            }
            throw new Error(`Jev API error: ${response.status}`);
        }

        const data = await response.json();
        return window.JevEvaluator.evaluateJevResponse(data);
    } catch (error) {
        console.error("Jev API Error:", error);
        throw error;
    }
}

// --- Core Logic ---

async function checkAnswer() {
    if (gameState.isProcessing) return;

    const input = dom.sentenceInput.value.trim();
    const currentStep = gameState.steps[gameState.currentStepIndex];

    // Local Validation
    if (input.length < 10) {
        const message = "Sentence is too short. Please try writing a complete German sentence.";
        showMessage(message, "error");
        speakFeedbackIfVoiceFirst(message);
        dom.sentenceInput.focus();
        return;
    }

    // Ensure they used the verb
    const includesRequired = window.JevEvaluator.containsTargetVerbForm(input, gameState.requiredVerbForms);
    if (!includesRequired) {
        const message = `Your sentence must contain a form of the verb '${gameState.verb}'.`;
        showMessage(message, "error");
        speakFeedbackIfVoiceFirst(message);
        dom.sentenceInput.focus();
        return;
    }

    setLoadingState(true);
    hideMessage();

    try {
        const result = await callJevAPI(currentStep, input);

        // Clear failures and uncertain decisions both remain on the current step.
        if (!result.isAccepted) {
            const feedback = window.JevEvaluator.feedbackForDecision(result, currentStep);
            showMessage(feedback, "error");
            setLoadingState(false);
            speakFeedbackIfVoiceFirst(feedback);
            return; // Halt progress
        }

        // --- Success Path ---

        // Add to history
        gameState.sentenceHistory.unshift({ // Add to beginning of array so newest is at top
            stepName: currentStep.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userText: input,
            evaluation: result,
            themeColor: currentStep.theme // Pass theme for visual matching in history
        });

        const successFeedback = `${window.JevEvaluator.feedbackForDecision(result, currentStep)} Step ${gameState.currentStepIndex + 1} completed.`;
        showMessage(successFeedback);

        // Render History UI
        renderHistory();

        // Advance Step
        gameState.currentStepIndex++;

        // Check Completion
        if (gameState.currentStepIndex >= NUM_STEPS) {
            alert("Herzlichen Glückwunsch! You have completed the entire verb circle!");
            // Optional: Confetti effect here!
            gameState.currentStepIndex = 0; // Reset or keep showing finish state
            // gameState.sentenceHistory = []; // Keep history for review
        }

        // Update Board
        updateGameUI({ announce: false });
        if (voiceController.mode === window.VoiceController.MODES.VOICE_FIRST) {
            voiceController.speakFeedback(successFeedback).then(speakCurrentPrompt);
        }

    } catch (error) {
        if (error.message.includes("Jev API key")) {
            const message = "Authentication error. Please check your Jev API key by clicking Change API Key below.";
            showMessage(message, "error");
            speakFeedbackIfVoiceFirst(message);
            // Clear invalid key
            localStorage.removeItem(API_KEY_STORAGE_KEY);
        } else if (error.message.includes("quota or rate limit")) {
            const message = "Jev is temporarily unavailable because its quota or rate limit was reached. Please try again later.";
            showMessage(message, "error");
            speakFeedbackIfVoiceFirst(message);
        } else {
            const message = "Network or processing error. Please try clicking Check Answer again.";
            showMessage(message, "error");
            speakFeedbackIfVoiceFirst(message);
        }
    } finally {
        setLoadingState(false);
    }
}

// --- History Rendering ---

function renderHistory() {
    if (gameState.sentenceHistory.length === 0) {
        dom.historyList.innerHTML = '';
        dom.historyList.appendChild(dom.emptyHistory);
        dom.emptyHistory.classList.remove('hidden');
        dom.historyCount.textContent = '0 Sentences';
        return;
    }

    dom.emptyHistory.classList.add('hidden');
    dom.historyCount.textContent = `${gameState.sentenceHistory.length} Sentences`;

    // Clear list
    dom.historyList.innerHTML = '';

    // Re-render from array
    gameState.sentenceHistory.forEach(item => {
        // Clone template
        const templateNode = dom.historyTemplate.content.cloneNode(true);
        const container = templateNode.querySelector('.history-item');

        // Populate data
        container.querySelector('.step-name').textContent = item.stepName;
        // Optionally map theme color to the tag backgrounds in history structurally if needed

        container.querySelector('.timestamp').textContent = item.timestamp;
        container.querySelector('.user-text').textContent = item.userText;

        const evaluation = item.evaluation;
        container.querySelector('.decision-text').textContent = `Accepted: ${Math.round(evaluation.compositeScore * 100)}% composite`;
        container.querySelector('.dimension-text').textContent = [
            `Rule ${Math.round(evaluation.dimensions.rule.normalized * 100)}%`,
            `German ${Math.round(evaluation.dimensions.language.normalized * 100)}%`,
            `Relevance ${Math.round(evaluation.dimensions.relevance.probability * 100)}%`
        ].join(' · ');
        container.querySelector('.certainty-text').textContent = `Decision certainty: ${Math.round(evaluation.decisionCertainty * 100)}%`;

        dom.historyList.appendChild(container);
    });
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
