import crypto from 'crypto';
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromRequest
} from '../lib/_auth.js';


const LINE_REDIRECT_URI = 'https://watt.nathoeng.com/line-callback';

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signLineOauthState(encodedPayload) {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is missing');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function normalizeReturnPage(value) {
  const page = String(value || '').trim();

  const allowed = new Set([
    'home',
    'login-page',
    'my-dashboard',
    'my-stays',
    'booking-page',
    'calendar-page',
    'donation-page',
    'donation-list',
    'checkin-page',
    'practice-messages',
    'stay-process',
    'prepare-stay',
    'contact-page',
    'visit-guide',
    'teachings-page',
    'event-kathina'
  ]);

  return allowed.has(page) ? page : 'my-dashboard';
}

function createLineOauthState({ mode, returnPage }) {
  const payload = {
    v: 1,
    mode: mode === 'link' ? 'link' : 'login',
    returnPage: normalizeReturnPage(returnPage),
    nonce: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + 10 * 60 * 1000
  };

  const encodedPayload =
    base64UrlEncode(JSON.stringify(payload));

  const signature =
    signLineOauthState(encodedPayload);

  return encodedPayload + '.' + signature;
}

function verifyLineOauthState(state) {
  try {
    const parts = String(state || '').split('.');

    if (parts.length !== 2) {
      return null;
    }

    const encodedPayload = parts[0];
    const receivedSignature = parts[1];
    const expectedSignature =
      signLineOauthState(encodedPayload);

    const receivedBuffer =
      Buffer.from(receivedSignature);

    const expectedBuffer =
      Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    let base64 = encodedPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (base64.length % 4) {
      base64 += '=';
    }

    const payload =
      JSON.parse(
        Buffer.from(base64, 'base64')
          .toString('utf8')
      );

    if (
      payload?.v !== 1 ||
      !payload.exp ||
      Date.now() > payload.exp
    ) {
      return null;
    }

    return {
      mode:
        payload.mode === 'link'
          ? 'link'
          : 'login',
      returnPage:
        normalizeReturnPage(payload.returnPage)
    };
  } catch (error) {
    console.error('Invalid LINE OAuth state:', error);
    return null;
  }
}

