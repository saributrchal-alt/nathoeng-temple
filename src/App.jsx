import { useState } from 'react'
import './App.css'

const content = {
  en: {
    nav: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Teachings', href: '#teachings' },
      { label: 'News & Events', href: '#events' },
      { label: 'Visit & Stay', href: '#visit' },
      { label: 'Retreats', href: '#retreats' },
      { label: 'Support', href: '#support' },
      { label: 'Contact', href: '#contact' }
    ],

    teachings: 'Dhamma Teachings',
    teachingsText:
      'Teachings for cultivating wisdom, mindfulness and inner peace.',

    events: 'Upcoming Events',
    eventsText:
      'Join monastery ceremonies, meditation retreats and community Dhamma activities.',

    visit: 'Visit & Stay',
    visitText:
      'Visitors are welcome to experience monastery life, meditation and the peaceful natural surroundings.',

    retreats: 'Retreats & Practice',
    retreatsText:
      'Spend time in quiet practice, meditation and contemplation in the peaceful natural surroundings of the monastery.',

    learn: 'Learn more',

    support: 'Support the Monastery',
    supportText:
      'Your generosity helps sustain the monastery, Dhamma activities and service to the community.',

    contact: 'Contact the Monastery',
    contactText:
      'For visits, monastery information and general enquiries, please contact us.',

    footerSubtitle: 'Buddhist Park Monastery of Nathoeng · Sakon Nakhon, Thailand'
  },

  th: {
    nav: [
      { label: 'หน้าแรก', href: '#home' },
      { label: 'เกี่ยวกับวัด', href: '#about' },
      { label: 'ธรรมะ', href: '#teachings' },
      { label: 'ข่าวและกิจกรรม', href: '#events' },
      { label: 'เยี่ยมชมและพัก', href: '#visit' },
      { label: 'ปฏิบัติธรรม', href: '#retreats' },
      { label: 'สนับสนุนวัด', href: '#support' },
      { label: 'ติดต่อ', href: '#contact' }
    ],

    teachings: 'พระธรรมคำสอน',
    teachingsText:
      'ธรรมะเพื่อการเจริญปัญญา สติ และความสงบภายใน',

    events: 'ข่าวและกิจกรรม',
    eventsText:
      'ร่วมงานบุญ การปฏิบัติธรรม และกิจกรรมธรรมะของวัด',

    visit: 'เยี่ยมชมและพักที่วัด',
    visitText:
      'เปิดต้อนรับผู้สนใจสัมผัสวิถีชีวิตในวัด การภาวนา และธรรมชาติอันสงบ',

    retreats: 'ปฏิบัติธรรมและภาวนา',
    retreatsText:
      'ใช้เวลาอย่างสงบเพื่อการเจริญสติ สมาธิ และการภาวนา ท่ามกลางธรรมชาติอันสงบของวัด',

    learn: 'ดูเพิ่มเติม',

    support: 'ร่วมสนับสนุนวัด',
    supportText:
      'การให้ของท่านช่วยเกื้อกูลวัด กิจกรรมเผยแผ่ธรรมะ และงานเพื่อชุมชน',

    contact: 'ติดต่อวัด',
    contactText:
      'สำหรับการเยี่ยมชม ข้อมูลเกี่ยวกับวัด หรือสอบถามรายละเอียด สามารถติดต่อทางวัดได้',

    footerSubtitle: 'วัดพุทธอุทยานนาเทิง · จังหวัดสกลนคร ประเทศไทย'
  }
}

