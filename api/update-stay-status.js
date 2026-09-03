import {
  requireAdmin
} from '../lib/_auth.js';

const ACCOMMODATION_OPTIONS = [
  'กุฏิยอดคำ ห้อง 2',
  'กุฏิสกุลคุณสวัสดิ์ 1 ห้อง 1',
  'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 1',
  'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 2',
  'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 1',
  'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 2'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const {
    bookingId,
    action,
    accommodationName,
    note
  } = req.body || {};

  if (!bookingId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required information'
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

  // ตรวจ Admin จาก signed HttpOnly session cookie
  const session =
    requireAdmin(req, res);

  if (!session) {
    return;
  }

  const admin = {
    id: session.memberId,
    line_uid: session.lineUid,
    role: session.role
  };

  /*
    IMPORTANT:
    assign_accommodation = การ "วางแผน/กำหนดห้อง"
    ไม่ใช่การยืนยันว่าเข้าห้องแล้ว

    ดังนั้น action นี้จะไม่เปลี่ยน status.
    การเปลี่ยน checked_in -> accommodated เกิดจาก:
    1) ผู้เข้าพักสแกน QR ของห้องที่ Admin กำหนดไว้
    2) Admin กด confirm_accommodation แบบ manual
  */

  const allowedActions = {
    approve: {
      from: ['pending'],
      to: 'approved'
    },

    check_in: {
      from: ['approved'],
      to: 'checked_in'
    },

    confirm_accommodation: {
      from: ['checked_in'],
      to: 'accommodated'
    },

    start_retreat: {
      from: ['accommodated'],
      to: 'in_retreat'
    },

    check_out: {
      from: [
        'in_retreat',
        'accommodated',
        'checked_in'
      ],
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

  try {
    // ----------------------------------------------------
    // 1. Load current booking
    // ----------------------------------------------------
    const bookingResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/bookings?id=eq.' +
          encodeURIComponent(
            bookingId
          ) +
          '&select=*',
        {
          method: 'GET',
          headers: {
            apikey:
              supabaseSecretKey,
            Authorization:
              'Bearer ' +
              supabaseSecretKey
          },
          cache: 'no-store'
        }
      );

    const bookings =
      await bookingResponse.json();

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

    const booking =
      bookings[0];

    const now =
      new Date().toISOString();

    // ----------------------------------------------------
    // 2. PLAN / CHANGE ACCOMMODATION
    //    ไม่เปลี่ยน Journey status
    // ----------------------------------------------------
    if (
      action ===
      'assign_accommodation'
    ) {
      if (
        ![
          'pending',
          'approved',
          'checked_in'
        ].includes(
          booking.status
        )
      ) {
        return res.status(409).json({
          success: false,
          code:
            'ACCOMMODATION_ASSIGNMENT_NOT_ALLOWED',
          message:
            'Accommodation can only be planned before accommodation confirmation',
          currentStatus:
            booking.status
        });
      }

      const cleanName =
        String(
          accommodationName || ''
        ).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            'Accommodation name is required'
        });
      }

      if (
        !ACCOMMODATION_OPTIONS.includes(
          cleanName
        )
      ) {
        return res.status(400).json({
          success: false,
          code:
            'INVALID_ACCOMMODATION',
          message:
            'Invalid accommodation selection'
        });
      }

      const planningUpdate = {
        accommodation_name:
          cleanName,
        updated_at:
          now
      };

      if (
        note &&
        note.trim()
      ) {
        planningUpdate.admin_note =
          note.trim();
      }

      const planningResponse =
        await fetch(
          supabaseUrl +
            '/rest/v1/bookings?id=eq.' +
            encodeURIComponent(
              bookingId
            ),
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
            body:
              JSON.stringify(
                planningUpdate
              )
          }
        );

      const plannedBookings =
        await planningResponse.json();

      if (
        !planningResponse.ok ||
        !Array.isArray(
          plannedBookings
        ) ||
        plannedBookings.length === 0
      ) {
        console.error(
          'Accommodation assignment failed:',
          plannedBookings
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to assign accommodation'
        });
      }

      return res.status(200).json({
        success: true,
        action:
          'assign_accommodation',
        booking:
          plannedBookings[0],
        transition: {
          from:
            booking.status,
          to:
            booking.status,
          method:
            'admin',
          statusChanged:
            false
        }
      });
    }

    // ----------------------------------------------------
    // 3. Validate status-changing action
    // ----------------------------------------------------
    const transition =
      allowedActions[action];

    if (!transition) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid stay action'
      });
    }

    if (
      !transition.from.includes(
        booking.status
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          'This action is not allowed from the current stay status',
        currentStatus:
          booking.status
      });
    }

    // ก่อนยืนยันเข้าที่พัก ต้องมีห้องที่ Admin จัดไว้แล้ว
    if (
      action ===
        'confirm_accommodation' &&
      !booking.accommodation_name
    ) {
      return res.status(409).json({
        success: false,
        code:
          'ACCOMMODATION_NOT_ASSIGNED',
        message:
          'Accommodation must be assigned before confirming accommodation'
      });
    }

    // ----------------------------------------------------
    // 4. Build status update
    // ----------------------------------------------------
    const updateData = {
      status:
        transition.to,
      updated_at:
        now
    };

    // APPROVE
    if (action === 'approve') {
      updateData.approved_at =
        now;
      updateData.approved_by =
        admin.id;
    }

    // ADMIN CHECK-IN
    if (action === 'check_in') {
      updateData.checked_in_at =
        now;
      updateData.checkin_method =
        'admin';
      updateData.checked_in_by =
        admin.id;
    }

    // ADMIN MANUAL ACCOMMODATION CONFIRMATION
    if (
      action ===
      'confirm_accommodation'
    ) {
      updateData.accommodated_at =
        now;
      updateData.accommodated_by =
        admin.id;
    }

    // START RETREAT
    if (
      action ===
      'start_retreat'
    ) {
      updateData.retreat_started_at =
        now;
      updateData.retreat_started_by =
        admin.id;
    }

    // ADMIN CHECK-OUT
    if (
      action ===
      'check_out'
    ) {
      updateData.checked_out_at =
        now;
      updateData.checkout_method =
        'admin';
      updateData.checked_out_by =
        admin.id;
    }

    // COMPLETE STAY
    if (
      action ===
      'complete'
    ) {
      updateData.completed_at =
        now;
      updateData.completed_by =
        admin.id;
    }

    // REJECT BOOKING
    if (
      action ===
      'reject'
    ) {
      updateData.rejected_at =
        now;
      updateData.rejected_by =
        admin.id;
    }

    // CANCEL STAY
    if (
      action ===
      'cancel'
    ) {
      updateData.cancelled_at =
        now;
      updateData.cancelled_by =
        admin.id;
    }

    // OPTIONAL ADMIN NOTE
    if (
      note &&
      note.trim()
    ) {
      updateData.admin_note =
        note.trim();
    }

    // ----------------------------------------------------
    // 5. Update booking
    //    มี status guard ป้องกัน double processing
    // ----------------------------------------------------
    const updateResponse =
      await fetch(
        supabaseUrl +
          '/rest/v1/bookings?id=eq.' +
          encodeURIComponent(
            bookingId
          ) +
          '&status=eq.' +
          encodeURIComponent(
            booking.status
          ),
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
          body:
            JSON.stringify(
              updateData
            )
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
      console.error(
        'Booking status update failed:',
        updatedBookings
      );

      return res.status(409).json({
        success: false,
        message:
          'Unable to update stay status. The booking may have already changed.'
      });
    }

    const updatedBooking =
      updatedBookings[0];

    // ----------------------------------------------------
    // 6. Save stay status history
    // ----------------------------------------------------
    const historyData = {
      booking_id:
        booking.id,
      from_status:
        booking.status,
      to_status:
        transition.to,
      trigger_method:
        'admin',
      triggered_by_member_id:
        admin.id,
      note:
        note && note.trim()
          ? note.trim()
          : null
    };

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
          body:
            JSON.stringify(
              historyData
            )
        }
      );

    if (
      !historyResponse.ok
    ) {
      const historyError =
        await historyResponse.text();

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

    // ----------------------------------------------------
    // 7. Success
    // ----------------------------------------------------
    return res.status(200).json({
      success: true,
      booking:
        updatedBooking,
      transition: {
        from:
          booking.status,
        to:
          transition.to,
        method:
          'admin',
        statusChanged:
          true
      }
    });
  } catch (error) {
    console.error(
      'Update stay status server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Stay status server error'
    });
  }
}
