#!/usr/bin/env node

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_PORT = 8000;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_UPSTREAM_URL = 'https://api.typesafe.ai/v1/systemone';
const MAX_REQUEST_BYTES = 1024 * 1024;

const PUBLIC_FILES = new Map([
    ['/', ['index.html', 'text/html; charset=utf-8']],
    ['/index.html', ['index.html', 'text/html; charset=utf-8']],
    ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
    ['/verbs.js', ['verbs.js', 'text/javascript; charset=utf-8']],
    ['/jev-evaluator.js', ['jev-evaluator.js', 'text/javascript; charset=utf-8']],
    ['/voice-controller.js', ['voice-controller.js', 'text/javascript; charset=utf-8']],
    ['/style.css', ['style.css', 'text/css; charset=utf-8']]
]);

function sendJson(response, statusCode, body) {
    const payload = JSON.stringify(body);
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Cache-Control': 'no-store'
    });
    response.end(payload);
}

async function readRequestBody(request) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_REQUEST_BYTES) {
            const error = new Error('Request body is too large.');
            error.code = 'BODY_TOO_LARGE';
            throw error;
        }
        chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString('utf8');
}

async function proxyJevRequest(request, response, { fetchImpl, upstreamUrl }) {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        sendJson(response, 401, { error: 'missing_api_key' });
        return;
    }

    let body;
    try {
        body = await readRequestBody(request);
        JSON.parse(body);
    } catch (error) {
        const statusCode = error.code === 'BODY_TOO_LARGE' ? 413 : 400;
        sendJson(response, statusCode, { error: 'invalid_request' });
        return;
    }

    try {
        const upstreamResponse = await fetchImpl(upstreamUrl, {
            method: 'POST',
            headers: {
                Authorization: authorization,
                'Content-Type': 'application/json'
            },
            body
        });
        const upstreamBody = await upstreamResponse.text();

        response.writeHead(upstreamResponse.status, {
            'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(upstreamBody),
            'Cache-Control': 'no-store'
        });
        response.end(upstreamBody);
    } catch (error) {
        console.error('Jev upstream request failed:', error.message);
        sendJson(response, 502, { error: 'jev_upstream_unavailable' });
    }
}

async function serveStaticFile(request, response, rootDir, pathname) {
    const publicFile = PUBLIC_FILES.get(pathname);
    if (!publicFile) {
        sendJson(response, 404, { error: 'not_found' });
        return;
    }

    const [relativePath, contentType] = publicFile;
    try {
        const content = await fs.readFile(path.join(rootDir, relativePath));
        response.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': content.length,
            'Cache-Control': 'no-cache'
        });
        response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
        console.error(`Unable to serve ${relativePath}:`, error.message);
        sendJson(response, 500, { error: 'static_file_unavailable' });
    }
}

function createAppServer({
    rootDir = __dirname,
    fetchImpl = globalThis.fetch,
    upstreamUrl = DEFAULT_UPSTREAM_URL
} = {}) {
    if (typeof fetchImpl !== 'function') {
        throw new TypeError('A fetch implementation is required.');
    }

    return http.createServer(async (request, response) => {
        const url = new URL(request.url, 'http://localhost');

        if (url.pathname === '/api/jev') {
            if (request.method !== 'POST') {
                response.writeHead(405, { Allow: 'POST' });
                response.end();
                return;
            }
            await proxyJevRequest(request, response, { fetchImpl, upstreamUrl });
            return;
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
            response.writeHead(405, { Allow: 'GET, HEAD' });
            response.end();
            return;
        }

        await serveStaticFile(request, response, rootDir, url.pathname);
    });
}

if (require.main === module) {
    const port = Number.parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
    const host = process.env.HOST || DEFAULT_HOST;
    const server = createAppServer();

    server.listen(port, host, () => {
        console.log(`Tense Circle is running at http://localhost:${port}`);
    });
}

module.exports = {
    createAppServer,
    DEFAULT_UPSTREAM_URL
};
