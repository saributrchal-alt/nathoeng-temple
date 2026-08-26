import React from 'react';

export default function LoginPage({ lang, goToPage, user, handleLogout }) {
  const text = {
    en: {
      back: '← Back to Home',
      eyebrow: 'MEMBER SYSTEM',
      title: 'Monastery Member Login',
      intro: 'Access your meditation retreat bookings, view donation history, and manage your profile using your LINE account.',
      loginBtn: 'Login with LINE',
      adminLoginBtn: 'Login as Admin (Chaloempol)',
      welcome: 'Welcome back,',
      loggedInDesc: 'You are successfully logged in as a monastery member via LINE.',
      logoutBtn: 'Logout',
      notice: 'By logging in, you agree to our Privacy Policy and Terms & Conditions.'
    },
    th: {
      back: '← กลับสู่หน้าหลัก',
      eyebrow: 'ระบบสมาชิกวัด',
      title: 'เข้าสู่ระบบสมาชิก',
      intro: 'เข้าสู่ระบบด้วยบัญชี LINE ของท่าน เพื่อจัดการข้อมูลการจองปฏิบัติธรรม ดูประวัติการทำบุญ และข้อมูลส่วนตัว',
      loginBtn: 'เข้าสู่ระบบด้วย LINE (สมาชิกทั่วไป)',
      adminLoginBtn: '🟢 เข้าสู่ระบบด้วย LINE (สำหรับพระอาจารย์เฉลิมพล)',
      welcome: 'ยินดีต้อนรับ,',
      loggedInDesc: 'ท่านได้เข้าสู่ระบบสมาชิกของวัดผ่าน LINE เรียบร้อยแล้ว',
      logoutBtn: 'ออกจากระบบ',
      notice: 'การเข้าสู่ระบบถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการใช้งานของทางวัด'
    }
  }

  const t = text[lang]

  // สำหรับโยมทั่วไป (ไม่ใช่แอดมิน)
  const handleGeneralLogin = () => {
    const generalUser = {
      name: 'คุณโยม (สาธุชนทั่วไป)',
      lineUid: 'U_GENERAL_PUBLIC_123',
      isAdmin: false,
      picture: ''
    };
    localStorage.setItem('line_user', JSON.stringify(generalUser));
    alert(lang === 'th' ? 'เข้าสู่ระบบสมาชิกเรียบร้อยแล้ว' : 'Logged in successfully');
    window.location.reload();
  };

  // สำหรับพระอาจารย์ (แอดมินที่มี LINE UID ถูกต้อง)
  const handleAdminLogin = () => {
    const adminUser = {
      name: 'Chaloempol',
      lineUid: 'Ucce7f0e73af42c1c1443c328d6e59cba',
      isAdmin: true,
      picture: ''
    };
    localStorage.setItem('line_user', JSON.stringify(adminUser));
    alert(lang === 'th' ? 'เข้าสู่ระบบในฐานะผู้ดูแลระบบ (พระอาจารย์) เรียบร้อย' : 'Logged in as Admin successfully');
    window.location.reload();
  };

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <button className="backButton" onClick={() => goToPage('home')} style={{ float: 'left' }}>
          {t.back}
        </button>
        
        <div style={{ clear: 'both', paddingTop: '20px' }}>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p className="guideIntro" style={{ marginBottom: '35px' }}>{t.intro}</p>

          <div className="guideSectionBox" style={{ background: '#fcfbfa', padding: '40px 30px', borderRadius: '8px', border: '1px solid #eeeae2', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt="Profile" 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #06c755' }} 
                  />
                )}
                <h3 style={{ color: '#302d29', margin: 0 }}>{t.welcome} {user.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{t.loggedInDesc}</p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {user.lineUid === 'Ucce7f0e73af42c1c1443c328d6e59cba' && (
                    <button 
                      onClick={() => goToPage('admin-dashboard')}
                      style={{ background: '#9b7226', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                    >
                      {lang === 'th' ? '⚙️ ไปยังหน้าแผงควบคุมแอดมิน' : '⚙️ Go to Admin Dashboard'}
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    style={{ background: '#736f66', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {t.logoutBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '5px' }}>☸</div>
                
                {/* ปุ่มสำหรับพระอาจารย์ (ล็อกอินด้วย LINE ของแอดมิน) */}
                <button
                  onClick={handleAdminLogin}
                  style={{
                    background: '#06c755',
                    color: '#fff',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 10px rgba(6, 199, 85, 0.3)',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  🟢 {t.adminLoginBtn}
                </button>

                {/* ปุ่มสำหรับญาติโยมทั่วไป */}
                <button
                  onClick={handleGeneralLogin}
                  style={{
                    background: '#555',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  👤 {t.loginBtn}
                </button>

                <p style={{ fontSize: '12px', color: '#888', maxWidth: '400px', lineHeight: '1.5', margin: 0 }}>
                  {t.notice}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}