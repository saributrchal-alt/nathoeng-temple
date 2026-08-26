import React from 'react';

function LoginPage({
  lang,
  goToPage,
  user,
  handleLineLogin,
  handleLogout
}) {
  const ADMIN_LINE_UID = 'Ucce7f0e73af42c1c1443c328d6e59cba';
  const isAdmin = user && user.lineUid === ADMIN_LINE_UID;

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{ maxWidth: '600px' }}
      >
        <button
          className="backButton"
          onClick={() => goToPage('home')}
        >
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>

        <span className="eyebrow">
          {lang === 'en' ? 'MEMBER SYSTEM' : 'ระบบสมาชิกวัด'}
        </span>

        <h1>
          {lang === 'en' ? 'Member Login' : 'เข้าสู่ระบบสมาชิก'}
        </h1>

        <p className="guideIntro">
          {lang === 'en'
            ? 'Login with your LINE account to manage your retreat bookings, donation history, and personal profile.'
            : 'เข้าสู่ระบบด้วยบัญชี LINE ของท่าน เพื่อจัดการข้อมูลการจองปฏิบัติธรรม ดูประวัติการทำบุญ และข้อมูลส่วนตัว'}
        </p>

        <div
          className="guideSectionBox"
          style={{
            background: '#fcfbfa',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #eeeae2'
          }}
        >
          <div
            style={{
              fontSize: '36px',
              marginBottom: '15px'
            }}
          >
            ☸
          </div>

          {user ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'center'
              }}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'LINE User'}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #eeeae2'
                  }}
                />
              ) : null}

              <h3
                style={{
                  margin: 0,
                  color: '#302d29'
                }}
              >
                {lang === 'en'
                  ? 'Welcome, ' + (user.name || 'Member')
                  : 'ยินดีต้อนรับ, ' + (user.name || 'สมาชิก')}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: '#625d55',
                  fontSize: '14px'
                }}
              >
                {lang === 'en'
                  ? 'You are successfully logged in with LINE.'
                  : 'ท่านได้เข้าสู่ระบบสมาชิกของวัดผ่าน LINE เรียบร้อยแล้ว'}
              </p>

              {isAdmin ? (
                <>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f6f4ef',
                      color: '#9b7226',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {lang === 'en'
                      ? 'Administrator Account'
                      : 'บัญชีผู้ดูแลระบบ'}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToPage('admin-dashboard')}
                    className="primaryContactBtn"
                    style={{
                      background: '#9b7226',
                      border: 'none',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    {lang === 'en'
                      ? '⚙ Go to Admin Dashboard'
                      : '⚙ ไปยังหน้าแผงควบคุมผู้ดูแลระบบ'}
                  </button>
                </>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f6f4ef',
                    color: '#625d55',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  {lang === 'en'
                    ? 'Standard Member Account'
                    : 'บัญชีสมาชิกทั่วไป'}
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: '#736f66',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {lang === 'en' ? 'Logout' : 'ออกจากระบบ'}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                onClick={handleLineLogin}
                style={{
                  background: '#06c755',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '25px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(6, 199, 85, 0.2)',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <span>●</span>
                <span>
                  {lang === 'en'
                    ? 'Login with LINE'
                    : 'เข้าสู่ระบบด้วย LINE'}
                </span>
              </button>

              <p
                style={{
                  fontSize: '13px',
                  color: '#625d55',
                  margin: 0,
                  lineHeight: '1.6'
                }}
              >
                {lang === 'en'
                  ? 'LINE is used to verify your identity before booking a monastery stay or accessing member services.'
                  : 'ระบบจะใช้บัญชี LINE เพื่อยืนยันตัวตนก่อนทำรายการจองเข้าพักและใช้บริการสมาชิกของวัด'}
              </p>

              <p
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginTop: '5px',
                  lineHeight: '1.6'
                }}
              >
                {lang === 'en'
                  ? 'By logging in, you accept our privacy policy and terms.'
                  : 'การเข้าสู่ระบบถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการใช้งานของทางวัด'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;