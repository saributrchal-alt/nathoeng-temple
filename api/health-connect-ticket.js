import crypto from 'node:crypto';
import { getSessionFromRequest } from '../lib/_auth.js';

// POST only. Creates a short-lived, signed, audience-bound handoff ticket.
// This endpoint does not grant access to Health data. Health must independently
// verify signature, prevent replay and check current member role server-side.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const session = getSessionFromRequest(req);
  if (!session?.memberId) return res.status(401).json({ success: false, message: 'Login required' });
  if (session.actingAdminId) return res.status(403).json({ success: false, message: 'Impersonation prohibited' });
  const secret = process.env.HEALTH_CONNECT_SIGNING_KEY;
  if (!secret || secret.length < 32) return res.status(503).json({ success: false, message: 'Health Connect not configured' });
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) return res.status(503).json({ success: false, message: 'Member verification unavailable' });
  try {
    const response = await fetch(base + '/rest/v1/members?id=eq.' + encodeURIComponent(session.memberId) + '&select=id,role,membership_status&limit=1', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store'
    });
    if (!response.ok) throw new Error('Lookup failed');
    const member = (await response.json())?.[0];
    if (!member || (member.membership_status && member.membership_status !== 'active')) {
      return res.status(403).json({ success: false, message: 'Membership inactive' });
    }
    const allowedResponse = await fetch(base + '/rest/v1/health_members?member_id=eq.' + encodeURIComponent(member.id) + '&is_active=eq.true&select=member_id&limit=1', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store'
    });
    if (!allowedResponse.ok) throw new Error('Health authorization lookup failed');
    const allowed = (await allowedResponse.json())?.[0];
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Community Health access not approved' });
    }
    const ticket = JSON.stringify({
      v: 1, iss: 'nathoeng.com', aud: 'health.nathoeng.com',
      member_id: member.id, jti: crypto.randomUUID(), iat: Date.now()
    });
    const signature = crypto.createHmac('sha256', secret).update(ticket).digest('hex');
    return res.status(200).json({ success: true, ticket, signature });
  } catch {
    return res.status(503).json({ success: false, message: 'Member verification unavailable' });
  }
}
