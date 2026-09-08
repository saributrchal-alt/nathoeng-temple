import { useState, useEffect, useMemo } from 'react'
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopology from 'world-atlas/countries-110m.json'
import './App.css'
import BookingPage from './pages/BookingPage'
import CalendarPage from './pages/CalendarPage'
import DonationPage from './pages/DonationPage'
import DonationListPage from './pages/DonationListPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import MyStaysPage from './pages/MyStaysPage'
import CheckinPage from './pages/CheckinPage'
import MyDashboard from './pages/MyDashboard'
import PracticeMessagesPage from './pages/PracticeMessagesPage'
import StudentLoginPage from './pages/StudentLoginPage'
import StudentDashboard from './pages/StudentDashboard'
import PublicRetreatReviews from './components/PublicRetreatReviews'
import StayProcessPage from './pages/StayProcessPage'
import StayPreparationPage from './pages/StayPreparationPage'

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


const PUBLIC_COUNTRY_POINTS = {
  TH:[100.5,15.9], SG:[103.8,1.35], MY:[102.0,4.2], ID:[117.3,-2.2], PH:[122.7,12.7], VN:[108.3,14.1], LA:[102.6,19.9], KH:[104.9,12.6], MM:[96.1,21.9], BN:[114.7,4.5], TL:[125.7,-8.8],
  CN:[104.2,35.9], JP:[138.3,36.2], KR:[127.8,36.4], KP:[127.5,40.3], TW:[121.0,23.7], HK:[114.2,22.3], MN:[103.8,46.9], IN:[78.9,20.6], LK:[80.8,7.9], NP:[84.1,28.4], BD:[90.4,23.7], PK:[69.3,30.4], BT:[90.4,27.5], MV:[73.2,3.2],
  AU:[133.8,-25.3], NZ:[174.9,-40.9], PG:[143.9,-6.3], FJ:[178.1,-17.7],
  GB:[-3.4,55.4], IE:[-8.2,53.1], FR:[2.2,46.2], DE:[10.5,51.2], IT:[12.6,41.9], ES:[-3.7,40.5], PT:[-8.2,39.4], NL:[5.3,52.1], BE:[4.5,50.5], CH:[8.2,46.8], AT:[14.6,47.5], DK:[9.5,56.3], NO:[8.5,60.5], SE:[18.6,60.1], FI:[25.7,61.9], PL:[19.1,51.9], CZ:[15.5,49.8], GR:[21.8,39.1], UA:[31.2,48.4], RO:[24.9,45.9], HU:[19.5,47.2], RU:[90.0,61.5],
  US:[-98.6,39.8], CA:[-106.3,56.1], MX:[-102.6,23.6], BR:[-51.9,-14.2], AR:[-63.6,-38.4], CL:[-71.5,-35.7], PE:[-75.0,-9.2], CO:[-74.3,4.6], VE:[-66.6,6.4], EC:[-78.2,-1.8], BO:[-63.6,-16.3], UY:[-55.8,-32.5], PY:[-58.4,-23.4],
  ZA:[22.9,-30.6], EG:[30.8,26.8], MA:[-7.1,31.8], KE:[37.9,0.0], TZ:[34.9,-6.4], NG:[8.7,9.1], GH:[-1.0,7.9], ET:[40.5,9.1], UG:[32.3,1.4], RW:[29.9,-1.9],
  AE:[53.8,23.4], SA:[45.1,23.9], QA:[51.2,25.4], IL:[34.9,31.0], TR:[35.2,39.0], IR:[53.7,32.4]
};

function publicCountryFlag(code) {
  const value = String(code || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(value)) return '🌐';
  return String.fromCodePoint(...[...value].map((c) => 127397 + c.charCodeAt(0)));
}

function publicCountryName(code, lang) {
  try {
    const display = new Intl.DisplayNames([lang === 'th' ? 'th' : 'en'], { type: 'region' });
    return display.of(code) || code;
  } catch {
    return code;
  }
}

