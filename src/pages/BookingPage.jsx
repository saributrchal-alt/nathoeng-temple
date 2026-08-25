import React, { useState } from 'react';

export default function BookingPage({ lang, goToPage }) {
  const [submitting, setSubmitting] = useState(false);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // ใส่ Access Key จาก Web3Forms ตรงนี้

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert(lang === 'th' ? 'ส่งคำขอจองเข้าพักสำเร็จ ทางวัดได้รับข้อมูลเรียบร้อยแล้ว' : 'Reservation submitted successfully!');
        e.target.reset();
        goToPage('home');
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบอินเทอร์เน็ต");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="guidePage">
      <div className="guideContainer">
        <button className="backButton" onClick={() => goToPage('visit-guide')}>
          {lang === 'en' ? '← Back to Guidelines' : '← กลับไปหน้าระเบียบการ'}
        </button>
        <span className="eyebrow">{lang === 'en' ? 'MONASTERY STAY RESERVATION' : 'ระบบจองเข้าพักปฏิบัติธรรม'}</span>
        <h1>{lang === 'en' ? 'Book Your Stay' : 'กรอกข้อมูลการจองเข้าพัก'}</h1>
        <p className="guideIntro">
          {lang === 'en' 
            ? 'Please fill in your details below to request a stay for meditation and practice.' 
            : 'กรุณากรอกข้อมูลส่วนตัวและช่วงเวลาที่ต้องการเข้ามาปฏิบัติธรรม เพื่อให้ทางวัดเตรียมความพร้อม'}
        </p>

        <form onSubmit={handleBookingSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'ชื่อ - นามสกุล' : 'Full Name'}
            </label>
            <input type="text" name="name" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder={lang === 'th' ? 'ระบุชื่อและนามสกุลของคุณ' : 'Enter your full name'} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'เบอร์โทรศัพท์ (ที่ติดต่อได้)' : 'Phone Number'}
            </label>
            <input type="tel" name="phone" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="0xx-xxx-xxxx" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'วันที่ต้องการเข้าพัก' : 'Check-in Date'}
              </label>
              <input type="date" name="check_in" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'วันที่สิ้นสุดการพัก' : 'Check-out Date'}
              </label>
              <input type="date" name="check_out" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'จุดประสงค์ / หมายเหตุเพิ่มเติม' : 'Purpose / Notes'}
            </label>
            <textarea name="message" rows="4" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder={lang === 'th' ? 'เช่น ถือศีล 8, ปฏิบัติภาวนา 3 วัน' : 'e.g., Meditation retreat for 3 days'}></textarea>
          </div>

          <button type="submit" disabled={submitting} className="primaryContactBtn" style={{ width: '100%', padding: '14px' }}>
            {submitting ? (lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Submitting...') : (lang === 'th' ? 'ยืนยันการส่งคำขอจอง' : 'Submit Reservation')}
          </button>
        </form>
      </div>
    </div>
  );
}