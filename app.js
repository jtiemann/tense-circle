/**
 * Das Verb-Kreisspiel - Application Logic
 */

// --- Constants & Configuration ---
const START_SENTENCE = "Ich lege den Apfel auf den Tisch.";
const VERB = "legen";
const NUM_STEPS = 11;

// Define the steps and their prompts
const steps = [
    { name: "Prediction", prompt: "Use **Futur I** (werden + haben) to make a prediction about the dog.", theme: "step-theme-blue", color: "#0ea5e9" },
    { name: "Modal (present)", prompt: "Use a **Present Modal Verb** (e.g., *müssen*) and **'haben'** to express necessity.", theme: "step-theme-purple", color: "#9333ea" },
    { name: "Modal Past", prompt: "Use the **Modal Verb in the Perfect** tense (e.g., *gemusst haben*) combined with **'haben'** in the infinitive to express a past necessity or possibility that didn't happen (Modal + Infinitiv).", theme: "step-theme-purple", color: "#a855f7" },
    { name: "Simple Past", prompt: "Use the **Simple Past (Präteritum)** form of 'haben' (hatte).", theme: "step-theme-purple", color: "#c084fc" },
    { name: "Conditional", prompt: "Use **Konjunktiv II (Präsens)** (würde + haben or hätte) to express a hypothetical situation.", theme: "step-theme-pink", color: "#ec4899" },
    { name: "Perfect", prompt: "Use the **Perfect (Perfekt)** tense (**haben** + gehabt). Note: 'haben' uses 'haben' as its auxiliary.", theme: "step-theme-pink", color: "#f43f5e" },
    { name: "Conditional (past)", prompt: "Use **Konjunktiv II (Perfekt)** (hätte + gehabt) to express a past condition that didn't happen.", theme: "step-theme-yellow", color: "#eab308" },
    { name: "Subordinate Cl. 1", prompt: "Create a **Subordinate Clause** (Nebensatz) using the conjunction **'dass'** (e.g., Ich weiß, dass...).", theme: "step-theme-yellow", color: "#ca8a04" },
    { name: "Subordinate Cl. 2", prompt: "Create a **Subordinate Clause** (Nebensatz) using the conjunction **'weil'** (e.g., Er fragt, weil...).", theme: "step-theme-red", color: "#ef4444" },
    { name: "Konjunktiv II", prompt: "Use the shortened **Konjunktiv II** form of 'haben' again (hätte).", theme: "step-theme-red", color: "#dc2626" },
    { name: "Konjunktiv I", prompt: "Use **Konjunktiv I** (Indirect Speech) to report the original sentence (habe).", theme: "step-theme-red", color: "#b91c1c" },
];

// Accepted verb forms for basic validation
const requiredVerbForms = ['habe', 'hast', 'hat', 'haben', 'habt', 'hatte', 'hattest', 'hatten', 'hattet', 'hätte', 'hättest', 'hätten', 'hättet', 'gehabt', 'wird haben'];

// --- Application State ---
let gameState = {
    apiKey: null,
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

    // History Panel
    historyList: document.getElementById('history-list'),
    historyCount: document.getElementById('history-count'),
    emptyHistory: document.getElementById('empty-history'),
    historyTemplate: document.getElementById('history-item-template')
};

