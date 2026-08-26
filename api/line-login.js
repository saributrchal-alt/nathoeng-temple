export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    code,
    redirectUri
  } = req.body || {};

  if (!code || !redirectUri) {
    return res.status(400).json({
      success: false,
      message: 'Missing LINE authorization code'
    });
  }

  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const adminLineUid = process.env.ADMIN_LINE_UID;

  if (!channelId || !channelSecret) {
    console.error('LINE environment variables are missing');

    return res.status(500).json({
      success: false,
      message: 'LINE login configuration is missing'
    });
  }

  try {
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
      redirectUri
    );

    tokenBody.append(
      'client_id',
      channelId
    );

    tokenBody.append(
      'client_secret',
      channelSecret
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

    const profileResponse = await fetch(
      'https://api.line.me/v2/profile',
      {
        method: 'GET',
        headers: {
          Authorization:
            'Bearer ' +
            tokenData.access_token
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

    const isAdmin =
      Boolean(adminLineUid) &&
      profile.userId === adminLineUid;

    return res.status(200).json({
      success: true,
      user: {
        name:
          profile.displayName ||
          'LINE Member',
        lineUid: profile.userId,
        picture:
          profile.pictureUrl || '',
        isAdmin: isAdmin
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