function App() {
  const [lang, setLang] = useState('th')
  const [currentPage, setCurrentPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const t = content[lang]

  const goToPage = (page) => {
    setCurrentPage(page)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site">

      {/* HEADER */}
      <header>

        <div className="brand" onClick={() => goToPage('home')} style={{ cursor: 'pointer' }}>
          <div className="dharma">☸</div>
          <div>
            <strong>Buddhist Park Monastery</strong>
            <span>Wat Phuttha Uthayan Na Thoeng</span>
          </div>
        </div>

        <div className="language">
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <span>/</span>
          <button
            className={lang === 'th' ? 'active' : ''}
            onClick={() => setLang('th')}
          >
            TH
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          className="menuToggleBtn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation */}
        <nav className={menuOpen ? 'navOpen' : ''}>
          {t.nav.map((item) => (
            <a 
              href={item.href} 
              key={item.href}
              onClick={(e) => {
                setMenuOpen(false)
                if (item.href === '#contact') {
                  e.preventDefault()
                  goToPage('contact-page')
                } else if (item.href === '#teachings') {
                  e.preventDefault()
                  goToPage('teachings-page')
                } else if (currentPage !== 'home') {
                  e.preventDefault()
                  goToPage('home')
                  setTimeout(() => {
                    const el = document.querySelector(item.href)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

      </header>


      <main>
        {currentPage === 'home' ? (
          <>
            {/* HERO */}
            <section id="home" className="hero"></section>

            {/* ABOUT */}
            <section id="about" className="aboutSection">
              <div className="aboutImage">
                <img
                  src="/images/watermarked_img_18048839418065383299.jpg"
                  alt="วัดพุทธอุทยานนาเทิง"
                />
              </div>
              <div className="aboutContent">
                <p className="eyebrow">{lang === 'en' ? 'ABOUT THE MONASTERY' : 'เกี่ยวกับวัด'}</p>
                <h2>
                  {lang === 'en'
                    ? 'A Forest Monastery in Northeast Thailand'
                    : 'วัดป่าท่ามกลางธรรมชาติแห่งภาคอีสาน'}
                </h2>
                <p>
                  {lang === 'en'
                    ? "Buddhist Park Monastery of Nathoeng is a place for the practice and study of the Buddha's teachings, surrounded by the peaceful natural environment of Sakon Nakhon in Northeast Thailand."
                    : 'วัดพุทธอุทยานนาเทิง เป็นสถานที่สำหรับการศึกษาและปฏิบัติตามพระธรรมคำสอนของพระพุทธเจ้า ท่ามกลางธรรมชาติอันสงบในจังหวัดสกลนคร'}
                </p>
                <p>
                  {lang === 'en'
                    ? 'The monastery offers a simple setting for meditation, mindfulness, Dhamma practice and community activities.'
                    : 'วัดเป็นสถานที่สำหรับการภาวนา เจริญสติ ศึกษาธรรมะ และร่วมกิจกรรมทางพระพุทธศาสนาอย่างเรียบง่าย'}
                </p>
                <button onClick={() => goToPage('teachings-page')} className="textLinkButton">
                  {lang === 'en' ? 'Discover monastery life →' : 'สัมผัสวิถีชีวิตภายในวัด →'}
                </button>
              </div>
            </section>

            {/* MAIN FEATURES */}
            <section className="featureSection">
              <div className="sectionHeading">
                <p className="eyebrow">{lang === 'en' ? 'EXPLORE' : 'เรียนรู้และเยี่ยมชม'}</p>
                <h2>{lang === 'en' ? 'Life at the Monastery' : 'วิถีแห่งวัดพุทธอุทยานนาเทิง'}</h2>
              </div>

              <div className="cards">
                {/* DHAMMA */}
                <article id="teachings" className="imageCard">
                  <div className="cardImage">
                    <img src="/images/486526184_680593961012974_4699356998246297917_n.jpg" alt="Dhamma" />
                  </div>
                  <div className="cardContent">
                    <span className="cardIcon">☸</span>
                    <h3>{t.teachings}</h3>
                    <p>{t.teachingsText}</p>
                    <button onClick={() => goToPage('teachings-page')} className="inlineButtonLink">
                      {t.learn} →
                    </button>
                  </div>
                </article>

                {/* EVENTS */}
                <article id="events" className="imageCard">
                  <div className="cardImage">
                    <img src="/images/487812128_689539323451771_1128859791552978185_n.jpg" alt="Events" />
                  </div>
                  <div className="cardContent">
                    <span className="cardIcon">◷</span>
                    <h3>{t.events}</h3>
                    <p>{t.eventsText}</p>
                    <button onClick={() => goToPage('event-kathina')} className="inlineButtonLink">
                      {t.learn} →
                    </button>
                  </div>
                </article>

                {/* VISIT */}
                <article id="visit" className="imageCard">
                  <div className="cardImage">
                    <img src="/images/99425106_2619520384959784_4372406926441447424_n.jpg" alt="Visit" />
                  </div>
                  <div className="cardContent">
                    <span className="cardIcon">⌂</span>
                    <h3>{t.visit}</h3>
                    <p>{t.visitText}</p>
                    <button onClick={() => goToPage('visit-guide')} className="inlineButtonLink">
                      {t.learn} →
                    </button>
                  </div>
                </article>
              </div>
            </section>

            {/* RETREATS */}
            <section id="retreats" className="quietSection">
              <div className="quietImage">
                <img src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg" alt="Retreats" />
              </div>
              <div className="quietContent">
                <p className="eyebrow">{lang === 'en' ? 'PRACTICE' : 'การปฏิบัติ'}</p>
                <h2>{t.retreats}</h2>
                <p>{t.retreatsText}</p>
                <button onClick={() => goToPage('visit-guide')} className="textLinkButton">
                  {lang === 'en' ? 'Plan your visit →' : 'ข้อมูลการมาปฏิบัติธรรม →'}
                </button>
              </div>
            </section>

            {/* SUPPORT */}
            <section id="support" className="support">
              <div>
                <p className="eyebrow">{lang === 'en' ? 'GENEROSITY' : 'การให้'}</p>
                <h2>{t.support}</h2>
                <p>{t.supportText}</p>
                <button>{t.learn}</button>
              </div>
            </section>

            {/* CONTACT */}
            <section id="contact" className="contactSection">
              <p className="eyebrow">{lang === 'en' ? 'CONTACT' : 'ติดต่อ'}</p>
              <h2>{t.contact}</h2>
              <p>{t.contactText}</p>
              <div style={{ marginTop: '25px' }}>
                <button onClick={() => goToPage('contact-page')} className="primaryContactBtn">
                  {lang === 'en' ? 'View Map & Contact Details →' : 'ดูแผนที่และช่องทางการติดต่อ →'}
                </button>
              </div>
              <div className="lotus">❦</div>
            </section>
          </>
        ) : currentPage === 'teachings-page' ? (
          /* ================= PAGE: TEACHINGS (หลวงปู่มั่น) ================= */
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>
              <span className="eyebrow">{lang === 'en' ? 'DHAMMA TEACHINGS' : 'พระธรรมคำสอนทรงคุณค่า'}</span>
              <h1>{lang === 'en' ? 'Teachings of Venerable Luang Pu Mun' : 'คำสอน...หลวงปู่มั่น ภูริทัตโต'}</h1>
              <p className="guideIntro">
                {lang === 'en'
                  ? 'Essential Dhamma teachings and contemplation guidelines from Venerable Luang Pu Mun Phuritatto.'
                  : 'รวบรวมคติธรรมและโอวาทธรรมคำสอนอันทรงคุณค่ายิ่งขององค์หลวงปู่มั่น ภูริทัตโต พระอริยสงฆ์สายวัดป่ากรรมฐาน'}
              </p>
              <div className="guideImageFrame">
                <img src="/images/93b4f839-927c-4ce7-8ea1-b8fd15651182.jpg" alt="หลวงปู่มั่น ภูริทัตโต" />
                <span className="imageCaption">{lang === 'en' ? 'Venerable Luang Pu Mun' : 'องค์พระอาจารย์มั่น ภูริทัตตเถระ'}</span>
              </div>
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '1. Self-Reflection & Non-Judgment' : '1. การไม่ติเตียนผู้อื่น และการมองตนเอง'}</h3>
                <p>
                  {lang === 'en'
                    ? 'Even if others are truly at fault, focusing on their faults only brings agitation to one’s own mind.'
                    : 'ถึงเขาจะผิดจริงก็อย่าไปติเตียนเขา การไปนึกถึงความผิดของผู้อื่น มีแต่จะทำให้ใจตนเองขุ่นมัวและกระวนกระวาย'}
                </p>
              </div>
              <div className="guideSectionBox">
                <h3>{lang === 'en' ? '2. Core Principles' : '2. คติพจน์ล้ำค่าของหลวงปู่มั่น'}</h3>
                <ul>
                  <li><strong>ดีใดไม่มีโทษ:</strong> ดีนั้นชื่อว่าดีเลิศ</li>
                  <li><strong>การได้ตนเอง:</strong> ได้สมบัติทั้งปวงไม่ประเสริฐเท่าได้ตน</li>
                </ul>
              </div>
              <div className="guideContactBox">
                <h3>{lang === 'en' ? 'Experience Meditation' : 'สัมผัสวิถีแห่งการปฏิบัติธรรม'}</h3>
                <button onClick={() => goToPage('visit-guide')} className="primaryContactBtn">
                  {lang === 'en' ? 'View Guidelines →' : 'ดูข้อมูลการเข้าพักปฏิบัติธรรม →'}
                </button>
              </div>
            </div>
          </div>
        ) : currentPage === 'visit-guide' ? (
          /* ================= PAGE: VISIT & STAY GUIDE ================= */
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>
              <span className="eyebrow">{lang === 'en' ? 'VISIT & STAY GUIDELINES' : 'ระเบียบการและสถานที่พัก'}</span>
              <h1>{lang === 'en' ? 'Monastery Stay' : 'สถานที่พักและบรรยากาศการปฏิบัติธรรม'}</h1>
              <p className="guideIntro">
                {lang === 'en' ? 'A peaceful and supportive environment for practitioners.' : 'วัดพุทธอุทยานนาเทิง จัดเตรียมพื้นที่อันสัปปายะ เพื่อให้ผู้ปฏิบัติธรรมได้ใช้ชีวิตอย่างสงบเย็น'}
              </p>
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '1. Accommodation' : '1. สถานที่พักสำหรับผู้ปฏิบัติธรรม'}</h3>
                <div className="guideImageFrame">
                  <img src="/images/8301.jpg" alt="Accommodation" />
                  <span className="imageCaption">{lang === 'en' ? 'Peaceful area' : 'บรรยากาศอาคารที่พัก'}</span>
                </div>
              </div>
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '2. Practice Atmosphere' : '2. บรรยากาศการปฏิบัติธรรม'}</h3>
                <div className="guideImageFrame">
                  <img src="/images/559063252_835057645566604_50190803944267715_n.jpg" alt="Practice" />
                  <span className="imageCaption">{lang === 'en' ? 'Meditation' : 'การเจริญสติภาวนา'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'event-kathina' ? (
          /* ================= PAGE: KATHINA EVENT (7-8 Nov 2026 with estimated times) ================= */
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>
              <span className="eyebrow">ข่าวประชาสัมพันธ์งานบุญใหญ่ · 7 - 8 พฤศจิกายน 2569</span>
              <h1>ขอเชิญร่วมงานบุญกฐินสามัคคี ประจำปี 2569</h1>
              <p className="guideIntro">
                วัดพุทธอุทยานนาเทิง จังหวัดสกลนคร ขออำนวยพรและบอกบุญมายังพุทธศาสนิกชนและผู้มีจิตศรัทธาทุกท่าน มาร่วมบำเพ็ญกุศลในงานบุญกฐินสามัคคี ประจำปีพุทธศักราช 2569 เพื่อสมทบทุนทำนุบำรุงพระพุทธศาสนาและพัฒนาเสนาสนะภายในวัด ระหว่างวันที่ 7 - 8 พฤศจิกายน 2569 นี้
              </p>

              {/* ประธานกฐิน */}
              <div className="guideSectionBox" style={{ background: '#fcfbfa', padding: '20px 25px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #eeeae2', textAlign: 'center' }}>
                <h3 style={{ color: '#9b7226', marginBottom: '8px', fontSize: '1.2rem' }}>
                  🙏 ประธานกฐินสามัคคี ประจำปี 2569
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#302d29', fontWeight: '500', margin: 0 }}>
                  คุณพิชัย สกุลคุณสวัสดิ์ พร้อมด้วยครอบครัวและญาติพี่น้อง
                </p>
              </div>

              {/* กำหนดการอย่างละเอียด */}
              <div className="guideSectionBox" style={{ background: '#f6f4ef', padding: '25px 30px', borderRadius: '4px', marginBottom: '40px', border: '1px solid #eeeae2' }}>
                <h3 style={{ borderBottom: '1px solid #dcd5c8', paddingBottom: '10px', marginTop: 0, color: '#302d29' }}>
                  📋 กำหนดการงานบุญกฐินสามัคคี (7 - 8 พฤศจิกายน 2569)
                </h3>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#9b7226', fontSize: '1.1rem', marginBottom: '10px' }}>
                    วันแรก: วันศุกร์ที่ 7 พฤศจิกายน 2569 (วันตั้งองค์กฐิน / สมโภช)
                  </h4>
                  <ul style={{ marginBottom: '25px', lineHeight: '1.8' }}>
                    <li><strong>เวลา 08.30 น. เป็นต้นไป</strong> - คณะศรัทธาญาติโยมร่วมกันตั้งกองกฐินและเครื่องบริวารกฐิน ดำเนินกิจกรรมต่อเนื่องไปตลอดทั้งวัน</li>
                    <li><strong>เวลา 15.30 น.</strong> - พิธีเจริญพระพุทธมนต์ สมโภชกองกฐิน</li>
                    <li><strong>เวลา 16.30 น.</strong> - พิธีบายศรีสู่ขวัญคณะเจ้าภาพ, การรำเชิญขวัญและรำต้อนรับอันงดงามตามประเพณี</li>
                    <li><strong>เวลา 18.00 น.</strong> - คณะชาวบ้านและคณะเจ้าภาพร่วมรับประทานอาหาร "ข้าวแลง" (อาหารเย็น) อีสานร่วมกันด้วยความอบอุ่นและสามัคคี</li>
                  </ul>

                  <h4 style={{ color: '#9b7226', fontSize: '1.1rem', marginBottom: '10px' }}>
                    วันที่สอง: วันเสาร์ที่ 8 พฤศจิกายน 2569 (วันทอดกฐินสามัคคี)
                  </h4>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>เวลา 07.00 น.</strong> - คณะสงฆ์ออกเดินบิณฑบาต <strong>รอบลานวัดหน้าศาลา</strong> คณะศรัทธาญาติโยมร่วมทำบุญตักบาตรยามเช้า</li>
                    <li><strong>เวลา 08.00 น.</strong> - ถวายภัตตาหารเช้าแด่พระสงฆ์ และมีพิธีสำคัญ:
                      <ul style={{ marginTop: '6px', marginBottom: '10px' }}>
                        <li>พิธีถวายกุฏิ <strong>"สกุลคุณสวัสดิ์ 3"</strong></li>
                        <li>พิธีถวาย <strong>"ที่ระลึกหลวงปู่มั่น"</strong></li>
                        <li>พิธีถวายพระประธาน</li>
                      </ul>
                    </li>
                    <li><strong>เวลา 09.00 น.</strong> - ตั้งขบวนแห่กฐินและเคลื่อนขบวนแห่มายังวัดเพื่อทำพิธีถวายผ้ากฐินสามัคคี</li>
                    <li><strong>เวลา 09.30 น.</strong> - ประกอบพิธีทอดกฐินสามัคคี / ถวายจตุปัจจัยไทยธรรม</li>
                    <li><strong>เวลา 10.30 น.</strong> - กิจกรรมมงคล: ร่วมสนุกกับการ<strong>จับฉลากรับของมงคลจากงาน</strong> เช่น เครื่องบริวารกฐิน, อ้อย, กล้วย, ธงกฐิน ฯลฯ</li>
                    <li><strong>เวลา 11.00 น.</strong> - พระสงฆ์อนุโมทนา / กรวดน้ำรับพร เป็นอันเสร็จสิ้นพิธีทอดกฐิน</li>
                    <li><strong>เวลา 11.30 น.</strong> - เชิญชวนคณะศรัทธาทุกท่านร่วมรับประทานอาหารกลางวันและร่วมโรงทานภายในวัด</li>
                  </ul>
                </div>
              </div>

              {/* ภาพประกอบในงาน */}
              <div className="guideContentBlock">
                <h3>1. ขบวนแห่กฐินสามัคคีอันอบอุ่น</h3>
                <div className="guideImageFrame">
                  <img src="/images/561914583_836239988781703_4146873103108656226_n.jpg" alt="ขบวนแห่กฐิน" />
                  <span className="imageCaption">ขบวนแห่กฐินสามัคคีตามประเพณีไทย</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>2. โรงทานอิ่มบุญอิ่มใจ</h3>
                <div className="guideImageFrame">
                  <img src="/images/487913616_689541166784920_1785354843670392147_n.jpg" alt="โรงทาน" />
                  <span className="imageCaption">บรรยากาศโรงทานการกุศลในงาน</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>3. พิธีทำบุญตักบาตรยามเช้า</h3>
                <div className="guideImageFrame">
                  <img src="/images/560188892_836240912114944_3910816619043716260_n.jpg" alt="ตักบาตร" />
                  <span className="imageCaption">ทำบุญตักบาตรข้าวสารอาหารแห้ง</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>4. พิธีถวายผ้ากฐินสามัคคี</h3>
                <div className="guideImageFrame">
                  <img src="/images/561340868_836253482113687_5055104485744791787_n.jpg" alt="ถวายผ้ากฐิน" />
                  <span className="imageCaption">พิธีถวายผ้ากฐินภายในวัดพุทธอุทยานนาเทิง</span>
                </div>
              </div>

              <div className="guideContactBox">
                <h3>ติดต่อสอบถามข้อมูลการมาร่วมงาน</h3>
                <p>ท่านสามารถมาร่วมงานบุญด้วยตนเอง หรือติดต่อสอบถามรายละเอียดเพิ่มเติมได้ที่วัดพุทธอุทยานนาเทิง จ.สกลนคร</p>
                <button onClick={() => goToPage('contact-page')} className="primaryContactBtn">
                  ดูแผนที่และช่องทางติดต่อ →
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* ================= PAGE: CONTACT & MAP ================= */
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>
              <span className="eyebrow">{lang === 'en' ? 'LOCATION & CONTACT' : 'แผนที่และการเดินทาง'}</span>
              <h1>วัดพุทธอุทยานนาเทิง</h1>
              <p className="guideIntro">231 หมู่ 2 ตำบลธาตุ อำเภอวานรนิวาส จังหวัดสกลนคร 47120 ประเทศไทย</p>
              
              <div className="guideContentBlock">
                <div className="mapContainer" style={{ width: '100%', height: '350px', borderRadius: '4px', overflow: 'hidden' }}>
                  <iframe 
                    title="Map"
                    src="https://maps.google.com/maps?q=17.621679,103.653418&z=15&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                  ></iframe>
                </div>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <a href="https://maps.google.com/?q=17.621679,103.653418" target="_blank" rel="noopener noreferrer" className="primaryContactBtn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    เปิดใน Google Maps เพื่อนำทาง →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="dharma">☸</div>
          <strong>{lang === 'en' ? 'Buddhist Park Monastery' : 'วัดพุทธอุทยานนาเทิง'}</strong>
          <p>{t.footerSubtitle}</p>
          <div className="footer-divider"></div>
          <div className="footer-bottom-info">
            <div>Buddhist Park Monastery of Nathoeng</div>
            <div>Copyright © 2026 All Rights Reserved</div>
            <div>Powered by Nathoeng Tech Community</div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App