```javascript
import {
  requireAdmin
} from './_auth.js';

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
          Authorization: 'Bearer ' + supabaseSecretKey
        }
      }
    );

    const bookings = await bookingResponse.json();

    if (!bookingResponse.ok) {
      console.error(
        'Admin bookings fetch failed:',
        bookings
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to load bookings'
      });
    }

    return res.status(200).json({
      success: true,
      bookings: Array.isArray(bookings)
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
```
