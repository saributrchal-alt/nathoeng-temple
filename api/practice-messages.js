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

  const session =
    requireAdmin(req, res);

  if (!session) return;

  const body = req.body || {};
  const action =
    String(body.action || '').trim();

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

        return res.status(200).json({
          success: true,
          message:
            Array.isArray(data)
              ? data[0]
              : data
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
