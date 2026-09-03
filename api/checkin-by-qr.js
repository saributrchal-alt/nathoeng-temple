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

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getAssignedAccommodation(
  booking
) {
  /*
    รองรับชื่อ field หลายแบบไว้ก่อน
    เพื่อไม่บังคับให้ฐานข้อมูลต้องเปลี่ยนทันที

    ถ้าในระบบ Admin ใช้ชื่อ field ใด field หนึ่ง
    ด้านล่าง ระบบจะอ่านได้ทันที
  */
  return (
    booking.assigned_accommodation ||
    booking.accommodation ||
    booking.accommodation_name ||
    booking.assigned_room ||
    booking.room_name ||
    ''
  );
}

function getQrPointByToken(token) {
  const registrationToken =
    process.env.REGISTRATION_QR_TOKEN ||
    process.env.CHECKIN_QR_TOKEN;

  const returnToken =
    process.env.RETURN_KEY_QR_TOKEN;

  const accommodationPoints = [
    {
      envName:
        'ACCOM_YODKHAM_ROOM2_TOKEN',
      token:
        process.env
          .ACCOM_YODKHAM_ROOM2_TOKEN,
      code:
        'YODKHAM_ROOM2',
      name:
        'กุฏิยอดคำ ห้อง 2'
    },
    {
      envName:
        'ACCOM_SAKUNKHUNSAWAT1_ROOM1_TOKEN',
      token:
        process.env
          .ACCOM_SAKUNKHUNSAWAT1_ROOM1_TOKEN,
      code:
        'SAKUNKHUNSAWAT1_ROOM1',
      name:
        'กุฏิสกุลคุณสวัสดิ์ 1 ห้อง 1'
    },
    {
      envName:
        'ACCOM_SAKUNKHUNSAWAT2_ROOM1_TOKEN',
      token:
        process.env
          .ACCOM_SAKUNKHUNSAWAT2_ROOM1_TOKEN,
      code:
        'SAKUNKHUNSAWAT2_ROOM1',
      name:
        'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 1'
    },
    {
      envName:
        'ACCOM_SAKUNKHUNSAWAT2_ROOM2_TOKEN',
      token:
        process.env
          .ACCOM_SAKUNKHUNSAWAT2_ROOM2_TOKEN,
      code:
        'SAKUNKHUNSAWAT2_ROOM2',
      name:
        'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 2'
    },
    {
      envName:
        'ACCOM_SAKUNKHUNSAWAT3_ROOM1_TOKEN',
      token:
        process.env
          .ACCOM_SAKUNKHUNSAWAT3_ROOM1_TOKEN,
      code:
        'SAKUNKHUNSAWAT3_ROOM1',
      name:
        'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 1'
    },
    {
      envName:
        'ACCOM_SAKUNKHUNSAWAT3_ROOM2_TOKEN',
      token:
        process.env
          .ACCOM_SAKUNKHUNSAWAT3_ROOM2_TOKEN,
      code:
        'SAKUNKHUNSAWAT3_ROOM2',
      name:
        'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 2'
    }
  ];

  if (
    registrationToken &&
    token === registrationToken
  ) {
    return {
      type: 'registration',
      code: 'REGISTRATION',
      name: 'จุดลงทะเบียน'
    };
  }

  for (
    const point of accommodationPoints
  ) {
    if (
      point.token &&
      token === point.token
    ) {
      return {
        type: 'accommodation',
        code: point.code,
        name: point.name
      };
    }
  }

  if (
    returnToken &&
    token === returnToken
  ) {
    return {
      type: 'return',
      code: 'RETURN_POINT',
      name:
        'จุดคืนอุปกรณ์/ส่งคืนห้อง'
    };
  }

  return null;
}

async function fetchBookings({
  supabaseUrl,
  supabaseSecretKey,
  memberId,
  status,
  startDate = null
}) {
  let url =
    supabaseUrl +
    '/rest/v1/bookings' +
    '?member_id=eq.' +
    encodeURIComponent(memberId) +
    '&status=eq.' +
    encodeURIComponent(status);

  if (startDate) {
    url +=
      '&start_date=eq.' +
      encodeURIComponent(startDate);
  }

  url +=
    '&select=*' +
    '&order=created_at.desc';

  const response =
    await fetch(
      url,
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
        },
        cache: 'no-store'
      }
    );

  const data =
    await response.json();

  return {
    response,
    data
  };
}


