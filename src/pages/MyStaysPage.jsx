import React, {
  useEffect,
  useState
} from 'react';

function MyStaysPage({
  lang = 'th',
  goToPage
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const th = lang === 'th';

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

  const trackingSteps = [
    {
      key: 'pending',
      th: 'ส่งคำขอเข้าพักปฏิบัติธรรมแล้ว',
      en: 'Retreat stay request submitted'
    },
    {
      key: 'approved',
      th: 'อนุมัติการเข้าพักปฏิบัติธรรมแล้ว',
      en: 'Retreat stay approved'
    },
    {
      key: 'checked_in',
      th: 'ลงทะเบียนเข้าพักแล้ว',
      en: 'Stay registration completed'
    },
    {
      key: 'accommodated',
      th: 'จัดสถานที่พักเรียบร้อยแล้ว',
      en: 'Accommodation assigned'
    },
    {
      key: 'in_retreat',
      th: 'อยู่ระหว่างการเข้าพักปฏิบัติธรรม',
      en: 'Currently staying for Dhamma practice'
    },
    {
      key: 'checked_out',
      th: 'สิ้นสุดการเข้าพักแล้ว',
      en: 'Stay ended'
    },
    {
      key: 'completed',
      th: 'การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์',
      en: 'Retreat stay completed'
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
          data.message || 'Unable to load bookings'
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
            marginBottom: '22px'
          }}
        >
          {th
            ? 'ความคืบหน้าการเข้าพักปฏิบัติธรรม'
            : 'RETREAT STAY PROGRESS'}
        </div>

        {stopped ? (
          <div
            style={{
              padding: '15px 18px',
              background: '#faf1ef',
              borderLeft: '3px solid #a24a3a'
            }}
          >
            <strong>
              {statusText[booking.status]}
            </strong>
          </div>
        ) : (
          <div>
            {trackingSteps.map(
              (step, index) => {
                const completed =
                  index <= currentIndex;

                const current =
                  index === currentIndex;

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
                        ? '46px'
                        : '78px'
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: current
                            ? '18px'
                            : '14px',
                          height: current
                            ? '18px'
                            : '14px',
                          borderRadius: '50%',
                          background:
                            completed
                              ? '#8f6a27'
                              : '#fff',
                          border:
                            completed
                              ? '2px solid #8f6a27'
                              : '2px solid #d8d1c7',
                          position: 'absolute',
                          top: '2px',
                          left: current
                            ? '4px'
                            : '6px',
                          zIndex: 2
                        }}
                      />

                      {!last && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '18px',
                            left: '12px',
                            width: '2px',
                            height: '64px',
                            background:
                              index < currentIndex
                                ? '#b89a61'
                                : '#e5e0d8'
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        paddingBottom: '20px'
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            current
                              ? '600'
                              : '500',
                          color:
                            completed
                              ? '#302d29'
                              : '#999',
                          fontSize: '15px'
                        }}
                      >
                        {th
                          ? step.th
                          : step.en}
                      </div>

                      {current && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '13px',
                            color: '#8f6a27'
                          }}
                        >
                          {th
                            ? 'สถานะปัจจุบัน'
                            : 'Current status'}
                        </div>
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

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{ maxWidth: '1000px' }}
      >
        <button
          className="backButton"
          onClick={() => goToPage('home')}
        >
          {th
            ? '← กลับสู่หน้าหลัก'
            : '← Back to Home'}
        </button>

        <div
          style={{
            marginTop: '30px',
            marginBottom: '30px'
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

          <h1>
            {th
              ? 'การเข้าพักปฏิบัติธรรมของฉัน'
              : 'My Retreat Stays'}
          </h1>

          <p>
            {th
              ? 'ตรวจสอบสถานะและความคืบหน้าการเข้าพักปฏิบัติธรรมของคุณ'
              : 'View the status and progress of your retreat stays.'}
          </p>
        </div>

        {loading && (
          <p>
            {th
              ? 'กำลังโหลดข้อมูล...'
              : 'Loading...'}
          </p>
        )}

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

                <div
                  style={{
                    padding: '7px 13px',
                    background:
                      booking.status === 'rejected' ||
                      booking.status === 'cancelled'
                        ? '#faf1ef'
                        : '#eef6ed',
                    borderRadius: '20px',
                    height: 'fit-content'
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

              <p>
                <strong>
                  {th
                    ? 'จุดประสงค์: '
                    : 'Purpose: '}
                </strong>

                {booking.purpose || '-'}
              </p>

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

              {booking.status === 'approved' && (
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

              {booking.status === 'checked_in' && (
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

              {booking.status === 'completed' && (
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