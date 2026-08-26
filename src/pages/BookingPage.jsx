import React, { useState } from 'react';

function BookingPage({ lang, goToPage }) {
  // ดึงข้อมูลผู้ใช้ที่ล็อกอินผ่าน LINE จาก localStorage
  const savedUser = localStorage.getItem('line_user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันส่งข้อมูลผ่าน Web3Forms ของเดิม
  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      alert(lang === 'en' ? 'Please login with LINE first.' : 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนทำการจอง');
      goToPage('login-page');
      return;
    }

    setLoading(true);
    const formData = new FormData(event.target);
    
    // ใส่ Access Key ของ Web3Forms เดิม
    formData.append("access_key", "d80a991c-5b9f-4273-a730-8de806f45da3"); 
    formData.append("line_user_name", user.name);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        console.error("Error", data);
        alert(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Network error", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
                : 'ทางวัดขอสงวนสิทธิ์ในการเข้าระบบต้องยืนยันตัวตนก่อน โดยการเข้าสู่ระบบด้วยบัญชี LINE ของท่านก่อนทำการจอง'}
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
              {lang === 'en' ? 'Booking Submitted Successfully!' : 'ส่งข้อมูลการจองเรียบร้อยแล้ว'}
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
          <form onSubmit={onSubmit} style={{ marginTop: '20px' }}>
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
                defaultValue={user.name}
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
                  name="start_date" 
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
                  name="end_date" 
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
                name="message" 
                rows="3" 
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
              {loading ? 'กำลังส่งข้อมูล...' : (lang === 'en' ? 'Confirm Booking' : 'ยืนยันการจองเข้าพัก')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingPage;