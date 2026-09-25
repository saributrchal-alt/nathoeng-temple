// Deploy as api/library-session.js in saributrchal-alt/nathoeng-temple.
// The temple's host-only login cookie is sent to watt.nathoeng.com by a
// credentialed request from library.nathoeng.com (same site, different origin).
import crypto from 'node:crypto';
import { getSessionFromRequest } from '../lib/_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://library.nathoeng.com');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).end();
  const session = getSessionFromRequest(req);
  if (!session?.memberId || session.actingAdminId) return res.status(401).json({ error: 'Login required' });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const secret = process.env.SESSION_SECRET;
  if (!url || !key || !secret) return res.status(503).json({ error: 'Member service unavailable' });
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/members?id=eq.${encodeURIComponent(session.memberId)}&select=id,role,membership_status&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store'
    });
    if (!response.ok) throw new Error('Member lookup failed');
    const member = (await response.json())[0];
    if (!member || (member.membership_status && member.membership_status !== 'active')) return res.status(403).json({ error: 'Inactive member' });
    const body = Buffer.from(JSON.stringify({ aud: 'nathoeng-library', sub: member.id, exp: Date.now() + 3 * 60 * 1000 })).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
    return res.status(200).json({ token: `${body}.${signature}`, member: { id: member.id, role: member.role } });
  } catch (error) { console.error('Library session:', error); return res.status(503).json({ error: 'Member service unavailable' }); }
}
