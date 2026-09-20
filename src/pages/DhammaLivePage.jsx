const RADIO_URL = 'http://122.155.12.107/luangta/Siangdham-Radio-Live.html'

export default function DhammaLivePage({ lang = 'th', goToPage }) {
  const th = lang === 'th'

  return (
    <main className="dhammaRadioPage">
      <style>{`
        .dhammaRadioPage{min-height:70vh;padding:clamp(70px,10vw,130px) 20px;background:#fbf9f5;color:#342d24;text-align:center}
        .dhammaRadioInner{max-width:680px;margin:auto}
        .dhammaRadioPage h1{font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(42px,7vw,70px);font-weight:600;margin:0 0 22px}
        .dhammaRadioPage p{color:#665f55;line-height:1.8;margin:0 auto 28px}
        .dhammaRadioListen{display:inline-block;border-radius:999px;padding:16px 30px;background:#405c4c;color:#fff;text-decoration:none;font-weight:800;box-shadow:0 8px 24px rgba(38,63,54,.18)}
        .dhammaRadioListen:hover,.dhammaRadioListen:focus-visible{background:#294438}
        .dhammaRadioCredit{font-size:14px;margin-top:22px!important}
        .dhammaRadioBack{display:block;margin:32px auto 0;border:0;background:none;color:#745621;font-weight:800;cursor:pointer}
      `}</style>
      <div className="dhammaRadioInner">
        <h1>Dhamma Radio</h1>
        <p>{th
          ? 'ฟังเสียงธรรมะออนไลน์ผ่านสถานีวิทยุเสียงธรรม'
          : 'Listen to Dhamma through Siangdham Radio.'}</p>
        <a className="dhammaRadioListen" href={RADIO_URL} target="_blank" rel="noopener noreferrer">
          {th ? 'เปิดฟังวิทยุเสียงธรรม ↗' : 'Listen to Siangdham Radio ↗'}
        </a>
        <p className="dhammaRadioCredit">{th
          ? 'เผยแพร่โดยวิทยุเสียงธรรม · เปิดในหน้าต่างใหม่'
          : 'Broadcast by Siangdham Radio · Opens in a new tab'}</p>
        <button className="dhammaRadioBack" type="button" onClick={() => goToPage('home')}>
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>
      </div>
    </main>
  )
}
