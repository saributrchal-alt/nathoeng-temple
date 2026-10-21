import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MemberPhotoEditor from '../components/MemberPhotoEditor';
import MemberCard from '../components/MemberCard';
import ThaiAddressFields from '../components/ThaiAddressFields.jsx';
import DonationListPage from './DonationListPage';
import DonationPage from './DonationPage';
import MyStaysPage from './MyStaysPage';
import BookingPage from './BookingPage';
import PracticeMessagesPage from './PracticeMessagesPage';
import CheckinPage from './CheckinPage';
import StayProcessPage from './StayProcessPage';
import StayPreparationPage from './StayPreparationPage';
import { structuredAddress, emptyThaiAddress } from '../lib/thaiAddress.js';


// SUV 7 seats includes the driver; the six passenger seats are bookable.
const KATHIN_SUV_ID = 'e2438656-877f-42c1-91f5-689b127424eb';

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
  // One cohesive, lightweight set of original two-tone SVG service icons.
  // Drawn with currentColor so category palettes and contrast follow the theme.
  const shapes = {
    profile: <>
      <circle cx="12" cy="7.3" r="3.4" fill="currentColor" fillOpacity=".11" />
      <circle cx="12" cy="7.3" r="3.4" />
      <path d="M4.2 20v-1.9c0-3.8 3.5-5.8 7.8-5.8s7.8 2 7.8 5.8V20" />
      <path d="M8.2 16.6h7.6" opacity=".55" />
    </>,
    card: <>
      <rect x="2.3" y="4.5" width="19.4" height="15" rx="3" fill="currentColor" fillOpacity=".08" />
      <rect x="2.3" y="4.5" width="19.4" height="15" rx="3" />
      <circle cx="8" cy="10.8" r="2.15" fill="currentColor" fillOpacity=".24" />
      <circle cx="8" cy="10.8" r="2.15" />
      <path d="M4.9 16c.45-2.65 5.75-2.65 6.2 0M13.6 9.5h5M13.6 12.7h5M13.6 16h3.6" />
      <path d="M16.4 2.9v3.2M14.8 4.5H18" opacity=".55" />
    </>,
    donation: <>
      <ellipse cx="10.6" cy="6.5" rx="6.8" ry="2.7" fill="currentColor" fillOpacity=".14" />
      <ellipse cx="10.6" cy="6.5" rx="6.8" ry="2.7" />
      <path d="M3.8 6.5v5.2c0 1.5 3 2.7 6.8 2.7 2 0 3.8-.35 5-1" />
      <path d="M3.8 11.7v4.6c0 1.5 3 2.7 6.8 2.7 1.1 0 2.2-.12 3.2-.36" />
      <path d="M16.1 13.8c.7-1.1 2.2-1.1 2.9 0 1-1.4 3.3-.35 3 1.4-.3 1.6-3 3.4-3 3.4s-2.7-1.8-3-3.4c-.3-1.75 2-2.8 3-1.4Z" fill="currentColor" fillOpacity=".21" />
      <path d="M16.1 13.8c.7-1.1 2.2-1.1 2.9 0 1-1.4 3.3-.35 3 1.4-.3 1.6-3 3.4-3 3.4s-2.7-1.8-3-3.4c-.3-1.75 2-2.8 3-1.4Z" />
    </>,
    retreat: <>
      <path d="M12 18.4C8.7 16 8.6 11.6 12 6.5c3.4 5.1 3.3 9.5 0 11.9Z" fill="currentColor" fillOpacity=".18" />
      <path d="M12 18.4C8.7 16 8.6 11.6 12 6.5c3.4 5.1 3.3 9.5 0 11.9Z" />
      <path d="M11.5 18.7c-5.3-.2-8.5-3-8.8-8.4 3.2.2 5.8 1.45 7.3 3.8M12.5 18.7c5.3-.2 8.5-3 8.8-8.4-3.2.2-5.8 1.45-7.3 3.8" />
      <path d="M5.2 19.2c2.6 1.5 11 1.5 13.6 0M3.5 22h17" />
      <circle cx="12" cy="3.5" r="1" fill="currentColor" stroke="none" />
    </>,
    news: <>
      <path d="m4.3 10.1 12.2-4.8v12.8L4.3 13.9H2.5v-3.8Z" fill="currentColor" fillOpacity=".12" />
      <path d="m4.3 10.1 12.2-4.8v12.8L4.3 13.9H2.5v-3.8Z" />
      <path d="m6.2 14.5 2.2 5.8h3.2l-2.1-4.8M19.5 9.5l2.4-1.5M19.8 13.2H23M19.5 16.5l2.4 1.5" />
      <circle cx="17.5" cy="4" r="1.4" fill="currentColor" stroke="none" />
    </>,
    library: <>
      <path d="M12 6.4C9.4 4.5 6.6 4.1 3 4.4v13.8c3.7-.7 6.6-.1 9 2 2.4-2.1 5.3-2.7 9-2V4.4c-3.6-.3-6.4.1-9 2Z" fill="currentColor" fillOpacity=".10" />
      <path d="M12 6.4C9.4 4.5 6.6 4.1 3 4.4v13.8c3.7-.7 6.6-.1 9 2 2.4-2.1 5.3-2.7 9-2V4.4c-3.6-.3-6.4.1-9 2Z" />
      <path d="M12 6.4v13.8M5.6 8.4c1.5 0 2.8.25 3.8.8M5.6 11.6c1.5 0 2.8.25 3.8.8M14.6 9.2c1.2-.6 2.5-.8 4-.8M14.6 12.4c1.2-.6 2.5-.8 4-.8" />
      <path d="M16 4.8V2.6l2.2 1.1" opacity=".6" />
    </>,
    health: <>
      <path d="M12 20.7S3 15.5 3 9.7C3 4.8 9 3.6 12 7.7c3-4.1 9-2.9 9 2 0 5.8-9 11-9 11Z" fill="currentColor" fillOpacity=".12" />
      <path d="M12 20.7S3 15.5 3 9.7C3 4.8 9 3.6 12 7.7c3-4.1 9-2.9 9 2 0 5.8-9 11-9 11Z" />
      <path d="M4.9 12h3.5l1.5-3.2 3.1 6.4 1.6-3.2h4.5" />
    </>,
    equipment: <>
      <path d="m12 2.5 9 5.1v9l-9 5-9-5v-9Z" fill="currentColor" fillOpacity=".10" />
      <path d="m12 2.5 9 5.1v9l-9 5-9-5v-9Z" />
      <path d="m3 7.6 9 5 9-5M12 12.6v9M7.3 5l9.2 5.2" />
      <path d="M16.5 15.9h3M18 14.4v3" opacity=".55" />
    </>,
    school: <>
      <path d="m2 9.2 10-5 10 5-10 5-10-5Z" fill="currentColor" fillOpacity=".16" />
      <path d="m2 9.2 10-5 10 5-10 5-10-5ZM6.2 12v5c3.2 3.1 8.4 3.1 11.6 0v-5M21.8 9.4v7.1" />
      <circle cx="21.8" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <path d="M9.3 9.2h5.4" opacity=".6" />
    </>,
    accounting: <>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="currentColor" fillOpacity=".09" />
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
      <path d="M8 6.8h8M8 10.3h8M8.2 14.4h2M14 14.4h2M8.2 18h2M14 18h2" />
      <path d="M16.8 2.6v4.2" opacity=".5" />
    </>,
    kathin: <>
      <path d="M4 9.5h16l-1.9 11H5.9L4 9.5Z" fill="currentColor" fillOpacity=".12" />
      <path d="M4 9.5h16l-1.9 11H5.9L4 9.5ZM2.7 20.5h18.6M6.3 13.5h11.4" />
      <path d="M12 9.5V3.4M9 5.9l3-3 3 3M12 14.1v3.3M10.3 15.7h3.4" />
      <path d="m5.2 5.9-.7-1.3m14.3 1.3.7-1.3" opacity=".6" />
      <circle cx="4" cy="3.3" r=".9" fill="currentColor" stroke="none" />
      <circle cx="20" cy="3.3" r=".9" fill="currentColor" stroke="none" />
    </>,
    settings: <>
      <path d="m12 2.7 1.7 1.6 2.3-.2 1.1 2.1 2.3.8v2.5l1.7 1.7-1.1 2.2.35 2.3-2.15 1.1-.8 2.4h-2.4L12 21l-2-1.8H7.5l-.8-2.4-2.15-1.1.35-2.3-1.1-2.2 1.7-1.7V7l2.3-.8 1.1-2.1 2.3.2Z" fill="currentColor" fillOpacity=".10" />
      <path d="m12 2.7 1.7 1.6 2.3-.2 1.1 2.1 2.3.8v2.5l1.7 1.7-1.1 2.2.35 2.3-2.15 1.1-.8 2.4h-2.4L12 21l-2-1.8H7.5l-.8-2.4-2.15-1.1.35-2.3-1.1-2.2 1.7-1.7V7l2.3-.8 1.1-2.1 2.3.2Z" />
      <circle cx="12" cy="10.1" r="2.35" />
      <path d="M8.3 16.1c.5-2.5 6.9-2.5 7.4 0" />
    </>,
    contact: <>
      <path d="M20.6 11.3a8.4 8.4 0 0 1-8.5 8.3c-1.5 0-2.6-.3-3.8-1L3.7 20l1.4-4.3a8.3 8.3 0 1 1 15.5-4.4Z" fill="currentColor" fillOpacity=".10" />
      <path d="M20.6 11.3a8.4 8.4 0 0 1-8.5 8.3c-1.5 0-2.6-.3-3.8-1L3.7 20l1.4-4.3a8.3 8.3 0 1 1 15.5-4.4Z" />
      <path d="m8.1 12.3 7.9-3.4-2.2 6.7-1.7-2.5-2.6-.8ZM12.1 13.1l3.9-4.2" />
    </>
  };
  return <svg viewBox="0 0 24 24" width="32" height="32" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false">{shapes[name] || shapes.profile}</svg>;
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
  // Tablet and desktop share the same member workspace; phones keep the original layout.
  const [desktopWorkspace, setDesktopWorkspace] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 700px)').matches);
  const [tabletPortrait, setTabletPortrait] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 700px) and (max-width: 899px)').matches);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarToggleRef = useRef(null);
  const [activeService, setActiveService] = useState('overview');
  const [openedFrames, setOpenedFrames] = useState([]);
  const [accountWorkspaceLoaded, setAccountWorkspaceLoaded] = useState(false);
  const [schoolWorkspaceLoaded, setSchoolWorkspaceLoaded] = useState(false);
  useEffect(() => {
    const workspaceMedia = window.matchMedia('(min-width: 700px)');
    const portraitMedia = window.matchMedia('(min-width: 700px) and (max-width: 899px)');
    const updateLayout = () => {
      setDesktopWorkspace(workspaceMedia.matches);
      setTabletPortrait(portraitMedia.matches);
      if (!workspaceMedia.matches) setActiveService('overview');
      if (!portraitMedia.matches) setSidebarOpen(false);
    };
    updateLayout();
    workspaceMedia.addEventListener('change', updateLayout);
    portraitMedia.addEventListener('change', updateLayout);
    return () => {
      workspaceMedia.removeEventListener('change', updateLayout);
      portraitMedia.removeEventListener('change', updateLayout);
    };
  }, []);
  useEffect(() => {
    if (!sidebarOpen || !tabletPortrait) return undefined;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstNav = document.querySelector('#member-portal-nav .memberPortalDesktopNavItem');
    firstNav?.focus({ preventScroll: true });
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSidebarOpen(false);
        sidebarToggleRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen, tabletPortrait]);
  const serviceFrameSources = {
    library: 'https://library.nathoeng.com/?member=1#member-area',
    equipment: 'https://gears.nathoeng.com/#loans',
    health: 'https://health.nathoeng.com/',
    kathin: 'https://kathin.nathoeng.com/#queue-board'
  };
  const showService = (service) => {
    if (!desktopWorkspace) return;
    setActiveService(service);
    setSidebarOpen(false);
    if (serviceFrameSources[service]) {
      setOpenedFrames(prev => prev.includes(service) ? prev : [...prev, service]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToWorkspacePage = page => {
    if (!desktopWorkspace) return goToPage(page);
    const embedded = {
      'my-dashboard': 'overview', 'donation-list': 'donations',
      'donation-page': 'donation-entry', 'my-stays': 'retreat',
      'booking-page': 'booking', 'practice-messages': 'news',
      'checkin-page': 'checkin', 'stay-process': 'stay-process',
      'prepare-stay': 'prepare-stay'
    };
    if (embedded[page]) return showService(embedded[page]);
    return goToPage(page);
  };
  const navigateMemberService = (page, service) =>
    desktopWorkspace ? showService(service) : goToPage(page);
  const [infoPanel, setInfoPanel] = useState(null);
  const [memberAccess, setMemberAccess] = useState(null);
  const [memberAccessLoading, setMemberAccessLoading] = useState(false);
  const [memberAccessError, setMemberAccessError] = useState('');

  useEffect(() => {
    if (infoPanel !== 'settings' || !user?.memberId) return undefined;
    const controller = new AbortController();
    const loadMemberAccess = async () => {
      setMemberAccess(null);
      setMemberAccessLoading(true);
      setMemberAccessError('');
      try {
        const response = await fetch('/api/line-login?route=member-access', {
          credentials: 'include', cache: 'no-store', signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok || !result?.success || !result?.access)
          throw new Error(result?.message || 'Permission check failed');
        if (!controller.signal.aborted) setMemberAccess(result.access);
      } catch (error) {
        if (!controller.signal.aborted) setMemberAccessError(
          th ? 'ยังตรวจสอบสิทธิ์ไม่ได้ กรุณาเปิดอีกครั้ง' : 'Unable to check access. Please reopen this panel.'
        );
      } finally {
        if (!controller.signal.aborted) setMemberAccessLoading(false);
      }
    };
    loadMemberAccess();
    return () => controller.abort();
  }, [infoPanel, user?.memberId, th]);
  const contactTileRef = useRef(null);
  const settingsTileRef = useRef(null);
  const accountingTileRef = useRef(null);
  const kathinTileRef = useRef(null);
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
      (infoPanel === 'contact' ? contactTileRef : infoPanel.startsWith('account-') ? accountingTileRef : infoPanel.startsWith('kathin-') ? kathinTileRef : settingsTileRef).current?.focus({ preventScroll: true });
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
  const [kathinHostOpen, setKathinHostOpen] = useState(false);
  const [kathinHostTab, setKathinHostTab] = useState('trip');
  const [tripData, setTripData] = useState(null);
  const [tripAdminSeats, setTripAdminSeats] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripSaving, setTripSaving] = useState(false);
  const [tripMessage, setTripMessage] = useState('');
  const [tripSeatPending, setTripSeatPending] = useState(null);
  const [tripPassportChoice, setTripPassportChoice] = useState('');
  const [tripAdminSearch, setTripAdminSearch] = useState('');
  const [tripAdminResults, setTripAdminResults] = useState([]);
  const [tripAdminMember, setTripAdminMember] = useState(null);
  const [tripAdminMode, setTripAdminMode] = useState('member');
  const [tripAdminPending, setTripAdminPending] = useState(null);
  const [tripAdminPassport, setTripAdminPassport] = useState('');
  const [tripAdminBusy, setTripAdminBusy] = useState(false);
  const searchKathinMembers = async () => {
    setTripAdminBusy(true);
    try {
      const r=await fetch('/api/my-bookings?route=kathin-trip-admin&q='+encodeURIComponent(tripAdminSearch),{credentials:'include',cache:'no-store'});
      const data=await r.json();
      if(!r.ok||!data.success) throw Error(data.message||'ค้นหาสมาชิกไม่สำเร็จ');
      setTripAdminResults(data.members);
    } catch(e){setTripMessage(e.message);}finally{setTripAdminBusy(false);}
  };
  const assignKathinSeat = async (van_id,seat_number,passport_status=null) => {
    if((tripAdminMode==='member' && !tripAdminMember)||tripAdminBusy) return;
    setTripAdminBusy(true);
    try{
      const r=await fetch('/api/my-bookings?route=kathin-trip-admin',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({member_id:tripAdminMode==='member'?tripAdminMember.id:null,booking_mode:tripAdminMode,van_id,seat_number,passport_status})});
      const data=await r.json();
      if(!r.ok||!data.success) throw Error(data.message||'ไม่สามารถกำหนดที่นั่งได้');
      setTripAdminPending(null);
      await loadKathinTrip();
      setTripMessage(th?'บันทึกเบาะสำเร็จ':'Seat reserved successfully');
    }catch(e){setTripMessage(e.message);await loadKathinTrip();}
    finally{setTripAdminBusy(false);}
  };
  const cancelKathinSeat = async (van_id,seat_number,name) => {
    if(tripAdminBusy || !window.confirm(th?
      'ยืนยันยกเลิกการจองเบาะ '+seat_number+' ของ '+name+'?':
      'Cancel seat '+seat_number+' for '+name+'?')) return;
    setTripAdminBusy(true);
    try {
      const r=await fetch('/api/my-bookings?route=kathin-trip-admin',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cancel',van_id,seat_number})});
      const result=await r.json();
      if(!r.ok||!result.success) throw Error(result.message||'ยกเลิกไม่สำเร็จ');
      await loadKathinTrip();
      setTripMessage(th?'ยกเลิกการจองเรียบร้อย':'Reservation cancelled');
    } catch(e){setTripMessage(e.message);await loadKathinTrip();}
    finally{setTripAdminBusy(false);}
  };
  const loadKathinTrip = async () => {
    setTripLoading(true);
    try {
      const response = await fetch('/api/my-bookings?route=kathin-trip',{credentials:'include',cache:'no-store'});
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'อ่านข้อมูลรถตู้ไม่สำเร็จ');
      setTripData(data);
      if (user?.isAdmin && !user?.actingAsMember) {
        const adminResponse=await fetch('/api/my-bookings?route=kathin-trip-admin&view=seats',{credentials:'include',cache:'no-store'});
        const adminData=await adminResponse.json();
        if (!adminResponse.ok || !adminData.success) throw new Error(adminData.message||'อ่านสถานะ Passport ไม่สำเร็จ');
        setTripAdminSeats(adminData.seats);
      }
      setTripMessage('');
    } catch(error) { setTripMessage(error.message); }
    finally { setTripLoading(false); }
  };
  const chooseKathinSeat = async (van_id, seat_number, passport_status) => {
    if (tripSaving) return;
    setTripSaving(true);
    setTripMessage('');
    try {
      const response = await fetch('/api/my-bookings?route=kathin-trip',{
        method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({van_id,seat_number,passport_status})
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'จองที่นั่งไม่สำเร็จ');
      setTripSeatPending(null);
      await loadKathinTrip();
      setTripMessage(th?'บันทึกที่นั่งเรียบร้อยแล้ว':'Seat saved successfully');
    } catch(error) { setTripMessage(error.message); await loadKathinTrip(); }
    finally {setTripSaving(false);}
  };
  useEffect(() => {
    if (!kathinHostOpen || kathinHostTab !== 'trip') return;
    loadKathinTrip();
  }, [kathinHostOpen,kathinHostTab]);
  const [kathinOpening, setKathinOpening] = useState(false);
  const [kathinAccessError, setKathinAccessError] = useState('');
  const [schoolOpening, setSchoolOpening] = useState(false);
  const [schoolError, setSchoolError] = useState('');
  const [accountOpening, setAccountOpening] = useState(false);
  const [accountError, setAccountError] = useState('');




  // Keep the member hub visible. Handoff tokens are POSTed, never placed in URLs.
  // A named iframe is used in the desktop workspace; mobile keeps normal navigation.
  const submitServiceHandoff = (token, action, target) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.target = target;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token';
    input.value = token;
    form.appendChild(input);
    document.body.appendChild(form);
    try { form.submit(); }
    finally { form.remove(); }
  };
  const openHandoffWindow = name => {
    const popup = window.open('about:blank', name);
    if (popup) {
      try { popup.opener = null; } catch {}
      return popup;
    }
    return null;
  };
  const openKathinStaff = async (mode = 'inline') => {
    if (kathinOpening) return;
    if (user?.actingAsMember) {
      setInfoPanel('kathin-denied');
      return;
    }
    setKathinOpening(true);
    setKathinAccessError('');
    try {
      const response = await fetch('/api/line-login?route=kathin-access', {
        credentials: 'include', cache: 'no-store'
      });
      const result = await response.json();
      if (response.ok && result?.success && (result.staff || result.admin)) {
        if (desktopWorkspace && mode !== 'window') {
          showService('kathin');
        } else if (desktopWorkspace) {
          window.open('https://kathin.nathoeng.com/#queue-board', '_blank', 'noopener,noreferrer');
        } else {
          window.location.assign('https://kathin.nathoeng.com/#queue-board');
        }
        return;
      }
      if (response.status === 401 || response.status === 403 ||
          (response.ok && !result.staff && !result.admin)) {
        setInfoPanel('kathin-denied');
      } else {
        throw Error('Kathin permission service unavailable');
      }
    } catch (error) {
      console.error('Kathin access check:', error);
      setKathinAccessError(th
        ? 'ตรวจสอบสิทธิ์งานกฐินไม่สำเร็จ กรุณาลองใหม่หรือติดต่อทางวัด'
        : 'Unable to verify Kathin access. Please try again or contact the monastery.');
      setInfoPanel('kathin-error');
    } finally {
      setKathinOpening(false);
    }
  };
  const openTempleAccounting = async (mode = 'inline') => {
    if (accountOpening) return;
    setAccountError('');
    if (!user?.isAdmin || user?.actingAsMember) {
      setInfoPanel('account-denied');
      return;
    }
    const pop = desktopWorkspace && mode === 'window' ? openHandoffWindow('nathoeng_account_window') : null;
    if (desktopWorkspace && mode === 'window' && !pop) {
      setAccountError(th ? 'เบราว์เซอร์ปิดกั้นหน้าต่างใหม่ กรุณาอนุญาต Pop-up' : 'Please allow pop-ups for this site.');
      setInfoPanel('account-error');
      return;
    }
    setAccountOpening(true);
    try {
      const response = await fetch('/api/admin-bookings?route=account-handoff', {
        credentials: 'same-origin', cache: 'no-store'
      });
      if (response.status === 401 || response.status === 403) {
        pop?.close();
        setInfoPanel('account-denied');
        return;
      }
      const result = await response.json();
      if (!response.ok || !result?.success || !result?.token)
        throw new Error(result?.message || 'Unable to open Temple Accounting');
      const target = pop ? 'nathoeng_account_window' :
        desktopWorkspace ? 'nathoeng_account_workspace' : '_self';
      if (desktopWorkspace && !pop) {
        setAccountWorkspaceLoaded(true);
        showService('accounting');
      }
      submitServiceHandoff(result.token, 'https://account.nathoeng.com/api/session', target);
    } catch (error) {
      pop?.close();
      console.error('Temple accounting handoff:', error);
      setAccountError(th
        ? 'ขณะนี้ไม่สามารถเปิดระบบบัญชีวัดได้ กรุณาลองอีกครั้งหรือติดต่อทางวัด'
        : 'Temple Accounting is temporarily unavailable. Please try again or contact the monastery.');
      setInfoPanel('account-error');
    } finally {
      setAccountOpening(false);
    }
  };
  // School must complete its signed POST handoff in a top-level browsing context.
  // An embedded, cross-origin iframe can be restricted by browser frame/cookie
  // policies and appear blank even though the School access check succeeded.
  const openSchool = async (mode = 'page') => {
    if (schoolOpening) return;
    const pop = mode === 'window' ? openHandoffWindow('nathoeng_school_window') : null;
    if (mode === 'window' && !pop) {
      setSchoolError(th ? 'เบราว์เซอร์ปิดกั้นหน้าต่างใหม่' : 'Pop-up blocked');
      return;
    }
    setSchoolOpening(true);
    setSchoolError('');
    try {
      const response = await fetch('/api/my-bookings?route=school-handoff', {
        credentials: 'include', cache: 'no-store'
      });
      const result = await response.json();
      if (!response.ok || !result?.success || !result.token)
        throw new Error(result?.message || (th ? 'เข้า School ไม่สำเร็จ' : 'Unable to open School'));
      // Navigate the current tab, not the hidden desktop iframe. The handoff
      // token stays in the POST body and never leaks into the URL.
      submitServiceHandoff(result.token, 'https://school.nathoeng.com/api/session',
        pop ? 'nathoeng_school_window' : '_self');
    } catch (error) {
      pop?.close();
      setSchoolError(error.message);
    } finally {
      setSchoolOpening(false);
    }
  };


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


  const serviceDescriptions = {
    card: { th: 'แสดงบัตรและเลขสมาชิก', en: 'Your digital member ID' },
    donations: { th: 'ย้อนดูประวัติการร่วมบุญ', en: 'Your donation history' },
    retreat: { th: 'กิจกรรมและการปฏิบัติธรรม', en: 'Retreats and meditation' },
    news: { th: 'ข่าวใหม่และประกาศจากวัด', en: 'Updates from the monastery' },
    health: { th: 'ดูแลสุขภาพของชุมชน', en: 'Community wellness' },
    equipment: { th: 'บริการยืมและคืนสิ่งของ', en: 'Borrow and return items' },
    school: { th: 'เรียนรู้ผ่านระบบออนไลน์', en: 'Learning wherever you are' },
    library: { th: 'หนังสือธรรมะและความรู้', en: 'Books and knowledge' },
    accounting: { th: 'รายรับ รายจ่าย และบัญชี', en: 'Temple financial records' },
    kathin: { th: 'จัดการงานและคิวบริการ', en: 'Staff tools for Kathin' },
    'kathin-host': { th: 'กำหนดการ สั่งเครื่องดื่ม และจองทริปทัศนาจร', en: 'Kathin programme, drinks and trip bookings' },
    settings: { th: 'โปรไฟล์ ความปลอดภัย และสิทธิ์', en: 'Profile and security' },
    contact: { th: 'สอบถามทาง LINE / Telegram', en: 'LINE and Telegram support' }
  };
  const shortcutDisplayOrder = [
    'card', 'donations', 'retreat', 'news',
    'health', 'equipment', 'school', 'library',
    'kathin-host', 'accounting', 'kathin', 'settings', 'contact'
  ];
  const memberShortcuts = [
    { key: 'card', icon: 'card', tone: 'gold', th: 'บัตรสมาชิก', en: 'Member Card', onClick: () => setMemberCardOpen(true) },
    { key: 'donations', icon: 'donation', tone: 'amber', th: 'ประวัติทำบุญ', en: 'My Donations', onClick: () => navigateMemberService('donation-list', 'donations') },
    { key: 'retreat', icon: 'retreat', tone: 'rose', th: 'กิจกรรม / ปฏิบัติธรรม', en: 'Retreat & Activities', onClick: () => navigateMemberService('my-stays', 'retreat') },
    { key: 'news', icon: 'news', tone: 'sky', th: 'ข่าวสารวัด', en: 'Monastery News', onClick: () => navigateMemberService('practice-messages', 'news'), unread: connectUnreadCount },
    ...(!user?.actingAsMember ? [
      { key: 'library', icon: 'library', tone: 'cream', th: 'ห้องสมุด', en: 'Library', href: 'https://library.nathoeng.com/?member=1#member-area' },
      { key: 'health', icon: 'health', tone: 'sage', th: 'สุขภาพชุมชน', en: 'Community Health', href: 'https://health.nathoeng.com/' },
      { key: 'equipment', icon: 'equipment', tone: 'amber', th: 'ยืม–คืนอุปกรณ์', en: 'Equipment Loans', href: 'https://gears.nathoeng.com/#loans' },
      { key: 'school', icon: 'school', tone: 'mint', th: 'การเรียนออนไลน์', en: 'Nathoeng School', onClick: () => openSchool(), disabled: schoolOpening }
    ] : []),
    { key: 'accounting', icon: 'accounting', tone: 'sky', th: 'บัญชีวัด', en: 'Temple Accounting', onClick: openTempleAccounting, disabled: accountOpening },
    { key: 'kathin-host', icon: 'kathin', tone: 'gold', th: 'เจ้าภาพงานกฐิน', en: 'Kathin Hosts', onClick: () => { setKathinHostOpen(true); setKathinHostTab('trip'); } },
    { key: 'kathin', icon: 'kathin', tone: 'gold', th: 'Staff งานกฐิน', en: 'Kathin Staff', onClick: openKathinStaff, disabled: kathinOpening },
    ...(!user?.actingAsMember ? [{ key: 'settings', icon: 'settings', tone: 'cream', th: 'ข้อมูลสมาชิก / ตั้งค่าบัญชี', en: 'Profile & Settings', onClick: () => setInfoPanel('settings') }] : []),
    { key: 'contact', icon: 'contact', tone: 'mint', th: 'ติดต่อวัด', en: 'Contact Monastery', onClick: () => setInfoPanel('contact') }
  ];

  return (
    <div className="nathoengDashboardPage compactAccountPage memberPortalPage">
      <div className={`nathoengDashboard compactAccountDashboard memberPortalDashboard ${activeService !== 'overview' && desktopWorkspace ? 'has-member-workspace' : ''}`}>

        {/* Shared desktop/tablet app shell: the sidebar becomes a drawer on portrait tablets. */}
        {tabletPortrait && sidebarOpen && (
          <button type="button" className="memberPortalTabletBackdrop"
            aria-label={th ? 'ปิดเมนูด้านข้าง' : 'Close side navigation'}
            onClick={() => { setSidebarOpen(false); sidebarToggleRef.current?.focus(); }} />
        )}
        <aside id="member-portal-nav"
          className={`memberPortalDesktopSidebar ${sidebarOpen ? 'is-open' : ''}`}
          aria-label={th ? 'เมนูบริการสมาชิก' : 'Member navigation'}
          aria-hidden={tabletPortrait && !sidebarOpen ? true : undefined}
          inert={tabletPortrait && !sidebarOpen}>
          <div className="memberPortalDesktopBrand">
            <img src="/logo-brown.png" alt="" aria-hidden="true" />
            <span><strong>NATHOENG</strong><small>CONNECT</small></span>
          </div>
          <div className="memberPortalDesktopNavLabel">{th ? 'เมนูหลัก' : 'MAIN MENU'}</div>
          <nav className="memberPortalDesktopNav">
            <button className={`memberPortalDesktopNavItem ${activeService === 'overview' ? 'is-current' : ''}`}
              type="button" aria-current={activeService === 'overview' ? 'page' : undefined}
              onClick={() => showService('overview')}>
              <MemberPortalIcon name="card" /><span>{th ? 'ภาพรวมบริการ' : 'Overview'}</span>
            </button>
            {shortcutDisplayOrder.map(key => {
              const item = memberShortcuts.find(shortcut => shortcut.key === key);
              if (!item) return null;
              const current = activeService === key;
              const content = <><MemberPortalIcon name={item.icon} /><span>{th ? item.th : item.en}</span>
                {item.unread > 0 && <b className="memberPortalDesktopUnread">{item.unread > 99 ? '99+' : item.unread}</b>}</>;
              return item.href
                ? <a key={key} className={`memberPortalDesktopNavItem ${current ? 'is-current' : ''}`}
                    href={item.href} aria-current={current ? 'page' : undefined}
                    onClick={event => { event.preventDefault(); showService(key); }}>{content}</a>
                : <button key={key} type="button"
                    className={`memberPortalDesktopNavItem ${current ? 'is-current' : ''}`}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => { setSidebarOpen(false); item.onClick?.(); }} disabled={item.disabled}>{content}</button>;
            })}
          </nav>
          <div className="memberPortalDesktopSidebarBottom">
            <button className="memberPortalDesktopNavItem" type="button" onClick={() => goToPage('home')}>
              <MemberPortalIcon name="retreat" /><span>{th ? 'กลับเว็บไซต์วัด' : 'Monastery website'}</span>
            </button>
            <button className="memberPortalDesktopNavItem" type="button" onClick={handleLogout}>
              <span className="memberPortalDesktopExitIcon" aria-hidden="true">↪</span>
              <span>{th ? 'ออกจากระบบ' : 'Sign out'}</span>
            </button>
          </div>
        </aside>
        <header className="memberPortalDesktopTopbar">
          <button ref={sidebarToggleRef} type="button" className="memberPortalTabletMenuToggle"
            aria-controls="member-portal-nav" aria-expanded={sidebarOpen}
            aria-label={sidebarOpen
              ? (th ? 'ปิดเมนูบริการ' : 'Close services menu')
              : (th ? 'เปิดเมนูบริการ' : 'Open services menu')}
            onClick={() => setSidebarOpen(open => !open)}>
            <span aria-hidden="true">{sidebarOpen ? '✕' : '☰'}</span>
          </button>
          <div className="memberPortalDesktopTopbarTitle">
            <small>NATHOENG CONNECT <span aria-hidden="true">/</span> {th ? 'บัญชีสมาชิก' : 'MEMBER AREA'}</small>
            <strong>{activeService === 'overview'
              ? (th ? 'ภาพรวมบริการสมาชิก' : 'Member dashboard')
              : (th ? (memberShortcuts.find(item => item.key === activeService)?.th ||
                (activeService === 'booking' ? 'จองเข้าพัก' : activeService === 'donation-entry' ? 'ทำรายการบริจาค' : activeService === 'checkin' ? 'เช็กอินเข้าพัก' : 'บริการสมาชิก'))
                : (memberShortcuts.find(item => item.key === activeService)?.en ||
                  (activeService === 'booking' ? 'Book a stay' : activeService === 'donation-entry' ? 'New donation' : activeService === 'checkin' ? 'Check-in' : 'Member services')))}</strong>
          </div>
          <div className="memberPortalDesktopTopbarUser">
            <span><strong>{verifiedFullName || user?.name || (th ? 'สมาชิกนาเทิง' : 'Nathoeng member')}</strong>
              <small>{th ? 'ยินดีต้อนรับ' : 'Welcome back'}</small></span>
            {(profilePicture || user?.picture) && !profileImageError
              ? <img src={profilePicture || user.picture} alt="" referrerPolicy="no-referrer" onError={() => setProfileImageError(true)} />
              : <span className="memberPortalDesktopUserFallback" aria-hidden="true">✦</span>}
          </div>
        </header>

        <button
          type="button"
          className="backButton compactBackButton"
          onClick={() => goToPage('home')}
        >
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>

        {kathinDrinksActive && <a className="memberPortalCafeBanner" href="https://kathin.nathoeng.com/#order-drink" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', margin: '0 0 18px', padding: '20px', border: '2px solid #b58a3b', borderRadius: 18, background: 'linear-gradient(120deg,#fff9e8,#f2e6ca)', color: '#3d3322', boxShadow: '0 8px 22px rgba(94,70,27,.12)' }}>
          <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1.15, flexShrink: 0 }}>☕</span>
          <strong style={{ fontSize: 21, lineHeight: 1.5, minWidth: 0 }}>{th ? 'กดรับกาแฟ เครื่องดื่มฟรีในงาน' : 'Tap for free coffee and drinks at the event'}</strong>
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
            <span className="memberPortalIdentityBrand">NATHOENG CONNECT</span>
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

          </div>
        </section>

        </div>
        <section className="memberPortalMetrics" aria-label={th ? 'สรุปการทำบุญของฉัน' : 'My donations at a glance'}>
          <div className="memberPortalMetric"><MemberPortalIcon name="donation" /><span><small>{th ? 'ยอดทำบุญที่บันทึก' : 'Recorded donations'}</small><strong>{moneyTotalText} <small>{th ? 'บาท' : 'THB'}</small></strong></span></div>
          <div className="memberPortalMetric"><MemberPortalIcon name="retreat" /><span><small>{th ? 'ครั้งที่ทำบุญเป็นเงิน' : 'Money donations'}</small><strong>{donationLoading ? '—' : donationSummary.moneyCount}</strong></span></div>
          <div className="memberPortalMetric"><MemberPortalIcon name="card" /><span><small>{th ? 'รายการสิ่งของถวาย' : 'Items offered'}</small><strong>{donationLoading ? '—' : donationSummary.itemCount}</strong></span></div>
        </section>
        <section className="memberPortalShortcuts memberPortalAppMenu" aria-labelledby="member-portal-shortcuts-title">
          <div className="memberPortalAppHero">
            <div className="memberPortalAppHeroCopy">
              <span className="memberPortalAppEyebrow">
                <span className="memberPortalAppEyebrowIcon" aria-hidden="true">✦</span>
                NATHOENG CONNECT
              </span>
              <h2 id="member-portal-shortcuts-title">
                {th ? 'บริการสำหรับสมาชิก' : 'Services for members'}
              </h2>
              <p>{th
                ? 'เชื่อมโยงศรัทธาและบริการของวัดไว้ในที่เดียว'
                : 'Everything you need from the monastery, in one place.'}</p>
            </div>
            <svg className="memberPortalAppHeroArtwork" viewBox="0 0 340 170"
              fill="none" aria-hidden="true" focusable="false">
              <circle cx="254" cy="46" r="37" fill="#F3DBAB" fillOpacity=".68"/>
              <path d="M0 129q35-35 70-18t70-17 84 2 116-6v80H0Z" fill="#ACC7AF" fillOpacity=".22"/>
              <path d="M0 142q55-19 110 0t116-14 114 8v34H0Z" fill="#749F87" fillOpacity=".23"/>
              <path d="M108 143h148M123 131h118M136 121h91" stroke="#9E8053" strokeWidth="3" strokeLinecap="round"/>
              <path d="M140 121V91l41-35 41 35v30M157 121V96h48v25" stroke="#99784D"
                strokeWidth="3" strokeLinejoin="round" fill="#FFF9EB" fillOpacity=".54"/>
              <path d="M129 94q51-13 103 0l-51-36Z" fill="#CFB077" fillOpacity=".5" stroke="#9B7B4C" strokeWidth="2"/>
              <path d="M148 81q33-11 66 0M181 58V34M171 45l10-12 10 12" stroke="#9B7B4C" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M79 143V106M68 119l11-33 11 33M252 143V98M240 111l12-36 13 36" stroke="#668A6B"
                strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 157h295" stroke="#8CAB93" strokeOpacity=".45" strokeWidth="2"/>
            </svg>
          </div>
          <div className="memberPortalAppGridIntro">
            <h3>{th ? 'เมนูบริการ' : 'Explore services'}</h3>
            <span>{th ? 'เลือกบริการที่ต้องการ' : 'Choose a service'}</span>
          </div>
          <div className="memberPortalShortcutGrid">
            {[...memberShortcuts].sort((a, b) =>
              shortcutDisplayOrder.indexOf(a.key) - shortcutDisplayOrder.indexOf(b.key)
            ).map((item) => {
              const content = <>
                <span className="memberPortalTileArt" aria-hidden="true"><MemberPortalIcon name={item.icon} /></span>
                <span className="memberPortalTileIcon"><MemberPortalIcon name={item.icon} /></span>
                <span className="memberPortalTileText">
                  <span className="memberPortalTileLabel">{th ? item.th : item.en}</span>
                  <span className="memberPortalTileDescription">
                    {th ? serviceDescriptions[item.key]?.th : serviceDescriptions[item.key]?.en}
                  </span>
                </span>
                {item.unread > 0 && <span className="memberPortalTileUnread" aria-label={th ? 'ข่าวที่ยังไม่ได้อ่าน' : 'Unread messages'}>{item.unread > 99 ? '99+' : item.unread}</span>}
                <span className="memberPortalTileArrow" aria-hidden="true">›</span>
              </>;
              return item.href
                ? <a key={item.key} className={'memberPortalTile tone-' + item.tone} href={item.href}
                    onClick={event => { if (desktopWorkspace) { event.preventDefault(); showService(item.key); } }}>{content}</a>
                : <button key={item.key} type="button" ref={item.key === 'card' ? memberCardTriggerRef : item.key === 'contact' ? contactTileRef : item.key === 'settings' ? settingsTileRef : item.key === 'accounting' ? accountingTileRef : item.key === 'kathin' ? kathinTileRef : undefined} className={'memberPortalTile tone-' + item.tone} onClick={item.onClick} disabled={item.disabled} aria-haspopup={['card', 'contact', 'settings', 'accounting', 'kathin'].includes(item.key) ? 'dialog' : undefined}>{content}</button>;
            })}
          </div>
          {kathinHostOpen && (
            <div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setKathinHostOpen(false);}}
              style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(14,30,25,.60)',display:'flex',
                justifyContent:'center',alignItems:'center',padding:12}}>
              <section role="dialog" aria-modal="true" aria-label={th ? 'เจ้าภาพงานกฐิน' : 'Kathin hosts'}
                onKeyDown={e=>{if(e.key==='Escape')setKathinHostOpen(false);}}
                style={{width:'min(1120px,100%)',maxHeight:'94dvh',overflowY:'auto',overscrollBehavior:'contain',
                  padding:'clamp(12px,2.6vw,26px)',border:'1px solid #c5b37b',borderRadius:20,
                  background:'#fffdf4',boxShadow:'0 24px 80px #0006'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                <h2 style={{margin:0,color:'#65501c'}}>{th ? 'เจ้าภาพงานกฐิน ๒๕๖๙' : 'Kathin Hosts 2026'}</h2>
                <button type="button" onClick={()=>setKathinHostOpen(false)} aria-label={th?'ปิด':'Close'}>✕</button>
              </div>
              <p>{th?'กิจกรรมวันที่ ๗–๘ พฤศจิกายน ๒๕๖๙ · วัดพุทธอุทยานนาเทิง':'7–8 November 2026 · Wat Phuttha Uthayan Na Thoeng'}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>
                {[
                  ['drinks',th?'สั่งเครื่องดื่ม':'Order drinks'],
                  ['program',th?'กำหนดการกฐิน':'Kathin programme'],
                  ['excursion',th?'กำหนดการทัศนาจร':'Excursion schedule'],
                  ['trip',th?'จองทริป / ที่นั่ง':'Trip / seats']
                ].map(([key,label])=><button key={key} type="button" onClick={()=>{
                    if (key==='drinks') { window.location.assign('https://kathin.nathoeng.com/'); return; }
                    if (key==='program') { window.location.assign('/#event-kathina'); return; }
                    setKathinHostTab(key);
                  }}
                   aria-pressed={kathinHostTab===key} style={{padding:'10px 13px',borderRadius:12,border:'1px solid #b4a273',background:kathinHostTab===key?'#e9deb8':'white',color:'#44391b'}}>{label}</button>)}
              </div>
              
              
              {kathinHostTab==='excursion' && <div><h3>{th?'ทัศนาจร สปป.ลาว':'Laos excursion'}</h3><p>{th?'รถตู้จาก สปป.ลาว มารับที่ฝั่งไทย พาข้ามสะพานมิตรภาพไทย–ลาว และกลับมาส่งฝั่งไทย กำหนดการรายชั่วโมงรอผู้ดูแลยืนยัน':'Vans pick up on the Thai side, cross the Thai–Lao Friendship Bridge, and return to Thailand. Timetable awaits confirmation.'}</p></div>}
              {kathinHostTab==='trip' && <div>
                <h3>{th?'จองทริปทัศนาจร':'Trip reservations'}</h3>
                <p>{th?'กดเลือกที่นั่งที่ว่างได้ทันที (สีเทา = มีผู้จองแล้ว, สีเขียว = ที่นั่งของท่าน)':'Select any available seat (grey = booked, green = your seat)'}</p>
                <button type="button" onClick={loadKathinTrip} disabled={tripLoading||tripSaving}>{th?'↻ อัปเดตที่นั่ง':'↻ Refresh seats'}</button>
                {user?.isAdmin && !user?.actingAsMember && <div style={{padding:14,margin:'12px 0',background:'#f0f5f0',border:'1px solid #bed5c0',borderRadius:14}}>
                  <strong>{th?'แอดมิน: จัดที่นั่งให้สมาชิกวัด':'Admin: assign a seat to a temple member'}</strong>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}>
                    {[['member','จองให้สมาชิก','Member'],['placeholder_male','สำรองชาย','Reserve male'],['placeholder_female','สำรองหญิง','Reserve female']].map(([mode,label,en])=>
                      <button type="button" key={mode} onClick={()=>setTripAdminMode(mode)} aria-pressed={tripAdminMode===mode}
                        style={{padding:'9px 12px',background:tripAdminMode===mode?'#c8e7d3':'#fff',border:'1px solid #8ea994',borderRadius:9}}>
                        {th?label:en}
                      </button>)}
                  </div>
                  {tripAdminMode!=='member' && <p>{th?'กดเบาะว่างเพื่อจองสำรองด้วยรูปการ์ตูน':'Tap an available seat for a cartoon placeholder'}</p>}
                  {tripAdminMode==='member' && <>
                  <div style={{display:'flex',gap:8,margin:'10px 0',flexWrap:'wrap'}}>
                    <input type="search" value={tripAdminSearch} onChange={e=>setTripAdminSearch(e.target.value)}
                      placeholder={th?'พิมพ์ชื่อสมาชิกอย่างน้อย 2 ตัวอักษร':'Search member name'}
                      style={{flex:'1 1 180px',padding:9,borderRadius:8,border:'1px solid #b5cbb8'}}/>
                    <button type="button" onClick={searchKathinMembers} disabled={tripAdminBusy||tripAdminSearch.trim().length<2}>{th?'ค้นหา':'Search'}</button>
                  </div>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                    {tripAdminResults.map(m=><button key={m.id} type="button" onClick={()=>setTripAdminMember(m)}
                       aria-pressed={tripAdminMember?.id===m.id}
                       style={{display:'flex',alignItems:'center',gap:6,padding:6,borderRadius:9,
                         border:tripAdminMember?.id===m.id?'2px solid #1b7348':'1px solid #bcc6b9',
                         background:'white'}}>
                       {m.picture_url && <img src={m.picture_url} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}}/>}
                       {m.name}
                    </button>)}
                  </div>
                  {tripAdminMember && <p style={{fontWeight:700,color:'#19643e'}}>{th?'กำลังจัดเบาะให้: ':'Assigning seat for: '}{tripAdminMember.name} — {th?'กดเบาะว่างบนผังรถ':'Click an available seat on the van map'}</p>}
                  </>}
                </div>}

                {tripAdminPending && user?.isAdmin && !user?.actingAsMember && <div role="presentation"
                  style={{position:'fixed',inset:0,zIndex:10003,background:'rgba(12,27,22,.64)',display:'grid',placeItems:'center',padding:16}}>
                  <section role="dialog" aria-modal="true" aria-label={th?'แอดมินยืนยันการจอง':'Admin booking confirmation'}
                    style={{width:'min(440px,100%)',background:'#fffef9',border:'1px solid #d4bd84',
                      borderRadius:18,padding:22,boxShadow:'0 18px 60px #0005'}}>
                    <h3>{th?'ยืนยันจัดที่นั่งให้เจ้าภาพ':'Confirm assigned seat'}</h3>
                    <p>{th?'รถคันที่':'Vehicle'} {tripAdminPending.van_number} · {th?'เบาะที่':'Seat'} {tripAdminPending.seat_number}</p>
                    <p>{tripAdminMode==='member'?(tripAdminMember?.name||'สมาชิก'):tripAdminMode==='placeholder_male'?'สำรองชาย':'สำรองหญิง'}</p>
                    {tripAdminMode==='member' && <fieldset style={{border:'1px solid #d9d9ce',borderRadius:10,padding:12}}>
                      <legend>{th?'สมาชิกมี Passport หรือไม่? *':'Does the member have a passport? *'}</legend>
                      <label style={{display:'block',margin:'10px 0'}}><input type="radio" name="kathin-admin-passport" checked={tripAdminPassport==='has_passport'} onChange={()=>setTripAdminPassport('has_passport')}/> {th?'มี Passport':'Has Passport'}</label>
                      <label style={{display:'block'}}><input type="radio" name="kathin-admin-passport" checked={tripAdminPassport==='no_passport'} onChange={()=>setTripAdminPassport('no_passport')}/> {th?'ไม่มี Passport':'No Passport'}</label>
                    </fieldset>}
                    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
                      <button type="button" disabled={tripAdminBusy} onClick={()=>setTripAdminPending(null)}>{th?'กลับ':'Back'}</button>
                      <button type="button" disabled={tripAdminBusy||(tripAdminMode==='member'&&!tripAdminPassport)}
                        onClick={()=>assignKathinSeat(tripAdminPending.van_id,tripAdminPending.seat_number,
                          tripAdminMode==='member'?tripAdminPassport:null)}
                        style={{background:'#285c43',color:'white',padding:'9px 15px',borderRadius:9}}>
                        {tripAdminBusy?(th?'กำลังบันทึก…':'Saving…'):(th?'ยืนยันการจอง':'Confirm booking')}
                      </button>
                    </div>
                  </section>
                </div>}
                {tripSeatPending && <div role="presentation" style={{position:'fixed',inset:0,zIndex:10002,
                  background:'rgba(12,27,22,.64)',display:'grid',placeItems:'center',padding:16}}>
                  <section role="dialog" aria-modal="true" aria-label={th?'ยืนยันการจองทริป':'Confirm trip seat'}
                    style={{width:'min(440px,100%)',background:'#fffef9',border:'1px solid #d4bd84',borderRadius:18,
                      padding:22,boxShadow:'0 18px 60px #0005'}}>
                    <h3>{tripSeatPending.action==='cancel'?(th?'ยกเลิกการจองหรือไม่?':'Cancel reservation?'):(th?'ยืนยันการจองที่นั่ง':'Confirm your seat')}</h3>
                    <p>{th?'รถคันที่':'Vehicle'} {tripSeatPending.van_number} · {th?'เบาะที่':'Seat'} {tripSeatPending.seat_number}</p>
                    {tripSeatPending.action==='confirm' && <fieldset style={{border:'1px solid #d9d9ce',borderRadius:10,padding:12}}>
                      <legend>{th?'ท่านมี Passport หรือไม่? *':'Do you have a passport? *'}</legend>
                      <label style={{display:'block',margin:'10px 0'}}><input type="radio" name="kathin-passport" checked={tripPassportChoice==='has_passport'}
                        onChange={()=>setTripPassportChoice('has_passport')}/> {th?'มี Passport':'Have passport'}</label>
                      <label style={{display:'block'}}><input type="radio" name="kathin-passport" checked={tripPassportChoice==='no_passport'}
                        onChange={()=>setTripPassportChoice('no_passport')}/> {th?'ไม่มี Passport':'No passport'}</label>
                    </fieldset>}
                    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
                      <button type="button" disabled={tripSaving} onClick={()=>setTripSeatPending(null)}>{th?'กลับ':'Back'}</button>
                      <button type="button" disabled={tripSaving||(tripSeatPending.action==='confirm'&&!tripPassportChoice)}
                        onClick={async()=>{
                          if(tripSeatPending.action==='confirm'){
                            await chooseKathinSeat(tripSeatPending.van_id,tripSeatPending.seat_number,tripPassportChoice);
                          } else {
                            setTripSaving(true);
                            try{
                              const r=await fetch('/api/my-bookings?route=kathin-trip',{method:'POST',credentials:'include',
                                headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cancel'})});
                              const data=await r.json();
                              if(!r.ok||!data.success)throw Error(data.message||'ยกเลิกไม่สำเร็จ');
                              setTripSeatPending(null);
                              await loadKathinTrip();
                              setTripMessage(th?'ยกเลิกการจองเรียบร้อย':'Reservation cancelled');
                            }catch(e){setTripMessage(e.message);}
                            finally{setTripSaving(false);}
                          }
                        }} style={{background:'#285c43',color:'white',padding:'9px 15px',borderRadius:9}}>
                        {tripSaving?(th?'กำลังบันทึก…':'Saving…'):tripSeatPending.action==='cancel'?(th?'ยืนยันยกเลิก':'Confirm cancellation'):(th?'ยืนยันการจอง':'Confirm booking')}
                      </button>
                    </div>
                  </section>
                </div>}
                {tripMessage && <p role="status" style={{color:'#795320'}}>{tripMessage}</p>}
                {tripLoading && <p>{th?'กำลังโหลดผังที่นั่ง…':'Loading seats…'}</p>}
                {tripData && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))',gap:14,marginTop:14}}>
                  {tripData.vans.map(van=><div key={van.id} style={{padding:14,border:'1px solid #dfd4b8',borderRadius:14,background:'white'}}>
                    <h4>{th?'รถคันที่':'Vehicle'} {van.van_number}{van.id===KATHIN_SUV_ID?' · SUV':''}</h4>
                    {van.id===KATHIN_SUV_ID && <p style={{fontSize:13}}>{th?'7 ที่นั่งรวมคนขับ · จองได้ 6 ที่นั่ง · ด้านหน้ารถอยู่ทางซ้าย':'7 seats including driver · 6 passenger seats · Front on the left'}</p>}
                    <div style={{position:'relative',width:'100%',aspectRatio:'2.35/1',minHeight:128,margin:'10px auto'}}>
                      {van.id===KATHIN_SUV_ID ? <svg viewBox="0 0 470 200" aria-hidden="true" style={{position:'absolute',width:'100%',height:'100%',inset:0}}>
                        <rect x="8" y="12" width="454" height="176" rx="62" fill="#eaf1ed" stroke="#5e7b6b" strokeWidth="4"/>
                        <path d="M90 27 Q45 100 90 173 M185 28 V172 M320 28 V172" fill="none" stroke="#9fb5a8" strokeWidth="3"/>
                        <rect x="120" y="32" width="45" height="48" rx="10" fill="#77867f"/>
                        <circle cx="113" cy="55" r="14" fill="#eaf1ed" stroke="#455e52" strokeWidth="4"/>
                        <text x="145" y="98" textAnchor="middle" fontSize="16" fill="#455e52">{th?'คนขับ':'Driver'}</text>
                      </svg> : <svg viewBox="0 0 470 200" aria-hidden="true" style={{position:'absolute',width:'100%',height:'100%',inset:0}}>
                        <rect x="8" y="12" width="454" height="176" rx="50" fill="#f5f1e7" stroke="#9b9586" strokeWidth="4"/>
                        <rect x="35" y="26" width="170" height="148" rx="25" fill="#e8edeb" stroke="#bdc9c7" strokeWidth="2"/>
                        <circle cx="67" cy="65" r="16" fill="none" stroke="#687d79" strokeWidth="6"/>
                        <path d="M112 26 V174 M207 26 V174 M456 55 V148" stroke="#bdc9c7" strokeWidth="3"/>
                        <path d="M120 95 H450" stroke="#c9c2b2" strokeWidth="2" strokeDasharray="6 6"/>
                        <rect x="151" y="102" width="40" height="42" rx="5" fill="#3c4545" opacity=".45"/>
                      </svg>}
                      {(van.id===KATHIN_SUV_ID ? [{n:1,x:31,y:72},{n:2,x:54,y:75},{n:3,x:54,y:50},{n:4,x:54,y:25},{n:5,x:81,y:72},{n:6,x:81,y:28}] : [{n:1,x:37,y:77},{n:2,x:51,y:73},{n:3,x:51,y:49},{n:4,x:51,y:25},
                        {n:5,x:64,y:73},{n:6,x:64,y:49},{n:7,x:64,y:25},
                        {n:8,x:77,y:73},{n:9,x:77,y:49},{n:10,x:77,y:25},
                        {n:11,x:90,y:73},{n:12,x:90,y:49},{n:13,x:90,y:25}])
                        .filter(seat=>seat.n<=van.seat_count)
                        .map(seat=>{
                          const occupied=tripData.occupied.find(b=>b.van_id===van.id && b.seat_number===seat.n);
                          const mine=occupied?.is_mine;
                          return <button key={seat.n} type="button" disabled={tripSaving||tripLoading||tripAdminBusy||(Boolean(occupied)&&!mine)}
                            onClick={()=>{
                              if(user?.isAdmin && !user?.actingAsMember){if(!occupied){setTripAdminPassport('');setTripAdminPending({van_id:van.id,seat_number:seat.n,van_number:van.van_number});}return;}
                              if(mine){setTripSeatPending({van_id:van.id,seat_number:seat.n,van_number:van.van_number,action:'cancel'});return;}
                              if(!occupied){setTripPassportChoice('');setTripSeatPending({van_id:van.id,seat_number:seat.n,van_number:van.van_number,action:'confirm'});}
                            }}
                            aria-label={(th?'รถคันที่ ':'Van ')+van.van_number+(th?' ที่นั่ง ':' seat ')+seat.n+
                              (occupied?' — '+occupied.passenger_name:'')}
                            title={occupied?occupied.passenger_name:(th?'กดเลือกที่นั่ง':'Select seat')}
                            style={{position:'absolute',left:seat.x+'%',top:seat.y+'%',transform:'translate(-50%,-50%)',
                              width:'11%',maxWidth:47,aspectRatio:'1/1',padding:2,overflow:'hidden',
                              borderRadius:7,border:mine?'2px solid #217d4d':'1px solid #998f78',
                              background:mine?'#b4e3c1':occupied?.booking_mode==='placeholder_male'?'#d8eafa':occupied?.booking_mode==='placeholder_female'?'#ffe1ed':occupied?'#dce4e1':'#fffdf5',
                              boxShadow:'0 1px 4px #796b5533',cursor:occupied?'not-allowed':'pointer'}}>
                            {occupied ? <span style={{display:'flex',position:'relative',width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
                              <span style={{width:'84%',height:'84%',aspectRatio:'1/1',borderRadius:'50%',overflow:'hidden',
                                display:'flex',alignItems:'center',justifyContent:'center',
                                border:mine?'2px solid #248253':'2px solid #fff',
                                background:occupied.booking_mode==='placeholder_male'?'#d8eafa':occupied.booking_mode==='placeholder_female'?'#ffe1ed':'#e9f0eb',
                                boxShadow:'0 1px 3px #3332'}}>
                                {occupied.booking_mode==='placeholder_male'?
                                  <svg viewBox="0 0 48 48" role="img" aria-label="สำรองชาย" style={{width:'100%',height:'100%'}}>
                                    <circle cx="24" cy="24" r="24" fill="#cfe5f6"/>
                                    <path d="M6 47c1-11 8-17 18-17s17 6 18 17" fill="#4f86a6"/>
                                    <path d="M18 29h12v8l-6 5-6-5z" fill="#dfab83"/>
                                    <ellipse cx="24" cy="20" rx="11" ry="13" fill="#f2c6a0"/>
                                    <path d="M13 21c-2-13 4-17 11-17 10 0 14 7 11 17l-4-8c-6 3-10 4-16 3z" fill="#364952"/>
                                    <path d="M19 22h2m6 0h2" stroke="#59493e" strokeWidth="1.8" strokeLinecap="round"/>
                                    <path d="M22 27q2 2 4 0" fill="none" stroke="#a65f55" strokeWidth="1.4" strokeLinecap="round"/>
                                  </svg>:
                                  occupied.booking_mode==='placeholder_female'?
                                  <svg viewBox="0 0 48 48" role="img" aria-label="สำรองหญิง" style={{width:'100%',height:'100%'}}>
                                    <circle cx="24" cy="24" r="24" fill="#f9dbe7"/>
                                    <path d="M10 39V20C10 8 17 4 24 4s14 4 14 16v19" fill="#594744"/>
                                    <path d="M5 47c2-11 9-16 19-16s17 5 19 16" fill="#b36f91"/>
                                    <path d="M18 29h12v8l-6 5-6-5z" fill="#dfaa8a"/>
                                    <ellipse cx="24" cy="21" rx="10.5" ry="12.5" fill="#f4c9a9"/>
                                    <path d="M13 20c0-13 8-16 16-14 7 2 8 10 6 15-3-1-5-6-6-10-5 5-10 6-16 6z" fill="#594744"/>
                                    <path d="M19 23h2m6 0h2" stroke="#59493e" strokeWidth="1.8" strokeLinecap="round"/>
                                    <path d="M22 28q2 2 4 0" fill="none" stroke="#b66d70" strokeWidth="1.4" strokeLinecap="round"/>
                                  </svg>:
                                  occupied.picture_url?<img src={occupied.picture_url} alt="" referrerPolicy="no-referrer"
                                    style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
                                    <span aria-label={occupied.passenger_name||'สมาชิก'} style={{fontSize:19}}>👤</span>}
                              </span>
                              <span style={{position:'absolute',bottom:-2,right:-2,fontSize:10,lineHeight:'13px',
                                fontWeight:700,borderRadius:9,padding:'0 3px',background:'#fffdf5',
                                color:'#214536',border:'1px solid #b7b4a4'}}>{seat.n}</span>
                            </span> : <span style={{fontSize:14,color:'#2c4d40',fontWeight:700}}>{seat.n}</span>}
                          </button>;
                        })}
                    </div>
                    <p style={{fontSize:12,color:'#526057'}}>{th?'กดเบาะว่างเพื่อจอง • รูปภาพบนเบาะคือสมาชิกที่จองแล้ว':'Tap an empty seat to reserve • Booked seats show member photos'}</p>
                    {user?.isAdmin && !user?.actingAsMember && tripData.occupied.filter(b=>b.van_id===van.id).length>0 && (
                      <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid #e8e0ce'}}>
                        <strong style={{fontSize:12}}>{th?'จัดการเบาะที่จองแล้ว':'Manage booked seats'}</strong>
                        {tripData.occupied.filter(b=>b.van_id===van.id).map(b=>
                          <div key={b.seat_number} style={{display:'flex',alignItems:'center',gap:8,marginTop:7,fontSize:12}}>
                            {b.picture_url && <img src={b.picture_url} alt="" referrerPolicy="no-referrer"
                              style={{width:26,height:26,objectFit:'cover',borderRadius:'50%'}}/>}
                            <span style={{flex:1}}>{b.seat_number} · {tripAdminSeats.find(a=>a.van_id===van.id && a.seat_number===b.seat_number)?.name||b.passenger_name}
                              <span style={{display:'block',color:'#655c4c',fontSize:11}}>
                                {(()=>{const status=tripAdminSeats.find(a=>a.van_id===van.id && a.seat_number===b.seat_number)?.passport_status;
                                  return status==='has_passport'?'✓ มี Passport':status==='no_passport'?'ไม่มี Passport':'ยังไม่แจ้งสถานะ Passport';})()}
                              </span>
                            </span>
                            <button type="button" onClick={()=>cancelKathinSeat(van.id,b.seat_number,b.passenger_name)}
                              disabled={tripAdminBusy||tripSaving} style={{color:'#973d32',border:'1px solid #e0aea9',background:'#fff8f6',borderRadius:7,padding:'5px 8px'}}>
                              {th?'ยกเลิกจอง':'Cancel'}
                            </button>
                          </div>)}
                      </div>
                    )}
                  </div>)}
                </div>}
                {tripData?.mine && <p style={{fontWeight:700,color:'#276244'}}>{th?'ที่นั่งปัจจุบัน:':'Current seat:'} {th?'รถคันที่':'Van'} {tripData.vans.find(v=>v.id===tripData.mine.van_id)?.van_number} / {th?'เลขที่นั่ง':'Seat'} {tripData.mine.seat_number}</p>}
                <p style={{fontSize:12,color:'#705f43'}}>{th?'สามารถเลือกที่นั่งว่างอื่นเพื่อเปลี่ยนที่นั่งได้ ระบบบันทึกทันทีหลังการเลือก':'Select another available seat to switch. The server saves the selection immediately.'}</p>
              </div>}
              </section>
            </div>
          )}
          {schoolError && <p role="alert" className="memberPortalTileError">{schoolError}</p>}
        </section>


        {/* One persistent working area: native pages render here, external systems
            are framed only when allowed by their own security policies. */}
        <section className="memberPortalWorkspace" aria-label={th ? 'พื้นที่ทำงานบริการสมาชิก' : 'Member service workspace'}>
          <div className="memberPortalWorkspaceHeading">
            <div className="memberPortalWorkspaceHeadingCopy">
              <span className="memberPortalWorkspaceEyebrow">NATHOENG CONNECT / {th ? 'บริการสมาชิก' : 'MEMBER SERVICES'}</span>
              <h2>{th
                ? (memberShortcuts.find(item => item.key === activeService)?.th ||
                    (activeService === 'donation-entry' ? 'บันทึกการทำบุญ' : activeService === 'booking' ? 'จองเข้าพัก' : 'พื้นที่ทำงาน'))
                : (memberShortcuts.find(item => item.key === activeService)?.en ||
                    (activeService === 'donation-entry' ? 'Make a donation' : activeService === 'booking' ? 'Book a retreat' : 'Workspace'))}</h2>
              <p>{th ? 'ใช้งานบริการโดยไม่ต้องออกจากหน้าหลัก NATHOENG CONNECT' :
                'Your member tools in one continuous workspace.'}</p>
            </div>
            <div className="memberPortalWorkspaceActions">
              <button type="button" className="memberPortalWorkspaceBack" onClick={() => showService('overview')}>
                <span aria-hidden="true">⌂</span> {th ? 'ภาพรวม' : 'Overview'}
              </button>
              {serviceFrameSources[activeService] && (
                <a className="memberPortalWorkspacePopout" href={serviceFrameSources[activeService]}
                   target="_blank" rel="noopener noreferrer">
                   ↗ {th ? 'เปิดหน้าต่างใหม่' : 'Open new window'}
                </a>
              )}
              {activeService === 'accounting' && (
                <button type="button" className="memberPortalWorkspacePopout"
                  disabled={accountOpening} onClick={() => openTempleAccounting('window')}>
                  ↗ {th ? 'เปิดหน้าต่างใหม่' : 'Open new window'}
                </button>
              )}
              {activeService === 'school' && (
                <button type="button" className="memberPortalWorkspacePopout"
                  disabled={schoolOpening} onClick={() => openSchool('window')}>
                  ↗ {th ? 'เปิดหน้าต่างใหม่' : 'Open new window'}
                </button>
              )}
            </div>
          </div>
          <div className="memberPortalWorkspaceBody">
            {desktopWorkspace && activeService === 'donations' &&
              <div className="memberPortalNativePage"><DonationListPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'donation-entry' &&
              <div className="memberPortalNativePage"><DonationPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'retreat' &&
              <div className="memberPortalNativePage"><MyStaysPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'booking' &&
              <div className="memberPortalNativePage"><BookingPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'news' &&
              <div className="memberPortalNativePage"><PracticeMessagesPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'checkin' &&
              <div className="memberPortalNativePage"><CheckinPage lang={lang} goToPage={goToWorkspacePage}
                 user={user} handleLineLogin={handleLineLogin} /></div>}
            {desktopWorkspace && activeService === 'stay-process' &&
              <div className="memberPortalNativePage"><StayProcessPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && activeService === 'prepare-stay' &&
              <div className="memberPortalNativePage"><StayPreparationPage lang={lang} goToPage={goToWorkspacePage} /></div>}
            {desktopWorkspace && ['library', 'equipment', 'health', 'kathin'].map(key =>
              openedFrames.includes(key) && (
                <div className="memberPortalRemotePane" key={key} hidden={activeService !== key}>
                  <p className="memberPortalFrameNotice">
                    {th
                      ? 'ระบบนี้เชื่อมจากบริการของวัดโดยตรง หากผู้ให้บริการจำกัดการแสดงในหน้านี้ ให้กด “เปิดหน้าต่างใหม่” ด้านบน'
                      : 'This service runs on its own domain. If embedded viewing is restricted, use Open new window above.'}
                  </p>
                  <iframe className="memberPortalServiceFrame" title={th
                    ? (memberShortcuts.find(item => item.key === key)?.th || key)
                    : (memberShortcuts.find(item => item.key === key)?.en || key)}
                    src={serviceFrameSources[key]} loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin" />
                </div>
              )
            )}
            {desktopWorkspace && (
              <div className="memberPortalRemotePane" hidden={activeService !== 'accounting'}>
                <p className="memberPortalFrameNotice">
                  {th
                    ? 'ระบบบัญชีสงวนสิทธิ์สำหรับผู้ดูแล หากไม่สามารถแสดงในกรอบได้ กรุณาเลือกเปิดหน้าต่างใหม่'
                    : 'Accounting requires admin access. Open in a new window if the embedded view is restricted.'}
                </p>
                {!accountWorkspaceLoaded && <p className="memberPortalWorkspaceHint">{th ? 'เลือก “บัญชีวัด” เพื่อยืนยันสิทธิ์และเปิดระบบ' : 'Select Accounting to authorize access.'}</p>}
                <iframe className="memberPortalServiceFrame" title={th ? 'ระบบบัญชีวัด' : 'Temple accounting'}
                  name="nathoeng_account_workspace" src="about:blank"
                  style={{ display: accountWorkspaceLoaded ? 'block' : 'none' }}
                  referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            )}
            {desktopWorkspace && (
              <div className="memberPortalRemotePane" hidden={activeService !== 'school'}>
                <p className="memberPortalFrameNotice">
                  {th ? 'หากเบราว์เซอร์ไม่อนุญาตให้แสดงระบบ School ในหน้าเดียวกัน ให้เลือกเปิดหน้าต่างใหม่' :
                    'If the school cannot appear in this frame, select Open new window.'}
                </p>
                {!schoolWorkspaceLoaded && <p className="memberPortalWorkspaceHint">{th ? 'เลือก “การเรียนออนไลน์” เพื่อเข้าสู่ระบบ' : 'Select School to sign in.'}</p>}
                {schoolError && <p className="memberPortalTileError" role="alert">{schoolError}</p>}
                <iframe className="memberPortalServiceFrame" title={th ? 'การเรียนออนไลน์' : 'Nathoeng School'}
                  name="nathoeng_school_workspace" src="about:blank"
                  style={{ display: schoolWorkspaceLoaded ? 'block' : 'none' }}
                  referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            )}
          </div>
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
                  <MemberPortalIcon name={infoPanel === 'contact' ? 'contact' : infoPanel.startsWith('account-') ? 'accounting' : infoPanel.startsWith('kathin-') ? 'kathin' : 'settings'} />
                </span>
                <div>
                  <span>NATHOENG CONNECT</span>
                  <h2 id="member-portal-info-title">
                    {infoPanel === 'contact' ? (th ? 'ติดต่อวัด' : 'Contact Monastery') : infoPanel.startsWith('account-') ? (th ? 'บัญชีวัด' : 'Temple Accounting') : infoPanel.startsWith('kathin-') ? (th ? 'งานกฐิน' : 'Kathin Staff') : (th ? 'ข้อมูลสมาชิกและตั้งค่าบัญชี' : 'Profile & Account Settings')}
                  </h2>
                </div>
              </div>
              <button ref={infoCloseRef} type="button" className="memberPortalCardDialogClose"
                onClick={() => setInfoPanel(null)}
                aria-label={th ? 'ปิดหน้าต่าง' : 'Close dialog'}>×</button>
            </header>

            <div className="memberPortalInfoBody">
              {(infoPanel.startsWith('account-') || infoPanel.startsWith('kathin-')) ? (
                <section className="memberPortalAccountNotice" role="alert">
                  <span className="memberPortalAccountNoticeIcon" aria-hidden="true">🔒</span>
                  <p>{['account-denied', 'kathin-denied'].includes(infoPanel)
                    ? (th
                      ? 'ท่านยังไม่สามารถใช้รูปแบบนี้ในขณะนี้ กรุณาติดต่อทางวัด'
                      : 'You cannot use this service at this time. Please contact the monastery.')
                    : (infoPanel === 'kathin-error' ? kathinAccessError : accountError)}</p>
                  <button type="button" className="memberPortalInfoSecondary" onClick={() => setInfoPanel('contact')}>
                    {th ? 'ติดต่อทางวัดผ่าน LINE หรือ Telegram' : 'Contact us via LINE or Telegram'}
                  </button>
                </section>
              ) : infoPanel === 'contact' ? <>
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
                <section className="memberPortalSettingsProfile" aria-label={th ? 'ข้อมูลสมาชิกปัจจุบัน' : 'Current member profile'}>
                  <div className="memberPortalSettingsAvatar">
                    {(profilePicture || user?.picture) && !profileImageError
                      ? <img src={profilePicture || user?.picture}
                          referrerPolicy="no-referrer" alt=""
                          onError={() => setProfileImageError(true)} />
                      : <img src="/icons/meditation.svg" alt="" aria-hidden="true" />}
                  </div>
                  <strong className="memberPortalSettingsName">
                    {identityLoading
                      ? (th ? 'กำลังตรวจสอบข้อมูล...' : 'Checking profile...')
                      : (verifiedFullName || user?.name || (th ? 'สมาชิกนาเทิง' : 'Nathoeng Member'))}
                  </strong>
                  <span className="memberPortalSettingsHint">NATHOENG CONNECT · MEMBER</span>
                  {!user?.actingAsMember && <button type="button" className="memberPortalInfoPrimary"
                    onClick={() => { setInfoPanel(null); openProfileEditor(); }}>
                    {th ? 'แก้ไขข้อมูลส่วนตัว' : 'Edit Personal Information'}
                  </button>}
                </section>
                <section className="memberPortalInfoSection" aria-labelledby="member-access-title">
                  <h3 id="member-access-title">{th ? 'สิทธิ์การเข้าระบบ' : 'System Access Permissions'}</h3>
                  {memberAccessLoading && <p role="status">{th ? 'กำลังตรวจสอบสิทธิ์ล่าสุด...' : 'Checking permissions...'}</p>}
                  {memberAccessError && <p role="status" className="memberPortalInfoError">{memberAccessError}</p>}
                  <div className="memberPortalAccessList">
                    {[
                      { key: 'library', th: 'ห้องสมุด', en: 'Library', icon: 'library' },
                      { key: 'equipment', th: 'ยืม–คืนอุปกรณ์', en: 'Equipment Loans', icon: 'equipment' },
                      { key: 'accounting', th: 'บัญชีวัด', en: 'Temple Accounting', icon: 'accounting' },
                      { key: 'health', th: 'สุขภาพชุมชน', en: 'Community Health', icon: 'health' },
                      { key: 'school', th: 'การเรียนออนไลน์', en: 'Nathoeng School', icon: 'school' },
                      { key: 'kathin', th: 'Staff งานกฐิน', en: 'Kathin Staff', icon: 'kathin' }
                    ].map(item => {
                      const granted = memberAccess?.[item.key] === true;
                      const unknown = !memberAccess || memberAccess[item.key] === null;
                      return <div key={item.key} className={'memberPortalAccessItem ' + (granted ? 'is-allowed' : 'is-unavailable')}>
                        <span className="memberPortalAccessName">
                          <MemberPortalIcon name={item.icon} />
                          <strong>{th ? item.th : item.en}</strong>
                        </span>
                        <span className="memberPortalAccessStatus">
                          <span aria-hidden="true">{granted ? '✓' : unknown ? '!' : '–'}</span>
                          {granted ? (th ? 'อนุญาต' : 'Allowed')
                            : unknown ? (th ? 'ยังตรวจสอบไม่ได้' : 'Not verified')
                              : (th ? 'ยังใช้งานไม่ได้' : 'Not available')}
                        </span>
                      </div>;
                    })}
                  </div>
                </section>
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
