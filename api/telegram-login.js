import crypto from 'crypto';
import {
  createSessionToken,
  setSessionCookie,
  getSessionFromRequest
} from '../lib/_auth.js';


const TELEGRAM_ISSUER =
  'https://oauth.telegram.org';

const TELEGRAM_TOKEN_URL =
  'https://oauth.telegram.org/token';

const TELEGRAM_JWKS_URL =
  'https://oauth.telegram.org/.well-known/jwks.json';

function decodeBase64UrlJson(value) {
  let base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (base64.length % 4) {
    base64 += '=';
  }

  return JSON.parse(
    Buffer.from(base64, 'base64').toString('utf8')
  );
}

function decodeBase64UrlBuffer(value) {
  let base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (base64.length % 4) {
    base64 += '=';
  }

  return Buffer.from(base64, 'base64');
}

async function verifyTelegramIdToken(
  idToken,
  clientId
) {
  const parts = idToken.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid Telegram ID token');
  }

  const header =
    decodeBase64UrlJson(parts[0]);

  const claims =
    decodeBase64UrlJson(parts[1]);

  if (header.alg !== 'RS256') {
    throw new Error(
      'Unsupported Telegram ID token algorithm'
    );
  }

  if (!header.kid) {
    throw new Error(
      'Telegram ID token key ID is missing'
    );
  }

  const jwksResponse =
    await fetch(TELEGRAM_JWKS_URL);

  if (!jwksResponse.ok) {
    throw new Error(
      'Unable to retrieve Telegram signing keys'
    );
  }

  const jwks =
    await jwksResponse.json();

  const jwk =
    Array.isArray(jwks.keys)
      ? jwks.keys.find(
          (key) => key.kid === header.kid
        )
      : null;

  if (!jwk) {
    throw new Error(
      'Telegram signing key was not found'
    );
  }

  const publicKey =
    crypto.createPublicKey({
      key: jwk,
      format: 'jwk'
    });

  const signingInput =
    Buffer.from(parts[0] + '.' + parts[1]);

  const signature =
    decodeBase64UrlBuffer(parts[2]);

  const signatureValid =
    crypto.verify(
      'RSA-SHA256',
      signingInput,
      publicKey,
      signature
    );

  if (!signatureValid) {
    throw new Error(
      'Telegram ID token signature is invalid'
    );
  }

  if (claims.iss !== TELEGRAM_ISSUER) {
    throw new Error(
      'Telegram ID token issuer is invalid'
    );
  }

  const audiences =
    Array.isArray(claims.aud)
      ? claims.aud.map(String)
      : [String(claims.aud || '')];

  if (!audiences.includes(String(clientId))) {
    throw new Error(
      'Telegram ID token audience is invalid'
    );
  }

  const now = Math.floor(Date.now() / 1000);

  if (!claims.exp || claims.exp <= now) {
    throw new Error(
      'Telegram ID token has expired'
    );
  }

  if (
    claims.iat &&
    claims.iat > now + 60
  ) {
    throw new Error(
      'Telegram ID token issued-at time is invalid'
    );
  }

  return claims;
}

async function mergeMembersForAccountLink(
  supabaseUrl,
  supabaseSecretKey,
  currentMemberId,
  providerOwnerId
) {
  const mergeResponse = await fetch(
    supabaseUrl + '/rest/v1/rpc/merge_members_for_account_link',
    {
      method: 'POST',
      headers: {
        apikey: supabaseSecretKey,
        Authorization: 'Bearer ' + supabaseSecretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_member_a: currentMemberId,
        p_member_b: providerOwnerId
      })
    }
  );

  const mergeResult = await mergeResponse.json();

  if (!mergeResponse.ok) {
    console.error('Automatic member merge failed:', mergeResult);

    const error = new Error(
      mergeResult?.message ||
      mergeResult?.hint ||
      'Unable to merge member accounts'
    );

    error.code = 'ACCOUNT_MERGE_FAILED';
    throw error;
  }

  const mergedMemberId =
    typeof mergeResult === 'string'
      ? mergeResult
      : mergeResult?.id || mergeResult;

  if (!mergedMemberId) {
    const error = new Error('Merged member ID was not returned');
    error.code = 'ACCOUNT_MERGE_FAILED';
    throw error;
  }

  return String(mergedMemberId);
}



