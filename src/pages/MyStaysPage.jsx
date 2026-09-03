import React, {
  useEffect,
  useMemo,
  useState
} from 'react';


/* =========================================================
   TRACKING ICONS
   ========================================================= */

function StepIcon({
  type,
  active = false,
  completed = false
}) {
  const color =
    completed
      ? '#ffffff'
      : active
      ? '#ffffff'
      : '#9a9288';

  const commonProps = {
    width: 25,
    height: 25,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  if (type === 'request') {
    return (
      <svg {...commonProps}>
        <path d="M6 2h9l4 4v16H6z" />
        <path d="M14 2v5h5" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </svg>
    );
  }

  if (type === 'approved') {
    return (
      <svg {...commonProps}>
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="M8.5 12l2.2 2.2 4.8-5" />
      </svg>
    );
  }

  if (type === 'register') {
    return (
      <svg {...commonProps}>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 19c0-4 2.5-6 6-6 1.2 0 2.3.2 3.2.7" />
        <path d="M15 15l5 5" />
        <path d="M18 14l2 2" />
        <path d="M14 20l2.5-.5L20 16" />
      </svg>
    );
  }

  if (type === 'accommodation') {
    return (
      <svg {...commonProps}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v11h14V10" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }

  if (type === 'practice') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="5" r="2.3" />
        <path d="M12 8v4" />
        <path d="M8 11l4 2 4-2" />
        <path d="M9 13l-4 5" />
        <path d="M15 13l4 5" />
        <path d="M5 18c2 2 4.5 3 7 3s5-1 7-3" />
      </svg>
    );
  }

  if (type === 'checkout') {
    return (
      <svg {...commonProps}>
        <path d="M10 4H5v16h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </svg>
    );
  }

  if (type === 'complete') {
    return (
      <svg {...commonProps}>
        <path d="M12 21c-4-2-7-5-7-9 3 0 5 1 7 4 2-3 4-4 7-4 0 4-3 7-7 9z" />
        <path d="M12 16c-2-4-2-7 0-11 2 4 2 7 0 11z" />
        <path d="M5 12c-2-1-3-3-3-5 3 0 6 2 8 6" />
        <path d="M19 12c2-1 3-3 3-5-3 0-6 2-8 6" />
      </svg>
    );
  }

  return null;
}


/* =========================================================
   MAIN PAGE
   ========================================================= */

function MyStaysPage({
  lang = 'th',
  goToPage
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const th = lang === 'th';


  /* =========================================================
     STATUS TEXT
     ========================================================= */

  const statusText = {
    pending: th
      ? 'รอพิจารณาคำขอ'
      : 'Awaiting approval',

    approved: th
      ? 'อนุมัติการเข้าพักปฏิบัติธรรมแล้ว'
      : 'Retreat stay approved',

    checked_in: th
      ? 'ลงทะเบียนเข้าพักแล้ว'
      : 'Stay registration completed',

    accommodated: th
      ? 'จัดสถานที่พักแล้ว'
      : 'Accommodation assigned',

    in_retreat: th
      ? 'อยู่ระหว่างการเข้าพักปฏิบัติธรรม'
      : 'Currently in retreat',

    checked_out: th
      ? 'การเข้าพักปฏิบัติธรรมครบกำหนดแล้ว'
      : 'Retreat stay period completed',

    completed: th
      ? 'การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์'
      : 'Retreat stay completed',

    rejected: th
      ? 'ไม่อนุมัติคำขอ'
      : 'Request not approved',

    cancelled: th
      ? 'ยกเลิกคำขอแล้ว'
      : 'Request cancelled'
  };


  /* =========================================================
     TRACKING STEPS
     ========================================================= */

  const trackingSteps = [
    {
      key: 'pending',
      icon: 'request',
      th: 'คำขอเข้าพักปฏิบัติธรรม',
      en: 'Retreat stay request',
      descriptionTh:
        'ระบบได้รับคำขอของท่านแล้ว',
      descriptionEn:
        'Your retreat stay request has been received.'
    },
    {
      key: 'approved',
      icon: 'approved',
      th: 'อนุมัติการเข้าพักปฏิบัติธรรม',
      en: 'Retreat stay approved',
      descriptionTh:
        'เจ้าหน้าที่ได้อนุมัติคำขอของท่านแล้ว',
      descriptionEn:
        'Monastery staff have approved your request.'
    },
    {
      key: 'checked_in',
      icon: 'register',
      th: 'ลงทะเบียน / เช็กอินที่จุดลงทะเบียน',
      en: 'Registration / check-in',
      descriptionTh:
        'ลงทะเบียนเมื่อเดินทางมาถึงวัด',
      descriptionEn:
        'Register when you arrive at the monastery.'
    },
    {
      key: 'accommodated',
      icon: 'accommodation',
      th: 'เข้าพักที่พักที่ได้รับมอบหมาย',
      en: 'Assigned accommodation',
      descriptionTh:
        'เข้าพักตามสถานที่ที่เจ้าหน้าที่มอบหมาย',
      descriptionEn:
        'Stay in the accommodation assigned by monastery staff.'
    },
    {
      key: 'in_retreat',
      icon: 'practice',
      th: 'ปฏิบัติธรรม',
      en: 'Dhamma practice',
      descriptionTh:
        'อยู่ระหว่างการเข้าพักและปฏิบัติธรรม',
      descriptionEn:
        'Your retreat stay and Dhamma practice are in progress.'
    },
    {
      key: 'checked_out',
      icon: 'checkout',
      th: 'การเข้าพักปฏิบัติธรรมครบกำหนดแล้ว',
      en: 'Retreat stay period completed',
      descriptionTh:
        'การเข้าพักตามกำหนดสิ้นสุดแล้ว',
      descriptionEn:
        'Your scheduled retreat stay has ended.'
    },
    {
      key: 'completed',
      icon: 'complete',
      th: 'คืนกุญแจ / อุปกรณ์และเช็กเอาท์',
      en: 'Return items & complete check-out',
      descriptionTh:
        'คืนกุญแจและอุปกรณ์เรียบร้อย การเข้าพักเสร็จสมบูรณ์',
      descriptionEn:
        'Keys and equipment have been returned and the stay is complete.'
    }
  ];


  const statusOrder = {
    pending: 0,
    approved: 1,
    checked_in: 2,
    accommodated: 3,
    in_retreat: 4,
    checked_out: 5,
    completed: 6
  };


  /* =========================================================
     HELPERS
     ========================================================= */

  function getRequestCode(booking) {
    return String(
      booking?.request_code ||
      booking?.booking_code ||
      booking?.id ||
      ''
    );
  }

  function shortRequestCode(booking) {
    const code = getRequestCode(booking);

    if (!code) {
      return th
        ? 'ไม่พบรหัสคำขอ'
        : 'Request code unavailable';
    }

    if (code.length <= 18) {
      return code;
    }

    return `${code.slice(0, 8)}…${code.slice(-5)}`;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return th
        ? 'ยังไม่ระบุ'
        : 'Not set';
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(
      th ? 'th-TH' : 'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);
  }

  async function copyRequestCode(booking) {
    const code = getRequestCode(booking);

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(booking.id);

      window.setTimeout(() => {
        setCopiedId('');
      }, 1600);
    } catch (err) {
      console.error(
        'Unable to copy request code:',
        err
      );
    }
  }


  /* =========================================================
     LOAD BOOKINGS — ALWAYS FRESH
     ========================================================= */

  useEffect(() => {
    loadBookings();

    const handleFocus = () => {
      loadBookings(false);
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        loadBookings(false);
      }
    };

    window.addEventListener(
      'focus',
      handleFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        'focus',
        handleFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, []);


  async function loadBookings(
    showLoading = true
  ) {
    if (showLoading) {
      setLoading(true);
    }

    setError('');

    try {
      const response = await fetch(
        '/api/my-bookings?ts=' +
          Date.now(),
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control':
              'no-cache'
          }
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          'Unable to load bookings'
        );
      }

      setBookings(
        Array.isArray(data.bookings)
          ? data.bookings
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        th
          ? 'ไม่สามารถโหลดข้อมูลการเข้าพักปฏิบัติธรรมได้'
          : 'Unable to load your retreat stays'
      );
    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     TRACKING TIMELINE
     ========================================================= */

  function StayTracking({ booking }) {
    /*
      Tracking is action-oriented:
      - approved   -> step 3 is active (registration QR)
      - checked_in -> step 4 is active (accommodation QR)
      - checked_out -> step 7 is active (return QR)
      Other manual stages keep their own current step active.
    */
    const activeStepIndex = {
      pending: 0,
      approved: 2,
      checked_in: 3,
      accommodated: 4,
      in_retreat: 5,
      checked_out: 6,
      completed: 6
    };

    const currentIndex =
      activeStepIndex[booking.status] ?? 0;

    const completedThroughIndex = {
      pending: -1,
      approved: 1,
      checked_in: 2,
      accommodated: 3,
      in_retreat: 4,
      checked_out: 5,
      completed: 6
    };

    const completedIndex =
      completedThroughIndex[booking.status] ?? -1;

    const stopped =
      booking.status === 'rejected' ||
      booking.status === 'cancelled';

    if (stopped) {
      return (
        <div className="stayTracking">
          <div className="stayTrackingTitle">
            {th
              ? 'สถานะการเข้าพักปฏิบัติธรรม'
              : 'RETREAT STAY STATUS'}
          </div>

          <div className="stayStoppedBox">
            {statusText[booking.status] || '-'}
          </div>
        </div>
      );
    }

    return (
      <div className="stayTracking">
        <div className="stayTrackingTitle">
          {th
            ? 'สถานะการเข้าพักปฏิบัติธรรม'
            : 'RETREAT STAY PROGRESS'}
        </div>

        <div className="stayTimeline">
          {trackingSteps.map(
            (step, index) => {
              const completed =
                index <= completedIndex;

              const current =
                index === currentIndex &&
                !completed;

              const reached =
                index <= completedIndex;

              const future =
                !completed && !current;

              const last =
                index ===
                trackingSteps.length - 1;

              return (
                <div
                  key={step.key}
                  className={[
                    'stayStep',
                    completed
                      ? 'isCompleted'
                      : '',
                    current
                      ? 'isCurrent'
                      : '',
                    future
                      ? 'isFuture'
                      : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="stayStepRail">
                    <div className="stayStepCircle">
                      {completed ? (
                        <span className="stayCheck">
                          ✓
                        </span>
                      ) : current ? (
                        <span className="stayStepNumber">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="stayStepNumber">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {!last && (
                      <div
                        className={
                          reached
                            ? 'stayStepLine reached'
                            : 'stayStepLine'
                        }
                      />
                    )}
                  </div>

                  <div className="stayStepContent">
                    <div className="stayStepIcon">
                      <StepIcon
                        type={step.icon}
                        active={current}
                        completed={completed}
                      />
                    </div>

                    <div className="stayStepText">
                      <div className="stayStepHeading">
                        <span className="stayStepIndexText">
                          {index + 1}.
                        </span>{' '}
                        {th
                          ? step.th
                          : step.en}
                      </div>

                      <div className="stayStepDescription">
                        {step.key === 'accommodated' &&
                        booking.accommodation_name
                          ? (
                              th
                                ? `ที่พักที่ได้รับมอบหมาย: ${booking.accommodation_name}`
                                : `Assigned accommodation: ${booking.accommodation_name}`
                            )
                          : (
                              th
                                ? step.descriptionTh
                                : step.descriptionEn
                            )}
                      </div>

                      <div
                        className={[
                          'stayStepState',
                          completed
                            ? 'done'
                            : current
                            ? 'waiting'
                            : 'future'
                        ].join(' ')}
                      >
                        {completed
                          ? th
                            ? '✓ เสร็จสิ้น'
                            : '✓ Completed'
                          : current
                          ? th
                            ? '◉ รอดำเนินการ'
                            : '◉ In progress'
                          : th
                          ? '• รอดำเนินการ'
                          : '• Upcoming'}
                      </div>

                      {/* QR BUTTON — show only at the next QR-triggered step */}
                      {(
                        (
                          booking.status === 'approved' &&
                          step.key === 'checked_in'
                        ) ||
                        (
                          booking.status === 'checked_in' &&
                          step.key === 'accommodated'
                        ) ||
                        (
                          booking.status === 'checked_out' &&
                          step.key === 'completed'
                        )
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            goToPage(
                              'checkin-page'
                            )
                          }
                          className="stayQrButton"
                        >
                          <span aria-hidden="true">
                            ▦
                          </span>

                          {booking.status === 'approved'
                            ? (
                                th
                                  ? 'สแกน QR จุดลงทะเบียน'
                                  : 'SCAN REGISTRATION QR'
                              )
                            : booking.status === 'checked_in'
                            ? (
                                th
                                  ? 'สแกน QR เข้าที่พัก'
                                  : 'SCAN ACCOMMODATION QR'
                              )
                            : (
                                th
                                  ? 'สแกน QR คืนกุญแจ / อุปกรณ์'
                                  : 'SCAN RETURN QR'
                              )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="guidePage myStaysPage">
      <style>{`
        .myStaysPage {
          padding: 48px 18px 76px;
          background:
            radial-gradient(circle at 50% 0%, rgba(169,121,41,.05), transparent 32%),
            #faf8f3;
        }

        .myStaysContainer {
          max-width: 1040px !important;
          padding: 42px 48px 52px !important;
          border: 1px solid #e8dece;
          border-radius: 10px;
          background: #fffefb;
          box-shadow: 0 14px 40px rgba(70,48,26,.045);
        }

        .myStaysHero {
          margin: 24px auto 34px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: end;
        }

        .myStaysHeroIcon {
          width: 38px;
          height: 38px;
          margin-bottom: 10px;
        }

        .myStaysEyebrow {
          margin-bottom: 10px;
          color: #a57929;
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .myStaysHero h1 {
          max-width: 700px;
          margin: 0 0 10px;
          color: #3f3126;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.16;
          font-weight: 500;
          letter-spacing: -.02em;
        }

        .myStaysHero p {
          max-width: 680px;
          margin: 0;
          color: #756a60;
          font-size: 14px;
          line-height: 1.8;
        }

        .stayRefreshBtn {
          min-height: 42px;
          padding: 10px 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #d8c49a;
          border-radius: 999px;
          background: #fff;
          color: #8f6a27;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .stayRefreshBtn:disabled {
          opacity: .6;
          cursor: wait;
        }

        .stayEmpty,
        .stayError {
          padding: 34px 24px;
          border: 1px solid #e6dccd;
          border-radius: 9px;
          background: #fffdfa;
          text-align: center;
        }

        .stayError {
          color: #9b4237;
          background: #fff7f5;
        }

        .stayRequestCard {
          margin-bottom: 26px;
          padding: 26px;
          overflow: hidden;
          border: 1px solid #e4d8c6;
          border-radius: 12px;
          background:
            linear-gradient(180deg, #fffefb 0%, #fffdfa 100%);
          box-shadow: 0 10px 28px rgba(62,42,23,.045);
        }

        .stayCardTop {
          display: grid;
          grid-template-columns: minmax(0,1fr) auto;
          gap: 18px;
          align-items: start;
        }

        .stayName {
          margin: 0 0 8px;
          color: #332a23;
          font-size: 20px;
          font-weight: 600;
        }

        .stayRequestCodeRow {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          color: #98702b;
          font-size: 12px;
        }

        .stayRequestCode {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: .02em;
        }

        .stayCopyBtn {
          padding: 3px 8px;
          border: 1px solid #dfcfb4;
          border-radius: 999px;
          background: #fffaf0;
          color: #8c6425;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
        }

        .stayDates {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #5f5851;
          font-size: 14px;
        }

        .stayDates img {
          width: 20px;
          height: 20px;
        }

        .stayStatusBadge {
          max-width: 290px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #eef7ed;
          color: #32723b;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.45;
          text-align: center;
        }

        .stayStatusBadge.stopped {
          background: #fff0ee;
          color: #af4037;
        }

        .stayMetaGrid {
          margin-top: 22px;
          padding-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          border-top: 1px solid #eee5da;
        }

        .stayMetaItem {
          min-width: 0;
          padding: 16px;
          display: grid;
          grid-template-columns: 36px 1fr;
          gap: 11px;
          align-items: start;
          border: 1px solid #ebe2d6;
          border-radius: 9px;
          background: #fffdf9;
        }

        .stayMetaIcon {
          width: 34px;
          height: 34px;
          padding: 7px;
          border: 1px solid #e2d3ba;
          border-radius: 50%;
          background: #fff8ec;
        }

        .stayMetaLabel {
          display: block;
          margin-bottom: 4px;
          color: #a57929;
          font-size: 9px;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .stayMetaValue {
          color: #4a4037;
          font-size: 13px;
          line-height: 1.6;
          word-break: break-word;
        }

        .stayCompletedMessage {
          margin-top: 18px;
          padding: 16px 18px;
          border: 1px solid #d9e7d5;
          border-radius: 9px;
          background: #f3f9f1;
          color: #39733f;
          font-size: 13px;
          line-height: 1.7;
        }

        .stayTracking {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid #eee5da;
        }

        .stayTrackingTitle {
          margin-bottom: 22px;
          color: #3f332a;
          font-size: 17px;
          font-weight: 600;
        }

        .stayTimeline {
          position: relative;
        }

        .stayStep {
          position: relative;
          display: grid;
          grid-template-columns: 38px minmax(0,1fr);
          min-height: 104px;
        }

        .stayStepRail {
          position: relative;
        }

        .stayStepCircle {
          position: absolute;
          z-index: 3;
          top: 4px;
          left: 0;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 2px solid #d9d5ce;
          border-radius: 50%;
          background: #f3f2ef;
          color: #8e8a84;
          font-size: 13px;
          font-weight: 700;
        }

        .stayStep.isCompleted .stayStepCircle {
          border-color: #24a148;
          background: #24a148;
          color: #fff;
        }

        .stayStep.isCurrent .stayStepCircle {
          border-color: #c88a15;
          background: #c88a15;
          color: #fff;
        }

        .stayStepLine {
          position: absolute;
          z-index: 1;
          top: 38px;
          left: 16px;
          width: 2px;
          bottom: 0;
          background: #dfddd8;
        }

        .stayStepLine.reached {
          background: #91c99f;
        }

        .stayStepContent {
          padding: 0 0 22px 18px;
          display: grid;
          grid-template-columns: 44px minmax(0,1fr);
          gap: 13px;
        }

        .stayStepIcon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid #ded8cf;
          border-radius: 50%;
          background: #f4f2ef;
        }

        .stayStep.isCompleted .stayStepIcon {
          border-color: #24a148;
          background: #24a148;
        }

        .stayStep.isCurrent .stayStepIcon {
          border-color: #c88a15;
          background: #c88a15;
        }

        .stayStepHeading {
          color: #342d27;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.5;
        }

        .stayStep.isFuture .stayStepHeading {
          color: #8d8984;
        }

        .stayStepDescription {
          margin-top: 4px;
          color: #777069;
          font-size: 12.5px;
          line-height: 1.65;
        }

        .stayStepState {
          width: fit-content;
          margin-top: 9px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .stayStepState.done {
          background: #e8f6e9;
          color: #2f8a42;
        }

        .stayStepState.waiting {
          background: #fff1cf;
          color: #9a6812;
        }

        .stayStepState.future {
          background: #f0efed;
          color: #98938d;
        }

        .stayQrButton {
          width: min(100%, 420px);
          min-height: 48px;
          margin-top: 12px;
          padding: 12px 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #b4780b;
          border-radius: 7px;
          background: #b97a06;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .stayStoppedBox {
          padding: 16px 18px;
          border-left: 3px solid #a24a3a;
          border-radius: 6px;
          background: #faf1ef;
          color: #944238;
          font-weight: 600;
        }

        @media (max-width: 720px) {
          .myStaysPage {
            padding: 22px 10px 44px;
          }

          .myStaysContainer {
            width: 100%;
            padding: 26px 16px 32px !important;
            border-radius: 8px;
          }

          .myStaysHero {
            margin-top: 20px;
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .myStaysHeroIcon {
            width: 34px;
            height: 34px;
          }

          .myStaysHero h1 {
            max-width: 100%;
            font-size: clamp(1.95rem, 9vw, 2.55rem);
          }

          .myStaysHero p {
            font-size: 13px;
            line-height: 1.75;
          }

          .stayRefreshBtn {
            width: fit-content;
          }

          .stayRequestCard {
            padding: 20px 16px;
            border-radius: 10px;
          }

          .stayCardTop {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .stayName {
            font-size: 18px;
          }

          .stayStatusBadge {
            max-width: none;
            width: fit-content;
            text-align: left;
          }

          .stayDates {
            font-size: 13px;
          }

          .stayMetaGrid {
            grid-template-columns: 1fr;
          }

          .stayMetaItem {
            padding: 14px;
          }

          .stayTrackingTitle {
            font-size: 16px;
          }

          .stayStep {
            grid-template-columns: 36px minmax(0,1fr);
            min-height: 96px;
          }

          .stayStepCircle {
            width: 32px;
            height: 32px;
          }

          .stayStepLine {
            left: 15px;
            top: 36px;
          }

          .stayStepContent {
            padding-left: 12px;
            grid-template-columns: 38px minmax(0,1fr);
            gap: 10px;
          }

          .stayStepIcon {
            width: 38px;
            height: 38px;
          }

          .stayStepHeading {
            font-size: 14px;
          }

          .stayStepDescription {
            font-size: 11.5px;
          }

          .stayStepState {
            font-size: 10.5px;
          }

          .stayQrButton {
            width: 100%;
          }
        }
      `}</style>

      <div className="guideContainer myStaysContainer">
        <button
          className="backButton"
          onClick={() =>
            goToPage('home')
          }
        >
          {th
            ? '← กลับสู่หน้าหลัก'
            : '← Back to Home'}
        </button>

        <div className="myStaysHero">
          <div>
            <img
              src="/icons/stay.svg"
              alt=""
              className="myStaysHeroIcon"
              aria-hidden="true"
            />

            <div className="myStaysEyebrow">
              {th
                ? 'ข้อมูลสมาชิก'
                : 'MEMBER AREA'}
            </div>

            <h1>
              {th
                ? 'การเข้าพักปฏิบัติธรรมของฉัน'
                : 'My Retreat Stays'}
            </h1>

            <p>
              {th
                ? 'ตรวจสอบสถานะ รายละเอียด และความคืบหน้าการเข้าพักปฏิบัติธรรมของท่าน'
                : 'View the status, details and progress of your retreat stays.'}
            </p>
          </div>

          <button
            type="button"
            className="stayRefreshBtn"
            onClick={() =>
              loadBookings()
            }
            disabled={loading}
          >
            <span aria-hidden="true">
              ↻
            </span>

            {th
              ? 'อัปเดตสถานะ'
              : 'Refresh status'}
          </button>
        </div>

        {loading && (
          <div className="stayEmpty">
            {th
              ? 'กำลังโหลดข้อมูล...'
              : 'Loading...'}
          </div>
        )}

        {!loading &&
          error && (
            <div className="stayError">
              {error}
            </div>
          )}

        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="stayEmpty">
              <img
                src="/icons/lotus.svg"
                alt=""
                aria-hidden="true"
                style={{
                  width: '38px',
                  height: '38px',
                  marginBottom: '12px'
                }}
              />

              <div>
                {th
                  ? 'ยังไม่มีรายการขอเข้าพักปฏิบัติธรรม'
                  : 'You do not have any retreat stay requests yet.'}
              </div>

              <button
                type="button"
                className="primaryContactBtn"
                style={{
                  marginTop: '16px'
                }}
                onClick={() =>
                  goToPage(
                    'booking-page'
                  )
                }
              >
                {th
                  ? 'ขอเข้าพักปฏิบัติธรรม →'
                  : 'Request a Retreat Stay →'}
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          bookings.map((booking) => {
            const stopped =
              booking.status ===
                'rejected' ||
              booking.status ===
                'cancelled';

            return (
              <article
                key={booking.id}
                className="stayRequestCard"
              >
                <div className="stayCardTop">
                  <div>
                    <h2 className="stayName">
                      {booking.name}
                    </h2>

                    <div className="stayRequestCodeRow">
                      <span>
                        {th
                          ? 'รหัสคำขอ'
                          : 'Request ID'}
                      </span>

                      <span
                        className="stayRequestCode"
                        title={getRequestCode(
                          booking
                        )}
                      >
                        {shortRequestCode(
                          booking
                        )}
                      </span>

                      {!!getRequestCode(
                        booking
                      ) && (
                        <button
                          type="button"
                          className="stayCopyBtn"
                          onClick={() =>
                            copyRequestCode(
                              booking
                            )
                          }
                        >
                          {copiedId ===
                          booking.id
                            ? th
                              ? 'คัดลอกแล้ว ✓'
                              : 'Copied ✓'
                            : th
                            ? 'คัดลอก'
                            : 'Copy'}
                        </button>
                      )}
                    </div>

                    <div className="stayDates">
                      <img
                        src="/icons/calendar.svg"
                        alt=""
                        aria-hidden="true"
                      />

                      <span>
                        {formatDate(
                          booking.start_date
                        )}
                      </span>

                      <span>
                        →
                      </span>

                      <span>
                        {formatDate(
                          booking.end_date
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      stopped
                        ? 'stayStatusBadge stopped'
                        : 'stayStatusBadge'
                    }
                  >
                    {booking.status ===
                    'completed'
                      ? '✓ '
                      : ''}
                    {statusText[
                      booking.status
                    ] ||
                      booking.status}
                  </div>
                </div>

                <div className="stayMetaGrid">
                  <div className="stayMetaItem">
                    <img
                      src="/icons/dhamma-book.svg"
                      alt=""
                      className="stayMetaIcon"
                      aria-hidden="true"
                    />

                    <div>
                      <span className="stayMetaLabel">
                        {th
                          ? 'จุดประสงค์'
                          : 'Purpose'}
                      </span>

                      <div className="stayMetaValue">
                        {booking.purpose ||
                          (th
                            ? 'ไม่ได้ระบุ'
                            : 'Not specified')}
                      </div>
                    </div>
                  </div>

                  <div className="stayMetaItem">
                    <img
                      src="/icons/stay.svg"
                      alt=""
                      className="stayMetaIcon"
                      aria-hidden="true"
                    />

                    <div>
                      <span className="stayMetaLabel">
                        {th
                          ? 'สถานที่พัก'
                          : 'Accommodation'}
                      </span>

                      <div className="stayMetaValue">
                        {booking.accommodation_name ||
                          (th
                            ? 'ยังไม่ได้ระบุ'
                            : 'Not assigned yet')}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.status ===
                  'completed' && (
                  <div className="stayCompletedMessage">
                    {th
                      ? '✓ การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์แล้ว ขออนุโมทนาในการปฏิบัติ และขอให้เดินทางกลับโดยสวัสดิภาพ ยินดีต้อนรับกลับมาปฏิบัติธรรมอีกครั้ง'
                      : '✓ Your retreat stay is complete. We rejoice in your practice, wish you a safe journey home, and warmly welcome you to return again.'}
                  </div>
                )}

                <StayTracking
                  booking={booking}
                />
              </article>
            );
          })}
      </div>
    </div>
  );
}

export default MyStaysPage;
