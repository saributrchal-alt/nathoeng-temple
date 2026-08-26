import React, { useState } from 'react';

function BookingPage({ lang, goToPage }) {
  // ดึงข้อมูลผู้ใช้ที่ล็อกอินผ่าน LINE จาก localStorage
  const savedUser = localStorage.getItem('line_user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    phone: '',
    startDate: '',
    endDate: '',
    note: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert(lang === 'en' ? 'Please login with LINE first.' : 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนทำการจอง');
      goToPage('login-page');
      return;
    }

    setLoading(true);

    // จำลองการส่งข้อมูลเข้า Google Sheets (ผ่าน Google Apps Script Web App URL)
    // ตรง URL นี้ เดี๋ยวเราจะเอาลิงก์จาก Google Apps Script มาใส่แทนที่ช่องว่างครับ
    const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_URL_HERE'; 

    const payload = {
      lineUid: user.uid || 'LINE_USER',
      name: formData.name,
      phone: formData.phone,
      startDate: formData.startDate,
      endDate: formData.endDate,
      note: formData.note,
      timestamp: new Date().toISOString()
    };

    try {
      // ถ้ายังไม่ได้ใส่ Script URL จะให้บันทึกผ่านจำลอง หรือยิงจริงก็ได้ครับ
      console.log('Booking Data:', payload);
      // await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload) });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guidePage">
      <div className="guideContainer">
        <button className="backButton" onClick={() => goToPage('home')}>
          {lang === 'en' ? '← Back to Home' : '← กลับสู่หน้าหลัก'}
        </button>
        
        <span className="eyebrow">{lang === 'en' ? 'MONASTERY STAY BOOKING' : 'ระบบจองเข้าปฏิบัติธรรม'}</span>
        <h1>{lang === 'en' ? 'Book Your Stay' : 'จองวันเข้าพักปฏิบัติธรรม'}</h1>
        
        {!user ? (
          <div style={{ padding: '30px', background: '#f6f4ef', borderRadius: '4px', textAlign: 'center', margin: '20px 0' }}>
            <p style={{ marginBottom: '15px', color: '#625d55', fontSize: '15px' }}>
              {lang === 'en' 
                ? 'Security Check: Please login with your LINE account to proceed with your booking.' 
                : 'เพื่อความปลอดภัยและป้องกันข้อความขยะ (Spam) กรุณาเข้าสู่ระบบด้วยบัญชี LINE ของท่านก่อนทำการจอง'}
            </p>
            <button 
              onClick={() => goToPage('login-page')} 
              className="primaryContactBtn"
              style={{ background: '#06c755' }}
            >
              {lang === 'en' ? 'Login with LINE to Book' : 'เข้าสู่ระบบด้วย LINE เพื่อทำการจอง'}
            </button>
          </div>
        ) : submitted ? (
          <div style={{ padding: '40px', background: '#f6f4ef', borderRadius: '4px', textAlign: 'center' }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>
              {lang === 'en' ? 'Booking Submitted Successfully!' : 'บันทึกข้อมูลการจองเรียบร้อยแล้ว'}
            </h3>
            <p style={{ color: '#625d55', marginBottom: '20px' }}>
              {lang === 'en' 
                ? 'Thank you. The monastery team has received your booking details.' 
                : 'ทางวัดได้รับข้อมูลการจองของท่านเรียบร้อยแล้ว อนุโมทนาบุญด้วยครับ'}
            </p>
            <button onClick={() => goToPage('home')} className="primaryContactBtn">
              {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px', padding: '12px', background: '#e8f5e9', borderRadius: '4px', fontSize: '14px', color: '#2e7d32' }}>
              🟢 เข้าสู่ระบบแล้วในนาม: <strong>{user.name}</strong> (ยืนยันตัวตนผ่าน LINE เรียบร้อย)
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                {lang === 'en' ? 'Full Name / Name of Group Leader' : 'ชื่อ - นามสกุล (หรือหัวหน้าคณะ)'}
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                {lang === 'en' ? 'Phone Number' : 'เบอร์โทรศัพท์ที่ติดต่อได้'}
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                placeholder="08xxxxxxxx"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  {lang === 'en' ? 'Start Date' : 'วันที่เข้าพัก'}
                </label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  {lang === 'en' ? 'End Date' : 'วันสิ้นสุดการพัก'}
                </label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                {lang === 'en' ? 'Additional Notes / Purpose' : 'หมายเหตุ / จุดประสงค์การปฏิบัติธรรม'}
              </label>
              <textarea 
                name="note" 
                rows="3" 
                value={formData.note} 
                onChange={handleChange} 
                placeholder="เช่น ปฏิบัติธรรมส่วนตัว หรือมาเป็นคณะ..."
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="primaryContactBtn" 
              disabled={loading}
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : (lang === 'en' ? 'Confirm Booking' : 'ยืนยันการจองเข้าพัก')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingPage;