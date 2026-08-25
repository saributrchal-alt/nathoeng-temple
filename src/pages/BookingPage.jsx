import React, { useState } from 'react';

export default function BookingPage({ lang, goToPage }) {
  const [submitting, setSubmitting] = useState(false);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    formData.append("access_key", "6b26fb7a-9a99-4d69-a100-333e89a50ae3"); // รหัส Access Key ของวัด

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
            : 'กรุณากรอกข้อมูลส่วนตัวและรายละเอียดให้ครบถ้วน เพื่อให้ทางวัดเตรียมความพร้อม'}
        </p>

        <form onSubmit={handleBookingSubmit}>
          
          {/* คำนำหน้า และ ชื่อ-นามสกุล */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'คำนำหน้า' : 'Title'}
              </label>
              <select name="prefix" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', background: '#fff' }}>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="พระภิกษุ">พระภิกษุ</option>
                <option value="สามเณร">สามเณร</option>
                <option value="แม่ชี">แม่ชี</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'ชื่อ - นามสกุล' : 'Full Name'}
              </label>
              <input type="text" name="name" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ระบุชื่อและนามสกุล" />
            </div>
          </div>

          {/* เลขบัตรประชาชน และ อายุ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'เลขที่บัตรประจำตัวประชาชน *' : 'ID Card Number *'}
              </label>
              <input type="text" name="id_card" required maxLength="13" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="เลขบัตรประชาชน 13 หลัก" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'อายุ (ปี)' : 'Age'}
              </label>
              <input type="number" name="age" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="อายุ" />
            </div>
          </div>

          {/* ชื่อบิดา และ มารดา */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'ชื่อบิดา' : 'Father Name'}
              </label>
              <input type="text" name="father_name" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ชื่อ-นามสกุลบิดา" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'ชื่อมารดา' : 'Mother Name'}
              </label>
              <input type="text" name="mother_name" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ชื่อ-นามสกุลมารดา" />
            </div>
          </div>

          {/* ชื่อสามี หรือ ภรรยา */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'ชื่อสามี หรือ ภรรยา (ถ้ามี)' : 'Spouse Name (If any)'}
            </label>
            <input type="text" name="spouse_name" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ระบุชื่อคู่สมรส (ถ้ามี)" />
          </div>

          {/* ที่อยู่ปัจจุบัน */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'ที่อยู่ปัจจุบัน (บ้านเลขที่, ถนน, หมู่บ้าน)' : 'Current Address'}
            </label>
            <textarea name="address" rows="2" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="บ้านเลขที่ ซอย ถนน"></textarea>
          </div>

          {/* ตำบล อำเภอ จังหวัด */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'ตำบล / แขวง' : 'Sub-district'}
              </label>
              <input type="text" name="subdistrict" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ตำบล" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'อำเภอ / เขต' : 'District'}
              </label>
              <input type="text" name="district" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="อำเภอ" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'จังหวัด' : 'Province'}
              </label>
              <input type="text" name="province" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="จังหวัด" />
            </div>
          </div>

          {/* เบอร์โทรศัพท์ และ เบอร์ฉุกเฉิน */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'เบอร์โทรติดต่อ' : 'Phone Number'}
              </label>
              <input type="tel" name="phone" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="0xx-xxx-xxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'เบอร์ฉุกเฉิน (พร้อมระบุความสัมพันธ์)' : 'Emergency Contact & Relation'}
              </label>
              <input type="text" name="emergency_contact" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="เบอร์โทร และความสัมพันธ์" />
            </div>
          </div>

          {/* วันที่เข้าพัก และ วันที่สิ้นสุด */}
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

          {/* โรคประจำตัว และ ปัญหาทางจิต */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'โรคประจำตัว (ถ้ามี)' : 'Underlying Disease'}
              </label>
              <input type="text" name="disease" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ระบุโรคประจำตัว (ถ้ามี)" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
                {lang === 'th' ? 'ปัญหาทางจิต (ถ้ามี)' : 'Mental Health Conditions'}
              </label>
              <input type="text" name="mental_condition" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ระบุ (ถ้ามี)" />
            </div>
          </div>

          {/* แรงจูงใจ (Dropdown) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'แรงจูงใจหรือเหตุที่มีปฏิบัติที่นี่ *' : 'Purpose of Stay *'}
            </label>
            <select name="purpose" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', background: '#fff', color: '#302d29' }}>
              <option value="" disabled selected>{lang === 'th' ? '-- กรุณาเลือกแรงจูงใจ / จุดประสงค์ --' : '-- Please select purpose --'}</option>
              <option value="เพื่อความสงบใจ">{lang === 'th' ? 'เพื่อความสงบใจ' : 'For Inner Peace'}</option>
              <option value="เพื่อรักษาศีล 5">{lang === 'th' ? 'เพื่อรักษาศีล 5' : 'To Practice 5 Precepts'}</option>
              <option value="เพื่อรักษาศีล 8">{lang === 'th' ? 'เพื่อรักษาศีล 8' : 'To Practice 8 Precepts'}</option>
              <option value="เพื่อพัฒนาตัวเองแบบส่วนตัว">{lang === 'th' ? 'เพื่อพัฒนาตัวเองแบบส่วนตัว' : 'For Personal Self-Development'}</option>
              <option value="เพื่อฝึกหลักสูตรพิชิตเสือดำ">{lang === 'th' ? 'เพื่อฝึกหลักสูตรพิชิตเสือดำ' : 'Black Panther Course'}</option>
              <option value="เพื่อฝึกหลักสูตรย้ายบ้าน">{lang === 'th' ? 'เพื่อฝึกหลักสูตรย้ายบ้าน' : 'House Relocation Course'}</option>
            </select>
          </div>

          {/* เคยมาปฏิบัติที่นี่แล้วหรือยัง / จำนวนครั้ง */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'เคยมาปฏิบัติที่นี่แล้วหรือยัง (ถ้ามีระบุจำนวนครั้ง)' : 'Previous visits (If yes, specify times)'}
            </label>
            <input type="text" name="previous_visit" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="เช่น เคยมาแล้ว 2 ครั้ง / หรือยังไม่เคย" />
          </div>

          {/* หมายเหตุเพิ่มเติม */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>
              {lang === 'th' ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Additional Notes'}
            </label>
            <textarea name="message" rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }} placeholder="ระบุรายละเอียดเพิ่มเติมถึงทางวัด"></textarea>
          </div>

          {/* ข้อยอมรับเงื่อนไขของทางวัด */}
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fcfbfa', padding: '15px', borderRadius: '4px', border: '1px solid #eeeae2' }}>
            <input type="checkbox" id="terms" name="accept_terms" required style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="terms" style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', cursor: 'pointer' }}>
              {lang === 'th' 
                ? 'ข้าพเจ้ายอมรับและจะปฏิบัติตามเงื่อนไขทุกอย่างของทางวัดโดยไม่ต้องแจ้งอะไรล่วงหน้า' 
                : 'I acknowledge and agree to abide by all the rules and conditions of the monastery without prior notice.'}
            </label>
          </div>

          <button type="submit" disabled={submitting} className="primaryContactBtn" style={{ width: '100%', padding: '14px' }}>
            {submitting ? (lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Submitting...') : (lang === 'th' ? 'ยืนยันการส่งคำขอจอง' : 'Submit Reservation')}
          </button>
        </form>
      </div>
    </div>
  );
}