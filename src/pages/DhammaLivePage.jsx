function RadioIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="18" width="48" height="34" rx="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 18 43 8M18 30h18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="37" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 39h11M18 45h8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function DhammaLivePage({ lang = 'th', goToPage }) {
  const th = lang === 'th'

  return (
    <div className="dhammaRadioPage">
      <style>{`
        .dhammaRadioPage{--ink:#342d24;--muted:#746b60;--gold:#a67a2d;--cream:#f7f1e6;background:#fbf9f5;color:var(--ink);min-height:70vh}
        .drHero{position:relative;overflow:hidden;padding:86px 22px 82px;background:radial-gradient(circle at 80% 18%,rgba(225,187,105,.28),transparent 30%),linear-gradient(145deg,#263f36 0%,#405c4c 52%,#715c36 100%);color:#fff;text-align:center}
        .drHero:after{content:"";position:absolute;inset:auto -8% -105px;height:160px;background:#fbf9f5;border-radius:50% 50% 0 0/35% 35% 0 0}
        .drHeroInner{position:relative;z-index:1;max-width:880px;margin:auto}
        .drIcon{width:76px;height:76px;margin:0 auto 18px;color:#f0d596}.drIcon svg{width:100%;height:100%}
        .drEyebrow{font-size:13px;font-weight:850;letter-spacing:.18em;text-transform:uppercase;color:#f1dca6}
        .drHero h1{margin:13px 0 12px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(42px,7vw,72px);line-height:1.06;font-weight:600}
        .drHero p{max-width:700px;margin:0 auto;font-size:clamp(16px,2.2vw,20px);line-height:1.8;color:rgba(255,255,255,.88)}
        .drMain{position:relative;z-index:2;max-width:1080px;margin:-20px auto 0;padding:0 20px 80px}
        .drPlayer{background:#fff;border:1px solid #e4d8c5;border-radius:28px;padding:clamp(26px,5vw,48px);box-shadow:0 22px 60px rgba(60,47,27,.12);text-align:center}
        .drStatus{display:inline-flex;align-items:center;gap:9px;padding:8px 14px;border-radius:999px;background:#f3eee5;color:#6c604f;font-weight:800;font-size:13px}
        .drDot{width:9px;height:9px;border-radius:50%;background:#ad8541}
        .drPlayer h2{margin:19px 0 8px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(28px,4vw,42px);font-weight:600}
        .drSub{max-width:660px;margin:0 auto;color:var(--muted);line-height:1.75}
        .drPlay{display:inline-grid;place-items:center;width:76px;height:76px;margin:28px auto 13px;border:0;border-radius:50%;background:#ded8ce;color:#756e65;font-size:29px;cursor:not-allowed;box-shadow:0 10px 25px rgba(61,50,32,.10)}
        .drOffline{font-size:13px;font-weight:800;color:#8a8177}
        .drBar{max-width:600px;height:5px;margin:22px auto 0;border-radius:99px;background:#eee8df;overflow:hidden}.drBar span{display:block;width:28%;height:100%;background:#c4ad83}
        .drGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:26px}
        .drCard{background:#fff;border:1px solid #e8dece;border-radius:20px;padding:25px;text-align:left}
        .drCardIcon{font-size:26px}.drCard h3{margin:14px 0 8px;font-size:18px}.drCard p{margin:0;color:var(--muted);line-height:1.75;font-size:14px}
        .drSchedule{margin-top:28px;padding:34px;border-radius:24px;background:linear-gradient(135deg,#f0e6d4,#f8f4ec)}
        .drSchedule h2{margin:0 0 8px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(25px,4vw,36px);font-weight:600}.drSchedule p{margin:0;color:#655c50;line-height:1.8}
        .drComing{display:inline-block;margin-top:17px;padding:8px 13px;border-radius:999px;background:rgba(166,122,45,.12);color:#7b5920;font-size:13px;font-weight:850}
        .drBack{display:inline-flex;margin-top:28px;border:0;background:transparent;color:#745621;font-weight:800;cursor:pointer}
        @media(max-width:760px){.drHero{padding:66px 18px 66px}.drGrid{grid-template-columns:1fr}.drPlayer{border-radius:22px}.drMain{padding-left:14px;padding-right:14px}.drSchedule{padding:26px}}
      `}</style>

      <section className="drHero">
        <div className="drHeroInner">
          <div className="drIcon"><RadioIcon /></div>
          <div className="drEyebrow">NATHOENG DHAMMA RADIO</div>
          <h1>Dhamma Radio</h1>
          <p>{th
            ? 'พื้นที่แห่งเสียงธรรมจากวัดพุทธอุทยานนาเทิง สำหรับการภาวนา การฟังธรรม และความสงบในชีวิตประจำวัน'
            : 'A space for Dhamma from Buddhist Park Monastery of Nathoeng — for meditation, teachings and moments of peace wherever you are.'}</p>
        </div>
      </section>

      <main className="drMain">
        <section className="drPlayer">
          <div className="drStatus"><span className="drDot" />{th ? 'สถานีกำลังเตรียมออกอากาศ' : 'STATION COMING SOON'}</div>
          <h2>{th ? 'วิทยุธรรมะออนไลน์' : 'Online Dhamma Radio'}</h2>
          <p className="drSub">{th
            ? 'ขณะนี้เรากำลังเตรียมระบบสถานี เมื่อพร้อมแล้ว ท่านจะสามารถกดฟังเสียงธรรมะจากหน้านี้ได้โดยตรง'
            : 'We are preparing the station. Once broadcasting begins, you will be able to listen to Dhamma directly from this page.'}</p>
          <button className="drPlay" type="button" disabled aria-label={th ? 'ยังไม่เปิดออกอากาศ' : 'Broadcast not available yet'}>▶</button>
          <div className="drOffline">{th ? 'ยังไม่เปิดสัญญาณออกอากาศ' : 'Broadcast stream is not yet active'}</div>
          <div className="drBar" aria-hidden="true"><span /></div>
        </section>

        <section className="drGrid">
          <article className="drCard"><div className="drCardIcon">☸</div><h3>{th ? 'พระธรรมเทศนา' : 'Dhamma Teachings'}</h3><p>{th ? 'รวบรวมเสียงพระธรรมเทศนาและข้อธรรมเพื่อการเจริญสติและปัญญา' : 'Recorded teachings and reflections for cultivating mindfulness and wisdom.'}</p></article>
          <article className="drCard"><div className="drCardIcon">◉</div><h3>{th ? 'เสียงจากวัด' : 'From the Monastery'}</h3><p>{th ? 'บทสวด กิจกรรม และเสียงแห่งบรรยากาศสงบจากวัดพุทธอุทยานนาเทิง' : 'Chanting, monastery activities and peaceful sounds from Nathoeng.'}</p></article>
          <article className="drCard"><div className="drCardIcon">24</div><h3>{th ? 'เตรียมออกอากาศ 24 ชั่วโมง' : 'Preparing for 24/7 Radio'}</h3><p>{th ? 'วางระบบเพื่อให้สามารถเปิดฟังธรรมะได้จากทั่วโลกตลอดทั้งวัน' : 'Building a continuous radio service so listeners around the world can tune in anytime.'}</p></article>
        </section>

        <section className="drSchedule">
          <h2>{th ? 'ผังรายการ Dhamma Radio' : 'Dhamma Radio Schedule'}</h2>
          <p>{th
            ? 'ตารางรายการประจำวันจะปรากฏในส่วนนี้เมื่อสถานีเริ่มออกอากาศ ทั้งช่วงสวดมนต์ พระธรรมเทศนา การภาวนา และรายการพิเศษจากวัด'
            : 'The daily schedule will appear here when the station launches, including chanting, Dhamma teachings, meditation and special monastery broadcasts.'}</p>
          <span className="drComing">{th ? 'กำลังจัดเตรียมผังรายการ' : 'Schedule in preparation'}</span>
        </section>

        <button className="drBack" type="button" onClick={() => goToPage('home')}>{th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}</button>
      </main>
    </div>
  )
}
