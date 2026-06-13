# Tense Circle

A browser-based German grammar practice app built around a circular sequence of tense and clause transformations.

The app presents a starting sentence and asks the learner to rewrite or expand it through an 11-step "verb circle." At each step, the learner writes (or speaks) a new German sentence that follows a specific grammar instruction. All validation and model answers are generated locally — no API key or external service required.

## What it does

Tense Circle is a small single-page app for guided German sentence transformation practice.

Current behavior in this version:

- Supports 49 preset verbs including separable (trennbare) verbs, or any custom verb
- Each preset verb comes with 3 example starting sentences; sentences can be shuffled or edited freely
- Guides the learner through 11 sequential grammar tasks
- Performs local rule-based validation for each step — no external API calls
- Generates a model answer locally from conjugation data
- Supports **Chain Mode**: each step uses the model answer from the previous step as the new reference sentence
- **Voice input**: click "Speak" to dictate your answer in German using the browser's built-in speech recognition
- **Voice feedback**: the app reads the reference sentence and model answer aloud in German using the browser's speech synthesis; can be muted with the speaker toggle
- Shows a running history of attempts and model answers in the right-hand panel
- Tracks a per-verb **score, accuracy, and streak** (best streak included)
- Lets you **jump to any step** by clicking (or tabbing + Enter to) its label on the circle
- **Persists** progress, score, and your voice/Chain-Mode preferences in `localStorage` across reloads
- Resets to step 1 after the full circle is completed

## Learning flow

The app defines these 11 steps:

1. Futur I (Prediction)
2. Modal (present)
3. Modal Past
4. Simple Past (Präteritum)
5. Conditional (Konjunktiv II / würde)
6. Perfect (Perfekt)
7. Conditional Past
8. Subordinate Clause 1 (`dass`)
9. Subordinate Clause 2 (`weil`)
10. Konjunktiv II
11. Konjunktiv I

Each step is represented visually as a label placed around a circle. The active step is highlighted, and an orbit indicator rotates around the ring as the learner progresses.

## Tech stack

This repo is intentionally lightweight and does not use a build system.

- HTML
- Vanilla JavaScript
- CSS
- Tailwind via CDN
- Google Fonts (Outfit)
- Web Speech API (browser-native) for voice input and output

No external AI service, no API key, no backend.

## Project structure

```text
.
├── index.html   # Main single-page UI
├── app.js       # Application state, conjugation engine, validation, rendering
└── style.css    # Custom styling and animations
```

## How to run

Because this project is fully static, you can run it with any simple local web server.

### Option 1: open directly

Open `index.html` in a browser.

### Option 2: serve locally

Using Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

> **Note:** Voice input (speech recognition) requires Chrome or Edge. It may not work when opening `index.html` directly as a `file://` URL — use a local server.

## Setup

No setup required. Open the app, select a verb, and start.

## How the app works internally

### 1. Initialization

On `DOMContentLoaded`, the app:

- populates the verb dropdown from the built-in `VERB_PRESETS` list
- shows the verb selection modal
- sets up UI event listeners and initialises the voice engine

### 2. State model

The app maintains a simple in-memory state object:

- `verb` — the selected infinitive
- `startSentence` — the starting sentence for the circle
- `currentSentence` — evolves in chain mode
- `chainMode` — whether chain mode is active
- `conjugation` — full conjugation data for the selected verb
- `steps` — generated step definitions for the current verb
- `currentStepIndex`
- `sentenceHistory`
- `isProcessing`

### 3. Conjugation engine

`app.js` contains a dictionary of irregular verb conjugations (`IRREGULAR_VERBS`) covering ~60 verbs, plus a regular conjugation fallback for any unknown verb.

Separable verbs (e.g. `aufmachen`, `anrufen`) are detected automatically. The engine splits the prefix for main-clause word order and rejoins it for subordinate clauses.

### 4. Validation

Before accepting an answer, the app performs rule-based checks per step:

- Futur I: requires a form of `werden` + the infinitive
- Modal: requires a modal verb + infinitive
- Präteritum: requires the Präteritum form of the target verb
- Subordinate clauses: requires `dass`/`weil` and verb-final order
- etc.

This is faster and more predictable than AI evaluation, though it does not catch all grammatical errors.

### 5. Model answer generation

After a valid submission, the app generates a model answer locally using the conjugation data and the structure of the starting sentence. The model answer is shown in the history panel and spoken aloud (if voice is enabled).

### 6. Voice input

Clicking **Speak** starts the browser's `SpeechRecognition` API with `lang: 'de-DE'`. The mic stays open until you click **Speak** again. Interim results appear in the textarea as you speak.

Voice input requires Chrome or Edge.

### 7. Voice output

At each new step, the app reads the reference sentence and step name aloud using `SpeechSynthesis` with `lang: 'de-DE'`. After a correct submission, the model answer is spoken. The speaker button in the header mutes/unmutes synthesis.

### 8. History rendering

Each accepted answer is prepended to the history panel showing:

- step name and timestamp
- what the learner wrote
- the model answer for that step

## UI summary

The interface has three main parts:

### Verb selection modal

A startup modal with:

- dropdown of 49 preset verbs grouped by Regular/Irregular and Separable
- custom verb input (any German infinitive)
- starting sentence input (pre-filled from preset, editable, shuffleable)
- Chain Mode toggle

### Circle panel

A circular progress visualization with:

- a center hub showing the focus verb
- 11 labels positioned around the orbit
- an orbit indicator that rotates to the active step

### Practice and history panel

A right-hand column containing:

- current step title and step counter
- reference sentence and grammar instruction
- sentence textarea with mic (voice input) button
- Check Answer button
- success/error message area
- scrollable history of model answers

## Known limitations

### Product limitations

- There is no learner profile, lesson selection, or spaced repetition (a per-verb score/streak counter is tracked and persisted)
- The completion flow shows a message and resets to step 1

### Technical limitations

- All app logic lives in one JavaScript file (the pure conjugation/validation/model-answer functions are exported for testing)
- There is no build pipeline; Tailwind is loaded via CDN
- Validation is rule-based and does not catch all grammatical errors (e.g. it does not enforce subject–verb agreement)
- Chain Mode re-parses each evolved sentence with a positional fallback, so its model answers are less reliable than the single-step mode
- Voice input requires Chrome or Edge; `SpeechRecognition` is not supported in Firefox or Safari

### UX limitations

- Mobile layout is only lightly handled

## Testing

Pure logic (conjugation engine, sentence parsing, step validation, model-answer generation) is covered by a dependency-free unit test suite using Node's built-in test runner:

```bash
npm test        # or: node --test
```

The suite includes a regression sweep over every preset verb × every step to guard against malformed model answers.

## License

Released under the [MIT License](LICENSE).