// =====================================================
// Telegram Inbox Webhook
// Kept in this file so the /api folder stays within the
// project's 12-file .js limit.
// Telegram webhook URL:
//   /api/telegram-login?route=webhook
// =====================================================
function telegramWebhookSupabaseHeaders(secretKey, extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra
  };
}

async function telegramWebhookReadJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function handleTelegramWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  if (webhookSecret) {
    const receivedSecret = String(
      req.headers['x-telegram-bot-api-secret-token'] || ''
    );

    if (receivedSecret !== webhookSecret) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook secret'
      });
    }
  }

  const update = req.body || {};
  const message =
    update.message ||
    update.edited_message ||
    null;

  // Telegram expects HTTP 200 for updates we intentionally ignore.
  if (!message?.from?.id) {
    return res.status(200).json({
      success: true,
      ignored: true
    });
  }

  const telegramUid = String(message.from.id);
  const messageText = String(
    message.text ||
      message.caption ||
      '[ข้อความ Telegram ที่ไม่ใช่ข้อความตัวอักษร / Non-text Telegram message]'
  ).trim();

  try {
    const memberResponse = await fetch(
      `${supabaseUrl}/rest/v1/members` +
        `?telegram_uid=eq.${encodeURIComponent(telegramUid)}` +
        '&select=id,telegram_uid&limit=1',
      {
        method: 'GET',
        headers: telegramWebhookSupabaseHeaders(
          supabaseSecretKey
        ),
        cache: 'no-store'
      }
    );

    const members =
      await telegramWebhookReadJson(memberResponse);

    if (!memberResponse.ok) {
      console.error(
        'Telegram webhook member lookup failed:',
        members
      );

      return res.status(500).json({
        success: false,
        message: 'Member lookup failed'
      });
    }

    const member =
      Array.isArray(members) && members.length > 0
        ? members[0]
        : null;

    // Do not create conversations for Telegram users who
    // have not linked their account to a monastery member.
    if (!member?.id) {
      console.warn(
        'Telegram webhook received message from unlinked user:',
        telegramUid
      );

      return res.status(200).json({
        success: true,
        ignored: true,
        reason: 'unlinked_member'
      });
    }

    const sentAt = message.date
      ? new Date(Number(message.date) * 1000).toISOString()
      : new Date().toISOString();

    const payload = {
      member_id: member.id,
      channel: 'telegram',
      direction: 'inbound',
      message_text: messageText,
      status: 'received',
      sent_at: sentAt,
      sent_by_member_id: null,
      error_message: null,
      telegram_update_id:
        update.update_id != null
          ? String(update.update_id)
          : null,
      telegram_message_id:
        message.message_id != null
          ? String(message.message_id)
          : null
    };

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/member_communications`,
      {
        method: 'POST',
        headers: telegramWebhookSupabaseHeaders(
          supabaseSecretKey,
          {
            Prefer:
              'return=minimal,resolution=ignore-duplicates'
          }
        ),
        body: JSON.stringify(payload)
      }
    );

    if (!insertResponse.ok) {
      const insertError =
        await telegramWebhookReadJson(insertResponse);

      console.error(
        'Telegram webhook communication insert failed:',
        insertError
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to save Telegram reply'
      });
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(
      'Telegram webhook error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Telegram webhook failed'
    });
  }
}

export default async function handler(req, res) {
  if (String(req.query?.route || '') === 'webhook') {
    return handleTelegramWebhook(req, res);
  }
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    code,
    codeVerifier,
    redirectUri,
    mode
  } = req.body || {};

  const linkMode = mode === 'link';

  if (
    !code ||
    !codeVerifier ||
    !redirectUri
  ) {
    return res.status(400).json({
      success: false,
      message: 'Missing Telegram authorization data'
    });
  }

  const telegramClientId =
    process.env.TELEGRAM_CLIENT_ID;

  const telegramClientSecret =
    process.env.TELEGRAM_CLIENT_SECRET;

  const adminTelegramUid =
    process.env.ADMIN_TELEGRAM_UID;

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (
    !telegramClientId ||
    !telegramClientSecret
  ) {
    return res.status(500).json({
      success: false,
      message: 'Telegram login configuration is missing'
    });
  }

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return res.status(500).json({
      success: false,
      message: 'Member database configuration is missing'
    });
  }

  try {
    const basicAuth =
      Buffer.from(
        telegramClientId +
          ':' +
          telegramClientSecret
      ).toString('base64');

    const tokenBody =
      new URLSearchParams();

    tokenBody.append(
      'grant_type',
      'authorization_code'
    );

    tokenBody.append(
      'code',
      code
    );

    tokenBody.append(
      'redirect_uri',
      redirectUri
    );

    tokenBody.append(
      'client_id',
      telegramClientId
    );

    tokenBody.append(
      'code_verifier',
      codeVerifier
    );

    const tokenResponse =
      await fetch(
        TELEGRAM_TOKEN_URL,
        {
          method: 'POST',
          headers: {
            Authorization:
              'Basic ' + basicAuth,
            'Content-Type':
              'application/x-www-form-urlencoded'
          },
          body: tokenBody.toString()
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.id_token
    ) {
      console.error(
        'Telegram token exchange failed:',
        tokenData
      );

      return res.status(401).json({
        success: false,
        message:
          'Unable to exchange Telegram authorization code'
      });
    }

    const claims =
      await verifyTelegramIdToken(
        tokenData.id_token,
        telegramClientId
      );

    // Telegram Bot API needs the real Telegram user ID.
    // OIDC `sub` is the subject identifier and must not be used as chat_id.
    const telegramUid =
      String(
        claims.id ||
        ''
      );

    if (!telegramUid) {
      return res.status(401).json({
        success: false,
        message:
          'Telegram user ID is missing'
      });
    }

    const isAdmin =
      Boolean(adminTelegramUid) &&
      telegramUid ===
        String(adminTelegramUid);

    const role =
      isAdmin
        ? 'admin'
        : 'member';

    const now =
      new Date().toISOString();

    const displayName =
      claims.name ||
      claims.given_name ||
      claims.preferred_username ||
      'Telegram Member';

    // =====================================================
    // Account linking mode
    // Link this Telegram identity to the member already signed in.
    // If the verified Telegram identity belongs to another member, merge safely via the server-only RPC.
    // =====================================================
    if (linkMode) {
      const session = getSessionFromRequest(req);

      if (!session?.memberId) {
        return res.status(401).json({
          success: false,
          message: 'Please sign in before linking Telegram'
        });
      }

      const existingResponse = await fetch(
        supabaseUrl +
          '/rest/v1/members?telegram_uid=eq.' +
          encodeURIComponent(telegramUid) +
          '&select=id,line_uid,telegram_uid,telegram_username,display_name,picture_url,role&limit=1',
        {
          headers: {
            apikey: supabaseSecretKey,
            Authorization: 'Bearer ' + supabaseSecretKey
          }
        }
      );

      const existingRows = await existingResponse.json();

      if (!existingResponse.ok) {
        console.error('Unable to check existing Telegram link:', existingRows);
        return res.status(500).json({
          success: false,
          message: 'Unable to check Telegram account link'
        });
      }

      const existingOwner =
        Array.isArray(existingRows) && existingRows.length > 0
          ? existingRows[0]
          : null;

      let memberIdToUpdate = String(session.memberId);
      let merged = false;

      if (
        existingOwner &&
        String(existingOwner.id) !== String(session.memberId)
      ) {
        try {
          memberIdToUpdate = await mergeMembersForAccountLink(
            supabaseUrl,
            supabaseSecretKey,
            session.memberId,
            existingOwner.id
          );
          merged = true;
        } catch (mergeError) {
          return res.status(409).json({
            success: false,
            code: mergeError.code || 'ACCOUNT_MERGE_FAILED',
            message:
              'Telegram is already connected to another member and the accounts could not be merged safely'
          });
        }
      }

      const linkResponse = await fetch(
        supabaseUrl +
          '/rest/v1/members?id=eq.' +
          encodeURIComponent(memberIdToUpdate),
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseSecretKey,
            Authorization: 'Bearer ' + supabaseSecretKey,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            telegram_uid: telegramUid,
            telegram_username: claims.preferred_username || null,
            last_login_at: now
          })
        }
      );

      const linkResult = await linkResponse.json();

      if (!linkResponse.ok) {
        console.error('Telegram account link failed:', linkResult);
        return res.status(500).json({
          success: false,
          message: 'Unable to link Telegram account'
        });
      }

      const linkedMember =
        Array.isArray(linkResult) && linkResult.length > 0
          ? linkResult[0]
          : null;

      if (!linkedMember) {
        return res.status(404).json({
          success: false,
          message: 'Signed-in member was not found'
        });
      }

      const sessionToken = createSessionToken({
        memberId: linkedMember.id,
        lineUid: linkedMember.line_uid || null,
        telegramUid: linkedMember.telegram_uid,
        authProvider: session.authProvider || 'telegram',
        role: linkedMember.role
      });

      setSessionCookie(res, sessionToken);

      return res.status(200).json({
        success: true,
        linked: true,
        merged,
        user: {
          memberId: linkedMember.id,
          name: linkedMember.display_name,
          lineUid: linkedMember.line_uid || null,
          telegramUid: linkedMember.telegram_uid,
          telegramUsername: linkedMember.telegram_username || '',
          picture: linkedMember.picture_url || '',
          role: linkedMember.role,
          authProvider: session.authProvider || 'telegram',
          isAdmin: linkedMember.role === 'admin'
        }
      });
    }

    // Preserve an existing Admin role. Logging in through Telegram
    // must not downgrade an Admin account that was originally created by LINE.
    let effectiveRole = role;

    const existingRoleResponse = await fetch(
      supabaseUrl +
        '/rest/v1/members?telegram_uid=eq.' +
        encodeURIComponent(telegramUid) +
        '&select=role&limit=1',
      {
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey
        }
      }
    );

    if (existingRoleResponse.ok) {
      const existingRoleRows = await existingRoleResponse.json();
      const existingRole =
        Array.isArray(existingRoleRows) && existingRoleRows.length > 0
          ? existingRoleRows[0]?.role
          : null;

      if (existingRole === 'admin') {
        effectiveRole = 'admin';
      }
    }

    const memberData = {
      telegram_uid:
        telegramUid,

      telegram_username:
        claims.preferred_username ||
        null,

      auth_provider:
        'telegram',

      display_name:
        displayName,

      picture_url:
        claims.picture ||
        null,

      role:
        effectiveRole,

      last_login_at:
        now
    };

    const memberResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/members?on_conflict=telegram_uid',
        {
          method: 'POST',
          headers: {
            apikey:
              supabaseSecretKey,

            Authorization:
              'Bearer ' +
              supabaseSecretKey,

            'Content-Type':
              'application/json',

            Prefer:
              'resolution=merge-duplicates,return=representation'
          },
          body:
            JSON.stringify(
              memberData
            )
        }
      );

    const memberResult =
      await memberResponse.json();

    if (!memberResponse.ok) {
      console.error(
        'Supabase Telegram member upsert failed:',
        memberResult
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to save Telegram member information'
      });
    }

    const savedMember =
      Array.isArray(memberResult) &&
      memberResult.length > 0
        ? memberResult[0]
        : null;

    if (!savedMember) {
      return res.status(500).json({
        success: false,
        message:
          'Telegram member record was not returned'
      });
    }

    const sessionToken =
      createSessionToken({
        memberId:
          savedMember.id,

        lineUid:
          savedMember.line_uid ||
          null,

        telegramUid:
          savedMember.telegram_uid,

        authProvider:
          'telegram',

        role:
          savedMember.role
      });

    setSessionCookie(
      res,
      sessionToken
    );

    return res.status(200).json({
      success: true,

      user: {
        memberId:
          savedMember.id,

        name:
          savedMember.display_name,

        lineUid:
          savedMember.line_uid ||
          null,

        telegramUid:
          savedMember.telegram_uid,

        telegramUsername:
          savedMember.telegram_username ||
          '',

        picture:
          savedMember.picture_url ||
          '',

        role:
          savedMember.role,

        authProvider:
          'telegram',

        isAdmin:
          savedMember.role ===
          'admin'
      }
    });
  } catch (error) {
    console.error(
      'Telegram login server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Telegram login server error'
    });
  }
}
