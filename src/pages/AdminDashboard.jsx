import React, { useState, useEffect } from 'react';

function AdminDashboard({ lang, goToPage }) {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' หรือ 'bookings'

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage มาแสดงผล
    const savedBookings = JSON.parse(localStorage.getItem('temple_bookings') || '[]');
    const savedDonations = JSON.parse(localStorage.getItem('nathoeng_donations') || '[]');
    setBookings(savedBookings);
    setDonations(savedDonations);
  }, []);

  // คำนวณยอดบริจาครวมทั้งหมด
  const totalDonationAmount = donations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleClearData = () => {
    if (window.confirm(lang === 'th' ? 'คุณต้องการล้างข้อมูลทั้งหมดในเครื่องนี้ใช่หรือไม่?' : 'Are you sure you want to clear all local data?')) {
      localStorage.removeItem('temple_bookings');
      localStorage.removeItem('nathoeng_donations');
      setBookings([]);
      setDonations([]);
    }
  };

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '1000px' }}>
        <button className="backButton" onClick={() => goToPage('home')}>
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <div>
            <span className="eyebrow">{lang === 'en' ? 'ADMIN DASHBOARD' : 'ระบบจัดการหลังบ้าน (ผู้ดูแลระบบ)'}</span>
            <h1 style={{ margin: 0 }}>{lang === 'en' ? 'Monastery Admin Panel' : 'แผงควบคุมข้อมูลวัดพุทธอุทยานนาเทิง'}</h1>
          </div>
          <button 
            onClick={handleClearData} 
            style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
          >
            {lang === 'en' ? '🗑️ Clear Local Data' : '🗑️ ล้างข้อมูลจำลองทั้งหมด'}
          </button>
        </div>

        {/* สรุปตัวเลขภาพรวม (Summary Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#f6f4ef', padding: '20px', borderRadius: '6px', border: '1px solid #dcd5c8' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777' }}>{lang === 'en' ? 'Total Donations' : 'ยอดทำบุญสะสมทั้งหมด'}</p>
            <h2 style={{ margin: 0, color: '#9b7226', fontSize: '1.8rem' }}>{totalDonationAmount.toLocaleString()} ฿</h2>
          </div>
          <div style={{ background: '#f6f4ef', padding: '20px', borderRadius: '6px', border: '1px solid #dcd5c8' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777' }}>{lang === 'en' ? 'Total Donors' : 'จำนวนรายการทำบุญ'}</p>
            <h2 style={{ margin: 0, color: '#302d29', fontSize: '1.8rem' }}>{donations.length} {lang === 'en' ? 'entries' : 'รายการ'}</h2>
          </div>
          <div style={{ background: '#f6f4ef', padding: '20px', borderRadius: '6px', border: '1px solid #dcd5c8' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#777' }}>{lang === 'en' ? 'Stay Bookings' : 'รายการจองเข้าพัก'}</p>
            <h2 style={{ margin: 0, color: '#302d29', fontSize: '1.8rem' }}>{bookings.length} {lang === 'en' ? 'bookings' : 'รายการ'}</h2>
          </div>
        </div>

        {/* ปุ่มสลับ Tab (เลือกระหว่างข้อมูลทำบุญ กับ ข้อมูลจองห้องพัก) */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #dcd5c8', paddingBottom: '10px' }}>
          <button 
            onClick={() => setActiveTab('donations')} 
            style={{ 
              padding: '10px 20px', 
              background: activeTab === 'donations' ? '#9b7226' : '#f5f5f5', 
              color: activeTab === 'donations' ? '#fff' : '#332f2a', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {lang === 'en' ? '💰 Donations List' : '💰 รายชื่อผู้บริจาคปัจจัย'}
          </button>
          <button 
            onClick={() => setActiveTab('bookings')} 
            style={{ 
              padding: '10px 20px', 
              background: activeTab === 'bookings' ? '#9b7226' : '#f5f5f5', 
              color: activeTab === 'bookings' ? '#fff' : '#332f2a', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {lang === 'en' ? '📅 Stay Bookings List' : '📅 รายการจองห้องพักปฏิบัติธรรม'}
          </button>
        </div>

        {/* แสดงผลตารางตาม Tab ที่เลือก */}
        {activeTab === 'donations' ? (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{lang === 'en' ? 'Recent Donations' : 'ประวัติการบริจาคปัจจัยทั้งหมด'}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f6f4ef', borderBottom: '1px solid #dcd5c8' }}>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Date/Time' : 'วันเวลา'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Donor Name' : 'ชื่อ - สกุล'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Purpose' : 'วัตถุประสงค์'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Receipt' : 'ใบอนุโมทนา'}</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>{lang === 'en' ? 'Amount' : 'ยอดเงิน (บาท)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                        {lang === 'en' ? 'No donation records found.' : 'ยังไม่มีประวัติการบริจาคในระบบ'}
                      </td>
                    </tr>
                  ) : (
                    donations.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eeeae2' }}>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{item.date}</td>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                        <td style={{ padding: '12px' }}>{item.purpose}</td>
                        <td style={{ padding: '12px' }}>
                          {item.receipt === 'yes' ? <span style={{ color: '#2e7d32' }}>✓ ต้องการ</span> : <span style={{ color: '#888' }}>ไม่ต้องการ</span>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#9b7226' }}>
                          {Number(item.amount).toLocaleString()} ฿
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{lang === 'en' ? 'Stay Bookings' : 'รายการจองเข้าพักปฏิบัติธรรม'}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f6f4ef', borderBottom: '1px solid #dcd5c8' }}>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Name / Group' : 'ผู้จอง / คณะ'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Phone' : 'เบอร์โทรศัพท์'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Check-in' : 'วันที่เข้าพัก'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Check-out' : 'วันสิ้นสุด'}</th>
                    <th style={{ padding: '12px' }}>{lang === 'en' ? 'Note' : 'หมายเหตุ'}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                        {lang === 'en' ? 'No booking records found.' : 'ยังไม่มีรายการจองเข้าพักในระบบ'}
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eeeae2' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{b.name}</td>
                        <td style={{ padding: '12px' }}>{b.phone || '-'}</td>
                        <td style={{ padding: '12px' }}>{b.startDate}</td>
                        <td style={{ padding: '12px' }}>{b.endDate}</td>
                        <td style={{ padding: '12px', color: '#625d55' }}>{b.purpose}</td>
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