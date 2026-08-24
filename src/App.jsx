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
  const [lang, setLang] = useState('en')
  const [currentPage, setCurrentPage] = useState('home') // 'home' หรือ 'visit-guide'
  const t = content[lang]

  // ฟังก์ชันสำหรับเปลี่ยนหน้าและเลื่อนขึ้นด้านบนสุด
  const goToPage = (page) => {
    setCurrentPage(page)
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

        <nav>
          {t.nav.map((item) => (
            <a 
              href={item.href} 
              key={item.href}
              onClick={(e) => {
                if (currentPage !== 'home') {
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
                  alt={
                    lang === 'en'
                      ? 'Buddhist Park Monastery of Nathoeng'
                      : 'วัดพุทธอุทยานนาเทิง'
                  }
                />
              </div>

              <div className="aboutContent">

                <p className="eyebrow">
                  {lang === 'en' ? 'ABOUT THE MONASTERY' : 'เกี่ยวกับวัด'}
                </p>

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

                <a href="#teachings" className="textLink">
                  {lang === 'en' ? 'Discover monastery life →' : 'สัมผัสวิถีชีวิตภายในวัด →'}
                </a>

              </div>

            </section>


            {/* MAIN FEATURES */}
            <section className="featureSection">

              <div className="sectionHeading">
                <p className="eyebrow">
                  {lang === 'en' ? 'EXPLORE' : 'เรียนรู้และเยี่ยมชม'}
                </p>

                <h2>
                  {lang === 'en' ? 'Life at the Monastery' : 'วิถีแห่งวัดพุทธอุทยานนาเทิง'}
                </h2>
              </div>


              <div className="cards">

                {/* DHAMMA */}
                <article id="teachings" className="imageCard">

                  <div className="cardImage">
                    <img
                      src="/images/486526184_680593961012974_4699356998246297917_n.jpg"
                      alt={lang === 'en' ? 'Dhamma gathering' : 'กิจกรรมธรรมะภายในวัด'}
                    />
                  </div>

                  <div className="cardContent">
                    <span className="cardIcon">☸</span>
                    <h3>{t.teachings}</h3>
                    <p>{t.teachingsText}</p>
                    <a href="#retreats">{t.learn} →</a>
                  </div>

                </article>


                {/* EVENTS */}
                <article id="events" className="imageCard">

                  <div className="cardImage">
                    <img
                      src="/images/487812128_689539323451771_1128859791552978185_n.jpg"
                      alt={lang === 'en' ? 'Monastery ceremony' : 'งานบุญและกิจกรรมภายในวัด'}
                    />
                  </div>

                  <div className="cardContent">
                    <span className="cardIcon">◷</span>
                    <h3>{t.events}</h3>
                    <p>{t.eventsText}</p>
                    <a href="#events">{t.learn} →</a>
                  </div>

                </article>


                {/* VISIT (คลิกแล้วเปลี่ยนหน้าไปที่ระเบียบปฏิบัติ) */}
                <article id="visit" className="imageCard">

                  <div className="cardImage">
                    <img
                      src="/images/99425106_2619520384959784_4372406926441447424_n.jpg"
                      alt={lang === 'en' ? 'Forest dwelling' : 'กุฏิภายในป่าของวัด'}
                    />
                  </div>

                  <div className="cardContent">
                    <span className="cardIcon">⌂</span>
                    <h3>{t.visit}</h3>
                    <p>{t.visitText}</p>
                    <button 
                      onClick={() => goToPage('visit-guide')}
                      className="inlineButtonLink"
                    >
                      {t.learn} →
                    </button>
                  </div>

                </article>

              </div>

            </section>


            {/* RETREATS */}
            <section id="retreats" className="quietSection">

              <div className="quietImage">
                <img
                  src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg"
                  alt={lang === 'en' ? 'Forest path' : 'ทางเดินภายในป่าของวัด'}
                />
              </div>

              <div className="quietContent">

                <p className="eyebrow">
                  {lang === 'en' ? 'PRACTICE' : 'การปฏิบัติ'}
                </p>

                <h2>{t.retreats}</h2>

                <p>{t.retreatsText}</p>

                <button 
                  onClick={() => goToPage('visit-guide')} 
                  className="textLinkButton"
                >
                  {lang === 'en' ? 'Plan your visit →' : 'ข้อมูลการมาปฏิบัติธรรม →'}
                </button>

              </div>

            </section>


            {/* SUPPORT */}
            <section id="support" className="support">

              <div>

                <p className="eyebrow">
                  {lang === 'en' ? 'GENEROSITY' : 'การให้'}
                </p>

                <h2>{t.support}</h2>

                <p>{t.supportText}</p>

                <button>{t.learn}</button>

              </div>

            </section>


            {/* CONTACT */}
            <section id="contact" className="contactSection">

              <p className="eyebrow">
                {lang === 'en' ? 'CONTACT' : 'ติดต่อ'}
              </p>

              <h2>{t.contact}</h2>

              <p>{t.contactText}</p>

              <div className="lotus">❦</div>

            </section>
          </>
        ) : (
          /* ================= PAGE: VISIT & STAY GUIDE ================= */
          <div className="guidePage">
            <div className="guideContainer">
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>

              <span className="eyebrow">
                {lang === 'en' ? 'VISIT & STAY GUIDELINES' : 'ระเบียบการและข้อมูลการปฏิบัติธรรม'}
              </span>

              <h1>
                {lang === 'en' ? 'Monastery Stay & Meditation Practice' : 'ระเบียบการเข้าพักและปฏิบัติธรรม'}
              </h1>

              <p className="guideIntro">
                {lang === 'en'
                  ? 'Welcome to Buddhist Park Monastery of Nathoeng. To ensure a peaceful and conducive environment for spiritual practice, we have established guidelines for visitors and retreatants.'
                  : 'วัดพุทธอุทยานนาเทิง ยินดีต้อนรับผู้มีจิตศรัทธาทุกท่านที่ประสงค์จะมาปฏิบัติธรรมและพักอาศัย เพื่อความสงบเรียบร้อยและเอื้อต่อการเจริญสติภาวนา ทางวัดจึงขอแจ้งระเบียบและแนวทางปฏิบัติดังนี้'}
              </p>

              <div className="guideSectionBox">
                <h3>{lang === 'en' ? '1. General Qualifications' : '1. คุณสมบัติของผู้ปฏิบัติธรรม'}</h3>
                <ul>
                  <li>{lang === 'en' ? 'Must be in good physical and mental health.' : 'มีสุขภาพร่างกายและจิตใจสมบูรณ์แข็งแรง ไม่เป็นโรคติดต่อร้ายแรง'}</li>
                  <li>{lang === 'en' ? 'Able to strictly follow the monastery rules and schedule.' : 'สามารถรักษาศีล 5 หรือศีล 8 และปฏิบัติตามระเบียบวินัยของวัดได้อย่างเคร่งครัด'}</li>
                  <li>{lang === 'en' ? 'Respectful to monks, novices, and fellow practitioners.' : 'มีความเคารพและสำรวมในพระรัตนตรัย พระภิกษุสงฆ์ และเพื่อนร่วมปฏิบัติธรรม'}</li>
                </ul>
              </div>

              <div className="guideSectionBox">
                <h3>{lang === 'en' ? '2. What to Bring' : '2. สิ่งที่ต้องเตรียมมา'}</h3>
                <ul>
                  <li>{lang === 'en' ? 'White clothing for meditation practice.' : 'ชุดปฏิบัติธรรมสีขาวสุภาพเรียบร้อย'}</li>
                  <li>{lang === 'en' ? 'Personal ID card for registration.' : 'บัตรประจำตัวประชาชน (สำหรับลงทะเบียนเข้าพัก)'}</li>
                  <li>{lang === 'en' ? 'Personal toiletries and necessary medications.' : 'ของใช้ส่วนตัวที่จำเป็น เช่น สบู่ แปรงสีฟัน ยาสระผม และยาประจำตัว'}</li>
                  <li>{lang === 'en' ? 'A personal blanket (as mountain nights can be cool).' : 'ผ้าห่มส่วนตัว (เนื่องจากอากาศในยามค่ำคืนค่อนข้างเย็น)'}</li>
                </ul>
              </div>

              <div className="guideSectionBox">
                <h3>{lang === 'en' ? '3. Rules & Conduct' : '3. ข้อควรปฏิบัติภายในวัด'}</h3>
                <ul>
                  <li>{lang === 'en' ? 'Observe noble silence and speak only when necessary.' : 'ลดการพูดคุย งดการใช้โทรศัพท์มือถือ เพื่อความสงบในการภาวนา'}</li>
                  <li>{lang === 'en' ? 'Strictly refrain from bringing valuables, gold, or expensive items.' : 'งดเว้นการนำเครื่องประดับ ของมีค่า หรือเงินจำนวนมากติดตัวมา'}</li>
                  <li>{lang === 'en' ? 'Participate in monastery group chanting and meditation schedule.' : 'ร่วมทำวัตรสวดมนต์และกิจกรรมภาวนาตามตารางเวลาของวัด'}</li>
                </ul>
              </div>

              <div className="guideContactBox">
                <h3>{lang === 'en' ? 'For Inquiry and Advance Booking' : 'ติดต่อสอบถามและจองเวลาเข้าปฏิบัติธรรม'}</h3>
                <p>
                  {lang === 'en'
                    ? 'Please contact the monastery office in advance before your visit to ensure accommodation availability.'
                    : 'กรุณาติดต่อประสานงานล่วงหน้าก่อนเดินทางมา เพื่อความสะดวกในการจัดเตรียมสถานที่และที่พัก'}
                </p>
                <button onClick={() => { goToPage('home'); setTimeout(() => { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) }, 100) }} className="primaryContactBtn">
                  {lang === 'en' ? 'Contact Us →' : 'ติดต่อทางวัด →'}
                </button>
              </div>

            </div>
          </div>
        )}
      </main>


      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="dharma">☸</div>
          <strong>
            {lang === 'en'
              ? 'Buddhist Park Monastery of Nathoeng'
              : 'วัดพุทธอุทยานนาเทิง'}
          </strong>
          <p>{t.footerSubtitle}</p>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom-info">
            <div>Buddhist Park Monastery of Nathoeng</div>
            <div>Copyright © 2026</div>
            <div>Powered by Nathoeng Community of Tech Team</div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App