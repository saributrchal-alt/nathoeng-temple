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

export default async function handler(req, res) {
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

    const telegramUid =
      String(
        claims.sub ||
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
    // Never merge two existing member records automatically.
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

      if (
        existingOwner &&
        String(existingOwner.id) !== String(session.memberId)
      ) {
        return res.status(409).json({
          success: false,
          code: 'PROVIDER_ALREADY_LINKED',
          message: 'This Telegram account is already linked to another member'
        });
      }

      const linkResponse = await fetch(
        supabaseUrl +
          '/rest/v1/members?id=eq.' +
          encodeURIComponent(session.memberId),
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

      role,

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
