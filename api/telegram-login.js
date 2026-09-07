import crypto from 'crypto';
import {
  createSessionToken,
  setSessionCookie,
  getSessionFromRequest
} from '../lib/_auth.js';

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
