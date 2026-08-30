const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function config() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('Supabase configuration is missing');
  }
  return { url: SUPABASE_URL.replace(/\/$/, ''), key: SUPABASE_SECRET_KEY };
}

export async function sb(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...headers
    },
    body: body == null ? undefined : (raw ? body : JSON.stringify(body))
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function q(value) {
  return encodeURIComponent(value);
}

export async function getStudentById(id) {
  const rows = await sb(`/rest/v1/temple_students?id=eq.${q(id)}&is_active=eq.true&select=*`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function getStudentByUsername(username) {
  const normalized = String(username || '').trim().toLowerCase();
  const rows = await sb(`/rest/v1/temple_students?username=eq.${q(normalized)}&is_active=eq.true&select=*`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function listStudents() {
  const rows = await sb('/rest/v1/temple_students?is_active=eq.true&select=*&order=display_order.asc,display_name.asc');
  return Array.isArray(rows) ? rows : [];
}

export function todayBangkok() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

export function bangkokDateFrom(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}

export function bangkokParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.map(p => [p.type, p.value]));
}

export function addDaysBangkok(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return bangkokDateFrom(dt);
}

export function weekdayForBangkokDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', weekday: 'short' }).format(dt);
}

export function defaultDayType(isoDate) {
  const wd = weekdayForBangkokDate(isoDate);
  return wd === 'Sat' || wd === 'Sun' ? 'no_school' : 'school_day';
}
