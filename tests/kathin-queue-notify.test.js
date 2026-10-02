import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import handler from '../api/line-login.js';

async function run({ linked = true, tokenConfigured = true, invalid = false, stale = false, staff = true, expired = false, lineStatus = 200, alreadyAccepted = false, collected = false } = {}) {
  const keys = ['KATHIN_BRIDGE_SECRET', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'LINE_MESSAGING_ACCESS_TOKEN'];
  const saved = Object.fromEntries(keys.map(k => [k, process.env[k]])); const originalFetch = global.fetch;
  process.env.KATHIN_BRIDGE_SECRET = 'test-only-secret'; process.env.SUPABASE_URL = 'https://example.supabase.co/rest/v1/'; process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
  if (tokenConfigured) process.env.LINE_MESSAGING_ACCESS_TOKEN = 'test-only-line-token'; else delete process.env.LINE_MESSAGING_ACCESS_TOKEN;
  const calledAt = new Date().toISOString();
  const payload = Buffer.from(JSON.stringify({ aud: 'nathoeng-kathin-queue', orderId: 12, actorId: 'staff', calledAt, exp: Date.now() + (expired ? -1 : 60000) })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.KATHIN_BRIDGE_SECRET).update(`kathin-queue-notify.${payload}`).digest('base64url');
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options }); let data;
    if (url.includes('api.line.me')) return { ok: lineStatus === 200, status: lineStatus, headers: { get: () => alreadyAccepted ? 'existing-request' : null } };
    if (url.includes('kathin_drink_orders')) data = [{ id: 12, member_id: 'customer', accepted_by: 'staff', accepted_at: stale ? '2026-01-01T00:00:00Z' : calledAt,
      status: collected ? 'sent' : 'accepted', service_day: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }), queue_number: '7001' }];
    else if (url.includes('kathin_drink_staff')) data = staff ? [{ member_id: 'staff' }] : [];
    else if (url.includes('id=eq.staff')) data = [{ id: 'staff', role: 'member', membership_status: 'active' }];
    else data = [{ line_uid: linked ? `U${'a'.repeat(32)}` : null }];
    return { ok: true, json: async () => data };
  };
  const res = { setHeader() {}, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
  try { await handler({ method: 'POST', query: { route: 'kathin-queue-notify' }, body: { token: `${payload}.${invalid ? 'invalid' : sig}` } }, res); return { res, calls }; }
  finally { global.fetch = originalFetch; for (const k of keys) if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
}
test('unlinked member is skipped even when LINE credentials are absent', async () => {
  const { res, calls } = await run({ linked: false, tokenConfigured: false }); assert.equal(res.statusCode, 200); assert.equal(res.body.status, 'skipped_unlinked'); assert.ok(!calls.some(c => c.url.includes('api.line.me')));
});
test('linked member receives a fixed queue message from the existing temple OA', async () => {
  const { res, calls } = await run(); assert.equal(res.statusCode, 200); assert.equal(res.body.status, 'sent');
  const push = calls.at(-1); const body = JSON.parse(push.options.body); assert.equal(body.to, `U${'a'.repeat(32)}`); assert.match(body.messages[0].text, /7001 ถึงคิวแล้ว/); assert.match(body.messages[0].text, /มารับกาแฟได้แล้วค่ะ/);
  assert.match(push.options.headers['X-Line-Retry-Key'], /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-a[a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.deepEqual(Object.keys(res.body), ['status']);
});
test('tampered and expired relay tokens never reach the database or LINE', async () => {
  for (const options of [{ invalid: true }, { expired: true }]) { const { res, calls } = await run(options); assert.equal(res.statusCode, 401); assert.equal(calls.length, 0); }
});
test('relay independently verifies staff authorization and the persisted call', async () => {
  for (const options of [{ staff: false }, { stale: true }]) { const { res, calls } = await run(options); assert.ok([403, 409].includes(res.statusCode)); assert.ok(!calls.some(c => c.url.includes('api.line.me'))); }
});
test('a drink already handed over is not notified', async () => {
  const { res, calls } = await run({ collected: true }); assert.equal(res.body.status, 'skipped_collected'); assert.ok(!calls.some(c => c.url.includes('api.line.me')));
});
test('LINE failures are returned safely, and accepted retries are treated as sent', async () => {
  const failed = await run({ lineStatus: 500 }); assert.equal(failed.res.statusCode, 502); assert.deepEqual(failed.res.body, { status: 'failed' });
  const duplicate = await run({ lineStatus: 409, alreadyAccepted: true }); assert.equal(duplicate.res.body.status, 'sent');
  const first = await run(); assert.equal(first.calls.at(-1).options.headers['X-Line-Retry-Key'], duplicate.calls.at(-1).options.headers['X-Line-Retry-Key']);
});
