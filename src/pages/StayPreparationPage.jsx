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

  const maleAttire = [
    {
      key: 'male-front',
      src: '/images/man1.png',
      label: th ? 'ด้านหน้า' : 'Front view'
    },
    {
      key: 'male-back',
      src: '/images/man2.png',
      label: th ? 'ด้านหลัง' : 'Back view'
    }
  ];

  const femaleAttire = [
    {
      key: 'female-front',
      src: '/images/woman1.png',
      label: th ? 'ด้านหน้า' : 'Front view'
    },
    {
      key: 'female-side',
      src: '/images/woman2.png',
      label: th ? 'ด้านข้าง' : 'Side view'
    }
  ];

  const AttireGallery = ({ title, description, images, icon }) => (
    <section className="attireGroup">
      <div className="attireGroupHeading">
        <div className="attireGroupIcon" aria-hidden="true">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="attirePhotoGrid">
        {images.map((item) => (
          <figure className="attirePhotoCard" key={item.key}>
            <div className="attirePhotoFrame">
              <img src={item.src} alt={`${title} ${item.label}`} />
            </div>
            <figcaption>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );

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
          padding: 34px 20px 88px;
        }

        .stayPrepHero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(129, 119, 91, .18);
          border-radius: 26px;
          padding: 34px 28px;
          background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(245,248,238,.88));
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
          padding: 30px;
          border-radius: 24px;
          background: rgba(255,255,255,.9);
          border: 1px solid #e1dacb;
          box-shadow: 0 14px 38px rgba(74, 67, 53, .06);
        }

        .attireSection > h2 {
          margin: 0 0 8px;
          color: #3c3932;
          font-size: 28px;
          text-align: center;
        }

        .attireIntro {
          margin: 0 auto 28px;
          max-width: 760px;
          color: #71695f;
          line-height: 1.75;
          text-align: center;
        }

        .attireGroup {
          padding: 22px;
          border-radius: 20px;
          background: #f8f8f3;
          border: 1px solid #e5e1d6;
        }

        .attireGroup + .attireGroup {
          margin-top: 18px;
        }

        .attireGroupHeading {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 18px;
        }

        .attireGroupIcon {
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e8eee3;
          color: #52644b;
          font-size: 18px;
          font-weight: 800;
        }

        .attireGroupHeading h3 {
          margin: 0 0 4px;
          color: #40503b;
          font-size: 21px;
        }

        .attireGroupHeading p {
          margin: 0;
          color: #69645b;
          line-height: 1.65;
        }

        .attirePhotoGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          max-width: 760px;
          margin: 0 auto;
        }

        .attirePhotoCard {
          margin: 0;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #ded8ca;
          background: #fff;
          box-shadow: 0 8px 22px rgba(68, 62, 51, .07);
        }

        .attirePhotoFrame {
          width: 100%;
          min-height: 340px;
          background: #f1efe8;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .attirePhotoCard img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 560px;
          object-fit: contain;
          object-position: center;
        }

        .attirePhotoCard figcaption {
          padding: 12px 14px;
          text-align: center;
          color: #4e5849;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.35;
          background: #fff;
          border-top: 1px solid #eee9df;
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
          .stayPreparationWrap {
            padding: 22px 12px 86px;
          }

          .stayPrepHero {
            padding: 25px 18px;
            border-radius: 20px;
          }

          .stayPrepHero p {
            font-size: 15px;
            line-height: 1.75;
          }

          .stayPrepItem {
            grid-template-columns: 44px 1fr;
            padding: 15px;
            gap: 11px;
          }

          .stayPrepNo {
            width: 40px;
            height: 40px;
          }

          .attireSection {
            padding: 22px 12px;
            border-radius: 20px;
          }

          .attireSection > h2 {
            font-size: 25px;
          }

          .attireIntro {
            font-size: 15px;
            margin-bottom: 22px;
          }

          .attireGroup {
            padding: 15px 10px 12px;
            border-radius: 17px;
          }

          .attireGroupHeading {
            padding: 0 4px;
            margin-bottom: 14px;
          }

          .attireGroupHeading h3 {
            font-size: 19px;
          }

          .attireGroupHeading p {
            font-size: 14px;
          }

          .attirePhotoGrid {
            gap: 10px;
          }

          .attirePhotoCard {
            border-radius: 14px;
          }

          .attirePhotoFrame {
            min-height: 0;
            aspect-ratio: 3 / 4;
          }

          .attirePhotoCard img {
            width: 100%;
            height: 100%;
            max-height: none;
            object-fit: contain;
          }

          .attirePhotoCard figcaption {
            padding: 10px 6px;
            font-size: 13px;
            white-space: nowrap;
          }

          .stayPrepActions {
            flex-direction: column;
          }

          .stayPrepActions button {
            width: 100%;
          }
        }

        @media (max-width: 390px) {
          .stayPreparationWrap {
            padding-left: 8px;
            padding-right: 8px;
          }

          .attireSection {
            padding-left: 8px;
            padding-right: 8px;
          }

          .attireGroup {
            padding-left: 7px;
            padding-right: 7px;
          }

          .attirePhotoGrid {
            gap: 7px;
          }

          .attirePhotoCard figcaption {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="stayPreparationWrap">
        <button
          type="button"
          className="backButton"
          onClick={() => goToPage('my-dashboard')}
        >
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
              ? 'เพื่อความเรียบร้อยและเหมาะสมกับสถานที่ ผู้เข้าปฏิบัติธรรมควรแต่งกายด้วยชุดสีขาว สุภาพ ไม่รัดรูป และไม่บางจนเกินไป โดยดูรูปแบบการแต่งกายจากภาพตัวอย่างด้านล่าง'
              : 'For modesty and suitability within the monastery, practitioners should wear plain white clothing that is modest, loose-fitting and not transparent. Please use the examples below as a guide.'}
          </p>

          <AttireGallery
            title={th ? 'ผู้ปฏิบัติธรรมชาย' : 'Men'}
            description={
              th
                ? 'กางเกงขายาวสีขาว และเสื้อแขนสั้นสีขาว'
                : 'White long trousers and a white short-sleeved shirt.'
            }
            images={maleAttire}
            icon="ช"
          />

          <AttireGallery
            title={th ? 'ผู้ปฏิบัติธรรมหญิง' : 'Women'}
            description={
              th
                ? 'เสื้อแขนยาวสีขาว ผ้าถุงสีขาว และสไบสีขาว'
                : 'A white long-sleeved blouse, white traditional wrap skirt, and white shoulder cloth.'
            }
            images={femaleAttire}
            icon="ญ"
          />
        </section>

        <div className="stayPrepClosing">
          <strong>
            {th
              ? 'เตรียมเพียงสิ่งที่จำเป็น แล้ววางสิ่งอื่นไว้ชั่วคราว'
              : 'Bring what is necessary, and leave the rest aside for a while.'}
          </strong>
          <br />
          {th
            ? 'เมื่อสิ่งของพร้อม การเดินทางพร้อม และเครื่องแต่งกายพร้อม สิ่งสุดท้ายที่ต้องเตรียมคือใจที่พร้อมจะเรียนรู้ อยู่กับความเรียบง่าย และให้เวลากับการปฏิบัติอย่างเต็มที่'
            : 'Once your essentials, journey and clothing are prepared, the final preparation is a mind ready to learn, live simply and devote time fully to practice.'}
        </div>

        <div className="stayPrepActions">
          <button
            type="button"
            className="primaryContactBtn"
            onClick={() => goToPage('stay-process')}
          >
            {th ? 'ดูขั้นตอนการเข้าพัก →' : 'View Stay Process →'}
          </button>

          <button
            type="button"
            className="textLinkButton"
            onClick={() => goToPage('visit-guide')}
          >
            {th ? 'อ่านระเบียบการเข้าพัก' : 'Read Stay Guidelines'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StayPreparationPage;
