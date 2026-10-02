import { parseCardFile } from '../components/parseCardFile';

// The Windows reader binds only to loopback and returns the latest card in memory.
export const CARD_READER_URL = 'http://127.0.0.1:8765/v1/card/latest';
export const MOBILE_CARD_REQUEST_KEY = 'nathoeng_mobile_card_request';
let encryptedMobileReturn = null;

function checkedCard(raw) {
  if (raw.length > 200000) throw Error('ข้อมูลบัตรใหญ่เกินกำหนด');
  let data;
  try { data = JSON.parse(raw); }
  catch { throw Error('แอปอ่านบัตรส่งข้อมูลไม่ถูกต้อง'); }
  const timestamp = Date.parse(data?.read_at);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > 120000 || timestamp - Date.now() > 10000)
    throw Error('ข้อมูลบัตรเก่าเกิน 2 นาที กรุณาอ่านบัตรอีกครั้ง');
  return parseCardFile(raw);
}

function mobileRequest() {
  try {
    const pending = JSON.parse(localStorage.getItem(MOBILE_CARD_REQUEST_KEY) || 'null');
    if (!/^[a-f0-9]{32}$/.test(pending?.nonce || '')) return null;
    if (!Number.isFinite(pending.expiresAt) || pending.expiresAt <= Date.now()) {
      localStorage.removeItem(MOBILE_CARD_REQUEST_KEY); encryptedMobileReturn = null; return null;
    }
    return pending;
  } catch { return null; }
}

// Capture before App reads its hash route. Only ciphertext appears in the
// fragment; the one-request key is held by the initiating browser, never the URL.
export function captureMobileCardReturn() {
  if (!window.location.hash.startsWith('#admin-dashboard&')) return;
  const packet = new URLSearchParams(window.location.hash.slice('#admin-dashboard&'.length)).get('reader_card');
  if (packet === null) return;
  const nonce = new URLSearchParams(window.location.search).get('reader_nonce');
  const pending = mobileRequest();
  encryptedMobileReturn = pending?.nonce === nonce ? { nonce, packet } : null;
  const url = new URL(window.location.href); url.hash = 'admin-dashboard';
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

export function clearMobileCardRequest() {
  localStorage.removeItem(MOBILE_CARD_REQUEST_KEY); encryptedMobileReturn = null;
  const url = new URL(window.location.href); url.searchParams.delete('reader_nonce');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

const hexBytes = (value) => Uint8Array.from(value.match(/../g), (pair) => parseInt(pair, 16));
const base64Bytes = (value) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));

async function readCard(url, mobile = false) {
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      // A mobile permission prompt can remain open while the operator reads it.
      signal: AbortSignal.timeout(mobile ? 60000 : 7000),
      targetAddressSpace: 'loopback'
    });
  } catch (error) {
    if (mobile) throw Error(error?.name === 'TimeoutError'
      ? 'รอรับข้อมูลเกิน 1 นาที หาก Chrome ขอสิทธิ์เข้าถึงอุปกรณ์ภายในเครื่อง ให้กดอนุญาตแล้วกด “รับข้อมูลบัตรอีกครั้ง” หากอ่านบัตรเกิน 2 นาที ให้กดอ่านใหม่'
      : 'ช่องส่งข้อมูลรุ่นเดิมรับบัตรไม่ได้ กด “รับข้อมูลบัตรอีกครั้ง” ภายใน 2 นาที หรือใช้แอป 1.5.6 แล้วกดอ่านใหม่');
    if (error?.name === 'TimeoutError') throw Error('แอปอ่านบัตรไม่ตอบสนอง กรุณาเปิดแอปบนคอมพิวเตอร์แล้วลองใหม่');
    throw Error('เชื่อมต่อแอปอ่านบัตรบนคอมพิวเตอร์ไม่ได้ กรุณาเปิดแอป 1.5 และอนุญาตการเข้าถึงอุปกรณ์ภายในเครื่องใน Chrome');
  }
  if (response.status === 404 || response.status === 204)
    throw Error('ยังไม่มีข้อมูลบัตรใหม่ กรุณาเสียบบัตรและรอให้แอปอ่านบัตรอ่านสำเร็จก่อน');
  if (!response.ok) throw Error('แอปอ่านบัตรไม่พร้อม กรุณาตรวจการเชื่อมต่อเครื่องอ่านบัตร');
  return checkedCard(await response.text());
}

export function readLatestDesktopCard() { return readCard(CARD_READER_URL); }

export async function readLatestMobileCard(nonce) {
  if (!/^[a-f0-9]{32}$/.test(nonce)) throw Error('คำขออ่านบัตรหมดอายุ กรุณากดอ่านบัตรใหม่');
  captureMobileCardReturn();
  const pending = mobileRequest();
  if (pending?.nonce !== nonce) throw Error('คำขออ่านบัตรหมดอายุ กรุณากดอ่านใหม่ [CARD_REQUEST]');
  if (Object.hasOwn(pending, 'keyHex')) {
    if (!/^[a-f0-9]{64}$/.test(pending.keyHex || '')) {
      clearMobileCardRequest();
      throw Error('คำขออ่านบัตรไม่ตรงกับเว็บนี้ กรุณากดอ่านใหม่ [CARD_REQUEST]');
    }
    if (encryptedMobileReturn?.nonce !== nonce)
      throw Error('แอปยังส่งข้อมูลด้วยช่องทางรุ่นเดิม กรุณาติดตั้ง 1.5.6 แล้วกดอ่านใหม่ [CARD_RETURN_MISSING]');
    const packet = encryptedMobileReturn.packet;
    try {
      if (packet.length > 45000 || !/^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{24,}$/.test(packet))
        throw Error('ข้อมูลส่งกลับไม่ครบหรือใหญ่เกินกำหนด [CARD_RETURN_SIZE]');
      const [, ivText, cipherText] = packet.split('.');
      const rawKey = hexBytes(pending.keyHex);
      let key;
      try { key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']); }
      finally { rawKey.fill(0); }
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64Bytes(ivText), tagLength: 128,
        additionalData: new TextEncoder().encode('https://watt.nathoeng.com|nathoeng-card-v1|' + nonce) }, key, base64Bytes(cipherText));
      const bytes = new Uint8Array(plaintext);
      try { const card = checkedCard(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); encryptedMobileReturn = null; return card; }
      finally { bytes.fill(0); }
    } catch (error) {
      clearMobileCardRequest();
      if (/ข้อมูลบัตร|ข้อมูลส่งกลับ|วันเกิด|รูปจากบัตร/.test(error.message)) throw error;
      throw Error('ข้อมูลส่งกลับตรวจสอบไม่ผ่าน กรุณากดอ่านบัตรใหม่ [CARD_RETURN_AUTH]');
    }
  }
  // Older, already-started requests keep their original transport.
  return readCard(CARD_READER_URL + '?token=' + nonce, true);
}

export function pendingMobileCardRequest() {
  try {
    captureMobileCardReturn();
    const nonce = new URLSearchParams(window.location.search).get('reader_nonce');
    return mobileRequest()?.nonce === nonce ? nonce : '';
  } catch { return ''; }
}

export function startMobileCardReader() {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const keyHex = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  encryptedMobileReturn = null;
  localStorage.setItem(MOBILE_CARD_REQUEST_KEY, JSON.stringify({ nonce, keyHex, expiresAt: Date.now() + 300000 }));
  window.location.assign('intent://read?nonce=' + nonce + '&key=' + keyHex + '#Intent;scheme=saributr-card;package=com.saributr.usbprobe;end');
}
