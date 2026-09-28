import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { test } from 'node:test';
import templeLogin from '../api/line-login.js';
import kathinApi from '../kathin/api/kathin-drinks.js';
import { createSessionToken } from '../lib/_auth.js';

function responseStub() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; }
  };
}

test('Kathin exchanges the temple assertion and uses the Supabase secret key', async () => {
  const originalFetch = global.fetch;
  const previous = { secret: process.env.SESSION_SECRET, key: process.env.SUPABASE_SECRET_KEY, url: process.env.SUPABASE_URL };
  process.env.SESSION_SECRET = 'test-kathin-shared-secret';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    const rows = [{ id: 'member-1', role: 'member', membership_status: 'active' }];
    return { ok: true, json: async () => rows, text: async () => JSON.stringify(rows) };
  };
  try {
    const templeSession = createSessionToken({ memberId: 'member-1', role: 'member' });
    const templeRes = responseStub();
    await templeLogin({ method: 'GET', query: { route: 'kathin-session' }, headers: { cookie: `nathoeng_session=${templeSession}` }, url: '/api/line-login?route=kathin-session' }, templeRes);
    assert.equal(templeRes.statusCode, 200);
    assert.equal(templeRes.headers['Access-Control-Allow-Origin'], 'https://kathin.nathoeng.com');
    const [payload] = templeRes.body.token.split('.');
    assert.equal(JSON.parse(Buffer.from(payload, 'base64url').toString()).aud, 'nathoeng-kathin');

    const kathinRes = responseStub();
    await kathinApi({ method: 'POST', body: { action: 'session-exchange', token: templeRes.body.token }, headers: {}, url: '/api/kathin-drinks' }, kathinRes);
    assert.equal(kathinRes.statusCode, 200);
    assert.match(kathinRes.headers['Set-Cookie'], /nathoeng_session=.*HttpOnly/);
    assert.ok(calls.length >= 2);
    assert.equal(calls.at(-1).options.headers.apikey, 'sb_secret_test');
    assert.equal(calls.at(-1).options.headers.Authorization, undefined);
  } finally {
    global.fetch = originalFetch;
    for (const [name, value] of Object.entries({ SESSION_SECRET: previous.secret, SUPABASE_SECRET_KEY: previous.key, SUPABASE_URL: previous.url })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test('Kathin rejects assertions for another service', async () => {
  const prior = { secret: process.env.SESSION_SECRET, key: process.env.SUPABASE_SECRET_KEY, url: process.env.SUPABASE_URL };
  process.env.SESSION_SECRET = 'test-kathin-shared-secret';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  const payload = Buffer.from(JSON.stringify({ aud: 'nathoeng-gears', sub: 'member-1', exp: Date.now() + 60000 })).toString('base64url');
  const token = payload + '.' + crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  const res = responseStub();
  try {
    await kathinApi({ method: 'POST', body: { action: 'session-exchange', token }, headers: {}, url: '/api/kathin-drinks' }, res);
    assert.equal(res.statusCode, 401);
  } finally {
    for (const [name, value] of Object.entries({ SESSION_SECRET: prior.secret, SUPABASE_SECRET_KEY: prior.key, SUPABASE_URL: prior.url })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
