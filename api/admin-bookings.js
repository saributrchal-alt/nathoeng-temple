import {
  requireAdmin
} from '../lib/_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const session = requireAdmin(req, res);

  if (!session) {
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error(
      'Missing Supabase environment variables'
    );

    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  try {
    const bookingResponse = await fetch(
      supabaseUrl +
        '/rest/v1/bookings' +
        '?select=*' +
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

    const responseText =
      await bookingResponse.text();

    let bookings = [];

    try {
      bookings = responseText
        ? JSON.parse(responseText)
        : [];
    } catch (error) {
      console.error(
        'Unable to parse bookings response:',
        responseText
      );

      return res.status(500).json({
        success: false,
        message: 'Invalid database response'
      });
    }

    if (!bookingResponse.ok) {
      console.error(
        'Supabase admin bookings fetch failed:',
        bookings
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to load bookings',
        databaseError: bookings
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
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
      'Admin bookings server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Admin bookings server error'
    });
  }
}