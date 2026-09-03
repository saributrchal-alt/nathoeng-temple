import React from 'react';

function StayProcessPage({ lang = 'th', goToPage }) {
  const th = lang === 'th';

  const steps = th
    ? [
        {
          no: '1',
          title: 'ทำรายการขอเข้าพักผ่านระบบสมาชิกวัด',
          text: 'เข้าเว็บไซต์ watt.nathoeng.com แล้วเข้าสู่ระบบด้วย LINE จากนั้นทำรายการขอเข้าพักปฏิบัติธรรม พร้อมศึกษาระเบียบ ข้อปฏิบัติ และข้อมูลที่เกี่ยวข้องให้เข้าใจก่อนเดินทางมาวัด',
          action: 'login'
        },
        {
          no: '2',
          title: 'มาถึงวัดและลงทะเบียนเข้าพัก',
          text: 'เดินทางมาถึงตามวันและเวลาที่กำหนด แล้วแจ้งเจ้าหน้าที่วัดเพื่อเช็กอินและลงทะเบียนสถานที่พัก จากจุดลงทะเบียนจะได้รับกุญแจและอุปกรณ์ที่จำเป็นสำหรับการเข้าพัก ในวันแรกพระอาจารย์จะนัดหมายการสวดมนต์เย็นร่วมกัน และแจ้งเวลาปฐมนิเทศการเข้าพักปฏิบัติธรรม'
        },
        {
          no: '3',
          title: 'เข้าที่พักตามที่ได้รับมอบหมาย',
          text: 'เข้าพักตามรายละเอียดและสถานที่ที่ได้รับแจ้งจากจุดลงทะเบียน และดูแลสถานที่พักตามข้อปฏิบัติของวัด'
        },
        {
          no: '4',
          title: 'เข้าสู่การปฏิบัติธรรม',
          text: 'ปฏิบัติตามข้อกำหนดของวัด และปฏิบัติตามคำแนะนำของพระอาจารย์ผู้ดูแลตลอดช่วงเวลาที่เข้าพักปฏิบัติธรรม'
        }
      ]
    : [
        {
          no: '1',
          title: 'Submit a retreat stay request through the monastery member system',
          text: 'Visit watt.nathoeng.com, sign in with LINE, submit your retreat stay request, and read the monastery rules and relevant guidance before travelling.',
          action: 'login'
        },
        {
          no: '2',
          title: 'Arrive and register at the monastery',
          text: 'Arrive on the agreed date and time and report to monastery staff for check-in and accommodation registration. You will receive the key and necessary items for your stay. On the first day, the teacher will arrange an evening chanting session and advise you of the orientation time.'
        },
        {
          no: '3',
          title: 'Go to your assigned accommodation',
          text: 'Stay in the accommodation assigned at registration and care for the space in accordance with monastery guidelines.'
        },
        {
          no: '4',
          title: 'Begin your retreat practice',
          text: 'Follow the monastery requirements and the guidance of the supervising teacher throughout your retreat stay.'
        }
      ];

  return (
    <div className="guidePage stayProcessPage">
      <style>{`
        .stayProcessPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at 88% 7%, rgba(191, 211, 185, .38), transparent 32%),
            linear-gradient(180deg, #f8f5ed 0%, #f1efe7 100%);
        }
        .stayProcessWrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 34px 20px 80px;
        }
        .stayProcessHero {
          margin-top: 18px;
          padding: 34px 28px;
          border-radius: 26px;
          border: 1px solid #e0d8c9;
          background: rgba(255,255,255,.9);
          box-shadow: 0 18px 48px rgba(75,68,54,.07);
        }
        .stayProcessHero .eyebrow2 {
          color: #8c6d2e;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .13em;
        }
        .stayProcessHero h1 {
          margin: 8px 0 12px;
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.15;
          color: #38352f;
        }
        .stayProcessHero p {
          margin: 0;
          max-width: 720px;
          color: #6d675d;
          line-height: 1.8;
        }
        .processTimeline {
          position: relative;
          margin: 28px 0 0;
        }
        .processTimeline:before {
          content: '';
          position: absolute;
          left: 25px;
          top: 38px;
          bottom: 38px;
          width: 2px;
          background: #ccd7c3;
        }
        .processStep {
          position: relative;
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 16px;
          margin-bottom: 14px;
        }
        .processNo {
          position: relative;
          z-index: 1;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #718566;
          color: #fff;
          border: 5px solid #f4f2e9;
          font-weight: 800;
          box-sizing: border-box;
        }
        .processCard {
          padding: 20px 22px;
          border: 1px solid #e1dbcf;
          border-radius: 18px;
          background: rgba(255,255,255,.88);
        }
        .processCard h2 {
          margin: 0 0 7px;
          color: #3f3a33;
          font-size: 19px;
        }
        .processCard p {
          margin: 0;
          color: #6c655b;
          line-height: 1.76;
        }
        .processMiniAction {
          margin-top: 13px;
        }
        .processFooter {
          margin-top: 24px;
          padding: 21px;
          border-radius: 18px;
          background: #e9efe4;
          color: #4e5c48;
          line-height: 1.75;
        }
        .processActions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }
        @media (max-width: 700px) {
          .stayProcessWrap { padding: 22px 14px 64px; }
          .stayProcessHero { padding: 26px 20px; border-radius: 20px; }
          .processTimeline:before { left: 20px; }
          .processStep { grid-template-columns: 42px 1fr; gap: 11px; }
          .processNo { width: 42px; height: 42px; border-width: 4px; }
          .processCard { padding: 16px; }
        }
      `}</style>

      <div className="stayProcessWrap">
        <button type="button" className="backButton" onClick={() => goToPage('my-dashboard')}>
          {th ? '← กลับบัญชีของฉัน' : '← Back to My Account'}
        </button>

        <section className="stayProcessHero">
          <div className="eyebrow2">NATHOENG RETREAT · STAY PROCESS</div>
          <h1>{th ? 'ขั้นตอนการเข้าพัก' : 'Retreat Stay Process'}</h1>
          <p>
            {th
              ? 'ตั้งแต่การทำรายการผ่านระบบสมาชิก การมาถึงวัด การเข้าที่พัก จนถึงการเข้าสู่การปฏิบัติธรรม สามารถเตรียมตัวตาม 4 ขั้นตอนนี้ได้'
              : 'From the online request to arrival, accommodation and the beginning of practice, prepare for your stay through these four steps.'}
          </p>
        </section>

        <div className="processTimeline">
          {steps.map((step) => (
            <article className="processStep" key={step.no}>
              <div className="processNo">{step.no}</div>
              <div className="processCard">
                <h2>{step.title}</h2>
                <p>{step.text}</p>
                {step.action === 'login' && (
                  <div className="processMiniAction">
                    <button type="button" className="textLinkButton" onClick={() => goToPage('login-page')}>
                      {th ? 'เข้าสู่ระบบด้วย LINE →' : 'Sign in with LINE →'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="processFooter">
          <strong>{th ? 'เมื่อมาถึงวัด' : 'When you arrive'}</strong><br />
          {th
            ? 'หากมีข้อสงสัยเกี่ยวกับการลงทะเบียน ที่พัก หรือการปฏิบัติ กรุณาแจ้งเจ้าหน้าที่วัดหรือสอบถามพระอาจารย์ผู้ดูแล เพื่อให้การเข้าพักเป็นไปด้วยความเรียบร้อย'
            : 'If you have questions about registration, accommodation or practice, please speak with monastery staff or the supervising teacher so that your stay can proceed smoothly.'}
        </div>

        <div className="processActions">
          <button type="button" className="primaryContactBtn" onClick={() => goToPage('prepare-stay')}>
            {th ? 'ดูสิ่งที่ควรเตรียม →' : 'What to Prepare →'}
          </button>
          <button type="button" className="textLinkButton" onClick={() => goToPage('visit-guide')}>
            {th ? 'อ่านระเบียบการเข้าพัก' : 'Read Stay Guidelines'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StayProcessPage;
