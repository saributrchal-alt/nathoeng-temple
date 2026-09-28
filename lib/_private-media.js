// Secrets and media requests stay on the server. Caller must check ownership.
const endpoint = 'https://media.nathoeng.com/private-media.php';
const idPattern = /^[a-f0-9]{32}$/;
export const memberPhotoUrl = id => {
  if (!idPattern.test(id)) throw new Error('Invalid media ID');
  return `https://watt.nathoeng.com/api/donation-profile?media=${id}`;
};
export const privateMediaEnabled = () => process.env.MEDIA_PRIVATE_ENABLED === 'true';
const mediaError = () => Object.assign(new Error('พื้นที่เก็บรูปส่วนตัวยังไม่พร้อม กรุณาตรวจ private-media.php และการตั้งค่า media'), { code: 'MEDIA_UNAVAILABLE' });
async function request(form) {
  const key = process.env.MEDIA_UPLOAD_KEY;
  if (process.env.MEDIA_UPLOAD_URL !== 'https://media.nathoeng.com/upload.php' || typeof key !== 'string' || key.length < 32) throw mediaError();
  form.set('project', 'temple');
  try {
    return await fetch(endpoint, { method: 'POST', headers: { 'X-Upload-Key': key }, body: form,
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000) });
  } catch { throw mediaError(); }
}
export async function privateMediaHealth() {
  const form = new FormData(); form.set('operation', 'health');
  const response = await request(form);
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.ok !== true) throw mediaError();
  return true;
}
export async function uploadPrivateImage(bytes, mime) {
  if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > 2097152 || !['image/jpeg','image/png','image/webp'].includes(mime)) throw new Error('Invalid image');
  const form = new FormData(); form.set('operation', 'upload');
  form.set('file', new Blob([bytes], { type: mime }), 'photo');
  const response = await request(form);
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.ok !== true || typeof data.id !== 'string' || !idPattern.test(data.id)
      || data.mime !== 'image/webp' || !Number.isInteger(data.bytes) || data.bytes < 1 || data.bytes > 2097152) throw mediaError();
  return data.id;
}
export async function storeMemberPicture(picture) {
  if (!picture || !privateMediaEnabled()) return picture;
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(picture);
  if (!match || picture.length > 100000) throw new Error('Invalid profile picture');
  return memberPhotoUrl(await uploadPrivateImage(Buffer.from(match[1], 'base64'), 'image/jpeg'));
}
export async function readPrivateImage(id) {
  if (typeof id !== 'string' || !idPattern.test(id)) throw new Error('Invalid media ID');
  const form = new FormData(); form.set('operation', 'read'); form.set('id', id);
  const response = await request(form);
  if (!response.ok || response.headers.get('content-type')?.split(';')[0] !== 'image/webp') throw mediaError();
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 2097152 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw mediaError();
  return bytes;
}
export function sendPrivateImage(res, bytes) {
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).send(bytes);
}
