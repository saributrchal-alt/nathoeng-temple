import React from 'react';

function LoginPage({ lang, goToPage, user, handleLogout }) {
  
  // 🔐 ฟังก์ชันจำลองการเข้าสู่ระบบสำหรับพระอาจารย์ (ล็อก UID จริงไว้ที่นี่)
  const handleMockAdminLogin = () => {
    const adminUser = {
      name: 'พระอาจารย์เฉลิมพล (ผู้ดูแลระบบ)',
      lineUid: 'Ucce7f0e73af42c1c1443c328d6e59cba', // LINE UID จริงของพระอาจารย์
      picture: ''
    };
    localStorage.setItem('line_user', JSON.stringify(adminUser));
    alert(lang === 'th' ? 'เข้าสู่ระบบในฐานะผู้ดูแลระบบ (พระอาจารย์) เรียบร้อย' : 'Logged in as Admin successfully');
    window.location.reload();
  };

  // 👤 ฟังก์ชันจำลองการเข้าสู่ระบบสำหรับโยมทั่วไป (UID ปลอมที่ไม่ใช่แอดมิน)
  const handleMockMemberLogin = () => {
    const memberUser = {
      name: 'ญาติโยม (สมาชิกทั่วไป)',
      lineUid: 'U_normal_user_123456789', // UID จำลองของคนทั่วไป (จะไม่มีสิทธิ์เข้าหน้าแอดมิน)
      picture: ''
    };
    localStorage.setItem('line_user', JSON.stringify(memberUser));
    alert(lang === 'th' ? 'เข้าสู่ระบบในฐานะสมาชิกทั่วไปเรียบร้อย' : 'Logged in as Member successfully');
    window.location.reload();
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
              <h3 style={{ margin: 0, color: '#302d29' }}>
                {lang === 'en' ? `Welcome, ${user.name}` : `ยินดีต้อนรับ, ${user.name}`}
              </h3>
              <p style={{ margin: 0, color: '#625d55', fontSize: '14px' }}>
                {lang === 'en' ? 'You are successfully logged in via LINE.' : 'ท่านได้เข้าสู่ระบบสมาชิกของวัดผ่าน LINE เรียบร้อยแล้ว'}
              </p>

              {/* เงื่อนไขแสดงปุ่มไปหน้าแอดมินเฉพาะ LINE UID ของพระอาจารย์เท่านั้น */}
              {user.lineUid === 'Ucce7f0e73af42c1c1443c328d6e59cba' ? (
                <button 
                  onClick={() => goToPage('admin-dashboard')} 
                  className="primaryContactBtn" 
                  style={{ background: '#9b7226', border: 'none', padding: '12px 24px', cursor: 'pointer', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
                >
                  {lang === 'en' ? '⚙️ Go to Admin Dashboard' : '⚙️ ไปยังหน้าแผงควบคุมแอดมิน'}
                </button>
              ) : (
                <p style={{ color: '#d32f2f', fontSize: '13px', margin: 0 }}>
                  {lang === 'en' ? '(Standard Member Account - No Admin Access)' : '(บัญชีสมาชิกทั่วไป - ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล)'}
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
              
              {/* ปุ่มสำหรับพระอาจารย์ (มี UID แอดมินจริง) */}
              <button 
                onClick={handleMockAdminLogin}
                style={{ 
                  background: '#06c755', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '25px', 
                  fontSize: '15px', 
                  fontWeight: '500', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(6, 199, 85, 0.2)'
                }}
              >
                🟢 {lang === 'en' ? 'Login as Abbot (Admin)' : 'เข้าสู่ระบบ LINE (สำหรับพระอาจารย์เฉลิมพล)'}
              </button>

              {/* ปุ่มสำหรับโยมทั่วไป (มี UID ปลอม ซึ่งจะเข้าหน้าแอดมินไม่ได้แน่นอน) */}
              <button 
                onClick={handleMockMemberLogin}
                style={{ 
                  background: '#555', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '25px', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                👤 {lang === 'en' ? 'Login as General Member' : 'เข้าสู่ระบบ LINE (สมาชิกทั่วไป)'}
              </button>

              <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
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