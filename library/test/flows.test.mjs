import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import libraryHandler from '../api/library.js';
import templeHandler from '../../api/donation-profile.js';
import { createSessionToken } from '../../lib/_auth.js';

const memberId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const bookId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const loanId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SECRET_KEY = 'service-test';
process.env.LIBRARY_SESSION_SECRET = 'library-test-secret-longer-than-thirty-two-characters';
process.env.SESSION_SECRET = 'temple-test-secret';

function response(data, status = 200) {
  return { ok: status < 300, status, text: async () => JSON.stringify(data), json: async () => data };
}
function res() {
  return { headers: {}, status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(data) { this.data = data; return this; }, end() { return this; } };
}
async function call(handler, method, path, body, cookie) {
  const result = res();
  await handler({ method, url: path, body, headers: { cookie: cookie || '' } }, result);
  return result;
}

test('public search, one-use login ticket, member borrowing and librarian boundary', async () => {
  let redeemed = false;
  let issuedHash = '';
  let memberRole = 'member';
  const dbPaths = [];
  globalThis.fetch = async (url, options = {}) => {
    const path = String(url); dbPaths.push(path);
    if (path.includes('/rpc/library_search_books')) return response([]);
    if (path.includes('/rpc/library_redeem_ticket')) {
      if (redeemed || JSON.parse(options.body).p_token_hash !== issuedHash) return response(null);
      redeemed = true; return response(memberId);
    }
    if (path.includes('/rpc/library_request_loan')) {
      const data = JSON.parse(options.body);
      assert.equal(data.p_member_id, memberId);
      assert.deepEqual(data.p_book_ids, [bookId]);
      assert.equal(data.p_accepted, true);
      return response(loanId);
    }
    if (path.includes('/library_staff?')) return response([]);
    if (path.includes('/member_card_numbers?')) return response([{ member_id: memberId }]);
    if (path.includes('/members?')) return response([{ id: memberId, role: memberRole, full_name: 'Test Member', membership_status: 'active' }]);
    if (path.endsWith('/library_login_tickets')) {
      const data = JSON.parse(options.body);
      assert.equal(data.member_id, memberId);
      assert.match(data.token_hash, /^[a-f0-9]{64}$/);
      issuedHash = data.token_hash;
      return response([], 201);
    }
    throw Error(`Unexpected database query ${path}`);
  };

  const search = await call(libraryHandler, 'GET', '/api/library?route=books&q=ธรรมะ');
  assert.equal(search.statusCode, 200);
  const anonymousBorrow = await call(libraryHandler, 'POST', '/api/library', { action: 'borrow', bookIds: [bookId] });
  assert.equal(anonymousBorrow.statusCode, 401);

  const templeCookie = `nathoeng_session=${createSessionToken({ memberId, role: 'member' })}`;
  const handoff = await call(templeHandler, 'GET', '/api/donation-profile?route=library-sso', undefined, templeCookie);
  assert.equal(handoff.statusCode, 302);
  assert.ok(handoff.headers.Location.startsWith('https://library.nathoeng.com/?ticket='));
  const ticket = new URL(handoff.headers.Location).searchParams.get('ticket');
  assert.equal(issuedHash, crypto.createHash('sha256').update(ticket).digest('hex'));

  const login = await call(libraryHandler, 'POST', '/api/library', { action: 'redeem', ticket });
  assert.equal(login.statusCode, 200);
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  assert.ok(login.headers['Set-Cookie'].includes('HttpOnly; Secure; SameSite=Lax'));
  assert.equal((await call(libraryHandler, 'POST', '/api/library', { action: 'redeem', ticket })).statusCode, 401);
  assert.equal((await call(libraryHandler, 'GET', '/api/library?route=staff_loans', undefined, cookie)).statusCode, 403);
  assert.equal((await call(libraryHandler, 'POST', '/api/library', { action: 'advance', loanId, transition: 'approve' }, cookie)).statusCode, 403);
  assert.equal((await call(libraryHandler, 'POST', '/api/library', {
    action: 'borrow', bookIds: [bookId], delivery: 'pickup', accepted: false
  }, cookie)).statusCode, 400);
  assert.equal((await call(libraryHandler, 'POST', '/api/library', {
    action: 'borrow', bookIds: [bookId], delivery: 'pickup', accepted: true
  }, cookie)).statusCode, 201);
  assert.equal((await call(libraryHandler, 'POST', '/api/library', {
    action: 'borrow_at_desk', memberNumber: '2000000000015', bookIds: [bookId], delivery: 'pickup', accepted: true
  }, cookie)).statusCode, 403);
  memberRole = 'admin';
  assert.equal((await call(libraryHandler, 'POST', '/api/library', {
    action: 'borrow_at_desk', memberNumber: '2000000000015', bookIds: [bookId], delivery: 'pickup', accepted: false
  }, cookie)).statusCode, 400);
  assert.equal((await call(libraryHandler, 'POST', '/api/library', {
    action: 'borrow_at_desk', memberNumber: '2000000000015', bookIds: [bookId], delivery: 'pickup', accepted: true
  }, cookie)).statusCode, 201);
  assert.ok(dbPaths.some(x => x.includes('/rpc/library_request_loan')));
});
