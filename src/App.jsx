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
    teachingsText: 'Teachings for cultivating wisdom, mindfulness and inner peace.',
    events: 'Upcoming Events',
    eventsText: 'Join monastery ceremonies, meditation retreats and community Dhamma activities.',
    visit: 'Visit & Stay',
    visitText: 'Visitors are welcome to experience monastery life, meditation and the peaceful natural surroundings.',
    retreats: 'Retreats & Practice',
    retreatsText: 'Spend time in quiet practice, meditation and contemplation in the peaceful natural surroundings of the monastery.',
    learn: 'Learn more',
    support: 'Support the Monastery',
    supportText: 'Your generosity helps sustain the monastery, Dhamma activities and service to the community.',
    contact: 'Contact the Monastery',
    contactText: 'For visits, monastery information and general enquiries, please contact us.',
    footerSubtitle: 'Buddhist Park Monastery of Nathoeng · Sakon Nakhon, Thailand',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms & Conditions',
    kathinaEyebrow: 'Major Merit-Making Event · November 7 - 8, 2026',
    kathinaTitle: 'Annual Kathina Robe Offering Ceremony 2026',
    kathinaIntro: 'Buddhist Park Monastery of Nathoeng, Sakon Nakhon warmly invites all devotees and friends to join the annual Kathina Robe Offering Ceremony for the year 2026.',
    chairpersonTitle: '🙏 Kathina Chairperson 2026',
    chairpersonName: 'Mr. Pichai - Mrs. Supharat Sakunkunsawat and Family & Relatives (Chonburi)',
    scheduleTitle: '📋 Kathina Ceremony Schedule (November 7 - 8, 2026)',
    day1Title: 'Day 1: Saturday, November 7, 2026',
    day1List: ['08.30 AM: Devotees gather', '03.30 PM: Chanting ceremony'],
    day2Title: 'Day 2: Sunday, November 8, 2026',
    day2List: ['07.00 AM: Alms round', '09.30 AM: Kathina Ceremony'],
    imgCaption1: 'A warm and joyous Kathina procession.',
    imgCaption2: 'The charitable food stalls (Rong Than).',
    imgCaption3: 'Morning alms-giving.',
    imgCaption4: 'Kathina Robe Offering Ceremony.',
    contactSectionTitle: 'For More Information',
    contactSectionText: 'You are welcome to join us in person.',
    contactBtn: 'View Map & Contact Details →',
    backHome: '← Back to Home',
    shareTitle: 'Share this news:',
    shareFb: 'Share on Facebook',
    shareLine: 'Share on LINE',
    shareCopy: 'Copy Link',
    copiedText: 'Copied link to clipboard!',
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
    teachingsText: 'ธรรมะเพื่อการเจริญปัญญา สติ และความสงบภายใน',
    events: 'ข่าวและกิจกรรม',
    eventsText: 'ร่วมงานบุญ การปฏิบัติธรรม และกิจกรรมธรรมะของวัด',
    visit: 'เยี่ยมชมและพักที่วัด',
    visitText: 'เปิดต้อนรับผู้สนใจสัมผัสวิถีชีวิตในวัด การภาวนา และธรรมชาติอันสงบ',
    retreats: 'ปฏิบัติธรรมและภาวนา',
    retreatsText: 'ใช้เวลาอย่างสงบเพื่อการเจริญสติ สมาธิ และการภาวนา ท่ามกลางธรรมชาติอันสงบของวัด',
    learn: 'ดูเพิ่มเติม',
    support: 'ร่วมสนับสนุนวัด',
    supportText: 'การให้ของท่านช่วยเกื้อกูลวัด กิจกรรมเผยแผ่ธรรมะ และงานเพื่อชุมชน',
    contact: 'ติดต่อวัด',
    contactText: 'สำหรับการเยี่ยมชม ข้อมูลเกี่ยวกับวัด หรือสอบถามรายละเอียด สามารถติดต่อทางวัดได้',
    footerSubtitle: 'วัดพุทธอุทยานนาเทิง · จังหวัดสกลนคร ประเทศไทย',
    privacyLink: 'นโยบายความเป็นส่วนตัว',
    termsLink: 'เงื่อนไขการใช้งาน',
    kathinaEyebrow: 'ข่าวประชาสัมพันธ์งานบุญใหญ่ · 7 - 8 พฤศจิกายน 2569',
    kathinaTitle: 'ขอเชิญร่วมงานบุญกฐินสามัคคี ประจำปี 2569',
    kathinaIntro: 'วัดพุทธอุทยานนาเทิง จังหวัดสกลนคร ขออำนวยพรและบอกบุญมายังพุทธศาสนิกชน',
    chairpersonTitle: '🙏 ประธานกฐินสามัคคี ประจำปี 2569',
    chairpersonName: 'คุณพิชัย - คุณศุภรัตน์ สกุลคุณสวัสดิ์ พร้อมด้วยครอบครัวและญาติพี่น้อง (จ.ชลบุรี)',
    scheduleTitle: '📋 กำหนดการงานบุญกฐินสามัคคี (7 - 8 พฤศจิกายน 2569)',
    day1Title: 'วันแรก: วันเสาร์ที่ 7 พฤศจิกายน 2569',
    day1List: ['เวลา 08.30 น.: ตั้งกองกฐิน', 'เวลา 15.30 น.: เจริญพระพุทธมนต์'],
    day2Title: 'วันที่สอง: วันอาทิตย์ที่ 8 พฤศจิกายน 2569',
    day2List: ['เวลา 07.00 น.: ตักบาตรยามเช้า', 'เวลา 09.30 น.: พิธีทอดกฐินสามัคคี'],
    imgCaption1: 'ขบวนแห่กฐินสามัคคีอันอบอุ่น',
    imgCaption2: 'บรรยากาศโรงทานการกุศล',
    imgCaption3: 'ทำบุญตักบาตรยามเช้า',
    imgCaption4: 'พิธีถวายผ้ากฐินอันศักดิ์สิทธิ์',
    contactSectionTitle: 'ติดต่อสอบถามข้อมูลการมาร่วมงาน',
    contactSectionText: 'ท่านสามารถมาร่วมงานบุญด้วยตนเอง หรือติดต่อสอบถามรายละเอียดเพิ่มเติมได้',
    contactBtn: 'ดูแผนที่และช่องทางการติดต่อ →',
    backHome: '← กลับสู่หน้าหลัก',
    shareTitle: 'แชร์บอกบุญข่าวนี้:',
    shareFb: 'แชร์ไป Facebook',
    shareLine: 'แชร์ไป LINE',
    shareCopy: 'คัดลอกลิงก์',
    copiedText: 'คัดลอกลิงก์เรียบร้อยแล้ว!',
    contactPageEyebrow: 'แผนที่และการเดินทาง',
    contactPageTitle: 'วัดพุทธอุทยานนาเทิง',
    contactPageAddress: '231 หมู่ 2 ตำบลธาตุ อำเภอวานรนิวาส จังหวัดสกลนคร 47120 ประเทศไทย',
    mapOpenBtn: 'เปิดใน Google Maps เพื่อนำทาง →'
  }
}

