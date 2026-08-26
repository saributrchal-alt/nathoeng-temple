import React from 'react';

function LoginPage({ lang, goToPage, user, handleLogout }) {
  
  // 🟢 ฟังก์ชันเชื่อมต่อ LINE Login ของจริง (ใช้งานจริงบนเว็บหลัก)
  const handleRealLineLogin = () => {
    const CHANNEL_ID = 'YOUR_LINE_CHANNEL_ID'; // ใส่ Channel ID ของ LINE Login ที่ทางวัดสมัครไว้
    const REDIRECT_URI = window.location.origin + window.location.pathname;
    const STATE = 'security_state_string';

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CHANNEL_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}&scope=profile%20openid%20email`;

    // พาเบราว์เซอร์พุ่งไปหน้าสแกน LINE Login ของจริงทันที
    window.location.href = lineAuthUrl;
  };

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '600px' }}>
        <button className="backButton" onClick={() => goToPage('home')}>
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>

        <span className="eyebrow">{lang === 'en' ? 'MEMBER SYSTEM' : 'ระบบสมาชิกวัด'}</span>
        <h1>{lang === 'en' ? 'Member Login' : 'เข้าสู่ระบบสมาชิก'}</h1>
        <p className="guideIntro">
          {lang === 'en'
            ? 'Login with your LINE account to manage your retreat bookings, donation history, and personal profile.'
            : 'เข้าสู่ระบบด้วยบัญชี LINE ของท่าน เพื่อจัดการข้อมูลการจองปฏิบัติธรรม ดูประวัติการทำบุญ และข้อมูลส่วนตัว'}
        </p>

        <div className="guideSectionBox" style={{ background: '#fcfbfa', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eeeae2' }}>
          <div style={{ fontSize: '36px', marginBottom: '15px' }}>☸</div>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #06c755' }} 
                />
              )}
              <h3 style={{ margin: 0, color: '#302d29' }}>
                {lang === 'en' ? `Welcome, ${user.name}` : `ยินดีต้อนรับ, ${user.name}`}
              </h3>
              <p style={{ margin: 0, color: '#625d55', fontSize: '14px' }}>
                {lang === 'en' ? 'You are successfully logged in via LINE.' : 'ท่านได้เข้าสู่ระบบสมาชิกของวัดผ่าน LINE เรียบร้อยแล้ว'}
              </p>

              {/* ปุ่มเปิดหน้าแอดมิน (จะแสดงก็ต่อเมื่อ LINE UID ตรงกับของพระอาจารย์เป๊ะๆ เท่านั้น) */}
              {user.lineUid === 'Ucce7f0e73af42c1c1443c328d6e59cba' ? (
                <button 
                  onClick={() => goToPage('admin-dashboard')} 
                  className="primaryContactBtn" 
                  style={{ background: '#9b7226', border: 'none', padding: '12px 24px', cursor: 'pointer', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
                >
                  {lang === 'en' ? '⚙️ Go to Admin Dashboard' : '⚙️ ไปยังหน้าแผงควบคุมผู้ดูแลระบบ'}
                </button>
              ) : (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                  {lang === 'en' ? '(Standard Member Account)' : '(บัญชีสมาชิกทั่วไป)'}
                </p>
              )}

              <button 
                onClick={handleLogout} 
                style={{ background: '#736f66', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
              >
                {lang === 'en' ? 'Logout' : 'ออกจากระบบ'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              
              {/* ปุ่มเข้าสู่ระบบด้วย LINE ของจริง */}
              <button 
                onClick={handleRealLineLogin}
                style={{ 
                  background: '#06c755', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '14px 28px', 
                  borderRadius: '30px', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 10px rgba(6, 199, 85, 0.3)'
                }}
              >
                🟢 {lang === 'en' ? 'Login with LINE' : 'เข้าสู่ระบบด้วย LINE'}
              </button>

              <p style={{ fontSize: '12px', color: '#888', marginTop: '10px', maxWidth: '400px', lineHeight: '1.5' }}>
                {lang === 'en' ? 'By logging in, you accept our privacy policy and terms.' : 'การเข้าสู่ระบบถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการใช้งานของทางวัด'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginPage;