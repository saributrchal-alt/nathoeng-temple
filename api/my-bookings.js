import {
  getSessionFromRequest
} from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // 1. อ่าน Secure Session
  const session = getSessionFromRequest(req);

  if (!session || !session.memberId) {
    return res.status(401).json({
      success: false,
      message: 'Login required'
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('Missing Supabase environment variables');

    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  try {
    // 2. ดึงเฉพาะ Booking ของ Member ที่ Login อยู่
    const bookingResponse = await fetch(
      supabaseUrl +
        '/rest/v1/bookings' +
        '?member_id=eq.' +
        encodeURIComponent(session.memberId) +
        '&select=*' +
        '&order=created_at.desc',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          Accept: 'application/json'
        }
      }
    );

    const bookingText = await bookingResponse.text();

    let bookings = [];

    try {
      bookings = bookingText
        ? JSON.parse(bookingText)
        : [];
    } catch (error) {
      console.error(
        'Unable to parse member bookings:',
        bookingText
      );

      return res.status(500).json({
        success: false,
        message: 'Invalid database response'
      });
    }

    if (!bookingResponse.ok) {
      console.error(
        'My bookings fetch failed:',
        bookings
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to load stay bookings'
      });
    }

    // 3. ส่งข้อมูลกลับหน้า My Stay
    return res.status(200).json({
      success: true,

      member: {
        memberId: session.memberId,
        role: session.role
      },

      bookings:
        Array.isArray(bookings)
          ? bookings
          : []
    });
  } catch (error) {
    console.error(
      'My bookings server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'My bookings server error'
    });
  }
}