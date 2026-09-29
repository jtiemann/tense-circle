# Architecture

## Scope

This document describes the implementation as it exists today. Tense Circle is a browser application with a small same-origin Node proxy. The browser owns the UI, game state, validation flow, API credential, Jev request construction, and rendered learning history; the server hosts files and forwards Jev requests.

## System context

```text
                         CDN resources
                    ┌────────────────────┐
                    │ Tailwind CSS       │
                    │ Google Fonts       │
                    └─────────┬──────────┘
                              │
┌──────────────┐       ┌──────▼───────┐       ┌──────────────────┐       ┌─────────────────────┐
│ Learner      │◄─────►│ Browser app  │──────►│ Local Node server│──────►│ TypeSafe AI Jev API │
│              │       │ index.html   │ HTTP  │ static + /api/jev│ HTTPS │ jev-latest          │
└──────────────┘       │ app.js       │       └──────────────────┘       └─────────────────────┘
                       │ style.css     │
                       └──────┬────────┘
                              │
                       ┌──────▼───────┐
                       │ localStorage │
                       │ API key only │
                       └──────────────┘
```

There is no database or build pipeline. A dependency-free Node server hosts the browser files and proxies `/api/jev` to TypeSafe so the browser only makes same-origin requests.

## Components

### `index.html`: document and view shell

The HTML file provides:

- the API-key modal and form;
- the hidden game container;
- the circular UI shell, center verb hub, physical track, and orbit indicator;
- the current-step panel and sentence input;
- the answer button, loading state, and feedback message region;
- the voice-mode selector, speech controls, microphone status, and transcript-review actions;
- the learning-history list and its `<template>`;
- external font/Tailwind loading plus the `verbs.js`, `jev-evaluator.js`, `voice-controller.js`, and `app.js` script entry points.

Step labels are intentionally not hard-coded in HTML. `app.js` creates them from the selected verb's steps (`HABEN_STEPS`, or `Verbs.buildSteps()` from `verbs.js` for every other verb).

### `jev-evaluator.js`: decision boundary

This dependency-free module is shared by the browser and Node tests. It builds structured Jev requests, validates typed responses, normalizes dimension scores, applies the code-owned acceptance policy, and chooses deterministic feedback. It does not perform network requests or manipulate the DOM.

### `voice-controller.js`: optional speech adapter

This dependency-free browser module wraps speech synthesis and speech recognition behind a small controller. It owns voice modes, speaking/listening state, German answer recognition, English/German command aliases, and actionable recognition errors. It sends final text back to `app.js`; it never calls Jev and never changes scoring policy.

The interaction state is:

```text
idle → speaking → idle
idle → requesting-permission → listening-answer → review
review → submit/retry/read-back/listening-command
listening-command → submit/retry/repeat/hint/stop
```

Only one of synthesis or recognition should be active at a time. Starting speech cancels recognition, and starting recognition cancels speech.

Before its first recognition session, the controller uses `getUserMedia({ audio: true })` as a microphone/permission preflight and immediately releases that stream. Recognition still belongs to the browser implementation; no raw audio reaches the app server.

### `server.cjs`: static host and Jev proxy

The dependency-free Node server exposes only the browser assets required by the app and a `POST /api/jev` endpoint. The endpoint validates the presence of bearer authorization and JSON input, forwards the request to TypeSafe, and relays the upstream status and body. It does not persist keys, learner input, or responses.

### `app.js`: application controller and state

The JavaScript is organized into five practical areas:

1. **Configuration** — aligned `haben` exercises, explicit acceptance criteria, hints, and examples.
2. **State and DOM references** — `gameState` and the `dom` lookup object.
3. **Initialization and event wiring** — `initApp()`, `setupEventListeners()`, voice initialization, API-key handling, reset, keyboard submission, and input feedback.
4. **Rendering** — `renderCircle()`, `updateGameUI()`, `showMessage()`, `hideMessage()`, `setLoadingState()`, and `renderHistory()`.
5. **API and game flow** — `callJevAPI()` and `checkAnswer()`.

### `style.css`: custom visual system

Custom CSS supplies the visual rules that are cumbersome or specific to this app:

- color variables and body defaults;
- grid and glass-panel effects;
- step label themes and active-state styling;
- success/error message styles;
- animations for the page, modal, button shimmer, and background;
- history scrollbar styling;
- responsive scale changes for the circle and label typography.

Most spacing, layout, typography, and component sizing are Tailwind utility classes embedded in `index.html`.

## State model

```js
gameState = {
  apiKey: null,
  currentStepIndex: 0,
  sentenceHistory: [],
  isProcessing: false
}
```

- `apiKey` is loaded from or written to `localStorage`; the rest of `gameState` is runtime-only. Voice mode is stored separately under `tense_circle_voice_mode`.
- `currentStepIndex` selects the active entry in `steps`.
- `sentenceHistory` is newest-first. Each successful entry stores the step name, display timestamp, user input, normalized Jev evaluation, and a theme value.
- `isProcessing` prevents duplicate submissions and disables the input/button while Jev is running.

