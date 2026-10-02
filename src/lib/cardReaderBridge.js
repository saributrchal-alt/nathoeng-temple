import { parseCardFile } from '../components/parseCardFile';

// The Windows reader binds only to loopback and returns the latest card in memory.
export const CARD_READER_URL = 'http://127.0.0.1:8765/v1/card/latest';

async function readCard(url, mobile = false) {
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
      targetAddressSpace: 'loopback'
    });
  } catch (error) {
    if (mobile) throw Error('รับข้อมูลจากแอปมือถือไม่ได้ กรุณาเปิดแอปอ่านบัตร 1.5.4 แล้วอนุญาตการเข้าถึงอุปกรณ์ภายในเครื่องใน Chrome');
    if (error?.name === 'TimeoutError') throw Error('แอปอ่านบัตรไม่ตอบสนอง กรุณาเปิดแอปบนคอมพิวเตอร์แล้วลองใหม่');
    throw Error('เชื่อมต่อแอปอ่านบัตรบนคอมพิวเตอร์ไม่ได้ กรุณาเปิดแอป 1.5 และอนุญาตการเข้าถึงอุปกรณ์ภายในเครื่องใน Chrome');
  }
  if (response.status === 404 || response.status === 204)
    throw Error('ยังไม่มีข้อมูลบัตรใหม่ กรุณาเสียบบัตรและรอให้แอปอ่านบัตรอ่านสำเร็จก่อน');
  if (!response.ok) throw Error('แอปอ่านบัตรไม่พร้อม กรุณาตรวจการเชื่อมต่อเครื่องอ่านบัตร');
  const raw = await response.text();
  if (raw.length > 200000) throw Error('ข้อมูลบัตรใหญ่เกินกำหนด');
  let data;
  try { data = JSON.parse(raw); }
  catch { throw Error('แอปอ่านบัตรส่งข้อมูลไม่ถูกต้อง'); }
  const timestamp = Date.parse(data?.read_at);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > 120000 || timestamp - Date.now() > 10000)
    throw Error('ข้อมูลบัตรเก่าเกิน 2 นาที กรุณาอ่านบัตรอีกครั้ง');
  return parseCardFile(raw);
}

export function readLatestDesktopCard() { return readCard(CARD_READER_URL); }

export function readLatestMobileCard(nonce) {
  if (!/^[a-f0-9]{32}$/.test(nonce)) throw Error('คำขออ่านบัตรหมดอายุ กรุณากดอ่านบัตรใหม่');
  return readCard(CARD_READER_URL + '?token=' + nonce, true);
}

export const MOBILE_CARD_REQUEST_KEY = 'nathoeng_mobile_card_request';
export function pendingMobileCardRequest() {
  try {
    const nonce = new URLSearchParams(window.location.search).get('reader_nonce');
    const pending = JSON.parse(localStorage.getItem(MOBILE_CARD_REQUEST_KEY) || 'null');
    return /^[a-f0-9]{32}$/.test(nonce || '') && pending?.nonce === nonce && pending.expiresAt > Date.now() ? nonce : '';
  } catch { return ''; }
}

export function startMobileCardReader() {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(MOBILE_CARD_REQUEST_KEY, JSON.stringify({ nonce, expiresAt: Date.now() + 300000 }));
  window.location.assign('intent://read?nonce=' + nonce + '#Intent;scheme=saributr-card;package=com.saributr.usbprobe;end');
}
