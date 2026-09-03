import {
  requireAdmin
} from '../lib/_auth.js';

function supabaseHeaders(secretKey) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
}

async function readJson(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const session = requireAdmin(req, res);

  if (!session) {
    return;
  }

  const {
    bookingId,
    event,
    messageText
  } = req.body || {};

  const cleanBookingId =
    String(bookingId || '').trim();

  const cleanEvent =
    String(event || '').trim();

  const cleanMessage =
    String(messageText || '').trim();

  if (!cleanBookingId) {
    return res.status(400).json({
      success: false,
      message: 'Booking ID is required'
    });
  }

  if (
    ![
      'approved',
      'completed_blessing'
    ].includes(cleanEvent)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported LINE notification event'
    });
  }

  if (!cleanMessage) {
    return res.status(400).json({
      success: false,
      message: 'LINE message is required'
    });
  }

  if (cleanMessage.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'LINE message is too long'
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  const lineMessagingAccessToken =
    process.env.LINE_MESSAGING_ACCESS_TOKEN;

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  if (!lineMessagingAccessToken) {
    return res.status(500).json({
      success: false,
      message: 'LINE Messaging API configuration is missing'
    });
  }

  try {
    const bookingResponse = await fetch(
      `${supabaseUrl}/rest/v1/bookings` +
        `?id=eq.${encodeURIComponent(cleanBookingId)}` +
        '&select=*' +
        '&limit=1',
      {
        method: 'GET',
        headers:
          supabaseHeaders(supabaseSecretKey),
        cache: 'no-store'
      }
    );

    const bookingData =
      await readJson(bookingResponse);

    if (
      !bookingResponse.ok ||
      !Array.isArray(bookingData) ||
      bookingData.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingData[0];

    const expectedStatus =
      cleanEvent === 'approved'
        ? 'approved'
        : 'completed';

    if (
      booking.status !== expectedStatus
    ) {
      return res.status(409).json({
        success: false,
        message:
          cleanEvent === 'approved'
            ? 'Approval LINE notice can only be sent while the stay is approved'
            : 'Completion blessing can only be sent after the stay is completed',
        currentStatus:
          booking.status
      });
    }

    let recipientLineUid =
      String(booking.line_uid || '').trim();

    let recipientName =
      String(booking.name || '').trim();

    if (booking.member_id) {
      const memberResponse = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(booking.member_id)}` +
          '&select=id,full_name,display_name,line_uid,line_oa_friend' +
          '&limit=1',
        {
          method: 'GET',
          headers:
            supabaseHeaders(supabaseSecretKey),
          cache: 'no-store'
        }
      );

      const memberData =
        await readJson(memberResponse);

      if (
        memberResponse.ok &&
        Array.isArray(memberData) &&
        memberData.length > 0
      ) {
        const member = memberData[0];

        recipientLineUid =
          String(
            member.line_uid ||
            recipientLineUid
          ).trim();

        recipientName =
          String(
            member.full_name ||
            member.display_name ||
            recipientName
          ).trim();

        if (member.line_oa_friend === false) {
          return res.status(400).json({
            success: false,
            message:
              'The member has not added or is no longer connected to the LINE Official Account'
          });
        }
      }
    }

    if (!recipientLineUid) {
      return res.status(400).json({
        success: false,
        message:
          'LINE account was not found for this applicant'
      });
    }

    const lineResponse = await fetch(
      'https://api.line.me/v2/bot/message/push',
      {
        method: 'POST',
        headers: {
          Authorization:
            `Bearer ${lineMessagingAccessToken}`,
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          to: recipientLineUid,
          messages: [
            {
              type: 'text',
              text: cleanMessage
            }
          ]
        })
      }
    );

    if (!lineResponse.ok) {
      const lineError =
        await lineResponse.text();

      console.error(
        'Stay LINE notification failed:',
        lineResponse.status,
        lineError
      );

      return res.status(502).json({
        success: false,
        message:
          'Unable to send LINE OA message'
      });
    }

    return res.status(200).json({
      success: true,
      message:
        cleanEvent === 'approved' ? 'LINE OA approval notice sent' : 'LINE OA completion blessing sent',
      recipientName
    });
  } catch (error) {
    console.error(
      'Stay LINE notification error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to send LINE OA message'
    });
  }
}
