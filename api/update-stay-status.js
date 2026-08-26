export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    bookingId,
    adminLineUid,
    action,
    accommodationName,
    note
  } = req.body || {};

  if (!bookingId || !adminLineUid || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required information'
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  const allowedActions = {
    approve: {
      from: ['pending'],
      to: 'approved'
    },
    check_in: {
      from: ['approved'],
      to: 'checked_in'
    },
    assign_accommodation: {
      from: ['checked_in'],
      to: 'accommodated'
    },
    start_retreat: {
      from: ['accommodated'],
      to: 'in_retreat'
    },
    check_out: {
      from: ['in_retreat', 'accommodated', 'checked_in'],
      to: 'checked_out'
    },
    complete: {
      from: ['checked_out'],
      to: 'completed'
    },
    reject: {
      from: ['pending'],
      to: 'rejected'
    },
    cancel: {
      from: [
        'pending',
        'approved',
        'checked_in',
        'accommodated',
        'in_retreat'
      ],
      to: 'cancelled'
    }
  };

  const transition = allowedActions[action];

  if (!transition) {
    return res.status(400).json({
      success: false,
      message: 'Invalid stay action'
    });
  }

  try {
    // 1. Verify Admin from members table
    const adminResponse = await fetch(
      supabaseUrl +
        '/rest/v1/members?line_uid=eq.' +
        encodeURIComponent(adminLineUid) +
        '&role=eq.admin&select=id,line_uid,role',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey
        }
      }
    );

    const admins = await adminResponse.json();

    if (
      !adminResponse.ok ||
      !Array.isArray(admins) ||
      admins.length === 0
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admin permission required'
      });
    }

    const admin = admins[0];

    // 2. Load current booking
    const bookingResponse = await fetch(
      supabaseUrl +
        '/rest/v1/bookings?id=eq.' +
        encodeURIComponent(bookingId) +
        '&select=*',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey
        }
      }
    );

    const bookings = await bookingResponse.json();

    if (
      !bookingResponse.ok ||
      !Array.isArray(bookings) ||
      bookings.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (!transition.from.includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message:
          'This action is not allowed from the current stay status',
        currentStatus: booking.status
      });
    }

    // 3. Build booking update
    const now = new Date().toISOString();

    const updateData = {
      status: transition.to,
      updated_at: now
    };

    if (action === 'approve') {
      updateData.approved_at = now;
      updateData.approved_by = admin.id;
    }

    if (action === 'check_in') {
      updateData.checked_in_at = now;
      updateData.checkin_method = 'admin';
      updateData.checked_in_by = admin.id;
    }

    if (action === 'assign_accommodation') {
      if (!accommodationName || !accommodationName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Accommodation name is required'
        });
      }

      updateData.accommodation_name = accommodationName.trim();
      updateData.accommodated_at = now;
      updateData.accommodated_by = admin.id;
    }

    if (action === 'start_retreat') {
      updateData.retreat_started_at = now;
      updateData.retreat_started_by = admin.id;
    }

    if (action === 'check_out') {
      updateData.checked_out_at = now;
      updateData.checkout_method = 'admin';
      updateData.checked_out_by = admin.id;
    }

    if (action === 'complete') {
      updateData.completed_at = now;
      updateData.completed_by = admin.id;
    }

    if (action === 'reject') {
      updateData.rejected_at = now;
      updateData.rejected_by = admin.id;
    }

    if (action === 'cancel') {
      updateData.cancelled_at = now;
      updateData.cancelled_by = admin.id;
    }

    if (note && note.trim()) {
      updateData.admin_note = note.trim();
    }

    // 4. Update booking
    const updateResponse = await fetch(
      supabaseUrl +
        '/rest/v1/bookings?id=eq.' +
        encodeURIComponent(bookingId),
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    );

    const updatedBookings = await updateResponse.json();

    if (
      !updateResponse.ok ||
      !Array.isArray(updatedBookings) ||
      updatedBookings.length === 0
    ) {
      console.error(
        'Booking status update failed:',
        updatedBookings
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to update stay status'
      });
    }

    const updatedBooking = updatedBookings[0];

    // 5. Save status history
    const historyData = {
      booking_id: booking.id,
      from_status: booking.status,
      to_status: transition.to,
      trigger_method: 'admin',
      triggered_by_member_id: admin.id,
      note: note && note.trim() ? note.trim() : null
    };

    const historyResponse = await fetch(
      supabaseUrl + '/rest/v1/stay_status_history',
      {
        method: 'POST',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(historyData)
      }
    );

    if (!historyResponse.ok) {
      const historyError = await historyResponse.text();

      console.error(
        'Stay status history insert failed:',
        historyError
      );

      return res.status(500).json({
        success: false,
        message:
          'Stay status changed but history could not be saved'
      });
    }

    return res.status(200).json({
      success: true,
      booking: updatedBooking,
      transition: {
        from: booking.status,
        to: transition.to,
        method: 'admin'
      }
    });
  } catch (error) {
    console.error(
      'Update stay status server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Stay status server error'
    });
  }
}