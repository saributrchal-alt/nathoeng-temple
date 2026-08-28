import React from 'react';

function MyDashboard({
  lang,
  goToPage,
  user,
  handleLogout
}) {
  const th = lang === 'th';

  if (!user) {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '760px',
            textAlign: 'center'
          }}
        >
          <h1>
            {th
              ? 'บัญชีของฉัน'
              : 'My Dashboard'}
          </h1>

          <p>
            {th
              ? 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนใช้งาน'
              : 'Please log in with LINE to continue.'}
          </p>

          <button
            className="primaryContactBtn"
            onClick={() =>
              goToPage('login-page')
            }
          >
            {th
              ? 'เข้าสู่ระบบ'
              : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: '🌿',
      title: th
        ? 'การเข้าพักของฉัน'
        : 'My Retreat Stays',
      description: th
        ? 'ดูการจอง สถานะการเข้าพัก และขั้นตอนการปฏิบัติธรรม'
        : 'View your bookings, stay status and retreat journey.',
      page: 'my-stays'
    },
    {
      icon: '🙏',
      title: th
        ? 'การทำบุญของฉัน'
        : 'My Donations',
      description: th
        ? 'ดูประวัติการร่วมบุญและการบริจาคของท่าน'
        : 'View your personal donation history.',
      page: 'my-donations',
      comingSoon: true
    },
    {
      icon: '☸',
      title: th
        ? 'ธรรมะถึงฉัน'
        : 'Dhamma for Me',
      description: th
        ? 'อ่านข้อความธรรมะที่พระอาจารย์ส่งถึงท่านโดยเฉพาะ'
        : 'Read personal Dhamma messages sent to you.',
      page: 'my-dhamma',
      comingSoon: true
    },
    {
      icon: '🪷',
      title: th
        ? 'จองเข้าปฏิบัติธรรม'
        : 'Book a Retreat Stay',
      description: th
        ? 'ส่งคำขอเข้าพักและปฏิบัติธรรมที่วัด'
        : 'Request a stay for meditation practice.',
      page: 'booking-page'
    },
    {
      icon: '▣',
      title: th
        ? 'ลงทะเบียนเมื่อมาถึงวัด'
        : 'QR Check-in',
      description: th
        ? 'สแกน QR Code เพื่อลงทะเบียนเมื่อเดินทางมาถึงวัด'
        : 'Scan the QR code when you arrive at the monastery.',
      page: 'checkin-page'
    },
    {
      icon: '👤',
      title: th
        ? 'ข้อมูลบัญชี'
        : 'My Profile',
      description: th
        ? 'ข้อมูลบัญชี LINE และสถานะโยมปฏิบัติ'
        : 'Your LINE account and practitioner information.',
      page: 'login-page'
    }
  ];

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

        <span className="eyebrow">
          NATHOENG CONNECT
        </span>

        <h1>
          {th
            ? 'บัญชีของฉัน'
            : 'My Dashboard'}
        </h1>

        <p className="guideIntro">
          {th
            ? 'พื้นที่ส่วนตัวสำหรับโยมปฏิบัติ วัดพุทธอุทยานนาเทิง'
            : 'Your personal space at Buddhist Park Monastery of Nathoeng.'}
        </p>

        {/* PROFILE */}
        <div
          style={{
            marginTop: '30px',
            padding: '24px',
            background: '#f6f4ef',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap'
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
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#e7e1d5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px'
              }}
            >
              👤
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '12px',
                color: '#9b7226',
                fontWeight: '600',
                marginBottom: '4px'
              }}
            >
              {th
                ? 'โยมปฏิบัติ'
                : 'PRACTITIONER'}
            </div>

            <h2
              style={{
                margin: 0,
                color: '#302d29'
              }}
            >
              {user.name || '-'}
            </h2>

            <div
              style={{
                marginTop: '6px',
                color: '#625d55',
                fontSize: '13px'
              }}
            >
              LINE Connected ✓
            </div>
          </div>

          {user.isAdmin && (
            <button
              className="primaryContactBtn"
              onClick={() =>
                goToPage('admin-dashboard')
              }
            >
              {th
                ? 'ระบบผู้ดูแล'
                : 'Admin Dashboard'}
            </button>
          )}
        </div>

        {/* MENU */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '18px',
            marginTop: '30px'
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                if (!item.comingSoon) {
                  goToPage(item.page);
                }
              }}
              style={{
                background: '#fff',
                border: '1px solid #e5dfd4',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'left',
                cursor: item.comingSoon
                  ? 'default'
                  : 'pointer',
                opacity: item.comingSoon
                  ? 0.65
                  : 1,
                minHeight: '165px'
              }}
            >
              <div
                style={{
                  fontSize: '30px',
                  marginBottom: '14px'
                }}
              >
                {item.icon}
              </div>

              <h3
                style={{
                  margin: '0 0 8px',
                  color: '#302d29'
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: '#625d55',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              >
                {item.description}
              </p>

              {item.comingSoon && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#9b7226',
                    fontWeight: '600'
                  }}
                >
                  {th
                    ? 'กำลังเปิดใช้งาน'
                    : 'COMING SOON'}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <div
          style={{
            marginTop: '35px',
            paddingTop: '25px',
            borderTop: '1px solid #eeeae2',
            textAlign: 'center'
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #aaa49a',
              color: '#625d55',
              padding: '10px 22px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {th
              ? 'ออกจากระบบ'
              : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyDashboard;