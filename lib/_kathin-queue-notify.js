import crypto from 'crypto';

function verify(token, secret) {
  if (!secret || typeof token !== 'string' || token.length > 2000) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(`kathin-queue-notify.${parts[0]}`).digest('base64url'));
  const received = Buffer.from(parts[1]);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const claim = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (claim.aud !== 'nathoeng-kathin-queue' || !Number.isSafeInteger(Number(claim.orderId)) || Number(claim.orderId) < 1
      || !/^[\w-]{1,100}$/.test(String(claim.actorId || '')) || !Number.isFinite(Date.parse(claim.calledAt))
      || !Number.isFinite(claim.exp) || claim.exp <= Date.now() || claim.exp - Date.now() > 60000) return null;
    return claim;
  } catch { return null; }
}

export async function handleKathinQueueNotify(req, res) {
  res.setHeader('Cache-Control', 'no-store, private');
  if (req.method !== 'POST') return res.status(405).json({ status: 'failed' });
  const claim = verify(req.body?.token, process.env.KATHIN_BRIDGE_SECRET);
  if (!claim) return res.status(401).json({ status: 'failed' });
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  if (!key || !base) return res.status(503).json({ status: 'failed' });
  const headers = { apikey: key, ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }) };
  const lookup = async (table, query) => {
    const response = await fetch(`${base}/rest/v1/${table}?${query}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error('Queue verification failed');
    return response.json();
  };
  try {
    const [actors, staff, orders] = await Promise.all([
      lookup('members', `id=eq.${encodeURIComponent(claim.actorId)}&select=id,role,membership_status&limit=1`),
      lookup('kathin_drink_staff', `member_id=eq.${encodeURIComponent(claim.actorId)}&active=eq.true&select=member_id&limit=1`),
      lookup('kathin_drink_orders', `id=eq.${Number(claim.orderId)}&event_key=eq.kathin-2569&select=id,member_id,queue_number,status,service_day,accepted_by,accepted_at&limit=1`)
    ]);
    const actor = actors?.[0];
    if (!actor || (actor.membership_status && actor.membership_status !== 'active') || (actor.role !== 'admin' && !staff?.length)) return res.status(403).json({ status: 'failed' });
    const order = orders?.[0];
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    if (!order || order.service_day !== today || String(order.accepted_by) !== String(claim.actorId)
      || Date.parse(order.accepted_at) !== Date.parse(claim.calledAt) || !['accepted', 'sent'].includes(order.status)) return res.status(409).json({ status: 'failed' });
    if (order.status === 'sent') return res.status(200).json({ status: 'skipped_collected' });
    const people = await lookup('members', `id=eq.${encodeURIComponent(order.member_id)}&select=line_uid&limit=1`);
    const lineUid = String(people?.[0]?.line_uid || '').trim();
    if (!lineUid) return res.status(200).json({ status: 'skipped_unlinked' });
    const token = process.env.LINE_MESSAGING_ACCESS_TOKEN;
    if (!token) return res.status(503).json({ status: 'failed' });
    const hash = crypto.createHash('sha256').update(`kathin-2569:queue-call:${order.id}`).digest('hex');
    const retryKey = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const queue = String(order.queue_number).split('-').pop();
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Line-Retry-Key': retryKey },
      body: JSON.stringify({ to: lineUid, messages: [{ type: 'text',
        text: `☕ คิว ${queue} ถึงคิวแล้ว\nมารับกาแฟได้แล้วค่ะ\nรับเครื่องดื่มที่จุดบริการงานกฐิน วัดพุทธอุทยานนาเทิง\nดูคิว: https://kathin.nathoeng.com` }] }),
      signal: AbortSignal.timeout(6000)
    });
    const alreadyAccepted = response.status === 409 && Boolean(response.headers.get('x-line-accepted-request-id'));
    if (!response.ok && !alreadyAccepted) return res.status(502).json({ status: 'failed' });
    return res.status(200).json({ status: 'sent' });
  } catch { return res.status(503).json({ status: 'failed' }); }
}
