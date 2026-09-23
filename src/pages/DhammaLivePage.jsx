import { useState } from 'react'

const RADIO_URL = 'http://122.155.12.107/luangta/Siangdham-Radio-Live.html'
const TV_URL = 'http://122.155.12.107/desktop/sbt_tv_hls.html'

const styles = [
  '.dhammaLivePage{min-height:70vh;padding:clamp(32px,6vw,78px) 18px 72px;background:#faf7f0;color:#342d24}',
  '.dhammaLiveInner{max-width:1120px;margin:0 auto}',
  '.dhammaLiveHero{border:1px solid #ddc99f;border-radius:28px;background:radial-gradient(circle at 50% 0%,#fff9e4 0%,#f5dfb0 48%,#ddbf84 100%);padding:clamp(34px,6vw,58px) 22px;text-align:center;box-shadow:0 20px 50px rgba(88,66,28,.10)}',
  '.dhammaLiveEyebrow{display:block;color:#755323;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}',
  '.dhammaLiveSymbol{display:grid;place-items:center;width:68px;height:68px;margin:18px auto;border:1px solid rgba(102,74,31,.3);border-radius:20px;background:rgba(255,255,255,.45);color:#704f25;font-size:36px}',
  '.dhammaLiveHero h1{margin:0;color:#4b3924;font-family:Georgia,"Noto Serif Thai",serif;font-size:clamp(40px,7vw,68px);font-weight:600;line-height:1.1}',
  '.dhammaLiveHero p{max-width:680px;margin:14px auto 0;color:#665a48;font-size:16px;line-height:1.8}',
  '.dhammaLiveGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:22px}',
  '.dhammaLiveCard{display:flex;flex-direction:column;align-items:center;border:1px solid #e4d6bb;border-radius:22px;background:#fffdf9;padding:26px 22px;text-align:center;box-shadow:0 12px 32px rgba(67,52,30,.08)}',
  '.dhammaLiveCard h2{margin:12px 0 8px;font-size:clamp(21px,3vw,27px);line-height:1.3}',
  '.dhammaLiveCard p{max-width:420px;margin:0;color:#665f55;font-size:14px;line-height:1.75}',
  '.dhammaLiveCardIcon{display:grid;place-items:center;width:56px;height:56px;border-radius:17px;background:#f3e7cf;color:#745123;font-size:26px}',
  '.dhammaLiveButton{display:inline-flex;align-items:center;justify-content:center;min-height:50px;margin-top:20px;padding:11px 24px;box-sizing:border-box;border:0;border-radius:999px;background:#405c4c;color:#fff;text-decoration:none;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(38,63,54,.15)}',
  '.dhammaLiveButton:hover,.dhammaLiveButton:focus-visible{background:#294438}',
  '.dhammaLiveForm{display:flex;width:100%;max-width:420px;flex-direction:column;gap:11px;margin-top:18px}',
  '.dhammaLiveInput{width:100%;box-sizing:border-box;border:1px solid #cfc3aa;border-radius:12px;background:#fff;padding:13px 15px;color:#342d24;font-size:16px}',
  '.dhammaLiveError{margin-top:12px!important;color:#a12f25!important}',
  '.dhammaLiveCredit{margin:13px auto 0!important;color:#786f63!important;font-size:12px!important}',
  '.dhammaLivePlayer{width:100%;aspect-ratio:16/9;margin-top:16px;border:0;border-radius:14px;background:#111}',
  '.dhammaLiveBack{display:block;margin:30px auto 0;border:0;background:transparent;color:#745621;font-weight:800;cursor:pointer}',
  '@media(max-width:680px){.dhammaLiveHero{border-radius:20px}.dhammaLiveGrid{grid-template-columns:1fr;gap:14px}.dhammaLiveCard{padding:24px 17px}.dhammaLiveButton{width:100%;max-width:330px}}'
].join('')

