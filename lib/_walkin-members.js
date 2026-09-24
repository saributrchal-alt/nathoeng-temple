import crypto from 'crypto';
import { promisify } from 'util';
import { createSessionToken, getSessionFromRequest, requireAdmin, setSessionCookie } from './_auth.js';

const scrypt = promisify(crypto.scrypt);
const usernamePattern = /^[a-z][a-z0-9._-]{3,31}$/;
const photoPattern = /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/;

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

async function db(url, key, path, method = 'GET', body) {
  const response = await fetch(`${url}${path}`, {
    method, headers: headers(key, method === 'GET' ? {} : { Prefer: 'return=representation' }),
    body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store'
  });
  const raw = await response.text();
  let result;
  try { result = raw ? JSON.parse(raw) : null; } catch { result = null; }
  if (!response.ok) {
    const error = new Error('Database request failed');
    error.status = response.status;
    error.code = result?.code;
    error.detail = result?.message || '';
    throw error;
  }
  return result;
}

function date(value) {
  if (!value) return null;
  const s = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s)) ||
      new Date(s).toISOString().slice(0, 10) !== s || s > new Date().toISOString().slice(0, 10)) return false;
  return s;
}

function preview(member) {
  return { id: member.id, fullName: member.full_name || member.display_name || '',
    picture: member.profile_image_url || member.picture_url || '', hasIdentityNumber: Boolean(member.tax_id) };
}

export async function handleWalkinMemberRequest(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(500).json({ success: false, message: 'Database configuration missing' });
  const action = String(req.body?.action || '');
  if (!['login', 'lookup', 'register', 'change_password'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

  if (action === 'change_password') {
    const session = getSessionFromRequest(req);
    if (!session?.memberId) return res.status(401).json({ success: false, message: 'Login required' });
    const current = String(req.body?.currentPassword || '');
    const next = String(req.body?.newPassword || '');
    if (!current || current.length > 128 || next.length < 12 || next.length > 128)
      return res.status(400).json({ success: false, message: 'New password must be 12–128 characters' });
    try {
      const rows = await db(url, key, `/rest/v1/member_password_credentials?member_id=eq.${encodeURIComponent(session.memberId)}&select=*&limit=1`);
      const account = rows?.[0];
      if (!account) return res.status(404).json({ success: false, message: 'No password account linked to this member' });
      const candidate = await scrypt(current, account.password_salt, 64);
      const stored = Buffer.from(account.password_hash, 'hex');
      if (stored.length !== 64 || !crypto.timingSafeEqual(candidate, stored))
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = (await scrypt(next, salt, 64)).toString('hex');
      await db(url, key, `/rest/v1/member_password_credentials?member_id=eq.${encodeURIComponent(session.memberId)}`,
        'PATCH', { password_salt: salt, password_hash: hash, failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Password change failed:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to change password' });
    }
  }

  if (action === 'login') {
    const username = String(req.body?.username || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!usernamePattern.test(username) || !password || password.length > 128)
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    try {
      const rows = await db(url, key, `/rest/v1/member_password_credentials?username=eq.${encodeURIComponent(username)}&select=member_id,password_salt,password_hash,locked_until&limit=1`);
      const account = rows?.[0];
      if (account?.locked_until && Date.parse(account.locked_until) > Date.now())
        return res.status(429).json({ success: false, message: 'Please try again in 15 minutes' });
      const salt = account?.password_salt || crypto.randomBytes(16).toString('hex');
      const derived = await scrypt(password, salt, 64);
      const stored = account ? Buffer.from(account.password_hash, 'hex') : Buffer.alloc(64);
      const valid = Boolean(account && stored.length === 64 && crypto.timingSafeEqual(derived, stored));
      if (!valid) {
        if (account) await db(url, key, '/rest/v1/rpc/record_member_password_attempt', 'POST', { p_username: username, p_success: false });
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      const members = await db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(account.member_id)}&select=*&limit=1`);
      const member = members?.[0];
      if (!member || member.membership_status === 'cancelled')
        return res.status(401).json({ success: false, message: 'Account unavailable' });
      await db(url, key, '/rest/v1/rpc/record_member_password_attempt', 'POST', { p_username: username, p_success: true });
      setSessionCookie(res, createSessionToken({ memberId: member.id, lineUid: member.line_uid,
        telegramUid: member.telegram_uid, authProvider: 'password', role: member.role || 'member' }));
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Member password login failed:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to sign in' });
    }
  }

  const session = requireAdmin(req, res);
  if (!session) return;
  const citizenId = String(req.body?.citizenId || '').replace(/[\s-]/g, '');
  if (citizenId && !/^\d{13}$/.test(citizenId))
    return res.status(400).json({ success: false, message: 'Citizen ID must have 13 digits' });
  if (action === 'lookup') {
    if (!citizenId) return res.status(400).json({ success: false, message: 'Citizen ID required' });
    try {
      const rows = await db(url, key, `/rest/v1/members?tax_id=eq.${citizenId}&select=*&limit=2`);
      if (rows.length > 1) return res.status(409).json({ success: false, message: 'Duplicate identity records require administrator review' });
      return res.status(200).json({ success: true, member: rows[0] ? preview(rows[0]) : null });
    } catch (error) {
      console.error('Card identity lookup failed:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to check existing members' });
    }
  }

  const fullName = String(req.body?.fullName || '').trim().replace(/\s+/g, ' ');
  const birthDate = date(req.body?.birthDate);
  const picture = String(req.body?.picture || '');
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const memberId = req.body?.memberId ? String(req.body.memberId) : null;
  if (fullName.length < 2 || fullName.length > 200 || birthDate === false ||
      (picture && (picture.length > 100000 || !photoPattern.test(picture))) ||
      (username && !usernamePattern.test(username)) ||
      (password && (!username || password.length < 12 || password.length > 128)) ||
      (username && !password) || (!memberId && !username)) {
    return res.status(400).json({ success: false, message: 'Check name, birth date, photo, username and password (12+ characters)' });
  }
  try {
    // The member ID is selected by the administrator after viewing a card match or member list.
    // The SQL function checks ID uniqueness and performs all changes in one transaction.
    const salt = username ? crypto.randomBytes(16).toString('hex') : null;
    const hash = username ? (await scrypt(password, salt, 64)).toString('hex') : null;
    const savedId = await db(url, key, '/rest/v1/rpc/register_walkin_member', 'POST', {
      p_member_id: memberId, p_full_name: fullName, p_citizen_id: citizenId || null,
      p_birth_date: birthDate, p_profile_image_url: picture || null,
      p_username: username || null, p_password_salt: salt, p_password_hash: hash,
      p_actor_member_id: String(session.memberId)
    });
    return res.status(201).json({ success: true, memberId: savedId });
  } catch (error) {
    if (error.code === '23505' || /CARD_ALREADY_REGISTERED|MEMBER_HAS_DIFFERENT_ID|already has a username/i.test(error.detail))
      return res.status(409).json({ success: false, message: 'Member, national ID, or username already exists. Review the existing member before saving.' });
    console.error('Walk-in member registration failed:', error.code || error.status || error);
    return res.status(500).json({ success: false, message: 'Unable to register member; ensure the database migration has been applied' });
  }
}
