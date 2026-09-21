import crypto from 'crypto';

const COOKIE_NAME = 'nathoeng_session';

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

function verifySessionToken(token) {
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
    receivedBuffer.length !==
    expectedBuffer.length
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

    if (
      !payload.exp ||
      Date.now() > payload.exp
    ) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(
      'Invalid session payload:',
      error
    );
    return null;
  }
}

function getSessionFromRequest(req) {
  const cookieHeader =
    req.headers.cookie || '';

  const cookies = cookieHeader
    .split(';')
    .map((item) => item.trim());

  const sessionCookie =
    cookies.find((item) =>
      item.startsWith(
        COOKIE_NAME + '='
      )
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

function requireAdmin(req, res) {
  const session =
    getSessionFromRequest(req);

  if (
    !session ||
    session.role !== 'admin'
  ) {
    res.status(403).json({
      success: false,
      message:
        'Admin permission required'
    });

    return null;
  }

  return session;
}

function supabaseHeaders(secretKey, extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra
  };
}

async function readJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      'Practice messages invalid JSON:',
      text
    );
    return null;
  }
}

async function loadMember({
  supabaseUrl,
  secretKey,
  memberId
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/members` +
      `?id=eq.${encodeURIComponent(memberId)}` +
      '&select=id,full_name,display_name' +
      '&limit=1',
    {
      method: 'GET',
      headers: supabaseHeaders(secretKey)
    }
  );

  const data = await readJson(response);

  if (
    !response.ok ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return null;
  }

  return data[0];
}

async function loadMessage({
  supabaseUrl,
  secretKey,
  messageId
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/practice_messages` +
      `?id=eq.${encodeURIComponent(messageId)}` +
      '&select=*' +
      '&limit=1',
    {
      method: 'GET',
      headers: supabaseHeaders(secretKey)
    }
  );

  const data = await readJson(response);

  if (
    !response.ok ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return null;
  }

  return data[0];
}


