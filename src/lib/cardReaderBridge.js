import { parseCardFile } from '../components/parseCardFile';

// The Windows reader binds only to loopback and returns the latest card in memory.
export const CARD_READER_URL = 'http://127.0.0.1:8765/v1/card/latest';

export async function readLatestDesktopCard() {
  let response;
  try {
    response = await fetch(CARD_READER_URL, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
      targetAddressSpace: 'loopback'
    });
  } catch (error) {
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
