import React from 'react';

export default function BookingPage({ lang, goToPage }) {
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

        {/* ใช้ form แบบมาตรฐานส่งข้อมูลตรงไป Web3Forms */}
        <form action="https://api.web3forms.com/submit" method="POST">
          
          {/* ซ่อน Access Key ไว้ (ตรวจสอบไม่ให้มีช่องว่างเกิน) */}
          <input type="hidden" name="access_key" value="6b26fb7a-9a99-4d69-a100-333e89a50ae3" />

          {/* คำนำหน้า และ ชื่อ-นามสกุล */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>คำนำหน้า</label>
              <select name="คำนำหน้า" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', background: '#fff' }}>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="พระภิกษุ">พระภิกษุ</option>
                <option value="สามเณร">สามเณร</option>
                <option value="แม่ชี">แม่ชี</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ชื่อ - นามสกุล</label>
              <input type="text" name="ชื่อ-นามสกุล" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ระบุชื่อและนามสกุล" />
            </div>
          </div>

          {/* เลขบัตรประชาชน และ อายุ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>เลขที่บัตรประจำตัวประชาชน *</label>
              <input type="text" name="เลขบัตรประชาชน" required maxLength="13" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="เลขบัตรประชาชน 13 หลัก" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>อายุ (ปี)</label>
              <input type="number" name="อายุ" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="อายุ" />
            </div>
          </div>

          {/* ชื่อบิดา และ มารดา */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ชื่อบิดา</label>
              <input type="text" name="ชื่อบิดา" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ชื่อ-นามสกุลบิดา" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ชื่อมารดา</label>
              <input type="text" name="ชื่อมารดา" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ชื่อ-นามสกุลมารดา" />
            </div>
          </div>

          {/* ชื่อสามี หรือ ภรรยา */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ชื่อสามี หรือ ภรรยา (ถ้ามี)</label>
            <input type="text" name="ชื่อคู่สมรส" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ระบุชื่อคู่สมรส (ถ้ามี)" />
          </div>

          {/* ที่อยู่ปัจจุบัน */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ที่อยู่ปัจจุบัน (บ้านเลขที่, ถนน, หมู่บ้าน)</label>
            <textarea name="ที่อยู่" rows="2" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="บ้านเลขที่ ซอย ถนน"></textarea>
          </div>

          {/* ตำบล อำเภอ จังหวัด */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ตำบล / แขวง</label>
              <input type="text" name="ตำบล" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ตำบล" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>อำเภอ / เขต</label>
              <input type="text" name="อำเภอ" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="อำเภอ" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>จังหวัด</label>
              <input type="text" name="จังหวัด" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="จังหวัด" />
            </div>
          </div>

          {/* เบอร์โทรศัพท์ และ เบอร์ฉุกเฉิน */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>เบอร์โทรติดต่อ</label>
              <input type="tel" name="เบอร์โทร" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="0xx-xxx-xxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>เบอร์ฉุกเฉิน (พร้อมระบุความสัมพันธ์)</label>
              <input type="text" name="เบอร์ฉุกเฉิน" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="เบอร์โทร และความสัมพันธ์" />
            </div>
          </div>

          {/* วันที่เข้าพัก และ วันที่สิ้นสุด */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>วันที่ต้องการเข้าพัก</label>
              <input type="date" name="วันที่เข้าพัก" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>วันที่สิ้นสุดการพัก</label>
              <input type="date" name="วันที่สิ้นสุด" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} />
            </div>
          </div>

          {/* โรคประจำตัว และ ปัญหาทางจิต */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>โรคประจำตัว (ถ้ามี)</label>
              <input type="text" name="โรคประจำตัว" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ระบุโรคประจำตัว" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>ปัญหาทางจิต (ถ้ามี)</label>
              <input type="text" name="ปัญหาทางจิต" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ระบุ (ถ้ามี)" />
            </div>
          </div>

          {/* แรงจูงใจ (Dropdown) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>แรงจูงใจหรือเหตุที่มีปฏิบัติที่นี่ *</label>
            <select name="จุดประสงค์" required style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', background: '#fff' }}>
              <option value="" disabled selected>-- กรุณาเลือกจุดประสงค์ --</option>
              <option value="เพื่อความสงบใจ">เพื่อความสงบใจ</option>
              <option value="เพื่อรักษาศีล 5">เพื่อรักษาศีล 5</option>
              <option value="เพื่อรักษาศีล 8">เพื่อรักษาศีล 8</option>
              <option value="เพื่อพัฒนาตัวเองแบบส่วนตัว">เพื่อพัฒนาตัวเองแบบส่วนตัว</option>
              <option value="เพื่อฝึกหลักสูตรพิชิตเสือดำ">เพื่อฝึกหลักสูตรพิชิตเสือดำ</option>
              <option value="เพื่อฝึกหลักสูตรย้ายบ้าน">เพื่อฝึกหลักสูตรย้ายบ้าน</option>
            </select>
          </div>

          {/* เคยมาปฏิบัติที่นี่แล้วหรือยัง */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>เคยมาปฏิบัติที่นี่แล้วหรือยัง (ถ้ามีระบุจำนวนครั้ง)</label>
            <input type="text" name="ประวัติการมาปฏิบัติ" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="เช่น เคยมาแล้ว 2 ครั้ง / หรือยังไม่เคย" />
          </div>

          {/* หมายเหตุเพิ่มเติม */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#302d29' }}>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
            <textarea name="หมายเหตุ" rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }} placeholder="ระบุรายละเอียดเพิ่มเติม"></textarea>
          </div>

          {/* ข้อยอมรับเงื่อนไข */}
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fcfbfa', padding: '15px', borderRadius: '4px', border: '1px solid #eeeae2' }}>
            <input type="checkbox" id="terms" name="ยอมรับเงื่อนไข" required style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="terms" style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', cursor: 'pointer' }}>
              ข้าพเจ้ายอมรับและจะปฏิบัติตามเงื่อนไขทุกอย่างของทางวัดโดยไม่ต้องแจ้งอะไรล่วงหน้า
            </label>
          </div>

          <button type="submit" className="primaryContactBtn" style={{ width: '100%', padding: '14px', cursor: 'pointer' }}>
            ยืนยันการส่งคำขอจอง
          </button>
        </form>
      </div>
    </div>
  );
}