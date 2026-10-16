import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MemberPhotoEditor from '../components/MemberPhotoEditor';
import MemberCard from '../components/MemberCard';
import ThaiAddressFields from '../components/ThaiAddressFields.jsx';
import { structuredAddress, emptyThaiAddress } from '../lib/thaiAddress.js';


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


function MemberPortalIcon({ name }) {
  const shapes = {
    profile: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/></>,
    card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c.6-2 4.4-2 5 0M14 10h4.5M14 14h4.5"/></>,
    donation: <><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 11v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5"/></>,
    retreat: <><path d="M12 20c-5-2.6-8-6-8-10 4 .3 7 2 8 5 1-3 4-4.7 8-5 0 4-3 7.4-8 10Z"/><path d="M12 15c-2-2.2-2-5.1 0-9 2 3.9 2 6.8 0 9ZM3.5 21h17"/></>,
    news: <><path d="m4 11 13-5v12L4 13.5H2.5v-2.5H4Z"/><path d="m6.5 14 2 6h3l-2.5-5M20 10l2-1.5M20 14l2 1.5"/></>,
    library: <><path d="M12 6c-2.4-2-5.6-2.5-9-2v13c3.4-.5 6.6 0 9 2 2.4-2 5.6-2.5 9-2V4c-3.4-.5-6.6 0-9 2ZM12 6v13"/></>,
    health: <><path d="M20.5 9c0 5-8.5 10-8.5 10S3.5 14 3.5 9a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2Z"/><path d="M6 11h3l1.5-2.5 2.5 5 1.5-2.5H18"/></>,
    equipment: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5"/></>,
    school: <><path d="m2 9.5 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3.5 3.5 8.5 3.5 12 0v-5M22 10v7"/></>,
    contact: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.3 0-2.7-.3-3.8-1l-4.5 1.5 1.4-4.2A7.5 7.5 0 1 1 20 11.5Z"/><path d="M9 11.5h.1M12.5 11.5h.1M16 11.5h.1"/></>,
    settings: <><path d="M12 2.6 14 4l2.4-.3 1.1 2.2 2.3 1 .1 2.5 1.5 2-1.5 2-.1 2.5-2.3 1-1.1 2.2-2.4-.3-2 1.4-2-1.4-2.4.3-1.1-2.2-2.3-1-.1-2.5-1.5-2 1.5-2 .1-2.5 2.3-1 1.1-2.2L10 4Z"/><circle cx="12" cy="12" r="3.1"/></>
  };
  return <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name] || shapes.profile}</svg>;
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
  const [infoPanel, setInfoPanel] = useState(null);
  const contactTileRef = useRef(null);
  const settingsTileRef = useRef(null);
  const infoDialogRef = useRef(null);
  const infoCloseRef = useRef(null);
  useEffect(() => {
    if (!infoPanel) return undefined;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const animation = window.requestAnimationFrame(() => infoCloseRef.current?.focus());
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setInfoPanel(null);
      } else if (event.key === 'Tab') {
        const dialog = infoDialogRef.current;
        if (!dialog) return;
        const controls = [...dialog.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )].filter(node => node.getClientRects().length > 0);
        if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
        if (event.shiftKey && (document.activeElement === controls[0] || !dialog.contains(document.activeElement))) {
          event.preventDefault(); controls[controls.length - 1].focus();
        } else if (!event.shiftKey && (document.activeElement === controls[controls.length - 1] || !dialog.contains(document.activeElement))) {
          event.preventDefault(); controls[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(animation);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = oldOverflow;
      (infoPanel === 'contact' ? contactTileRef : settingsTileRef).current?.focus({ preventScroll: true });
    };
  }, [infoPanel]);
  const [memberCardOpen, setMemberCardOpen] = useState(false);
  const memberCardTriggerRef = useRef(null);
  const memberCardDialogRef = useRef(null);
  const memberCardCloseRef = useRef(null);

  // The digital card and its barcode are loaded only when requested.
  // Trap keyboard focus, allow Escape to close, and restore the last trigger.
  useEffect(() => {
    if (!memberCardOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => memberCardCloseRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMemberCardOpen(false);
      } else if (event.key === 'Tab') {
        const dialog = memberCardDialogRef.current;
        if (!dialog) return;
        const controls = [...dialog.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )].filter(node => node.getClientRects().length > 0);
        if (!controls.length) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      memberCardTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [memberCardOpen]);
  const [profileImageError, setProfileImageError] = useState(false);
  const [verifiedFullName, setVerifiedFullName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [hasIdentityNumber, setHasIdentityNumber] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(Boolean(user));
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [editFullNameEn, setEditFullNameEn] = useState('');
  const [memberAddress, setMemberAddress] = useState('');
  const [editMemberAddress, setEditMemberAddress] = useState('');
  const [addressStored, setAddressStored] = useState(emptyThaiAddress);
  const [editStructuredAddress, setEditStructuredAddress] = useState(emptyThaiAddress);
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
  const kathinDrinksActive = Date.now() < Date.parse('2026-11-08T17:00:00Z');
  const [kathinStaff, setKathinStaff] = useState(false);
  const [schoolOpening, setSchoolOpening] = useState(false);
  const [schoolError, setSchoolError] = useState('');

  const openSchool = async () => {
    if (schoolOpening) return;
    setSchoolOpening(true); setSchoolError('');
    try {
      const response = await fetch('/api/my-bookings?route=school-handoff', {credentials:'include',cache:'no-store'});
      const result = await response.json();
      if (!response.ok || !result?.success || !result.token) throw new Error(result?.message || (th?'เข้า School ไม่สำเร็จ':'Unable to open School'));
      const form = document.createElement('form');
      form.method = 'POST'; form.action = 'https://school.nathoeng.com/api/session';
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = 'token'; input.value = result.token;
      form.appendChild(input); document.body.appendChild(form); form.submit(); form.remove();
    } catch (error) { setSchoolError(error.message); setSchoolOpening(false); }
  };

  useEffect(() => {
    let cancelled = false;
    setKathinStaff(false);
    if (!user?.memberId) return undefined;
    const check = async () => {
      try {
        const response = await fetch('/api/line-login?route=kathin-access', {credentials:'include',cache:'no-store'});
        const result = await response.json();
        if (!cancelled) setKathinStaff(response.ok && Boolean(result.staff || result.admin));
      } catch { if (!cancelled) setKathinStaff(false); }
    };
    check();
    window.addEventListener('focus', check);
    return () => { cancelled = true; window.removeEventListener('focus', check); };
  }, [user?.memberId]);

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
        setFullNameEn(data.fullNameEn || '');
        setMemberAddress(data.memberAddress || '');
        setAddressStored(structuredAddress(data));
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
    setEditFullNameEn(fullNameEn);
    setEditMemberAddress(memberAddress);
    setEditStructuredAddress(structuredAddress(addressStored));
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
          fullNameEn: editFullNameEn,
          memberAddress: editMemberAddress,
          ...structuredAddress(cleanCountryCode === 'TH' ? editStructuredAddress : {}),
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
      setFullNameEn(data.fullNameEn ?? editFullNameEn.trim());
      setMemberAddress(data.memberAddress ?? editMemberAddress.trim());
      setAddressStored(structuredAddress(data));
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


  const scrollToMemberSection = (id, expand = false) => {
    if (expand) setOtherMenuOpen(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth',
        block: 'start'
      }), expand ? 120 : 0);
    }
  };
  const memberShortcuts = [
    { key: 'profile', icon: 'profile', tone: 'sage', th: 'ข้อมูลสมาชิก', en: 'My Profile', onClick: () => scrollToMemberSection('account-profile') },
    { key: 'card', icon: 'card', tone: 'gold', th: 'บัตรสมาชิก', en: 'Member Card', onClick: () => setMemberCardOpen(true) },
    { key: 'donations', icon: 'donation', tone: 'amber', th: 'ประวัติทำบุญ', en: 'My Donations', onClick: () => goToPage('donation-list') },
    { key: 'retreat', icon: 'retreat', tone: 'rose', th: 'กิจกรรม / ปฏิบัติธรรม', en: 'Retreat & Activities', onClick: () => goToPage('my-stays') },
    { key: 'news', icon: 'news', tone: 'sky', th: 'ข่าวสารวัด', en: 'Monastery News', onClick: () => goToPage('practice-messages'), unread: connectUnreadCount },
    ...(!user?.actingAsMember ? [
      { key: 'library', icon: 'library', tone: 'cream', th: 'ห้องสมุด', en: 'Library', href: 'https://library.nathoeng.com/?member=1#member-area' },
      { key: 'health', icon: 'health', tone: 'sage', th: 'สุขภาพชุมชน', en: 'Community Health', href: 'https://health.nathoeng.com/' },
      { key: 'equipment', icon: 'equipment', tone: 'amber', th: 'ยืม–คืนอุปกรณ์', en: 'Equipment Loans', href: 'https://gears.nathoeng.com/#loans' },
      { key: 'school', icon: 'school', tone: 'mint', th: 'การเรียนออนไลน์', en: 'Nathoeng School', onClick: openSchool, disabled: schoolOpening }
    ] : []),
    ...(!user?.actingAsMember ? [{ key: 'settings', icon: 'settings', tone: 'cream', th: 'ตั้งค่าบัญชี', en: 'Account Settings', onClick: () => setInfoPanel('settings') }] : []),
    { key: 'contact', icon: 'contact', tone: 'mint', th: 'ติดต่อวัด', en: 'Contact Monastery', onClick: () => setInfoPanel('contact') }
  ];

  return (
    <div className="nathoengDashboardPage compactAccountPage memberPortalPage">
      <div className={`nathoengDashboard compactAccountDashboard memberPortalDashboard${otherMenuOpen ? ' accountMenuOpen' : ''}`}>


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

        {kathinDrinksActive && <a href="https://kathin.nathoeng.com/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', margin: '0 0 18px', padding: '20px', border: '2px solid #b58a3b', borderRadius: 18, background: 'linear-gradient(120deg,#fff9e8,#f2e6ca)', color: '#3d3322', boxShadow: '0 8px 22px rgba(94,70,27,.12)' }}>
          <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1.15, flexShrink: 0 }}>☕</span>
          <strong style={{ fontSize: 21, lineHeight: 1.5, minWidth: 0 }}>{th ? 'กดรับกาแฟ เครื่องดื่มฟรีในงาน' : 'Tap for free coffee and drinks at the event'}</strong>
        </a>}

        {kathinStaff && <a href="https://kathin.nathoeng.com/#staff-dashboard" style={{display:'block',marginBottom:18,padding:18,borderRadius:16,background:'#edf6ef',border:'1px solid #b5d4bf',color:'#24563a',textDecoration:'none'}}>
          <strong style={{display:'block',fontSize:18}}>{th?'แดชบอร์ดเจ้าหน้าที่งานกฐิน':'Kathin Staff dashboard'}</strong>
          <small>{th?'จัดการคิว · เรียกรับ · ส่งเครื่องดื่ม · บริการสมาชิก':'Manage queues · Call and serve drinks · Assist members'}</small>
        </a>}

        <div className="memberPortalIdentity">
        <section id="account-profile" className="compactProfileCard">
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

        </div>
        <section className="memberPortalMetrics" aria-label={th ? 'สรุปการทำบุญของฉัน' : 'My donations at a glance'}>
          <div className="memberPortalMetric"><MemberPortalIcon name="donation" /><span><small>{th ? 'ยอดทำบุญที่บันทึก' : 'Recorded donations'}</small><strong>{moneyTotalText} <small>{th ? 'บาท' : 'THB'}</small></strong></span></div>
          <div className="memberPortalMetric"><MemberPortalIcon name="retreat" /><span><small>{th ? 'ครั้งที่ทำบุญเป็นเงิน' : 'Money donations'}</small><strong>{donationLoading ? '—' : donationSummary.moneyCount}</strong></span></div>
          <div className="memberPortalMetric"><MemberPortalIcon name="card" /><span><small>{th ? 'รายการสิ่งของถวาย' : 'Items offered'}</small><strong>{donationLoading ? '—' : donationSummary.itemCount}</strong></span></div>
        </section>
        <section className="memberPortalShortcuts" aria-labelledby="member-portal-shortcuts-title">
          <div className="memberPortalShortcutsHeading">
            <span className="compactEyebrow">NATHOENG CONNECT</span>
            <h2 id="member-portal-shortcuts-title">{th ? 'เมนูบริการสำหรับสมาชิก' : 'Member Services'}</h2>
            <p>{th ? 'เลือกไอคอนเพื่อเปิดบริการที่ต้องการ' : 'Choose an icon to open a service.'}</p>
          </div>
          <div className="memberPortalShortcutGrid">
            {memberShortcuts.map((item) => {
              const content = <>
                <span className="memberPortalTileIcon"><MemberPortalIcon name={item.icon} /></span>
                <span className="memberPortalTileLabel">{th ? item.th : item.en}</span>
                {item.unread > 0 && <span className="memberPortalTileUnread" aria-label={th ? 'ข่าวที่ยังไม่ได้อ่าน' : 'Unread messages'}>{item.unread > 99 ? '99+' : item.unread}</span>}
                <span className="memberPortalTileArrow" aria-hidden="true">›</span>
              </>;
              return item.href
                ? <a key={item.key} className={'memberPortalTile tone-' + item.tone} href={item.href}>{content}</a>
                : <button key={item.key} type="button" ref={item.key === 'card' ? memberCardTriggerRef : item.key === 'contact' ? contactTileRef : item.key === 'settings' ? settingsTileRef : undefined} className={'memberPortalTile tone-' + item.tone} onClick={item.onClick} disabled={item.disabled} aria-haspopup={['card', 'contact', 'settings'].includes(item.key) ? 'dialog' : undefined}>{content}</button>;
            })}
          </div>
          {schoolError && <p role="alert" className="memberPortalTileError">{schoolError}</p>}
        </section>

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
                  <span>{th ? 'ชื่อและนามสกุลภาษาอังกฤษ' : 'English full name'}</span>
                  <input type="text" maxLength={200} value={editFullNameEn} onChange={(event) => setEditFullNameEn(event.target.value)} style={{ minHeight: 48, borderRadius: 12, border: '1px solid #d8cbb8', padding: '0 13px' }} />
                </label>
                {editCountryCode === 'TH' ? <ThaiAddressFields lang={lang} value={editStructuredAddress}
                  legacyAddress={editMemberAddress}
                  onChange={(patch) => setEditStructuredAddress((current) => ({ ...current, ...patch }))} /> :
                  <label style={{ display: 'grid', gap: '7px', fontWeight: 700, color: '#51493f' }}>
                    <span>{th ? 'ที่อยู่ต่างประเทศ' : 'Address'}</span>
                    <textarea rows={3} maxLength={500} value={editMemberAddress} onChange={(event) => setEditMemberAddress(event.target.value)} style={{ borderRadius: 12, border: '1px solid #d8cbb8', padding: 13, font: 'inherit' }} />
                  </label>}
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

        <div id="account-logout" className="compactLogoutWrap">
          <button type="button" className="dashboardLogoutBtn" onClick={handleLogout}>
            {th ? 'ออกจากระบบ' : 'Logout'}
          </button>
        </div>
      </div>
      {infoPanel && createPortal(
        <div className="memberPortalCardBackdrop"
          onMouseDown={event => { if (event.target === event.currentTarget) setInfoPanel(null); }}>
          <section ref={infoDialogRef} className="memberPortalCardDialog memberPortalInfoDialog"
            role="dialog" aria-modal="true" aria-labelledby="member-portal-info-title" tabIndex={-1}>
            <header className="memberPortalCardDialogHeader">
              <div className="memberPortalCardDialogTitle">
                <span className="memberPortalCardDialogIcon" aria-hidden="true">
                  <MemberPortalIcon name={infoPanel === 'contact' ? 'contact' : 'settings'} />
                </span>
                <div>
                  <span>NATHOENG CONNECT</span>
                  <h2 id="member-portal-info-title">
                    {infoPanel === 'contact' ? (th ? 'ติดต่อวัด' : 'Contact Monastery') : (th ? 'ตั้งค่าบัญชีสมาชิก' : 'Account Settings')}
                  </h2>
                </div>
              </div>
              <button ref={infoCloseRef} type="button" className="memberPortalCardDialogClose"
                onClick={() => setInfoPanel(null)}
                aria-label={th ? 'ปิดหน้าต่าง' : 'Close dialog'}>×</button>
            </header>

            <div className="memberPortalInfoBody">
              {infoPanel === 'contact' ? <>
                <p className="memberPortalInfoLead">
                  {th ? 'เลือกช่องทางที่สะดวกเพื่อติดต่อเจ้าหน้าที่วัดพุทธอุทยานนาเทิง' : 'Choose a channel to contact the monastery.'}
                </p>
                <div className="memberPortalContactOptions">
                  <a className="memberPortalContactOption memberPortalContactLine"
                    href="https://line.me/R/ti/p/@nathoeng" target="_blank" rel="noopener noreferrer">
                    <span className="memberPortalSocialSymbol">LINE</span>
                    <span><strong>LINE OA @nathoeng</strong><small>{th ? 'เปิดแชทกับวัดผ่าน LINE' : 'Message us on LINE'}</small></span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <a className="memberPortalContactOption memberPortalContactTelegram"
                    href="https://t.me/NathoengConnectBot" target="_blank" rel="noopener noreferrer">
                    <span className="memberPortalSocialSymbol">➤</span>
                    <span><strong>Telegram @NathoengConnectBot</strong><small>{th ? 'เปิดแชทกับวัดผ่าน Telegram' : 'Message us on Telegram'}</small></span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
                <section className="memberPortalInfoSection">
                  <h3>{th ? 'การเชื่อมต่อบัญชีของฉัน' : 'My connected accounts'}</h3>
                  <div className="memberPortalConnection">
                    <div><strong>LINE</strong><small>{user?.lineUid ? (th ? '✓ เชื่อมต่อแล้ว' : '✓ Connected') : (th ? 'ยังไม่ได้เชื่อมต่อ' : 'Not connected')}</small></div>
                    {!user?.actingAsMember && !user?.lineUid && <button type="button" onClick={() => handleLineLogin?.('link')}>{th ? 'เชื่อมต่อ' : 'Connect'}</button>}
                  </div>
                  <div className="memberPortalConnection">
                    <div><strong>Telegram</strong><small>{user?.telegramUid ? (th ? '✓ เชื่อมต่อแล้ว' : '✓ Connected') : (th ? 'ยังไม่ได้เชื่อมต่อ' : 'Not connected')}</small></div>
                    {!user?.actingAsMember && !user?.telegramUid && <button type="button" onClick={() => handleTelegramLogin?.('link')}>{th ? 'เชื่อมต่อ' : 'Connect'}</button>}
                  </div>
                </section>
                <button type="button" className="memberPortalInfoSecondary" onClick={() => { setInfoPanel(null); goToPage('contact-page'); }}>
                  {th ? 'ดูที่ตั้งวัดและข้อมูลติดต่อเพิ่มเติม →' : 'Monastery location and other contact details →'}
                </button>
              </> : <>
                <section className="memberPortalInfoSection">
                  <h3>{th ? 'รับข่าวสารและประกาศจากวัด' : 'Monastery notifications'}</h3>
                  <p>{th ? 'เปิดรับการแจ้งเตือนบนอุปกรณ์เครื่องนี้' : 'Enable notifications on this device.'}</p>
                  <button type="button" className="memberPortalInfoPrimary" onClick={registerPushDevice}
                    disabled={pushDeviceStatus === 'working' || pushDeviceStatus === 'registered'}>
                    {pushDeviceStatus === 'registered'
                      ? (th ? '✓ เปิดรับข่าวจากวัดแล้ว' : '✓ Notifications enabled')
                      : pushDeviceStatus === 'working'
                        ? (th ? 'กำลังเปิดรับข่าว...' : 'Enabling...')
                        : (th ? '🔔 เปิดรับข่าวจากวัด' : '🔔 Enable notifications')}
                  </button>
                  {pushDeviceMessage && <p role="status" className={pushDeviceStatus === 'error' ? 'memberPortalInfoError' : ''}>{pushDeviceMessage}</p>}
                </section>
                {user?.authProvider === 'password' && <section className="memberPortalInfoSection">
                  <h3>{th ? 'เปลี่ยนรหัสผ่าน' : 'Change Password'}</h3>
                  <form className="memberPortalPasswordForm" onSubmit={changePassword}>
                    <label>{th ? 'รหัสผ่านเดิม' : 'Current password'}
                      <input type="password" required autoComplete="current-password"
                        value={oldPassword} onChange={event => setOldPassword(event.target.value)} />
                    </label>
                    <label>{th ? 'รหัสผ่านใหม่ อย่างน้อย 12 ตัวอักษร' : 'New password, at least 12 characters'}
                      <input type="password" required minLength={12} maxLength={128} autoComplete="new-password"
                        value={newPassword} onChange={event => setNewPassword(event.target.value)} />
                    </label>
                    <button type="submit" className="memberPortalInfoPrimary" disabled={passwordBusy}>
                      {passwordBusy ? (th ? 'กำลังบันทึก…' : 'Saving…') : (th ? 'บันทึกรหัสผ่านใหม่' : 'Save new password')}
                    </button>
                    {passwordMessage && <p role="status">{passwordMessage}</p>}
                  </form>
                </section>}
                {!user?.actingAsMember && <section className="memberPortalInfoSection memberPortalInfoDanger">
                  <h3>{th ? 'การเป็นสมาชิก' : 'Membership'}</h3>
                  <p>{th ? 'หากไม่ประสงค์ใช้งานบัญชีสมาชิกวัดอีกต่อไป' : 'If you no longer wish to use your monastery membership.'}</p>
                  <button type="button" onClick={() => {
                    setInfoPanel(null); setCancelMembershipError(''); setCancelMembershipOpen(true);
                  }}>{th ? 'ยกเลิกการเป็นสมาชิกวัด' : 'Cancel Monastery Membership'}</button>
                </section>}
              </>}
            </div>
            <footer className="memberPortalCardDialogFooter">
              <button type="button" onClick={() => setInfoPanel(null)}>{th ? 'ปิดหน้าต่าง' : 'Close'}</button>
            </footer>
          </section>
        </div>,
        document.body
      )}
      {memberCardOpen && createPortal(
        <div
          className="memberPortalCardBackdrop"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setMemberCardOpen(false); }}
        >
          <section
            ref={memberCardDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-card-dialog-heading"
            className="memberPortalCardDialog"
            tabIndex={-1}
          >
            <header className="memberPortalCardDialogHeader">
              <div className="memberPortalCardDialogTitle">
                <span className="memberPortalCardDialogIcon" aria-hidden="true"><MemberPortalIcon name="card" /></span>
                <div>
                  <span>NATHOENG CONNECT</span>
                  <h2 id="member-card-dialog-heading">{th ? 'บัตรสมาชิกของฉัน' : 'My Member Card'}</h2>
                </div>
              </div>
              <button
                ref={memberCardCloseRef}
                type="button"
                className="memberPortalCardDialogClose"
                onClick={() => setMemberCardOpen(false)}
                aria-label={th ? 'ปิดหน้าต่างบัตรสมาชิก' : 'Close member card'}
              >
                ×
              </button>
            </header>
            <div className="memberPortalCardDialogBody">
              <MemberCard
                memberId={user?.memberId}
                fullName={verifiedFullName || user?.name}
                photo={profilePicture || user?.picture}
                lang={lang}
              />
            </div>
            <footer className="memberPortalCardDialogFooter">
              <button type="button" onClick={() => setMemberCardOpen(false)}>
                {th ? 'ปิดหน้าต่าง' : 'Close'}
              </button>
            </footer>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}

export default MyDashboard;
