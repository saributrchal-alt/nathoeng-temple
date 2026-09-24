import React, { useEffect, useState } from 'react';
import MemberPhotoEditor from '../components/MemberPhotoEditor';


const ISO_COUNTRY_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
  'QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
  'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ',
  'VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'
];

function countryFlag(code) {
  const value = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(value)) return '🌐';
  return String.fromCodePoint(...[...value].map((c) => 127397 + c.charCodeAt(0)));
}

function countryName(code, lang) {
  const value = String(code || '').trim().toUpperCase();
  if (!value) return '';
  try {
    const displayNames = new Intl.DisplayNames([lang === 'th' ? 'th' : 'en'], { type: 'region' });
    return displayNames.of(value) || value;
  } catch {
    return value;
  }
}

function MyDashboard({
  lang,
  goToPage,
  user,
  handleLogout,
  handleLineLogin,
  handleTelegramLogin
}) {
  const th = lang === 'th';
  const [profileImageError, setProfileImageError] = useState(false);
  const [verifiedFullName, setVerifiedFullName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [hasIdentityNumber, setHasIdentityNumber] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(Boolean(user));
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('');
  const [editIdentityNumber, setEditIdentityNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [editPicture, setEditPicture] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [donationLoading, setDonationLoading] = useState(true);
  const [connectUnreadCount, setConnectUnreadCount] = useState(0);
  const [pushDeviceStatus, setPushDeviceStatus] = useState('idle');
  const [pushDeviceMessage, setPushDeviceMessage] = useState('');
  const [cancelMembershipOpen, setCancelMembershipOpen] = useState(false);
  const [cancelMembershipReason, setCancelMembershipReason] = useState('');
  const [cancelMembershipDetail, setCancelMembershipDetail] = useState('');
  const [cancelMembershipConfirmed, setCancelMembershipConfirmed] = useState(false);
  const [cancelMembershipWorking, setCancelMembershipWorking] = useState(false);
  const [cancelMembershipError, setCancelMembershipError] = useState('');

  const [donationSummary, setDonationSummary] = useState({
    moneyTotal: 0,
    moneyCount: 0,
    itemCount: 0,
    latestAt: null
  });

  useEffect(() => {
    if (!user) {
      setVerifiedFullName('');
      setCountryCode('');
      setHasIdentityNumber(false);
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

        setVerifiedFullName(
          data.fullName ? String(data.fullName).trim() : ''
        );
        setCountryCode(
          String(data.countryCode || '').trim().toUpperCase()
        );
        setHasIdentityNumber(data.hasIdentityNumber === true);
        setBirthDate(data.birthDate || '');
        setProfilePicture(data.picture || '');
      } catch (error) {
        console.error(
          'MyDashboard identity profile error:',
          error
        );

        if (!cancelled) {
          setVerifiedFullName('');
          setCountryCode('');
          setHasIdentityNumber(false);
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

  useEffect(() => {
    if (!user) {
      setConnectUnreadCount(0);
      return;
    }

    let cancelled = false;

    const loadConnectUnread = async () => {
      try {
        const response = await fetch('/api/practice-messages', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok || !data.success || cancelled) return;

        let readIds = [];

        try {
          readIds = JSON.parse(
            window.localStorage.getItem('nathoeng_connect_read_ids') || '[]'
          );
        } catch {
          readIds = [];
        }

        const readSet = new Set(
          Array.isArray(readIds) ? readIds : []
        );

        const rows = Array.isArray(data.messages)
          ? data.messages
          : [];

        setConnectUnreadCount(
          rows.filter((item) => !readSet.has(item.id)).length
        );
      } catch (error) {
        console.error('Nathoeng Connect unread count error:', error);
      }
    };

    loadConnectUnread();
    window.addEventListener('nathoeng-connect-read', loadConnectUnread);
    window.addEventListener('focus', loadConnectUnread);

    return () => {
      cancelled = true;
      window.removeEventListener('nathoeng-connect-read', loadConnectUnread);
      window.removeEventListener('focus', loadConnectUnread);
    };
  }, [user?.memberId]);

  useEffect(() => {
    let cancelled = false;

    const restorePushStatus = async () => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        Notification.permission !== 'granted'
      ) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription =
          await registration.pushManager.getSubscription();

        if (!cancelled && subscription) {
          setPushDeviceStatus('registered');
          setPushDeviceMessage(
            th
              ? '✓ เครื่องนี้เปิดรับข่าวจากวัดแล้ว'
              : '✓ This device receives monastery news'
          );
          try {
            window.localStorage.setItem(
              'nathoeng_connect_push_enabled',
              '1'
            );
          } catch {
            // Ignore localStorage restrictions.
          }
        }
      } catch (error) {
        console.warn(
          'Unable to restore Nathoeng Connect Push status:',
          error
        );
      }
    };

    restorePushStatus();

    return () => {
      cancelled = true;
    };
  }, [th]);

  const registerPushDevice = async () => {
    setPushDeviceMessage('');

    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setPushDeviceStatus('error');
      setPushDeviceMessage(
        th
          ? 'อุปกรณ์หรือเบราว์เซอร์นี้ยังไม่รองรับ Web Push'
          : 'This device or browser does not support Web Push.'
      );
      return;
    }

    setPushDeviceStatus('working');

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        throw new Error(
          th ? 'ยังไม่ได้อนุญาตการแจ้งเตือน' : 'Notification permission was not granted'
        );
      }

      // Phase 2A uses the VAPID public key only to create a browser
      // subscription. No notification is sent in this phase.
      const configResponse = await fetch(
        '/api/practice-messages?scope=push-config',
        { credentials: 'include', cache: 'no-store' }
      );
      const configText = await configResponse.text();
      let config = null;
      try {
        config = configText ? JSON.parse(configText) : null;
      } catch {
        throw new Error(`HTTP ${configResponse.status} · ${configText.slice(0, 160)}`);
      }

      if (!configResponse.ok || !config?.success || !config?.publicKey) {
        throw new Error(
          config?.message || 'Push public key is unavailable'
        );
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const padding = '='.repeat((4 - (config.publicKey.length % 4)) % 4);
        const base64 = (config.publicKey + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const raw = window.atob(base64);
        const applicationServerKey = Uint8Array.from(
          [...raw].map((char) => char.charCodeAt(0))
        );

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      const json = subscription.toJSON();
      const response = await fetch('/api/practice-messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_push_device',
          endpoint: subscription.endpoint,
          p256dh: json?.keys?.p256dh || '',
          auth: json?.keys?.auth || ''
        })
      });

      const responseText = await response.text();
      let result = null;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(`HTTP ${response.status} · ${responseText.slice(0, 160)}`);
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          `HTTP ${response.status} · ${result?.message || 'Device registration failed'}${result?.detail ? ` · ${result.detail}` : ''}`
        );
      }

      setPushDeviceStatus('registered');
      try {
        window.localStorage.setItem(
          'nathoeng_connect_push_enabled',
          '1'
        );
      } catch {
        // localStorage is optional; browser subscription remains the source of truth.
      }
      setPushDeviceMessage(
        th
          ? '✓ เครื่องนี้เปิดรับข่าวจากวัดแล้ว'
          : '✓ This device receives monastery news'
      );
    } catch (error) {
      console.error('Nathoeng Connect Phase 2A registration error:', error);
      setPushDeviceStatus('error');
      setPushDeviceMessage(String(error?.message || error));
    }
  };



  const cancelMembership = async () => {
    if (!cancelMembershipReason || !cancelMembershipConfirmed) return;
    if (cancelMembershipReason === 'other' && !cancelMembershipDetail.trim()) {
      setCancelMembershipError(th ? 'กรุณาระบุเหตุผลเพิ่มเติม' : 'Please provide a reason.');
      return;
    }
    setCancelMembershipWorking(true);
    setCancelMembershipError('');
    try {
      const response = await fetch('/api/donation-profile', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelMembershipReason,
          reasonDetail: cancelMembershipDetail.trim()
        })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        const db = data?.databaseError || {};
        const detail = db?.message || db?.details || db?.hint || db?.code || '';
        throw new Error(
          detail
            ? (data?.message || 'Unable to cancel membership') + ' — ' + detail
            : (data?.message || 'Unable to cancel membership')
        );
      }
      try {
        const registration = await navigator.serviceWorker?.ready;
        const subscription = await registration?.pushManager?.getSubscription();
        if (subscription) await subscription.unsubscribe();
        window.localStorage.removeItem('nathoeng_connect_push_enabled');
        window.localStorage.removeItem('nathoeng_connect_read_ids');
      } catch (error) {
        console.warn('Local Push cleanup after membership cancellation:', error);
      }
      window.location.href = '/';
    } catch (error) {
      setCancelMembershipError(String(error?.message || error));
      setCancelMembershipWorking(false);
    }
  };

  const openProfileEditor = () => {
    setEditFullName(verifiedFullName || user?.name || '');
    setEditCountryCode(countryCode || 'TH');
    setEditIdentityNumber('');
    setEditBirthDate(birthDate);
    setEditPicture('');
    setProfileError('');
    setProfileEditorOpen(true);
  };

  const changePassword = async (event) => {
    event.preventDefault(); setPasswordBusy(true); setPasswordMessage('');
    try {
      const response = await fetch('/api/donation-profile', { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', currentPassword: oldPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to change password');
      setOldPassword(''); setNewPassword('');
      setPasswordMessage(th ? 'เปลี่ยนรหัสผ่านแล้ว' : 'Password changed.');
    } catch (error) { setPasswordMessage(error.message); }
    finally { setPasswordBusy(false); }
  };

  const saveProfile = async () => {
    const cleanFullName = String(editFullName || '').trim();
    const cleanCountryCode = String(editCountryCode || '').trim().toUpperCase();
    const cleanIdentityNumber = String(editIdentityNumber || '').trim();

    if (!cleanFullName) {
      setProfileError(th ? 'กรุณาระบุชื่อและนามสกุล' : 'Please enter your full name.');
      return;
    }

    if (!/^[A-Z]{2}$/.test(cleanCountryCode)) {
      setProfileError(th ? 'กรุณาเลือกประเทศ' : 'Please select your country.');
      return;
    }

    if (!hasIdentityNumber && !cleanIdentityNumber) {
      setProfileError(
        th
          ? 'กรุณาระบุเลขประจำตัวประชาชน 13 หลัก หรือหมายเลขพาสปอร์ต'
          : 'Please enter a 13-digit national ID or passport number.'
      );
      return;
    }

    setProfileSaving(true);
    setProfileError('');

    try {
      const response = await fetch('/api/donation-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: cleanFullName,
          countryCode: cleanCountryCode,
          birthDate: editBirthDate,
          picture: editPicture,
          ...(cleanIdentityNumber ? { taxId: cleanIdentityNumber } : {})
        })
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        const apiMessage =
          data?.message ||
          (th ? 'เซิร์ฟเวอร์ไม่ได้ส่งรายละเอียดข้อผิดพลาด' : 'The server did not return an error message.');
        const apiCode = data?.code ? ` · ${data.code}` : '';
        throw new Error(`HTTP ${response.status}${apiCode} · ${apiMessage}`);
      }

      setVerifiedFullName(String(data.fullName || cleanFullName).trim());
      setCountryCode(String(data.countryCode || cleanCountryCode).trim().toUpperCase());
      setHasIdentityNumber(data.hasIdentityNumber === true || hasIdentityNumber || Boolean(cleanIdentityNumber));
      setBirthDate(data.birthDate || editBirthDate);
      setProfilePicture(data.picture || profilePicture);
      setProfileEditorOpen(false);
      setEditIdentityNumber('');
    } catch (error) {
      console.error('MyDashboard profile update error:', error);
      const detail =
        error instanceof Error && error.message
          ? error.message
          : String(error || '');

      setProfileError(
        th
          ? `บันทึกข้อมูลไม่สำเร็จ — ${detail || 'ไม่ทราบสาเหตุ'}`
          : `Unable to save profile — ${detail || 'Unknown error'}`
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const sortedCountryCodes = [...ISO_COUNTRY_CODES].sort((a, b) =>
    countryName(a, lang).localeCompare(countryName(b, lang), th ? 'th' : 'en')
  );

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
            {(profilePicture || user?.picture) && !profileImageError ? (
              <img
                src={profilePicture || user.picture}
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

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                marginTop: '8px',
                marginBottom: '2px',
                color: '#2f6b4f'
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: '28px',
                  lineHeight: 1,
                  flex: '0 0 auto'
                }}
              >
                {countryCode ? countryFlag(countryCode) : '🌐'}
              </span>

              <strong
                style={{
                  display: 'block',
                  fontSize: '15px',
                  lineHeight: 1.35,
                  fontWeight: 800,
                  whiteSpace: 'normal'
                }}
              >
                {countryCode
                  ? `${countryName(countryCode, lang)} (${countryCode})`
                  : (th ? 'ยังไม่ได้ระบุประเทศ' : 'Country not set')}
              </strong>
            </div>

            <span>
              {user?.lineUid && user?.telegramUid
                ? `✓ ${th ? 'เชื่อมต่อ LINE และ Telegram แล้ว' : 'LINE and Telegram connected'}`
                : user?.telegramUid
                  ? `✓ ${th ? 'เชื่อมต่อบัญชี Telegram แล้ว' : 'Telegram connected'}`
                  : user?.lineUid
                    ? `✓ ${th ? 'เชื่อมต่อบัญชี LINE แล้ว' : 'LINE connected'}`
                    : `✓ ${th ? 'สมาชิกที่สมัครกับเจ้าหน้าที่วัด' : 'Registered at the monastery'}`}
            </span>

            {!user?.actingAsMember && <button
              type="button"
              className="compactViewButton"
              onClick={openProfileEditor}
              style={{ marginTop: '10px', alignSelf: 'flex-start' }}
            >
              {th ? 'แก้ไขโปรไฟล์' : 'Update Profile'}
            </button>}
          </div>
        </section>

        {user?.authProvider === 'password' && <details style={{ maxWidth: 590, margin: '12px auto 20px', padding: 18, background: '#fffdf8', border: '1px solid #e2d8c8', borderRadius: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{th ? 'เปลี่ยนรหัสผ่าน' : 'Change password'}</summary>
          <form onSubmit={changePassword} style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <label>{th ? 'รหัสผ่านเดิม' : 'Current password'}<input type="password" required autoComplete="current-password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} style={{ display: 'block', width: '100%', minHeight: 42 }} /></label>
            <label>{th ? 'รหัสผ่านใหม่อย่างน้อย 12 ตัวอักษร' : 'New password, at least 12 characters'}<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{ display: 'block', width: '100%', minHeight: 42 }} /></label>
            <button type="submit" disabled={passwordBusy}>{passwordBusy ? (th ? 'กำลังบันทึก…' : 'Saving…') : (th ? 'บันทึกรหัสผ่านใหม่' : 'Save new password')}</button>
            {passwordMessage && <p role="status">{passwordMessage}</p>}
          </form>
        </details>}

        <button
          type="button"
          className="compactDhammaStrip"
          onClick={() => goToPage('practice-messages')}
        >
          <img src="/icons/dhamma-book.svg" alt="" aria-hidden="true" />
          <span>
            <strong>
              Nathoeng Connect
              {connectUnreadCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    minWidth: '20px',
                    height: '20px',
                    marginLeft: '8px',
                    padding: '0 6px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '999px',
                    background: '#b23a2f',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 800,
                    verticalAlign: 'middle'
                  }}
                >
                  {connectUnreadCount > 99 ? '99+' : connectUnreadCount}
                </span>
              )}
            </strong>
            <small>
              {th
                ? 'ข้อความ ข่าวสาร และประกาศจากวัด'
                : 'Messages, news and announcements from the monastery'}
            </small>
          </span>
          <span aria-hidden="true">›</span>
        </button>

        {!user?.actingAsMember && <section
          style={{
            marginTop: '10px',
            padding: pushDeviceStatus === 'registered' ? '0' : '10px',
            borderRadius: '16px',
            border: pushDeviceStatus === 'registered'
              ? '1px solid #cfe5d6'
              : '1px solid #f0b400',
            background: pushDeviceStatus === 'registered'
              ? '#e4f5e9'
              : '#fff3a6'
          }}
        >
          <button
            type="button"
            onClick={registerPushDevice}
            disabled={
              pushDeviceStatus === 'working' ||
              pushDeviceStatus === 'registered'
            }
            style={{
              width: '100%',
              border: 0,
              borderRadius: '12px',
              padding: pushDeviceStatus === 'registered'
                ? '12px 14px'
                : '14px 16px',
              background: pushDeviceStatus === 'registered'
                ? '#e4f5e9'
                : '#ffd91a',
              color: pushDeviceStatus === 'registered'
                ? '#176b3a'
                : '#d82416',
              fontWeight: 900,
              fontSize: pushDeviceStatus === 'registered'
                ? '15px'
                : '17px',
              cursor: pushDeviceStatus === 'working'
                ? 'wait'
                : pushDeviceStatus === 'registered'
                  ? 'default'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px'
            }}
          >
            {pushDeviceStatus === 'working'
              ? (th ? 'กำลังเปิดรับข่าว...' : 'Enabling notifications...')
              : pushDeviceStatus === 'registered'
                ? (th ? '✓ เปิดรับข่าวจากวัดแล้ว' : '✓ Monastery news enabled')
                : (
                  <>
                    <span aria-hidden="true">🔔</span>
                    <span>
                      {th
                        ? 'เปิดรับข่าวจากวัด'
                        : 'Receive monastery news'}
                    </span>
                    <span
                      aria-hidden="true"
                      style={{ fontSize: '22px' }}
                    >
                      👆
                    </span>
                  </>
                )}
          </button>

          {pushDeviceStatus !== 'registered' && (
            <div
              style={{
                marginTop: '7px',
                color: pushDeviceStatus === 'error'
                  ? '#a12b22'
                  : '#7b4b00',
                fontSize: '12px',
                lineHeight: 1.5,
                textAlign: 'center',
                fontWeight: 700
              }}
            >
              {pushDeviceMessage || (th
                ? 'กดที่นี่เพื่อรับข่าวสาร กิจกรรม และประกาศสำคัญจากวัด'
                : 'Tap here to receive important monastery news and announcements.')}
            </div>
          )}
        </section>}

        <section
          className="compactSummaryCard"
          style={{ marginTop: '16px' }}
        >
          <div className="compactCardHead">
            <div>
              <span className="compactEyebrow">
                {th ? 'ช่องทางสมาชิก' : 'MEMBER CHANNELS'}
              </span>
              <h2>{th ? 'บัญชีที่เชื่อมต่อ' : 'Connected Accounts'}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="compactStayAction" style={{ cursor: 'default' }}>
              <span className="compactStayActionText">
                <strong>LINE</strong>
                <small>
                  {user?.lineUid
                    ? (th ? '✓ เชื่อมต่อแล้ว' : '✓ Connected')
                    : (th ? 'ยังไม่ได้เชื่อมต่อ' : 'Not connected')}
                </small>
              </span>
              {!user?.actingAsMember && !user?.lineUid && (
                <button
                  type="button"
                  className="compactViewButton"
                  onClick={() => handleLineLogin?.('link')}
                >
                  {th ? 'เชื่อมต่อ' : 'Connect'}
                </button>
              )}
            </div>

            <div className="compactStayAction" style={{ cursor: 'default' }}>
              <span className="compactStayActionText">
                <strong>Telegram</strong>
                <small>
                  {user?.telegramUid
                    ? (th ? '✓ เชื่อมต่อแล้ว' : '✓ Connected')
                    : (th ? 'ยังไม่ได้เชื่อมต่อ' : 'Not connected')}
                </small>
              </span>
              {!user?.actingAsMember && !user?.telegramUid && (
                <button
                  type="button"
                  className="compactViewButton"
                  onClick={() => handleTelegramLogin?.('link')}
                >
                  {th ? 'เชื่อมต่อ' : 'Connect'}
                </button>
              )}
            </div>
          </div>
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

        <section
          style={{
            marginTop: '16px',
            padding: '18px',
            borderRadius: '18px',
            border: '1px solid #d8e2d8',
            background: '#fffdf8'
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <strong
              style={{
                display: 'block',
                color: '#315f47',
                fontSize: '17px',
                marginBottom: '3px'
              }}
            >
              {th ? 'ติดต่อวัด' : 'Contact the Monastery'}
            </strong>

            <span
              style={{
                color: '#746f67',
                fontSize: '13px'
              }}
            >
              {th
                ? 'สามารถติดต่อวัดผ่านช่องทางต่อไปนี้'
                : 'Contact the monastery through the following channels'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '12px'
            }}
          >
            <a
              href="https://line.me/R/ti/p/@nathoeng"
              target="_blank"
              rel="noreferrer"
              style={{
                minHeight: '66px',
                borderRadius: '14px',
                background: '#06c755',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '10px 16px',
                boxSizing: 'border-box'
              }}
            >
              <span
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#06c755',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                LINE
              </span>

              <span style={{ textAlign: 'left' }}>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    lineHeight: 1.3
                  }}
                >
                  LINE OA @nathoeng
                </strong>

                <small
                  style={{
                    display: 'block',
                    marginTop: '3px',
                    color: 'rgba(255,255,255,0.9)'
                  }}
                >
                  {th ? 'แชทกับวัดผ่าน LINE' : 'Chat with us on LINE'}
                </small>
              </span>
            </a>

            <a
              href="https://t.me/NathoengConnectBot"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (typeof window === 'undefined') return;

                const isMobile =
                  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

                if (!isMobile) return;

                event.preventDefault();

                window.location.href =
                  'tg://resolve?domain=NathoengConnectBot';

                window.setTimeout(() => {
                  window.location.href =
                    'https://t.me/NathoengConnectBot';
                }, 900);
              }}
              style={{
                minHeight: '66px',
                borderRadius: '14px',
                background: '#229ED9',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '10px 16px',
                boxSizing: 'border-box'
              }}
            >
              <span
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#229ED9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '21px',
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                ➤
              </span>

              <span style={{ textAlign: 'left' }}>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    lineHeight: 1.3
                  }}
                >
                  Telegram @NathoengConnectBot
                </strong>

                <small
                  style={{
                    display: 'block',
                    marginTop: '3px',
                    color: 'rgba(255,255,255,0.9)'
                  }}
                >
                  {th
                    ? 'แชทกับวัดผ่าน Telegram'
                    : 'Chat with us on Telegram'}
                </small>
              </span>
            </a>
          </div>
        </section>


        {!user?.actingAsMember && <section style={{ marginTop: '22px', padding: '18px', borderRadius: '18px', border: '1px solid #ead6d2', background: '#fffafa' }}>
          <strong style={{ display: 'block', color: '#7f3f38', marginBottom: '5px' }}>
            {th ? 'การเป็นสมาชิก' : 'Membership'}
          </strong>
          <p style={{ margin: '0 0 13px', color: '#786b68', fontSize: '13px', lineHeight: 1.6 }}>
            {th ? 'หากไม่ประสงค์เป็นสมาชิกของวัดต่อ สามารถยกเลิกได้จากที่นี่' : 'If you no longer wish to remain a monastery member, you can cancel here.'}
          </p>
          <button type="button" onClick={() => { setCancelMembershipOpen(true); setCancelMembershipError(''); }} style={{ width: '100%', minHeight: '46px', borderRadius: '13px', border: '1px solid #c9675b', background: '#fff', color: '#a23f34', fontWeight: 800, cursor: 'pointer' }}>
            {th ? 'ยกเลิกการเป็นสมาชิกวัดพุทธอุทยานนาเทิง' : 'Cancel Nathoeng Monastery Membership'}
          </button>
        </section>}

        {cancelMembershipOpen && (
          <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(34,28,18,.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' }}>
            <section role="dialog" aria-modal="true" aria-labelledby="cancel-membership-title" style={{ width: 'min(100%, 520px)', maxHeight: '90vh', overflowY: 'auto', background: '#fffdf8', borderRadius: '22px', padding: '23px', boxShadow: '0 24px 70px rgba(32,25,15,.3)' }}>
              <h2 id="cancel-membership-title" style={{ margin: '0 0 8px', color: '#8f3e34' }}>{th ? 'ยกเลิกการเป็นสมาชิก' : 'Cancel Membership'}</h2>
              <p style={{ color: '#6f655d', lineHeight: 1.65, fontSize: '14px' }}>{th ? 'กรุณาเลือกเหตุผลก่อนยืนยัน การยกเลิกจะปิดการรับ Push และการใช้งานบริการสำหรับสมาชิก แต่ประวัติการเข้าพักและการร่วมบุญที่จำเป็นจะไม่ถูกลบโดยอัตโนมัติ' : 'Please select a reason. Cancellation disables Push and member services, while necessary stay and donation records are not automatically deleted.'}</p>
              <div style={{ display: 'grid', gap: '9px', margin: '17px 0' }}>
                {[
                  ['not_using', th ? 'ไม่ได้ใช้งานแล้ว' : 'I no longer use the service'],
                  ['no_news', th ? 'ไม่ประสงค์รับข่าวสารหรือกิจกรรมของวัด' : 'I do not wish to receive monastery news'],
                  ['duplicate_account', th ? 'สมัครบัญชีซ้ำ' : 'Duplicate account'],
                  ['use_another_account', th ? 'ต้องการใช้บัญชีอื่น' : 'I want to use another account'],
                  ['privacy', th ? 'เหตุผลด้านความเป็นส่วนตัว' : 'Privacy reasons'],
                  ['other', th ? 'อื่น ๆ' : 'Other']
                ].map(([value, label]) => (
                  <label key={value} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', border: '1px solid #e2d8ca', borderRadius: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="cancel-membership-reason" value={value} checked={cancelMembershipReason === value} onChange={() => setCancelMembershipReason(value)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {cancelMembershipReason === 'other' && (
                <textarea value={cancelMembershipDetail} onChange={(e) => setCancelMembershipDetail(e.target.value)} maxLength={500} placeholder={th ? 'กรุณาระบุเหตุผลเพิ่มเติม…' : 'Please tell us more…'} style={{ width: '100%', minHeight: '88px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #d8cbb8', padding: '11px', marginBottom: '13px' }} />
              )}
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', background: '#fff3f0', borderRadius: '12px', color: '#743c35', fontWeight: 700 }}>
                <input type="checkbox" checked={cancelMembershipConfirmed} onChange={(e) => setCancelMembershipConfirmed(e.target.checked)} />
                <span>{th ? 'ข้าพเจ้ายืนยันว่าต้องการยกเลิกการเป็นสมาชิก' : 'I confirm that I want to cancel my membership.'}</span>
              </label>
              {cancelMembershipError && <div role="alert" style={{ marginTop: '12px', color: '#a23f34', fontSize: '13px' }}>{cancelMembershipError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '17px' }}>
                <button type="button" disabled={cancelMembershipWorking} onClick={() => setCancelMembershipOpen(false)} style={{ minHeight: '48px', borderRadius: '13px', border: '1px solid #cfc3b4', background: '#fff', fontWeight: 800 }}>{th ? 'ยังไม่ยกเลิก' : 'Keep Membership'}</button>
                <button type="button" disabled={cancelMembershipWorking || !cancelMembershipReason || !cancelMembershipConfirmed || (cancelMembershipReason === 'other' && !cancelMembershipDetail.trim())} onClick={cancelMembership} style={{ minHeight: '48px', borderRadius: '13px', border: 0, background: '#a23f34', color: '#fff', fontWeight: 800, opacity: (cancelMembershipWorking || !cancelMembershipReason || !cancelMembershipConfirmed) ? .55 : 1 }}>{cancelMembershipWorking ? (th ? 'กำลังยกเลิก…' : 'Cancelling…') : (th ? 'ยืนยันยกเลิกสมาชิก' : 'Confirm Cancellation')}</button>
              </div>
            </section>
          </div>
        )}

        {profileEditorOpen && (
          <div
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !profileSaving) {
                setProfileEditorOpen(false);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(34, 28, 18, 0.52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-editor-title"
              style={{
                width: 'min(100%, 520px)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#fffdf8',
                border: '1px solid #ddcfb8',
                borderRadius: '22px',
                boxShadow: '0 24px 70px rgba(32, 25, 15, 0.28)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <span className="compactEyebrow">{th ? 'ข้อมูลสมาชิก' : 'MEMBER PROFILE'}</span>
                  <h2 id="profile-editor-title" style={{ margin: '5px 0 6px' }}>
                    {th ? 'แก้ไขโปรไฟล์' : 'Update Profile'}
                  </h2>
                  <p style={{ margin: 0, color: '#746a5f', lineHeight: 1.6, fontSize: '14px' }}>
                    {th
                      ? 'ประเทศที่เลือกจะเป็นข้อมูลเดียวกับที่ใช้แสดงสถิติสมาชิกของวัดบนแผนที่โลก'
                      : 'Your selected country is the same country record used in the monastery world member map.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => !profileSaving && setProfileEditorOpen(false)}
                  aria-label={th ? 'ปิด' : 'Close'}
                  style={{
                    border: 0,
                    background: 'transparent',
                    fontSize: '25px',
                    lineHeight: 1,
                    cursor: profileSaving ? 'default' : 'pointer',
                    color: '#6d6257'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px', marginTop: '22px' }}>
                <MemberPhotoEditor lang={lang} onChange={setEditPicture} />
                <label style={{ display: 'grid', gap: '7px', fontWeight: 700, color: '#51493f' }}>
                  <span>{th ? 'วันเกิด (ค.ศ.)' : 'Date of birth'}</span>
                  <input type="date" value={editBirthDate} onChange={(event) => setEditBirthDate(event.target.value)} style={{ minHeight: 48, borderRadius: 12, border: '1px solid #d8cbb8', padding: '0 13px' }} />
                </label>
                <label style={{ display: 'grid', gap: '7px', fontWeight: 700, color: '#51493f' }}>
                  <span>{th ? 'ชื่อและนามสกุล' : 'Full name'}</span>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(event) => setEditFullName(event.target.value)}
                    autoComplete="name"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                      borderRadius: '12px',
                      border: '1px solid #d8cbb8',
                      background: '#fff',
                      padding: '0 13px',
                      fontSize: '15px'
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '7px', fontWeight: 700, color: '#51493f' }}>
                  <span>{th ? 'ประเทศ' : 'Country'}</span>
                  <select
                    value={editCountryCode}
                    onChange={(event) => setEditCountryCode(event.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                      borderRadius: '12px',
                      border: '1px solid #d8cbb8',
                      background: '#fff',
                      padding: '0 13px',
                      fontSize: '15px'
                    }}
                  >
                    <option value="">{th ? '— เลือกประเทศ —' : '— Select country —'}</option>
                    {sortedCountryCodes.map((code) => (
                      <option key={code} value={code}>
                        {countryFlag(code)} {countryName(code, lang)} ({code})
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: '7px', fontWeight: 700, color: '#51493f' }}>
                  <span>
                    {th
                      ? 'เลขประจำตัวประชาชน 13 หลัก หรือหมายเลขพาสปอร์ต'
                      : '13-digit National ID or Passport Number'}
                  </span>
                  <input
                    type="text"
                    value={editIdentityNumber}
                    onChange={(event) => setEditIdentityNumber(event.target.value)}
                    autoComplete="off"
                    placeholder={
                      hasIdentityNumber
                        ? (th ? 'กรอกเฉพาะเมื่อต้องการเปลี่ยนข้อมูลนี้' : 'Enter only if you want to change it')
                        : (th ? 'กรอกเลข 13 หลัก หรือหมายเลขพาสปอร์ต' : 'Enter national ID or passport number')
                    }
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                      borderRadius: '12px',
                      border: '1px solid #d8cbb8',
                      background: '#fff',
                      padding: '0 13px',
                      fontSize: '15px'
                    }}
                  />
                  <small style={{ fontWeight: 400, color: '#807568', lineHeight: 1.55 }}>
                    {hasIdentityNumber
                      ? (th
                          ? 'ระบบมีข้อมูลยืนยันตัวตนอยู่แล้ว จึงไม่แสดงหมายเลขเดิมเพื่อความเป็นส่วนตัว'
                          : 'An identity number is already on file. The saved number is not displayed for privacy.')
                      : (th
                          ? 'ผู้ใช้ชาวไทยใช้เลขประจำตัวประชาชน 13 หลัก ส่วนผู้ใช้ต่างชาติสามารถใช้หมายเลขพาสปอร์ตได้'
                          : 'Thai members may use a 13-digit national ID; international members may use a passport number.')}
                  </small>
                </label>

                {profileError && (
                  <div
                    role="alert"
                    style={{
                      borderRadius: '12px',
                      background: '#fff3f0',
                      border: '1px solid #efc7bf',
                      color: '#9a3f32',
                      padding: '11px 13px',
                      fontSize: '14px',
                      lineHeight: 1.55
                    }}
                  >
                    {profileError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={profileSaving}
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    border: 0,
                    borderRadius: '14px',
                    background: '#9b7226',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: profileSaving ? 'wait' : 'pointer',
                    opacity: profileSaving ? 0.7 : 1
                  }}
                >
                  {profileSaving
                    ? (th ? 'กำลังบันทึก…' : 'Saving…')
                    : (th ? 'บันทึกข้อมูลโปรไฟล์' : 'Save Profile')}
                </button>
              </div>
            </section>
          </div>
        )}

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
