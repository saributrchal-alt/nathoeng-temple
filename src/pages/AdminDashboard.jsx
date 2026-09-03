import React, { useEffect, useMemo, useState } from 'react';
import AdminDonationPanel from './AdminDonationPanel';
import StudentAdminPanel from '../components/StudentAdminPanel';
import AdminPracticeMessagePanel from '../components/AdminPracticeMessagePanel';

function AdminDashboard({ lang, goToPage }) {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [donationLoading, setDonationLoading] = useState(true);
  const [donationError, setDonationError] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationFilter, setDonationFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [lineApprovalTarget, setLineApprovalTarget] = useState(null);
  const [lineApprovalMessage, setLineApprovalMessage] = useState('');
  const [lineApprovalSending, setLineApprovalSending] = useState(false);
  const [lineApprovalError, setLineApprovalError] = useState('');

  const t = {
    en: {
      eyebrow: 'SECURE ADMIN DASHBOARD',
      title: 'Monastery Admin Panel',
      back: '← Back to Home',

      bookingTab: '📅 Stay Management',
      donationTab: '💰 Donations',
      studentTab: '👤 Temple Students',
      practiceMessageTab: '📖 Practice Messages',
      adminMenuTitle: 'Choose a management area',
      adminMenuHelp: 'Data is loaded only after you open a section.',
      studentTitle: 'Temple Student Management',
      studentHelp: 'View temple students and their latest routine information.',
      noStudents: 'No temple students found.',
      backMenu: '← Admin Menu',
      openSection: 'Open',


      totalBookings: 'Total Stay Bookings',
      pendingBookings: 'Pending Approval',
      activeStays: 'Active Stays',
      donationTotal: 'Total Donations',

      bookingTitle: 'Stay Journey Management',
      bookingHelp:
        'Manage each practitioner from booking approval through check-out and stay completion.',

      name: 'Guest / Group',
      phone: 'Phone',
      checkinDate: 'Arrival',
      checkoutDate: 'Departure',
      purpose: 'Purpose',
      accommodation: 'Accommodation',
      status: 'Status',
      action: 'Action',

      noBookings: 'No stay bookings found.',
      loading: 'Loading monastery data...',
      accessError:
        'Unable to load the admin system. Please login again with the administrator LINE account.',

      refresh: 'Refresh',

      approve: 'Approve',
      reject: 'Reject',
      checkIn: 'Check In',
      assignAccommodation: 'Assign Accommodation',
      startRetreat: 'Start Retreat',
      checkOut: 'Check Out',
      complete: 'Complete Stay',
      cancel: 'Cancel',
      lineNotifyApproval: 'LINE Approval Notice',
      lineNotifyTitle: 'Review LINE OA message before sending',
      lineNotifyHelp:
        'This is a bilingual system notification. You can edit the full message before sending.',
      lineNotifyRecipient: 'Recipient',
      lineNotifySend: 'Send via LINE OA',
      lineNotifyCancel: 'Cancel',
      lineNotifySending: 'Sending...',
      lineNotifySuccess: 'LINE OA approval notice sent successfully.',
      lineNotifyError: 'Unable to send LINE OA approval notice.',

      accommodationPrompt:
        'Enter accommodation name, kuti, building, or room:',
      notePrompt: 'Optional admin note:',
      confirmAction: 'Confirm this stay status change?',
      actionSuccess: 'Stay status updated successfully.',
      actionError: 'Unable to update stay status.',

      pending: 'Pending Approval',
      approved: 'Approved',
      checked_in: 'Checked In',
      accommodated: 'Accommodation Assigned',
      in_retreat: 'In Retreat',
      checked_out: 'Checked Out',
      completed: 'Stay Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',

      donationTitle: 'Donation Records',
      donationDate: 'Date / Time',
      donorName: 'Donor Name',
      donationPurpose: 'Purpose',
      receipt: 'Receipt',
      amount: 'Amount',
      noDonations: 'No donation records found.',
      receiptYes: 'Requested',
      receiptNo: 'Not requested',

      donationNotice:
        'Donation records shown here are loaded directly from the monastery database.',
      donationSearch: 'Search donor name',
      donationAll: 'All',
      donationMoney: 'Money',
      donationItem: 'Items',
      donationMoneyCount: 'Money donations',
      donationItemCount: 'Item offerings',
      donationSystemStart:
        'Donation history in this system starts from 2 September 2026.'
    },

    th: {
      eyebrow: 'ระบบจัดการหลังบ้าน (ผู้ดูแลระบบ)',
      title: 'แผงควบคุมข้อมูลวัดพุทธอุทยานนาเทิง',
      back: '← กลับสู่หน้าหลัก',

      bookingTab: '📅 จัดการการเข้าพัก',
      donationTab: '💰 รายการทำบุญ',
      studentTab: '👤 เด็กวัด',
      practiceMessageTab: '📖 เนื้อหาปฏิบัติถึงฉัน',
      adminMenuTitle: 'เลือกเมนูที่ต้องการจัดการ',
      adminMenuHelp: 'ระบบจะโหลดข้อมูลเมื่อกดเข้าแต่ละเมนูเท่านั้น',
      studentTitle: 'จัดการข้อมูลเด็กวัด',
      studentHelp: 'ดูรายชื่อเด็กวัดและข้อมูลกิจวัตรล่าสุด',
      noStudents: 'ยังไม่มีข้อมูลเด็กวัด',
      backMenu: '← เมนูผู้ดูแล',
      openSection: 'เปิดดู',


      totalBookings: 'รายการจองเข้าพักทั้งหมด',
      pendingBookings: 'รออนุมัติ',
      activeStays: 'กำลังเข้าพัก / ปฏิบัติ',
      donationTotal: 'ยอดทำบุญสะสม',

      bookingTitle: 'ระบบจัดการเส้นทางการเข้าพักปฏิบัติธรรม',
      bookingHelp:
        'จัดการผู้เข้าพักตั้งแต่ส่งคำขอ อนุมัติ เช็กอิน จัดที่พัก ปฏิบัติธรรม เช็กเอาต์ จนถึงปิดการเข้าพัก',

      name: 'ผู้จอง / คณะ',
      phone: 'เบอร์โทรศัพท์',
      checkinDate: 'วันที่เข้าพัก',
      checkoutDate: 'วันสิ้นสุด',
      purpose: 'จุดประสงค์',
      accommodation: 'ที่พัก',
      status: 'สถานะ',
      action: 'ดำเนินการ',

      noBookings: 'ยังไม่มีรายการจองเข้าพักในระบบ',
      loading: 'กำลังโหลดข้อมูลระบบวัด...',
      accessError:
        'ไม่สามารถเปิดระบบผู้ดูแลได้ กรุณาเข้าสู่ระบบใหม่ด้วยบัญชี LINE ของผู้ดูแล',

      refresh: 'โหลดใหม่',

      approve: 'อนุมัติ',
      reject: 'ไม่อนุมัติ',
      checkIn: 'เช็กอิน',
      assignAccommodation: 'จัดเข้าที่พัก',
      startRetreat: 'เริ่มปฏิบัติธรรม',
      checkOut: 'เช็กเอาต์',
      complete: 'ปิดการเข้าพัก',
      cancel: 'ยกเลิก',
      lineNotifyApproval: 'แจ้งอนุมัติทาง LINE',
      lineNotifyTitle: 'ตรวจสอบข้อความก่อนส่งทาง LINE OA',
      lineNotifyHelp:
        'ข้อความนี้เป็นข้อความระบบ 2 ภาษา สามารถแก้ไขข้อความทั้งหมดได้ก่อนกดส่ง',
      lineNotifyRecipient: 'ผู้รับ',
      lineNotifySend: 'ส่งทาง LINE OA',
      lineNotifyCancel: 'ยกเลิก',
      lineNotifySending: 'กำลังส่ง...',
      lineNotifySuccess: 'ส่งข้อความแจ้งผลอนุมัติทาง LINE OA เรียบร้อยแล้ว',
      lineNotifyError: 'ไม่สามารถส่งข้อความแจ้งผลอนุมัติทาง LINE OA ได้',

      accommodationPrompt: 'กรอกชื่อกุฏิ อาคาร หรือห้องพัก:',
      notePrompt: 'หมายเหตุของผู้ดูแล (ถ้ามี):',
      confirmAction: 'ยืนยันการเปลี่ยนสถานะรายการนี้หรือไม่?',
      actionSuccess: 'เปลี่ยนสถานะการเข้าพักเรียบร้อยแล้ว',
      actionError: 'ไม่สามารถเปลี่ยนสถานะการเข้าพักได้',

      pending: 'รออนุมัติ',
      approved: 'อนุมัติแล้ว',
      checked_in: 'เช็กอินแล้ว',
      accommodated: 'เข้าที่พักเรียบร้อย',
      in_retreat: 'อยู่ระหว่างปฏิบัติธรรม',
      checked_out: 'เช็กเอาต์แล้ว',
      completed: 'การเข้าพักเสร็จสิ้น',
      rejected: 'ไม่อนุมัติ',
      cancelled: 'ยกเลิก',

      donationTitle: 'ประวัติการทำบุญ',
      donationDate: 'วันเวลา',
      donorName: 'ชื่อ - สกุล',
      donationPurpose: 'วัตถุประสงค์',
      receipt: 'ใบอนุโมทนา',
      amount: 'ยอดเงิน',
      noDonations: 'ยังไม่มีข้อมูลการทำบุญในเครื่องนี้',
      receiptYes: 'ต้องการ',
      receiptNo: 'ไม่ต้องการ',

      donationNotice:
        'รายการทำบุญหน้านี้ดึงจากฐานข้อมูลของวัดโดยตรง',
      donationSearch: 'ค้นหาชื่อผู้บริจาค',
      donationAll: 'ทั้งหมด',
      donationMoney: 'เงิน',
      donationItem: 'สิ่งของ',
      donationMoneyCount: 'รายการทำบุญเป็นเงิน',
      donationItemCount: 'รายการสิ่งของถวาย',
      donationSystemStart:
        'ระบบเริ่มบันทึกประวัติการทำบุญตั้งแต่วันที่ 2 กันยายน 2569 เป็นต้นไป'
    }
  }[lang];

  const statusLabel = (status) => {
    return t[status] || status || '-';
  };

  const statusStyle = (status) => {
    const common = {
      display: 'inline-block',
      padding: '5px 9px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    };

    if (status === 'pending') {
      return {
        ...common,
        background: '#fff3cd',
        color: '#7a5b00'
      };
    }

    if (status === 'approved') {
      return {
        ...common,
        background: '#e8f5e9',
        color: '#2e7d32'
      };
    }

    if (status === 'checked_in') {
      return {
        ...common,
        background: '#e3f2fd',
        color: '#1565c0'
      };
    }

    if (status === 'accommodated') {
      return {
        ...common,
        background: '#ede7f6',
        color: '#5e35b1'
      };
    }

    if (status === 'in_retreat') {
      return {
        ...common,
        background: '#f3e5f5',
        color: '#7b1fa2'
      };
    }

    if (status === 'checked_out') {
      return {
        ...common,
        background: '#eceff1',
        color: '#455a64'
      };
    }

    if (status === 'completed') {
      return {
        ...common,
        background: '#e0f2f1',
        color: '#00695c'
      };
    }

    if (status === 'rejected' || status === 'cancelled') {
      return {
        ...common,
        background: '#ffebee',
        color: '#c62828'
      };
    }

    return {
      ...common,
      background: '#f5f5f5',
      color: '#555'
    };
  };

  const loadBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin-bookings', {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load bookings');
      }

      setBookings(
        Array.isArray(data.bookings)
          ? data.bookings
          : []
      );
    } catch (err) {
      console.error('Admin dashboard load error:', err);
      setError(t.accessError);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    setDonationLoading(true);
    setDonationError('');

    try {
      const response = await fetch('/api/donation?scope=admin', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load donations');
      }

      setDonations(
        Array.isArray(data.donations)
          ? data.donations
          : []
      );
    } catch (err) {
      console.error('Admin donation load error:', err);
      setDonationError(
        lang === 'en'
          ? 'Unable to load donation records.'
          : 'ไม่สามารถโหลดรายการทำบุญได้'
      );
      setDonations([]);
    } finally {
      setDonationLoading(false);
    }
  };


  const loadStudents = async () => {
    setStudentLoading(true);
    setStudentError('');

    try {
      const response = await fetch(
        '/api/student?route=admin-students',
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to load students'
        );
      }

      setStudents(
        Array.isArray(data.students)
          ? data.students
          : []
      );
    } catch (err) {
      console.error('Admin students load error:', err);
      setStudentError(
        lang === 'en'
          ? 'Unable to load temple students.'
          : 'ไม่สามารถโหลดข้อมูลเด็กวัดได้'
      );
      setStudents([]);
    } finally {
      setStudentLoading(false);
    }
  };

  const openAdminSection = async (section) => {
    setActiveTab(section);

    if (section === 'bookings') {
      await loadBookings();
      return;
    }

    if (section === 'donations') {
      await loadDonations();
      return;
    }

    if (
      section === 'students' ||
      section === 'practice-messages'
    ) {
      return;
    }
  };

  const totalDonationAmount = useMemo(() => {
    return donations.reduce(
      (sum, item) =>
        sum + (Number(item.amount) || 0),
      0
    );
  }, [donations]);

  const donationMoneyCount = donations.filter(
    (item) => item.donation_type === 'money'
  ).length;

  const donationItemCount = donations.filter(
    (item) => item.donation_type === 'item'
  ).length;

  const formatDonationDate = (item) => {
    const raw = item?.donation_date || item?.created_at;
    if (!raw) return '—';

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);

    return new Intl.DateTimeFormat(
      lang === 'th' ? 'th-TH' : 'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Bangkok'
      }
    ).format(date);
  };

  const donationPurposeLabel = (item) => {
    const purpose = item?.purpose || '';

    if (purpose === 'custom') {
      return item?.custom_purpose ||
        (lang === 'th' ? 'วัตถุประสงค์เฉพาะ' : 'Specific purpose');
    }

    const labels = {
      general:
        lang === 'th'
          ? 'ทำบุญตามอัธยาศัยทางคณะสงฆ์'
          : 'General donation',
      utilities:
        lang === 'th'
          ? 'เพื่อค่าน้ำ - ค่าไฟวัด'
          : 'Electricity & water expenses',
      development:
        lang === 'th'
          ? 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ'
          : 'Monastery development & maintenance'
    };

    return labels[purpose] || purpose || '—';
  };

  const filteredDonations = useMemo(() => {
    const search = donationSearch.trim().toLowerCase();

    return donations.filter((item) => {
      if (
        donationFilter !== 'all' &&
        item.donation_type !== donationFilter
      ) {
        return false;
      }

      if (!search) return true;

      return String(
        item.donor_name_snapshot || ''
      ).toLowerCase().includes(search);
    });
  }, [donations, donationSearch, donationFilter]);

  const pendingCount = bookings.filter(
    (item) => item.status === 'pending'
  ).length;

  const activeCount = bookings.filter(
    (item) =>
      item.status === 'checked_in' ||
      item.status === 'accommodated' ||
      item.status === 'in_retreat'
  ).length;

  const formatStayDateForLine = (raw, locale) => {
    if (!raw) return '-';

    const date = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(raw);

    return new Intl.DateTimeFormat(
      locale,
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Bangkok'
      }
    ).format(date);
  };

  const buildApprovalLineMessage = (booking) => {
    const name =
      String(booking?.name || '').trim();

    const startTh =
      formatStayDateForLine(
        booking?.start_date,
        'th-TH'
      );

    const endTh =
      formatStayDateForLine(
        booking?.end_date,
        'th-TH'
      );

    const startEn =
      formatStayDateForLine(
        booking?.start_date,
        'en-GB'
      );

    const endEn =
      formatStayDateForLine(
        booking?.end_date,
        'en-GB'
      );

    return [
      '🙏 วัดพุทธอุทยานนาเทิง',
      'แจ้งผลคำขอเข้าพักปฏิบัติธรรม',
      '',
      name ? `เรียน คุณ ${name}` : 'เรียน ผู้ปฏิบัติธรรม',
      'คำขอเข้าพักปฏิบัติธรรมของท่านได้รับการอนุมัติแล้วครับ',
      `กำหนดเข้าพัก: ${startTh} - ${endTh}`,
      '',
      'กรุณาศึกษาระเบียบการเข้าพักและเตรียมตัวก่อนเดินทาง',
      'สามารถติดตามสถานะและขั้นตอนต่อไปได้ที่ “บัญชีของฉัน → การเข้าพักของฉัน”',
      '',
      'วัดพุทธอุทยานนาเทิง',
      'NATHOENG CONNECT',
      '',
      '------------------------------',
      '',
      '🙏 Buddhist Park Monastery of Nathoeng',
      'Retreat Stay Request Update',
      '',
      name ? `Dear ${name},` : 'Dear Practitioner,',
      'Your retreat stay request has been approved.',
      `Stay period: ${startEn} - ${endEn}`,
      '',
      'Please review the monastery stay guidelines and prepare before your arrival.',
      'You can follow your status and next steps in “My Account → My Retreat Stays.”',
      '',
      'Buddhist Park Monastery of Nathoeng',
      'NATHOENG CONNECT'
    ].join('\n');
  };

  const openApprovalLineNotification = (booking) => {
    setLineApprovalTarget(booking);
    setLineApprovalMessage(
      buildApprovalLineMessage(booking)
    );
    setLineApprovalError('');
  };

  const closeApprovalLineNotification = () => {
    if (lineApprovalSending) return;

    setLineApprovalTarget(null);
    setLineApprovalMessage('');
    setLineApprovalError('');
  };

  const sendApprovalLineNotification = async () => {
    if (!lineApprovalTarget?.id) return;

    const messageText =
      String(lineApprovalMessage || '').trim();

    if (!messageText) {
      setLineApprovalError(
        lang === 'th'
          ? 'กรุณากรอกข้อความก่อนส่ง'
          : 'Please enter a message before sending.'
      );
      return;
    }

    if (messageText.length > 5000) {
      setLineApprovalError(
        lang === 'th'
          ? 'ข้อความยาวเกิน 5,000 ตัวอักษร'
          : 'Message exceeds 5,000 characters.'
      );
      return;
    }

    const confirmed = window.confirm(
      lang === 'th'
        ? 'ยืนยันส่งข้อความนี้ทาง LINE OA ถึงผู้สมัครหรือไม่?'
        : 'Send this approval message to the applicant via LINE OA?'
    );

    if (!confirmed) return;

    setLineApprovalSending(true);
    setLineApprovalError('');

    try {
      const response = await fetch(
        '/api/stay-line-notify',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookingId: lineApprovalTarget.id,
            event: 'approved',
            messageText
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          t.lineNotifyError
        );
      }

      window.alert(t.lineNotifySuccess);
      closeApprovalLineNotification();
    } catch (err) {
      console.error(
        'Stay LINE approval notification error:',
        err
      );

      setLineApprovalError(
        err.message ||
        t.lineNotifyError
      );
    } finally {
      setLineApprovalSending(false);
    }
  };

  const callStayAction = async (booking, action) => {
    let accommodationName = '';
    let note = '';

    if (action === 'assign_accommodation') {
      accommodationName = window.prompt(
        t.accommodationPrompt,
        booking.accommodation_name || ''
      );

      if (
        accommodationName === null ||
        !accommodationName.trim()
      ) {
        return;
      }
    }

    if (action === 'reject' || action === 'cancel') {
      note = window.prompt(
        t.notePrompt,
        ''
      );

      if (note === null) {
        return;
      }
    } else {
      const confirmed = window.confirm(
        t.confirmAction
      );

      if (!confirmed) {
        return;
      }
    }

    setProcessingId(booking.id);

    try {
      const response = await fetch(
        '/api/update-stay-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookingId: booking.id,
            action: action,
            accommodationName: accommodationName,
            note: note
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || t.actionError
        );
      }

      await loadBookings();

      if (action === 'approve') {
        openApprovalLineNotification({
          ...booking,
          status: 'approved'
        });
      } else {
        alert(t.actionSuccess);
      }
    } catch (err) {
      console.error('Stay action error:', err);

      alert(
        err.message || t.actionError
      );
    } finally {
      setProcessingId(null);
    }
  };

  const actionButtonStyle = {
    border: 'none',
    padding: '7px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  };

  const renderActions = (booking) => {
    const busy =
      processingId === booking.id;

    if (booking.status === 'pending') {
      return (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}
        >
          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'approve'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#2e7d32',
              color: '#fff'
            }}
          >
            {t.approve}
          </button>

          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'reject'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#c62828',
              color: '#fff'
            }}
          >
            {t.reject}
          </button>
        </div>
      );
    }

    if (booking.status === 'approved') {
      return (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}
        >
          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'check_in'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#1565c0',
              color: '#fff'
            }}
          >
            {t.checkIn}
          </button>

          <button
            disabled={busy}
            onClick={() =>
              openApprovalLineNotification(
                booking
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#06c755',
              color: '#fff'
            }}
          >
            {t.lineNotifyApproval}
          </button>

          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'cancel'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#736f66',
              color: '#fff'
            }}
          >
            {t.cancel}
          </button>
        </div>
      );
    }

    if (booking.status === 'checked_in') {
      return (
        <button
          disabled={busy}
          onClick={() =>
            callStayAction(
              booking,
              'assign_accommodation'
            )
          }
          style={{
            ...actionButtonStyle,
            background: '#7e57c2',
            color: '#fff'
          }}
        >
          {t.assignAccommodation}
        </button>
      );
    }

    if (booking.status === 'accommodated') {
      return (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}
        >
          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'start_retreat'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#8e24aa',
              color: '#fff'
            }}
          >
            {t.startRetreat}
          </button>

          <button
            disabled={busy}
            onClick={() =>
              callStayAction(
                booking,
                'check_out'
              )
            }
            style={{
              ...actionButtonStyle,
              background: '#546e7a',
              color: '#fff'
            }}
          >
            {t.checkOut}
          </button>
        </div>
      );
    }

    if (booking.status === 'in_retreat') {
      return (
        <button
          disabled={busy}
          onClick={() =>
            callStayAction(
              booking,
              'check_out'
            )
          }
          style={{
            ...actionButtonStyle,
            background: '#546e7a',
            color: '#fff'
          }}
        >
          {t.checkOut}
        </button>
      );
    }

    if (booking.status === 'checked_out') {
      return (
        <button
          disabled={busy}
          onClick={() =>
            callStayAction(
              booking,
              'complete'
            )
          }
          style={{
            ...actionButtonStyle,
            background: '#00695c',
            color: '#fff'
          }}
        >
          {t.complete}
        </button>
      );
    }

    return (
      <span
        style={{
          fontSize: '12px',
          color: '#888'
        }}
      >
        —
      </span>
    );
  };

  if (activeTab === 'menu') {
    const menuItems = [
      {
        key: 'bookings',
        icon: '/icons/stay.svg',
        title: t.bookingTab,
        text:
          lang === 'en'
            ? 'Approvals, check-in, accommodation and retreat progress.'
            : 'อนุมัติ เช็กอิน จัดที่พัก และติดตามการเข้าพักปฏิบัติธรรม'
      },
      {
        key: 'donations',
        icon: '/icons/donation.svg',
        title: t.donationTab,
        text:
          lang === 'en'
            ? 'Donation totals, donor records, money and item offerings.'
            : 'ยอดทำบุญ รายชื่อผู้บริจาค เงิน และสิ่งของถวาย'
      },
      {
        key: 'students',
        icon: '/icons/profile.svg',
        title: t.studentTab,
        text:
          lang === 'en'
            ? 'Temple students, daily routine and latest status.'
            : 'รายชื่อเด็กวัด กิจวัตรประจำวัน และสถานะล่าสุด'
      },
      {
        key: 'practice-messages',
        icon: '/icons/dhamma-book.svg',
        title: t.practiceMessageTab,
        text:
          lang === 'en'
            ? 'One-way practice guidance for all practitioners or a selected member.'
            : 'ฝากข้อความและแนวทางปฏิบัติแบบทางเดียว ถึงผู้ปฏิบัติทุกคนหรือเฉพาะบุคคล'
      }
    ];

    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '880px',
            paddingBottom: '60px'
          }}
        >
          <button
            className="backButton"
            onClick={() => goToPage('home')}
          >
            {t.back}
          </button>

          <div style={{ marginBottom: '24px' }}>
            <span className="eyebrow">
              {t.eyebrow}
            </span>

            <h1 style={{ marginBottom: '8px' }}>
              {t.title}
            </h1>

            <h2
              style={{
                margin: '20px 0 6px',
                fontSize: '21px',
                color: '#332f29'
              }}
            >
              {t.adminMenuTitle}
            </h2>

            <p
              style={{
                margin: 0,
                color: '#756c60',
                lineHeight: 1.6
              }}
            >
              {t.adminMenuHelp}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px'
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  openAdminSection(item.key)
                }
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '18px',
                  border: '1px solid #e1d8ca',
                  borderRadius: '18px',
                  background: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow:
                    '0 4px 14px rgba(73,59,39,0.05)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '13px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      flex: '0 0 48px',
                      borderRadius: '14px',
                      background: '#f6f1e7',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      style={{
                        width: '27px',
                        height: '27px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display =
                          'none';
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '18px',
                        color: '#332f29',
                        marginBottom: '6px'
                      }}
                    >
                      {item.title}
                    </strong>

                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.55,
                        color: '#756c60'
                      }}
                    >
                      {item.text}
                    </div>

                    <div
                      style={{
                        marginTop: '14px',
                        color: '#9b7226',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}
                    >
                      {t.openSection} →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'students') {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '980px',
            paddingBottom: '70px'
          }}
        >
          <button
            type="button"
            className="backButton"
            onClick={() =>
              setActiveTab('menu')
            }
          >
            {t.backMenu}
          </button>

          <StudentAdminPanel
            lang={lang}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'practice-messages') {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '900px',
            paddingBottom: '70px'
          }}
        >
          <button
            type="button"
            className="backButton"
            onClick={() =>
              setActiveTab('menu')
            }
          >
            {t.backMenu}
          </button>

          <AdminPracticeMessagePanel
            lang={lang}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="guidePage"
        style={{
          textAlign: 'center',
          padding: '100px 20px'
        }}
      >
        {t.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '650px',
            textAlign: 'center',
            padding: '60px 20px'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '15px'
            }}
          >
            🔒
          </div>

          <h2
            style={{
              color: '#c62828'
            }}
          >
            {t.accessError}
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '25px'
            }}
          >
            <button
              onClick={() =>
                goToPage('login-page')
              }
              className="primaryContactBtn"
            >
              {lang === 'en'
                ? 'Go to Login'
                : 'ไปหน้าเข้าสู่ระบบ'}
            </button>

            <button
              onClick={loadBookings}
              className="primaryContactBtn"
              style={{
                background: '#736f66'
              }}
            >
              {t.refresh}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{
          maxWidth: '1200px'
        }}
      >
        <button
          className="backButton"
          onClick={() =>
            goToPage('home')
          }
        >
          {t.back}
        </button>

        <div
          style={{
            marginBottom: '25px'
          }}
        >
          <span className="eyebrow">
            {t.eyebrow}
          </span>

          <h1
            style={{
              marginBottom: '5px'
            }}
          >
            {t.title}
          </h1>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}
        >
          <div
            style={{
              background: '#f6f4ef',
              padding: '18px',
              border: '1px solid #dcd5c8',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#777'
              }}
            >
              {t.totalBookings}
            </div>

            <div
              style={{
                fontSize: '28px',
                marginTop: '5px'
              }}
            >
              {bookings.length}
            </div>
          </div>

          <div
            style={{
              background: '#f6f4ef',
              padding: '18px',
              border: '1px solid #dcd5c8',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#777'
              }}
            >
              {t.pendingBookings}
            </div>

            <div
              style={{
                fontSize: '28px',
                marginTop: '5px',
                color: '#9b7226'
              }}
            >
              {pendingCount}
            </div>
          </div>

          <div
            style={{
              background: '#f6f4ef',
              padding: '18px',
              border: '1px solid #dcd5c8',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#777'
              }}
            >
              {t.activeStays}
            </div>

            <div
              style={{
                fontSize: '28px',
                marginTop: '5px',
                color: '#2e7d32'
              }}
            >
              {activeCount}
            </div>
          </div>

          <div
            style={{
              background: '#f6f4ef',
              padding: '18px',
              border: '1px solid #dcd5c8',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#777'
              }}
            >
              {t.donationTotal}
            </div>

            <div
              style={{
                fontSize: '28px',
                marginTop: '5px',
                color: '#9b7226'
              }}
            >
              {totalDonationAmount.toLocaleString()} ฿
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            borderBottom: '1px solid #dcd5c8',
            paddingBottom: '12px',
            marginBottom: '25px'
          }}
        >
          <button
            onClick={() =>
              openAdminSection('bookings')
            }
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              background:
                activeTab === 'bookings'
                  ? '#9b7226'
                  : '#f5f5f5',
              color:
                activeTab === 'bookings'
                  ? '#fff'
                  : '#332f2a'
            }}
          >
            {t.bookingTab}
          </button>

          <button
            onClick={() =>
              openAdminSection('donations')
            }
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              background:
                activeTab === 'donations'
                  ? '#9b7226'
                  : '#f5f5f5',
              color:
                activeTab === 'donations'
                  ? '#fff'
                  : '#332f2a'
            }}
          >
            {t.donationTab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            style={{
              marginLeft: 'auto',
              padding: '9px 14px',
              border: '1px solid #dcd5c8',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {t.backMenu}
          </button>

          <button
            onClick={() =>
              activeTab === 'donations'
                ? loadDonations()
                : loadBookings()
            }
            style={{
              padding: '9px 14px',
              padding: '9px 14px',
              border: '1px solid #dcd5c8',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ↻ {t.refresh}
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <div>
            <h3>
              {t.bookingTitle}
            </h3>

            <p
              style={{
                color: '#625d55',
                marginBottom: '20px'
              }}
            >
              {t.bookingHelp}
            </p>

            <div
              style={{
                overflowX: 'auto'
              }}
            >
              <table
                style={{
                  width: '100%',
                  minWidth: '1100px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f6f4ef',
                      borderBottom: '1px solid #dcd5c8'
                    }}
                  >
                    <th style={{ padding: '11px' }}>
                      {t.name}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.phone}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.checkinDate}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.checkoutDate}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.purpose}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.accommodation}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.status}
                    </th>

                    <th style={{ padding: '11px' }}>
                      {t.action}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: 'center',
                          padding: '35px',
                          color: '#888'
                        }}
                      >
                        {t.noBookings}
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        style={{
                          borderBottom: '1px solid #eeeae2'
                        }}
                      >
                        <td
                          style={{
                            padding: '11px',
                            fontWeight: '600'
                          }}
                        >
                          {booking.name}
                        </td>

                        <td style={{ padding: '11px' }}>
                          {booking.phone || '-'}
                        </td>

                        <td style={{ padding: '11px' }}>
                          {booking.start_date || '-'}
                        </td>

                        <td style={{ padding: '11px' }}>
                          {booking.end_date || '-'}
                        </td>

                        <td style={{ padding: '11px' }}>
                          {booking.purpose || '-'}
                        </td>

                        <td style={{ padding: '11px' }}>
                          {booking.accommodation_name || '-'}
                        </td>

                        <td style={{ padding: '11px' }}>
                          <span
                            style={statusStyle(
                              booking.status
                            )}
                          >
                            {statusLabel(
                              booking.status
                            )}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: '11px',
                            minWidth: '175px'
                          }}
                        >
                          {processingId === booking.id ? (
                            <span
                              style={{
                                color: '#777'
                              }}
                            >
                              {lang === 'en'
                                ? 'Processing...'
                                : 'กำลังดำเนินการ...'}
                            </span>
                          ) : (
                            renderActions(booking)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <AdminDonationPanel
            lang={lang}
            t={t}
            donationLoading={donationLoading}
            donationError={donationError}
            donationSearch={donationSearch}
            setDonationSearch={setDonationSearch}
            donationFilter={donationFilter}
            setDonationFilter={setDonationFilter}
            loadDonations={loadDonations}
            totalDonationAmount={totalDonationAmount}
            donationMoneyCount={donationMoneyCount}
            donationItemCount={donationItemCount}
            filteredDonations={filteredDonations}
            formatDonationDate={formatDonationDate}
            donationPurposeLabel={donationPurposeLabel}
          />
        )}

        {lineApprovalTarget && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.lineNotifyTitle}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(34, 30, 25, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px'
            }}
            onClick={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeApprovalLineNotification();
              }
            }}
          >
            <div
              style={{
                width: 'min(720px, 100%)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '14px',
                padding: '22px',
                boxShadow:
                  '0 22px 60px rgba(0,0,0,0.24)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#06a944',
                      fontSize: '12px',
                      fontWeight: '800',
                      marginBottom: '5px'
                    }}
                  >
                    LINE OA · NATHOENG CONNECT
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: '#302d29'
                    }}
                  >
                    {t.lineNotifyTitle}
                  </h3>
                </div>

                <button
                  type="button"
                  disabled={lineApprovalSending}
                  onClick={closeApprovalLineNotification}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#777'
                  }}
                  aria-label={t.lineNotifyCancel}
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  margin: '0 0 12px',
                  color: '#6c675f',
                  lineHeight: 1.55
                }}
              >
                {t.lineNotifyHelp}
              </p>

              <div
                style={{
                  background: '#f5faf6',
                  border: '1px solid #dcefe1',
                  borderRadius: '9px',
                  padding: '10px 12px',
                  marginBottom: '12px'
                }}
              >
                <strong>
                  {t.lineNotifyRecipient}:
                </strong>{' '}
                {lineApprovalTarget.name || '-'}
                <br />
                <span
                  style={{
                    color: '#777',
                    fontSize: '13px'
                  }}
                >
                  {lineApprovalTarget.start_date || '-'}
                  {' → '}
                  {lineApprovalTarget.end_date || '-'}
                </span>
              </div>

              <textarea
                value={lineApprovalMessage}
                onChange={(event) =>
                  setLineApprovalMessage(
                    event.target.value
                  )
                }
                disabled={lineApprovalSending}
                rows={22}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  border: '1px solid #d9d5ce',
                  borderRadius: '9px',
                  padding: '12px',
                  font: 'inherit',
                  lineHeight: 1.55,
                  color: '#302d29',
                  background: '#fff'
                }}
              />

              <div
                style={{
                  marginTop: '6px',
                  textAlign: 'right',
                  fontSize: '12px',
                  color:
                    lineApprovalMessage.length > 5000
                      ? '#c62828'
                      : '#888'
                }}
              >
                {lineApprovalMessage.length.toLocaleString()}
                {' / 5,000'}
              </div>

              {lineApprovalError && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#fff0f0',
                    color: '#b42318'
                  }}
                >
                  {lineApprovalError}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '9px',
                  marginTop: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  disabled={lineApprovalSending}
                  onClick={closeApprovalLineNotification}
                  style={{
                    ...actionButtonStyle,
                    padding: '10px 16px',
                    background: '#f2f0ec',
                    color: '#4e4a44'
                  }}
                >
                  {t.lineNotifyCancel}
                </button>

                <button
                  type="button"
                  disabled={
                    lineApprovalSending ||
                    !lineApprovalMessage.trim() ||
                    lineApprovalMessage.length > 5000
                  }
                  onClick={sendApprovalLineNotification}
                  style={{
                    ...actionButtonStyle,
                    padding: '10px 16px',
                    background: '#06c755',
                    color: '#fff',
                    opacity:
                      lineApprovalSending ||
                      !lineApprovalMessage.trim() ||
                      lineApprovalMessage.length > 5000
                        ? 0.6
                        : 1
                  }}
                >
                  {lineApprovalSending
                    ? t.lineNotifySending
                    : t.lineNotifySend}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;