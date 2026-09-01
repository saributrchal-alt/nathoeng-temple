import React, { useState } from 'react';

function MyDashboard({
  lang,
  goToPage,
  user,
  handleLogout
}) {
  const th = lang === 'th';
  const [profileImageError, setProfileImageError] = useState(false);

  const services = [
    {
      key: 'stay-info',
      icon: '/icons/stay.svg',
      titleTh: 'เกี่ยวกับการเข้าพัก',
      titleEn: 'Retreat Stay Info',
      textTh: 'ข้อมูลที่ควรรู้ก่อนเข้าพักปฏิบัติธรรม',
      textEn: 'Important information before your retreat stay.',
      page: 'retreats-page'
    },
    {
      key: 'steps',
      icon: '/icons/lotus.svg',
      titleTh: 'ขั้นตอนการเข้าพัก',
      titleEn: 'Stay Process',
      textTh: 'ดูขั้นตอนการเข้าพักปฏิบัติธรรม',
      textEn: 'View the retreat stay process.',
      page: 'my-stays'
    },
    {
      key: 'prepare',
      icon: '/icons/dhamma-book.svg',
      titleTh: 'สิ่งที่ควรเตรียม',
      titleEn: 'What to Prepare',
      textTh: 'เตรียมตัวก่อนเดินทางมาปฏิบัติธรรม',
      textEn: 'Prepare before coming for your retreat.',
      page: 'retreats-page'
    },
    {
      key: 'map',
      icon: '/icons/location.svg',
      titleTh: 'แผนที่และการเดินทาง',
      titleEn: 'Map & Directions',
      textTh: 'ดูข้อมูลการเดินทางมายังวัด',
      textEn: 'View directions to the monastery.',
      page: 'contact-page'
    }
  ];

  return (
    <div className="nathoengDashboardPage">
      <div className="nathoengDashboard">

        <button
          type="button"
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

          <h1>{th ? 'บัญชีของฉัน' : 'My Account'}</h1>

          <p>
            {th
              ? 'ศูนย์รวมข้อมูลการเข้าพักปฏิบัติธรรม และบันทึกความจำการบริจาคของฉัน'
              : 'Your retreat stay information and donation memories in one place.'}
          </p>
        </div>

        <section className="dashboardProfileCard">
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
            <small>{th ? 'สมาชิก : โยมปฏิบัติ' : 'Member: Practitioner'}</small>
            <strong>{user?.name || (th ? 'สมาชิกนาเทิง' : 'Nathoeng Member')}</strong>
            <span>{th ? 'เชื่อมต่อบัญชี LINE แล้ว' : 'LINE account connected'}</span>
          </div>

          <div className="dashboardConnectedBadge">
            ✓ LINE Connected
          </div>
        </section>

        <section className="dashboardMainCard dashboardStayCard">
          <div className="dashboardSectionTop">
            <div>
              <span className="dashboardSectionEyebrow">
                {th ? 'เข้าพักปฏิบัติธรรม' : 'RETREAT STAY'}
              </span>
              <h2>
                {th ? 'สถานะการเข้าพักปฏิบัติธรรม' : 'Retreat Stay Status'}
              </h2>
            </div>

            <div className="dashboardSectionIcon">
              <img src="/icons/stay.svg" alt="" aria-hidden="true" />
            </div>
          </div>

          <div className="dashboardEmptyStay">
            <div className="dashboardEmptyStayIcon">
              <img src="/icons/meditation.svg" alt="" aria-hidden="true" />
            </div>

            <h3>{th ? 'ยังไม่มีรายการเข้าพัก' : 'No retreat stay yet'}</h3>

            <p>
              {th
                ? 'เริ่มต้นสร้างคำขอเข้าพักปฏิบัติธรรม เพื่อมาปฏิบัติธรรม ณ วัดพุทธอุทยานนาเทิง'
                : 'Create a retreat stay request to come and practise at Buddhist Park Monastery of Nathoeng.'}
            </p>

            <button
              type="button"
              className="dashboardPrimaryButton"
              onClick={() => goToPage('booking-page')}
            >
              <span>{th ? 'สร้างคำขอเข้าพักปฏิบัติธรรม' : 'Apply for a Retreat Stay'}</span>
              <small>{th ? 'เริ่มต้นการเข้าพักปฏิบัติธรรม' : 'Start your retreat stay'}</small>
              <strong aria-hidden="true">›</strong>
            </button>

            <button
              type="button"
              className="dashboardTextButton"
              onClick={() => goToPage('my-stays')}
            >
              {th ? 'ดูรายการเข้าพักของฉัน' : 'View my retreat stays'}
            </button>
          </div>
        </section>

        <section className="dashboardMainCard dashboardDonationCard">
          <div className="dashboardSectionTop">
            <div>
              <span className="dashboardSectionEyebrow">
                {th ? 'การร่วมบุญ' : 'DONATIONS'}
              </span>
              <h2>
                {th ? 'บันทึกความจำ การบริจาคของฉัน' : 'My Donation Memories'}
              </h2>
            </div>

            <div className="dashboardSectionIcon">
              <img src="/icons/donation.svg" alt="" aria-hidden="true" />
            </div>
          </div>

          <div className="dashboardDonationBody">
            <div>
              <span className="dashboardDonationLabel">
                {th ? 'ยอดการบริจาคของฉัน' : 'My total donations'}
              </span>
              <p>
                {th
                  ? 'ดูประวัติการบริจาคและโครงการที่ท่านเคยร่วมสนับสนุน'
                  : 'View your donation history and supported projects.'}
              </p>
            </div>

            <button
              type="button"
              className="dashboardSecondaryButton"
              onClick={() => goToPage('donation-list')}
            >
              {th ? 'ดูบันทึกการบริจาค' : 'View donation history'}
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </section>

        <section className="dashboardServicesSection">
          <div className="dashboardServicesHeading">
            <span className="dashboardSectionEyebrow">
              {th ? 'ข้อมูลและบริการ' : 'INFORMATION & SERVICES'}
            </span>
            <h2>{th ? 'บริการและข้อมูลที่สำคัญ' : 'Important Information'}</h2>
          </div>

          <div className="dashboardServicesGrid">
            {services.map((service) => (
              <button
                key={service.key}
                type="button"
                className="dashboardServiceCard"
                onClick={() => goToPage(service.page)}
              >
                <span className="dashboardServiceIcon">
                  <img src={service.icon} alt="" aria-hidden="true" />
                </span>

                <strong>{th ? service.titleTh : service.titleEn}</strong>
                <span>{th ? service.textTh : service.textEn}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboardContactCard">
          <div className="dashboardContactIcon">LINE</div>

          <div className="dashboardContactText">
            <span>{th ? 'ติดต่อวัด' : 'Contact the Monastery'}</span>
            <strong>LINE OA @nathoeng</strong>
            <p>
              {th
                ? 'สอบถามข้อมูลเพิ่มเติมผ่าน LINE Official Account'
                : 'Contact us through the LINE Official Account.'}
            </p>
          </div>

          <a
            className="dashboardLineButton"
            href="https://line.me/R/ti/p/@nathoeng"
            target="_blank"
            rel="noreferrer"
          >
            {th ? 'เปิด LINE' : 'Open LINE'}
          </a>
        </section>

        <button
          type="button"
          className="dashboardDhammaCard"
          onClick={() => goToPage('teachings-page')}
        >
          <img src="/icons/dhamma-book.svg" alt="" aria-hidden="true" />
          <div>
            <span>{th ? 'ธรรมะถึงฉัน' : 'Dhamma for Me'}</span>
            <strong>
              {th
                ? 'อ่านพระธรรมคำสอนและข้อคิดจากทางวัด'
                : 'Read Dhamma teachings and reflections.'}
            </strong>
          </div>
          <span aria-hidden="true">›</span>
        </button>

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

      <nav className="dashboardBottomNav" aria-label={th ? 'เมนูหลัก' : 'Main navigation'}>
        <button
          type="button"
          className="dashboardBottomNavItem"
          onClick={() => goToPage('home')}
        >
          <img src="/icons/home.svg" alt="" aria-hidden="true" />
          <span>{th ? 'หน้าแรก' : 'Home'}</span>
        </button>

        <button
          type="button"
          className="dashboardBottomNavItem"
          onClick={() => goToPage('my-stays')}
        >
          <img src="/icons/stay.svg" alt="" aria-hidden="true" />
          <span>{th ? 'เข้าพักปฏิบัติธรรม' : 'Retreat'}</span>
        </button>

        <button
          type="button"
          className="dashboardBottomNavItem active"
          aria-current="page"
        >
          <img src="/icons/contact.svg" alt="" aria-hidden="true" />
          <span>{th ? 'บัญชีของฉัน' : 'My Account'}</span>
        </button>

        <button
          type="button"
          className="dashboardBottomNavItem"
          onClick={() => goToPage('contact-page')}
        >
          <img src="/icons/location.svg" alt="" aria-hidden="true" />
          <span>{th ? 'ติดต่อวัด' : 'Contact'}</span>
        </button>
      </nav>
    </div>
  );
}

export default MyDashboard;
