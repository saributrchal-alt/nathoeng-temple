import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

// Isolate transport from card field parsing, which has its own validation suite.
const source = fs.readFileSync(new URL('../src/lib/cardReaderBridge.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/, 'const parseCardFile = JSON.parse;\n').replaceAll('export ', '') +
  '\nthis.bridge = { readLatestDesktopCard, readLatestMobileCard, pendingMobileCardRequest, startMobileCardReader };';
const nonce = 'a'.repeat(32);
function setup(fetch) {
  const storage = new Map(), assigned = [], timeouts = [];
  const context = vm.createContext({ fetch, URLSearchParams, Date, Uint8Array,
    AbortSignal: { timeout: (ms) => { timeouts.push(ms); return {}; } },
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    crypto: { getRandomValues: (bytes) => bytes.fill(170) },
    window: { location: { search: '?reader_nonce=' + nonce, assign: (url) => assigned.push(url) } } });
  vm.runInContext(source, context);
  return { bridge: context.bridge, storage, assigned, timeouts, context };
}

test('mobile permission failure can be retried with the same locally initiated request', async () => {
  let attempts = 0;
  const state = setup(async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:8765/v1/card/latest?token=' + nonce);
    assert.equal(options.credentials, 'omit'); assert.equal(options.targetAddressSpace, 'loopback');
    if (++attempts === 1) throw new TypeError('permission denied');
    return { ok: true, status: 200, text: async () => JSON.stringify({ read_at: new Date().toISOString() }) };
  });
  state.bridge.startMobileCardReader();
  assert.equal(state.bridge.pendingMobileCardRequest(), nonce);
  await assert.rejects(state.bridge.readLatestMobileCard(nonce), /รับข้อมูลบัตรอีกครั้ง/);
  assert.equal(state.bridge.pendingMobileCardRequest(), nonce);
  await state.bridge.readLatestMobileCard(nonce);
  assert.equal(attempts, 2); assert.deepEqual(state.timeouts, [60000, 60000]);
  assert.match(state.assigned[0], /package=com\.saributr\.usbprobe;end$/);
});

test('mobile timeout has retry guidance and desktop timeout stays at seven seconds', async () => {
  const state = setup(async () => { throw Object.assign(new Error('timeout'), { name: 'TimeoutError' }); });
  await assert.rejects(state.bridge.readLatestMobileCard(nonce), /เกิน 1 นาที/);
  await assert.rejects(state.bridge.readLatestDesktopCard(), /คอมพิวเตอร์/);
  assert.deepEqual(state.timeouts, [60000, 7000]);
});

test('a forged or expired callback is not eligible for a mobile retry', () => {
  const state = setup(async () => { throw Error('must not fetch'); });
  assert.equal(state.bridge.pendingMobileCardRequest(), '');
  state.storage.set('nathoeng_mobile_card_request', JSON.stringify({ nonce, expiresAt: Date.now() - 1 }));
  assert.equal(state.bridge.pendingMobileCardRequest(), '');
  state.storage.set('nathoeng_mobile_card_request', JSON.stringify({ nonce: 'b'.repeat(32), expiresAt: Date.now() + 10000 }));
  assert.equal(state.bridge.pendingMobileCardRequest(), '');
});
