import {
  getSessionFromRequest
} from '../lib/_auth.js';

function getBangkokDate() {
  const parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  ).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === 'year'
  )?.value;

  const month = parts.find(
    (part) => part.type === 'month'
  )?.value;

  const day = parts.find(
    (part) => part.type === 'day'
  )?.value;

  return `${year}-${month}-${day}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const session =
    getSessionFromRequest(req);

  if (!session || !session.memberId) {
    return res.status(401).json({
      success: false,
      code: 'LOGIN_REQUIRED',
      message: 'LINE login required'
    });
  }

  const {
    token
  } = req.body || {};

  const expectedToken =
    process.env.CHECKIN_QR_TOKEN;

  if (!expectedToken) {
    console.error(
      'CHECKIN_QR_TOKEN is missing'
    );

    return res.status(500).json({
      success: false,
      message:
        'QR check-in configuration is missing'
    });
  }

  if (!token || token !== expectedToken) {
    return res.status(403).json({
      success: false,
      code: 'INVALID_QR',
      message:
        'Invalid check-in QR code'
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return res.status(500).json({
      success: false,
      message:
        'Database configuration is missing'
    });
  }

  try {
    const today = getBangkokDate();

    // ---------------------------------------------
    // 1. หา Booking ของสมาชิกที่ได้รับอนุมัติแล้ว
    // และวันเริ่มเข้าพักตรงกับวันนี้
    // ---------------------------------------------
    const bookingResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/bookings' +
          '?member_id=eq.' +
          encodeURIComponent(
            session.memberId
          ) +
          '&status=eq.approved' +
          '&start_date=eq.' +
          encodeURIComponent(today) +
          '&select=*' +
          '&order=created_at.desc',
        {
          method: 'GET',
          headers: {
            apikey:
              supabaseSecretKey,
            Authorization:
              'Bearer ' +
              supabaseSecretKey,
            Accept:
              'application/json'
          }
        }
      );

    const bookings =
      await bookingResponse.json();

    if (!bookingResponse.ok) {
      console.error(
        'QR booking lookup failed:',
        bookings
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to verify booking'
      });
    }

    if (
      !Array.isArray(bookings) ||
      bookings.length === 0
    ) {
      return res.status(404).json({
        success: false,
        code: 'NO_ELIGIBLE_BOOKING',
        today: today,
        message:
          'No approved booking is available for check-in today'
      });
    }

    if (bookings.length > 1) {
      return res.status(409).json({
        success: false,
        code: 'MULTIPLE_BOOKINGS',
        message:
          'Multiple eligible bookings were found. Please contact monastery staff.'
      });
    }

    const booking = bookings[0];

    const now =
      new Date().toISOString();

    // ---------------------------------------------
    // 2. เปลี่ยน approved -> checked_in
    // เช็ก status ซ้ำตอน PATCH ป้องกันกดซ้ำ
    // ---------------------------------------------
    const updateResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/bookings' +
          '?id=eq.' +
          encodeURIComponent(
            booking.id
          ) +
          '&status=eq.approved',
        {
          method: 'PATCH',
          headers: {
            apikey:
              supabaseSecretKey,
            Authorization:
              'Bearer ' +
              supabaseSecretKey,
            'Content-Type':
              'application/json',
            Prefer:
              'return=representation'
          },
          body: JSON.stringify({
            status: 'checked_in',
            checked_in_at: now,
            checkin_method: 'qr',
            checked_in_by:
              session.memberId,
            updated_at: now
          })
        }
      );

    const updatedBookings =
      await updateResponse.json();

    if (
      !updateResponse.ok ||
      !Array.isArray(
        updatedBookings
      ) ||
      updatedBookings.length === 0
    ) {
      return res.status(409).json({
        success: false,
        code:
          'CHECKIN_ALREADY_PROCESSED',
        message:
          'This booking can no longer be checked in'
      });
    }

    const updatedBooking =
      updatedBookings[0];

    // ---------------------------------------------
    // 3. บันทึก Stay Journey History
    // ---------------------------------------------
    const historyResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/stay_status_history',
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
              'return=minimal'
          },
          body: JSON.stringify({
            booking_id:
              booking.id,
            from_status:
              'approved',
            to_status:
              'checked_in',
            trigger_method:
              'qr',
            triggered_by_member_id:
              session.memberId,
            note:
              'QR check-in at monastery registration point'
          })
        }
      );

    if (!historyResponse.ok) {
      const historyError =
        await historyResponse.text();

      console.error(
        'QR check-in history failed:',
        historyError
      );
    }

    // ---------------------------------------------
    // 4. Success
    // ---------------------------------------------
    return res.status(200).json({
      success: true,
      message:
        'Check-in completed',
      booking: {
        id:
          updatedBooking.id,
        name:
          updatedBooking.name,
        startDate:
          updatedBooking.start_date,
        endDate:
          updatedBooking.end_date,
        status:
          updatedBooking.status,
        checkedInAt:
          updatedBooking.checked_in_at,
        checkinMethod:
          updatedBooking.checkin_method
      }
    });
  } catch (error) {
    console.error(
      'QR check-in server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'QR check-in server error'
    });
  }
}