function base64UrlToBuffer(value) {
  let base64 = String(value || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (base64.length % 4) {
    base64 += '=';
  }

  return Buffer.from(base64, 'base64');
}

function base64UrlEncodeBuffer(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createVapidAuthorization(endpoint) {
  const publicKey =
    String(process.env.VAPID_PUBLIC_KEY || '').trim();

  const privateKey =
    String(process.env.VAPID_PRIVATE_KEY || '').trim();

  const subject =
    String(
      process.env.VAPID_SUBJECT ||
      'mailto:admin@nathoeng.com'
    ).trim();

  if (!publicKey || !privateKey) {
    return null;
  }

  const publicBytes =
    base64UrlToBuffer(publicKey);

  if (
    publicBytes.length !== 65 ||
    publicBytes[0] !== 4
  ) {
    throw new Error(
      'Invalid VAPID public key'
    );
  }

  const x = base64UrlEncodeBuffer(
    publicBytes.subarray(1, 33)
  );

  const y = base64UrlEncodeBuffer(
    publicBytes.subarray(33, 65)
  );

  const d = base64UrlEncodeBuffer(
    base64UrlToBuffer(privateKey)
  );

  const privateKeyObject =
    crypto.createPrivateKey({
      key: {
        kty: 'EC',
        crv: 'P-256',
        x,
        y,
        d
      },
      format: 'jwk'
    });

  const audience =
    new URL(endpoint).origin;

  const now =
    Math.floor(Date.now() / 1000);

  const header =
    base64UrlEncodeBuffer(
      Buffer.from(
        JSON.stringify({
          typ: 'JWT',
          alg: 'ES256'
        })
      )
    );

  const payload =
    base64UrlEncodeBuffer(
      Buffer.from(
        JSON.stringify({
          aud: audience,
          exp: now + 60 * 60 * 12,
          sub: subject
        })
      )
    );

  const unsignedToken =
    `${header}.${payload}`;

  const signature =
    crypto.sign(
      'sha256',
      Buffer.from(unsignedToken),
      {
        key: privateKeyObject,
        dsaEncoding: 'ieee-p1363'
      }
    );

  const token =
    `${unsignedToken}.${base64UrlEncodeBuffer(signature)}`;

  return `vapid t=${token}, k=${publicKey}`;
}

function hkdfExtract(salt, ikm) {
  return crypto.createHmac('sha256', salt).update(ikm).digest();
}

function hkdfExpand(prk, info, length) {
  const chunks = [];
  let previous = Buffer.alloc(0);
  let counter = 1;
  let total = 0;

  while (total < length) {
    previous = crypto
      .createHmac('sha256', prk)
      .update(Buffer.concat([
        previous,
        Buffer.from(info),
        Buffer.from([counter])
      ]))
      .digest();
    chunks.push(previous);
    total += previous.length;
    counter += 1;
  }

  return Buffer.concat(chunks).subarray(0, length);
}

function createEncryptedPushBody({ p256dh, auth, payload }) {
  const userPublicKey = base64UrlToBuffer(p256dh);
  const authSecret = base64UrlToBuffer(auth);

  if (userPublicKey.length !== 65 || userPublicKey[0] !== 4) {
    throw new Error('Invalid subscriber p256dh key');
  }

  if (!authSecret.length) {
    throw new Error('Invalid subscriber auth secret');
  }

  const serverECDH = crypto.createECDH('prime256v1');
  serverECDH.generateKeys();

  const serverPublicKey = serverECDH.getPublicKey();
  const sharedSecret = serverECDH.computeSecret(userPublicKey);

  const authPrk = hkdfExtract(authSecret, sharedSecret);
  const keyInfo = Buffer.concat([
    Buffer.from('WebPush: info'),
    Buffer.from([0]),
    userPublicKey,
    serverPublicKey
  ]);
  const ikm = hkdfExpand(authPrk, keyInfo, 32);

  const salt = crypto.randomBytes(16);
  const prk = hkdfExtract(salt, ikm);
  const cek = hkdfExpand(
    prk,
    Buffer.concat([
      Buffer.from('Content-Encoding: aes128gcm'),
      Buffer.from([0])
    ]),
    16
  );
  const nonce = hkdfExpand(
    prk,
    Buffer.concat([
      Buffer.from('Content-Encoding: nonce'),
      Buffer.from([0])
    ]),
    12
  );

  const plaintext = Buffer.concat([
    Buffer.from(JSON.stringify(payload), 'utf8'),
    Buffer.from([2])
  ]);

  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  const ciphertext = Buffer.concat([encrypted, tag]);

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);

  return Buffer.concat([
    salt,
    recordSize,
    Buffer.from([serverPublicKey.length]),
    serverPublicKey,
    ciphertext
  ]);
}

async function sendPushNotification(subscription, message) {
  const authorization =
    createVapidAuthorization(subscription.endpoint);

  if (!authorization) {
    return {
      ok: false,
      skipped: true,
      status: 0
    };
  }

  if (!subscription.p256dh || !subscription.auth) {
    return {
      ok: false,
      skipped: true,
      status: 0
    };
  }

  const body = createEncryptedPushBody({
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    payload: {
      title: message?.title || 'Nathoeng Connect',
      body: message?.body || 'มีข้อความใหม่จากวัดพุทธอุทยานนาเทิง',
      tag: message?.id
        ? `nathoeng-connect-${message.id}`
        : 'nathoeng-connect',
      url: '/#practice-messages'
    }
  });

  const response =
    await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        TTL: '86400',
        Urgency: 'high',
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(body.length)
      },
      body
    });

  return {
    ok: response.ok,
    skipped: false,
    status: response.status
  };
}

