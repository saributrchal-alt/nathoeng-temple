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
  const [currentPage, setCurrentPage] = useState('home')
  const t = content[lang]

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
                  alt={lang === 'en' ? 'Buddhist Park Monastery' : 'วัดพุทธอุทยานนาเทิง'}
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


                {/* VISIT */}
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
          /* ================= PAGE: VISIT & STAY GUIDE WITH IMAGES ================= */
          <div className="guidePage">
            <div className="guideContainer">
              
              <button className="backButton" onClick={() => goToPage('home')}>
                ← {lang === 'en' ? 'Back to Home' : 'กลับสู่หน้าหลัก'}
              </button>

              <span className="eyebrow">
                {lang === 'en' ? 'VISIT & STAY GUIDELINES' : 'ระเบียบการและสถานที่พักปฏิบัติธรรม'}
              </span>

              <h1>
                {lang === 'en' ? 'Monastery Stay & Practice Atmosphere' : 'สถานที่พักและบรรยากาศการปฏิบัติธรรม'}
              </h1>

              <p className="guideIntro">
                {lang === 'en'
                  ? 'At Buddhist Park Monastery of Nathoeng, we provide a peaceful and supportive environment for practitioners to cultivate mindfulness, quiet the mind, and immerse themselves in the Dhamma.'
                  : 'วัดพุทธอุทยานนาเทิง จัดเตรียมพื้นที่และสภาพแวดล้อมอันสัปปายะ เพื่อให้ผู้ปฏิบัติธรรมได้ใช้ชีวิตอย่างเรียบง่าย สงบเย็น และเอื้อต่อการเจริญสติภาวนาอย่างแท้จริง'}
              </p>

              {/* SECTION 1: ACCOMMODATION WITH IMAGE */}
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '1. Accommodation & Facilities' : '1. สถานที่พักสำหรับผู้ปฏิบัติธรรม'}</h3>
                <p>
                  {lang === 'en'
                    ? 'Our monastery offers clean, orderly, and peaceful accommodation nestled in natural surroundings, designed to support simple living and dedicated meditation.'
                    : 'ทางวัดมีอาคารที่พักและกุฏิสำหรับผู้ปฏิบัติธรรม ที่มีความสะอาด เป็นระเบียบเรียบร้อย ตั้งอยู่ท่ามกลางธรรมชาติอันร่มรื่น เงียบสงบ เหมาะแก่การพักผ่อนและปฏิบัติธรรมประจำวัน'}
                </p>
                <div className="guideImageFrame">
                  <img src="/images/8301.jpg" alt="สถานที่พักผู้ปฏิบัติธรรม วัดพุทธอุทยานนาเทิง" />
                  <span className="imageCaption">
                    {lang === 'en' ? 'Peaceful accommodation area at the monastery' : 'บรรยากาศอาคารที่พักและพื้นที่รอบบริเวณวัด'}
                  </span>
                </div>
              </div>

              {/* SECTION 2: PRACTICE ATMOSPHERE WITH IMAGE */}
              <div className="guideContentBlock">
                <h3>{lang === 'en' ? '2. Atmosphere of Practice & Meditation' : '2. บรรยากาศการปฏิบัติธรรมและการเจริญสติ'}</h3>
                <p>
                  {lang === 'en'
                    ? 'Practitioners gather in a serene environment to engage in group meditation, chanting, and listening to Dhamma teachings, fostering mutual support and inner peace.'
                    : 'ผู้ปฏิบัติธรรมจะได้ร่วมกิจกรรมทำวัตรสวดมนต์ นั่งสมาธิ เจริญสติ และฟังพระธรรมคำสอนร่วมกันในบรรยากาศที่อบอุ่น เรียบง่าย และเต็มไปด้วยความสงบเยือกเย็นของกัลยาณมิตร'}
                </p>
                <div className="guideImageFrame">
                  <img src="/images/559063252_835057645566604_50190803944267715_n.jpg" alt="บรรยากาศการปฏิบัติธรรม วัดพุทธอุทยานนาเทิง" />
                  <span className="imageCaption">
                    {lang === 'en' ? 'Practitioners in white attire engaged in meditation and Dhamma practice' : 'บรรยากาศผู้ปฏิบัติธรรมชุดขาวร่วมเจริญสติและปฏิบัติภาวนาภายในวัด'}
                  </span>
                </div>
              </div>

              {/* SECTION 3: RULES */}
              <div className="guideSectionBox">
                <h3>{lang === 'en' ? '3. Rules & Guidelines for Stay' : '3. ระเบียบปฏิบัติและข้อควรปฏิบัติเบื้องต้น'}</h3>
                <ul>
                  <li>{lang === 'en' ? 'Observe the Five or Eight Precepts strictly during your stay.' : 'รักษาศีล 5 หรือศีล 8 อย่างเคร่งครัดตลอดระยะเวลาที่เข้าพัก'}</li>
                  <li>{lang === 'en' ? 'Maintain noble silence and minimize mobile phone usage to protect the meditative atmosphere.' : 'งดการพูดคุยเพ้อเจ้อ และจำกัดการใช้โทรศัพท์มือถือ เพื่อรักษาความสงบสงัด'}</li>
                  <li>{lang === 'en' ? 'Participate in daily routines, chanting, and meditation schedules.' : 'ร่วมทำกิจกรรมทำวัตรสวดมนต์และปฏิบัติภาวนาตามตารางของทางวัด'}</li>
                </ul>
              </div>

              <div className="guideContactBox">
                <h3>{lang === 'en' ? 'Interested in Joining? Contact Us' : 'สนใจเข้าร่วมปฏิบัติธรรม / สอบถามข้อมูลเพิ่มเติม'}</h3>
                <p>
                  {lang === 'en'
                    ? 'Please reach out to the monastery in advance to plan your visit and check accommodation availability.'
                    : 'ผู้ที่สนใจสามารถติดต่อสอบถามรายละเอียด หรือจองเวลาเข้าปฏิบัติธรรมล่วงหน้าได้ทางช่องทางติดต่อของวัด'}
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