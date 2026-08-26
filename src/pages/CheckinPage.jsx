import React, {
  useEffect,
  useState
} from 'react';

function CheckinPage({
  lang,
  goToPage,
  user,
  handleLineLogin
}) {
  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState('');

  const th = lang === 'th';

  const getQrToken = () => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get(
      'checkin_token'
    );
  };

  const handleCheckin = async () => {
    if (!user) {
      sessionStorage.setItem(
        'after_login_page',
        'checkin-page'
      );

      sessionStorage.setItem(
        'pending_checkin_token',
        getQrToken() || ''
      );

      handleLineLogin();
      return;
    }

    const token =
      getQrToken() ||
      sessionStorage.getItem(
        'pending_checkin_token'
      );

    if (!token) {
      setError(
        th
          ? 'ไม่พบข้อมูล QR Check-in กรุณาสแกน QR ที่จุดลงทะเบียนของวัดอีกครั้ง'
          : 'Check-in QR information was not found. Please scan the QR code at the monastery registration point again.'
      );

      return;
    }

    setLoading(true);
    setError('');

    try {
      const response =
        await fetch(
          '/api/checkin-by-qr',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            credentials:
              'include',
            body:
              JSON.stringify({
                token: token
              })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        if (
          data.code ===
          'NO_ELIGIBLE_BOOKING'
        ) {
          throw new Error(
            th
              ? 'วันนี้ยังไม่มีรายการจองที่ได้รับอนุมัติและถึงกำหนดเช็กอิน กรุณาติดต่อเจ้าหน้าที่วัด'
              : 'There is no approved booking eligible for check-in today. Please contact monastery staff.'
          );
        }

        if (
          data.code ===
          'INVALID_QR'
        ) {
          throw new Error(
            th
              ? 'QR Check-in นี้ไม่ถูกต้อง กรุณาสแกน QR ที่จุดลงทะเบียนของวัด'
              : 'This check-in QR code is invalid. Please scan the QR code at the monastery registration point.'
          );
        }

        throw new Error(
          data.message ||
            (th
              ? 'ไม่สามารถเช็กอินได้'
              : 'Unable to check in')
        );
      }

      sessionStorage.removeItem(
        'pending_checkin_token'
      );

      sessionStorage.removeItem(
        'after_login_page'
      );

      setResult(data.booking);
    } catch (err) {
      console.error(
        'QR check-in error:',
        err
      );

      setError(
        err.message ||
          (th
            ? 'เกิดข้อผิดพลาดในการเช็กอิน'
            : 'Check-in error')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const pendingToken =
        sessionStorage.getItem(
          'pending_checkin_token'
        );

      if (
        pendingToken &&
        !result
      ) {
        handleCheckin();
      }
    }
  }, [user]);

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{
          maxWidth: '700px'
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

        <div
          style={{
            textAlign: 'center',
            marginTop: '35px'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '10px'
            }}
          >
            ☸
          </div>

          <span className="eyebrow">
            {th
              ? 'จุดลงทะเบียนเข้าพัก'
              : 'MONASTERY REGISTRATION'}
          </span>

          <h1>
            {th
              ? 'เช็กอินเข้าพักปฏิบัติธรรม'
              : 'Retreat Stay Check-in'}
          </h1>

          <p
            style={{
              color: '#625d55',
              lineHeight: '1.8'
            }}
          >
            {th
              ? 'สำหรับผู้ที่ได้รับอนุมัติการเข้าพักแล้ว กรุณาเช็กอินเมื่อเดินทางมาถึงวัด'
              : 'For approved guests. Please check in when you arrive at the monastery.'}
          </p>
        </div>

        {!user && !result && (
          <div
            style={{
              marginTop: '30px',
              padding: '30px',
              background: '#f6f4ef',
              textAlign: 'center',
              border:
                '1px solid #e3ddd3'
            }}
          >
            <p>
              {th
                ? 'กรุณาเข้าสู่ระบบด้วย LINE เพื่อยืนยันตัวตนก่อนเช็กอิน'
                : 'Please login with LINE to verify your identity before checking in.'}
            </p>

            <button
              onClick={
                handleCheckin
              }
              className="primaryContactBtn"
              style={{
                background: '#06c755',
                marginTop: '15px'
              }}
            >
              {th
                ? 'เข้าสู่ระบบด้วย LINE และเช็กอิน'
                : 'Login with LINE & Check In'}
            </button>
          </div>
        )}

        {user &&
          !result &&
          !error && (
            <div
              style={{
                marginTop: '30px',
                padding: '30px',
                textAlign: 'center',
                border:
                  '1px solid #e3ddd3'
              }}
            >
              <p>
                {th
                  ? `ยืนยันตัวตนแล้วในนาม ${user.name}`
                  : `Verified as ${user.name}`}
              </p>

              <button
                onClick={
                  handleCheckin
                }
                disabled={loading}
                className="primaryContactBtn"
                style={{
                  marginTop: '15px'
                }}
              >
                {loading
                  ? th
                    ? 'กำลังเช็กอิน...'
                    : 'Checking in...'
                  : th
                    ? 'ยืนยัน Check-in'
                    : 'Confirm Check-in'}
              </button>
            </div>
          )}

        {error && (
          <div
            style={{
              marginTop: '30px',
              padding: '25px',
              border:
                '1px solid #efc7c7',
              background: '#fff7f7',
              textAlign: 'center'
            }}
          >
            <h3
              style={{
                color: '#c62828'
              }}
            >
              {th
                ? 'ไม่สามารถเช็กอินได้'
                : 'Check-in unavailable'}
            </h3>

            <p>{error}</p>

            <button
              onClick={() =>
                goToPage(
                  'my-stays'
                )
              }
              className="primaryContactBtn"
              style={{
                marginTop: '15px'
              }}
            >
              {th
                ? 'ดูการเข้าพักของฉัน'
                : 'View My Stays'}
            </button>
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: '30px',
              padding: '35px',
              background: '#eef6ed',
              border:
                '1px solid #cfe4cc',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '50px'
              }}
            >
              ✓
            </div>

            <h2
              style={{
                color: '#2e7d32'
              }}
            >
              {th
                ? 'เช็กอินเรียบร้อยแล้ว'
                : 'Check-in Completed'}
            </h2>

            <p>
              <strong>
                {result.name}
              </strong>
            </p>

            <p>
              {result.startDate}
              {' → '}
              {result.endDate}
            </p>

            <p
              style={{
                marginTop: '20px'
              }}
            >
              {th
                ? 'กรุณาติดต่อเจ้าหน้าที่เพื่อรับการจัดสรรที่พักและคำแนะนำในการปฏิบัติธรรม'
                : 'Please contact monastery staff for accommodation assignment and retreat guidance.'}
            </p>

            <button
              onClick={() =>
                goToPage(
                  'my-stays'
                )
              }
              className="primaryContactBtn"
              style={{
                marginTop: '20px'
              }}
            >
              {th
                ? 'ดูสถานะการเข้าพักของฉัน'
                : 'View My Stay Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckinPage;