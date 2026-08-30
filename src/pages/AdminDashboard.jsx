import React, { useEffect, useMemo, useState } from 'react';
import StudentAdminPanel from '../components/StudentAdminPanel';

function AdminDashboard({ lang, goToPage }) {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

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
      assignAccommodation: 'Assign / Change Room',
      confirmAccommodation: 'Confirm Accommodation',
      startRetreat: 'Start Retreat',
      checkOut: 'Check Out',
      complete: 'Complete Stay',
      cancel: 'Cancel',

      accommodationPrompt:
        'Select the assigned accommodation:',
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
        'Donation records are still using the existing local system for now.'
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
      assignAccommodation: 'จัด / เปลี่ยนห้องพัก',
      confirmAccommodation: 'ยืนยันเข้าที่พัก',
      startRetreat: 'เริ่มปฏิบัติธรรม',
      checkOut: 'เช็กเอาต์',
      complete: 'ปิดการเข้าพัก',
      cancel: 'ยกเลิก',

      accommodationPrompt: 'เลือกห้องพักที่จัดสรรให้ผู้เข้าพัก:',
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
        'ข้อมูลการทำบุญยังใช้ระบบเดิมในเครื่องอยู่ชั่วคราว'
    }
  }[lang];

  const accommodationOptions = [
    'กุฏิยอดคำ ห้อง 2',
    'กุฏิสกุลคุณสวัสดิ์ 1 ห้อง 1',
    'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 1',
    'กุฏิสกุลคุณสวัสดิ์ 2 ห้อง 2',
    'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 1',
    'กุฏิสกุลคุณสวัสดิ์ 3 ห้อง 2'
  ];

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

  useEffect(() => {
    const savedDonations = JSON.parse(
      localStorage.getItem('nathoeng_donations') || '[]'
    );

    setDonations(savedDonations);
    loadBookings();
  }, []);

  const totalDonationAmount = useMemo(() => {
    return donations.reduce(
      (sum, item) =>
        sum + (Number(item.amount) || 0),
      0
    );
  }, [donations]);

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
      /*
        Admin เลือกห้องจากรายการที่กำหนดไว้เท่านั้น
        ใช้เลข 1-6 เพื่อป้องกันการพิมพ์ชื่อห้องผิด
        ซึ่งสำคัญต่อการตรวจ QR ของแต่ละห้อง
      */
      const currentIndex =
        accommodationOptions.indexOf(
          booking.accommodation_name || ''
        );

      const optionText =
        accommodationOptions
          .map(
            (name, index) =>
              `${index + 1}. ${name}`
          )
          .join('\n');

      const selected =
        window.prompt(
          lang === 'th'
            ? `เลือกห้องพักที่จัดสรรให้ผู้เข้าพัก\n\n${optionText}\n\nกรอกหมายเลข 1-6:`
            : `Select the assigned accommodation\n\n${optionText}\n\nEnter number 1-6:`,
          currentIndex >= 0
            ? String(currentIndex + 1)
            : ''
        );

      if (selected === null) {
        return;
      }

      const selectedIndex =
        Number(selected.trim()) - 1;

      if (
        !Number.isInteger(
          selectedIndex
        ) ||
        selectedIndex < 0 ||
        selectedIndex >=
          accommodationOptions.length
      ) {
        alert(
          lang === 'th'
            ? 'กรุณาเลือกหมายเลขห้อง 1-6'
            : 'Please select accommodation number 1-6.'
        );
        return;
      }

      accommodationName =
        accommodationOptions[
          selectedIndex
        ];
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

          <button
            disabled={
              busy ||
              !booking.accommodation_name
            }
            onClick={() =>
              callStayAction(
                booking,
                'confirm_accommodation'
              )
            }
            style={{
              ...actionButtonStyle,
              background:
                booking.accommodation_name
                  ? '#5e35b1'
                  : '#c9c4cf',
              color: '#fff',
              cursor:
                booking.accommodation_name
                  ? 'pointer'
                  : 'not-allowed'
            }}
            title={
              booking.accommodation_name
                ? ''
                : (
                    lang === 'th'
                      ? 'กรุณาจัดห้องพักก่อน'
                      : 'Please assign a room first'
                  )
            }
          >
            {t.confirmAccommodation}
          </button>
        </div>
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

        <StudentAdminPanel lang={lang} />

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
            <h3>
              {t.donationTitle}
            </h3>

            <div
              style={{
                padding: '12px 15px',
                marginBottom: '15px',
                background: '#fff8e1',
                border: '1px solid #ffe0a3',
                borderRadius: '4px',
                color: '#725515',
                fontSize: '13px'
              }}
            >
              {t.donationNotice}
            </div>

            <div
              style={{
                overflowX: 'auto'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f6f4ef',
                      borderBottom: '1px solid #dcd5c8'
                    }}
                  >
                    <th style={{ padding: '12px' }}>
                      {t.donationDate}
                    </th>

                    <th style={{ padding: '12px' }}>
                      {t.donorName}
                    </th>

                    <th style={{ padding: '12px' }}>
                      {t.donationPurpose}
                    </th>

                    <th style={{ padding: '12px' }}>
                      {t.receipt}
                    </th>

                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'right'
                      }}
                    >
                      {t.amount}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: '30px',
                          textAlign: 'center',
                          color: '#888'
                        }}
                      >
                        {t.noDonations}
                      </td>
                    </tr>
                  ) : (
                    donations.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: '1px solid #eeeae2'
                        }}
                      >
                        <td style={{ padding: '12px' }}>
                          {item.date}
                        </td>

                        <td
                          style={{
                            padding: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {item.name}
                        </td>

                        <td style={{ padding: '12px' }}>
                          {item.purpose}
                        </td>

                        <td style={{ padding: '12px' }}>
                          {item.receipt === 'yes'
                            ? t.receiptYes
                            : t.receiptNo}
                        </td>

                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: '#9b7226'
                          }}
                        >
                          {Number(
                            item.amount
                          ).toLocaleString()}{' '}
                          ฿
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;