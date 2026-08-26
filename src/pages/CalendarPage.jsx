import React, { useState, useEffect } from 'react';

function CalendarPage({ lang, goToPage }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลการจองจาก localStorage เมื่อโหลดหน้าเว็บ
    const savedBookings = JSON.parse(localStorage.getItem('temple_bookings') || '[]');
    setBookings(savedBookings);
  }, []);

  return (
    <div className="guidePage">
      <div className="guideContainer">
        <button className="backButton" onClick={() => goToPage('home')}>
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>
        
        <span className="eyebrow">{lang === 'en' ? 'BOOKING SCHEDULE' : 'ตารางปฏิทินการเข้าพัก'}</span>
        <h1>{lang === 'en' ? 'Monastery Stay Schedule' : 'ตารางสถานะการจองเข้าพักปฏิบัติธรรม'}</h1>
        <p className="guideIntro">
          {lang === 'en' 
            ? 'Check the schedule and periods when practitioners are staying to plan your visit.' 
            : 'ตรวจสอบตารางเวลาและช่วงที่มีผู้จองเข้าพักปฏิบัติธรรม เพื่อความสะดวกในการวางแผนเดินทาง'}
        </p>

        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f6f4ef', borderBottom: '1px solid #dcd5c8' }}>
                <th style={{ padding: '12px' }}>{lang === 'en' ? 'Practitioner / Group' : 'ผู้จอง / คณะ'}</th>
                <th style={{ padding: '12px' }}>{lang === 'en' ? 'Check-in' : 'วันที่เข้าพัก (Check-in)'}</th>
                <th style={{ padding: '12px' }}>{lang === 'en' ? 'Check-out' : 'วันที่สิ้นสุด (Check-out)'}</th>
                <th style={{ padding: '12px' }}>{lang === 'en' ? 'Purpose' : 'จุดประสงค์'}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    {lang === 'en' ? 'No bookings found yet.' : 'ยังไม่มีรายการจองในช่วงเวลานี้ (ท่านสามารถไปที่หน้าจองเพื่อทดสอบกรอกข้อมูลได้)'}
                  </td>
                </tr>
              ) : (
                bookings.map((b, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eeeae2' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{b.name}</td>
                    <td style={{ padding: '12px' }}>{b.startDate}</td>
                    <td style={{ padding: '12px' }}>{b.endDate}</td>
                    <td style={{ padding: '12px', color: '#625d55' }}>{b.purpose}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={() => goToPage('booking-page')} className="primaryContactBtn">
            {lang === 'en' ? 'Proceed to Book Stay →' : 'ไปหน้าจองเข้าปฏิบัติธรรม →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;