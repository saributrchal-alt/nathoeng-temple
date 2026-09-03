import React, { useEffect, useState } from 'react';

function MyDashboard({
  lang,
  goToPage,
  user,
  handleLogout
}) {
  const th = lang === 'th';
  const [profileImageError, setProfileImageError] = useState(false);
  const [verifiedFullName, setVerifiedFullName] = useState('');
  const [identityLoading, setIdentityLoading] = useState(Boolean(user));
  const [donationLoading, setDonationLoading] = useState(true);
  const [donationSummary, setDonationSummary] = useState({
    moneyTotal: 0,
    moneyCount: 0,
    itemCount: 0,
    latestAt: null
  });

  useEffect(() => {
    if (!user) {
      setVerifiedFullName('');
      setIdentityLoading(false);
      return;
    }

    let cancelled = false;

    const loadIdentityProfile = async () => {
      setIdentityLoading(true);

      try {
        const response = await fetch('/api/donation-profile', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to load identity profile'
          );
        }

        if (cancelled) return;

        if (
          data.donationProfileComplete === true &&
          data.fullName
        ) {
          setVerifiedFullName(
            String(data.fullName).trim()
          );
        } else {
          setVerifiedFullName('');
        }
      } catch (error) {
        console.error(
          'MyDashboard identity profile error:',
          error
        );

        if (!cancelled) {
          setVerifiedFullName('');
        }
      } finally {
        if (!cancelled) {
          setIdentityLoading(false);
        }
      }
    };

    loadIdentityProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.memberId]);

  useEffect(() => {
    if (!user) {
      setDonationLoading(false);
      return;
    }

    let cancelled = false;

    const loadDonationSummary = async () => {
      setDonationLoading(true);

      try {
        const response = await fetch('/api/donation', {
          method: 'GET',
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to load donations'
          );
        }

        if (cancelled) return;

        const donations = Array.isArray(data.donations)
          ? data.donations
          : [];

        const moneyDonations = donations.filter(
          (item) => item.donation_type === 'money'
        );

        const itemDonations = donations.filter(
          (item) => item.donation_type === 'item'
        );

        const moneyTotal = moneyDonations.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

        const latest = donations[0] || null;

        setDonationSummary({
          moneyTotal,
          moneyCount: moneyDonations.length,
          itemCount: itemDonations.length,
          latestAt:
            latest?.donation_date ||
            latest?.created_at ||
            null
        });
      } catch (error) {
        console.error(
          'MyDashboard donation summary error:',
          error
        );

        if (!cancelled) {
          setDonationSummary({
            moneyTotal: 0,
            moneyCount: 0,
            itemCount: 0,
            latestAt: null
          });
        }
      } finally {
        if (!cancelled) {
          setDonationLoading(false);
        }
      }
    };

    loadDonationSummary();

    return () => {
      cancelled = true;
    };
  }, [user?.memberId]);

  const moneyTotalText = donationLoading
    ? '—'
    : donationSummary.moneyTotal.toLocaleString(
        th ? 'th-TH' : 'en-US',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      );

  const latestDonationText = donationLoading
    ? '—'
    : donationSummary.latestAt
      ? new Intl.DateTimeFormat(
          th ? 'th-TH' : 'en-GB',
          {
            day: 'numeric',
            month: 'short',
            timeZone: 'Asia/Bangkok'
          }
        ).format(new Date(donationSummary.latestAt))
      : '—';

  const services = [
    {
      key: 'stay-info',
      icon: '/icons/stay.svg',
      titleTh: 'เกี่ยวกับการเข้าพัก',
      titleEn: 'Stay Info',
      page: 'visit-guide'
    },
    {
      key: 'steps',
      icon: '/icons/lotus.svg',
      titleTh: 'ขั้นตอนการเข้าพัก',
      titleEn: 'Stay Process',
      page: 'stay-process'
    },
    {
      key: 'prepare',
      icon: '/icons/dhamma-book.svg',
      titleTh: 'สิ่งที่ควรเตรียม',
      titleEn: 'What to Prepare',
      page: 'prepare-stay'
    },
    {
      key: 'map',
      icon: '/icons/location.svg',
      titleTh: 'แผนที่การเดินทาง',
      titleEn: 'Directions',
      page: 'contact-page'
    }
  ];

  return (
    <div className="nathoengDashboardPage compactAccountPage">
      <div className="nathoengDashboard compactAccountDashboard">

        <button
          type="button"
          className="backButton compactBackButton"
          onClick={() => goToPage('home')}
        >
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>

        <div className="compactAccountHero">
          <span className="eyebrow">NATHOENG CONNECT</span>
          <h1>{th ? 'บัญชีของฉัน' : 'My Account'}</h1>
          <p>
            {th
              ? 'ข้อมูลส่วนตัว การเข้าพักปฏิบัติธรรม และบันทึกการร่วมบุญ'
              : 'Your profile, retreat stay, and donation memories.'}
          </p>
        </div>

        <section className="compactProfileCard">
          <div className="compactProfileAvatar">
            {user?.picture && !profileImageError ? (
              <img
                src={user.picture}
                alt={verifiedFullName || user?.name || ''}
                referrerPolicy="no-referrer"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <img
                src="/icons/meditation.svg"
                alt=""
                aria-hidden="true"
                className="compactProfileFallback"
              />
            )}
          </div>

          <div className="compactProfileInfo">
            <small>{th ? 'สมาชิก : โยมปฏิบัติ' : 'Member: Practitioner'}</small>
            <strong>
              {identityLoading
                ? (th ? 'กำลังตรวจสอบข้อมูล...' : 'Checking identity...')
                : verifiedFullName ||
                  user?.name ||
                  (th ? 'สมาชิกนาเทิง' : 'Nathoeng Member')}
            </strong>
            <span>
              {verifiedFullName
                ? (th
                    ? '✓ ข้อมูลยืนยันตัวตนจาก Nathoeng Connect'
                    : '✓ Verified identity from Nathoeng Connect')
                : `✓ ${th ? 'เชื่อมต่อบัญชี LINE แล้ว' : 'LINE connected'}`}
            </span>
          </div>
        </section>

        <section className="compactSummaryCard compactDonationSummary">
          <div className="compactCardHead">
            <div>
              <span className="compactEyebrow">{th ? 'บันทึกความจำ' : 'MEMORIES'}</span>
              <h2>{th ? 'การบริจาคของฉัน' : 'My Donations'}</h2>
            </div>

            <button
              type="button"
              className="compactViewButton"
              onClick={() => goToPage('donation-list')}
            >
              {th ? 'ดูทั้งหมด' : 'View all'} ›
            </button>
          </div>

          <div className="compactDonationAmount">
            <span>{th ? 'ยอดการบริจาคของฉัน' : 'My donation total'}</span>
            <strong>{moneyTotalText} <small>{th ? 'บาท' : 'THB'}</small></strong>
          </div>

          <div className="compactStatsRow">
            <div>
              <img src="/icons/donation.svg" alt="" aria-hidden="true" />
              <strong>{donationLoading ? '—' : donationSummary.moneyCount}</strong>
              <span>{th ? 'ครั้งที่ทำบุญเป็นเงิน' : 'Money donations'}</span>
            </div>

            <div>
              <img src="/icons/lotus.svg" alt="" aria-hidden="true" />
              <strong>{donationLoading ? '—' : donationSummary.itemCount}</strong>
              <span>{th ? 'รายการสิ่งของถวาย' : 'Items offered'}</span>
            </div>

            <div>
              <img src="/icons/calendar.svg" alt="" aria-hidden="true" />
              <strong>{latestDonationText}</strong>
              <span>{th ? 'รายการล่าสุด' : 'Latest'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToPage('donation-page')}
            style={{
              width: '100%',
              minHeight: '50px',
              marginTop: '16px',
              borderRadius: '14px',
              border: '1px solid #b1842b',
              background: '#fffdf8',
              color: '#9b7226',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            ＋ {th ? 'ทำรายการบริจาคเพิ่ม' : 'Make Another Donation'}
          </button>
        </section>

        <section className="compactSummaryCard compactStaySummary">
          <div className="compactCardHead">
            <div>
              <span className="compactEyebrow">{th ? 'เข้าพักปฏิบัติธรรม' : 'RETREAT STAY'}</span>
              <h2>{th ? 'สถานะการเข้าพักของฉัน' : 'My Retreat Stay'}</h2>
            </div>

            <img
              className="compactHeadIcon"
              src="/icons/stay.svg"
              alt=""
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            className="compactStayAction"
            onClick={() => goToPage('my-stays')}
          >
            <span className="compactStayActionIcon">
              <img src="/icons/meditation.svg" alt="" aria-hidden="true" />
            </span>

            <span className="compactStayActionText">
              <strong>{th ? 'ดูการเข้าพักปฏิบัติธรรมของฉัน' : 'View my retreat stay'}</strong>
              <small>
                {th
                  ? 'ตรวจสอบคำขอ สถานะ และขั้นตอนการเข้าพัก'
                  : 'Check requests, status, and retreat progress.'}
              </small>
            </span>

            <span className="compactArrow" aria-hidden="true">›</span>
          </button>

          <button
            type="button"
            onClick={() => goToPage('booking-page')}
            style={{
              width: '100%',
              minHeight: '50px',
              marginTop: '16px',
              borderRadius: '14px',
              border: '1px solid #b1842b',
              background: '#fffdf8',
              color: '#9b7226',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            ＋ {th ? 'ทำรายการเข้าพักปฏิบัติธรรม' : 'Make a Retreat Stay Request'}
          </button>
        </section>

        <section className="compactServicesSection">
          <div className="compactSectionTitle">
            <span>{th ? 'บริการและข้อมูลสำคัญ' : 'Information & Services'}</span>
          </div>

          <div className="compactServicesGrid">
            {services.map((service) => (
              <button
                key={service.key}
                type="button"
                className="compactServiceItem"
                onClick={() => goToPage(service.page)}
              >
                <span className="compactServiceIcon">
                  <img src={service.icon} alt="" aria-hidden="true" />
                </span>
                <span>{th ? service.titleTh : service.titleEn}</span>
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="compactDhammaStrip"
          onClick={() => goToPage('practice-messages')}
        >
          <img src="/icons/dhamma-book.svg" alt="" aria-hidden="true" />
          <span>
            <strong>
              {th
                ? 'เนื้อหาปฏิบัติถึงฉัน'
                : 'Practice Messages for Me'}
            </strong>
            <small>
              {th
                ? 'อ่านข้อความและแนวทางปฏิบัติจากพระอาจารย์'
                : 'Read one-way practice guidance from the teacher'}
            </small>
          </span>
          <span aria-hidden="true">›</span>
        </button>

        <section className="compactContactStrip">
          <div className="compactContactLeft">
            <span className="compactContactIcon">LINE</span>
            <div>
              <strong>{th ? 'ติดต่อวัด' : 'Contact the Monastery'}</strong>
              <small>LINE OA @nathoeng</small>
            </div>
          </div>

          <a
            className="compactLineButton"
            href="https://line.me/R/ti/p/@nathoeng"
            target="_blank"
            rel="noreferrer"
          >
            LINE
          </a>
        </section>

        <div className="compactLogoutWrap">
          <button type="button" className="dashboardLogoutBtn" onClick={handleLogout}>
            {th ? 'ออกจากระบบ' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyDashboard;