## Startup sequence

```text
DOMContentLoaded
  └─ initApp()
      ├─ attach event listeners
      ├─ create the voice controller and restore voice mode
      ├─ read typesafe_jev_api_key_tense_circle from localStorage
      └─ if present: set gameState.apiKey and start the game

start the game
  └─ hideModalAndStart()
      ├─ fade/hide API modal
      ├─ reveal game container
      ├─ renderCircle()
      └─ updateGameUI()
```

If there is no saved key, the modal remains visible. The game container is initially hidden and non-interactive.

## Game flow

```text
Learner types or dictates
  ├─ voice input: microphone preflight → German recognition → transcript review
  └─ input listener gives visual feedback

Check Answer
  ├─ reject if shorter than 10 characters
  ├─ reject if no complete word in requiredVerbForms is found
  ├─ disable controls and call Jev
  ├─ validate and combine the three Jev answers in code
  ├─ if rejected or uncertain: show a targeted hint, stay on step
  └─ if accepted:
       ├─ prepend result to sentenceHistory
       ├─ render history
       ├─ advance currentStepIndex
       ├─ after step 11: alert, set index to 0, retain history
       └─ update circle, prompt, input, message, and focus
```

The browser performs deterministic length and complete-word checks before the request. Jev supplies narrow judgments; the application—not the model—owns the final routing policy.

## Circle rendering

`renderCircle()` removes existing `.step-label` elements and creates one label per `steps` entry. Each label is placed with percentage coordinates on a radius of `42` relative to the circle container. The first label starts at the top, and the rest are spaced by `360 / NUM_STEPS` degrees.

`updateGameUI()`:

- applies `.active` and scale to the current label;
- rotates `#orbit-indicator` to the current step;
- fades completed labels and dims future labels;
- updates title, progress text, and instruction HTML;
- clears the input and feedback state;
- focuses the text area on screens wider than 768px.

## Jev integration

`callJevAPI()` sends a same-origin `POST` request to:

```text
/api/jev
```

`server.cjs` forwards the body and bearer authorization to `https://api.typesafe.ai/v1/systemone`. Provider responses and status codes pass back through the proxy without requiring the browser to receive cross-origin permission from TypeSafe.

The request contains a structured state object with:

- the fixed starting sentence;
- the current step prompt, explicit acceptance criteria, hint, and valid example;
- the learner’s attempt;
- model `jev-latest`.

Three independent questions run in the same request:

- `rule_adherence`: a four-level Score from no usable attempt to clearly demonstrated rule;
- `language_quality`: a four-level Score from not a German sentence to clear German;
- `is_relevant_attempt`: a Noul that distinguishes a sincere answer from unrelated or meta-level text.

`evaluateJevResponse()` validates all answer types and numeric ranges. It normalizes the two Scores, calculates a weighted composite (`65%` rule, `25%` language, `10%` relevance), and derives decision certainty from both Score confidences plus the Noul’s distance from `0.5`. Thresholds in `DEFAULT_POLICY` produce one of three states: `accepted`, `rejected`, or `uncertain`. Rule adherence must reach at least `2.25/3`, because level 2 explicitly represents an attempted construction with material rule errors. Uncertain answers do not advance automatically.

The request authenticates with `Authorization: Bearer <API_KEY>`. HTTP 401 and 403 are mapped to an API-key error, HTTP 429 to a quota/rate-limit error, and other non-2xx responses become generic API errors. Missing, mistyped, out-of-range, or incomplete Jev answers fail closed.

## Trust boundaries and risks

- The API key crosses from the user into browser `localStorage`, through the local proxy, and into TypeSafe AI. The proxy does not persist or log it.
- Learner text crosses from the browser through the local proxy to TypeSafe AI.
- In voice modes, browser speech recognition may send raw microphone audio to a browser-vendor service. The application itself keeps only the transcript and sends only confirmed text to Jev.
- Jev output is normalized to three dimensions, a composite score, and decision certainty before being stored/rendered.
- Noul probability is not mislabeled as a separate confidence value; certainty is derived explicitly in application code.
- Model thresholds and weights are product policy, not proof of grammatical correctness.
- History content is inserted using `textContent`, which avoids treating returned learner text as HTML. Prompt content is inserted with `innerHTML` because the static step prompts contain Markdown-like emphasis that is not actually converted to HTML.
- There is no request timeout or cancellation path, so a hanging request keeps the UI in its loading state.

## Current improvement seams

The clearest boundaries for future work are:

- isolate API-key management and Jev transport behind a service module;
- move API-key entry and storage fully to the server for any shared or public deployment;
- grow the live calibration set into a teacher-labeled corpus for all 11 steps;
- tune per-step policy thresholds if error patterns differ materially by construction;
- persist or explicitly export learning history if product requirements call for it;
- add browser tests around step progression, completion, reset, API failures, and history rendering;
- replace browser-native recognition with a provider-backed adapter if consistent embedded-browser support becomes a requirement;
- define whether each answer should build on the previous answer or independently transform the base sentence.
