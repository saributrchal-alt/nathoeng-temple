import { getSessionFromRequest } from './_auth.js';
import { memberPhotoUrl, readPrivateImage, sendPrivateImage, privateMediaHealth, privateMediaEnabled } from './_private-media.js';
export default async function memberPhoto(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).end();
  const session = getSessionFromRequest(req);
  if (!session?.memberId) return res.status(401).end('Login required');
  if (req.query?.media === 'health') {
    if (session.role !== 'admin') return res.status(403).end('Forbidden');
    try {
      await privateMediaHealth();
      return res.status(200).json({ success: true, privateMediaReady: true, enabled: privateMediaEnabled() });
    } catch { return res.status(503).json({ success: false, privateMediaReady: false, enabled: privateMediaEnabled() }); }
  }
  const id = req.query?.media;
  if (typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id)) return res.status(400).end('Invalid media ID');
  try {
    const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!base || !key) throw new Error('Missing database configuration');
    // The database link establishes ownership. A random ID alone grants no access.
    const owner = session.role === 'admin' ? '' : `&id=eq.${encodeURIComponent(session.memberId)}`;
    const response = await fetch(`${base}/rest/v1/members?profile_image_url=eq.${encodeURIComponent(memberPhotoUrl(id))}${owner}&select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Lookup failed');
    const members = await response.json();
    if (!Array.isArray(members) || !members.length) return res.status(404).end('Photo not found');
    return sendPrivateImage(res, await readPrivateImage(id));
  } catch { return res.status(503).end('Photo unavailable'); }
}
