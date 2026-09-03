import React from 'react';

function StayPreparationPage({ lang = 'th', goToPage }) {
  const th = lang === 'th';

  const items = th
    ? [
        {
          no: '01',
          title: 'บัตรประจำตัวประชาชน',
          text: 'โปรดนำบัตรประจำตัวประชาชน หรือบัตรประจำตัวอื่นที่สามารถใช้แสดงและยืนยันตัวบุคคลได้ เพื่อใช้ในการลงทะเบียนเมื่อเดินทางมาถึงวัด'
        },
        {
          no: '02',
          title: 'ของใช้ส่วนตัวที่จำเป็น',
          text: 'เช่น แปรงสีฟัน ยาสีฟัน สบู่ และของใช้ประจำวันอื่น ๆ เท่าที่จำเป็น ควรงดเว้นการสวมใส่เครื่องประดับระหว่างการเข้าปฏิบัติธรรม'
        },
        {
          no: '03',
          title: 'ผ้าห่ม',
          text: 'ทางวัดไม่มีผ้าห่มเตรียมไว้ให้ ผู้เข้าปฏิบัติธรรมจึงต้องนำผ้าห่มส่วนตัวมาด้วยตนเอง'
        }
      ]
    : [
        {
          no: '01',
          title: 'Identification',
          text: 'Please bring your national ID card or another official document that can be used to identify you when registering upon arrival.'
        },
        {
          no: '02',
          title: 'Essential personal items',
          text: 'Bring only necessary personal items such as a toothbrush, toothpaste, soap and other daily essentials. Please avoid wearing jewellery during your retreat stay.'
        },
        {
          no: '03',
          title: 'A blanket',
          text: 'The monastery does not provide blankets, so each practitioner must bring a personal blanket.'
        }
      ];

  const attire = [
    {
      key: 'male-front',
      src: '/images/man1.png',
      label: th ? 'ผู้ชาย · ด้านหน้า' : 'Men · Front view'
    },
    {
      key: 'male-back',
      src: '/images/man1.png',
      label: th ? 'ผู้ชาย · ด้านหลัง' : 'Men · Back view'
    },
    {
      key: 'female-front',
      src: '/images/man1.png',
      label: th ? 'ผู้หญิง · ด้านหน้า' : 'Women · Front view'
    },
    {
      key: 'female-side',
      src: '/images/man1.png',
      label: th ? 'ผู้หญิง · ด้านข้าง' : 'Women · Side view'
    }
  ];

  return (
    <div className="guidePage stayPreparationPage">
      <style>{`
        .stayPreparationPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 0%, rgba(191, 211, 185, .36), transparent 34%),
            radial-gradient(circle at 90% 18%, rgba(218, 203, 159, .24), transparent 30%),
            linear-gradient(180deg, #f8f5ed 0%, #f2efe6 100%);
        }
        .stayPreparationWrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 34px 20px 80px;
        }
        .stayPrepHero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(129, 119, 91, .18);
          border-radius: 26px;
          padding: 34px 28px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.92), rgba(245,248,238,.88));
          box-shadow: 0 18px 48px rgba(79, 73, 59, .08);
          margin-top: 18px;
        }
        .stayPrepHero:after {
          content: '';
          position: absolute;
          width: 210px;
          height: 210px;
          border-radius: 50%;
          right: -90px;
          top: -95px;
          background: rgba(116, 148, 103, .11);
        }
        .stayPrepEyebrow {
          color: #8c6d2e;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .14em;
        }
        .stayPrepHero h1 {
          margin: 8px 0 12px;
          color: #37352f;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.15;
        }
        .stayPrepHero p {
          margin: 0;
          max-width: 760px;
          color: #676258;
          line-height: 1.8;
          font-size: 16px;
        }
        .stayPrepList {
          display: grid;
          gap: 12px;
          margin: 26px 0 34px;
        }
        .stayPrepItem {
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 16px;
          padding: 20px;
          border: 1px solid #e3ddcf;
          border-radius: 18px;
          background: rgba(255,255,255,.84);
        }
        .stayPrepNo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: #708365;
          font-weight: 800;
          font-size: 13px;
        }
        .stayPrepItem h3 {
          margin: 1px 0 6px;
          color: #3e3a33;
          font-size: 18px;
        }
        .stayPrepItem p {
          margin: 0;
          color: #6d675d;
          line-height: 1.72;
        }
        .attireSection {
          padding: 26px;
          border-radius: 24px;
          background: rgba(255,255,255,.88);
          border: 1px solid #e1dacb;
        }
        .attireSection h2 {
          margin: 0 0 8px;
          color: #3c3932;
          font-size: 27px;
        }
        .attireIntro {
          margin: 0 0 22px;
          color: #71695f;
          line-height: 1.7;
        }
        .attireGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .attireCard {
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid #e4ddcf;
          background: #fbfaf6;
        }
        .attireCard img {
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          display: block;
          background: #f2efe8;
        }
        .attireCard span {
          display: block;
          padding: 10px 9px;
          text-align: center;
          color: #5f5a50;
          font-size: 12px;
          font-weight: 700;
        }
        .attireRules {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .attireRule {
          padding: 16px;
          border-radius: 14px;
          background: #f5f6ef;
          color: #5e5a52;
          line-height: 1.65;
        }
        .attireRule strong {
          display: block;
          color: #45533f;
          margin-bottom: 4px;
        }
        .stayPrepClosing {
          margin-top: 22px;
          padding: 22px;
          border-radius: 18px;
          background: #eaf0e4;
          color: #4d5b47;
          line-height: 1.8;
          text-align: center;
        }
        .stayPrepActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }
        @media (max-width: 760px) {
          .stayPreparationWrap { padding: 22px 14px 64px; }
          .stayPrepHero { padding: 26px 20px; border-radius: 20px; }
          .stayPrepItem { grid-template-columns: 46px 1fr; padding: 16px; gap: 12px; }
          .stayPrepNo { width: 42px; height: 42px; }
          .attireSection { padding: 18px 14px; }
          .attireGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
          .attireRules { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="stayPreparationWrap">
        <button type="button" className="backButton" onClick={() => goToPage('my-dashboard')}>
          {th ? '← กลับบัญชีของฉัน' : '← Back to My Account'}
        </button>

        <section className="stayPrepHero">
          <div className="stayPrepEyebrow">NATHOENG RETREAT · PREPARATION</div>
          <h1>{th ? 'สิ่งที่ควรเตรียม' : 'What to Prepare'}</h1>
          <p>
            {th
              ? 'การมาปฏิบัติธรรมที่วัดพุทธอุทยานนาเทิง ไม่จำเป็นต้องเตรียมสัมภาระมากมาย ขอเพียงเตรียมของใช้ที่จำเป็น เครื่องแต่งกายที่เหมาะสม และเตรียมใจให้พร้อมสำหรับการใช้ชีวิตอย่างเรียบง่ายและสงบภายในวัด'
              : 'A retreat stay at Buddhist Park Monastery of Nathoeng does not require much luggage. Bring only what is necessary, dress appropriately, and prepare yourself for a simple and peaceful period of practice.'}
          </p>
        </section>

        <div className="stayPrepList">
          {items.map((item) => (
            <article className="stayPrepItem" key={item.no}>
              <div className="stayPrepNo">{item.no}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="attireSection">
          <h2>{th ? 'ชุดปฏิบัติธรรมสีขาว' : 'White Practice Attire'}</h2>
          <p className="attireIntro">
            {th
              ? 'เพื่อความเรียบร้อยและเหมาะสมกับสถานที่ ผู้เข้าปฏิบัติธรรมควรแต่งกายด้วยชุดสีขาว สุภาพ ไม่รัดรูป และไม่บางจนเกินไป'
              : 'For modesty and suitability within the monastery, practitioners should wear plain white clothing that is modest, loose-fitting and not transparent.'}
          </p>

          <div className="attireGrid">
            {attire.map((item) => (
              <figure className="attireCard" key={item.key}>
                <img src={item.src} alt={item.label} />
                <span>{item.label}</span>
              </figure>
            ))}
          </div>

          <div className="attireRules">
            <div className="attireRule">
              <strong>{th ? 'ผู้ปฏิบัติธรรมชาย' : 'Men'}</strong>
              {th
                ? 'กางเกงขายาวสีขาว และเสื้อแขนสั้นสีขาว'
                : 'White long trousers and a white short-sleeved shirt.'}
            </div>
            <div className="attireRule">
              <strong>{th ? 'ผู้ปฏิบัติธรรมหญิง' : 'Women'}</strong>
              {th
                ? 'เสื้อแขนยาวสีขาว ผ้าถุงสีขาว และสไบสีขาว'
                : 'A white long-sleeved blouse, white traditional wrap skirt, and white shoulder cloth.'}
            </div>
          </div>
        </section>

        <div className="stayPrepClosing">
          <strong>{th ? 'เตรียมเพียงสิ่งที่จำเป็น แล้ววางสิ่งอื่นไว้ชั่วคราว' : 'Bring what is necessary, and leave the rest aside for a while.'}</strong>
          <br />
          {th
            ? 'เมื่อสิ่งของพร้อม การเดินทางพร้อม และเครื่องแต่งกายพร้อม สิ่งสุดท้ายที่ต้องเตรียมคือใจที่พร้อมจะเรียนรู้ อยู่กับความเรียบง่าย และให้เวลากับการปฏิบัติอย่างเต็มที่'
            : 'Once your essentials, journey and clothing are prepared, the final preparation is a mind ready to learn, live simply and devote time fully to practice.'}
        </div>

        <div className="stayPrepActions">
          <button type="button" className="primaryContactBtn" onClick={() => goToPage('stay-process')}>
            {th ? 'ดูขั้นตอนการเข้าพัก →' : 'View Stay Process →'}
          </button>
          <button type="button" className="textLinkButton" onClick={() => goToPage('visit-guide')}>
            {th ? 'อ่านระเบียบการเข้าพัก' : 'Read Stay Guidelines'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StayPreparationPage;