async function findFirstBookingByStatuses({
  supabaseUrl,
  supabaseSecretKey,
  memberId,
  statuses
}) {
  for (const status of statuses) {
    const { response, data } =
      await fetchBookings({
        supabaseUrl,
        supabaseSecretKey,
        memberId,
        status
      });

    if (
      response.ok &&
      Array.isArray(data) &&
      data.length > 0
    ) {
      return data[0];
    }
  }

  return null;
}

async function updateBookingStatus({
  supabaseUrl,
  supabaseSecretKey,
  bookingId,
  fromStatus,
  toStatus,
  patchData
}) {
  const response =
    await fetch(
      supabaseUrl +
        '/rest/v1/bookings' +
        '?id=eq.' +
        encodeURIComponent(
          bookingId
        ) +
        '&status=eq.' +
        encodeURIComponent(
          fromStatus
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
          JSON.stringify({
            status:
              toStatus,
            updated_at:
              new Date()
                .toISOString(),
            ...patchData
          })
      }
    );

  const data =
    await response.json();

  return {
    response,
    data
  };
}

async function writeHistory({
  supabaseUrl,
  supabaseSecretKey,
  bookingId,
  fromStatus,
  toStatus,
  memberId,
  note
}) {
  const response =
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
          JSON.stringify({
            booking_id:
              bookingId,
            from_status:
              fromStatus,
            to_status:
              toStatus,
            trigger_method:
              'qr',
            triggered_by_member_id:
              memberId,
            note
          })
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      'Stay journey history failed:',
      errorText
    );
  }
}


function getJourneyUi(status) {
  /*
    ข้อมูลนี้เตรียมไว้ให้ Frontend ใช้กับ Booking Journey Tracking

    หลักการ:
    - ขั้นที่ผ่านมา = completed
    - ขั้นปัจจุบัน = active
    - ขั้นที่ยังไม่ถึง = inactive / สีเทา
    - ปุ่ม Scan QR แสดงเฉพาะสถานะ:
        approved    -> registration
        checked_in  -> accommodation
        checked_out -> return
  */

  const steps = [
    {
      key: 'pending',
      order: 1,
      qrType: null
    },
    {
      key: 'approved',
      order: 2,
      qrType: null
    },
    {
      key: 'checked_in',
      order: 3,
      qrType: 'registration'
    },
    {
      key: 'accommodated',
      order: 4,
      qrType: 'accommodation'
    },
    {
      key: 'in_retreat',
      order: 5,
      qrType: null
    },
    {
      key: 'checked_out',
      order: 6,
      qrType: null
    },
    {
      key: 'completed',
      order: 7,
      qrType: 'return'
    }
  ];

  const statusOrder = {
    pending: 1,
    approved: 2,
    checked_in: 3,
    accommodated: 4,
    in_retreat: 5,
    checked_out: 6,
    completed: 7
  };

  const currentOrder =
    statusOrder[status] || 0;

  let nextQrAction = null;

  if (status === 'approved') {
    nextQrAction = {
      type: 'registration',
      targetStatus: 'checked_in',
      targetStep: 3,
      showScanButton: true
    };
  } else if (status === 'checked_in') {
    nextQrAction = {
      type: 'accommodation',
      targetStatus: 'accommodated',
      targetStep: 4,
      showScanButton: true
    };
  } else if (status === 'checked_out') {
    nextQrAction = {
      type: 'return',
      targetStatus: 'completed',
      targetStep: 7,
      showScanButton: true
    };
  }

  return {
    currentStatus: status,
    currentOrder,
    nextQrAction,
    steps: steps.map((step) => ({
      ...step,
      state:
        step.order < currentOrder
          ? 'completed'
          : step.order === currentOrder
            ? 'active'
            : 'inactive'
    }))
  };
}