function PublicWorldMemberMap({ lang }) {
  const th = lang === 'th';
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch('/api/admin-bookings?route=public-country-stats', {
          method: 'GET',
          cache: 'no-store'
        });
        const data = await response.json();
        if (!active) return;
        setCountries(response.ok && data?.success && Array.isArray(data.countries) ? data.countries : []);
      } catch {
        if (active) setCountries([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const map = useMemo(() => {
    const width = 960;
    const height = 430;
    const projection = geoNaturalEarth1().fitExtent([[20, 18], [width - 20, height - 18]], { type: 'Sphere' });
    const path = geoPath(projection);
    const countriesGeo = feature(worldTopology, worldTopology.objects.countries).features;
    return { width, height, projection, path, countriesGeo, graticule: geoGraticule10() };
  }, []);

  const totalMembers = countries.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const mappedCountries = countries.filter((item) => PUBLIC_COUNTRY_POINTS[item.country_code]);

  return (
    <section
      aria-labelledby="world-dhamma-title"
      style={{
        padding: '72px 20px',
        background: 'linear-gradient(180deg, #fbf8f1 0%, #f6f0e5 100%)',
        borderTop: '1px solid #eadfce',
        borderBottom: '1px solid #eadfce'
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto 28px' }}>
          <div className="sectionOrnament" aria-hidden="true" style={{ marginBottom: '12px' }}>
            <span></span>
            <img src="/icons/lotus.svg" alt="" />
            <span></span>
          </div>

          <p className="eyebrow" style={{ marginBottom: '8px' }}>
            {th ? 'กัลยาณมิตรจากทั่วโลก' : 'DHAMMA FRIENDS AROUND THE WORLD'}
          </p>

          <h2 id="world-dhamma-title" style={{ margin: '0 0 14px', fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.18 }}>
            {th ? 'ยินดีต้อนรับผู้ศรัทธาและผู้สนใจในพระพุทธศาสนาจากทั่วโลก' : 'Welcoming Dhamma Friends from Around the World'}
          </h2>

          <p style={{ margin: '0 auto', color: '#665f55', lineHeight: 1.9, fontSize: '16px', maxWidth: '820px' }}>
            {th
              ? 'วัดพุทธอุทยานนาเทิงยินดีต้อนรับพุทธศาสนิกชนและผู้สนใจในการศึกษาและปฏิบัติธรรมจากทุกประเทศ โดยไม่จำกัดเพศ เชื้อชาติ ชาติพันธุ์ สัญชาติ วรรณะ หรือภูมิหลังทางสังคม ทุกท่านสามารถมาร่วมเรียนรู้พระธรรม เจริญสติ ภาวนา และสัมผัสวิถีชีวิตอันเรียบง่ายตามแนวทางพระพุทธศาสนา ภายใต้บรรยากาศแห่งความสงบ ความเคารพซึ่งกันและกัน และความเป็นกัลยาณมิตร'
              : 'Buddhist Park Monastery of Nathoeng warmly welcomes Buddhists and sincere seekers from every part of the world, regardless of gender, nationality, race, ethnicity, social background, or status. Everyone is welcome to learn the Dhamma, cultivate mindfulness, practice meditation, and experience a simple way of life grounded in Buddhist teachings, in an atmosphere of peace, mutual respect, and spiritual friendship.'}
          </p>

          <p style={{ margin: '18px auto 0', fontWeight: 800, color: '#7f5f27', fontSize: '17px' }}>
            {th
              ? 'ธรรมะเป็นสากล และประตูของวัดเปิดต้อนรับผู้ที่มาด้วยความเคารพและความตั้งใจอันดีเสมอ'
              : 'The Dhamma is universal, and our monastery welcomes all who come with respect and sincere intention.'}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '12px',
            margin: '0 auto 22px',
            maxWidth: '760px'
          }}
        >
          <div style={{ background: '#fff', border: '1px solid #e2d6c5', borderRadius: '18px', padding: '18px 20px', textAlign: 'center', boxShadow: '0 8px 28px rgba(80,63,37,0.05)' }}>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#8f6828', lineHeight: 1 }}>2555</div>
            <div style={{ marginTop: '7px', fontWeight: 800 }}>{th ? 'ปีที่ก่อตั้งวัด' : 'Monastery founded'}</div>
            <div style={{ marginTop: '3px', color: '#7d7469', fontSize: '13px' }}>{th ? 'พ.ศ. 2555 · ค.ศ. 2012' : 'B.E. 2555 · 2012'}</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2d6c5', borderRadius: '18px', padding: '18px 20px', textAlign: 'center', boxShadow: '0 8px 28px rgba(80,63,37,0.05)' }}>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#8f6828', lineHeight: 1 }}>{loading ? '…' : totalMembers}</div>
            <div style={{ marginTop: '7px', fontWeight: 800 }}>{th ? 'สมาชิกที่ระบุประเทศแล้ว' : 'Members with country records'}</div>
            <div style={{ marginTop: '3px', color: '#7d7469', fontSize: '13px' }}>{th ? 'เริ่มบันทึก ก.ย. 2569' : 'Records since Sep 2026'}</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2d6c5', borderRadius: '18px', padding: '18px 20px', textAlign: 'center', boxShadow: '0 8px 28px rgba(80,63,37,0.05)' }}>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#8f6828', lineHeight: 1 }}>{loading ? '…' : countries.length}</div>
            <div style={{ marginTop: '7px', fontWeight: 800 }}>{th ? 'ประเทศที่มีสมาชิก' : 'Countries represented'}</div>
            <div style={{ marginTop: '3px', color: '#7d7469', fontSize: '13px' }}>{th ? 'ข้อมูลจากสมาชิกที่เข้าสู่ระบบ' : 'Based on signed-in members'}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dfd2bf', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 45px rgba(78,61,35,0.08)' }}>
          <div style={{ padding: '18px 18px 0' }}>
            <div style={{ borderRadius: '18px', overflow: 'hidden', background: '#edf4f5', border: '1px solid #d7e1df' }}>
              <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={th ? 'แผนที่โลกแสดงประเทศของสมาชิกวัด' : 'World map showing countries represented by monastery members'} style={{ display: 'block', width: '100%', height: 'auto' }}>
                <path d={map.path({ type: 'Sphere' }) || ''} fill="#edf4f5" />
                <path d={map.path(map.graticule) || ''} fill="none" stroke="#cbd9d8" strokeWidth="0.7" opacity="0.75" />
                {map.countriesGeo.map((geo, index) => (
                  <path key={geo.id || index} d={map.path(geo) || ''} fill="#e8dfcf" stroke="#c7b89f" strokeWidth="0.65" />
                ))}
                {mappedCountries.map((item) => {
                  const point = map.projection(PUBLIC_COUNTRY_POINTS[item.country_code]);
                  if (!point) return null;
                  const count = Number(item.count) || 0;
                  const radius = Math.min(16, 7 + Math.sqrt(Math.max(count, 1)) * 2.2);
                  return (
                    <g key={item.country_code} transform={`translate(${point[0]},${point[1]})`}>
                      <circle r={radius + 5} fill="#b78a42" opacity="0.16" />
                      <circle r={radius} fill="#9b7226" stroke="#fff" strokeWidth="2.2" />
                      <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={count > 99 ? 9 : 11} fontWeight="800">{count}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '14px 18px 18px' }}>
            {countries.length ? countries.map((item) => (
              <span key={item.country_code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '999px', background: '#f7f2e9', color: '#554d42', fontSize: '13px', fontWeight: 700 }}>
                <span>{publicCountryFlag(item.country_code)}</span>
                <span>{publicCountryName(item.country_code, lang)}</span>
                <strong>· {item.count}</strong>
              </span>
            )) : (
              <span style={{ color: '#7a7268', fontSize: '13px' }}>
                {loading ? (th ? 'กำลังโหลดข้อมูลสมาชิก…' : 'Loading member data…') : (th ? 'ข้อมูลประเทศจะปรากฏเมื่อสมาชิกเข้าสู่ระบบ' : 'Country data appears as members sign in.')}
              </span>
            )}
          </div>
        </div>

        <p style={{ margin: '14px auto 0', maxWidth: '900px', textAlign: 'center', color: '#7a7268', fontSize: '12px', lineHeight: 1.7 }}>
          {th
            ? 'หมายเหตุ: แผนที่แสดงประเทศของสมาชิกที่เข้าสู่ระบบและได้รับการบันทึกตั้งแต่เดือนกันยายน พ.ศ. 2569 เป็นต้นไป จึงไม่ได้แสดงจำนวนผู้ที่เคยมาเยือนหรือปฏิบัติธรรมกับวัดทั้งหมด และไม่มีการแสดงชื่อหรือข้อมูลส่วนบุคคลของสมาชิกบนแผนที่นี้'
            : 'Note: This map reflects country records for members who have signed in since September 2026. It does not represent all past visitors or practitioners, and no member names or personal information are displayed on this public map.'}
        </p>
      </div>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState('th')
  const [currentPage, setCurrentPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)

  const [studentUser, setStudentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('temple_student_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const t = content[lang]

    useEffect(() => {
    const syncStudentUser = () => {
      try {
        const saved = localStorage.getItem('temple_student_user');
        setStudentUser(saved ? JSON.parse(saved) : null);
      } catch {
        setStudentUser(null);
      }
    };

    window.addEventListener('storage', syncStudentUser);
    window.addEventListener('temple-student-session-changed', syncStudentUser);

    return () => {
      window.removeEventListener('storage', syncStudentUser);
      window.removeEventListener('temple-student-session-changed', syncStudentUser);
    };
  }, []);

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
        hash === 'login-page' ||
        hash === 'student-login' ||
        hash === 'student-dashboard' ||
        hash === 'my-dashboard' ||
        hash === 'my-stays' ||
        hash === 'checkin-page' ||
        hash === 'practice-messages' ||
        hash === 'stay-process' ||
        hash === 'prepare-stay'
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

  // Restore the signed-in monastery member from the server session.
  // localStorage is only a display cache; it is never the authority for login.
useEffect(() => {
  let cancelled = false;

  const restoreServerSession = async () => {
    try {
      const response = await fetch(
        '/api/line-login?route=session',
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.user) {
        throw new Error(
          data?.message || 'No valid server session'
        );
      }

      if (cancelled) return;

      const verifiedUser = {
        memberId: data.user.memberId,
        name: data.user.name,
        lineUid: data.user.lineUid || null,
        telegramUid: data.user.telegramUid || null,
        telegramUsername:
          data.user.telegramUsername || '',
        authProvider:
          data.user.authProvider || 'line',
        picture: data.user.picture || '',
        role:
          data.user.role ||
          (data.user.isAdmin ? 'admin' : 'member'),
        isAdmin: data.user.isAdmin === true
      };

      setUser(verifiedUser);

      localStorage.setItem(
        'nathoeng_user',
        JSON.stringify(verifiedUser)
      );

      localStorage.setItem(
        'line_user',
        JSON.stringify(verifiedUser)
      );
    } catch (error) {
      if (cancelled) return;

      localStorage.removeItem('nathoeng_user');
      localStorage.removeItem('line_user');
      setUser(null);
    }
  };

  restoreServerSession();

  return () => {
    cancelled = true;
  };
}, []);
useEffect(() => {
  const handleLineCallback = async () => {
    if (!window.location.pathname.endsWith('/line-callback')) {
      return;
    }

    const params =
      new URLSearchParams(window.location.search);

    const code = params.get('code');
    const returnedState = params.get('state');
    const error = params.get('error');

    if (error) {
      console.error('LINE Login error:', error);

      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      return;
    }

    if (!code || !returnedState) {
      return;
    }

    try {
      const response = await fetch('/api/line-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          state: returnedState
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const apiError =
          new Error(
            data.message || 'LINE login failed'
          );

        apiError.code = data.code || '';
        throw apiError;
      }

      // Confirm that this browser really stored the secure HttpOnly
      // session cookie before the UI considers the user signed in.
      const sessionResponse = await fetch(
        '/api/line-login?route=session',
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const sessionData =
        await sessionResponse.json();

      if (
        !sessionResponse.ok ||
        !sessionData?.success ||
        !sessionData?.user
      ) {
        const sessionError =
          new Error(
            sessionData?.message ||
            'The secure website session was not preserved'
          );

        sessionError.code =
          'SESSION_COOKIE_NOT_PRESERVED';

        throw sessionError;
      }

      const lineUser = {
        memberId: sessionData.user.memberId,
        name: sessionData.user.name,
        lineUid:
          sessionData.user.lineUid || null,
        telegramUid:
          sessionData.user.telegramUid || null,
        telegramUsername:
          sessionData.user.telegramUsername || '',
        authProvider:
          sessionData.user.authProvider || 'line',
        picture:
          sessionData.user.picture || '',
        role:
          sessionData.user.role ||
          (sessionData.user.isAdmin
            ? 'admin'
            : 'member'),
        isAdmin:
          sessionData.user.isAdmin === true
      };

      localStorage.setItem(
        'nathoeng_user',
        JSON.stringify(lineUser)
      );

      localStorage.setItem(
        'line_user',
        JSON.stringify(lineUser)
      );

      setUser(lineUser);

      const afterLoginPage =
        data.returnPage ||
        sessionStorage.getItem('after_login_page') ||
        localStorage.getItem('after_login_page') ||
        'my-dashboard';

      sessionStorage.removeItem('after_login_page');
      localStorage.removeItem('after_login_page');
      sessionStorage.removeItem('line_oauth_state');
      localStorage.removeItem('line_oauth_state');
      sessionStorage.removeItem('line_oauth_mode');
      localStorage.removeItem('line_oauth_mode');

      window.history.replaceState(
        {},
        document.title,
        '/#' + afterLoginPage
      );

      const savedPendingCheckinToken =
        sessionStorage.getItem('pending_checkin_token') ||
        localStorage.getItem('pending_checkin_token');

      if (savedPendingCheckinToken) {
        sessionStorage.setItem(
          'pending_checkin_token',
          savedPendingCheckinToken
        );
      }

      setCurrentPage(afterLoginPage);

      if (data.merged) {
        alert(
          lang === 'en'
            ? 'LINE and Telegram accounts have been merged successfully.'
            : 'รวมบัญชี LINE และ Telegram เรียบร้อยแล้ว'
        );
      }
    } catch (error) {
      console.error('LINE callback error:', error);

      localStorage.removeItem('nathoeng_user');
      localStorage.removeItem('line_user');
      setUser(null);

      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      const accountMergeFailed =
        error?.code === 'ACCOUNT_MERGE_FAILED';

      const cookieNotPreserved =
        error?.code === 'SESSION_COOKIE_NOT_PRESERVED';

      alert(
        accountMergeFailed
          ? (lang === 'en'
              ? 'This LINE account belongs to an existing member, but the accounts could not be merged safely. Please contact the administrator.'
              : 'LINE นี้เชื่อมกับสมาชิกเดิมอยู่แล้ว แต่ระบบยังรวมบัญชีให้อัตโนมัติไม่ได้ กรุณาติดต่อผู้ดูแลระบบ')
          : cookieNotPreserved
            ? (lang === 'en'
                ? 'This in-app browser could not preserve the secure login session. Please choose Open in browser and continue in Chrome or Safari.'
                : 'เบราว์เซอร์ภายในแอปไม่สามารถเก็บเซสชันที่ปลอดภัยได้ กรุณาเลือก “เปิดในเบราว์เซอร์” แล้วใช้งานต่อใน Chrome หรือ Safari')
            : (lang === 'en'
                ? 'LINE login failed. Please try again.'
                : 'เข้าสู่ระบบ LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      );
    }
  };

  handleLineCallback();
}, []);

useEffect(() => {
  const handleTelegramCallback = async () => {
    if (!window.location.pathname.endsWith('/telegram-callback')) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const code = params.get('code');
    const returnedState = params.get('state');
    const error = params.get('error');

    if (error) {
      console.error('Telegram Login error:', error);

      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      return;
    }

    if (!code) {
      return;
    }

    const sessionState =
      sessionStorage.getItem('telegram_oauth_state');

    const localState =
      localStorage.getItem('telegram_oauth_state');

    const stateMatched =
      (sessionState && sessionState === returnedState) ||
      (localState && localState === returnedState);

    if (!stateMatched) {
      sessionStorage.removeItem('telegram_oauth_state');
      localStorage.removeItem('telegram_oauth_state');
      sessionStorage.removeItem('telegram_pkce_verifier');
      localStorage.removeItem('telegram_pkce_verifier');

      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      alert(
        lang === 'en'
          ? 'Telegram login session expired. Please try again.'
          : 'เซสชันการเข้าสู่ระบบ Telegram หมดอายุ กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง'
      );

      return;
    }

    const codeVerifier =
      sessionStorage.getItem('telegram_pkce_verifier') ||
      localStorage.getItem('telegram_pkce_verifier');

    if (!codeVerifier) {
      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      alert(
        lang === 'en'
          ? 'Telegram login verifier is missing. Please try again.'
          : 'ไม่พบข้อมูลยืนยันการเข้าสู่ระบบ Telegram กรุณาลองใหม่อีกครั้ง'
      );

      return;
    }

    try {
      const response = await fetch('/api/telegram-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          codeVerifier,
          redirectUri: 'https://watt.nathoeng.com/telegram-callback',
          mode:
            sessionStorage.getItem('telegram_oauth_mode') ||
            localStorage.getItem('telegram_oauth_mode') ||
            'login'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const apiError = new Error(data.message || 'Telegram login failed');
        apiError.code = data.code || '';
        throw apiError;
      }

      const telegramUser = {
        memberId: data.user.memberId,
        name: data.user.name,
        lineUid: data.user.lineUid || null,
        telegramUid: data.user.telegramUid,
        telegramUsername: data.user.telegramUsername || '',
        authProvider: data.user.authProvider || 'telegram',
        picture: data.user.picture || '',
        role: data.user.role || (data.user.isAdmin ? 'admin' : 'member'),
        isAdmin: data.user.isAdmin === true
      };

      localStorage.setItem(
        'nathoeng_user',
        JSON.stringify(telegramUser)
      );

      // Keep legacy storage for existing pages while the site is migrated
      // from LINE-only authentication to multi-provider authentication.
      localStorage.setItem(
        'line_user',
        JSON.stringify(telegramUser)
      );

      sessionStorage.removeItem('telegram_oauth_state');
      localStorage.removeItem('telegram_oauth_state');
      sessionStorage.removeItem('telegram_pkce_verifier');
      localStorage.removeItem('telegram_pkce_verifier');
      sessionStorage.removeItem('telegram_oauth_mode');
      localStorage.removeItem('telegram_oauth_mode');

      setUser(telegramUser);

      const afterLoginPage =
        sessionStorage.getItem('after_login_page') ||
        localStorage.getItem('after_login_page') ||
        'home';

      sessionStorage.removeItem('after_login_page');
      localStorage.removeItem('after_login_page');

      window.history.replaceState(
        {},
        document.title,
        '/#' + afterLoginPage
      );

      const savedPendingCheckinToken =
        sessionStorage.getItem('pending_checkin_token') ||
        localStorage.getItem('pending_checkin_token');

      if (savedPendingCheckinToken) {
        sessionStorage.setItem(
          'pending_checkin_token',
          savedPendingCheckinToken
        );
      }

      setCurrentPage(afterLoginPage);

      if (data.merged) {
        alert(
          lang === 'en'
            ? 'LINE and Telegram accounts have been merged successfully.'
            : 'รวมบัญชี LINE และ Telegram เรียบร้อยแล้ว'
        );
      }
    } catch (error) {
      console.error('Telegram callback error:', error);

      sessionStorage.removeItem('telegram_oauth_state');
      localStorage.removeItem('telegram_oauth_state');
      sessionStorage.removeItem('telegram_pkce_verifier');
      localStorage.removeItem('telegram_pkce_verifier');

      window.history.replaceState(
        {},
        document.title,
        '/#login-page'
      );

      const accountMergeFailed =
        error?.code === 'ACCOUNT_MERGE_FAILED';

      alert(
        accountMergeFailed
          ? (lang === 'en'
              ? 'This Telegram account belongs to an existing member, but the accounts could not be merged safely. Please contact the administrator.'
              : 'Telegram นี้เชื่อมกับสมาชิกเดิมอยู่แล้ว แต่ระบบยังรวมบัญชีให้อัตโนมัติไม่ได้ กรุณาติดต่อผู้ดูแลระบบ')
          : (lang === 'en'
              ? 'Telegram login failed. Please try again.'
              : 'เข้าสู่ระบบ Telegram ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      );
    }
  };

  handleTelegramCallback();
}, []);

const base64UrlFromBytes = (bytes) =>
  btoa(
    Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join('')
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const createTelegramPkce = async () => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  const verifier =
    base64UrlFromBytes(randomBytes);

  const digest =
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(verifier)
    );

  const challenge =
    base64UrlFromBytes(
      new Uint8Array(digest)
    );

  return {
    verifier,
    challenge
  };
};

const handleTelegramLogin = async (mode = 'login') => {
  try {
    const telegramClientId = '8612828517';

    const state = crypto.randomUUID();
    const { verifier, challenge } =
      await createTelegramPkce();

    sessionStorage.setItem(
      'telegram_oauth_state',
      state
    );

    localStorage.setItem(
      'telegram_oauth_state',
      state
    );

    sessionStorage.setItem('telegram_oauth_mode', mode);
    localStorage.setItem('telegram_oauth_mode', mode);

    sessionStorage.setItem(
      'telegram_pkce_verifier',
      verifier
    );

    localStorage.setItem(
      'telegram_pkce_verifier',
      verifier
    );

    const existingAfterLoginPage =
      sessionStorage.getItem('after_login_page') ||
      localStorage.getItem('after_login_page');

    const pageToReturn =
      mode === 'link'
        ? 'my-dashboard'
        : existingAfterLoginPage ||
          (currentPage === 'login-page'
            ? 'my-dashboard'
            : currentPage) ||
          'home';

    sessionStorage.setItem(
      'after_login_page',
      pageToReturn
    );

    localStorage.setItem(
      'after_login_page',
      pageToReturn
    );

    const pendingCheckinToken =
      sessionStorage.getItem('pending_checkin_token');

    if (pendingCheckinToken) {
      localStorage.setItem(
        'pending_checkin_token',
        pendingCheckinToken
      );
    }

    const redirectUri =
      'https://watt.nathoeng.com/telegram-callback';

    const telegramAuthUrl =
      'https://oauth.telegram.org/auth' +
      '?client_id=' +
        encodeURIComponent(telegramClientId) +
      '&redirect_uri=' +
        encodeURIComponent(redirectUri) +
      '&response_type=code' +
      '&scope=' +
        encodeURIComponent(
          'openid profile telegram:bot_access'
        ) +
      '&state=' +
        encodeURIComponent(state) +
      '&code_challenge=' +
        encodeURIComponent(challenge) +
      '&code_challenge_method=S256';

    window.location.href =
      telegramAuthUrl;
  } catch (error) {
    console.error(
      'Unable to start Telegram Login:',
      error
    );

    alert(
      lang === 'en'
        ? 'Telegram Login could not be started.'
        : 'ไม่สามารถเริ่มการเข้าสู่ระบบ Telegram ได้'
    );
  }
};

const handleLineLogin = async (mode = 'login') => {
  try {
    const existingAfterLoginPage =
      sessionStorage.getItem('after_login_page') ||
      localStorage.getItem('after_login_page');

    const pageToReturn =
      mode === 'link'
        ? 'my-dashboard'
        : existingAfterLoginPage ||
          (currentPage === 'login-page'
            ? 'my-dashboard'
            : currentPage) ||
          'home';

    sessionStorage.setItem(
      'after_login_page',
      pageToReturn
    );

    localStorage.setItem(
      'after_login_page',
      pageToReturn
    );

    const pendingCheckinToken =
      sessionStorage.getItem('pending_checkin_token');

    if (pendingCheckinToken) {
      localStorage.setItem(
        'pending_checkin_token',
        pendingCheckinToken
      );
    }

    const startResponse = await fetch(
      '/api/line-login?route=start' +
        '&mode=' +
          encodeURIComponent(mode) +
        '&returnPage=' +
          encodeURIComponent(pageToReturn),
      {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      }
    );

    const startData =
      await startResponse.json();

    if (
      !startResponse.ok ||
      !startData?.success ||
      !startData?.authUrl
    ) {
      const startError =
        new Error(
          startData?.message ||
          'Unable to start LINE Login'
        );

      startError.code =
        startData?.code || '';

      throw startError;
    }

    window.location.assign(
      startData.authUrl
    );
  } catch (error) {
    console.error(
      'Unable to start LINE Login:',
      error
    );

    alert(
      lang === 'en'
        ? 'LINE Login could not be started. Please try again.'
        : 'ไม่สามารถเริ่มการเข้าสู่ระบบ LINE ได้ กรุณาลองใหม่อีกครั้ง'
    );
  }
};

  const handleLogout = async () => {
    try {
      await fetch('/api/line-login?route=logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Unable to clear server session:', error);
    }

    setUser(null)
    localStorage.removeItem('nathoeng_user')
    localStorage.removeItem('line_user')
    goToPage('home')
  }

  const goToPage = (page) => {
    setCurrentPage(page)
    setMenuOpen(false)
    window.location.hash = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Bottom navigation for the signed-in user's account area.
  // Keep it visible while moving between account-related pages.
  const accountPages = [
    'my-dashboard',
    'my-stays',
    'booking-page',
    'donation-list',
    'checkin-page',
    'practice-messages',
    'stay-process',
    'prepare-stay'
  ];

  const showAccountBottomNav =
    !!user && !user.isAdmin && accountPages.includes(currentPage);

  const accountNavActive =
    currentPage === 'my-stays' ||
    currentPage === 'booking-page' ||
    currentPage === 'checkin-page'
      ? 'stay'
      : currentPage === 'donation-list'
        ? 'account'
        : 'account';

  const currentUrl = window.location.href

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="site">

      {/* HEADER */}
      <header className="siteHeader">
        <div className="headerInner">
          <button
            type="button"
            className="brand brandButton"
            onClick={() => goToPage('home')}
            aria-label={lang === 'en' ? 'Go to home page' : 'ไปหน้าแรก'}
          >
            <img
              src="/logo-brown.png"
              alt="Wat Phuttha Uthayan Nathoeng"
              className="headerLogo"
            />
            <span className="brandText">
              <strong className={lang === 'en' ? 'brandTitleEn' : 'brandTitleTh'}>
                {lang === 'en'
                  ? 'Buddhist Park Monastery'
                  : 'วัดพุทธอุทยานนาเทิง'}
              </strong>
              <span>
                {lang === 'en'
                  ? 'Wat Phuttha Uthayan Na Thoeng'
                  : 'BUDDHIST PARK MONASTERY OF NATHOENG'}
              </span>
            </span>
          </button>

          {/* Hamburger Menu Button */}
          <button
            className="menuToggleBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Navigation */}
          <nav className={`siteNav ${menuOpen ? 'navOpen' : ''}`}>
            {t.nav
              .filter((item) => item.href !== '#login-page' && item.href !== '#admin-dashboard')
              .map((item) => (
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

          <div className="headerActions">
            <div className="language" aria-label={lang === 'en' ? 'Language' : 'ภาษา'}>
              <span className="languageIcon" aria-hidden="true">◎</span>
              <button
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <span className="languageSlash">/</span>
              <button
                className={lang === 'th' ? 'active' : ''}
                onClick={() => setLang('th')}
              >
                TH
              </button>
            </div>

            {user?.isAdmin && (
              <button
                type="button"
                className="headerAdminBtn"
                onClick={() => goToPage('admin-dashboard')}
              >
                {lang === 'en' ? 'Admin' : 'ผู้ดูแล'}
              </button>
            )}

            {user ? (
              <>
                <button
                  type="button"
                  className="headerAccountBtn"
                  onClick={() => goToPage(user.isAdmin ? 'admin-dashboard' : 'my-dashboard')}
                >
                  <span className="accountIcon" aria-hidden="true">♙</span>
                  <span>{lang === 'en' ? 'My Account' : 'บัญชีของฉัน'}</span>
                </button>

                <button
                  type="button"
                  className="headerLogoutBtn"
                  onClick={handleLogout}
                >
                  {lang === 'en' ? 'Logout' : 'ออก'}
                </button>
              </>
            ) : studentUser ? (
              <>
                <button
                  type="button"
                  className="headerAccountBtn"
                  onClick={() => goToPage('student-dashboard')}
                >
                  <span className="accountIcon" aria-hidden="true">♙</span>
                  <span>{lang === 'en' ? 'Student Account' : 'บัญชีเด็กวัด'}</span>
                </button>

                <button
                  type="button"
                  className="headerLogoutBtn"
                  onClick={async () => {
                    try {
                      await fetch('/api/student?route=logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                    } catch {}

                    localStorage.removeItem('temple_student_user');
                    setStudentUser(null);
                    window.dispatchEvent(new Event('temple-student-session-changed'));
                    goToPage('student-login');
                  }}
                >
                  {lang === 'en' ? 'Logout' : 'ออก'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="headerAccountBtn"
                onClick={() => goToPage('login-page')}
              >
                <span className="accountIcon" aria-hidden="true">♙</span>
                <span>{lang === 'en' ? 'Login' : 'เข้าสู่ระบบ'}</span>
              </button>
            )}
          </div>
        </div>
      </header>


      <main>
        {currentPage === 'home' ? (
          <>
            {/* HERO */}
            <section id="home" className="hero"></section>

            {/* ABOUT */}
            <section id="about" className="aboutSection aboutSectionClean">
              <div className="aboutInner">
                <div className="sectionOrnament" aria-hidden="true">
                  <span></span>
                  <img src="/icons/lotus.svg" alt="" />
                  <span></span>
                </div>

                <p className="eyebrow">{lang === 'en' ? 'ABOUT THE MONASTERY' : 'เกี่ยวกับวัด'}</p>

                <h2>
                  {lang === 'en'
                    ? 'A Forest Monastery in Northeast Thailand'
                    : 'วัดป่าท่ามกลางธรรมชาติแห่งภาคอีสาน'}
                </h2>

                <p className="aboutLead">
                  {lang === 'en'
                    ? "Buddhist Park Monastery of Nathoeng is a place for the practice and study of the Buddha's teachings, surrounded by the peaceful natural environment of Sakon Nakhon in Northeast Thailand."
                    : 'วัดพุทธอุทยานนาเทิง เป็นสถานที่สำหรับการศึกษาและปฏิบัติตามพระธรรมคำสอนของพระพุทธเจ้า ท่ามกลางธรรมชาติอันสงบในจังหวัดสกลนคร'}
                </p>

                <p className="aboutSubtext">
                  {lang === 'en'
                    ? 'The monastery offers a simple setting for meditation, mindfulness, Dhamma practice and community activities.'
                    : 'วัดเป็นสถานที่สำหรับการภาวนา เจริญสติ ศึกษาธรรมะ และร่วมกิจกรรมทางพระพุทธศาสนาอย่างเรียบง่าย'}
                </p>

                <button onClick={() => goToPage('teachings-page')} className="textLinkButton aboutLink">
                  {lang === 'en' ? 'Discover monastery life →' : 'สัมผัสวิถีชีวิตภายในวัด →'}
                </button>

                <button
                  type="button"
                  onClick={() => goToPage(user ? 'my-dashboard' : 'login-page')}
                  style={{
                    marginTop: '22px',
                    padding: '14px 24px',
                    border: '1px solid #b98a3d',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #c89a45 0%, #9b6f27 100%)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 8px 22px rgba(126, 91, 34, 0.18)'
                  }}
                >
                  {lang === 'en'
                    ? 'Join as a Lay Practitioner →'
                    : 'ร่วมสมาชิกเป็นโยมปฏิบัติของวัด →'}
                </button>
              </div>
            </section>

            {/* GLOBAL DHAMMA COMMUNITY */}
            <PublicWorldMemberMap lang={lang} />

            {/* MAIN FEATURES */}
            <section className="featureSection">
              <div className="sectionHeading">
                <div className="sectionOrnament" aria-hidden="true">
                  <span></span>
                  <img src="/icons/lotus.svg" alt="" />
                  <span></span>
                </div>
                <h2>{lang === 'en' ? 'Life at the Monastery' : 'วิถีแห่งวัดพุทธอุทยานนาเทิง'}</h2>
                <p className="sectionIntro">
                  {lang === 'en'
                    ? 'Explore teachings, community events and the quiet rhythm of monastery life.'
                    : 'เรียนรู้พระธรรม ร่วมกิจกรรม และสัมผัสวิถีชีวิตอันเรียบง่ายและสงบภายในวัด'}
                </p>
              </div>

              <div className="cards">
                {/* DHAMMA */}
                <article id="teachings" className="imageCard">
                  <div className="cardImage">
                    <img src="/images/486526184_680593961012974_4699356998246297917_n.jpg" alt="Dhamma" />
                  </div>
                  <div className="cardContent">
                    <span className="cardIconFrame" aria-hidden="true">
                      <img src="/icons/dhamma-wheel.svg" alt="" />
                    </span>
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
                    <span className="cardIconFrame" aria-hidden="true">
                      <img src="/icons/calendar.svg" alt="" />
                    </span>
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
                    <span className="cardIconFrame" aria-hidden="true">
                      <img src="/icons/stay.svg" alt="" />
                    </span>
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
              <div className="quietInner">
                <div className="quietImage">
                  <img src="/images/c8549361-f40f-49cc-ba0d-e3d70810a1bb.jpg" alt="Retreats" />
                </div>

                <div className="quietContent">
                  <p className="eyebrow">{lang === 'en' ? 'PRACTICE' : 'การปฏิบัติ'}</p>
                  <h2>{t.retreats}</h2>
                  <p>{t.retreatsText}</p>

                  <div className="practiceHighlights">
                    <span><img src="/icons/forest-path.svg" alt="" />{lang === 'en' ? 'Forest Paths' : 'ทางเดินท่ามกลางป่า'}</span>
                    <span><img src="/icons/meditation.svg" alt="" />{lang === 'en' ? 'Silent Practice' : 'การภาวนาอย่างสงบ'}</span>
                    <span><img src="/icons/dhamma-book.svg" alt="" />{lang === 'en' ? 'Dhamma Study' : 'ศึกษาพระธรรม'}</span>
                  </div>

                  <div className="quietActions">
                    <button onClick={() => goToPage('visit-guide')} className="textLinkButton">
                      {lang === 'en' ? 'Read guidelines & book stay →' : 'อ่านระเบียบการและจองเข้าพัก →'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SUPPORT */}
            <section id="support" className="support">
              <div className="supportInner">
                <div className="sectionOrnament" aria-hidden="true">
                  <span></span>
                  <img src="/icons/donation.svg" alt="" />
                  <span></span>
                </div>
                <h2>{t.support}</h2>
                <p>{t.supportText}</p>
                <button onClick={() => goToPage('donation-page')} className="primaryContactBtn supportButton">
                  {lang === 'en' ? 'Make a Donation →' : 'ร่วมทำบุญสนับสนุนวัด →'}
                </button>
              </div>
            </section>

            {/* CONTACT */}
            <section id="contact" className="contactSection">
              <div className="sectionOrnament" aria-hidden="true">
                <span></span>
                <img src="/icons/location.svg" alt="" />
                <span></span>
              </div>
              <h2>{t.contact}</h2>
              <p>{t.contactText}</p>
              <button onClick={() => goToPage('contact-page')} className="primaryContactBtn contactButton">
                {lang === 'en' ? 'View Map & Contact Details →' : 'ดูแผนที่และช่องทางการติดต่อ →'}
              </button>
            </section>
          </>
        ) : currentPage === 'teachings-page' ? (
          /* ================= PAGE: TEACHINGS (หลวงปู่มั่น) ================= */
          <div className="guidePage templeEditorialPage">
            <div className="guideContainer templeEditorialContainer teachingsEditorial">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
              </button>

              <div className="editorialHero">
                <img src="/icons/dhamma-wheel.svg" alt="" className="editorialHeroIcon" aria-hidden="true" />
                <span className="eyebrow">{lang === 'en' ? 'DHAMMA TEACHINGS' : 'พระธรรมคำสอนทรงคุณค่า'}</span>
                <h1>{lang === 'en' ? 'Teachings of Venerable Luang Pu Mun' : 'คำสอน...หลวงปู่มั่น ภูริทัตโต'}</h1>
                <p className="guideIntro">
                  {lang === 'en'
                    ? 'Essential Dhamma teachings and contemplation guidelines from Venerable Luang Pu Mun Phuritatto.'
                    : 'รวบรวมคติธรรมและโอวาทธรรมคำสอนอันทรงคุณค่ายิ่งขององค์หลวงปู่มั่น ภูริทัตโต พระอริยสงฆ์สายวัดป่ากรรมฐาน'}
                </p>
              </div>

              <div className="editorialPortraitFrame">
                <img src="/images/93b4f839-927c-4ce7-8ea1-b8fd15651182.jpg" alt="หลวงปู่มั่น ภูริทัตโต" />
                <div className="editorialImageMark">
                  <img src="/icons/lotus.svg" alt="" aria-hidden="true" />
                </div>
                <span className="imageCaption">{lang === 'en' ? 'Venerable Luang Pu Mun' : 'องค์พระอาจารย์มั่น ภูริทัตตเถระ'}</span>
              </div>

              <div className="editorialTeachingBlock">
                <div className="editorialSectionIcon">
                  <img src="/icons/meditation.svg" alt="" aria-hidden="true" />
                </div>
                <div>
                  <h3>{lang === 'en' ? '1. Self-Reflection & Non-Judgment' : '1. การไม่ติเตียนผู้อื่น และการมองตนเอง'}</h3>
                  <p>
                    {lang === 'en'
                      ? 'Even if others are truly at fault, focusing on their faults only brings agitation to one’s own mind.'
                      : 'ถึงเขาจะผิดจริงก็อย่าไปติเตียนเขา การไปนึกถึงความผิดของผู้อื่น มีแต่จะทำให้ใจตนเองขุ่นมัวและกระวนกระวาย'}
                  </p>
                </div>
              </div>

              <div className="editorialTeachingBlock">
                <div className="editorialSectionIcon">
                  <img src="/icons/dhamma-book.svg" alt="" aria-hidden="true" />
                </div>
                <div>
                  <h3>{lang === 'en' ? '2. Core Principles' : '2. คติพจน์ล้ำค่าของหลวงปู่มั่น'}</h3>
                  <ul>
                    <li><strong>{lang === 'en' ? 'Highest Good:' : 'ดีใดไม่มีโทษ:'}</strong> {lang === 'en' ? 'That which brings no blame is supreme goodness.' : 'ดีนั้นชื่อว่าดีเลิศ'}</li>
                    <li><strong>{lang === 'en' ? 'Self-Realization:' : 'การได้ตนเอง:'}</strong> {lang === 'en' ? 'Gaining all worldly treasures is not as valuable as gaining oneself.' : 'ได้สมบัติทั้งปวงไม่ประเสริฐเท่าได้ตน'}</li>
                  </ul>
                </div>
              </div>

              <div className="editorialCtaBox">
                <img src="/icons/lotus.svg" alt="" className="editorialCtaIcon" aria-hidden="true" />
                <h3>{lang === 'en' ? 'Begin the path of practice' : 'เริ่มต้นเส้นทางการปฏิบัติธรรม'}</h3>
                <p>{lang === 'en' ? 'Read the monastery stay and practice guidelines before your visit.' : 'อ่านระเบียบการเข้าพักและแนวปฏิบัติสำหรับผู้มาปฏิบัติธรรม'}</p>
                <button onClick={() => goToPage('visit-guide')} className="primaryContactBtn">
                  {lang === 'en' ? 'View Practice Guidelines →' : 'ดูข้อมูลการเข้าพักและปฏิบัติธรรม →'}
                </button>
              </div>
            </div>
          </div>
        ) : currentPage === 'visit-guide' ? (
          /* ================= PAGE: VISIT & STAY GUIDE ================= */
          <div className="guidePage templeEditorialPage">
            <div className="guideContainer templeEditorialContainer visitEditorial">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
              </button>

              <div className="editorialHero">
                <img src="/icons/lotus.svg" alt="" className="editorialHeroIcon" aria-hidden="true" />
                <span className="eyebrow">{lang === 'en' ? 'VISIT & STAY GUIDELINES' : 'การเข้าพักและปฏิบัติธรรม'}</span>
                <h1>{lang === 'en' ? 'Monastery Stay & Practice' : 'ระเบียบการเข้าพักและบรรยากาศการปฏิบัติธรรม'}</h1>
                <p className="guideIntro">
                  {lang === 'en'
                    ? 'A peaceful and supportive environment for practitioners. Please read the guidelines before booking your stay.'
                    : 'วัดพุทธอุทยานนาเทิงจัดเตรียมพื้นที่อันสัปปายะ เพื่อให้ผู้ปฏิบัติธรรมได้ใช้ชีวิตอย่างสงบเย็น กรุณาอ่านระเบียบปฏิบัติและทำความเข้าใจก่อนทำการจองเข้าพัก'}
                </p>
              </div>

              <div className="visitRuleBlock">
                <div className="visitRuleHeading">
                  <img src="/icons/stay.svg" alt="" aria-hidden="true" />
                  <h3>{lang === 'en' ? '1. Accommodation & General Conduct' : '1. ระเบียบการเข้าพักและข้อปฏิบัติทั่วไป'}</h3>
                </div>
                <p>
                  {lang === 'en'
                    ? 'Simple and quiet accommodations are provided. Practitioners are expected to maintain silence, observe precepts, and participate in monastery chores.'
                    : 'ทางวัดจัดเตรียมอาคารที่พักและกุฏิสำหรับผู้ปฏิบัติธรรม ผู้เข้าพักทุกท่านต้องรักษาศีล สำรวมระวังในกายวาจาใจ และช่วยเหลืองานภายในวัดตามความเหมาะสม'}
                </p>
                <div className="editorialWideImage">
                  <img src="/images/8301.jpg" alt="Accommodation" />
                </div>
                <div className="practiceValues">
                  <div><img src="/icons/precepts.svg" alt="" /><span>{lang === 'en' ? 'Observe precepts' : 'รักษาศีลและความสำรวม'}</span></div>
                  <div><img src="/icons/meditation.svg" alt="" /><span>{lang === 'en' ? 'Quiet practice' : 'ภาวนาอย่างสงบ'}</span></div>
                  <div><img src="/icons/forest-path.svg" alt="" /><span>{lang === 'en' ? 'Respect the environment' : 'เคารพสถานที่และสิ่งแวดล้อม'}</span></div>
                </div>
              </div>

              <div className="visitRuleBlock">
                <div className="visitRuleHeading">
                  <img src="/icons/meditation.svg" alt="" aria-hidden="true" />
                  <h3>{lang === 'en' ? '2. Practice Atmosphere' : '2. บรรยากาศการปฏิบัติภาวนา'}</h3>
                </div>
                <p>
                  {lang === 'en'
                    ? 'Dedicated space for meditation, walking meditation, and listening to Dhamma teachings.'
                    : 'พื้นที่โดยรอบมีความสงบเงียบ เหมาะแก่การเดินจงกรม นั่งสมาธิภาวนา และฟังธรรมเพื่อขัดเกลาจิตใจ'}
                </p>
                <div className="editorialWideImage">
                  <img src="/images/559063252_835057645566604_50190803944267715_n.jpg" alt="Practice" />
                </div>
              </div>

              <div className="editorialCtaBox">
                <img src="/icons/lotus.svg" alt="" className="editorialCtaIcon" aria-hidden="true" />
                <h3>{lang === 'en' ? 'Ready to stay and practice?' : 'อ่านระเบียบและเข้าใจเรียบร้อยแล้วใช่หรือไม่?'}</h3>
                <p>
                  {lang === 'en'
                    ? 'You can proceed directly to the monastery stay application.'
                    : 'หากอ่านและเข้าใจระเบียบแล้ว สามารถกรอกคำขอเข้าพักปฏิบัติธรรมได้เลย'}
                </p>
                <button onClick={() => goToPage('booking-page')} className="primaryContactBtn">
                  {lang === 'en' ? 'Apply for a Retreat Stay →' : 'กรอกฟอร์มจองเข้าปฏิบัติธรรม →'}
                </button>
              </div>

              <PublicRetreatReviews lang={lang} />
            </div>
          </div>
        ) : currentPage === 'stay-process' ? (
          <StayProcessPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'prepare-stay' ? (
          <StayPreparationPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'booking-page' ? (
          /* ================= PAGE: BOOKING FORM ================= */
          <BookingPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'calendar-page' ? (
          /* ================= PAGE: CALENDAR SCHEDULE ================= */
          <CalendarPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'donation-page' ? (
          /* ================= PAGE: DONATION FORM ================= */
          <DonationPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'donation-list' ? (
          /* ================= PAGE: DONATION LIST ================= */
          <DonationListPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'my-dashboard' ? (
          /* ================= PAGE: MY DASHBOARD ================= */
          user ? (
            <MyDashboard
              lang={lang}
              goToPage={goToPage}
              user={user}
              handleLogout={handleLogout}
              handleLineLogin={handleLineLogin}
              handleTelegramLogin={handleTelegramLogin}
            />
          ) : (
            <LoginPage
              lang={lang}
              goToPage={goToPage}
              user={user}
              handleLineLogin={handleLineLogin}
              handleTelegramLogin={handleTelegramLogin}
              handleLogout={handleLogout}
            />
          )
        ) : currentPage === 'practice-messages' ? (
          /* ================= PAGE: PRACTICE MESSAGES ================= */
          user ? (
            <PracticeMessagesPage
              lang={lang}
              goToPage={goToPage}
            />
          ) : (
            <LoginPage
              lang={lang}
              goToPage={goToPage}
              user={user}
              handleLineLogin={handleLineLogin}
              handleTelegramLogin={handleTelegramLogin}
              handleLogout={handleLogout}
            />
          )
        ) : currentPage === 'my-stays' ? (
          /* ================= PAGE: MY STAYS ================= */
          <MyStaysPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'checkin-page' ? (
          /* ================= PAGE: QR CHECK-IN ================= */
          <CheckinPage
            lang={lang}
            goToPage={goToPage}
            user={user}
            handleLineLogin={handleLineLogin}
          />
        ) : currentPage === 'student-login' ? (
          <StudentLoginPage
            lang={lang}
            goToPage={goToPage}
          />
        ) : currentPage === 'student-dashboard' ? (
          <StudentDashboard
            lang={lang}
            goToPage={goToPage}
          />
        ) : currentPage === 'admin-dashboard' ? (
          /* ================= PAGE: ADMIN DASHBOARD ================= */
          user && user.isAdmin ? (
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
          /* ================= PAGE: PRIVACY POLICY ================= */
          <PrivacyPolicyPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'terms-page' ? (
          /* ================= PAGE: TERMS & CONDITIONS ================= */
          <TermsPage lang={lang} goToPage={goToPage} />
        ) : currentPage === 'login-page' ? (
          /* ================= PAGE: LOGIN PAGE ================= */
          <LoginPage
            lang={lang}
            goToPage={goToPage}
            user={user}
            handleLineLogin={handleLineLogin}
            handleTelegramLogin={handleTelegramLogin}
            handleLogout={handleLogout}
          />
        ) : currentPage === 'event-kathina' ? (
          /* ================= PAGE: KATHINA EVENT (Bilingual Thai/English) ================= */
          <div className="guidePage templeEditorialPage">
            <div className="guideContainer templeEditorialContainer eventEditorial">
              <button className="backButton" onClick={() => goToPage('home')}>
                {content[lang].backHome}
              </button>

              <div className="editorialHero">
                <img src="/icons/calendar.svg" alt="" className="editorialHeroIcon" aria-hidden="true" />
                <span className="eyebrow">{t.kathinaEyebrow}</span>
                <h1>{t.kathinaTitle}</h1>
                <p className="guideIntro">{t.kathinaIntro}</p>
              </div>

              {/* SHARE SECTION */}
              <div className="shareSectionBox editorialShareBox" style={{ background: '#fcfbfa', padding: '15px 20px', borderRadius: '4px', marginBottom: '25px', border: '1px solid #eeeae2', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
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

              {/* ประธานกฐิน */}
              <div className="guideSectionBox editorialHighlightBox" style={{ background: '#fcfbfa', padding: '20px 25px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #eeeae2', textAlign: 'center' }}>
                <h3 style={{ color: '#9b7226', marginBottom: '8px', fontSize: '1.2rem' }}>
                  {t.chairpersonTitle}
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#302d29', fontWeight: '500', margin: 0 }}>
                  {t.chairpersonName}
                </p>
              </div>

              {/* กำหนดการอย่างละเอียด */}
              <div className="guideSectionBox editorialScheduleBox" style={{ background: '#f6f4ef', padding: '25px 30px', borderRadius: '4px', marginBottom: '40px', border: '1px solid #eeeae2' }}>
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

              {/* ภาพประกอบในงาน */}
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

              <div className="editorialBottomOrnament" aria-hidden="true">
                <span></span><img src="/icons/lotus.svg" alt="" /><span></span>
              </div>

              <div className="guideContactBox editorialCtaBox">
                <h3>{t.contactSectionTitle}</h3>
                <p>{t.contactSectionText}</p>
                <button onClick={() => goToPage('contact-page')} className="primaryContactBtn">
                  {t.contactBtn}
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* ================= PAGE: CONTACT & MAP (Bilingual) ================= */
          <div className="guidePage templeEditorialPage">
            <div className="guideContainer templeEditorialContainer contactEditorial">
              <button className="backButton" onClick={() => goToPage('home')}>
                {t.backHome}
              </button>

              <div className="editorialHero">
                <img src="/icons/location.svg" alt="" className="editorialHeroIcon" aria-hidden="true" />
                <span className="eyebrow">{t.contactPageEyebrow}</span>
                <h1>{t.contactPageTitle}</h1>
                <p className="guideIntro">{t.contactPageAddress}</p>
              </div>

              <div className="contactMapCard">
                <div className="mapContainer">
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
                <a href="https://maps.google.com/?q=17.621679,103.653418" target="_blank" rel="noopener noreferrer" className="primaryContactBtn mapPrimaryBtn">
                  {t.mapOpenBtn}
                </a>
              </div>

              <div className="contactSectionTitle">
                <img src="/icons/forest-path.svg" alt="" aria-hidden="true" />
                <h2>{lang === 'en' ? 'Getting Here' : 'การเดินทาง'}</h2>
              </div>

              <div className="travelCards">
                <div className="travelCard">
                  <img src="/icons/car.svg" alt="" />
                  <h3>{lang === 'en' ? 'Private Car' : 'รถยนต์ส่วนตัว'}</h3>
                  <p>{lang === 'en' ? 'Use the monastery pin in Google Maps for the current route.' : 'ใช้หมุดตำแหน่งของวัดใน Google Maps เพื่อดูเส้นทางปัจจุบัน'}</p>
                </div>
                <div className="travelCard">
                  <img src="/icons/bus.svg" alt="" />
                  <h3>{lang === 'en' ? 'Public Transport' : 'รถโดยสาร'}</h3>
                  <p>{lang === 'en' ? 'Check the latest local transport connection before your journey.' : 'กรุณาตรวจสอบเส้นทางรถโดยสารและการเดินทางต่อในพื้นที่ก่อนออกเดินทาง'}</p>
                </div>
                <div className="travelCard">
                  <img src="/icons/location.svg" alt="" />
                  <h3>{lang === 'en' ? 'GPS / Map' : 'GPS / แผนที่'}</h3>
                  <p>{lang === 'en' ? 'Open the monastery location directly in Google Maps.' : 'เปิดตำแหน่ง “วัดพุทธอุทยานนาเทิง” ใน Google Maps ได้โดยตรง'}</p>
                </div>
              </div>

              <div className="contactInfoPanel">
                <div className="contactSectionTitle">
                  <img src="/icons/contact.svg" alt="" aria-hidden="true" />
                  <h2>{lang === 'en' ? 'Contact the Monastery' : 'ติดต่อวัด'}</h2>
                </div>
                <div className="contactInfoRow">
                  <img src="/icons/location.svg" alt="" />
                  <div>
                    <strong>{lang === 'en' ? 'Address' : 'ที่อยู่'}</strong>
                    <span>{t.contactPageAddress}</span>
                  </div>
                </div>
                <div className="contactInfoRow">
                  <img src="/icons/contact.svg" alt="" />
                  <div>
                    <strong>LINE</strong>
                    <span>@nathoeng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAccountBottomNav && (
        <nav
          className="dashboardBottomNav"
          aria-label={lang === 'th' ? 'เมนูบัญชีของฉัน' : 'My Account navigation'}
        >
          <button
            type="button"
            className="dashboardBottomNavItem"
            onClick={() => goToPage('home')}
          >
            <img src="/icons/home.svg" alt="" aria-hidden="true" />
            <span>{lang === 'th' ? 'หน้าแรก' : 'Home'}</span>
          </button>

          <button
            type="button"
            className={`dashboardBottomNavItem ${accountNavActive === 'stay' ? 'active' : ''}`}
            onClick={() => goToPage('my-stays')}
          >
            <img src="/icons/stay.svg" alt="" aria-hidden="true" />
            <span>{lang === 'th' ? 'เข้าพักปฏิบัติธรรม' : 'Retreat Stay'}</span>
          </button>

          <button
            type="button"
            className={`dashboardBottomNavItem ${accountNavActive === 'account' ? 'active' : ''}`}
            onClick={() => goToPage('my-dashboard')}
          >
            <img src="/icons/contact.svg" alt="" aria-hidden="true" />
            <span>{lang === 'th' ? 'บัญชีของฉัน' : 'My Account'}</span>
          </button>

          <button
            type="button"
            className="dashboardBottomNavItem"
            onClick={() => goToPage('contact-page')}
          >
            <img src="/icons/location.svg" alt="" aria-hidden="true" />
            <span>{lang === 'th' ? 'ติดต่อวัด' : 'Contact'}</span>
          </button>
        </nav>
      )}



      {/* FOOTER */}
      <footer className="siteFooter">
        <div className="footerMain">
          <div className="footerIdentity">
            <img
              src="/logo-white.png"
              alt="Wat Phuttha Uthayan Nathoeng"
              className="footerLogo"
            />

            <div className="footerTempleDetails">
              <strong>
                {lang === 'en'
                  ? 'Buddhist Park Monastery of Nathoeng'
                  : 'วัดพุทธอุทยานนาเทิง'}
              </strong>

              <div className="footerAddress">
                {lang === 'en'
                  ? '231 Moo 2, That Sub-district, Wanon Niwat District, Sakon Nakhon 47120, Thailand'
                  : '231 บ้านตาลเดี่ยว หมู่ 2 ตำบลธาตุ อำเภอวานรนิวาส จังหวัดสกลนคร 47120'}
              </div>

              <div className="footerLine">LINE @nathoeng</div>
            </div>
          </div>

          <div className="footerCredits">
            <strong>Buddhist Park Monastery of Nathoeng</strong>
            <div>Copyright © 2026 All Rights Reserved</div>
            <div>Powered by Nathoeng Community Tech Team</div>
          </div>
        </div>

        <div className="footerLegal">
          <button type="button" onClick={() => goToPage('privacy-policy')}>
            {t.privacyLink}
          </button>
          <span>·</span>
          <button type="button" onClick={() => goToPage('terms-page')}>
            {t.termsLink}
          </button>
        </div>
      </footer>

    </div>
  )
}

export default App