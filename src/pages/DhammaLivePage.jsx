const RADIO_URL = 'http://122.155.12.107/luangta/Siangdham-Radio-Live.html'

function RadioMark() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M16 32h48a7 7 0 0 1 7 7v24a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7V39a7 7 0 0 1 7-7Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="m20 32 36-18M20 44h28M20 52h22M20 60h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="57" cy="52" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M54 7a13 13 0 0 1 13 13M54 14a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function DhammaLivePage({ lang = 'th', goToPage }) {
  const th = lang === 'th'

  return (
    <main className="dhammaRadioPage">
      <style>{`
        .dhammaRadioPage{min-height:70vh;padding:clamp(32px,6vw,78px) 18px 72px;background:#faf7f0;color:#342d24}
        .dhammaRadioInner{max-width:950px;margin:0 auto}
        .dhammaRadioPoster{position:relative;overflow:hidden;isolation:isolate;border:1px solid #ddc99f;border-radius:28px;background:radial-gradient(circle at 50% 0%,#fff9e4 0%,#f5dfb0 42%,#d9b977 100%);box-shadow:0 22px 55px rgba(88,66,28,.12);text-align:center}
        .dhammaRadioPoster:before,.dhammaRadioPoster:after{content:"";position:absolute;border:1px solid rgba(123,85,33,.18);border-radius:50%;pointer-events:none}
        .dhammaRadioPoster:before{width:530px;height:530px;left:-340px;top:-210px}
        .dhammaRadioPoster:after{width:650px;height:650px;right:-430px;bottom:-390px}
        .dhammaRadioArt{position:relative;padding:clamp(38px,7vw,76px) 22px clamp(38px,7vw,72px)}
        .dhammaRadioEyebrow{display:block;color:#755323;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
        .dhammaRadioMark{width:88px;height:88px;margin:22px auto 14px;padding:14px;border:1px solid rgba(102,74,31,.3);border-radius:24px;background:rgba(255,255,255,.44);color:#704f25}
        .dhammaRadioMark svg{display:block;width:100%;height:100%}
        .dhammaRadioPage h1{margin:0;color:#4b3924;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(42px,7vw,74px);font-weight:600;line-height:1.1}
        .dhammaRadioDivider{display:flex;align-items:center;justify-content:center;gap:13px;margin:22px auto;color:#8a632e}
        .dhammaRadioDivider:before,.dhammaRadioDivider:after{content:"";width:66px;height:1px;background:#b99458}
        .dhammaRadioPage h2{margin:0;font-size:clamp(23px,3.6vw,38px);font-weight:750;line-height:1.35}
        .dhammaRadioDesc{max-width:610px;margin:16px auto 0;color:#665a48;font-size:16px;line-height:1.8}
        .dhammaRadioAction{padding:29px 20px 34px;background:#fffdf9;border-top:1px solid rgba(129,94,47,.18);text-align:center}
        .dhammaRadioListen{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:13px 30px;border-radius:999px;background:#405c4c;color:#fff;text-decoration:none;font-size:17px;font-weight:800;box-shadow:0 8px 24px rgba(38,63,54,.18);transition:background .15s,transform .15s}
        .dhammaRadioListen:hover,.dhammaRadioListen:focus-visible{background:#294438;transform:translateY(-2px)}
        .dhammaRadioCredit{margin:16px auto 0;color:#71685c;font-size:14px;line-height:1.7}
        .dhammaRadioBack{display:block;margin:28px auto 0;border:0;background:transparent;color:#745621;font-weight:800;cursor:pointer}
        .dhammaRadioBack:hover{text-decoration:underline}
        @media(max-width:600px){.dhammaRadioPoster{border-radius:19px}.dhammaRadioArt{padding-left:18px;padding-right:18px}.dhammaRadioMark{width:72px;height:72px;padding:11px}.dhammaRadioDesc{font-size:15px}.dhammaRadioListen{width:100%;max-width:340px;box-sizing:border-box}}
      `}</style>
      <div className="dhammaRadioInner">
        <section className="dhammaRadioPoster" aria-labelledby="dhamma-radio-title">
          <div className="dhammaRadioArt">
            <span className="dhammaRadioEyebrow">NATHOENG · DHAMMA RADIO</span>
            <div className="dhammaRadioMark"><RadioMark /></div>
            <h1 id="dhamma-radio-title">Dhamma Radio</h1>
            <div className="dhammaRadioDivider" aria-hidden="true">✦</div>
            <h2>{th ? 'วิทยุเสียงธรรมเพื่อประชาชน' : 'Siangdham Radio for the People'}</h2>
            <p className="dhammaRadioDesc">{th
              ? 'ร่วมรับฟังเสียงธรรมผ่านสถานีวิทยุเสียงธรรมเพื่อประชาชน'
              : 'Listen to Dhamma from Siangdham Radio for the People.'}</p>
          </div>
          <div className="dhammaRadioAction">
            <a className="dhammaRadioListen" href={RADIO_URL} target="_blank" rel="noopener noreferrer">
              {th ? 'เปิดฟังวิทยุเสียงธรรม ↗' : 'Listen to Siangdham Radio ↗'}
            </a>
            <p className="dhammaRadioCredit">{th
              ? 'รายการและสัญญาณเสียงโดยวิทยุเสียงธรรมเพื่อประชาชน · เปิดหน้าสถานีในแท็บใหม่'
              : 'Programming and audio by Siangdham Radio for the People · Opens the station in a new tab'}</p>
          </div>
        </section>
        <button className="dhammaRadioBack" type="button" onClick={() => goToPage('home')}>
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>
      </div>
    </main>
  )
}
