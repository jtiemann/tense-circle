# Runbook

This runbook covers local operation, manual verification, common failures, and safe maintenance checks.

## Start the app locally

From the repository root:

```bash
node server.cjs
```

Open [http://localhost:8000](http://localhost:8000). Keep the terminal process running while testing and stop it with Ctrl+C when finished.

The included server is required because it provides both the static application and the same-origin `/api/jev` proxy. Opening `index.html` directly or using a plain static server will not provide the proxy.

## Prerequisites

- Modern browser with JavaScript enabled.
- Internet access to the TypeSafe AI Jev API, Tailwind CDN, and Google Fonts CDN.
- TypeSafe API key with access to `jev-latest`.

The key is stored in browser `localStorage` under `typesafe_jev_api_key_tense_circle`. It passes through the local proxy but is not stored or logged there. It is not a server secret and should not be used this way for a public production deployment.

## First-run procedure

1. Start the included Node server.
2. Open the local URL.
3. Confirm the API-key modal appears.
4. Enter the key and select **Start Learning**.
5. Confirm the modal fades away and the circular game appears.
6. Confirm the page shows `Step 1 of 11`, the first prompt, and an enabled sentence input.

## Manual smoke test

Use `Ich werde morgen einen Apfel haben.` for the first step, then verify:

1. Submitting fewer than 10 characters shows the local length error and does not call Jev.
2. Submitting a sentence without any configured `haben` form shows the local verb error.
3. A valid-looking submission disables the text area/button and shows `Evaluating...`.
4. A successful response creates one history item with the learner text, composite score, three dimensions, and decision certainty.
5. The step advances from 1 to 2 and the circle’s active label/orbit indicator move.
6. Ctrl+Enter (Windows/Linux) or Cmd+Enter (macOS) submits from the text area.
7. A rejected or uncertain composite decision keeps the learner on the same step and gives a targeted retry hint.
8. **Reset Game** asks for confirmation and, when confirmed, returns to step 1 with an empty history.
9. Completing step 11 shows the completion alert, returns the active step to step 1, and retains the history entries.
10. Reloading the page keeps the API-key modal suppressed but loses step progress and sentence history.

## Voice smoke test

1. Change **Voice experience** from **Off** to **Assisted**.
2. Select **Hear question** and confirm the instruction is spoken.
3. Select **Tap to answer in German**, allow microphone access, and say `Ich werde morgen einen Apfel haben.`
4. Confirm the status progresses through permission, microphone connection, and speech detection; tap again to stop if necessary.
5. Confirm interim text appears in the textarea and the final transcript exposes review controls.
6. Select **Read it back** and confirm the answer uses a German voice when one is installed.
7. Select **Say a command**, say “submit,” and confirm the normal Jev evaluation begins.
8. Switch to **Voice-first**, retry a rejected answer, and confirm feedback is spoken without the microphone listening simultaneously.
9. Confirm **voice off**, the visual controls, typing, and Ctrl/Cmd+Enter remain usable.

Speech recognition is browser-dependent. If it is unavailable, the app should disable microphone controls while retaining spoken prompts and normal typing.

## API-key troubleshooting

### The modal reappears after a submission

The app removes the saved key when it receives an HTTP 401 or 403 from Jev, or when its error text identifies an invalid Jev key.

1. Select **Change API Key** if the game is still visible.
2. Enter a valid key and submit.
3. If necessary, open browser developer tools and remove the `typesafe_jev_api_key_tense_circle` local-storage entry for the local origin.
4. Reload and enter the key again.

### “Network or processing error” appears

Check, in order:

1. Browser DevTools → Console for the logged `Jev API Error`.
2. Browser DevTools → Network for the request to `/api/jev`.
3. Whether the browser has network access and whether an extension, firewall, or content blocker is blocking the request.
4. Whether the API response contains `answers.rule_adherence`, `answers.language_quality`, and `answers.is_relevant_attempt` with their expected types.
5. Whether the API quota or model access is available for the key.

The current app does not retry requests or expose the provider’s detailed error body in the UI.

### The button stays in “Evaluating...”

The current implementation has no request timeout. Inspect the Network panel first. If the request is still pending, reload the page to clear the in-memory loading state. If the request completed, inspect the Console for a response-shape or JSON-parse error.

### Voice input is unavailable or inaccurate

1. Confirm the page is running at `http://localhost:8000`, not from a `file://` URL.
2. Confirm microphone permission is allowed for localhost in the browser.
3. Test in a browser that exposes `SpeechRecognition` or `webkitSpeechRecognition`.
4. Confirm the operating system has a working default microphone and German recognition support.
5. Review and edit the transcript before submitting; speech-recognition errors must not be treated as grammar errors.

Some browsers send audio to their own recognition service. The app does not store or forward raw audio itself. It performs a microphone preflight before recognition and reports when an embedded browser ends recognition before receiving audio. If that message persists, use the same localhost URL in a full Chrome, Edge, or Safari window.

## UI and CDN troubleshooting

### The page is unstyled or partially styled

Confirm that the browser can load:

- `https://cdn.tailwindcss.com`;
- the Google Fonts stylesheet;
- the local `style.css` file.

The app still has custom CSS, but much of the layout is supplied by Tailwind classes in `index.html`.

### The circle is misaligned or labels overlap

Check viewport width first. The custom responsive rules scale the circle to `0.85` below 1024px, `0.65` below 768px, and `0.5` below 480px. Then inspect whether `.step-label` elements were created and whether `NUM_STEPS` matches the number of entries in `steps`.

## Maintenance procedures

### Change a grammar step

1. Edit the relevant entry in `steps` in [`app.js`](./app.js).
2. Keep `prompt`, `voicePrompt`, `acceptanceCriteria`, `hint`, and `example` aligned. Jev receives the written fields; speech synthesis uses `voicePrompt` and `example`.
3. If changing the number of entries, update `NUM_STEPS` to match.
4. Repeat the first-run procedure and smoke-test progression through the changed step.

### Change the starting sentence or target verb

Review all of these together in [`app.js`](./app.js):

- `START_SENTENCE`;
- `VERB`;
- `requiredVerbForms`;
- the center verb text in [`index.html`](./index.html);
- Jev’s decision question and per-step prompts.

The current configuration consistently targets `haben`; changing one value alone can introduce a content/validation mismatch.

### Validate a change before handoff

Run syntax checks and the complete automated suite:

```bash
node --check app.js
node --check jev-evaluator.js
node --check voice-controller.js
node --check server.cjs
node --test tests/*.test.js
```

Then run the manual smoke test, with special attention to the affected flow.

### Run live Jev calibration

The live script submits six labeled examples covering Futur I, `dass` word order, and Konjunktiv I:

```bash
TYPESAFE_API_KEY="your-key" node scripts/calibrate-jev.cjs
```

It prints each dimension and exits nonzero when the accepted/not-accepted decision differs from the label. The key is read from the environment and is not printed. Running this script consumes TypeSafe API usage.

### Review the client-side API boundary

Any change touching `callJevAPI()` should verify:

- endpoint and model name;
- API-key handling;
- request JSON and Jev response schema;
- the Score levels, Noul criteria, policy weights, and thresholds in `jev-evaluator.js`;
- HTTP error mapping;
- malformed or incomplete response handling;
- loading-state cleanup in both success and failure paths.

## Deployment notes

The repository must be hosted with `server.cjs` or an equivalent server that implements the `/api/jev` proxy. It also needs the browser files plus network access to the external CDNs and TypeSafe’s API. Before publishing beyond personal use, review the API-key architecture: the current browser-exposed key model is not suitable for protecting a shared credential or controlling usage across users.

## Known operational limitations

- No persistent learner history or progress.
- Voice preferences persist locally, but transcripts and audio do not; raw audio is handled by the browser recognition implementation.
- Jev-only mode provides acceptance decisions, not corrections, ideal examples, or translations.
- No persistent logs, metrics, health endpoint, or alerting.
- Automated tests cover the decision layer, DOM contracts, voice state/command logic, static server, and Jev proxy. Real microphone, audible output, live Jev, and accessibility checks remain manual or opt-in.
- No lockfile or pinned CDN versions.
- Error messages intentionally hide most provider details from the learner.
