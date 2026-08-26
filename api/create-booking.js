export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    lineUid,
    name,
    phone,
    startDate,
    endDate,
    purpose
  } = req.body || {};

  if (
    !lineUid ||
    !name ||
    !phone ||
    !startDate ||
    !endDate
  ) {
    return res.status(400).json({
      success: false,
      message: 'Missing required booking information'
    });
  }

  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Booking database configuration is missing'
    });
  }

  try {
    // 1. หา member จาก LINE UID
    const memberResponse = await fetch(
      supabaseUrl +
        '/rest/v1/members?line_uid=eq.' +
        encodeURIComponent(lineUid) +
        '&select=id,line_uid,display_name,role',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey
        }
      }
    );

    const members = await memberResponse.json();

    if (
      !memberResponse.ok ||
      !Array.isArray(members) ||
      members.length === 0
    ) {
      return res.status(401).json({
        success: false,
        message: 'Member not found. Please login with LINE again.'
      });
    }

    const member = members[0];

    // 2. บันทึก Booking
    const bookingData = {
      member_id: member.id,
      line_uid: member.line_uid,
      name: name.trim(),
      phone: phone.trim(),
      start_date: startDate,
      end_date: endDate,
      purpose: purpose ? purpose.trim() : null,
      status: 'pending'
    };

    const bookingResponse = await fetch(
      supabaseUrl + '/rest/v1/bookings',
      {
        method: 'POST',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(bookingData)
      }
    );

    const bookingResult = await bookingResponse.json();

    if (!bookingResponse.ok) {
      console.error(
        'Supabase booking insert failed:',
        bookingResult
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to save booking'
      });
    }

    const booking =
      Array.isArray(bookingResult) &&
      bookingResult.length > 0
        ? bookingResult[0]
        : null;

    if (!booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking was not returned'
      });
    }

    return res.status(200).json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error(
      'Create booking server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Booking server error'
    });
  }
}