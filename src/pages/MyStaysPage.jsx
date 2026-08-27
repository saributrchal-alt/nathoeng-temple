import React, {
  useEffect,
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
    active || completed
      ? '#9b7226'
      : '#a8a8a8';

  const commonProps = {
    width: 28,
    height: 28,
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
        <path d="M15.5 17.5l3-3 2 2-3 3-3 .8z" />
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
      ? 'สิ้นสุดการเข้าพักแล้ว'
      : 'Stay ended',

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

      th: 'ส่งคำขอเข้าพักปฏิบัติธรรมแล้ว',
      en: 'Retreat stay request submitted',

      descriptionTh:
        'คำขอของคุณถูกส่งเข้าสู่ระบบแล้ว',

      descriptionEn:
        'Your retreat stay request has been submitted.'
    },

    {
      key: 'approved',
      icon: 'approved',

      th: 'อนุมัติการเข้าพักปฏิบัติธรรมแล้ว',
      en: 'Retreat stay approved',

      descriptionTh:
        'คำขอได้รับการพิจารณาและอนุมัติแล้ว',

      descriptionEn:
        'Your request has been reviewed and approved.'
    },

    {
      key: 'checked_in',
      icon: 'register',

      th: 'ลงทะเบียนเข้าพักแล้ว',
      en: 'Stay registration completed',

      descriptionTh:
        'คุณได้ลงทะเบียนและยืนยันการเข้าพักแล้ว',

      descriptionEn:
        'Your arrival and stay registration have been confirmed.'
    },

    {
      key: 'accommodated',
      icon: 'accommodation',

      th: 'จัดสถานที่พักเรียบร้อยแล้ว',
      en: 'Accommodation assigned',

      descriptionTh:
        'เจ้าหน้าที่ได้จัดเตรียมสถานที่พักให้คุณแล้ว',

      descriptionEn:
        'Monastery staff have prepared your accommodation.'
    },

    {
      key: 'in_retreat',
      icon: 'practice',

      th: 'อยู่ระหว่างการเข้าพักปฏิบัติธรรม',
      en: 'Currently staying for Dhamma practice',

      descriptionTh:
        'ขอให้การปฏิบัติธรรมของคุณเจริญงอกงาม',

      descriptionEn:
        'May your Dhamma practice be peaceful and fruitful.'
    },

    {
      key: 'checked_out',
      icon: 'checkout',

      th: 'สิ้นสุดการเข้าพักแล้ว',
      en: 'Stay ended',

      descriptionTh:
        'คุณได้ออกจากสถานที่พักและสิ้นสุดการเข้าพักแล้ว',

      descriptionEn:
        'You have departed and your stay has ended.'
    },

    {
      key: 'completed',
      icon: 'complete',

      th: 'การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์',
      en: 'Retreat stay completed',

      descriptionTh:
        'การเข้าพักปฏิบัติธรรมของคุณเสร็จสมบูรณ์แล้ว',

      descriptionEn:
        'Your retreat stay has been completed.'
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
     LOAD BOOKINGS
     ========================================================= */

  useEffect(() => {
    loadBookings();
  }, []);


  async function loadBookings() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/my-bookings',
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
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
    const currentIndex =
      statusOrder[booking.status] ?? 0;

    const stopped =
      booking.status === 'rejected' ||
      booking.status === 'cancelled';


    return (
      <div
        style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid #eee'
        }}
      >

        <div
          style={{
            color: '#a87518',
            fontSize: '13px',
            letterSpacing: '1.5px',
            marginBottom: '28px'
          }}
        >
          {th
            ? 'ความคืบหน้าการเข้าพักปฏิบัติธรรม'
            : 'RETREAT STAY PROGRESS'}
        </div>


        {stopped ? (

          <div
            style={{
              padding: '16px 18px',
              background: '#faf1ef',
              borderLeft: '3px solid #a24a3a'
            }}
          >
            <strong>
              {statusText[booking.status]}
            </strong>
          </div>

        ) : (

          <div
            style={{
              position: 'relative'
            }}
          >

            {trackingSteps.map(
              (step, index) => {

                const completed =
                  index < currentIndex;

                const current =
                  index === currentIndex;

                const reached =
                  index <= currentIndex;

                const last =
                  index ===
                  trackingSteps.length - 1;


                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      position: 'relative',
                      minHeight: last
                        ? '92px'
                        : '116px'
                    }}
                  >

                    {/* LEFT TIMELINE */}

                    <div
                      style={{
                        width: '28px',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >

                      <div
                        style={{
                          width: current
                            ? '15px'
                            : '12px',

                          height: current
                            ? '15px'
                            : '12px',

                          borderRadius: '50%',

                          background:
                            reached
                              ? '#9b7226'
                              : '#fff',

                          border:
                            reached
                              ? '2px solid #9b7226'
                              : '2px solid #d7d0c5',

                          position: 'absolute',

                          top: '27px',

                          left: current
                            ? '4px'
                            : '5px',

                          zIndex: 3
                        }}
                      />


                      {!last && (
                        <div
                          style={{
                            position: 'absolute',

                            top: '40px',

                            left: '11px',

                            width: '2px',

                            bottom: '-4px',

                            background:
                              index < currentIndex
                                ? '#b89a61'
                                : '#e2ddd4',

                            zIndex: 1
                          }}
                        />
                      )}

                    </div>


                    {/* ICON */}

                    <div
                      style={{
                        width: '70px',
                        flexShrink: 0
                      }}
                    >

                      <div
                        style={{
                          width: current
                            ? '58px'
                            : '54px',

                          height: current
                            ? '58px'
                            : '54px',

                          borderRadius: '50%',

                          display: 'flex',

                          alignItems: 'center',

                          justifyContent: 'center',

                          background:
                            reached
                              ? '#eef6ed'
                              : '#f5f5f3',

                          border:
                            current
                              ? '2px solid #d8c49a'
                              : '1px solid transparent'
                        }}
                      >

                        <StepIcon
                          type={step.icon}
                          active={current}
                          completed={completed}
                        />

                      </div>

                    </div>


                    {/* STEP TEXT */}

                    <div
                      style={{
                        paddingTop: '5px',
                        paddingBottom: '25px'
                      }}
                    >

                      <div
                        style={{
                          fontWeight:
                            current
                              ? '700'
                              : reached
                              ? '600'
                              : '500',

                          color:
                            reached
                              ? '#302d29'
                              : '#999',

                          fontSize: '15px',

                          lineHeight: '1.5'
                        }}
                      >
                        {th
                          ? step.th
                          : step.en}
                      </div>


                      {current && (
                        <div
                          style={{
                            color: '#9b7226',
                            fontSize: '13px',
                            marginTop: '4px',
                            fontWeight: '500'
                          }}
                        >
                          {th
                            ? 'สถานะปัจจุบัน'
                            : 'Current status'}
                        </div>
                      )}


                      <div
                        style={{
                          fontSize: '13px',

                          color:
                            reached
                              ? '#777'
                              : '#aaa',

                          marginTop: '6px',

                          lineHeight: '1.5'
                        }}
                      >
                        {th
                          ? step.descriptionTh
                          : step.descriptionEn}
                      </div>


                      {step.key === 'approved' &&
                        booking.status === 'approved' && (

                          <button
                            onClick={() =>
                              goToPage('checkin-page')
                            }
                            style={{
                              marginTop: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '9px',
                              background: '#a87518',
                              color: '#fff',
                              border: '1px solid #a87518',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              lineHeight: '1.3',
                              boxShadow:
                                '0 2px 6px rgba(0,0,0,0.05)'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '18px',
                                lineHeight: 1
                              }}
                            >
                              ▦
                            </span>

                            {th
                              ? 'ลงทะเบียนเข้าพัก / สแกน QR'
                              : 'CHECK IN / SCAN QR'}
                          </button>

                        )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="guidePage">

      <div
        className="guideContainer"
        style={{
          maxWidth: '1000px'
        }}
      >

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


        {/* =====================================================
            PAGE HEADER + QR BUTTON
            ===================================================== */}

        <div
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '25px',
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              flex: '1 1 520px'
            }}
          >

            <div
              style={{
                color: '#a87518',
                fontSize: '13px',
                letterSpacing: '2px',
                marginBottom: '12px'
              }}
            >
              {th
                ? 'ข้อมูลสมาชิก'
                : 'MEMBER AREA'}
            </div>


            <h1
              style={{
                marginBottom: '12px'
              }}
            >
              {th
                ? 'การเข้าพักปฏิบัติธรรมของฉัน'
                : 'My Retreat Stays'}
            </h1>


            <p
              style={{
                marginBottom: 0
              }}
            >
              {th
                ? 'ตรวจสอบสถานะและความคืบหน้าการเข้าพักปฏิบัติธรรมของคุณ'
                : 'View the status and progress of your retreat stays.'}
            </p>

          </div>



        </div>


        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading && (
          <p>
            {th
              ? 'กำลังโหลดข้อมูล...'
              : 'Loading...'}
          </p>
        )}


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div
            style={{
              padding: '16px',
              border: '1px solid #ddd',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}


        {/* =====================================================
            EMPTY
            ===================================================== */}

        {!loading &&
          !error &&
          bookings.length === 0 && (

            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #e5e0d8'
              }}
            >

              <p>
                {th
                  ? 'ยังไม่มีรายการขอเข้าพักปฏิบัติธรรม'
                  : 'You do not have any retreat stay requests yet.'}
              </p>


              <button
                onClick={() =>
                  goToPage('booking-page')
                }
                style={{
                  marginTop: '15px',
                  padding: '12px 20px',
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'ขอเข้าพักปฏิบัติธรรม'
                  : 'Request a Retreat Stay'}
              </button>

            </div>
          )}


        {/* =====================================================
            BOOKING CARDS
            ===================================================== */}

        {!loading &&
          bookings.map((booking) => (

            <div
              key={booking.id}
              style={{
                border: '1px solid #e3ddd3',
                padding: '24px',
                marginBottom: '24px',
                background: '#fff'
              }}
            >

              {/* TOP */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >

                <div>

                  <strong>
                    {booking.name}
                  </strong>


                  <div
                    style={{
                      marginTop: '8px',
                      color: '#666'
                    }}
                  >
                    {booking.start_date}
                    {' → '}
                    {booking.end_date}
                  </div>

                </div>


                {/* STATUS BADGE */}

                <div
                  style={{
                    padding: '7px 13px',

                    background:
                      booking.status === 'rejected' ||
                      booking.status === 'cancelled'
                        ? '#faf1ef'
                        : '#eef6ed',

                    borderRadius: '20px',

                    height: 'fit-content',

                    fontWeight: '500'
                  }}
                >
                  {statusText[booking.status] ||
                    booking.status}
                </div>

              </div>


              <hr
                style={{
                  border: 0,
                  borderTop: '1px solid #eee',
                  margin: '20px 0'
                }}
              />


              {/* PURPOSE */}

              <p>
                <strong>
                  {th
                    ? 'จุดประสงค์: '
                    : 'Purpose: '}
                </strong>

                {booking.purpose || '-'}
              </p>


              {/* ACCOMMODATION */}

              {booking.accommodation_name && (

                <p>
                  <strong>
                    {th
                      ? 'สถานที่พัก: '
                      : 'Accommodation: '}
                  </strong>

                  {booking.accommodation_name}
                </p>

              )}


              {/* APPROVED MESSAGE */}

              {booking.status ===
                'approved' && (

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#faf7ef'
                  }}
                >
                  {th
                    ? '✓ คำขอเข้าพักปฏิบัติธรรมได้รับอนุมัติแล้ว เมื่อเดินทางถึงวัด กรุณาลงทะเบียนเข้าพักกับเจ้าหน้าที่'
                    : '✓ Your retreat stay has been approved. Please register with monastery staff when you arrive.'}
                </div>

              )}


              {/* CHECKED IN MESSAGE */}

              {booking.status ===
                'checked_in' && (

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#eef6ed'
                  }}
                >
                  {th
                    ? '✓ ลงทะเบียนเข้าพักเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่จัดสถานที่พัก'
                    : '✓ Stay registration completed. Please wait for monastery staff to assign your accommodation.'}
                </div>

              )}


              {/* COMPLETED MESSAGE */}

              {booking.status ===
                'completed' && (

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#eef6ed'
                  }}
                >
                  {th
                    ? '✓ การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์แล้ว'
                    : '✓ Your retreat stay has been completed.'}
                </div>

              )}


              {/* TRACKING */}

              <StayTracking
                booking={booking}
              />

            </div>
          ))}

      </div>
    </div>
  );
}


export default MyStaysPage;