import crypto from 'crypto';

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

const { publicKey, privateKey } =
  crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'
  });

const publicJwk =
  publicKey.export({ format: 'jwk' });

const privateJwk =
  privateKey.export({ format: 'jwk' });

const x = Buffer.from(
  publicJwk.x.replace(/-/g, '+').replace(/_/g, '/'),
  'base64'
);

const y = Buffer.from(
  publicJwk.y.replace(/-/g, '+').replace(/_/g, '/'),
  'base64'
);

const rawPublicKey =
  Buffer.concat([
    Buffer.from([4]),
    x,
    y
  ]);

console.log('VAPID_PUBLIC_KEY=' + base64Url(rawPublicKey));
console.log('VAPID_PRIVATE_KEY=' + privateJwk.d);
console.log('VAPID_SUBJECT=mailto:admin@nathoeng.com');
