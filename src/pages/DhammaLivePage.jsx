const RADIO_URL = 'http://122.155.12.107/luangta/Siangdham-Radio-Live.html'
const TV_URL = 'http://122.155.12.107/desktop/sbt_tv_hls.html'

export default function DhammaLivePage({ lang = 'th', goToPage }) {
  const th = lang === 'th'

  return (
    <main className="dhammaLivePage">
      <style>{`
        .dhammaLivePage{min-height:70vh;padding:clamp(32px,6vw,78px) 18px 72px;background:#faf7f0;color:#342d24}
        .dhammaLiveInner{max-width:1000px;margin:0 auto}
        .dhammaLiveHero{position:relative;overflow:hidden;border:1px solid #ddc99f;border-radius:28px;background:radial-gradient(circle at 50% 0%,#fff9e4 0%,#f5dfb0 48%,#ddbf84 100%);padding:clamp(38px,7vw,72px) 22px 48px;text-align:center;box-shadow:0 20px 50px rgba(88,66,28,.10)}
        .dhammaLiveHero:before,.dhammaLiveHero:after{content:"";position:absolute;border:1px solid rgba(123,85,33,.16);border-radius:50%;pointer-events:none}
        .dhammaLiveHero:before{width:500px;height:500px;left:-330px;top:-240px}
        .dhammaLiveHero:after{width:550px;height:550px;right:-350px;bottom:-380px}
        .dhammaLiveEyebrow{display:block;color:#755323;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
        .dhammaLiveSymbol{display:grid;place-items:center;width:74px;height:74px;margin:20px auto;border:1px solid rgba(102,74,31,.3);border-radius:22px;background:rgba(255,255,255,.45);color:#704f25;font-size:39px}
        .dhammaLiveHero h1{margin:0;color:#4b3924;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(46px,7vw,78px);font-weight:600;line-height:1.1}
        .dhammaLiveHero p{max-width:580px;margin:18px auto 0;color:#665a48;font-size:16px;line-height:1.8}
        .dhammaLiveGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:-24px;position:relative;padding:0 24px}
        .dhammaLiveCard{display:flex;flex-direction:column;align-items:center;border:1px solid #e4d6bb;border-radius:22px;background:#fffdf9;padding:30px 24px 28px;text-align:center;box-shadow:0 12px 32px rgba(67,52,30,.08)}
        .dhammaLiveCardIcon{display:grid;place-items:center;width:62px;height:62px;border-radius:18px;background:#f3e7cf;color:#745123;font-size:28px}
        .dhammaLiveCard h2{margin:17px 0 8px;font-size:clamp(22px,3vw,29px);line-height:1.3}
        .dhammaLiveCard p{max-width:350px;margin:0;color:#665f55;font-size:14px;line-height:1.75}
        .dhammaLiveButton{display:inline-flex;align-items:center;justify-content:center;min-height:52px;margin-top:24px;padding:12px 26px;box-sizing:border-box;border-radius:999px;background:#405c4c;color:#fff;text-decoration:none;font-size:16px;font-weight:800;box-shadow:0 8px 24px rgba(38,63,54,.15)}
        .dhammaLiveButton:hover,.dhammaLiveButton:focus-visible{background:#294438}
        .dhammaLiveCredit{margin:15px auto 0!important;color:#786f63!important;font-size:12px!important}
        .dhammaLiveBack{display:block;margin:32px auto 0;border:0;background:transparent;color:#745621;font-weight:800;cursor:pointer}
        .dhammaLiveBack:hover{text-decoration:underline}
        @media(max-width:680px){.dhammaLiveHero{border-radius:20px;padding-bottom:52px}.dhammaLiveGrid{grid-template-columns:1fr;gap:14px;padding:0 12px}.dhammaLiveCard{padding:26px 18px}.dhammaLiveButton{width:100%;max-width:330px}}
      `}</style>
      <div className="dhammaLiveInner">
        <header className="dhammaLiveHero">
          <span className="dhammaLiveEyebrow">NATHOENG · DHAMMA LIVE</span>
          <span className="dhammaLiveSymbol" aria-hidden="true">☸</span>
          <h1>Dhamma Live</h1>
          <p>{th
            ? 'รับฟังวิทยุเสียงธรรมและรับชมโทรทัศน์ธรรมะจากมูลนิธิเสียงธรรมเพื่อประชาชน'
            : 'Listen to Dhamma radio and watch SBT TV from the Siangdham Foundation.'}</p>
        </header>
        <div className="dhammaLiveGrid">
          <section className="dhammaLiveCard" aria-labelledby="dhamma-radio-heading">
            <span className="dhammaLiveCardIcon" aria-hidden="true">♫</span>
            <h2 id="dhamma-radio-heading">{th ? 'วิทยุเสียงธรรม' : 'Dhamma Radio'}</h2>
            <p>{th ? 'ฟังวิทยุเสียงธรรมเพื่อประชาชน' : 'Listen to Siangdham Radio for the People.'}</p>
            <a className="dhammaLiveButton" href={RADIO_URL} target="_blank" rel="noopener noreferrer">
              {th ? 'เปิดฟังวิทยุ ↗' : 'Listen to Radio ↗'}
            </a>
            <p className="dhammaLiveCredit">{th ? 'เสียงโดยวิทยุเสียงธรรมเพื่อประชาชน · เปิดแท็บใหม่' : 'Audio by Siangdham Radio · Opens in a new tab'}</p>
          </section>
          <section className="dhammaLiveCard" aria-labelledby="sbt-tv-heading">
            <span className="dhammaLiveCardIcon" aria-hidden="true">▶</span>
            <h2 id="sbt-tv-heading">SBT TV</h2>
            <p>{th ? 'ชมรายการธรรมะทางโทรทัศน์ SBT' : 'Watch Dhamma programming on SBT TV.'}</p>
            <a className="dhammaLiveButton" href={TV_URL} target="_blank" rel="noopener noreferrer">
              {th ? 'เปิดรับชม SBT TV ↗' : 'Watch SBT TV ↗'}
            </a>
            <p className="dhammaLiveCredit">{th ? 'ภาพและเสียงโดย SBT TV · เปิดแท็บใหม่' : 'Video and audio by SBT TV · Opens in a new tab'}</p>
          </section>
        </div>
        <button className="dhammaLiveBack" type="button" onClick={() => goToPage('home')}>
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>
      </div>
    </main>
  )
}
