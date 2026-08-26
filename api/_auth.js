import crypto from 'crypto';

const COOKIE_NAME = 'nathoeng_session';

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  let base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (base64.length % 4) {
    base64 += '=';
  }

  return Buffer.from(base64, 'base64').toString();
}

function sign(value, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function createSessionToken(user) {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is missing');
  }

  const payload = {
    memberId: user.memberId,
    lineUid: user.lineUid,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };

  const encodedPayload = base64UrlEncode(
    JSON.stringify(payload)
  );

  const signature = sign(
    encodedPayload,
    secret
  );

  return encodedPayload + '.' + signature;
}

export function verifySessionToken(token) {
  const secret = process.env.SESSION_SECRET;

  if (!secret || !token) {
    return null;
  }

  const parts = token.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const encodedPayload = parts[0];
  const receivedSignature = parts[1];

  const expectedSignature = sign(
    encodedPayload,
    secret
  );

  const receivedBuffer = Buffer.from(
    receivedSignature
  );

  const expectedBuffer = Buffer.from(
    expectedSignature
  );

  if (
    receivedBuffer.length !== expectedBuffer.length
  ) {
    return null;
  }

  if (
    !crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload)
    );

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function getSessionFromRequest(req) {
  const cookieHeader =
    req.headers.cookie || '';

  const cookies = cookieHeader
    .split(';')
    .map((item) => item.trim());

  const sessionCookie = cookies.find(
    (item) =>
      item.startsWith(COOKIE_NAME + '=')
  );

  if (!sessionCookie) {
    return null;
  }

  const token = decodeURIComponent(
    sessionCookie.substring(
      COOKIE_NAME.length + 1
    )
  );

  return verifySessionToken(token);
}

export function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    COOKIE_NAME +
      '=' +
      encodeURIComponent(token) +
      '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    COOKIE_NAME +
      '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  );
}

export function requireAdmin(req, res) {
  const session =
    getSessionFromRequest(req);

  if (
    !session ||
    session.role !== 'admin'
  ) {
    res.status(403).json({
      success: false,
      message: 'Admin permission required'
    });

    return null;
  }

  return session;
}