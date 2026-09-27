const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { createAppServer } = require('../server.cjs');

const rootDir = path.resolve(__dirname, '..');

async function withServer(options, callback) {
    const server = createAppServer({ rootDir, ...options });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
        await callback(`http://127.0.0.1:${port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
}

test('serves the application from the same origin as the API proxy', async () => {
    await withServer({ fetchImpl: async () => assert.fail('proxy should not be called') }, async origin => {
        const response = await fetch(`${origin}/`);
        const body = await response.text();

        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /text\/html/);
        assert.match(body, /Welcome to Tense Circle/);
    });
});

test('forwards Jev payload and authorization through the local proxy', async () => {
    const payload = { model: 'jev-latest', state: { attempt: 'Ich habe einen Apfel.' } };
    let forwarded;
    const fetchImpl = async (url, options) => {
        forwarded = { url, options };
        return new Response(JSON.stringify({ answers: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    await withServer({ fetchImpl, upstreamUrl: 'https://example.test/jev' }, async origin => {
        const response = await fetch(`${origin}/api/jev`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer test-key',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { answers: {} });
    });

    assert.equal(forwarded.url, 'https://example.test/jev');
    assert.equal(forwarded.options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(forwarded.options.body), payload);
});

test('rejects proxy requests without an API key', async () => {
    await withServer({ fetchImpl: async () => assert.fail('proxy should not be called') }, async origin => {
        const response = await fetch(`${origin}/api/jev`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}'
        });

        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: 'missing_api_key' });
    });
});
