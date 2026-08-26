import {
  createSessionToken,
  setSessionCookie
} from './_auth.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { code, redirectUri } = req.body || {};

  if (!code || !redirectUri) {
    return res.status(400).json({
      success: false,
      message: 'Missing LINE authorization code'
    });
  }

  const lineChannelId = process.env.LINE_CHANNEL_ID;
  const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
  const adminLineUid = process.env.ADMIN_LINE_UID;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

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
    // 1. แลก authorization code จาก LINE เป็น access token
    const tokenBody = new URLSearchParams();

    tokenBody.append('grant_type', 'authorization_code');
    tokenBody.append('code', code);
    tokenBody.append('redirect_uri', redirectUri);
    tokenBody.append('client_id', lineChannelId);
    tokenBody.append('client_secret', lineChannelSecret);

    const tokenResponse = await fetch(
      'https://api.line.me/oauth2/v2.1/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenBody.toString()
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('LINE token exchange failed:', tokenData);

      return res.status(401).json({
        success: false,
        message: 'Unable to exchange LINE authorization code'
      });
    }

    // 2. ดึงข้อมูล Profile จริงจาก LINE
    const profileResponse = await fetch(
      'https://api.line.me/v2/profile',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + tokenData.access_token
        }
      }
    );

    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.userId) {
      console.error('LINE profile request failed:', profile);

      return res.status(401).json({
        success: false,
        message: 'Unable to retrieve LINE profile'
      });
    }

    // 3. ตรวจว่าเป็น Admin หรือสมาชิกทั่วไป
    const isAdmin =
      Boolean(adminLineUid) &&
      profile.userId === adminLineUid;

    const role = isAdmin ? 'admin' : 'member';

    // 4. เตรียมข้อมูล Member สำหรับ Supabase
    const memberData = {
      line_uid: profile.userId,
      display_name: profile.displayName || 'LINE Member',
      picture_url: profile.pictureUrl || null,
      role: role,
      last_login_at: new Date().toISOString()
    };

    // 5. Upsert Member
    // line_uid เป็น unique key
    // ถ้าเคยมีแล้ว = update
    // ถ้ายังไม่มี = insert ใหม่
    const memberResponse = await fetch(
      supabaseUrl + '/rest/v1/members?on_conflict=line_uid',
      {
        method: 'POST',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(memberData)
      }
    );

    const memberResult = await memberResponse.json();

    if (!memberResponse.ok) {
      console.error('Supabase member upsert failed:', memberResult);

      return res.status(500).json({
        success: false,
        message: 'Unable to save member information'
      });
    }

    const savedMember =
      Array.isArray(memberResult) && memberResult.length > 0
        ? memberResult[0]
        : null;

    if (!savedMember) {
      console.error('Supabase returned no member after upsert');

      return res.status(500).json({
        success: false,
        message: 'Member record was not returned'
      });
    }
const sessionToken = createSessionToken({
  memberId: savedMember.id,
  lineUid: savedMember.line_uid,
  role: savedMember.role
});

setSessionCookie(
  res,
  sessionToken
);
    // 6. ส่งข้อมูล Member กลับไปที่ React
    return res.status(200).json({
      success: true,
      user: {
        memberId: savedMember.id,
        name: savedMember.display_name,
        lineUid: savedMember.line_uid,
        picture: savedMember.picture_url || '',
        role: savedMember.role,
        isAdmin: savedMember.role === 'admin'
      }
    });
  } catch (error) {
    console.error('LINE login server error:', error);

    return res.status(500).json({
      success: false,
      message: 'LINE login server error'
    });
  }
}