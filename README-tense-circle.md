# Tense Circle

A browser-based German grammar practice app built around a circular sequence of tense and clause transformations.

The app presents one fixed starting sentence and asks the learner to rewrite or expand it through an 11-step “verb circle.” At each step, the learner writes a new German sentence that follows a specific grammar instruction. The app then sends the attempt to the Gemini API for correction, validation, and a model answer.

## What it does

Tense Circle is a small single-page app for guided German sentence transformation practice.

Current behavior in this version:

- Uses a fixed starting sentence: `Ich lege den Apfel auf den Tisch.`
- Uses a fixed target verb hub in the UI: `haben`
- Guides the learner through 11 sequential grammar tasks
- Performs lightweight client-side validation before sending the answer to Gemini
- Uses Gemini to:
  - reject clearly invalid or unrelated answers
  - correct the learner’s sentence
  - produce an ideal suggested sentence
  - provide an English translation of the suggested sentence
- Stores the Gemini API key in browser `localStorage`
- Shows a running history of attempts and feedback in the right-hand panel
- Resets to step 1 after the full circle is completed

## Learning flow

The current app defines these 11 steps:

1. Prediction
2. Modal (present)
3. Modal Past
4. Simple Past
5. Conditional
6. Perfect
7. Conditional (past)
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
- Google Fonts
- Gemini 2.5 Flash via direct browser `fetch`

## Project structure

```text
.
├── index.html   # Main single-page UI
├── app.js       # Application state, rendering, validation, Gemini integration
└── style.css    # Custom styling and animations
```

## How to run

Because this project is fully static, you can run it with any simple local web server.

### Option 1: open directly

Open `index.html` in a browser.

### Option 2: serve locally

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Setup

On first launch, the app asks for a Gemini API key.

The key is stored in the browser under:

```text
gemini_api_key_tense_circle
```

To get a key, use Google AI Studio.

## How the app works internally

### 1. Initialization

On `DOMContentLoaded`, the app:

- checks `localStorage` for an existing Gemini key
- shows the API modal if no key is present
- sets up UI event listeners

### 2. State model

The app maintains a simple in-memory state object:

- `apiKey`
- `currentStepIndex`
- `sentenceHistory`
- `isProcessing`

### 3. Validation

Before calling Gemini, the app performs basic checks:

- sentence length must be at least 10 characters
- the input must include one of several accepted forms related to `haben`

This is only a coarse check and does not guarantee grammatical correctness.

### 4. AI evaluation

The browser sends the learner’s answer and the current rule prompt to Gemini.

Gemini is instructed to return JSON with:

- `isValid`
- `errorMessage`
- `correctedAttempt`
- `suggestedSentence`
- `englishTranslation`

### 5. History rendering

Each successful response is added to a history panel showing:

- step name
- timestamp
- what the learner wrote
- grammar correction, when needed
- ideal suggestion
- English translation

## UI summary

The interface has three main parts:

### API key modal

A startup modal that collects and stores the Gemini API key.

### Circle panel

A circular progress visualization with:

- a center hub showing the focus verb
- 11 labels positioned around the orbit
- an orbit indicator that rotates to the active step

### Practice and history panel

A right-hand column containing:

- current step title
- current grammar instruction
- sentence textarea
- check button with loading state
- success/error message area
- scrollable history of feedback

## Known limitations in the current version

This README reflects the repo as it exists now, and there are several structural limitations worth calling out.

### Product limitations

- Only one fixed starting sentence is supported
- Only one fixed learning path is supported
- The UI centers on `haben`, but the original starting sentence uses `legen`, so the conceptual model is not fully consistent
- Progress is not persisted beyond the current session except for the API key
- There is no learner profile, scoring, lesson selection, or spaced repetition

### Technical limitations

- API calls are made directly from the browser
- The user’s API key is stored locally in the browser rather than handled by a backend
- There is no test suite
- There is no modular architecture; all app logic lives in one JavaScript file
- There is no package manifest, build pipeline, or deployment config
- Validation is mostly heuristic string matching
- Error handling is functional but minimal

### UX limitations

- The user cannot move freely between steps
- The reset action clears progress without any persistence
- The completion flow simply shows an alert and resets the step index to 0
- Accessibility appears limited: no explicit keyboard flow beyond submit shortcuts, and no a11y-focused structure
- Mobile behavior is only lightly handled

## Suggestions for a v2

A stronger second version could separate the app into four layers:

### Content layer

- configurable verb packs
- multiple starting sentences
- reusable grammar step definitions
- CEFR-based difficulty levels

### Evaluation layer

- rule-aware validation before AI calls
- structured prompt templates per exercise type
- clearer grading rubric
- support for “close but acceptable” answers

### App architecture

- modular JavaScript or TypeScript
- component-based UI
- persistent learner progress
- local lesson state and resumable sessions

### Platform and security

- backend proxy for model calls
- server-side key handling
- analytics and telemetry
- test coverage for step logic and rendering

## Development notes for the next rewrite

When rebuilding this project, the most important design decision is to separate:

1. exercise content
2. evaluation logic
3. UI state
4. model integration

Right now those concerns are tightly coupled. A rewrite will go much faster if the grammar path becomes data-driven and the AI integration is abstracted behind a small evaluation interface.

## License

No license file is currently included in this repository. If you intend to share or reuse the project, add an explicit license.
