import { getSessionFromRequest } from '../lib/_auth.js';

// Read-only access summary for the authenticated member. Never grants access.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = getSessionFromRequest(req);
  if (!session?.memberId) return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบสมาชิก' });

  const empty = {
    library: false, equipment: false, accounting: false,
    health: false, school: false, kathin: false
  };
  if (session.actingAdminId) return res.status(200).json({
    success: true, access: empty, checkedAt: new Date().toISOString()
  });
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(503).json({ success: false, message: 'ยังตรวจสอบสิทธิ์ไม่ได้' });
  const headers = {
    apikey: key,
    ...(key.startsWith('sb_secret_') ? {} : { Authorization: 'Bearer ' + key }),
    Accept: 'application/json'
  };
  const readOne = async (table, columns, extra = '') => {
    const memberColumn = table === 'members' ? 'id' : 'member_id';
    const query = memberColumn + '=eq.' + encodeURIComponent(session.memberId) +
      '&select=' + columns + '&limit=1' + extra;
    const response = await fetch(url + '/rest/v1/' + table + '?' + query, {
      headers, cache: 'no-store', signal: AbortSignal.timeout(8500)
    });
    if (!response.ok) throw new Error('Database permission lookup failed: ' + table + ' (' + response.status + ')');
    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] || null : null;
  };

  try {
    const member = await readOne('members', 'id,role,membership_status');
    if (!member || (member.membership_status && member.membership_status !== 'active')) {
      return res.status(200).json({ success: true, access: empty, checkedAt: new Date().toISOString() });
    }
    const admin = member.role === 'admin';
    const settled = await Promise.allSettled([
      readOne('school_members', 'is_active,can_study,can_teach,can_manage'),
      readOne('health_members', 'is_active'),
      readOne('kathin_drink_staff', 'member_id', '&active=eq.true')
    ]);
    const value = index => settled[index].status === 'fulfilled' ? settled[index].value : undefined;
    // null = unavailable verification: never show a green permission.
    const school = value(0) === undefined ? null : Boolean(value(0)?.is_active &&
      (value(0)?.can_study || value(0)?.can_teach || value(0)?.can_manage));
    const health = value(1) === undefined ? null : Boolean(value(1)?.is_active);
    const kathin = admin ? true : value(2) === undefined ? null : Boolean(value(2));
    return res.status(200).json({
      success: true,
      access: { library: true, equipment: true, accounting: admin, health, school, kathin },
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Member permissions summary unavailable:', error?.message);
    return res.status(503).json({ success: false, message: 'ยังตรวจสอบสิทธิ์ไม่ได้ กรุณาลองอีกครั้ง' });
  }
}
