export default function TermsPage({ lang, goToPage }) {
  const text = {
    en: {
      back: '← Back to Home',
      eyebrow: 'LEGAL & TERMS',
      title: 'Terms & Conditions',
      updated: 'Last updated: August 25, 2026',
      intro: 'Welcome to the official website of Buddhist Park Monastery of Nathoeng. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions.',
      s1Title: '1. Acceptance of Terms',
      s1Text: 'By accessing or using our website, booking monastery stays, or submitting online donations, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.',
      s2Title: '2. Monastery Stay Bookings',
      s2Text: 'When booking a stay or meditation retreat through our platform:',
      s2List: [
        'Visitors must strictly follow the monastery rules, precepts, and code of conduct during their stay.',
        'The monastery reserves the right to review and approve stay requests to maintain a peaceful and meditative environment.',
        'Guests are expected to respect the sacred space, monks, and fellow practitioners.'
      ],
      s3Title: '3. Donations & Contributions',
      s3Text: 'All online contributions and donations made through our system are voluntary offerings to support the monastery activities, utilities, and developments. Donation details provided (such as name and tax ID) are processed securely for acknowledgment and receipt issuance upon request.',
      s4Title: '4. Intellectual Property',
      s4Text: 'All content, photos, texts, and media displayed on this website are owned by Buddhist Park Monastery of Nathoeng or used with permission. Unauthorized commercial use or reproduction is strictly prohibited.',
      s5Title: '5. Limitation of Liability',
      s5Text: 'The monastery strives to ensure that all information on the website is accurate and up-to-date. However, we are not liable for any direct or indirect technical issues, service interruptions, or inaccuracies beyond our control.',
      s6Title: '6. Contact Information',
      s6Text: 'If you have any questions regarding these Terms & Conditions, please contact us via our official communication channels or visit the monastery directly.'
    },
    th: {
      back: '← กลับสู่หน้าหลัก',
      eyebrow: 'ข้อกำหนดและเงื่อนไข',
      title: 'เงื่อนไขการใช้งานเว็บไซต์',
      updated: 'ปรับปรุงล่าสุด: 25 สิงหาคม 2569',
      intro: 'ยินดีต้อนรับสู่เว็บไซต์อย่างเป็นทางการของวัดพุทธอุทยานนาเทิง การเข้าใช้งานเว็บไซต์นี้ถือว่าท่านยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขการใช้งานดังต่อไปนี้',
      s1Title: '1. การยอมรับข้อตกลง',
      s1Text: 'การเข้าชมเว็บไซต์ การจองห้องพัก/ที่พักปฏิบัติธรรม หรือการทำบุญบริจาคผ่านระบบออนไลน์ของทางวัด ถือเป็นการแสดงว่าท่านได้อ่าน ทำความเข้าใจ และตกลงผูกพันตนเองตามข้อกำหนดและเงื่อนไขฉบับนี้',
      s2Title: '2. การจองเข้าพักปฏิบัติธรรม',
      s2Text: 'เมื่อท่านทำการจองเข้าพักหรือปฏิบัติธรรมผ่านระบบของทางวัด:',
      s2List: [
        'ผู้เข้าพักต้องปฏิบัติตามกฎระเบียบ ข้อบังคับ และรักษาศีลของสำนักปฏิบัติธรรมอย่างเคร่งครัด',
        'ทางวัดขอสงวนสิทธิ์ในการพิจารณาและจัดการคำขอจอง เพื่อรักษาความสงบเรียบร้อยและบรรยากาศอันสัปปายะ',
        'ผู้เข้าพักต้องมีความสำรวมและให้ความเคารพต่อสถานที่ พระสงฆ์ และเพื่อนร่วมปฏิบัติธรรมท่านอื่น'
      ],
      s3Title: '3. การทำบุญและบริจาค',
      s3Text: 'การบริจาคปัจจัยผ่านระบบออนไลน์ของทางวัด เป็นการร่วมทำบุญด้วยความสมัครใจ เพื่อสนับสนุนกิจกรรมทางพระพุทธศาสนา ค่าน้ำค่าไฟ และการพัฒนาเสนาสนะ ข้อมูลที่ท่านกรอก (เช่น ชื่อ และเลขประจำตัว) จะถูกนำมาใช้สำหรับการบันทึกและออกใบอนุโมทนาบัตรตามความประสงค์',
      s4Title: '4. ทรัพย์สินทางปัญญา',
      s4Text: 'เนื้อหา รูปภาพ ข้อความ และสื่อทั้งหมดบนเว็บไซต์นี้ เป็นลิขสิทธิ์ของวัดพุทธอุทยานนาเทิง หรือได้รับอนุญาตให้นำมาเผยแพร่ ห้ามมิให้นำไปใช้เพื่อประโยชน์ทางการค้าหรือทำซ้ำโดยไม่ได้รับอนุญาต',
      s5Title: '5. ข้อจำกัดความรับผิดชอบ',
      s5Text: 'ทางวัดมีความมุ่งมั่นที่จะดูแลข้อมูลบนเว็บไซต์ให้ถูกต้องและทันสมัยอยู่เสมอ อย่างไรก็ตาม ทางวัดจะไม่รับผิดชอบต่อความเสียหายทางเทคนิค เหตุขัดข้องทางระบบอินเทอร์เน็ต หรือข้อผิดพลาดที่อยู่นอกเหนือการควบคุม',
      s6Title: '6. ช่องทางการติดต่อ',
      s6Text: 'หากท่านมีข้อสงสัยประการใดเกี่ยวกับข้อกำหนดและเงื่อนไขการใช้งานนี้ สามารถติดต่อสอบถามได้ผ่านช่องทางติดต่อทางการของทางวัด'
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

          <div>
            <h3>{t.s6Title}</h3>
            <p>{t.s6Text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}