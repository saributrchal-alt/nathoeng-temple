import React from 'react';

export default function CalendarPage({ lang, goToPage }) {
  // ข้อมูลจำลองการจอง (สามารถดึงข้อมูลจากระบบจริงมาแสดงผลตรงนี้ได้ในอนาคต)
  const bookings = [
    { name: 'คุณ Chaloempol S.', checkIn: '2026-08-27', checkOut: '2026-08-31', purpose: 'หลักสูตร เสือดำ' },
    // สามารถเพิ่มรายการจองอื่นๆ ตรงนี้ได้ครับ
  ];

  return (
    <div className="guidePage">
      <div className="guideContainer">
        <button className="backButton" onClick={() => goToPage('home')}>
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>
        <span className="eyebrow">{lang === 'en' ? 'RESERVATION SCHEDULE' : 'ตารางปฏิทินการเข้าพัก'}</span>
        <h1>{lang === 'en' ? 'Monastery Stay Schedule' : 'ตารางสถานะการจองเข้าพักปฏิบัติธรรม'}</h1>
        <p className="guideIntro">
          {lang === 'en' 
            ? 'Check the current schedule and booked dates for monastery stays.' 
            : 'ตรวจสอบตารางเวลาและช่วงที่มีผู้จองเข้าพักปฏิบัติธรรม เพื่อความสะดวกในการวางแผนเดินทาง'}
        </p>

        {/* ตารางแสดงรายการจอง */}
        <div style={{ marginTop: '30px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #dcd5c8', borderRadius: '4px' }}>
            <thead>
              <tr style={{ background: '#f6f4ef', borderBottom: '1px solid #dcd5c8', textAlign: 'left' }}>
                <th style={{ padding: '12px 15px', color: '#302d29', fontSize: '14px' }}>{lang === 'th' ? 'ผู้จอง / คณะ' : 'Guest / Group'}</th>
                <th style={{ padding: '12px 15px', color: '#302d29', fontSize: '14px' }}>{lang === 'th' ? 'วันที่เข้าพัก (Check-in)' : 'Check-in'}</th>
                <th style={{ padding: '12px 15px', color: '#302d29', fontSize: '14px' }}>{lang === 'th' ? 'วันที่สิ้นสุด (Check-out)' : 'Check-out'}</th>
                <th style={{ padding: '12px 15px', color: '#302d29', fontSize: '14px' }}>{lang === 'th' ? 'จุดประสงค์' : 'Purpose'}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eeeae2' }}>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>{b.name}</td>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>{b.checkIn}</td>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>{b.checkOut}</td>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>{b.purpose}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '14px' }}>
                    {lang === 'th' ? 'ยังไม่มีรายการจองในช่วงเวลานี้' : 'No bookings found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', marginTop: '35px' }}>
          <button onClick={() => goToPage('visit-guide')} className="primaryContactBtn" style={{ padding: '12px 24px' }}>
            {lang === 'en' ? 'Proceed to Book Stay →' : 'ไปหน้าจองเข้าพักปฏิบัติธรรม →'}
          </button>
        </div>
      </div>
    </div>
  );
}