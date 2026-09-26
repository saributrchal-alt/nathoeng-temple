import { reviewedCardMatches } from './_card-verification.js';
import crypto from 'crypto';
import { getMemberProfileDetails } from './_member-profile-details.js';
import { validateThaiAddress, formatThaiAddress } from '../src/lib/thaiAddress.js';
import { promisify } from 'util';
import { createSessionToken, getSessionFromRequest, requireAdmin, setSessionCookie } from './_auth.js';
import { completeShortMemberNumber, memberIdFromNumber } from '../src/memberNumber.js';

const scrypt = promisify(crypto.scrypt);
const usernamePattern = /^[a-z][a-z0-9._-]{3,31}$/;
const photoPattern = /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/;

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

async function db(url, key, path, method = 'GET', body, timeoutMs) {
  const response = await fetch(`${url}${path}`, {
    method, headers: headers(key, method === 'GET' ? {} : { Prefer: 'return=representation' }),
    body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store',
    ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {})
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

async function saveWithCardReview(url, key, operation, data, verified) {
  if (!verified) return db(url, key, '/rest/v1/rpc/' + operation, 'POST', data);
  return db(url, key, '/rest/v1/rpc/save_member_with_card_verification', 'POST', {
    p_operation: operation, p_data: data
  });
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
  if (!['login', 'lookup', 'lookup_member_number', 'member_card_number', 'register', 'change_password', 'admin_member', 'admin_edit_member', 'start_as_member', 'stop_as_member'].includes(action))
    return res.status(400).json({ success: false, message: 'Invalid action' });

  if (action === 'member_card_number') {
    const session = getSessionFromRequest(req);
    if (!session?.memberId) return res.status(401).json({ success: false, message: 'Login required' });
    const memberId = String(req.body?.memberId || session.memberId);
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(memberId))
      return res.status(400).json({ success: false, message: 'Invalid member ID' });
    if (memberId !== session.memberId && session.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Administrator permission required' });
    try {
      const cardNumber = await db(url, key, '/rest/v1/rpc/get_or_create_member_card_number',
        'POST', { p_member_id: memberId }, 8000);
      return res.status(200).json({ success: true, cardNumber });
    } catch (error) {
      console.error('Unable to issue member card number:', error.code || error.status || error);
      return res.status(503).json({ success: false, message: 'Member card numbers are unavailable. Run member-card-numbers.sql in Supabase.' });
    }
  }

  if (action === 'stop_as_member') {
    const session = getSessionFromRequest(req);
    if (!session?.actingAdminId || session.role !== 'member')
      return res.status(403).json({ success: false, message: 'No staff member session to restore' });
    try {
      const rows = await db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(session.actingAdminId)}&select=id,role,line_uid,telegram_uid&limit=1`);
      const admin = rows?.[0];
      if (admin?.role !== 'admin') return res.status(403).json({ success: false, message: 'Administrator account is no longer available' });
      setSessionCookie(res, createSessionToken({ memberId: admin.id, role: 'admin',
        lineUid: admin.line_uid, telegramUid: admin.telegram_uid,
        authProvider: session.actingAdminAuthProvider || 'line' }));
      console.info('Admin stopped acting as member:', { adminId: admin.id, memberId: session.memberId });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Unable to restore admin session:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to restore administrator session' });
    }
  }

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
      const rows = await db(url, key, `/rest/v1/member_password_credentials?username=eq.${encodeURIComponent(username)}&select=member_id,password_salt,password_hash,locked_until&limit=1`, 'GET', undefined, 8000);
      const account = rows?.[0];
      if (account?.locked_until && Date.parse(account.locked_until) > Date.now())
        return res.status(429).json({ success: false, message: 'Please try again in 15 minutes' });
      const salt = account?.password_salt || crypto.randomBytes(16).toString('hex');
      const derived = await scrypt(password, salt, 64);
      const stored = account ? Buffer.from(account.password_hash, 'hex') : Buffer.alloc(64);
      const valid = Boolean(account && stored.length === 64 && crypto.timingSafeEqual(derived, stored));
      if (!valid) {
        if (account) await db(url, key, '/rest/v1/rpc/record_member_password_attempt', 'POST', { p_username: username, p_success: false }, 8000);
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      const members = await db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(account.member_id)}&select=*&limit=1`, 'GET', undefined, 8000);
      const member = members?.[0];
      if (!member || member.membership_status === 'cancelled')
        return res.status(401).json({ success: false, message: 'Account unavailable' });
      await db(url, key, '/rest/v1/rpc/record_member_password_attempt', 'POST', { p_username: username, p_success: true }, 8000);
      setSessionCookie(res, createSessionToken({ memberId: member.id, lineUid: member.line_uid,
        telegramUid: member.telegram_uid, authProvider: 'password', role: member.role || 'member' }));
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Member password login failed:', error.code || error.status || error);
      if (error.name === 'TimeoutError' || error.name === 'AbortError')
        return res.status(504).json({ success: false, message: 'Sign in timed out. Please try again.' });
      return res.status(500).json({ success: false, message: 'Unable to sign in' });
    }
  }

  const session = requireAdmin(req, res);
  if (!session) return;
  if (action === 'lookup_member_number') {
    const number = String(req.body?.memberNumber || '').trim();
    const legacyId = memberIdFromNumber(number);
    const shortNumber = completeShortMemberNumber(number);
    if (!legacyId && !shortNumber)
      return res.status(400).json({ success: false, message: 'Enter a valid member card number' });
    try {
      const cardRows = legacyId ? null : await db(url, key,
        `/rest/v1/member_card_numbers?card_number=eq.${shortNumber}&select=member_id&limit=1`);
      const memberId = legacyId || cardRows?.[0]?.member_id;
      if (!memberId) return res.status(200).json({ success: true, member: null });
      const rows = await db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=*&limit=1`);
      const member = rows?.[0];
      if (!member) return res.status(200).json({ success: true, member: null });
      const { tax_id: identityNumber, ...safeMember } = member;
      return res.status(200).json({ success: true, member: { ...safeMember, has_identity_number: Boolean(identityNumber) } });
    } catch (error) {
      console.error('Member number lookup failed:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to search members' });
    }
  }
  if (action === 'start_as_member') {
    const memberId = String(req.body?.memberId || '').trim();
    if (!memberId || memberId.length > 100 || /[\s,()]/.test(memberId))
      return res.status(400).json({ success: false, message: 'Choose a member account' });
    try {
      const [admins, members] = await Promise.all([
        db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(session.memberId)}&select=id,role&limit=1`),
        db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,role&limit=1`)
      ]);
      if (admins?.[0]?.role !== 'admin') return res.status(403).json({ success: false, message: 'Administrator account is no longer available' });
      const member = members?.[0];
      if (!member || (member.role !== 'member' &&
        !(member.role === 'admin' && member.id === session.memberId)))
        return res.status(400).json({ success: false, message: 'Choose a regular member account or your own administrator account' });
      setSessionCookie(res, createSessionToken({ memberId: member.id, role: 'member', authProvider: 'staff',
        actingAdminId: session.memberId, actingAdminAuthProvider: session.authProvider }), 14400);
      console.info('Admin started acting as member:', { adminId: session.memberId, memberId: member.id });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Unable to enter member session:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to open member session' });
    }
  }
  if (action === 'admin_member' || action === 'admin_edit_member') {
    const memberId = String(req.body?.memberId || '').trim();
    if (!memberId || memberId.length > 100 || /[\s,()]/.test(memberId))
      return res.status(400).json({ success: false, message: 'Invalid member ID' });

    if (action === 'admin_member') {
      try {
        const [members, accounts] = await Promise.all([
          db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=*&limit=1`),
          db(url, key, `/rest/v1/member_password_credentials?member_id=eq.${encodeURIComponent(memberId)}&select=username&limit=1`)
        ]);
        const member = members?.[0];
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        const details = await getMemberProfileDetails(url, key, memberId);
        return res.status(200).json({ success: true, profile: {
          memberId: member.id, fullName: member.full_name || member.display_name || '',
          fullNameEn: details.fullNameEn, memberAddress: details.memberAddress,
          addressHouseNo: details.addressHouseNo || '', addressVillageNo: details.addressVillageNo || '',
          addressExtra: details.addressExtra || '', addressProvinceId: details.addressProvinceId || null,
          addressDistrictId: details.addressDistrictId || null, addressSubdistrictId: details.addressSubdistrictId || null,
          identityNumber: member.tax_id || '', birthDate: member.birth_date || '',
          countryCode: member.country_code || '', profileImage: member.profile_image_url || '',
          picture: member.profile_image_url || member.picture_url || member.line_picture_url || '',
          username: accounts?.[0]?.username || '', hasPasswordAccount: Boolean(accounts?.[0])
        } });
      } catch (error) {
        console.error('Admin member detail failed:', error.code || error.status || error);
        if (error.code === '42501')
          return res.status(503).json({ success: false, message: 'Server lacks permission to read member credentials. Run password-credentials-permissions.sql in Supabase.' });
        if (error.code === 'PGRST205' || error.code === '42P01')
          return res.status(503).json({ success: false, message: 'Member credential table is missing from this Supabase project. Check walkin-members.sql.' });
        return res.status(500).json({ success: false, message: 'Unable to load member profile. Please check the server logs.' });
      }
    }

    const fullName = String(req.body?.fullName || '').trim().replace(/\s+/g, ' ');
    const fullNameEn = String(req.body?.fullNameEn || '').trim().replace(/\s+/g, ' ');
    const suppliedAddress = ['addressHouseNo', 'addressVillageNo', 'addressExtra', 'addressProvinceId',
      'addressDistrictId', 'addressSubdistrictId'].some((field) => Object.hasOwn(req.body || {}, field));
    let address = null;
    try { if (suppliedAddress) address = validateThaiAddress(req.body); }
    catch (error) { return res.status(400).json({ success: false, message: error.message }); }
    const memberAddress = address?.addressProvinceId ? formatThaiAddress(address) : String(req.body?.memberAddress || '').trim();
    const identityNumber = String(req.body?.identityNumber || '').trim().toUpperCase().replace(/[\s-]+/g, '');
    const birthDate = date(req.body?.birthDate);
    const countryCode = String(req.body?.countryCode || '').trim().toUpperCase();
    const picture = String(req.body?.picture || '');
    const removePhoto = req.body?.removePhoto === true;
    const username = String(req.body?.username || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (fullName.length < 2 || fullName.length > 200 || fullNameEn.length > 200 || memberAddress.length > 500 || birthDate === false ||
        (identityNumber && !(/^\d{13}$/.test(identityNumber) || /^[A-Z0-9]{5,20}$/.test(identityNumber))) ||
        !/^[A-Z]{2}$/.test(countryCode) ||
        (picture && (picture.length > 100000 || !photoPattern.test(picture))) ||
        (username && !usernamePattern.test(username)) ||
        (password && (!username || password.length < 12 || password.length > 128))) {
      return res.status(400).json({ success: false, message: 'Check name, identity number, date, country, photo, username and password' });
    }
    if (req.body?.cardReviewed === true && !reviewedCardMatches(req.body, identityNumber, fullName, birthDate))
      return res.status(400).json({ success: false, message: 'ข้อมูลยืนยันตัวตนไม่ตรงกับบัตรที่นำเข้า กรุณาอ่านบัตรและตรวจข้อมูลอีกครั้ง' });
    try {
      const salt = password ? crypto.randomBytes(16).toString('hex') : null;
      const hash = password ? (await scrypt(password, salt, 64)).toString('hex') : null;
      const details = await getMemberProfileDetails(url, key, memberId);
      if (suppliedAddress && !details.structuredAvailable && Object.values(address).some(Boolean))
        return res.status(503).json({ success: false, message: 'Run supabase/member-address-fields.sql before saving the structured address' });
      if (!details.available && (fullNameEn || memberAddress))
        return res.status(503).json({ success: false, message: 'Run supabase/member-profile-details.sql before saving English name or address' });
      const structuredEnabled = suppliedAddress && details.structuredAvailable;
      const rpcPath = structuredEnabled ? 'admin_edit_member_with_address' :
        details.available ? 'admin_edit_member_with_details' : 'admin_edit_member';
      await saveWithCardReview(url, key, rpcPath, {
        ...(details.available ? { p_full_name_en: fullNameEn, p_member_address: memberAddress } : {}),
        ...(structuredEnabled ? {
          p_address_house_no: address.addressHouseNo, p_address_village_no: address.addressVillageNo,
          p_address_extra: address.addressExtra, p_address_province_id: address.addressProvinceId,
          p_address_district_id: address.addressDistrictId, p_address_subdistrict_id: address.addressSubdistrictId
        } : {}),
        p_member_id: memberId, p_full_name: fullName, p_identity_number: identityNumber || null,
        p_birth_date: birthDate, p_profile_image_url: picture || null,
        p_remove_profile_image: removePhoto, p_country_code: countryCode,
        p_username: username || null, p_password_salt: salt, p_password_hash: hash,
        p_actor_member_id: String(session.memberId)
      }, reviewedCardMatches(req.body, identityNumber, fullName, birthDate));
      const [savedMember] = await db(url, key, `/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=*&limit=1`);
      return res.status(200).json({ success: true, member: {
        id: memberId, id_card_verified_at: savedMember?.id_card_verified_at || null,
        id_card_verified_by: savedMember?.id_card_verified_by || null, full_name: fullName, full_name_en: fullNameEn, member_address: memberAddress,
        ...(structuredEnabled ? address : {}),
        country_code: countryCode, birth_date: birthDate,
        has_identity_number: Boolean(identityNumber),
        ...(picture || removePhoto ? { profile_image_url: removePhoto ? null : picture } : {})
      }, username });
    } catch (error) {
      if (error.code === '23505' || error.status === 409)
        return res.status(409).json({ success: false, message: 'Username or identity number belongs to another member' });
      if (/Username is required|Username and password are both required/i.test(error.detail))
        return res.status(400).json({ success: false, message: 'Set both username and password for a new account; existing accounts need a username' });
      if (error.code === 'PGRST202' || error.code === 'PGRST205')
        return res.status(503).json({ success: false, message: req.body?.cardReviewed === true ? 'กรุณารัน supabase/member-id-card-verification.sql ใน Supabase ก่อนบันทึกการยืนยันบัตร' : 'Run supabase/member-address-fields.sql in Supabase SQL Editor' });
      console.error('Admin member update failed:', error.code || error.status || error);
      return res.status(500).json({ success: false, message: 'Unable to save member profile; check that admin-edit-members.sql has been run' });
    }
  }
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
  if (req.body?.cardReviewed === true && !reviewedCardMatches(req.body, citizenId, fullName, birthDate))
    return res.status(400).json({ success: false, message: 'ข้อมูลยืนยันตัวตนไม่ตรงกับบัตรที่นำเข้า กรุณาอ่านบัตรและตรวจข้อมูลอีกครั้ง' });
  try {
    // The member ID is selected by the administrator after viewing a card match or member list.
    // The SQL function checks ID uniqueness and performs all changes in one transaction.
    const salt = username ? crypto.randomBytes(16).toString('hex') : null;
    const hash = username ? (await scrypt(password, salt, 64)).toString('hex') : null;
    const savedId = await saveWithCardReview(url, key, 'register_walkin_member', {
      p_member_id: memberId, p_full_name: fullName, p_citizen_id: citizenId || null,
      p_birth_date: birthDate, p_profile_image_url: picture || null,
      p_username: username || null, p_password_salt: salt, p_password_hash: hash,
      p_actor_member_id: String(session.memberId)
    }, reviewedCardMatches(req.body, citizenId, fullName, birthDate));
    return res.status(201).json({ success: true, memberId: savedId });
  } catch (error) {
    if (error.code === '23505' || /CARD_ALREADY_REGISTERED|MEMBER_HAS_DIFFERENT_ID|already has a username/i.test(error.detail))
      return res.status(409).json({ success: false, message: 'Member, national ID, or username already exists. Review the existing member before saving.' });
    if (error.code === 'PGRST202' && req.body?.cardReviewed === true)
      return res.status(503).json({ success: false, message: 'กรุณารัน supabase/member-id-card-verification.sql ใน Supabase ก่อนบันทึกการยืนยันบัตร' });
    console.error('Walk-in member registration failed:', error.code || error.status || error);
    return res.status(500).json({ success: false, message: 'Unable to register member; ensure the database migration has been applied' });
  }
}
