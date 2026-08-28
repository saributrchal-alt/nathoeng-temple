import React, { useState } from 'react';

function MyDashboard({
  lang,
  goToPage,
  user,
  handleLogout
}) {
  const th = lang === 'th';
  const [profileImageError, setProfileImageError] = useState(false);

  const actions = [
    {
      key: 'stays',
      icon: '/icons/stay.svg',
      titleTh: 'การเข้าพักของฉัน',
      titleEn: 'My Retreat Stays',
      textTh: 'ดูคำขอ สถานะการเข้าพัก และขั้นตอนการปฏิบัติธรรม',
      textEn: 'View requests, stay status and retreat progress.',
      page: 'my-stays'
    },
    {
      key: 'donations',
      icon: '/icons/donation.svg',
      titleTh: 'การทำบุญของฉัน',
      titleEn: 'My Donations',
      textTh: 'ดูประวัติการร่วมบุญและการบริจาคของท่าน',
      textEn: 'View your donation and merit-making history.',
      page: 'donation-list'
    },
    {
      key: 'dhamma',
      icon: '/icons/dhamma-book.svg',
      titleTh: 'ธรรมะถึงฉัน',
      titleEn: 'Dhamma for Me',
      textTh: 'อ่านข้อคิดธรรมะและพระธรรมคำสอนจากทางวัด',
      textEn: 'Read Dhamma reflections and monastery teachings.',
      page: 'teachings-page'
    },
    {
      key: 'book',
      icon: '/icons/lotus.svg',
      titleTh: 'จองเข้าปฏิบัติธรรม',
      titleEn: 'Apply for a Retreat Stay',
      textTh: 'ส่งคำขอเข้าพักและปฏิบัติธรรมที่วัด',
      textEn: 'Submit a request to stay and practice at the monastery.',
      page: 'booking-page'
    },
    {
      key: 'arrival',
      icon: '/icons/location.svg',
      titleTh: 'ลงทะเบียนเมื่อมาถึงวัด',
      titleEn: 'Register on Arrival',
      textTh: 'สแกน QR Code เพื่อลงทะเบียนเมื่อเดินทางมาถึง',
      textEn: 'Scan the QR code to register when you arrive.',
      page: 'checkin-page'
    },
    {
      key: 'account',
      icon: '/icons/contact.svg',
      titleTh: 'ข้อมูลบัญชี',
      titleEn: 'Account Information',
      textTh: 'ข้อมูลบัญชี LINE และสถานะเชื่อมต่อของท่าน',
      textEn: 'Your LINE account and connection information.',
      page: 'login-page'
    }
  ];

  return (
    <div className="nathoengDashboardPage">
      <div className="nathoengDashboard">
        <button
          className="backButton"
          onClick={() => goToPage('home')}
        >
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>

        <div className="dashboardHero">
          <img
            src="/icons/lotus.svg"
            alt=""
            className="dashboardHeroIcon"
            aria-hidden="true"
          />

          <span className="eyebrow">
            NATHOENG CONNECT
          </span>

          <h1>
            {th ? 'บัญชีของฉัน' : 'My Account'}
          </h1>

          <p>
            {th
              ? 'พื้นที่ส่วนตัวสำหรับโยมผู้ใช้วัดพุทธอุทยานนาเทิง'
              : 'Your personal area for Buddhist Park Monastery of Nathoeng.'}
          </p>
        </div>

        <div className="dashboardProfileCard">
          <div className="dashboardProfileAvatar">
            {user?.picture && !profileImageError ? (
              <img
                src={user.picture}
                alt={user?.name || ''}
                referrerPolicy="no-referrer"
                onError={() => setProfileImageError(true)}
                className="dashboardProfileImage"
              />
            ) : (
              <img
                src="/icons/meditation.svg"
                alt=""
                aria-hidden="true"
                className="dashboardProfileFallback"
              />
            )}
          </div>

          <div className="dashboardProfileText">
            <small>
              {th ? 'โยมปฏิบัติ' : 'Practitioner'}
            </small>

            <strong>
              {user?.name || (th ? 'สมาชิกนาเทิง' : 'Nathoeng Member')}
            </strong>

            <span>
              {th ? 'เชื่อมต่อบัญชี LINE แล้ว' : 'LINE account connected'}
            </span>
          </div>

          <div className="dashboardConnectedBadge">
            ✓ LINE Connected
          </div>
        </div>

        <div className="dashboardGrid">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="dashboardActionCard"
              onClick={() => goToPage(action.page)}
            >
              <span className="dashboardActionIconWrap">
                <img
                  src={action.icon}
                  alt=""
                  aria-hidden="true"
                />
              </span>

              <h3>
                {th ? action.titleTh : action.titleEn}
              </h3>

              <p>
                {th ? action.textTh : action.textEn}
              </p>
            </button>
          ))}
        </div>

        <div className="dashboardDivider" aria-hidden="true">
          <span></span>
          <img src="/icons/lotus.svg" alt="" />
          <span></span>
        </div>

        <div className="dashboardLogoutWrap">
          <button
            type="button"
            className="dashboardLogoutBtn"
            onClick={handleLogout}
          >
            {th ? 'ออกจากระบบ' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyDashboard;
