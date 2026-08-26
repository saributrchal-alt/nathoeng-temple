import { useState, useEffect } from 'react'
import './App.css'
import BookingPage from './pages/BookingPage'
import CalendarPage from './pages/CalendarPage'
import DonationPage from './pages/DonationPage'
import DonationListPage from './pages/DonationListPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'

const content = {
  en: {
    nav: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Teachings', href: '#teachings' },
      { label: 'News & Events', href: '#events' },
      { label: 'Visit & Stay', href: '#visit' },
      { label: 'Support', href: '#support' },
      { label: 'Contact', href: '#contact' },
      { label: 'Admin', href: '#admin-dashboard' },
      { label: 'Login', href: '#login-page' }
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

    footerSubtitle: 'Buddhist Park Monastery of Nathoeng · Sakon Nakhon, Thailand',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms & Conditions',

    // Kathina Page English Content
    kathinaEyebrow: 'Major Merit-Making Event · November 7 - 8, 2026',
    kathinaTitle: 'Annual Kathina Robe Offering Ceremony 2026',
    kathinaIntro: 'Buddhist Park Monastery of Nathoeng, Sakon Nakhon warmly invites all devotees and friends to join the annual Kathina Robe Offering Ceremony for the year 2026, to support the monastery and community developments.',
    chairpersonTitle: '🙏 Kathina Chairperson 2026',
    chairpersonName: 'Mr. Pichai - Mrs. Supharat Sakunkunsawat and Family & Relatives (Chonburi)',
    scheduleTitle: '📋 Kathina Ceremony Schedule (November 7 - 8, 2026)',
    day1Title: 'Day 1: Saturday, November 7, 2026 (Kathina Foundation & Celebration)',
    day1List: [
      '08.30 AM onwards: Devotees gather to set up the Kathina fund and offerings, continuing throughout the day.',
      '03.30 PM: Chanting ceremony and celebration of the Kathina fund.',
      '04.30 PM: Traditional Baisi Sukhwan blessing ceremony for the chairperson, accompanied by welcoming traditional dances.',
      '06.00 PM: Community "Khaolaeng" (traditional northern/northeastern dinner) shared warmly between locals and guests.'
    ],
    day2Title: 'Day 2: Sunday, November 8, 2026 (Kathina Offering Day)',
    day2List: [
      '07.00 AM: Monks go on alms round around the courtyard in front of the pavilion; devotees offer morning alms.',
      '08.00 AM: Offering of breakfast to the monks, followed by auspicious dedication ceremonies:',
      '• Offering of "Sakunkunsawat 3" Kutti (Monk’s residence)',
      '• Offering of Luang Pu Mun Memorial Kutti',
      '• Offering of the Principal Buddha Statue',
      '09.00 AM: Formation of the Kathina procession to the monastery.',
      '09.30 AM: Kathina Robe Offering Ceremony and presentation of offerings.',
      '10.00 AM: Monks chant blessings and transfer of merits, concluding the Kathina offering ceremony.',
      '10.30 AM: Auspicious lucky draw activity for blessed items from the ceremony (such as Kathinaบริวาร, sugarcane, bananas, Kathina flags, etc.).',
      '11.30 AM: Vegetarian and general food stalls (Rong Than) open for all participants.'
    ],
    imgCaption1: 'A warm and joyous Kathina procession filled with smiles, joyful hearts, and beautiful traditional Thai devotion.',
    imgCaption2: 'The charitable food stalls (Rong Than), brimming with kindness and sharing, offering a wonderful taste of community warmth and merit.',
    imgCaption3: 'Starting the auspicious day with morning alms-giving alongside family and spiritual friends amidst the serene forest monastery.',
    imgCaption4: 'The sacred and meaningful Kathina Robe Offering Ceremony at Buddhist Park Monastery, preserving the Dhamma and making great merits together.',
    
    contactSectionTitle: 'For More Information',
    contactSectionText: 'You are welcome to join us in person or contact the monastery directly for further details.',
    contactBtn: 'View Map & Contact Details →',
    backHome: '← Back to Home',

    // Share labels
    shareTitle: 'Share this news:',
    shareFb: 'Share on Facebook',
    shareLine: 'Share on LINE',
    shareCopy: 'Copy Link',
    copiedText: 'Copied link to clipboard!',

    // Contact Page English Content
    contactPageEyebrow: 'LOCATION & CONTACT',
    contactPageTitle: 'Buddhist Park Monastery of Nathoeng',
    contactPageAddress: '231 Moo 2, That Sub-district, Waritchaphum / Wanon Niwat District, Sakon Nakhon 47120, Thailand',
    mapOpenBtn: 'Open in Google Maps →'
  },

  th: {
    nav: [
      { label: 'หน้าแรก', href: '#home' },
      { label: 'เกี่ยวกับวัด', href: '#about' },
      { label: 'ธรรมะ', href: '#teachings' },
      { label: 'ข่าวและกิจกรรม', href: '#events' },
      { label: 'ปฏิบัติธรรม / เยี่ยมชม', href: '#visit' },
      { label: 'สนับสนุนวัด', href: '#support' },
      { label: 'ติดต่อ', href: '#contact' },
      { label: 'ระบบผู้ดูแล', href: '#admin-dashboard' },
      { label: 'เข้าสู่ระบบ', href: '#login-page' }
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

    footerSubtitle: 'วัดพุทธอุทยานนาเทิง · จังหวัดสกลนคร ประเทศไทย',
    privacyLink: 'นโยบายความเป็นส่วนตัว',
    termsLink: 'เงื่อนไขการใช้งาน',

    // Kathina Page Thai Content
    kathinaEyebrow: 'ข่าวประชาสัมพันธ์งานบุญใหญ่ · 7 - 8 พฤศจิกายน 2569',
    kathinaTitle: 'ขอเชิญร่วมงานบุญกฐินสามัคคี ประจำปี 2569',
    kathinaIntro: 'วัดพุทธอุทยานนาเทิง จังหวัดสกลนคร ขออำนวยพรและบอกบุญมายังพุทธศาสนิกชนและผู้มีจิตศรัทธาทุกท่าน มาร่วมบำเพ็ญกุศลในงานบุญกฐินสามัคคี ประจำปีพุทธศักราช 2569 เพื่อสมทบทุนทำนุบำรุงพระพุทธศาสนาและพัฒนาเสนาสนะภายในวัด ระหว่างวันที่ 7 - 8 พฤศจิกายน 2569 นี้',
    chairpersonTitle: '🙏 ประธานกฐินสามัคคี ประจำปี 2569',
    chairpersonName: 'คุณพิชัย - คุณศุภรัตน์ สกุลคุณสวัสดิ์ พร้อมด้วยครอบครัวและญาติพี่น้อง (จ.ชลบุรี)',
    scheduleTitle: '📋 กำหนดการงานบุญกฐินสามัคคี (7 - 8 พฤศจิกายน 2569)',
    day1Title: 'วันแรก: วันเสาร์ที่ 7 พฤศจิกายน 2569 (วันตั้งองค์กฐิน / สมโภช)',
    day1List: [
      'เวลา 08.30 น. เป็นต้นไป - คณะศรัทธาญาติโยมร่วมกันตั้งกองกฐินและเครื่องบริวารกฐิน ดำเนินกิจกรรมต่อเนื่องไปตลอดทั้งวัน',
      'เวลา 15.30 น. - พิธีเจริญพระพุทธมนต์ สมโภชกองกฐิน',
      'เวลา 16.30 น. - พิธีบายศรีสู่ขวัญคณะเจ้าภาพ, การรำเชิญขวัญและรำต้อนรับอันงดงามตามประเพณี',
      'เวลา 18.00 น. - คณะชาวบ้านและคณะเจ้าภาพร่วมรับประทานอาหาร "ข้าวแลง" (อาหารเย็น) อีสานร่วมกันด้วยความอบอุ่นและสามัคคี'
    ],
    day2Title: 'วันที่สอง: วันอาทิตย์ที่ 8 พฤศจิกายน 2569 (วันทอดกฐินสามัคคี)',
    day2List: [
      'เวลา 07.00 น. - คณะสงฆ์ออกเดินบิณฑบาต รอบลานวัดหน้าศาลา คณะศรัทธาญาติโยมร่วมทำบุญตักบาตรยามเช้า',
      'เวลา 08.00 น. - ถวายภัตตาหารเช้าแด่พระสงฆ์ และมีพิธีสำคัญ:',
      '• พิธีถวายกุฏิ "สกุลคุณสวัสดิ์ 3"',
      '• พิธีถวายกุฏิที่ระลึกหลวงปู่มั่น',
      '• พิธีถวายพระประธาน',
      'เวลา 09.00 น. - ตั้งขบวนแห่กฐินและเคลื่อนขบวนแห่มายังวัดเพื่อทำพิธีถวายผ้ากฐินสามัคคี',
      'เวลา 09.30 น. - ประกอบพิธีทอดกฐินสามัคคี / ถวายจตุปัจจัยไทยธรรม',
      'เวลา 10.00 น. - พระสงฆ์อนุโมทนา / กรวดน้ำรับพร เป็นอันเสร็จสิ้นพิธีทอดกฐิน',
      'เวลา 10.30 น. - กิจกรรมมงคล: ร่วมสนุกกับการจับฉลากรับของมงคลจากงาน เช่น เครื่องบริวารกฐิน, อ้อย, กล้วย, ธงกฐิน ฯลฯ',
      'เวลา 11.30 น. - เชิญชวนคณะศรัทธาทุกท่านร่วมรับประทานอาหารกลางวันและร่วมโรงทานภายในวัด'
    ],
    imgCaption1: 'ขบวนแห่กฐินสามัคคีอันอบอุ่นและม่วนซื่น เต็มไปด้วยรอยยิ้ม เสียงหัวใจที่พองโต และแรงศรัทธาอันงดงามตามวิถีไทย',
    imgCaption2: 'บรรยากาศโรงทานการกุศล เปี่ยมด้วยน้ำใจไมตรีและการแบ่งปัน อิ่มอร่อยและอิ่มบุญร่วมกันในยามมาเยือนวัด',
    imgCaption3: 'เริ่มต้นวันใหม่อย่างเป็นมงคล ด้วยการทำบุญตักบาตรยามเช้าเคียงข้างครอบครัวและกัลยาณมิตร ท่ามกลางบรรยากาศวัดป่าอันสงบเย็น',
    imgCaption4: 'พิธีถวายผ้ากฐินอันศักดิ์สิทธิ์และทรงคุณค่า ณ วัดพุทธอุทยานนาเทิง เพื่อสืบสานพระพุทธศาสนาและสร้างมหากุศลร่วมกัน',
    
    contactSectionTitle: 'ติดต่อสอบถามข้อมูลการมาร่วมงาน',
    contactSectionText: 'ท่านสามารถมาร่วมงานบุญด้วยตนเอง หรือติดต่อสอบถามรายละเอียดเพิ่มเติมได้ที่วัดพุทธอุทยานนาเทิง จ.สกลนคร',
    contactBtn: 'ดูแผนที่และช่องทางการติดต่อ →',
    backHome: '← กลับสู่หน้าหลัก',

    // Share labels
    shareTitle: 'แชร์บอกบุญข่าวนี้:',
    shareFb: 'แชร์ไป Facebook',
    shareLine: 'แชร์ไป LINE',
    shareCopy: 'คัดลอกลิงก์',
    copiedText: 'คัดลอกลิงก์เรียบร้อยแล้ว!',

    // Contact Page Thai Content
    contactPageEyebrow: 'แผนที่และการเดินทาง',
    contactPageTitle: 'วัดพุทธอุทยานนาเทิง',
    contactPageAddress: '231 หมู่ 2 ตำบลธาตุ อำเภอวานรนิวาส จังหวัดสกลนคร 47120 ประเทศไทย',
    mapOpenBtn: 'เปิดใน Google Maps เพื่อนำทาง →'
  }
}

function App() {
  const [lang, setLang] = useState('th')
  const [currentPage, setCurrentPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)
  const t = content[lang]

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (
        hash === 'event-kathina' || 
        hash === 'teachings-page' || 
        hash === 'visit-guide' || 
        hash === 'contact-page' || 
        hash === 'booking-page' || 
        hash === 'calendar-page' ||
        hash === 'donation-page' ||
        hash === 'donation-list' ||
        hash === 'admin-dashboard' ||
        hash === 'privacy-policy' ||
        hash === 'terms-page' ||
        hash === 'login-page'
      ) {
        setCurrentPage(hash)
      } else {
        setCurrentPage('home')
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      const loggedUser = {
        name: 'ผู้ใช้งาน LINE (สมาชิกวัด)',
        lineUid: '',
        picture: ''
      }
      setUser(loggedUser)
      localStorage.setItem('line_user', JSON.stringify(loggedUser))
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash)
    } else {
      const savedUser = localStorage.getItem('line_user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error("Error parsing saved user", e)
        }
      }
    }
  }, [])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('line_user')
    goToPage('home')
  }

  const goToPage = (page) => {
    setCurrentPage(page)
    setMenuOpen(false)
    window.location.hash = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentUrl = window.location.href

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: '500', color: '#06c755' }}>🟢 {user.name}</span>
              <button 
                onClick={handleLogout}
                style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
              >
                {lang === 'en' ? 'Logout' : 'ออก'}
              </button>
            </div>
          )}
        </div>

        <button 
          className="menuToggleBtn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={menuOpen ? 'navOpen' : ''}>
          {t.nav.map((item) => (
            <a 
              href={item.href} 
              key={item.href}
              onClick={(e) => {
                setMenuOpen(false)
                e.preventDefault()
                if (item.href === '#contact') {
                  goToPage('contact-page')
                } else if (item.href === '#teachings') {
                  goToPage('teachings-page')
                } else if (item.href === '#events') {
                  goToPage('event-kathina')
                } else if (item.href === '#visit') {
                  goToPage('visit-guide')
                } else if (item.href === '#admin-dashboard') {
                  goToPage('admin-dashboard')
                } else if (item.href === '#login-page') {
                  goToPage('login-page')
                } else {
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
            <section id="home" className="hero"></section>

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

            <section className="featureSection">
              <div className="sectionHeading">
                <p className="eyebrow">{lang === 'en' ? 'EXPLORE' : 'เรียนรู้และเยี่ยมชม'}</p>
                <h2>{lang === 'en' ? 'Life at the Monastery' : 'วิถีแห่งวัดพุทธอุทยานนาเทิง'}</h2>
              </div>

              <div className="cards">
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

            <section id="retreats" className="quietSection">
              <div className="quietImage">
                <img src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg" alt="Retreats" />
              </div>
              <div className="quietContent">
                <p className="eyebrow">{lang === 'en' ? 'PRACTICE' : 'การปฏิบัติ'}</p>
                <h2>{t.retreats}</h2>
                <p>{t.retreatsText}</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <button onClick={() => goToPage('visit-guide')} className="textLinkButton">
                    {lang === 'en' ? 'Read guidelines & book stay →' : 'อ่านระเบียบการและจองเข้าพัก →'}
                  </button>
                  <button onClick={() => goToPage('calendar-page')} className="textLinkButton" style={{ color: '#9b7226' }}>
                    {lang === 'en' ? 'View Schedule →' : 'ดูตารางการจองเข้าพัก →'}
                  </button>
                </div>
              </div>
            </section>

            <section id="support" className="support">
              <div>
                <p className="eyebrow">{lang === 'en' ? 'GENEROSITY' : 'การให้'}</p>
                <h2>{t.support}</h2>
                <p>{t.supportText}</p>
                <button onClick={() => goToPage('donation-page')} className="primaryContactBtn" style={{ background: '#8f6a27', color: '#fff', padding: '12px 28px', border: '1px solid #8f6a27', cursor: 'pointer' }}>
                  {lang === 'en' ? 'Proceed to Donate →' : 'ร่วมทำบุญบริจาคเงินสนับสนุนวัด →'}
                </button>
              </div>
            </section>

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
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
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
                  <li><strong>{lang === 'en' ? 'Highest Good:' : 'ดีใดไม่มีโทษ:'}</strong> {lang === 'en' ? 'That which brings no blame is supreme goodness.' : 'ดีนั้นชื่อว่าดีเลิศ'}</li>
                  <li><strong>{lang === 'en' ? 'Self-Realization:' : 'การได้ตนเอง:'}</strong> {lang === 'en' ? 'Gaining all worldly treasures is not as valuable as gaining oneself.' : 'ได้สมบัติทั้งปวงไม่ประเสริฐเท่าได้ตน'}</li>
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
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
              </button>
              <span className="eyebrow">{lang === 'en' ? 'VISIT & STAY GUIDELINES' : 'ระเบียบการและสถานที่พัก'}</span>
              <h1>{lang === 'en' ? 'Monastery Stay' : 'ระเบียบการเข้าพักและบรรยากาศการปฏิบัติธรรม'}</h1>
              <p className="guideIntro">
                {lang === 'en' 
                  ? 'A peaceful and supportive environment for practitioners. Please read our guidelines before booking your stay.' 
                  : 'วัดพุทธอุทยานนาเทิง จัดเตรียมพื้นที่อันสัปปายะ เพื่อให้ผู้ปฏิบัติธรรมได้ใช้ชีวิตอย่างสงบเย็น กรุณาอ่านระเบียบปฏิบัติและทำความเข้าใจก่อนทำการจองเข้าพัก'}
              </p>
              
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '1. Accommodation' : '1. ระเบียบการเข้าพักและข้อปฏิบัติทั่วไป'}</h3>
                <p>
                  {lang === 'en' 
                    ? 'Simple and quiet accommodations are provided. Practitioners are expected to maintain silence, observe precepts, and participate in monastery chores.' 
                    : 'ทางวัดจัดเตรียมอาคารที่พักและกุฏิสำหรับผู้ปฏิบัติธรรม ผู้เข้าพักทุกท่านต้องรักษาศีล สำรวมระวังในกายวาจาใจ และช่วยเหลืองานภายในวัดตามความเหมาะสม'}
                </p>
                <div className="guideImageFrame">
                  <img src="/images/8301.jpg" alt="Accommodation" />
                  <span className="imageCaption">{lang === 'en' ? 'Peaceful area' : 'บรรยากาศอาคารที่พักและธรรมชาติภายในวัด'}</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '2. Practice Atmosphere' : '2. บรรยากาศการปฏิบัติภาวนา'}</h3>
                <p>
                  {lang === 'en' 
                    ? 'Dedicated space for meditation, walking meditation, and listening to Dhamma teachings.' 
                    : 'พื้นที่โดยรอบมีความสงบเงียบ เหมาะแก่การเดินจงกรม นั่งสมาธิภาวนา และฟังธรรมเพื่อขัดเกลาจิตใจ'}
                </p>
                <div className="guideImageFrame">
                  <img src="/images/559063252_835057645566604_50190803944267715_n.jpg" alt="Practice" />
                  <span className="imageCaption">{lang === 'en' ? 'Meditation' : 'การเจริญสติและภาวนาในบรรยากาศร่มรื่น'}</span>
                </div>
              </div>

              <div className="guideContactBox" style={{ marginTop: '40px', background: '#f6f4ef', padding: '30px', textAlign: 'center', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {lang === 'en' ? 'Ready to join us?' : 'อ่านระเบียบการและเข้าใจเรียบร้อยแล้วใช่หรือไม่?'}
                </h3>
                <p style={{ margin: 0, color: '#625d55' }}>
                  {lang === 'en' 
                    ? 'You can check the schedule or proceed to book your stay.' 
                    : 'ท่านสามารถตรวจสอบตารางเวลาว่าง หรือกดปุ่มด้านล่างเพื่อกรอกฟอร์มจองเข้าพักได้เลยครับ'}
                </p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={() => goToPage('calendar-page')} className="secondaryContactBtn" style={{ padding: '12px 24px', fontSize: '14px', background: '#fff', border: '1px solid #9b7226', color: '#9b7226', borderRadius: '4px', cursor: 'pointer' }}>
                    {lang === 'en' ? '📅 View Schedule' : '📅 ดูตารางการจอง'}
                  </button>
                  <button onClick={() => goToPage('booking-page')} className="primaryContactBtn" style={{ padding: '12px 24px', fontSize: '14px' }}>
                    {lang === 'en' ? 'Proceed to Book Stay →' : 'กรอกฟอร์มจองเข้าปฏิบัติธรรม →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'booking-page' ? (
          <BookingPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'calendar-page' ? (
          <CalendarPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'donation-page' ? (
          <DonationPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'donation-list' ? (
          <DonationListPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'admin-dashboard' ? (
          <AdminDashboard lang={lang} goToPage={goToPage} />
        ) : currentPage === 'privacy-policy' ? (
          <PrivacyPolicyPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'terms-page' ? (
          <TermsPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'login-page' ? (
          <LoginPage lang={lang} goToPage={goToPage} user={user} handleLineLogin={() => {}} handleLogout={handleLogout} />
        ) : currentPage === 'event-kathina' ? (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
              </button>
              <span className="eyebrow">{t.kathinaEyebrow}</span>
              <h1>{t.kathinaTitle}</h1>
              <p className="guideIntro">{t.kathinaIntro}</p>

              <div className="shareSectionBox" style={{ background: '#fcfbfa', padding: '15px 20px', borderRadius: '4px', marginBottom: '25px', border: '1px solid #eeeae2', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#555' }}>{t.shareTitle}</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ background: '#1877f2', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    f {t.shareFb}
                  </a>
                  <a 
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ background: '#06c755', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    💬 {t.shareLine}
                  </a>
                  <button 
                    onClick={handleCopyLink}
                    style={{ background: '#736f66', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    📋 {t.shareCopy}
                  </button>
                </div>
                {copied && <div style={{ width: '100%', color: '#2e7d32', fontSize: '0.85rem', textAlign: 'center', marginTop: '5px' }}>{t.copiedText}</div>}
              </div>

              <div className="guideSectionBox" style={{ background: '#fcfbfa', padding: '20px 25px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #eeeae2', textAlign: 'center' }}>
                <h3 style={{ color: '#9b7226', marginBottom: '8px', fontSize: '1.2rem' }}>
                  {t.chairpersonTitle}
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#302d29', fontWeight: '500', margin: 0 }}>
                  {t.chairpersonName}
                </p>
              </div>

              <div className="guideSectionBox" style={{ background: '#f6f4ef', padding: '25px 30px', borderRadius: '4px', marginBottom: '40px', border: '1px solid #eeeae2' }}>
                <h3 style={{ borderBottom: '1px solid #dcd5c8', paddingBottom: '10px', marginTop: 0, color: '#302d29' }}>
                  {t.scheduleTitle}
                </h3>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#9b7226', fontSize: '1.1rem', marginBottom: '10px' }}>
                    {t.day1Title}
                  </h4>
                  <ul style={{ marginBottom: '25px', lineHeight: '1.8' }}>
                    {t.day1List.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <h4 style={{ color: '#9b7226', fontSize: '1.1rem', marginBottom: '10px' }}>
                    {t.day2Title}
                  </h4>
                  <ul style={{ lineHeight: '1.8' }}>
                    {t.day2List.map((item, idx) => (
                      <li key={idx} style={item.startsWith('•') ? { listStyleType: 'none', marginLeft: '15px' } : {}}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>1. {t.imgCaption1}</h3>
                <div className="guideImageFrame">
                  <img src="/images/561914583_836239988781703_4146873103108656226_n.jpg" alt="ขบวนแห่กฐิน" />
                  <span className="imageCaption">{t.imgCaption1}</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>2. {t.imgCaption2}</h3>
                <div className="guideImageFrame">
                  <img src="/images/487913616_689541166784920_1785354843670392147_n.jpg" alt="โรงทาน" />
                  <span className="imageCaption">{t.imgCaption2}</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>3. {t.imgCaption3}</h3>
                <div className="guideImageFrame">
                  <img src="/images/560188892_836240912114944_3910816619043716260_n.jpg" alt="ตักบาตร" />
                  <span className="imageCaption">{t.imgCaption3}</span>
                </div>
              </div>

              <div className="guideContentBlock">
                <h3>4. {t.imgCaption4}</h3>
                <div className="guideImageFrame">
                  <img src="/images/561340868_836253482113687_5055104485744791787_n.jpg" alt="ถวายผ้ากฐิน" />
                  <span className="imageCaption">{t.imgCaption4}</span>
                </div>
              </div>

              <div className="guideContactBox">
                <h3>{t.contactSectionTitle}</h3>
                <p>{t.contactSectionText}</p>
                <button onClick={() => goToPage('contact-page')} className="primaryContactBtn">
                  {t.contactBtn}
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                {t.backHome}
              </button>
              <span className="eyebrow">{t.contactPageEyebrow}</span>
              <h1>{t.contactPageTitle}</h1>
              <p className="guideIntro">{t.contactPageAddress}</p>
              
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
                    {t.mapOpenBtn}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ background: '#1c1a17', color: '#fff', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid #332f2a' }}>
        <div className="footer-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="dharma" style={{ fontSize: '24px', marginBottom: '10px', color: '#c5a880' }}>☸</div>
          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '5px' }}>
            {lang === 'en' ? 'Buddhist Park Monastery' : 'วัดพุทธอุทยานนาเทิง'}
          </strong>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>{t.footerSubtitle}</p>
          
          <div className="footer-bottom-info" style={{ color: '#888', fontSize: '12px', lineHeight: '2', marginTop: '15px' }}>
            <div>Buddhist Park Monastery of Nathoeng</div>
            <div>Copyright © 2026 All Rights Reserved</div>
            <div>Powered by Nathoeng Community Tech Team</div>
            
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
              <button 
                onClick={() => goToPage('privacy-policy')}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                onMouseOver={(e) => e.target.style.color = '#c5a880'}
                onMouseOut={(e) => e.target.style.color = '#888'}
              >
                {t.privacyLink}
              </button>
              <span>·</span>
              <button 
                onClick={() => goToPage('terms-page')}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                onMouseOver={(e) => e.target.style.color = '#c5a880'}
                onMouseOut={(e) => e.target.style.color = '#888'}
              >
                {t.termsLink}
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App