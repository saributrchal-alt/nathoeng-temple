import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { webcrypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

// Isolate transport from card field parsing, which has its own validation suite.
const source = fs.readFileSync(new URL('../src/lib/cardReaderBridge.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/, 'const parseCardFile = JSON.parse;\n').replaceAll('export ', '') +
  '\nthis.bridge = { readLatestDesktopCard, readLatestMobileCard, pendingMobileCardRequest, startMobileCardReader, clearMobileCardRequest, captureMobileCardReturn };';
const nonce = 'a'.repeat(32);
function setup(fetch) {
  const storage = new Map(), assigned = [], timeouts = [];
  let location = new URL('https://watt.nathoeng.com/?reader_nonce=' + nonce + '#admin-dashboard');
  const context = vm.createContext({ fetch, URL, URLSearchParams, Date, Uint8Array, TextEncoder, TextDecoder, atob,
    AbortSignal: { timeout: (ms) => { timeouts.push(ms); return {}; } },
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    crypto: { getRandomValues: (bytes) => bytes.fill(170), subtle: webcrypto.subtle },
    window: { location: { get href(){return location.href;},get hash(){return location.hash;},get search(){return location.search;},assign: (url) => assigned.push(url) },
      history: { replaceState: (_state, _title, url) => { location = new URL(url, location); } } } });
  vm.runInContext(source, context);
  return { bridge: context.bridge, storage, assigned, timeouts, context, navigate: (url) => { location = new URL(url); } };
}
function legacy(state) { state.storage.set('nathoeng_mobile_card_request', JSON.stringify({nonce,expiresAt:Date.now()+300000})); }

test('mobile permission failure can be retried with the same locally initiated request', async () => {
  let attempts = 0;
  const state = setup(async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:8765/v1/card/latest?token=' + nonce);
    assert.equal(options.credentials, 'omit'); assert.equal(options.targetAddressSpace, 'loopback');
    if (++attempts === 1) throw new TypeError('permission denied');
    return { ok: true, status: 200, text: async () => JSON.stringify({ read_at: new Date().toISOString() }) };
  });
  legacy(state);
  assert.equal(state.bridge.pendingMobileCardRequest(), nonce);
  await assert.rejects(state.bridge.readLatestMobileCard(nonce), /รับข้อมูลบัตรอีกครั้ง/);
  assert.equal(state.bridge.pendingMobileCardRequest(), nonce);
  await state.bridge.readLatestMobileCard(nonce);
  assert.equal(attempts, 2); assert.deepEqual(state.timeouts, [60000, 60000]);
});

test('mobile timeout has retry guidance and desktop timeout stays at seven seconds', async () => {
  const state = setup(async () => { throw Object.assign(new Error('timeout'), { name: 'TimeoutError' }); });
  legacy(state);
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

async function packetFor(card, boundNonce = nonce) {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await webcrypto.subtle.importKey('raw', Buffer.from('aa'.repeat(32), 'hex'), 'AES-GCM', false, ['encrypt']);
  const encrypted = await webcrypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128,
    additionalData:new TextEncoder().encode('https://watt.nathoeng.com|nathoeng-card-v1|' + boundNonce)},key,new TextEncoder().encode(JSON.stringify(card)));
  return 'v1.' + Buffer.from(iv).toString('base64url') + '.' + Buffer.from(encrypted).toString('base64url');
}
function returned(state, packet) { state.navigate('https://watt.nathoeng.com/?reader_nonce=' + nonce + '#admin-dashboard&reader_card=' + packet); }

test('direct encrypted return restores the admin route without a loopback fetch', async () => {
  let fetched = 0;
  const state = setup(async () => { fetched++; throw Error('direct return must not fetch localhost'); });
  state.bridge.startMobileCardReader();
  const request = JSON.parse(state.storage.get('nathoeng_mobile_card_request'));
  assert.equal(request.keyHex, 'aa'.repeat(32));
  assert.match(state.assigned[0], /&key=[a-f0-9]{64}#Intent;.*package=com\.saributr\.usbprobe;end$/);
  const card = {read_at:new Date().toISOString(),name:'ทดสอบ ส่งตรง',photo:'synthetic-photo'.repeat(500)};
  returned(state, await packetFor(card));
  assert.equal(state.bridge.pendingMobileCardRequest(),nonce);
  assert.equal(state.context.window.location.hash,'#admin-dashboard');
  const received = await state.bridge.readLatestMobileCard(nonce);
  assert.equal(received.name,card.name); assert.equal(received.photo,card.photo); assert.equal(fetched,0);
  state.bridge.clearMobileCardRequest();
  assert.equal(state.storage.size,0); assert.equal(state.context.window.location.search,'');
  await assert.rejects(state.bridge.readLatestMobileCard(nonce), /CARD_REQUEST/); assert.equal(fetched,0);
});

test('tampered, wrong-nonce, oversized and stale direct returns fail closed and erase the key', async () => {
  const card = {read_at:new Date().toISOString(),name:'synthetic'};
  const valid = await packetFor(card);
  const pieces = valid.split('.'), bytes = Buffer.from(pieces[2], 'base64url'); bytes[0] ^= 1;
  const packets = [pieces[0]+'.'+pieces[1]+'.'+bytes.toString('base64url'),
    await packetFor(card,'b'.repeat(32)), 'v1.'+'a'.repeat(45000),
    await packetFor({...card,read_at:new Date(Date.now()-121000).toISOString()})];
  for (const packet of packets) {
    const state = setup(async () => { throw Error('must not fetch'); });
    state.bridge.startMobileCardReader(); returned(state,packet);
    await assert.rejects(state.bridge.readLatestMobileCard(nonce), /CARD_RETURN|ข้อมูลบัตรเก่า/);
    assert.equal(state.storage.size,0);assert.equal(state.context.window.location.search,'');
  }
});

test('new requests require the direct return and do not silently fall back to localhost', async () => {
  let fetched=0;const state=setup(async()=>{fetched++;throw Error('must not fetch');});
  state.bridge.startMobileCardReader();
  await assert.rejects(state.bridge.readLatestMobileCard(nonce),/CARD_RETURN_MISSING/);
  assert.equal(fetched,0);
});

test('a malformed direct-return key is rejected without downgrading the transport', async () => {
  for (const keyHex of ['', 'bad-key']) {
    let fetched=0;const state=setup(async()=>{fetched++;throw Error('must not fetch');});
    state.storage.set('nathoeng_mobile_card_request',JSON.stringify({nonce,keyHex,expiresAt:Date.now()+300000}));
    await assert.rejects(state.bridge.readLatestMobileCard(nonce),/CARD_REQUEST/);
    assert.equal(fetched,0);assert.equal(state.storage.size,0);
    assert.equal(state.context.window.location.search,'');
  }
});

test('Android Java ciphertext decrypts with the browser Web Crypto implementation',
  {skip:!process.env.CARD_RETURN_JAVA_CLASSES}, async () => {
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'card-return-synthetic-'));
    try {
      const card={read_at:new Date().toISOString(),name:'นาย ทดสอบ ส่งตรง',
        avatar_image:'data:image/jpeg;base64,'+Buffer.alloc(5100,170).toString('base64')};
      const filename=path.join(directory,'synthetic.json');fs.writeFileSync(filename,JSON.stringify(card));
      const packet=execFileSync('java',['-cp',process.env.CARD_RETURN_JAVA_CLASSES,
        'com.saributr.usbprobe.CardReturnCipherTest','--fixture',filename],{encoding:'utf8'});
      const state=setup(async()=>{throw Error('must not fetch localhost');});
      state.bridge.startMobileCardReader();returned(state,packet);
      const received=await state.bridge.readLatestMobileCard(nonce);
      assert.equal(received.name,card.name);assert.equal(received.avatar_image,card.avatar_image);
      assert.equal(state.context.window.location.hash,'#admin-dashboard');
      assert.ok(packet.length<45000);assert.ok(!packet.includes(card.name));
    } finally {fs.rmSync(directory,{recursive:true,force:true});}
  });
