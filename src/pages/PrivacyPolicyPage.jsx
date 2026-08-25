export default function PrivacyPolicyPage({ lang, goToPage }) {
  const text = {
    en: {
      back: '← Back to Home',
      eyebrow: 'LEGAL & PRIVACY',
      title: 'Privacy Policy',
      updated: 'Last updated: August 25, 2026',
      intro: 'Buddhist Park Monastery of Nathoeng values your privacy and is committed to protecting your personal data.',
      s1Title: '1. Information We Collect',
      s1Text: 'When you use our services (such as booking a monastery stay or submitting a donation form), we may collect necessary personal information including:',
      s1List: [
        'Full name',
        'National ID or Tax Identification Number (13 digits) — strictly used only for issuing official tax/donation receipts upon request.',
        'Contact details such as phone number and email.',
        'Donation amount, purpose, and stay schedule details.'
      ],
      s2Title: '2. Purpose of Data Collection',
      s2Text: 'We collect and use your data strictly for:',
      s2List: [
        'Managing meditation retreat bookings and accommodations.',
        'Processing donations and issuing acknowledgment receipts.',
        'Communicating with you regarding your inquiries or bookings.',
        'Displaying public donation records (showing only Name, Date, Purpose, and Amount) to share merits with the community.'
      ],
      s3Title: '3. Data Confidentiality & Security',
      s3Text: 'Sensitive information such as your 13-digit National ID / Tax ID is treated with strict confidentiality. It will NEVER be publicly displayed on the website and is accessible only to authorized monastery personnel through secure backend channels.',
      s4Title: '4. Your Rights',
      s4Text: 'You have the right to request access, correction, or deletion of your personal data held by us.',
      s5Title: '5. Contact Us',
      s5Text: 'If you have any questions about this Privacy Policy, please contact us at Buddhist Park Monastery of Nathoeng, That Sub-district, Wanon Niwat District, Sakon Nakhon 47120, Thailand.'
    },
    th: {
      back: '← กลับสู่หน้าหลัก',
      eyebrow: 'นโยบายและความเป็นส่วนตัว',
      title: 'นโยบายความเป็นส่วนตัว',
      updated: 'ปรับปรุงล่าสุด: 25 สิงหาคม 2569',
      intro: 'วัดพุทธอุทยานนาเทิง ให้ความสำคัญอย่างยิ่งต่อความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของท่าน',
      s1Title: '1. ข้อมูลที่เราจัดเก็บ',
      s1Text: 'เมื่อท่านใช้งานเว็บไซต์ของเรา (เช่น การจองเข้าพักปฏิบัติธรรม หรือการบันทึกข้อมูลการบริจาค) ทางวัดอาจเก็บรวบรวมข้อมูลที่จำเป็น ได้แก่:',
      s1List: [
        'ชื่อ - สกุล',
        'เลขประจำตัวประชาชน หรือเลขประจำตัวผู้เสียภาษี 13 หลัก (ใช้สำหรับการออกใบอนุโมทนาบัตรตามความประสงค์ของท่านเท่านั้น)',
        'ข้อมูลการติดต่อ เช่น เบอร์โทรศัพท์ และอีเมล',
        'ข้อมูลการร่วมบุญ ยอดบริจาค วัตถุประสงค์ และตารางเวลาเข้าพัก'
      ],
      s2Title: '2. วัตถุประสงค์ในการใช้ข้อมูล',
      s2Text: 'ทางวัดจะเก็บรวบรวมและใช้ข้อมูลของท่านเพื่อ:',
      s2List: [
        'บริหารจัดการและเตรียมสถานที่สำหรับการจองเข้าพักปฏิบัติธรรม',
        'บันทึกประวัติการทำบุญและออกเอกสารใบอนุโมทนาบัตร',
        'ติดต่อสื่อสาร ยืนยันข้อมูลการจอง หรือตอบข้อซักถาม',
        'แสดงรายชื่อในหน้าประวัติการทำบุญสาธารณะ (แสดงเฉพาะ ชื่อ, วันเวลา, วัตถุประสงค์ และยอดเงิน เท่านั้น เพื่อร่วมอนุโมทนาบุญ)'
      ],
      s3Title: '3. การรักษาความปลอดภัยและความลับ',
      s3Text: 'ข้อมูลที่มีความอ่อนไหว เช่น เลขประจำตัวประชาชน/ผู้เสียภาษี 13 หลัก จะถูกเก็บรักษาเป็นความลับอย่างเคร่งครัด จะไม่มีการนำมาแสดงผลบนหน้าเว็บไซต์สาธารณะเด็ดขาด โดยจำกัดสิทธิ์ให้เฉพาะเจ้าหน้าที่ที่ได้รับมอบหมายของทางวัดตรวจสอบผ่านระบบหลังบ้านที่ปลอดภัยเท่านั้น',
      s4Title: '4. สิทธิของท่าน',
      s4Text: 'ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่านที่อยู่ในระบบ',
      s5Title: '5. ช่องทางการติดต่อวัด',
      s5Text: 'หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่ วัดพุทธอุทยานนาเทิง ตำบลธาตุ อำเภอวานรนิวาส จังหวัดสกลนคร 47120 ประเทศไทย'
    }
  }

  const t = text[lang]

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '850px' }}>
        <button className="backButton" onClick={() => goToPage('home')}>
          {t.back}
        </button>
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p style={{ fontSize: '13px', color: '#777', marginBottom: '25px' }}>{t.updated}</p>
        <p className="guideIntro">{t.intro}</p>

        <div className="guideContentBlock" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3>{t.s1Title}</h3>
            <p>{t.s1Text}</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#625d55' }}>
              {t.s1List.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{t.s2Title}</h3>
            <p>{t.s2Text}</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#625d55' }}>
              {t.s2List.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{t.s3Title}</h3>
            <p>{t.s3Text}</p>
          </div>

          <div>
            <h3>{t.s4Title}</h3>
            <p>{t.s4Text}</p>
          </div>

          <div>
            <h3>{t.s5Title}</h3>
            <p>{t.s5Text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}