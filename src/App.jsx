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

    footer:
      'Buddhist Park Monastery of Nathoeng · Sakon Nakhon, Thailand'
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

    footer:
      'วัดพุทธอุทยานนาเทิง · จังหวัดสกลนคร ประเทศไทย'
  }
}

function App() {
  const [lang, setLang] = useState('en')
  const t = content[lang]

  return (
    <div className="site">

      {/* HEADER */}
      <header>

        <div className="brand">
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
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

      </header>


      <main>

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
              {lang === 'en'
                ? 'ABOUT THE MONASTERY'
                : 'เกี่ยวกับวัด'}
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
              {lang === 'en'
                ? 'Discover monastery life →'
                : 'สัมผัสวิถีชีวิตภายในวัด →'}
            </a>

          </div>

        </section>


        {/* MAIN FEATURES */}
        <section className="featureSection">

          <div className="sectionHeading">
            <p className="eyebrow">
              {lang === 'en'
                ? 'EXPLORE'
                : 'เรียนรู้และเยี่ยมชม'}
            </p>

            <h2>
              {lang === 'en'
                ? 'Life at the Monastery'
                : 'วิถีแห่งวัดพุทธอุทยานนาเทิง'}
            </h2>
          </div>


          <div className="cards">

            {/* DHAMMA */}
            <article id="teachings" className="imageCard">

              <div className="cardImage">
                <img
                  src="/images/486526184_680593961012974_4699356998246297917_n.jpg"
                  alt={
                    lang === 'en'
                      ? 'Dhamma gathering at the monastery'
                      : 'กิจกรรมธรรมะภายในวัด'
                  }
                />
              </div>

              <div className="cardContent">
                <span className="cardIcon">☸</span>

                <h3>{t.teachings}</h3>

                <p>{t.teachingsText}</p>

                <a href="#retreats">
                  {t.learn} →
                </a>
              </div>

            </article>


            {/* EVENTS */}
            <article id="events" className="imageCard">

              <div className="cardImage">
                <img
                  src="/images/487812128_689539323451771_1128859791552978185_n.jpg"
                  alt={
                    lang === 'en'
                      ? 'Monastery ceremony'
                      : 'งานบุญและกิจกรรมภายในวัด'
                  }
                />
              </div>

              <div className="cardContent">
                <span className="cardIcon">◷</span>

                <h3>{t.events}</h3>

                <p>{t.eventsText}</p>

                <a href="#events">
                  {t.learn} →
                </a>
              </div>

            </article>


            {/* VISIT */}
            <article id="visit" className="imageCard">

              <div className="cardImage">
                <img
                  src="/images/99425106_2619520384959784_4372406926441447424_n.jpg"
                  alt={
                    lang === 'en'
                      ? 'Forest dwelling at the monastery'
                      : 'กุฏิภายในป่าของวัด'
                  }
                />
              </div>

              <div className="cardContent">
                <span className="cardIcon">⌂</span>

                <h3>{t.visit}</h3>

                <p>{t.visitText}</p>

                <a href="#contact">
                  {t.learn} →
                </a>
              </div>

            </article>

          </div>

        </section>


        {/* RETREATS */}
        <section id="retreats" className="quietSection">

          <div className="quietImage">
            <img
              src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg"
              alt={
                lang === 'en'
                  ? 'Forest path at the monastery'
                  : 'ทางเดินภายในป่าของวัด'
              }
            />
          </div>

          <div className="quietContent">

            <p className="eyebrow">
              {lang === 'en'
                ? 'PRACTICE'
                : 'การปฏิบัติ'}
            </p>

            <h2>{t.retreats}</h2>

            <p>{t.retreatsText}</p>

            <a className="textLink" href="#contact">
              {lang === 'en'
                ? 'Plan your visit →'
                : 'ข้อมูลการมาปฏิบัติธรรม →'}
            </a>

          </div>

        </section>


        {/* SUPPORT */}
        <section id="support" className="support">

          <div>

            <p className="eyebrow">
              {lang === 'en'
                ? 'GENEROSITY'
                : 'การให้'}
            </p>

            <h2>{t.support}</h2>

            <p>{t.supportText}</p>

            <button>
              {t.learn}
            </button>

          </div>

        </section>


        {/* CONTACT */}
        <section id="contact" className="contactSection">

          <p className="eyebrow">
            {lang === 'en'
              ? 'CONTACT'
              : 'ติดต่อ'}
          </p>

          <h2>{t.contact}</h2>

          <p>{t.contactText}</p>

          <div className="lotus">❦</div>

        </section>

      </main>


      {/* FOOTER */}
      <footer>

        <div className="dharma">☸</div>

        <strong>
          {lang === 'en'
            ? 'Buddhist Park Monastery of Nathoeng'
            : 'วัดพุทธอุทยานนาเทิง'}
        </strong>

        <p>{t.footer}</p>

      </footer>

    </div>
  )
}

export default App