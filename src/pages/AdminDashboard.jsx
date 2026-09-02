import React, { useEffect, useMemo, useState } from 'react';

function AdminDashboard({ lang, goToPage }) {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [donationLoading, setDonationLoading] = useState(true);
  const [donationError, setDonationError] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationFilter, setDonationFilter] = useState('all');

  const t = {
    en: {
      eyebrow: 'SECURE ADMIN DASHBOARD',
      title: 'Monastery Admin Panel',
      back: '← Back to Home',

      bookingTab: '📅 Stay Management',
      donationTab: '💰 Donations',

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

  useEffect(() => {
    loadBookings();
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      alert(t.actionSuccess);
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
              setActiveTab('bookings')
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
              setActiveTab('donations')
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
            onClick={loadBookings}
            style={{
              marginLeft: 'auto',
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
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  {t.donationTitle}
                </h3>
                <div
                  style={{
                    marginTop: '5px',
                    color: '#7a7066',
                    fontSize: '12px'
                  }}
                >
                  {t.donationSystemStart}
                </div>
              </div>

              <button
                type="button"
                onClick={loadDonations}
                style={{
                  minHeight: '42px',
                  padding: '0 14px',
                  border: '1px solid #d8ccb9',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#6e5a3b',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t.refresh}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '10px',
                marginBottom: '14px'
              }}
            >
              <div
                style={{
                  padding: '14px',
                  border: '1px solid #e4ddd2',
                  borderRadius: '16px',
                  background: '#fff'
                }}
              >
                <div style={{ color: '#777', fontSize: '11px' }}>
                  {t.donationTotal}
                </div>
                <strong
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    color: '#236b4a',
                    fontSize: '22px'
                  }}
                >
                  {Number(totalDonationAmount || 0).toLocaleString()}
                  {' '}
                  ฿
                </strong>
              </div>

              <div
                style={{
                  padding: '14px',
                  border: '1px solid #e4ddd2',
                  borderRadius: '16px',
                  background: '#fff'
                }}
              >
                <div style={{ color: '#777', fontSize: '11px' }}>
                  {t.donationMoneyCount}
                </div>
                <strong
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    color: '#9b7226',
                    fontSize: '22px'
                  }}
                >
                  {donationMoneyCount}
                </strong>
              </div>

              <div
                style={{
                  padding: '14px',
                  border: '1px solid #e4ddd2',
                  borderRadius: '16px',
                  background: '#fff'
                }}
              >
                <div style={{ color: '#777', fontSize: '11px' }}>
                  {t.donationItemCount}
                </div>
                <strong
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    color: '#9b7226',
                    fontSize: '22px'
                  }}
                >
                  {donationItemCount}
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                marginBottom: '14px',
                background: '#fff8e8',
                border: '1px solid #ead5a7',
                borderRadius: '14px',
                color: '#725515',
                fontSize: '12px',
                lineHeight: 1.6
              }}
            >
              {t.donationNotice}
            </div>

            <input
              type="search"
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              placeholder={t.donationSearch}
              style={{
                width: '100%',
                minHeight: '46px',
                boxSizing: 'border-box',
                padding: '0 14px',
                marginBottom: '10px',
                border: '1px solid #ddd3c6',
                borderRadius: '14px',
                background: '#fff',
                font: 'inherit'
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              {[
                ['all', t.donationAll],
                ['money', t.donationMoney],
                ['item', t.donationItem]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDonationFilter(value)}
                  style={{
                    minHeight: '40px',
                    padding: '0 14px',
                    border:
                      donationFilter === value
                        ? '1px solid #9b7226'
                        : '1px solid #ddd3c6',
                    borderRadius: '999px',
                    background:
                      donationFilter === value
                        ? '#fff7e7'
                        : '#fff',
                    color:
                      donationFilter === value
                        ? '#8a611d'
                        : '#655d55',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {donationLoading ? (
              <div
                style={{
                  padding: '34px 16px',
                  textAlign: 'center',
                  color: '#777'
                }}
              >
                {t.loading}
              </div>
            ) : donationError ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  border: '1px solid #eaded2',
                  borderRadius: '16px',
                  background: '#fff'
                }}
              >
                <div style={{ color: '#a2463d', marginBottom: '12px' }}>
                  {donationError}
                </div>
                <button
                  type="button"
                  onClick={loadDonations}
                  style={{
                    minHeight: '42px',
                    padding: '0 18px',
                    border: 0,
                    borderRadius: '12px',
                    background: '#9b7226',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t.refresh}
                </button>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div
                style={{
                  padding: '34px 16px',
                  textAlign: 'center',
                  border: '1px solid #eee8df',
                  borderRadius: '16px',
                  background: '#fff',
                  color: '#777'
                }}
              >
                {t.noDonations}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '12px'
                }}
              >
                {filteredDonations.map((item) => {
                  const isMoney =
                    item.donation_type === 'money';

                  return (
                    <article
                      key={item.id}
                      style={{
                        border: '1px solid #e4ddd2',
                        borderRadius: '18px',
                        background: '#fff',
                        padding: '16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              color: '#9b7226',
                              fontSize: '12px',
                              fontWeight: 800
                            }}
                          >
                            {isMoney
                              ? t.donationMoney
                              : t.donationItem}
                          </div>

                          <strong
                            style={{
                              display: 'block',
                              marginTop: '3px',
                              color: '#302d29',
                              fontSize: '16px',
                              overflowWrap: 'anywhere'
                            }}
                          >
                            {item.donor_name_snapshot || '—'}
                          </strong>

                          <div
                            style={{
                              marginTop: '4px',
                              color: '#888',
                              fontSize: '12px'
                            }}
                          >
                            {formatDonationDate(item)}
                          </div>
                        </div>

                        {isMoney ? (
                          <strong
                            style={{
                              flex: '0 0 auto',
                              color: '#236b4a',
                              fontSize: '21px'
                            }}
                          >
                            {Number(item.amount || 0).toLocaleString()}
                            {' '}
                            ฿
                          </strong>
                        ) : (
                          <img
                            src="/icons/lotus.svg"
                            alt=""
                            aria-hidden="true"
                            style={{
                              width: '30px',
                              height: '30px'
                            }}
                          />
                        )}
                      </div>

                      {!isMoney && (
                        <div
                          style={{
                            marginTop: '13px',
                            padding: '11px 12px',
                            borderRadius: '12px',
                            background: '#faf8f4'
                          }}
                        >
                          <strong>{item.item_name || '—'}</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              color: '#8a611d',
                              fontWeight: 700
                            }}
                          >
                            {item.quantity ?? '—'}
                            {item.unit ? ` ${item.unit}` : ''}
                          </span>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gap: '7px',
                          marginTop: '13px',
                          color: '#625d55',
                          fontSize: '12px',
                          lineHeight: 1.5
                        }}
                      >
                        <div>
                          <strong>{t.donationPurpose}: </strong>
                          {donationPurposeLabel(item)}
                        </div>

                        {isMoney && (
                          <div>
                            <strong>{t.receipt}: </strong>
                            {item.receipt_requested === true
                              ? t.receiptYes
                              : t.receiptNo}
                          </div>
                        )}

                        {item.note && (
                          <div>
                            <strong>
                              {lang === 'en' ? 'Note' : 'หมายเหตุ'}:
                            </strong>
                            {' '}
                            {item.note}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;