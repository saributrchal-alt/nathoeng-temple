import { useState } from 'react'

export default function DonationPage({ lang, goToPage }) {
  const text = {
    en: {
      back: '← Back to Home',
      eyebrow: 'SUPPORT THE MONASTERY',
      title: 'Make a Donation',
      intro: 'Your generosity helps sustain the monastery, Dhamma activities, and community service. Anyone can contribute using the form below.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Enter your full name',
      idLabel: '13-Digit National ID / Taxpayer Identification Number *',
      idPlaceholder: 'Enter 13-digit ID or Tax ID',
      amountLabel: 'Donation Amount (THB) *',
      amountPlaceholder: 'e.g. 500',
      purposeLabel: 'Donation Purpose *',
      purposeOptions: [
        { value: 'general', label: 'General Donation (ตามอัธยาศัยทางคณะสงฆ์)' },
        { value: 'utilities', label: 'Electricity & Water Bills (ค่าน้ำ ค่าไฟวัด)' },
        { value: 'development', label: 'Monastery Development & Maintenance (พัฒนาทำนุบำรุงเสนาสนะ)' },
        { value: 'custom', label: 'Other / Specific Purpose (ระบุเอง)' }
      ],
      customPurposeLabel: 'Specify Purpose *',
      customPlaceholder: 'Please specify details',
      taxReceiptLabel: 'Do you require a donation receipt (ใบอนุโมทนาบัตร)? *',
      taxReceiptYes: 'Yes, I require a receipt',
      taxReceiptNo: 'No, I do not require a receipt',
      submitBtn: 'Confirm Donation',
      viewListBtn: '📋 View All Donations (Admin)',
      successTitle: '🙏 Sadhu! อนุโมทนากุศลจิต',
      successMsg: 'May the Triple Gem bless you and your family with peace, health, and prosperity. Your donation details have been securely sent to the monastery.',
      okBtn: 'OK (Back to Home)'
    },
    th: {
      back: '← กลับสู่หน้าหลัก',
      eyebrow: 'ร่วมสนับสนุนวัด',
      title: 'บันทึกข้อมูลการบริจาค',
      intro: 'การให้ของท่านช่วยเกื้อกูลวัด กิจกรรมเผยแผ่ธรรมะ และงานเพื่อชุมชน ผู้มีจิตศรัทธาทุกท่านสามารถกรอกข้อมูลร่วมบุญได้ผ่านแบบฟอร์มด้านล่างนี้',
      nameLabel: 'ชื่อ - สกุล *',
      namePlaceholder: 'ระบุชื่อและนามสกุลของคุณ',
      idLabel: 'เลขประจำตัวประชาชน หรือเลขประจำตัวผู้เสียภาษี 13 หลัก *',
      idPlaceholder: 'ระบุเลข 13 หลัก หรือเลขผู้เสียภาษี',
      amountLabel: 'ยอดบริจาค (บาท) *',
      amountPlaceholder: 'เช่น 500',
      purposeLabel: 'วัตถุประสงค์ในการบริจาค *',
      purposeOptions: [
        { value: 'general', label: 'ทำบุญตามอัธยาศัยทางคณะสงฆ์' },
        { value: 'utilities', label: 'เพื่อค่าน้ำ - ค่าไฟวัด' },
        { value: 'development', label: 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ' },
        { value: 'custom', label: 'เพื่อวัตถุประสงค์เฉพาะ (โปรดระบุ)' }
      ],
      customPurposeLabel: 'ระบุวัตถุประสงค์ *',
      customPlaceholder: 'ระบุรายละเอียดเพิ่มเติม',
      taxReceiptLabel: 'ความต้องการใบอนุโมทนาบัตร *',
      taxReceiptYes: 'ต้องการรับใบอนุโมทนาบัตร',
      taxReceiptNo: 'ไม่ต้องการรับใบอนุโมทนาบัตร',
      submitBtn: 'ยืนยันการบริจาค',
      viewListBtn: '📋 ตรวจสอบรายชื่อผู้บริจาคทั้งหมด (สำหรับเจ้าหน้าที่)',
      successTitle: '🙏 สาธุ อนุโมทนาบุญด้วยครับ',
      successMsg: 'ขออานุภาพแห่งคุณพระศรีรัตนตรัย จงดลบันดาลให้ท่านและครอบครัวประสบแต่ความสุข ความเจริญ มีอายุ วรรณะ สุขะ พละ ปฏิภาณ ธนสารสมบัติทุกประการ ทางวัดได้ทำการบันทึกและส่งข้อมูลให้ทางวัดเรียบร้อยแล้ว',
      okBtn: 'ตกลง (กลับสู่หน้าหลัก)'
    }
  }

  const t = text[lang]

  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    amount: '',
    purpose: 'general',
    customPurpose: '',
    taxReceipt: ''
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.idNumber || !formData.amount || !formData.taxReceipt) {
      alert(lang === 'th' ? 'กรุณากรอกข้อมูลและเลือกรายการให้ครบถ้วน' : 'Please fill in all required fields and select receipt option.')
      return
    }

    let selectedPurposeText = ''
    if (formData.purpose === 'custom') {
      selectedPurposeText = formData.customPurpose || (lang === 'th' ? 'ระบุเอง' : 'Custom')
    } else {
      const found = t.purposeOptions.find((opt) => opt.value === formData.purpose)
      selectedPurposeText = found ? found.label : formData.purpose
    }

    setLoading(true)

    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newEntry = {
      date: formattedDate,
      name: formData.fullName,
      idNumber: formData.idNumber, // เก็บไว้ในระบบเบื้องหลัง
      purpose: selectedPurposeText,
      receipt: formData.taxReceipt,
      amount: Number(formData.amount)
    }

    // บันทึกลง localStorage สะสมไว้ให้หน้าตรวจสอบดึงไปแสดง
    try {
      const existing = JSON.parse(localStorage.getItem('nathoeng_donations') || '[]')
      localStorage.setItem('nathoeng_donations', JSON.stringify([newEntry, ...existing]))
    } catch (err) {
      console.error(err)
    }

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "56740213-dd22-4925-948b-66e1bf47d993", // ใส่ Access Key ของคุณที่นี่
          subject: `New Donation from ${formData.fullName}`,
          from_name: "Buddhist Park Monastery Website",
          "Full Name": formData.fullName,
          "ID / Tax ID": formData.idNumber,
          "Amount (THB)": formData.amount,
          "Purpose": selectedPurposeText,
          "Needs Tax Receipt": formData.taxReceipt === 'yes' ? 'Yes (ต้องการ)' : 'No (ไม่ต้องการ)'
        }),
      });

      setIsSubmitted(true)
    } catch (error) {
      console.error(error)
      setIsSubmitted(true) // ให้ผ่านไปหน้าสำเร็จแม้เน็ตมีปัญหาเล็กน้อย แต่ข้อมูลบันทึกลงเครื่องแล้ว
    } finally {
      setLoading(false)
    }
  }

  const handleResetAndGoHome = () => {
    setIsSubmitted(false)
    setFormData({ fullName: '', idNumber: '', amount: '', purpose: 'general', customPurpose: '', taxReceipt: '' })
    goToPage('home')
  }

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button className="backButton" onClick={() => goToPage('home')} style={{ margin: 0 }}>
            {t.back}
          </button>
          <button 
            onClick={() => goToPage('donation-list')} 
            style={{ background: 'none', border: '1px solid #dcd5c8', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#625d55' }}
          >
            {t.viewListBtn}
          </button>
        </div>

        {!isSubmitted ? (
          <>
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p className="guideIntro">{t.intro}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#302d29' }}>
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t.namePlaceholder}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#302d29' }}>
                    {t.idLabel}
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    maxLength="13"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder={t.idPlaceholder}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#302d29' }}>
                    {t.amountLabel}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder={t.amountPlaceholder}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#302d29' }}>
                    {t.purposeLabel}
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px', background: '#fff' }}
                  >
                    {t.purposeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.purpose === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#302d29' }}>
                    {t.customPurposeLabel}
                  </label>
                  <input
                    type="text"
                    name="customPurpose"
                    value={formData.customPurpose}
                    onChange={handleChange}
                    placeholder={t.customPlaceholder}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #dcd5c8', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              )}

              <div style={{ background: '#fcfbfa', padding: '15px 20px', borderRadius: '4px', border: '1px solid #eeeae2' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#302d29' }}>
                  {t.taxReceiptLabel}
                </label>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#625d55' }}>
                    <input
                      type="radio"
                      name="taxReceipt"
                      value="yes"
                      checked={formData.taxReceipt === 'yes'}
                      onChange={handleChange}
                      required
                    />
                    {t.taxReceiptYes}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#625d55' }}>
                    <input
                      type="radio"
                      name="taxReceipt"
                      value="no"
                      checked={formData.taxReceipt === 'no'}
                      onChange={handleChange}
                      required
                    />
                    {t.taxReceiptNo}
                  </label>
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="primaryContactBtn" style={{ padding: '14px 28px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
                  {loading ? (lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Submitting...') : `${t.submitBtn} →`}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fcfbfa', borderRadius: '6px', border: '1px solid #eeeae2' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🙏</div>
            <h2 style={{ color: '#9b7226', fontSize: '1.8rem', marginBottom: '20px', fontWeight: '500' }}>
              {t.successTitle}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#625d55', maxWidth: '650px', margin: '0 auto 30px' }}>
              {t.successMsg}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleResetAndGoHome} className="primaryContactBtn" style={{ padding: '12px 25px', fontSize: '15px', cursor: 'pointer' }}>
                {t.okBtn}
              </button>
              <button onClick={() => goToPage('donation-list')} style={{ background: '#fff', border: '1px solid #9b7226', color: '#9b7226', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' }}>
                {t.viewListBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}