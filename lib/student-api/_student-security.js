import crypto from 'crypto';

export function hashPin(pin, salt) {
  return crypto.scryptSync(String(pin), salt, 64).toString('hex');
}

export function verifyPin(pin, salt, expectedHash) {
  if (!salt || !expectedHash) return false;
  const actual = hashPin(pin, salt);
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function makePinRecord(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { pin_salt: salt, pin_hash: hashPin(pin, salt) };
}
