const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('every getElementById reference exists in index.html', () => {
    const referencedIds = [...appSource.matchAll(/getElementById\('([^']+)'\)/g)]
        .map(match => match[1]);
    const htmlIds = new Set([...htmlSource.matchAll(/\bid="([^"]+)"/g)]
        .map(match => match[1]));

    const missing = referencedIds.filter(id => !htmlIds.has(id));
    assert.deepEqual(missing, []);
});

test('history template exposes every class populated by renderHistory', () => {
    const requiredClasses = [
        'history-item',
        'step-name',
        'timestamp',
        'user-text',
        'decision-text',
        'dimension-text',
        'certainty-text'
    ];

    for (const className of requiredClasses) {
        assert.match(htmlSource, new RegExp(`class="[^"]*\\b${className}\\b`));
    }
});

test('the verb data loads before the application controller', () => {
    const versPosition = htmlSource.indexOf('<script src="verbs.js"></script>');
    const appPosition = htmlSource.indexOf('<script src="app.js"></script>');

    const orderPosition = htmlSource.indexOf('<script src="step-order.js"></script>');

    assert.ok(versPosition >= 0);
    assert.ok(appPosition > versPosition);
    assert.ok(orderPosition >= 0);
    assert.ok(appPosition > orderPosition);
});

test('the evaluator loads before the application controller', () => {
    const evaluatorPosition = htmlSource.indexOf('<script src="jev-evaluator.js"></script>');
    const voicePosition = htmlSource.indexOf('<script src="voice-controller.js"></script>');
    const appPosition = htmlSource.indexOf('<script src="app.js"></script>');

    assert.ok(evaluatorPosition >= 0);
    assert.ok(voicePosition > evaluatorPosition);
    assert.ok(appPosition > evaluatorPosition);
    assert.ok(appPosition > voicePosition);
});
