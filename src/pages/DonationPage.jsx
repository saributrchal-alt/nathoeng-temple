import { useState } from 'react'

export default function DonationPage({ lang, goToPage }) {
  // ข้อความรองรับ 2 ภาษา
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
      previewTitle: '📋 Recent Donations Preview',
      noDonations: 'No donations recorded yet.',
      dateHeader: 'Date',
      nameHeader: 'Name',
      purposeHeader: 'Purpose',
      receiptHeader: 'Receipt',
      amountHeader: 'Amount',
      yesText: 'Yes',
      noText: 'No',
      successTitle: '🙏 Sadhu! อนุโมทนากุศลจิต',
      successMsg: 'May the Triple Gem bless you and your family with peace, health, and prosperity. Your donation record has been successfully saved by the monastery.',
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
      previewTitle: '📋 ตัวอย่างรายการบริจาคล่าสุด (Preview)',
      noDonations: 'ยังไม่มีประวัติการบริจาคในระบบ',
      dateHeader: 'วันเดือนปี',
      nameHeader: 'ชื่อบุคคล',
      purposeHeader: 'วัตถุประสงค์',
      receiptHeader: 'ใบอนุโมทนาฯ',
      amountHeader: 'ยอดเงิน',
      yesText: 'ต้องการ',
      noText: 'ไม่ต้องการ',
      successTitle: '🙏 สาธุ อนุโมทนาบุญด้วยครับ',
      successMsg: 'ขออานุภาพแห่งคุณพระศรีรัตนตรัย จงดลบันดาลให้ท่านและครอบครัวประสบแต่ความสุข ความเจริญ มีอายุ วรรณะ สุขะ พละ ปฏิภาณ ธนสารสมบัติทุกประการ ทางวัดได้ทำการบันทึกรายการบริจาคของคุณเรียบร้อยแล้ว',
      okBtn: 'ตกลง (กลับสู่หน้าหลัก)'
    }
  }

  const t = text[lang]

  // State สำหรับเก็บข้อมูลฟอร์ม (เพิ่ม taxReceipt เป็นค่าว่างเพื่อให้บังคับเลือก)
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    amount: '',
    purpose: 'general',
    customPurpose: '',
    taxReceipt: ''
  })

  // State สำหรับเก็บรายการจำลอง (Preview List)
  const [donationList, setDonationList] = useState([
    {
      date: '2026-06-06 10:30',
      name: 'คุณโยมใจบุญ (ตัวอย่าง)',
      purpose: 'ทำบุญตามอัธยาศัยทางคณะสงฆ์',
      receipt: 'yes',
      amount: '1,000'
    },
    {
      date: '2026-06-06 11:15',
      name: 'ครอบครัวสกุลคุณสวัสดิ์',
      purpose: 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ',
      receipt: 'no',
      amount: '5,000'
    }
  ])

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation ตรวจสอบข้อมูลสำคัญรวมถึงการเลือกใบอนุโมทนาบัตร
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

    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newEntry = {
      date: formattedDate,
      name: formData.fullName,
      purpose: selectedPurposeText,
      receipt: formData.taxReceipt,
      amount: Number(formData.amount).toLocaleString()
    }

    setDonationList([newEntry, ...donationList])
    setIsSubmitted(true)
  }

  const handleResetAndGoHome = () => {
    setIsSubmitted(false)
    setFormData({ fullName: '', idNumber: '', amount: '', purpose: 'general', customPurpose: '', taxReceipt: '' })
    goToPage('home')
  }

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '950px' }}>
        <button className="backButton" onClick={() => goToPage('home')}>
          {t.back}
        </button>

        {!isSubmitted ? (
          <>
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p className="guideIntro">{t.intro}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
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

              {/* ส่วนเลือกขอใบอนุโมทนาบัตร แบบบังคับเลือก */}
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
                <button type="submit" className="primaryContactBtn" style={{ padding: '14px 28px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
                  {t.submitBtn} →
                </button>
              </div>
            </form>

            {/* ส่วน Preview รายการบริจาค */}
            <div style={{ background: '#f6f4ef', padding: '25px', borderRadius: '6px', border: '1px solid #eeeae2' }}>
              <h3 style={{ marginTop: '0', fontSize: '1.1rem', color: '#302d29', marginBottom: '15px' }}>
                {t.previewTitle}
              </h3>
              {donationList.length === 0 ? (
                <p style={{ color: '#777', fontSize: '14px' }}>{t.noDonations}</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #dcd5c8', color: '#625d55' }}>
                        <th style={{ padding: '10px' }}>{t.dateHeader}</th>
                        <th style={{ padding: '10px' }}>{t.nameHeader}</th>
                        <th style={{ padding: '10px' }}>{t.purposeHeader}</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>{t.receiptHeader}</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>{t.amountHeader}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationList.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e6dfd5' }}>
                          <td style={{ padding: '10px', color: '#777', fontSize: '13px' }}>{item.date}</td>
                          <td style={{ padding: '10px', fontWeight: '500', color: '#302d29' }}>{item.name}</td>
                          <td style={{ padding: '10px', color: '#625d55' }}>{item.purpose}</td>
                          <td style={{ padding: '10px', textAlign: 'center', color: '#625d55' }}>
                            {item.receipt === 'yes' ? (lang === 'th' ? '✓ ต้องการ' : '✓ Yes') : (lang === 'th' ? '- ไม่ต้องการ' : '- No')}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#9b7226' }}>{item.amount} ฿</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* หน้าจอคำอำนวยพรหลังกดบันทึกสำเร็จ */
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fcfbfa', borderRadius: '6px', border: '1px solid #eeeae2' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🙏</div>
            <h2 style={{ color: '#9b7226', fontSize: '1.8rem', marginBottom: '20px', fontWeight: '500' }}>
              {t.successTitle}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#625d55', maxWidth: '650px', margin: '0 auto 30px' }}>
              {t.successMsg}
            </p>
            <button onClick={handleResetAndGoHome} className="primaryContactBtn" style={{ padding: '12px 30px', fontSize: '15px', cursor: 'pointer' }}>
              {t.okBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}