function bookingResult(
  booking,
  extra = {}
) {
  return {
    id:
      booking.id,
    name:
      booking.name,
    startDate:
      booking.start_date,
    endDate:
      booking.end_date,
    status:
      booking.status,
    assignedAccommodation:
      getAssignedAccommodation(
        booking
      ),

    /*
      เตรียม metadata สำหรับหน้า My Stays / Tracking
      เพื่อให้ Frontend รู้ว่า:
      - ขั้นไหนผ่านแล้ว
      - ขั้นไหน active
      - ขั้นไหนยังเป็นสีเทา
      - ต้องแสดงปุ่ม Scan QR หรือไม่
    */
    journey:
      getJourneyUi(
        booking.status
      ),

    ...extra
  };
}

export default async function handler(
  req,
  res
) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message:
        'Method not allowed'
    });
  }

  const session =
    getSessionFromRequest(req);

  if (
    !session ||
    !session.memberId
  ) {
    return res.status(401).json({
      success: false,
      code:
        'LOGIN_REQUIRED',
      message:
        'LINE login required'
    });
  }

  const {
    token
  } = req.body || {};

  if (!token) {
    return res.status(400).json({
      success: false,
      code:
        'QR_TOKEN_REQUIRED',
      message:
        'QR token is required'
    });
  }

  const qrPoint =
    getQrPointByToken(token);

  if (!qrPoint) {
    return res.status(403).json({
      success: false,
      code:
        'INVALID_QR',
      message:
        'Invalid QR code'
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env
      .SUPABASE_SECRET_KEY;

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
    const today =
      getBangkokDate();

    /*
      =========================================================
      1) REGISTRATION POINT
      approved -> checked_in
      =========================================================
    */
    if (
      qrPoint.type ===
      'registration'
    ) {
      const {
        response,
        data: bookings
      } =
        await fetchBookings({
          supabaseUrl,
          supabaseSecretKey,
          memberId:
            session.memberId,
          status:
            'approved',
          startDate:
            today
        });

      if (!response.ok) {
        console.error(
          'Registration booking lookup failed:',
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
          code:
            'NO_ELIGIBLE_BOOKING',
          actionType:
            'registration',
          today,
          message:
            'No approved booking is available for registration today'
        });
      }

      if (
        bookings.length > 1
      ) {
        return res.status(409).json({
          success: false,
          code:
            'MULTIPLE_BOOKINGS',
          message:
            'Multiple eligible bookings were found. Please contact monastery staff.'
        });
      }

      const booking =
        bookings[0];

      const now =
        new Date()
          .toISOString();

      const {
        response:
          updateResponse,
        data:
          updatedBookings
      } =
        await updateBookingStatus({
          supabaseUrl,
          supabaseSecretKey,
          bookingId:
            booking.id,
          fromStatus:
            'approved',
          toStatus:
            'checked_in',
          patchData: {
            checked_in_at:
              now,
            checkin_method:
              'qr',
            checked_in_by:
              session.memberId
          }
        });

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
            'This booking can no longer be registered'
        });
      }

      const updatedBooking =
        updatedBookings[0];

      await writeHistory({
        supabaseUrl,
        supabaseSecretKey,
        bookingId:
          booking.id,
        fromStatus:
          'approved',
        toStatus:
          'checked_in',
        memberId:
          session.memberId,
        note:
          'QR registration at monastery registration point'
      });

      return res
        .status(200)
        .json({
          success: true,
          actionType:
            'registration',
          pointCode:
            qrPoint.code,
          pointName:
            qrPoint.name,
          message:
            'Registration completed',
          booking:
            bookingResult(
              updatedBooking,
              {
                checkedInAt:
                  updatedBooking
                    .checked_in_at,
                checkinMethod:
                  updatedBooking
                    .checkin_method
              }
            )
        });
    }

    /*
      =========================================================
      2) ACCOMMODATION POINT
      checked_in -> accommodated

      ต้องสแกน QR ของห้องที่ Admin จัดไว้เท่านั้น
      =========================================================
    */
    if (
      qrPoint.type ===
      'accommodation'
    ) {
      const {
        response,
        data: bookings
      } =
        await fetchBookings({
          supabaseUrl,
          supabaseSecretKey,
          memberId:
            session.memberId,
          status:
            'checked_in'
        });

      if (!response.ok) {
        console.error(
          'Accommodation booking lookup failed:',
          bookings
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to verify accommodation assignment'
        });
      }

      if (
        !Array.isArray(bookings) ||
        bookings.length === 0
      ) {
        const otherBooking =
          await findFirstBookingByStatuses({
            supabaseUrl,
            supabaseSecretKey,
            memberId:
              session.memberId,
            statuses: [
              'checked_out',
              'completed',
              'approved',
              'accommodated',
              'in_retreat'
            ]
          });

        if (
          otherBooking?.status ===
          'checked_out'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'WRONG_QR_TYPE_EXPECT_RETURN',
            actionType:
              'accommodation',
            scannedAccommodation:
              qrPoint.name,
            message:
              'This is an accommodation QR code. Please scan the return-point QR code.'
          });
        }

        if (
          otherBooking?.status ===
          'completed'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'STAY_ALREADY_COMPLETED',
            actionType:
              'accommodation',
            message:
              'This retreat stay has already been completed.'
          });
        }

        if (
          otherBooking?.status ===
          'approved'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'WRONG_QR_TYPE_EXPECT_REGISTRATION',
            actionType:
              'accommodation',
            message:
              'Please scan the registration-point QR code before scanning an accommodation QR code.'
          });
        }

        if (
          otherBooking?.status ===
            'accommodated' ||
          otherBooking?.status ===
            'in_retreat'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'ACCOMMODATION_ALREADY_CONFIRMED',
            actionType:
              'accommodation',
            message:
              'Accommodation has already been confirmed for this retreat stay.'
          });
        }

        return res.status(404).json({
          success: false,
          code:
            'NO_CHECKED_IN_BOOKING',
          actionType:
            'accommodation',
          message:
            'No checked-in booking is waiting for accommodation confirmation'
        });
      }

      if (
        bookings.length > 1
      ) {
        return res.status(409).json({
          success: false,
          code:
            'MULTIPLE_BOOKINGS',
          message:
            'Multiple checked-in bookings were found. Please contact monastery staff.'
        });
      }

      const booking =
        bookings[0];

      const assignedAccommodation =
        getAssignedAccommodation(
          booking
        );

      if (!assignedAccommodation) {
        return res.status(409).json({
          success: false,
          code:
            'ACCOMMODATION_NOT_ASSIGNED',
          actionType:
            'accommodation',
          scannedAccommodation:
            qrPoint.name,
          message:
            'Accommodation has not yet been assigned by the administrator'
        });
      }

      if (
        normalizeText(
          assignedAccommodation
        ) !==
        normalizeText(
          qrPoint.name
        )
      ) {
        return res.status(409).json({
          success: false,
          code:
            'WRONG_ACCOMMODATION',
          actionType:
            'accommodation',
          assignedAccommodation,
          scannedAccommodation:
            qrPoint.name,
          message:
            'The scanned accommodation does not match the assigned accommodation'
        });
      }

      const now =
        new Date()
          .toISOString();

      const {
        response:
          updateResponse,
        data:
          updatedBookings
      } =
        await updateBookingStatus({
          supabaseUrl,
          supabaseSecretKey,
          bookingId:
            booking.id,
          fromStatus:
            'checked_in',
          toStatus:
            'accommodated',

          /*
            ยังไม่เพิ่ม accommodated_at
            เพื่อไม่เสี่ยงชน schema เดิม
            เวลาสแกนถูกบันทึกใน
            stay_status_history อยู่แล้ว
          */
          patchData: {}
        });

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
            'ACCOMMODATION_ALREADY_PROCESSED',
          message:
            'This accommodation check-in can no longer be processed'
        });
      }

      const updatedBooking =
        updatedBookings[0];

      await writeHistory({
        supabaseUrl,
        supabaseSecretKey,
        bookingId:
          booking.id,
        fromStatus:
          'checked_in',
        toStatus:
          'accommodated',
        memberId:
          session.memberId,
        note:
          `QR accommodation confirmation: ${qrPoint.name}`
      });

      return res
        .status(200)
        .json({
          success: true,
          actionType:
            'accommodation',
          pointCode:
            qrPoint.code,
          pointName:
            qrPoint.name,
          message:
            'Accommodation confirmed',
          booking:
            bookingResult(
              updatedBooking,
              {
                accommodationConfirmedAt:
                  now,
                assignedAccommodation:
                  assignedAccommodation
              }
            )
        });
    }

    /*
      =========================================================
      3) RETURN POINT
      checked_out -> completed

      ขั้น checked_out ต้องถูก Admin ยืนยันก่อน
      ตาม Journey ที่ตกลงกันไว้
      =========================================================
    */
    if (
      qrPoint.type ===
      'return'
    ) {
      const {
        response,
        data: bookings
      } =
        await fetchBookings({
          supabaseUrl,
          supabaseSecretKey,
          memberId:
            session.memberId,
          status:
            'checked_out'
        });

      if (!response.ok) {
        console.error(
          'Return booking lookup failed:',
          bookings
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to verify return status'
        });
      }

      if (
        !Array.isArray(bookings) ||
        bookings.length === 0
      ) {
        const otherBooking =
          await findFirstBookingByStatuses({
            supabaseUrl,
            supabaseSecretKey,
            memberId:
              session.memberId,
            statuses: [
              'checked_in',
              'approved',
              'accommodated',
              'in_retreat',
              'completed'
            ]
          });

        if (
          otherBooking?.status ===
          'checked_in'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'WRONG_QR_TYPE_EXPECT_ACCOMMODATION',
            actionType:
              'return',
            message:
              'Please scan the QR code of the accommodation assigned to you before using the return point.'
          });
        }

        if (
          otherBooking?.status ===
          'approved'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'WRONG_QR_TYPE_EXPECT_REGISTRATION',
            actionType:
              'return',
            message:
              'Please complete registration before using the return point.'
          });
        }

        if (
          otherBooking?.status ===
            'accommodated' ||
          otherBooking?.status ===
            'in_retreat'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'RETURN_NOT_READY',
            actionType:
              'return',
            message:
              'The retreat stay has not yet reached the return-confirmation stage.'
          });
        }

        if (
          otherBooking?.status ===
          'completed'
        ) {
          return res.status(409).json({
            success: false,
            code:
              'STAY_ALREADY_COMPLETED',
            actionType:
              'return',
            message:
              'This retreat stay has already been completed.'
          });
        }

        return res.status(404).json({
          success: false,
          code:
            'NO_RETURN_ELIGIBLE_BOOKING',
          actionType:
            'return',
          message:
            'No booking is currently ready for equipment/room return confirmation'
        });
      }

      if (
        bookings.length > 1
      ) {
        return res.status(409).json({
          success: false,
          code:
            'MULTIPLE_BOOKINGS',
          message:
            'Multiple return-eligible bookings were found. Please contact monastery staff.'
        });
      }

      const booking =
        bookings[0];

      const now =
        new Date()
          .toISOString();

      const {
        response:
          updateResponse,
        data:
          updatedBookings
      } =
        await updateBookingStatus({
          supabaseUrl,
          supabaseSecretKey,
          bookingId:
            booking.id,
          fromStatus:
            'checked_out',
          toStatus:
            'completed',
          patchData: {
            completed_at:
              now
          }
        });

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
            'RETURN_ALREADY_PROCESSED',
          message:
            'This return can no longer be processed'
        });
      }

      const updatedBooking =
        updatedBookings[0];

      await writeHistory({
        supabaseUrl,
        supabaseSecretKey,
        bookingId:
          booking.id,
        fromStatus:
          'checked_out',
        toStatus:
          'completed',
        memberId:
          session.memberId,
        note:
          'QR keys/equipment return completed; retreat stay completed'
      });

      return res
        .status(200)
        .json({
          success: true,
          actionType:
            'return',
          pointCode:
            qrPoint.code,
          pointName:
            qrPoint.name,
          message:
            'Return completed. Retreat stay completed.',
          booking:
            bookingResult(
              updatedBooking,
              {
                completedAt:
                  now
              }
            )
        });
    }

    return res.status(400).json({
      success: false,
      code:
        'UNSUPPORTED_QR',
      message:
        'Unsupported QR action'
    });
  } catch (error) {
    console.error(
      'QR journey server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'QR journey server error'
    });
  }
}
