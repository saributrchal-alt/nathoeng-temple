import crypto from 'crypto';

const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const COOKIE = 'nathoeng_library_session';
const EDIT_ACTIONS = new Set(['approve', 'reject', 'ready_pickup', 'ship', 'confirm_handover', 'receive_return']);

function config() {
  return { url: process.env.SUPABASE_URL?.replace(/\/$/, ''), key: process.env.SUPABASE_SECRET_KEY,
    secret: process.env.LIBRARY_SESSION_SECRET };
}
function b64(data) { return Buffer.from(JSON.stringify(data)).toString('base64url'); }
function sign(value, secret) { return crypto.createHmac('sha256', secret).update(value).digest('base64url'); }
function token(memberId, secret) {
  const value = b64({ memberId, exp: Date.now() + 7 * 86400000 });
  return `${value}.${sign(value, secret)}`;
}
function session(req, secret) {
  const cookie = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  if (!cookie) return null;
  const [value, signature] = cookie.slice(COOKIE.length + 1).split('.');
  if (!value || !signature) return null;
  const expected = Buffer.from(sign(value, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString());
    return UUID.test(payload.memberId) && payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}
function setCookie(res, value, age) {
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`);
}
async function db({ url, key }, path, method = 'GET', body) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method, cache: 'no-store', signal: AbortSignal.timeout(10000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      ...(method !== 'GET' ? { Prefer: 'return=representation' } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) {
    const error = new Error(data?.message || 'Database request failed');
    error.code = data?.code;
    error.status = response.status;
    throw error;
  }
  return data;
}
async function getMember(env, memberId) {
  const rows = await db(env, `members?id=eq.${encodeURIComponent(memberId)}&select=id,full_name,display_name,profile_image_url,picture_url,role,membership_status&limit=1`);
  return rows?.[0]?.membership_status === 'cancelled' ? null : rows?.[0] || null;
}
async function memberContext(req, env) {
  const auth = session(req, env.secret);
  if (!auth) return null;
  const member = await getMember(env, auth.memberId);
  if (!member) return null;
  const staff = member.role === 'admin' || (await db(env,
    `library_staff?member_id=eq.${encodeURIComponent(member.id)}&select=member_id&limit=1`)).length > 0;
  return { member, staff };
}
function error(res, status, message) { return res.status(status).json({ success: false, message }); }
function name(member) { return member.full_name || member.display_name || 'สมาชิกวัด'; }
function validIsbn(value) {
  const isbn = String(value || '').replace(/[\s-]/g, '');
  if (!/^(978|979)\d{10}$/.test(isbn)) return '';
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(isbn[i]) * (i % 2 ? 3 : 1);
  return (10 - sum % 10) % 10 === Number(isbn[12]) ? isbn : '';
}
async function metadata(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=5&printType=books`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = await response.json();
      const item = data.items?.find(x => x.volumeInfo?.industryIdentifiers?.some(v => v.identifier?.replace(/-/g, '') === isbn));
      if (item) {
        const v = item.volumeInfo;
        return { title: v.title || '', author: (v.authors || []).join(', '), publisher: v.publisher || '',
          publishedYear: v.publishedDate || '', description: (v.description || '').replace(/<[^>]+>/g, '').slice(0, 4000),
          subject: (v.categories || []).join(', '), coverUrl: v.imageLinks?.thumbnail?.replace(/^http:/, 'https:') || '', source: 'Google Books' };
      }
    }
  } catch { /* Try the other catalog. */ }
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, { signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'NathoengTempleLibrary/1.0 (https://library.nathoeng.com)' } });
    if (response.ok) {
      const v = await response.json();
      return { title: v.title || '', author: (v.authors || []).map(x => x.name).filter(Boolean).join(', '),
        publisher: (v.publishers || []).join(', '), publishedYear: v.publish_date || '',
        description: typeof v.description === 'string' ? v.description.slice(0, 4000) : v.description?.value?.slice(0, 4000) || '',
        subject: (v.subjects || []).slice(0, 8).join(', '),
        coverUrl: v.covers?.[0] ? `https://covers.openlibrary.org/b/id/${v.covers[0]}-M.jpg` : '', source: 'Open Library' };
    }
  } catch { /* Staff may enter missing details. */ }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const env = config();
  if (!env.url || !env.key || !env.secret || env.secret.length < 32)
    return error(res, 503, 'Library environment variables are not configured');
  const query = new URL(req.url || '/', 'https://library.nathoeng.com').searchParams;
  const route = query.get('route');
  const action = req.body?.action;
  try {
    if (req.method === 'GET' && route === 'books') {
      const q = String(query.get('q') || '').trim().slice(0, 100);
      const books = await db(env, 'rpc/library_search_books', 'POST', { p_query: q, p_limit: 40 });
      return res.status(200).json({ success: true, books });
    }
    if (req.method === 'GET' && route === 'book') {
      const id = String(query.get('id') || '');
      if (!UUID.test(id)) return error(res, 400, 'Invalid book ID');
      const books = await db(env, `library_books?id=eq.${id}&select=*&limit=1`);
      if (!books?.[0]) return error(res, 404, 'Book not found');
      const copies = await db(env, `library_copies?book_id=eq.${id}&select=status`);
      return res.status(200).json({ success: true, book: { ...books[0], available_copies: copies.filter(x => x.status === 'available').length,
        total_copies: copies.filter(x => x.status !== 'withdrawn').length } });
    }
    if (req.method === 'POST' && action === 'redeem') {
      const ticket = String(req.body?.ticket || '');
      if (!/^[A-Za-z0-9_-]{43}$/.test(ticket)) return error(res, 400, 'Invalid library login ticket');
      const hash = crypto.createHash('sha256').update(ticket).digest('hex');
      const memberId = await db(env, 'rpc/library_redeem_ticket', 'POST', { p_token_hash: hash });
      if (!memberId) return error(res, 401, 'This library login ticket has expired');
      const member = await getMember(env, memberId);
      if (!member) return error(res, 403, 'Member unavailable');
      setCookie(res, token(member.id, env.secret), 7 * 86400);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'POST' && action === 'logout') {
      setCookie(res, '', 0);
      return res.status(200).json({ success: true });
    }

    const ctx = await memberContext(req, env);
    if (req.method === 'GET' && route === 'session') {
      if (!ctx) return error(res, 401, 'Please sign in with your monastery account');
      const card = await db(env, `member_card_numbers?member_id=eq.${encodeURIComponent(ctx.member.id)}&select=card_number&limit=1`);
      return res.status(200).json({ success: true, user: { id: ctx.member.id, name: name(ctx.member),
        picture: ctx.member.profile_image_url || ctx.member.picture_url || '', memberNumber: card?.[0]?.card_number || '',
        isStaff: ctx.staff, isAdmin: ctx.member.role === 'admin' } });
    }
    if (!ctx) return error(res, 401, 'Please sign in with your monastery account');

    if (req.method === 'GET' && route === 'staff_members') {
      if (ctx.member.role !== 'admin') return error(res, 403, 'Administrator permission required');
      const staff = await db(env, 'library_staff?select=member_id,created_at&order=created_at.desc');
      const members = staff.length ? await db(env, `members?id=in.(${staff.map(x => encodeURIComponent(x.member_id)).join(',')})&select=id,full_name,display_name`) : [];
      const names = Object.fromEntries(members.map(x => [x.id, name(x)]));
      return res.status(200).json({ success: true, staff: staff.map(x => ({ memberId: x.member_id, name: names[x.member_id] || 'สมาชิกวัด' })) });
    }

    if (req.method === 'GET' && (route === 'my_loans' || route === 'staff_loans')) {
      if (route === 'staff_loans' && !ctx.staff) return error(res, 403, 'Librarian permission required');
      const where = route === 'my_loans' ? `member_id=eq.${encodeURIComponent(ctx.member.id)}&` : '';
      const loans = await db(env, `library_loans?${where}select=*,library_loan_items(id,book_id,copy_id,library_books(id,title,author,cover_url),library_copies(copy_code))&order=created_at.desc&limit=150`);
      if (route === 'staff_loans') {
        const ids = [...new Set(loans.map(x => x.member_id))];
        if (ids.length) {
          const rows = await db(env, `members?id=in.(${ids.map(encodeURIComponent).join(',')})&select=id,full_name,display_name`);
          const names = Object.fromEntries(rows.map(x => [x.id, name(x)]));
          loans.forEach(x => { x.member_name = names[x.member_id] || 'สมาชิกวัด'; });
        }
      }
      return res.status(200).json({ success: true, loans });
    }

    if (req.method === 'POST' && action === 'borrow') {
      const bookIds = req.body?.bookIds;
      if (!Array.isArray(bookIds) || bookIds.length < 1 || bookIds.length > 5 ||
          bookIds.some(x => !UUID.test(x)) || new Set(bookIds).size !== bookIds.length ||
          !['pickup', 'courier'].includes(req.body?.delivery) || req.body?.accepted !== true)
        return error(res, 400, 'Select books, a delivery method and accept the loan terms');
      const loanId = await db(env, 'rpc/library_request_loan', 'POST', {
        p_member_id: ctx.member.id, p_book_ids: bookIds, p_delivery: req.body.delivery,
        p_name: String(req.body.name || '').trim().slice(0, 120), p_phone: String(req.body.phone || '').trim().slice(0, 30),
        p_address: String(req.body.address || '').trim().slice(0, 500), p_postal: String(req.body.postal || '').trim().slice(0, 10),
        p_accepted: true
      });
      return res.status(201).json({ success: true, loanId });
    }
    if (req.method === 'POST' && action === 'borrow_at_desk') {
      if (!ctx.staff) return error(res, 403, 'Librarian permission required');
      const cardNumber = String(req.body?.memberNumber || '').trim();
      const bookIds = req.body?.bookIds;
      if (!/^2\d{12}$/.test(cardNumber) || !Array.isArray(bookIds) || bookIds.length < 1 ||
          bookIds.length > 5 || bookIds.some(x => !UUID.test(x)) ||
          new Set(bookIds).size !== bookIds.length || !['pickup', 'courier'].includes(req.body?.delivery) ||
          req.body?.accepted !== true)
        return error(res, 400, 'Scan the member card, select books and ask the borrower to accept the terms');
      const cards = await db(env, `member_card_numbers?card_number=eq.${cardNumber}&select=member_id&limit=1`);
      const borrower = cards?.[0] ? await getMember(env, cards[0].member_id) : null;
      if (!borrower) return error(res, 404, 'Member card not found');
      const loanId = await db(env, 'rpc/library_request_loan', 'POST', {
        p_member_id: borrower.id, p_book_ids: bookIds, p_delivery: req.body.delivery,
        p_name: String(req.body.name || '').trim().slice(0, 120), p_phone: String(req.body.phone || '').trim().slice(0, 30),
        p_address: String(req.body.address || '').trim().slice(0, 500), p_postal: String(req.body.postal || '').trim().slice(0, 10),
        p_accepted: true
      });
      return res.status(201).json({ success: true, loanId });
    }
    if (req.method === 'POST' && action === 'advance') {
      const loanId = String(req.body?.loanId || '');
      const transition = String(req.body?.transition || '');
      if (!UUID.test(loanId) || !/^[a-z_]{3,30}$/.test(transition)) return error(res, 400, 'Invalid loan action');
      if (EDIT_ACTIONS.has(transition) && !ctx.staff) return error(res, 403, 'Librarian permission required');
      const dueDate = String(req.body?.dueDate || '');
      if (transition === 'approve' && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate))))
        return error(res, 400, 'Set a return due date');
      const status = await db(env, 'rpc/library_advance_loan', 'POST', {
        p_loan_id: loanId, p_actor_id: ctx.member.id, p_action: transition,
        p_due_date: dueDate || null, p_tracking: String(req.body?.tracking || '').trim().slice(0, 100) || null
      });
      return res.status(200).json({ success: true, status });
    }
    if (req.method === 'POST' && action === 'find_member_card') {
      if (!ctx.staff) return error(res, 403, 'Librarian permission required');
      const number = String(req.body?.memberNumber || '').trim();
      if (!/^2\d{12}$/.test(number)) return error(res, 400, 'Scan a 13-digit member card');
      const cards = await db(env, `member_card_numbers?card_number=eq.${number}&select=member_id&limit=1`);
      const member = cards?.[0] ? await getMember(env, cards[0].member_id) : null;
      return res.status(200).json({ success: true, member: member ? { id: member.id, name: name(member) } : null });
    }
    if (!ctx.staff) return error(res, 403, 'Librarian permission required');
    if (req.method === 'POST' && action === 'lookup_isbn') {
      const isbn = validIsbn(req.body?.isbn);
      if (!isbn) return error(res, 400, 'Scan a valid ISBN-13 beginning with 978 or 979');
      const existing = await db(env, `library_books?isbn=eq.${isbn}&select=*&limit=1`);
      return res.status(200).json({ success: true, isbn, existing: existing?.[0] || null,
        metadata: existing?.[0] ? null : await metadata(isbn) });
    }
    if (req.method === 'POST' && action === 'save_book') {
      const title = String(req.body?.title || '').trim().slice(0, 250);
      if (title.length < 2) return error(res, 400, 'Book title is required');
      const isbn = req.body?.isbn ? validIsbn(req.body.isbn) : null;
      if (req.body?.isbn && !isbn) return error(res, 400, 'Invalid ISBN-13');
      const book = { isbn, title, author: String(req.body?.author || '').trim().slice(0, 250),
        publisher: String(req.body?.publisher || '').trim().slice(0, 250),
        published_year: String(req.body?.publishedYear || '').trim().slice(0, 60),
        description: String(req.body?.description || '').trim().slice(0, 4000),
        subject: String(req.body?.subject || '').trim().slice(0, 250),
        cover_url: /^https:\/\//.test(req.body?.coverUrl || '') ? String(req.body.coverUrl).slice(0, 900) : '' };
      const id = req.body?.id;
      if (id && !UUID.test(id)) return error(res, 400, 'Invalid book ID');
      const rows = id ? await db(env, `library_books?id=eq.${id}`, 'PATCH', book)
        : await db(env, 'library_books', 'POST', book);
      return res.status(200).json({ success: true, book: rows?.[0] });
    }
    if (req.method === 'POST' && action === 'add_copy') {
      const bookId = String(req.body?.bookId || '');
      if (!UUID.test(bookId)) return error(res, 400, 'Invalid book ID');
      const code = await db(env, 'rpc/library_add_copy', 'POST', {
        p_book_id: bookId, p_shelf: String(req.body?.shelf || '').trim().slice(0, 100) });
      return res.status(201).json({ success: true, copyCode: code });
    }
    if (req.method === 'POST' && (action === 'grant_staff' || action === 'remove_staff')) {
      if (ctx.member.role !== 'admin') return error(res, 403, 'Administrator permission required');
      const memberId = String(req.body?.memberId || '');
      if (!UUID.test(memberId) || !await getMember(env, memberId)) return error(res, 400, 'Choose an existing member');
      if (action === 'grant_staff') {
        const existing = await db(env, `library_staff?member_id=eq.${memberId}&select=member_id&limit=1`);
        if (!existing.length) await db(env, 'library_staff', 'POST', { member_id: memberId });
      }
      else await db(env, `library_staff?member_id=eq.${memberId}`, 'DELETE');
      return res.status(200).json({ success: true });
    }
    return error(res, 404, 'Library action not found');
  } catch (err) {
    console.error('Library request failed:', err.code || err.status || err.message);
    const known = /no available copy|status change|Complete the shipping|Member unavailable|Invalid loan request|Book not found/i.test(err.message || '');
    return error(res, err.code === '23505' ? 409 : known ? 409 : 500,
      err.code === '23505' ? 'ISBN already exists in the library' : known ? err.message : 'Unable to complete library request');
  }
}