// --- Initialization ---
function initApp() {
    // Check for saved API key
    const savedKey = localStorage.getItem('gemini_api_key_tense_circle');

    if (savedKey) {
        gameState.apiKey = savedKey;
        hideModalAndStart();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // API Form Submission
    dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = dom.inputForm.value.trim();

        if (key.length < 10) {
            showApiError("Please enter a valid API key.");
            return;
        }

        // Save and start
        localStorage.setItem('gemini_api_key_tense_circle', key);
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

    // Check Answer Submission
    dom.submitBtn.addEventListener('click', checkAnswer);

    // Enable Enter key submission (Ctrl+Enter or Cmd+Enter for textarea)
    dom.sentenceInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            checkAnswer();
        }
    });

    // Input Validation Feedback
    dom.sentenceInput.addEventListener('input', () => {
        const val = dom.sentenceInput.value.trim();
        if (val.length >= 10 && requiredVerbForms.some(form => val.toLowerCase().includes(form))) {
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

    steps.forEach((step, index) => {
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

function updateGameUI() {
    const currentStep = steps[gameState.currentStepIndex];

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
                 <span class="font-bold text-slate-800 text-lg sm:text-lg">"${START_SENTENCE}"</span>
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

    // Hide messages
    hideMessage();

    // Ensure focus is on input for quick typing if not on mobile
    if (window.innerWidth > 768) {
        setTimeout(() => dom.sentenceInput.focus(), 300);
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

    if (isLoading) {
        dom.btnText.classList.add('opacity-0');
        dom.btnLoading.classList.remove('hidden');
    } else {
        dom.btnText.classList.remove('opacity-0');
        dom.btnLoading.classList.add('hidden');
    }
}

// --- API Interaction ---

async function callGeminiAPI(currentStep, userAttempt) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${gameState.apiKey}`;

    const systemInstruction = `You are a strict but helpful German grammar tutor.
Your task is to review a user's attempt at expanding a starting sentence.
The user's sentence should apply a specific grammar rule and must contain the verb 'haben'.
Respond with a JSON object.

If the user's sentence is completely unrelated, nonsensical, or clearly doesn't follow instructions, set "isValid" to false and provide a helpful "errorMessage".
If valid, provide:
1. "correctedAttempt": Grammatically corrected version of user's input (fix ONLY errors, keep their vocab/meaning). If their attempt is flawless, output their exact sentence.
2. "suggestedSentence": An ideal, high-quality, native-sounding sentence strictly following the rule.
3. "englishTranslation": Natural english translation of YOUR suggestedSentence.
`;

    const promptText = `Starting sentence: '${START_SENTENCE}'.
Rule to apply: '${currentStep.prompt}'
User's Attempt: '${userAttempt}'

Provide parsing according to system instructions.`;

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
            temperature: 0.2, // Low temp for more deterministic grammar corrections
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "isValid": { "type": "BOOLEAN", "description": "True if the user made a genuine attempt, false if nonsensical/unrelated." },
                    "errorMessage": { "type": "STRING", "description": "If isValid is false, explain why." },
                    "correctedAttempt": { "type": "STRING" },
                    "suggestedSentence": { "type": "STRING" },
                    "englishTranslation": { "type": "STRING" }
                },
                required: ["isValid"]
            }
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 400 || response.status === 403) {
                throw new Error("API Key invalid or quota exceeded.");
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract JSON from response text safely
        const textResponse = data.candidates[0].content.parts[0].text;

        try {
            return JSON.parse(textResponse);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", textResponse);
            throw new Error("AI returned malformed data.");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // Let caller handle UI
    }
}

// --- Core Logic ---

async function checkAnswer() {
    if (gameState.isProcessing) return;

    const input = dom.sentenceInput.value.trim();
    const currentStep = steps[gameState.currentStepIndex];

    // Local Validation
    if (input.length < 10) {
        showMessage("Sentence is too short. Please try writing a complete German sentence.", "error");
        dom.sentenceInput.focus();
        return;
    }

    // Ensure they used the verb
    const includesRequired = requiredVerbForms.some(form => input.toLowerCase().includes(form));
    if (!includesRequired) {
        showMessage(`Your sentence must contain a form of the verb '${VERB}'.`, "error");
        dom.sentenceInput.focus();
        return;
    }

    setLoadingState(true);
    hideMessage();

    try {
        const result = await callGeminiAPI(currentStep, input);

        // Handle rejection by AI (nonsense inputted)
        if (result.isValid === false) {
            showMessage(result.errorMessage || "Your input didn't seem to follow the instructions. Please try again.", "error");
            setLoadingState(false);
            return; // Halt progress
        }

        // --- Success Path ---

        // Add to history
        gameState.sentenceHistory.unshift({ // Add to beginning of array so newest is at top
            stepName: currentStep.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userText: input,
            correctedText: result.correctedAttempt,
            idealText: result.suggestedSentence,
            translation: result.englishTranslation,
            themeColor: currentStep.theme // Pass theme for visual matching in history
        });

        showMessage(`Excellent! Step ${gameState.currentStepIndex + 1} completed. Review the feedback and continue.`);

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
        updateGameUI();

    } catch (error) {
        if (error.message.includes("API Key")) {
            showMessage("Authentication error. Please check your API Key by clicking 'Change API Key' below.", "error");
            // Clear invalid key
            localStorage.removeItem('gemini_api_key_tense_circle');
        } else {
            showMessage("Network or processing error. Please try clicking 'Check Answer' again.", "error");
        }
    } finally {
        setLoadingState(false);
    }
}

// --- History Rendering ---

function renderHistory() {
    if (gameState.sentenceHistory.length === 0) {
        dom.emptyHistory.classList.remove('hidden');
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

        const correctedBlock = container.querySelector('.correction-block');
        const correctedTextEl = container.querySelector('.corrected-text');

        // Check if correction was actually made. If user's attempt is exactly the corrected version, hide block.
        // Convert to lowercase and trim punctuation for a fuzzy check to prevent showing trivial corrections
        const cleanUser = item.userText.replace(/[.,!?]/g, '').trim().toLowerCase();
        const cleanCorrected = item.correctedText.replace(/[.,!?]/g, '').trim().toLowerCase();

        if (cleanUser !== cleanCorrected) {
            correctedBlock.classList.remove('hidden');
            correctedTextEl.textContent = item.correctedText;
        }

        container.querySelector('.ideal-text').textContent = item.idealText;
        container.querySelector('.translation-text').textContent = `Translation: ${item.translation}`;

        dom.historyList.appendChild(container);
    });
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
