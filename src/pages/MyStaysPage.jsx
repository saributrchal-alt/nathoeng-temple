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
    pending: th ? 'รอการอนุมัติ' : 'Pending approval',
    approved: th ? 'อนุมัติแล้ว' : 'Approved',
    checked_in: th ? 'เช็กอินแล้ว' : 'Checked in',
    accommodated: th ? 'เข้าที่พักแล้ว' : 'Accommodation assigned',
    in_retreat: th ? 'อยู่ระหว่างปฏิบัติธรรม' : 'In retreat',
    checked_out: th ? 'เช็กเอาต์แล้ว' : 'Checked out',
    completed: th ? 'การเข้าพักเสร็จสิ้น' : 'Stay completed',
    rejected: th ? 'ไม่อนุมัติ' : 'Rejected',
    cancelled: th ? 'ยกเลิกแล้ว' : 'Cancelled'
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
          ? 'ไม่สามารถโหลดข้อมูลการเข้าพักได้'
          : 'Unable to load your stays'
      );
    } finally {
      setLoading(false);
    }
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
              ? 'การเข้าพักของฉัน'
              : 'My Stays'}
          </h1>

          <p>
            {th
              ? 'ตรวจสอบสถานะการจองและการเข้าพักปฏิบัติธรรมของคุณ'
              : 'View the status of your retreat bookings and stays.'}
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
                  ? 'ยังไม่มีรายการจองเข้าพัก'
                  : 'You do not have any stay bookings yet.'}
              </p>

              <button
                onClick={() =>
                  goToPage('booking')
                }
                style={{
                  marginTop: '15px',
                  padding: '12px 20px',
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'จองเข้าพักปฏิบัติธรรม'
                  : 'Book a Retreat Stay'}
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
                marginBottom: '20px',
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
                    background: '#eef6ed',
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
                      ? 'ที่พัก: '
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
                    ? '✓ การจองได้รับอนุมัติแล้ว เมื่อเดินทางถึงวัด กรุณาลงทะเบียนเช็กอินกับเจ้าหน้าที่'
                    : '✓ Your booking has been approved. Please check in with monastery staff when you arrive.'}
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
                    ? '✓ เช็กอินเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่จัดที่พัก'
                    : '✓ Check-in completed. Please wait for accommodation assignment.'}
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
                    ? '✓ การเข้าพักปฏิบัติธรรมเสร็จสิ้นแล้ว'
                    : '✓ Your retreat stay has been completed.'}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default MyStaysPage;