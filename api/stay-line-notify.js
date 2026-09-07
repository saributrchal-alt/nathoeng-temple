import {
  requireAdmin
} from '../lib/_auth.js';

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

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
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
      '&select=id,full_name,display_name,line_uid,line_oa_friend' +
      '&limit=1',
    {
      method: 'GET',
      headers: supabaseHeaders(secretKey),
      cache: 'no-store'
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

async function saveCommunication({
  supabaseUrl,
  secretKey,
  memberId,
  adminMemberId,
  messageText,
  status,
  errorMessage = null,
  sentAt = null
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/member_communications`,
    {
      method: 'POST',
      headers: supabaseHeaders(
        secretKey,
        {
          Prefer: 'return=representation'
        }
      ),
      body: JSON.stringify({
        member_id: memberId,
        channel: 'line',
        direction: 'outbound',
        message_text: messageText,
        status,
        sent_at: sentAt,
        sent_by_member_id: adminMemberId || null,
        error_message: errorMessage
      })
    }
  );

  const data = await readJson(response);

  if (!response.ok) {
    console.error(
      'Unable to save member communication:',
      data
    );
  }

  return data;
}

async function sendLinePush({
  lineMessagingAccessToken,
  recipientLineUid,
  messageText
}) {
  return fetch(
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
            text: messageText
          }
        ]
      })
    }
  );
}

async function sendTelegramMessage({
  telegramBotToken,
  telegramUid,
  messageText
}) {
  return fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body: JSON.stringify({
        chat_id: telegramUid,
        text: messageText
      })
    }
  );
}

export default async function handler(req, res) {
  const session = requireAdmin(req, res);

  if (!session) {
    return;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  const lineMessagingAccessToken =
    process.env.LINE_MESSAGING_ACCESS_TOKEN;

  const telegramBotToken =
    process.env.TELEGRAM_BOT_TOKEN;

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  if (req.method === 'GET') {
    const memberId =
      String(
        req.query?.memberId || ''
      ).trim();

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/member_communications` +
          `?member_id=eq.${encodeURIComponent(memberId)}` +
          '&select=*' +
          '&order=created_at.desc' +
          '&limit=200',
        {
          method: 'GET',
          headers:
            supabaseHeaders(
              supabaseSecretKey
            ),
          cache: 'no-store'
        }
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        console.error(
          'Member communication history failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to load communication history'
        });
      }

      return res.status(200).json({
        success: true,
        communications:
          Array.isArray(data)
            ? data
            : []
      });
    } catch (error) {
      console.error(
        'Member communication history error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to load communication history'
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    action,
    channel,
    memberId,
    bookingId,
    event,
    messageText
  } = req.body || {};

  const cleanAction =
    String(action || '').trim();

  const cleanChannel =
    String(channel || 'line')
      .trim()
      .toLowerCase();

  const cleanMemberId =
    String(memberId || '').trim();

  const cleanBookingId =
    String(bookingId || '').trim();

  const cleanEvent =
    String(event || '').trim();

  const cleanMessage =
    String(messageText || '').trim();

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

  try {
    // =====================================================
    // New Phase 4B route:
    // Admin -> Member Detail -> Communication -> LINE
    // =====================================================
    if (cleanAction === 'member_message') {
      if (!cleanMemberId) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      if (!['line', 'telegram'].includes(cleanChannel)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported communication channel'
        });
      }

      const memberResponse = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(cleanMemberId)}` +
          '&select=id,full_name,display_name,line_uid,line_oa_friend,telegram_uid,telegram_username' +
          '&limit=1',
        {
          method: 'GET',
          headers: supabaseHeaders(supabaseSecretKey),
          cache: 'no-store'
        }
      );

      const memberRows =
        await readJson(memberResponse);

      if (
        !memberResponse.ok ||
        !Array.isArray(memberRows) ||
        memberRows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      const member = memberRows[0];

      if (cleanChannel === 'line') {
        if (!lineMessagingAccessToken) {
          return res.status(500).json({
            success: false,
            message:
              'LINE Messaging API configuration is missing'
          });
        }

        const recipientLineUid =
          String(
            member.line_uid || ''
          ).trim();

        if (!recipientLineUid) {
          await saveCommunication({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              cleanMemberId,
            adminMemberId:
              session.memberId,
            messageText:
              cleanMessage,
            status:
              'failed',
            errorMessage:
              'LINE account was not found for this member'
          });

          return res.status(400).json({
            success: false,
            message:
              'LINE account was not found for this member'
          });
        }

        if (
          member.line_oa_friend === false
        ) {
          await saveCommunication({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              cleanMemberId,
            adminMemberId:
              session.memberId,
            messageText:
              cleanMessage,
            status:
              'failed',
            errorMessage:
              'The member has not added or is no longer connected to the LINE Official Account'
          });

          return res.status(400).json({
            success: false,
            message:
              'The member has not added or is no longer connected to the LINE Official Account'
          });
        }

        const lineResponse =
          await sendLinePush({
            lineMessagingAccessToken,
            recipientLineUid,
            messageText:
              cleanMessage
          });

        if (!lineResponse.ok) {
          const lineError =
            await lineResponse.text();

          console.error(
            'Member LINE message failed:',
            lineResponse.status,
            lineError
          );

          await saveCommunication({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              cleanMemberId,
            adminMemberId:
              session.memberId,
            messageText:
              cleanMessage,
            status:
              'failed',
            errorMessage:
              lineError ||
              'Unable to send LINE OA message'
          });

          return res.status(502).json({
            success: false,
            message:
              'Unable to send LINE OA message'
          });
        }
      }

      if (cleanChannel === 'telegram') {
        if (!telegramBotToken) {
          return res.status(500).json({
            success: false,
            message:
              'Telegram Bot configuration is missing'
          });
        }

        const telegramUid =
          String(
            member.telegram_uid || ''
          ).trim();

        if (!telegramUid) {
          await saveCommunication({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              cleanMemberId,
            adminMemberId:
              session.memberId,
            messageText:
              cleanMessage,
            status:
              'failed',
            errorMessage:
              'Telegram account was not found for this member'
          });

          return res.status(400).json({
            success: false,
            message:
              'Telegram account was not found for this member'
          });
        }

        const telegramResponse =
          await sendTelegramMessage({
            telegramBotToken,
            telegramUid,
            messageText:
              cleanMessage
          });

        const telegramData =
          await readJson(telegramResponse);

        if (!telegramResponse.ok || telegramData?.ok === false) {
          const telegramError =
            telegramData?.description ||
            'Unable to send Telegram message';

          console.error(
            'Member Telegram message failed:',
            telegramResponse.status,
            telegramData
          );

          await saveCommunication({
            supabaseUrl,
            secretKey:
              supabaseSecretKey,
            memberId:
              cleanMemberId,
            adminMemberId:
              session.memberId,
            messageText:
              cleanMessage,
            status:
              'failed',
            errorMessage:
              telegramError
          });

          return res.status(502).json({
            success: false,
            message:
              telegramError
          });
        }
      }

      const sentAt =
        new Date().toISOString();

      // Save successful delivery in the same timeline.
      const communicationResponse = await fetch(
        `${supabaseUrl}/rest/v1/member_communications`,
        {
          method: 'POST',
          headers: supabaseHeaders(
            supabaseSecretKey,
            {
              Prefer: 'return=representation'
            }
          ),
          body: JSON.stringify({
            member_id: cleanMemberId,
            channel: cleanChannel,
            direction: 'outbound',
            message_text: cleanMessage,
            status: 'success',
            sent_at: sentAt,
            sent_by_member_id:
              session.memberId || null,
            error_message: null
          })
        }
      );

      const communicationData =
        await readJson(communicationResponse);

      if (!communicationResponse.ok) {
        console.error(
          'Unable to save successful member communication:',
          communicationData
        );
      }

      return res.status(200).json({
        success: true,
        channel:
          cleanChannel,
        message:
          cleanChannel === 'telegram'
            ? 'Telegram member message sent'
            : 'LINE OA member message sent',
        recipientName:
          member.full_name ||
          member.display_name ||
          member.telegram_username ||
          ''
      });
    }

    // =====================================================
    // Existing stay notification flow.
    // Kept compatible with the current booking screens.
    // =====================================================
    if (!lineMessagingAccessToken) {
      return res.status(500).json({
        success: false,
        message:
          'LINE Messaging API configuration is missing'
      });
    }

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
        message:
          'Unsupported LINE notification event'
      });
    }

    const bookingResponse = await fetch(
      `${supabaseUrl}/rest/v1/bookings` +
        `?id=eq.${encodeURIComponent(cleanBookingId)}` +
        '&select=*' +
        '&limit=1',
      {
        method: 'GET',
        headers:
          supabaseHeaders(
            supabaseSecretKey
          ),
        cache: 'no-store'
      }
    );

    const bookingData =
      await readJson(
        bookingResponse
      );

    if (
      !bookingResponse.ok ||
      !Array.isArray(
        bookingData
      ) ||
      bookingData.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking =
      bookingData[0];

    const expectedStatus =
      cleanEvent === 'approved'
        ? 'approved'
        : 'checked_out';

    if (
      booking.status !==
      expectedStatus
    ) {
      return res.status(409).json({
        success: false,
        message:
          cleanEvent === 'approved'
            ? 'Approval LINE notice can only be sent while the stay is approved'
            : 'Completion blessing can only be sent before the stay is completed',
        currentStatus:
          booking.status
      });
    }

    let recipientLineUid =
      String(
        booking.line_uid || ''
      ).trim();

    let recipientName =
      String(
        booking.name || ''
      ).trim();

    if (booking.member_id) {
      const member =
        await loadMember({
          supabaseUrl,
          secretKey:
            supabaseSecretKey,
          memberId:
            booking.member_id
        });

      if (member) {
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

        if (
          member.line_oa_friend ===
          false
        ) {
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

    const lineResponse =
      await sendLinePush({
        lineMessagingAccessToken,
        recipientLineUid,
        messageText:
          cleanMessage
      });

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
        cleanEvent === 'approved'
          ? 'LINE OA approval notice sent'
          : 'LINE OA completion blessing sent',
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
