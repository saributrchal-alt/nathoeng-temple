import { getSessionFromRequest } from '../lib/_auth.js';

// Read-only prerequisite for Health SSO. Never accept a role or member ID from the browser.
// This endpoint does NOT issue a Health session or grant access to medical records.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Cookie');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const session = getSessionFromRequest(req);
  if (!session?.memberId) return res.status(401).json({ success: false, message: 'Login required' });
  if (session.actingAdminId) return res.status(403).json({ success: false, message: 'Impersonated sessions cannot access Health' });
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) return res.status(503).json({ success: false, message: 'Service unavailable' });
  try {
    const response = await fetch(
      base + '/rest/v1/members?id=eq.' + encodeURIComponent(session.memberId) + '&select=id,role,membership_status&limit=1',
      { headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store' }
    );
    if (!response.ok) throw new Error('Member lookup failed');
    const members = await response.json();
    const member = members?.[0];
    if (!member || member.role !== 'admin' || (member.membership_status && member.membership_status !== 'active')) {
      return res.status(403).json({ success: false, message: 'Health admin permission required' });
    }
    return res.status(200).json({ success: true, role: 'admin', healthSessionReady: false });
  } catch {
    return res.status(503).json({ success: false, message: 'Unable to verify access' });
  }
}
