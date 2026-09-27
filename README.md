# Tense Circle

Tense Circle (`Das Verb-Kreisspiel`) is a browser-based German grammar practice game. The learner transforms a starting sentence through an 11-step circle of tense, mood, modal-verb, and subordinate-clause exercises. Jev evaluates each attempt on rule adherence, German sentence quality, and task relevance. Application code combines those dimensions into an accepted, rejected, or uncertain result.

This repository is a dependency-light browser application with a small Node server. The server hosts the static files and proxies Jev requests so browser CORS restrictions do not block evaluation. There is no build step or package manager.

## Current feature set

- API-key setup modal with a link to the TypeSafe dashboard.
- TypeSafe AI Jev answer evaluation through a same-origin local proxy.
- Eleven guided grammar steps, rendered around a circular progress UI.
- Local input checks for minimum length and a form of `haben`.
- Three focused Jev questions in one request: two descriptive Scores and one Noul.
- Deterministic composite scoring, confidence-aware routing, and targeted retry hints.
- In-session learning history with dimension scores and decision certainty.
- Reset-progress and change-API-key controls.
- Responsive layout with Tailwind utility classes, custom CSS, animations, and a mobile scale-down for the circle.

## Requirements

- A modern browser with JavaScript, `fetch`, `localStorage`, and `<template>` support.
- Network access to:
  - Google Fonts;
  - the Tailwind CDN;
  - the TypeSafe AI Jev API.
- A TypeSafe API key with access to the `jev-latest` model.
- Node.js 18 or later for the local server, Jev proxy, automated tests, and optional live calibration script.

## Run locally

From the repository root:

```bash
node server.cjs
```

Open [http://localhost:8000](http://localhost:8000) in a browser. On first load, enter a TypeSafe API key. The app saves it under the `typesafe_jev_api_key_tense_circle` `localStorage` key and reuses it on later visits in the same browser profile. Jev requests go to the same-origin `/api/jev` route, which forwards them to TypeSafe.

There are no npm commands or dependencies to install at present.

## How to play

1. Enter a TypeSafe API key and select **Start Learning**.
2. Read the current rule and starting sentence.
3. Write a German sentence that uses the requested construction and a form of `haben`.
4. Select **Check Answer**, or press Ctrl+Enter / Cmd+Enter in the text area.
5. Review the rule, German-quality, relevance, and certainty scores in the learning-history entry.
6. Continue through all 11 steps. After the final step, the app shows a completion alert and returns the active step to step 1 while keeping the history visible.
7. Use **Reset Game** to clear the current step and in-memory history. Use **Change API Key** to replace the browser-stored key.

## Repository layout

| File | Responsibility |
| --- | --- |
| [`index.html`](./index.html) | Page structure, API-key modal, game layout, circle tracks, interaction controls, history template, CDN scripts/styles. |
| [`app.js`](./app.js) | Exercise configuration, browser state, event handlers, Jev transport, progress advancement, and rendering. |
| [`jev-evaluator.js`](./jev-evaluator.js) | Structured Jev request builder, response validation, composite decision policy, and feedback selection. |
| [`server.cjs`](./server.cjs) | Local static server and same-origin proxy to the TypeSafe Jev API. |
| [`style.css`](./style.css) | Custom colors, glass panels, circle labels, status messages, animations, scrollbar styling, and responsive overrides. |
| [`tests/`](./tests) | Dependency-free tests for request shape, word validation, decision routing, malformed responses, DOM IDs, history-template hooks, and script order. |
| [`scripts/calibrate-jev.cjs`](./scripts/calibrate-jev.cjs) | Optional live, labeled Jev calibration cases for tuning policy thresholds. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Component boundaries, state flow, API contract, and current design constraints. |
| [`RUNBOOK.md`](./RUNBOOK.md) | Local operation, smoke testing, troubleshooting, and maintenance procedures. |

## Configuration points

The main game configuration is at the top of [`app.js`](./app.js):

- `START_SENTENCE` controls the sentence repeated in the instructions.
- `VERB` controls the local-validation error message.
- `NUM_STEPS` should match the number of entries in `steps`.
- `steps` defines each step’s prompt, acceptance criteria, hint, valid example, and visual theme.
- `requiredVerbForms` defines the complete German words accepted by local validation.
- `callJevAPI()` owns only the HTTP transport.
- `DEFAULT_POLICY` in [`jev-evaluator.js`](./jev-evaluator.js) defines dimension thresholds, clear-failure boundaries, minimum certainty, and composite weights.

The Tailwind theme and CDN configuration are embedded in the `<head>` of [`index.html`](./index.html). Visual behavior that is not expressed through Tailwind classes lives in [`style.css`](./style.css).

## Testing

Run the local decision tests:

```bash
node --test tests/*.test.js
```

To test real Jev behavior against six labeled German examples, supply a key through the environment and run the calibration script:

```bash
TYPESAFE_API_KEY="your-key" node scripts/calibrate-jev.cjs
```

The script does not print the key. It reports the expected and actual decision plus each dimension score, and exits nonzero when a case does not match. Live calibration consumes TypeSafe API usage.

The evaluator design follows TypeSafe’s guidance to use [structured state](https://docs.typesafe.ai/concepts/state), ask [one proposition per Noul and several questions per call](https://docs.typesafe.ai/primitives/noul), use [Score for descriptive spectra](https://docs.typesafe.ai/primitives/score), and keep [composite weighting in application code](https://docs.typesafe.ai/patterns/composite-scoring).

## Security and privacy notes

The API key is entered into the browser, stored in `localStorage`, and sent to the same-origin local proxy in the `Authorization` header. The proxy forwards it to TypeSafe without storing or logging it. This removes browser CORS failures but is still a personal-development design: anyone with access to the browser profile or page JavaScript may be able to access the key. User sentences are sent to Jev for evaluation. See the [TypeSafe quick start](https://docs.typesafe.ai/introduction/quickstart) for the current API contract.

Before a public or multi-user deployment, move API access behind a server-side boundary, add authentication and quota controls, define a privacy policy, and avoid exposing provider credentials to the client.

## Known current limitations

- Progress and sentence history are lost when the page is reloaded; only the API key is persisted.
- Local validation checks complete words, but it only proves that a configured form of `haben` is present; Jev still judges the construction.
- Jev-only mode does not generate corrections, ideal examples, or translations; the learner currently receives a decision score rather than textual feedback.
- The decision policy is heuristic and needs calibration against a larger teacher-labeled German dataset.
- The rule-adherence gate requires a Score of at least `2.25` out of `3`; level 2 represents a recognizable construction that still contains a material rule error.
- Jev’s primary training language is English, so German-language judgments require empirical monitoring and may remain weaker than English judgments.
- API errors are reduced to broad UI messages. There is no retry backoff, request timeout, offline mode, or structured telemetry.
- Tailwind and fonts are loaded from CDNs, so a blocked or unavailable network changes the appearance and may affect operation.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the detailed current design and [`RUNBOOK.md`](./RUNBOOK.md) for operational checks.