export default function DhammaLivePage({ lang = 'th', goToPage, user }) {
  const th = lang === 'th'
  const [password, setPassword] = useState('')
  const [videoId, setVideoId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/line-login?route=dhamma-live-access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        if (result.code === 'LIVE_PASSWORD_NOT_CONFIGURED') {
          setError(th
            ? 'ระบบยังไม่ได้ตั้งค่ารหัส Dhamma Live กรุณาติดต่อวัด'
            : 'Dhamma Live access has not been configured yet. Please contact the monastery.')
        } else if (result.code === 'ACTIVE_MEMBERSHIP_REQUIRED') {
          setError(th
            ? 'ต้องเป็นสมาชิกที่ยังใช้งานอยู่จึงจะรับชมได้ กรุณาติดต่อวัดเรื่องสถานะสมาชิก'
            : 'An active membership is required. Please contact the monastery about your membership.')
        } else if (result.code === 'LOGIN_REQUIRED') {
          setError(th ? 'กรุณาเข้าสู่ระบบสมาชิกก่อนรับชม' : 'Please sign in before viewing.')
        } else if (result.code === 'LIVE_PASSWORD_INVALID') {
          setError(th ? 'รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง' : 'Incorrect password. Please try again.')
        } else {
          setError(th
            ? 'ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
            : 'Access could not be verified. Please try again.')
        }
        return
      }
      setVideoId(result.videoId)
      setPassword('')
    } catch {
      setError(th
        ? 'เชื่อมต่อระบบตรวจสอบไม่ได้ กรุณาลองใหม่'
        : 'Could not reach the access checker. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const continueToLogin = () => {
    sessionStorage.setItem('after_login_page', 'dhamma-live')
    localStorage.setItem('after_login_page', 'dhamma-live')
    goToPage('login-page')
  }

  return (
    <main className="dhammaLivePage">
      <style>{styles}</style>
      <div className="dhammaLiveInner">
        <header className="dhammaLiveHero">
          <span className="dhammaLiveEyebrow">NATHOENG · DHAMMA LIVE</span>
          <span className="dhammaLiveSymbol" aria-hidden="true">☸</span>
          <h1>Dhamma Live</h1>
          <p>{th
            ? 'รับฟังวิทยุเสียงธรรมและรับชมธรรมะสดจากวัดพุทธอุทยานนาเทิง'
            : 'Listen to Dhamma radio and watch live teachings from Nathoeng Monastery.'}</p>
        </header>

        {!user ? (
          <section className="dhammaLiveCard" style={{ maxWidth: 650, margin: '22px auto 0' }}>
            <span className="dhammaLiveCardIcon" aria-hidden="true">🔒</span>
            <h2>{th ? 'สำหรับสมาชิกเท่านั้น' : 'Members only'}</h2>
            <p>{th
              ? 'กรุณาเข้าสู่ระบบสมาชิก หากยังไม่ได้เป็นสมาชิก ระบบจะพาไปยังหน้าสมัครสมาชิก'
              : 'Please sign in. If you are not yet a member, continue to the membership registration page.'}</p>
            <button className="dhammaLiveButton" type="button" onClick={continueToLogin}>
              {th ? 'เข้าสู่ระบบ / สมัครสมาชิก' : 'Sign in / Join'}
            </button>
          </section>
        ) : (
          <>
            <div className="dhammaLiveGrid">
              <section className="dhammaLiveCard" aria-labelledby="nathoeng-radio-heading">
                <span className="dhammaLiveCardIcon" aria-hidden="true">♫</span>
                <h2 id="nathoeng-radio-heading">{th ? 'Nathoeng Dhamma Radio' : 'Nathoeng Dhamma Radio'}</h2>
                {!videoId ? (
                  <>
                    <p>{th
                      ? 'เข้าสู่ระบบสมาชิกแล้ว กรอกรหัสผ่านเพื่อเปิดรับชมไลฟ์'
                      : 'Enter the Dhamma Live password to open the stream.'}</p>
                    <form className="dhammaLiveForm" onSubmit={handleUnlock}>
                      <input
                        className="dhammaLiveInput"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={th ? 'รหัสผ่าน Dhamma Live' : 'Dhamma Live password'}
                        aria-label={th ? 'รหัสผ่าน Dhamma Live' : 'Dhamma Live password'}
                        required
                      />
                      <button className="dhammaLiveButton" type="submit" disabled={busy}>
                        {busy
                          ? (th ? 'กำลังตรวจสอบ…' : 'Checking…')
                          : (th ? 'เปิดไลฟ์' : 'Open live stream')}
                      </button>
                    </form>
                    {error && <p className="dhammaLiveError" role="alert">{error}</p>}
                  </>
                ) : (
                  <>
                    <iframe
                      className="dhammaLivePlayer"
                      src={'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&playsinline=1'}
                      title="Nathoeng Dhamma Radio Live"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                    <a
                      className="dhammaLiveButton"
                      href={'https://youtube.com/live/' + videoId}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {th ? 'เปิดใน YouTube ↗' : 'Open in YouTube ↗'}
                    </a>
                  </>
                )}
              </section>

              <section className="dhammaLiveCard" aria-labelledby="siangdham-radio-heading">
                <span className="dhammaLiveCardIcon" aria-hidden="true">♫</span>
                <h2 id="siangdham-radio-heading">{th ? 'วิทยุเสียงธรรม' : 'Dhamma Radio'}</h2>
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
          </>
        )}

        <button className="dhammaLiveBack" type="button" onClick={() => goToPage('home')}>
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>
      </div>
    </main>
  )
}