function getRequestCountryCode(req) {
  const raw =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||
    '';

  const value = Array.isArray(raw) ? raw[0] : raw;
  const code = String(value || '').trim().toUpperCase();

  return /^[A-Z]{2}$/.test(code) ? code : null;
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

export default async function handler(req, res) {
  const route =
    String(req.query?.route || '').trim();

  const lineChannelId =
    process.env.LINE_CHANNEL_ID;

  const lineChannelSecret =
    process.env.LINE_CHANNEL_SECRET;

  const adminLineUid =
    process.env.ADMIN_LINE_UID;

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  // -----------------------------------------------------
  // Server-authoritative session check.
  // The React app uses this instead of trusting localStorage.
  // -----------------------------------------------------
  if (req.method === 'GET' && route === 'session') {
    const session = getSessionFromRequest(req);

    if (!session?.memberId) {
      return res.status(401).json({
        success: false,
        code: 'NO_SERVER_SESSION',
        message: 'Login required'
      });
    }

    if (!supabaseUrl || !supabaseSecretKey) {
      return res.status(500).json({
        success: false,
        message: 'Member database configuration is missing'
      });
    }

    try {
      const response = await fetch(
        supabaseUrl +
          '/rest/v1/members?id=eq.' +
          encodeURIComponent(session.memberId) +
          '&select=id,line_uid,telegram_uid,telegram_username,display_name,picture_url,role,line_oa_friend,line_oa_checked_at&limit=1',
        {
          method: 'GET',
          headers: {
            apikey: supabaseSecretKey,
            Authorization: 'Bearer ' + supabaseSecretKey
          },
          cache: 'no-store'
        }
      );

      const rows = await response.json();

      if (!response.ok) {
        console.error('Session member lookup failed:', rows);
        return res.status(500).json({
          success: false,
          message: 'Unable to verify member session'
        });
      }

      const member =
        Array.isArray(rows) && rows.length > 0
          ? rows[0]
          : null;

      if (!member) {
        clearSessionCookie(res);

        return res.status(401).json({
          success: false,
          code: 'MEMBER_NOT_FOUND',
          message: 'Member session is no longer valid'
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          memberId: member.id,
          name: member.display_name,
          lineUid: member.line_uid || null,
          telegramUid: member.telegram_uid || null,
          telegramUsername:
            member.telegram_username || '',
          picture: member.picture_url || '',
          role: member.role,
          isAdmin: member.role === 'admin',
          authProvider:
            session.authProvider ||
            (member.telegram_uid && !member.line_uid
              ? 'telegram'
              : 'line'),
          lineOaFriend:
            member.line_oa_friend === true,
          lineOaCheckedAt:
            member.line_oa_checked_at || null
        }
      });
    } catch (error) {
      console.error('Session verification error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to verify member session'
      });
    }
  }

  // -----------------------------------------------------
  // Create a signed OAuth state on the server.
  // This survives LINE / Messenger switching browser contexts
  // because the callback carries the signed state in its URL.
  // -----------------------------------------------------
  if (req.method === 'GET' && route === 'start') {
    if (!lineChannelId) {
      return res.status(500).json({
        success: false,
        message: 'LINE login configuration is missing'
      });
    }

    const requestedMode =
      String(req.query?.mode || 'login') === 'link'
        ? 'link'
        : 'login';

    if (requestedMode === 'link') {
      const session = getSessionFromRequest(req);

      if (!session?.memberId) {
        return res.status(401).json({
          success: false,
          code: 'LINK_SESSION_REQUIRED',
          message: 'Please sign in before linking LINE'
        });
      }
    }

    try {
      const state = createLineOauthState({
        mode: requestedMode,
        returnPage: req.query?.returnPage
      });

      const authUrl =
        'https://access.line.me/oauth2/v2.1/authorize' +
        '?response_type=code' +
        '&client_id=' +
          encodeURIComponent(lineChannelId) +
        '&redirect_uri=' +
          encodeURIComponent(LINE_REDIRECT_URI) +
        '&state=' +
          encodeURIComponent(state) +
        '&scope=' +
          encodeURIComponent('profile openid email') +
        '&bot_prompt=aggressive';

      return res.status(200).json({
        success: true,
        authUrl
      });
    } catch (error) {
      console.error('Unable to create LINE OAuth state:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to start LINE Login'
      });
    }
  }

  if (req.method === 'POST' && route === 'logout') {
    clearSessionCookie(res);

    return res.status(200).json({
      success: true
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    code,
    state
  } = req.body || {};

  const oauthState =
    verifyLineOauthState(state);

  if (!oauthState) {
    return res.status(400).json({
      success: false,
      code: 'OAUTH_STATE_INVALID',
      message: 'LINE login session is invalid or expired'
    });
  }

  const linkMode =
    oauthState.mode === 'link';

  const returnPage =
    oauthState.returnPage;

  const countryCode =
    getRequestCountryCode(req);

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Missing LINE authorization code'
    });
  }


  if (!lineChannelId || !lineChannelSecret) {
    console.error('Missing LINE environment variables');

    return res.status(500).json({
      success: false,
      message: 'LINE login configuration is missing'
    });
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('Missing Supabase environment variables');

    return res.status(500).json({
      success: false,
      message: 'Member database configuration is missing'
    });
  }

  try {
    // =====================================================
    // 1. Exchange LINE authorization code for access token
    // =====================================================
    const tokenBody = new URLSearchParams();

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
      LINE_REDIRECT_URI
    );

    tokenBody.append(
      'client_id',
      lineChannelId
    );

    tokenBody.append(
      'client_secret',
      lineChannelSecret
    );

    const tokenResponse = await fetch(
      'https://api.line.me/oauth2/v2.1/token',
      {
        method: 'POST',
        headers: {
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
      !tokenData.access_token
    ) {
      console.error(
        'LINE token exchange failed:',
        tokenData
      );

      return res.status(401).json({
        success: false,
        message:
          'Unable to exchange LINE authorization code'
      });
    }

    const accessToken =
      tokenData.access_token;

    // =====================================================
    // 2. Get LINE profile
    // =====================================================
    const profileResponse =
      await fetch(
        'https://api.line.me/v2/profile',
        {
          method: 'GET',
          headers: {
            Authorization:
              'Bearer ' + accessToken
          }
        }
      );

    const profile =
      await profileResponse.json();

    if (
      !profileResponse.ok ||
      !profile.userId
    ) {
      console.error(
        'LINE profile request failed:',
        profile
      );

      return res.status(401).json({
        success: false,
        message:
          'Unable to retrieve LINE profile'
      });
    }

    // =====================================================
    // 3. Check LINE OA friendship
    //
    // IMPORTANT:
    // Friendship check must NOT block login.
    // If LINE API check fails, user can still login.
    // =====================================================
    let lineOaFriend = null;

    try {
      const friendshipResponse =
        await fetch(
          'https://api.line.me/friendship/v1/status',
          {
            method: 'GET',
            headers: {
              Authorization:
                'Bearer ' + accessToken
            }
          }
        );

      if (friendshipResponse.ok) {
        const friendshipData =
          await friendshipResponse.json();

        lineOaFriend =
          friendshipData.friendFlag === true;
      } else {
        const friendshipError =
          await friendshipResponse.text();

        console.warn(
          'LINE friendship status request failed:',
          friendshipResponse.status,
          friendshipError
        );
      }
    } catch (friendshipError) {
      console.warn(
        'Unable to check LINE OA friendship:',
        friendshipError
      );
    }

    // =====================================================
    // 4. Determine member role
    // =====================================================
    const isAdmin =
      Boolean(adminLineUid) &&
      profile.userId === adminLineUid;

    const role =
      isAdmin
        ? 'admin'
        : 'member';

    const now =
      new Date().toISOString();

    // =====================================================
    // Account linking mode
    // Link this LINE identity to the member already signed in.
    // Never merge two existing member records automatically.
    // =====================================================
    if (linkMode) {
      const session = getSessionFromRequest(req);

      if (!session?.memberId) {
        return res.status(401).json({
          success: false,
          message: 'Please sign in before linking LINE'
        });
      }

      const existingResponse = await fetch(
        supabaseUrl +
          '/rest/v1/members?line_uid=eq.' +
          encodeURIComponent(profile.userId) +
          '&select=id,line_uid,telegram_uid,display_name,picture_url,role&limit=1',
        {
          headers: {
            apikey: supabaseSecretKey,
            Authorization: 'Bearer ' + supabaseSecretKey
          }
        }
      );

      const existingRows = await existingResponse.json();

      if (!existingResponse.ok) {
        console.error('Unable to check existing LINE link:', existingRows);
        return res.status(500).json({
          success: false,
          message: 'Unable to check LINE account link'
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
              'LINE is already connected to another member and the accounts could not be merged safely'
          });
        }
      }

      const patchData = {
        line_uid: profile.userId,
        last_login_at: now,
        line_oa_checked_at: now
      };

      if (lineOaFriend !== null) {
        patchData.line_oa_friend = lineOaFriend;
      }

      if (countryCode) {
        patchData.country_code = countryCode;
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
          body: JSON.stringify(patchData)
        }
      );

      const linkResult = await linkResponse.json();

      if (!linkResponse.ok) {
        console.error('LINE account link failed:', linkResult);
        return res.status(500).json({
          success: false,
          message: 'Unable to link LINE account'
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
        lineUid: linkedMember.line_uid,
        telegramUid: linkedMember.telegram_uid || null,
        authProvider: session.authProvider || 'line',
        role: linkedMember.role
      });

      setSessionCookie(res, sessionToken);

      return res.status(200).json({
        success: true,
        linked: true,
        merged,
        returnPage,
        user: {
          memberId: linkedMember.id,
          name: linkedMember.display_name,
          lineUid: linkedMember.line_uid,
          telegramUid: linkedMember.telegram_uid || null,
          picture: linkedMember.picture_url || '',
          role: linkedMember.role,
          isAdmin: linkedMember.role === 'admin',
          authProvider: session.authProvider || 'line',
          lineOaFriend: linkedMember.line_oa_friend === true,
          lineOaCheckedAt: linkedMember.line_oa_checked_at || null
        }
      });
    }

    // =====================================================
    // 5. Prepare member data
    // Preserve an existing Admin role. A login through another provider
    // must never downgrade a member who is already an administrator.
    // =====================================================
    let effectiveRole = role;

    const existingRoleResponse = await fetch(
      supabaseUrl +
        '/rest/v1/members?line_uid=eq.' +
        encodeURIComponent(profile.userId) +
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
      line_uid:
        profile.userId,

      display_name:
        profile.displayName ||
        'LINE Member',

      picture_url:
        profile.pictureUrl ||
        null,

      role:
        effectiveRole,

      last_login_at:
        now,

      line_oa_checked_at:
        now
    };

    // Only overwrite friendship status when
    // LINE actually returned a valid result.
    //
    // If friendship check failed, preserve
    // existing database value.
    if (lineOaFriend !== null) {
      memberData.line_oa_friend =
        lineOaFriend;
    }

    if (countryCode) {
      memberData.country_code = countryCode;
    }

    // =====================================================
    // 6. Upsert member in Supabase
    //
    // line_uid = unique key
    // Existing member -> update
    // New member      -> insert
    // =====================================================
    const memberResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/members?on_conflict=line_uid',
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
        'Supabase member upsert failed:',
        memberResult
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to save member information'
      });
    }

    const savedMember =
      Array.isArray(memberResult) &&
      memberResult.length > 0
        ? memberResult[0]
        : null;

    if (!savedMember) {
      console.error(
        'Supabase returned no member after upsert'
      );

      return res.status(500).json({
        success: false,
        message:
          'Member record was not returned'
      });
    }

    // =====================================================
    // 7. Create secure website session
    // =====================================================
    const sessionToken =
      createSessionToken({
        memberId:
          savedMember.id,

        lineUid:
          savedMember.line_uid,

        telegramUid:
          savedMember.telegram_uid ||
          null,

        authProvider:
          'line',

        role:
          savedMember.role
      });

    setSessionCookie(
      res,
      sessionToken
    );

    // =====================================================
    // 8. Return member data to React
    // =====================================================
    return res.status(200).json({
      success: true,
      returnPage,

      user: {
        memberId:
          savedMember.id,

        name:
          savedMember.display_name,

        lineUid:
          savedMember.line_uid,

        telegramUid:
          savedMember.telegram_uid ||
          null,

        picture:
          savedMember.picture_url ||
          '',

        role:
          savedMember.role,

        isAdmin:
          savedMember.role ===
          'admin',

        authProvider:
          'line',

        lineOaFriend:
          savedMember.line_oa_friend ===
          true,

        lineOaCheckedAt:
          savedMember.line_oa_checked_at ||
          null
      }
    });
  } catch (error) {
    console.error(
      'LINE login server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'LINE login server error'
    });
  }
}