async function notifySubscribers({
  supabaseUrl,
  secretKey,
  audience,
  targetMemberId,
  message
}) {
  const filter =
    audience === 'member' &&
    targetMemberId
      ? `&member_id=eq.${encodeURIComponent(targetMemberId)}`
      : '';

  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions` +
        '?select=id,endpoint,member_id,p256dh,auth' +
        '&is_active=eq.true' +
        filter,
      {
        method: 'GET',
        headers:
          supabaseHeaders(secretKey)
      }
    );

  const rows =
    await readJson(response);

  if (!response.ok) {
    console.error(
      'Push subscription lookup failed:',
      rows
    );
    return;
  }

  const summary = {
    subscriptions: Array.isArray(rows) ? rows.length : 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
    statuses: []
  };

  for (const item of (
    Array.isArray(rows) ? rows : []
  )) {
    try {
      const result =
        await sendPushNotification(
          item,
          message
        );

      summary.statuses.push(result.status);
      if (result.skipped) summary.skipped += 1;
      else if (result.ok) summary.delivered += 1;
      else summary.failed += 1;

      if (
        !result.skipped &&
        (
          result.status === 404 ||
          result.status === 410
        )
      ) {
        await fetch(
          `${supabaseUrl}/rest/v1/push_subscriptions` +
            `?id=eq.${encodeURIComponent(item.id)}`,
          {
            method: 'PATCH',
            headers:
              supabaseHeaders(secretKey),
            body: JSON.stringify({
              is_active: false,
              updated_at:
                new Date().toISOString()
            })
          }
        );
      }
    } catch (error) {
      summary.failed += 1;
      console.error(
        'Push delivery failed:',
        error
      );
    }
  }

  console.log('Nathoeng Connect push summary:', summary);
  return summary;
}

export default async function handler(req, res) {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  if (req.method === 'GET') {
    const session =
      getSessionFromRequest(req);

    if (!session?.memberId) {
      return res.status(401).json({
        success: false,
        message: 'Login required'
      });
    }

    const scope =
      String(req.query?.scope || '').trim();

    try {
      if (scope === 'push-config') {
        return res.status(200).json({
          success: true,
          publicKey:
            String(
              process.env.VAPID_PUBLIC_KEY || ''
            ).trim(),
          configured:
            Boolean(
              process.env.VAPID_PUBLIC_KEY &&
              process.env.VAPID_PRIVATE_KEY
            )
        });
      }

      if (scope === 'admin') {
        const admin =
          requireAdmin(req, res);

        if (!admin) return;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/practice_messages` +
            '?select=*' +
            '&order=created_at.desc',
          {
            method: 'GET',
            headers:
              supabaseHeaders(supabaseSecretKey)
          }
        );

        const data =
          await readJson(response);

        if (!response.ok) {
          return res.status(500).json({
            success: false,
            message:
              'Unable to load practice messages'
          });
        }

        return res.status(200).json({
          success: true,
          messages:
            Array.isArray(data) ? data : []
        });
      }

      if (scope === 'members') {
        const admin =
          requireAdmin(req, res);

        if (!admin) return;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/members` +
            '?select=id,full_name,display_name' +
            '&limit=500',
          {
            method: 'GET',
            headers:
              supabaseHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const data =
          await readJson(response);

        if (!response.ok) {
          console.error(
            'Practice message member lookup failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to load members',
            databaseError: data
          });
        }

        const members =
          (Array.isArray(data) ? data : [])
            .slice()
            .sort((a, b) => {
              const aName =
                String(
                  a?.full_name ||
                  a?.display_name ||
                  ''
                ).trim();

              const bName =
                String(
                  b?.full_name ||
                  b?.display_name ||
                  ''
                ).trim();

              return aName.localeCompare(
                bName,
                'th',
                {
                  sensitivity: 'base'
                }
              );
            });

        return res.status(200).json({
          success: true,
          members
        });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/practice_messages` +
          '?is_published=eq.true' +
          '&select=id,audience,target_member_id,title,body,created_at,updated_at' +
          '&order=created_at.desc',
        {
          method: 'GET',
          headers:
            supabaseHeaders(supabaseSecretKey)
        }
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        return res.status(500).json({
          success: false,
          message:
            'Unable to load your practice messages'
        });
      }

      const messages =
        (Array.isArray(data) ? data : [])
          .filter((item) =>
            item.audience === 'all' ||
            (
              item.audience === 'member' &&
              item.target_member_id ===
                session.memberId
            )
          );

      return res.status(200).json({
        success: true,
        messages
      });
    } catch (error) {
      console.error(
        'Practice messages GET error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Practice messages server error'
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const body = req.body || {};
  const action =
    String(body.action || '').trim();

  if (
    action === 'subscribe_push' ||
    action === 'unsubscribe_push'
  ) {
    const memberSession =
      getSessionFromRequest(req);

    if (!memberSession?.memberId) {
      return res.status(401).json({
        success: false,
        message: 'Login required'
      });
    }

    const endpoint =
      String(body.endpoint || '').trim();

    const p256dh =
      String(body.p256dh || '').trim();

    const auth =
      String(body.auth || '').trim();

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Push endpoint is required'
      });
    }

    if (
      action === 'subscribe_push' &&
      (!p256dh || !auth)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Push encryption keys are required'
      });
    }

    try {
      if (action === 'unsubscribe_push') {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/push_subscriptions` +
            `?endpoint=eq.${encodeURIComponent(endpoint)}` +
            `&member_id=eq.${encodeURIComponent(memberSession.memberId)}`,
          {
            method: 'PATCH',
            headers:
              supabaseHeaders(supabaseSecretKey),
            body: JSON.stringify({
              is_active: false,
              updated_at:
                new Date().toISOString()
            })
          }
        );

        if (!response.ok) {
          return res.status(500).json({
            success: false,
            message:
              'Unable to disable push notifications'
          });
        }

        return res.status(200).json({
          success: true
        });
      }

      const now =
        new Date().toISOString();

      const response = await fetch(
        `${supabaseUrl}/rest/v1/push_subscriptions`,
        {
          method: 'POST',
          headers:
            supabaseHeaders(
              supabaseSecretKey,
              {
                Prefer:
                  'resolution=merge-duplicates,return=representation'
              }
            ),
          body: JSON.stringify({
            member_id:
              memberSession.memberId,
            endpoint,
            p256dh,
            auth,
            is_active: true,
            created_at: now,
            updated_at: now
          })
        }
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        console.error(
          'Push subscription save failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to save push subscription'
        });
      }

      return res.status(200).json({
        success: true
      });
    } catch (error) {
      console.error(
        'Push subscription error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Push subscription server error'
      });
    }
  }

  const session =
    requireAdmin(req, res);

  if (!session) return;

  try {
    if (
      action === 'create' ||
      action === 'update'
    ) {
      const title =
        String(body.title || '').trim();

      const messageBody =
        String(body.body || '').trim();

      const audience =
        body.audience === 'member'
          ? 'member'
          : 'all';

      const targetMemberId =
        audience === 'member'
          ? String(
              body.targetMemberId || ''
            ).trim()
          : null;

      const isPublished =
        body.isPublished !== false;

      if (!title || !messageBody) {
        return res.status(400).json({
          success: false,
          message:
            'Title and message are required'
        });
      }

      if (
        title.length > 200 ||
        messageBody.length > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: 'Message is too long'
        });
      }

      if (
        audience === 'member' &&
        !targetMemberId
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Please select a recipient'
        });
      }

      if (targetMemberId) {
        const targetMember =
          await loadMember({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              targetMemberId
          });

        if (!targetMember) {
          return res.status(400).json({
            success: false,
            message: 'Recipient not found'
          });
        }
      }

      const now =
        new Date().toISOString();

      if (action === 'create') {
        const payload = {
          audience,
          target_member_id:
            targetMemberId,
          title,
          body: messageBody,
          is_published:
            isPublished,
          created_by_member_id:
            session.memberId,
          created_at: now,
          updated_at: now
        };

        const response = await fetch(
          `${supabaseUrl}/rest/v1/practice_messages`,
          {
            method: 'POST',
            headers:
              supabaseHeaders(
                supabaseSecretKey,
                {
                  Prefer:
                    'return=representation'
                }
              ),
            body: JSON.stringify(payload)
          }
        );

        const data =
          await readJson(response);

        if (!response.ok) {
          console.error(
            'Create practice message failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message:
              'Unable to create practice message'
          });
        }

        let push = null;

        if (isPublished) {
          try {
            push = await notifySubscribers({
              supabaseUrl,
              secretKey:
                supabaseSecretKey,
              audience,
              targetMemberId,
              message: Array.isArray(data)
                ? data[0]
                : data
            });
          } catch (error) {
            console.error(
              'Nathoeng Connect push error:',
              error
            );
            push = {
              subscriptions: 0,
              delivered: 0,
              failed: 1,
              skipped: 0,
              statuses: [],
              error: String(error?.message || error)
            };
          }
        }

        return res.status(200).json({
          success: true,
          message:
            Array.isArray(data)
              ? data[0]
              : data,
          push
        });
      }

      const messageId =
        String(body.messageId || '').trim();

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
      }

      const existing =
        await loadMessage({
          supabaseUrl,
          secretKey:
            supabaseSecretKey,
          messageId
        });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/practice_messages` +
          `?id=eq.${encodeURIComponent(messageId)}`,
        {
          method: 'PATCH',
          headers:
            supabaseHeaders(
              supabaseSecretKey,
              {
                Prefer:
                  'return=representation'
              }
            ),
          body: JSON.stringify({
            audience,
            target_member_id:
              targetMemberId,
            title,
            body: messageBody,
            is_published:
              isPublished,
            updated_at: now
          })
        }
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        return res.status(500).json({
          success: false,
          message:
            'Unable to update practice message'
        });
      }

      return res.status(200).json({
        success: true,
        message:
          Array.isArray(data)
            ? data[0]
            : data
      });
    }

    if (action === 'toggle_publish') {
      const messageId =
        String(body.messageId || '').trim();

      const isPublished =
        body.isPublished === true;

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/practice_messages` +
          `?id=eq.${encodeURIComponent(messageId)}`,
        {
          method: 'PATCH',
          headers:
            supabaseHeaders(
              supabaseSecretKey,
              {
                Prefer:
                  'return=representation'
              }
            ),
          body: JSON.stringify({
            is_published:
              isPublished,
            updated_at:
              new Date().toISOString()
          })
        }
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        return res.status(500).json({
          success: false,
          message:
            'Unable to update publish status'
        });
      }

      return res.status(200).json({
        success: true,
        message:
          Array.isArray(data)
            ? data[0]
            : data
      });
    }

    if (action === 'delete') {
      const messageId =
        String(body.messageId || '').trim();

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/practice_messages` +
          `?id=eq.${encodeURIComponent(messageId)}`,
        {
          method: 'DELETE',
          headers:
            supabaseHeaders(
              supabaseSecretKey
            )
        }
      );

      if (!response.ok) {
        const data =
          await readJson(response);

        console.error(
          'Delete practice message failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to delete practice message'
        });
      }

      return res.status(200).json({
        success: true
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  } catch (error) {
    console.error(
      'Practice messages POST error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Practice messages server error'
    });
  }
}