// 🛡️ กำหนดรายชื่อ LINE UID ของผู้ดูแลระบบที่ได้รับอนุญาตเท่านั้น (ใส่ UID จริงของพระอาจารย์ที่นี่)
const ADMIN_LINE_UIDS = ['Ucce7f0e73af42c1c1443c328d6e59cba'];

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

  // 🟢 ตรวจสอบสถานะและรับข้อมูลจริงจาก LINE Login Callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      // ในระบบจริง เมื่อ LINE ส่ง code กลับมา จะต้องส่งต่อไปแลก Token / Profile ที่ Backend
      // แต่เบื้องต้นหากทดสอบระบบจริง ให้กำหนดจำลองการดึง UID จากบัญชีที่สแกนจริง
      // (หากยังไม่ได้ตั้งค่า Backend ให้ปรับเปลี่ยนตามระบบจริงของ LINE API)
      const lineUser = {
        name: 'ผู้ใช้งาน LINE (สมาชิกทั่วไป)',
        lineUid: 'U_normal_user_from_line_login', // ตัวอย่าง: หากไม่ใช่แอดมิน จะได้ UID ทั่วไป
        picture: ''
      }

      // หาก LINE UID ที่ล็อกอินเข้ามา ตรงกับรายชื่อแอดมิน ให้ปรับสิทธิ์เป็นผู้ดูแลระบบทันที
      if (ADMIN_LINE_UIDS.includes(lineUser.lineUid)) {
        lineUser.name = 'ผู้ดูแลระบบ';
      }

      setUser(lineUser)
      localStorage.setItem('line_user', JSON.stringify(lineUser))
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
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            <span>/</span>
            <button className={lang === 'th' ? 'active' : ''} onClick={() => setLang('th')}>TH</button>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: '500', color: '#06c755' }}>
                🟢 {ADMIN_LINE_UIDS.includes(user.lineUid) ? 'ผู้ดูแลระบบ' : user.name}
              </span>
              <button 
                onClick={handleLogout}
                style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
              >
                {lang === 'en' ? 'Logout' : 'ออก'}
              </button>
            </div>
          )}
        </div>

        <button className="menuToggleBtn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
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
                <img src="/images/watermarked_img_18048839418065383299.jpg" alt="วัดพุทธอุทยานนาเทิง" />
              </div>
              <div className="aboutContent">
                <p className="eyebrow">{lang === 'en' ? 'ABOUT THE MONASTERY' : 'เกี่ยวกับวัด'}</p>
                <h2>{lang === 'en' ? 'A Forest Monastery in Northeast Thailand' : 'วัดป่าท่ามกลางธรรมชาติแห่งภาคอีสาน'}</h2>
                <p>{lang === 'en' ? "Buddhist Park Monastery of Nathoeng is a place for the practice..." : 'วัดพุทธอุทยานนาเทิง เป็นสถานที่สำหรับการศึกษาและปฏิบัติตามพระธรรมคำสอน'}</p>
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
                  <div className="cardImage"><img src="/images/486526184_680593961012974_4699356998246297917_n.jpg" alt="Dhamma" /></div>
                  <div className="cardContent">
                    <span className="cardIcon">☸</span>
                    <h3>{t.teachings}</h3>
                    <p>{t.teachingsText}</p>
                    <button onClick={() => goToPage('teachings-page')} className="inlineButtonLink">{t.learn} →</button>
                  </div>
                </article>
                <article id="events" className="imageCard">
                  <div className="cardImage"><img src="/images/487812128_689539323451771_1128859791552978185_n.jpg" alt="Events" /></div>
                  <div className="cardContent">
                    <span className="cardIcon">◷</span>
                    <h3>{t.events}</h3>
                    <p>{t.eventsText}</p>
                    <button onClick={() => goToPage('event-kathina')} className="inlineButtonLink">{t.learn} →</button>
                  </div>
                </article>
                <article id="visit" className="imageCard">
                  <div className="cardImage"><img src="/images/99425106_2619520384959784_4372406926441447424_n.jpg" alt="Visit" /></div>
                  <div className="cardContent">
                    <span className="cardIcon">⌂</span>
                    <h3>{t.visit}</h3>
                    <p>{t.visitText}</p>
                    <button onClick={() => goToPage('visit-guide')} className="inlineButtonLink">{t.learn} →</button>
                  </div>
                </article>
              </div>
            </section>

            <section id="retreats" className="quietSection">
              <div className="quietImage"><img src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg" alt="Retreats" /></div>
              <div className="quietContent">
                <p className="eyebrow">{lang === 'en' ? 'PRACTICE' : 'การปฏิบัติ'}</p>
                <h2>{t.retreats}</h2>
                <p>{t.retreatsText}</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <button onClick={() => goToPage('visit-guide')} className="textLinkButton">อ่านระเบียบการและจองเข้าพัก →</button>
                </div>
              </div>
            </section>

            <section id="support" className="support">
              <div>
                <p className="eyebrow">การให้</p>
                <h2>{t.support}</h2>
                <p>{t.supportText}</p>
                <button onClick={() => goToPage('donation-page')} className="primaryContactBtn" style={{ background: '#8f6a27', color: '#fff', padding: '12px 28px', border: '1px solid #8f6a27', cursor: 'pointer' }}>
                  ร่วมทำบุญบริจาคเงินสนับสนุนวัด →
                </button>
              </div>
            </section>

            <section id="contact" className="contactSection">
              <p className="eyebrow">ติดต่อ</p>
              <h2>{t.contact}</h2>
              <p>{t.contactText}</p>
              <div style={{ marginTop: '25px' }}>
                <button onClick={() => goToPage('contact-page')} className="primaryContactBtn">ดูแผนที่และช่องทางการติดต่อ →</button>
              </div>
              <div className="lotus">❦</div>
            </section>
          </>
        ) : currentPage === 'teachings-page' ? (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>{content[lang].backHome}</button>
              <h1>คำสอนหลวงปู่มั่น</h1>
              <p className="guideIntro">รวบรวมคติธรรมและโอวาทธรรมคำสอนอันทรงคุณค่า</p>
            </div>
          </div>
        ) : currentPage === 'visit-guide' ? (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>{content[lang].backHome}</button>
              <h1>ระเบียบการเข้าพัก</h1>
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
          // 🛡️ ตรวจสอบความปลอดภัยระดับสูงสุด: ต้องมี LINE UID ตรงกับรายชื่อแอดมินเท่านั้นถึงจะเปิดหน้าแดชบอร์ดได้
          user && ADMIN_LINE_UIDS.includes(user.lineUid) ? (
            <AdminDashboard lang={lang} goToPage={goToPage} />
          ) : (
            <div className="guidePage">
              <div className="guideContainer" style={{ maxWidth: '600px', textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
                <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>ขออภัย! พื้นที่นี้สำหรับผู้ดูแลระบบเท่านั้น</h2>
                <p style={{ color: '#625d55', marginBottom: '25px' }}>เฉพาะ LINE ID ของผู้ดูแลระบบที่ลงทะเบียนไว้เท่านั้นจึงจะเข้าได้</p>
                <button onClick={() => goToPage('login-page')} className="primaryContactBtn" style={{ background: '#06c755' }}>
                  ไปที่หน้าเข้าสู่ระบบ
                </button>
              </div>
            </div>
          )
        ) : currentPage === 'privacy-policy' ? (
          <PrivacyPolicyPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'terms-page' ? (
          <TermsPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'login-page' ? (
          <LoginPage lang={lang} goToPage={goToPage} user={user} handleLogout={handleLogout} />
        ) : currentPage === 'event-kathina' ? (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>{content[lang].backHome}</button>
              <h1>{t.kathinaTitle}</h1>
              <p className="guideIntro">{t.kathinaIntro}</p>
            </div>
          </div>
        ) : (
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>{t.backHome}</button>
              <h1>{t.contactPageTitle}</h1>
              <p className="guideIntro">{t.contactPageAddress}</p>
            </div>
          </div>
        )}
      </main>

      <footer style={{ background: '#1c1a17', color: '#fff', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="dharma" style={{ fontSize: '24px', marginBottom: '10px', color: '#c5a880' }}>☸</div>
          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '5px' }}>วัดพุทธอุทยานนาเทิง</strong>
          <p style={{ color: '#aaa', fontSize: '14px' }}>{t.footerSubtitle}</p>
        </div>
      </footer>
    </div>
  )
}

export default App