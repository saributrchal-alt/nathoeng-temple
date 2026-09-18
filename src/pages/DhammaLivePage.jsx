import { useEffect, useMemo, useState } from 'react'

const UPCOMING_SESSION = null
// Example when a session is ready:
// {
//   titleTh: 'ภาวนาและฟังธรรมร่วมกัน',
//   titleEn: 'Meditation and Dhamma Reflection',
//   teacherTh: 'พระอาจารย์ปุณยะ ปสุโต',
//   teacherEn: 'Phra Arjan Punya Pasuto',
//   startsAt: '2026-10-03T19:00:00+07:00',
//   durationMinutes: 90,
//   participantUrl: 'https://zoom.us/j/...'
// }
// Keep the Zoom host/start URL in the admin backend only.

function formatLocalDate(iso, lang) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZoneName: 'short'
  }).format(new Date(iso))
}

function GlobeMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M6 32h52M32 6c8 8 12 17 12 26S40 50 32 58M32 6c-8 8-12 17-12 26s4 18 12 26M13 18h38M13 46h38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function DhammaLivePage({ lang = 'th', goToPage, user }) {
  const th = lang === 'th'
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const session = UPCOMING_SESSION
  const sessionState = useMemo(() => {
    if (!session?.startsAt) return 'none'
    const start = new Date(session.startsAt).getTime()
    const end = start + (session.durationMinutes || 90) * 60000
    if (now >= start && now <= end) return 'live'
    return now < start ? 'upcoming' : 'completed'
  }, [now, session])

  const join = () => {
    if (!session?.participantUrl) return
    if (!user) {
      sessionStorage.setItem('after_login_page', 'dhamma-live')
      localStorage.setItem('after_login_page', 'dhamma-live')
      goToPage('login-page')
      return
    }
    window.open(session.participantUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="dhammaLivePage">
      <style>{`
        .dhammaLivePage{--ink:#342d24;--muted:#746b60;--gold:#9b7226;--cream:#f7f1e6;background:#fbf9f5;color:var(--ink);min-height:70vh}
        .dlHero{position:relative;overflow:hidden;padding:88px 22px 78px;background:radial-gradient(circle at 82% 20%,rgba(213,177,104,.28),transparent 31%),linear-gradient(145deg,#2f463b 0%,#496151 52%,#705b37 100%);color:#fff;text-align:center}
        .dlHero:after{content:"";position:absolute;inset:auto -8% -105px;height:160px;background:#fbf9f5;border-radius:50% 50% 0 0/35% 35% 0 0}
        .dlHeroInner{position:relative;z-index:1;max-width:900px;margin:auto}
        .dlGlobe{width:74px;height:74px;margin:0 auto 18px;color:#efd394}.dlGlobe svg{width:100%;height:100%}
        .dlEyebrow{font-size:13px;font-weight:850;letter-spacing:.18em;text-transform:uppercase;color:#f1dca6}
        .dlHero h1{margin:13px 0 12px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(38px,6vw,68px);line-height:1.08;font-weight:600}
        .dlHero p{max-width:700px;margin:0 auto;font-size:clamp(16px,2.2vw,20px);line-height:1.8;color:rgba(255,255,255,.88)}
        .dlMain{position:relative;z-index:2;max-width:1120px;margin:-18px auto 0;padding:0 20px 80px}
        .dlLiveCard{background:#fff;border:1px solid #e4d8c5;border-radius:28px;padding:clamp(24px,5vw,46px);box-shadow:0 22px 60px rgba(60,47,27,.12);text-align:center}
        .dlStatus{display:inline-flex;align-items:center;gap:9px;padding:8px 14px;border-radius:999px;background:#f3eee5;color:#6c604f;font-weight:800;font-size:13px}
        .dlStatus.live{background:#fff0ee;color:#b02c22}.dlDot{width:9px;height:9px;border-radius:50%;background:#ad8541}.live .dlDot{background:#df392f;box-shadow:0 0 0 5px rgba(223,57,47,.13)}
        .dlLiveCard h2{margin:18px 0 10px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(28px,4vw,42px);font-weight:600}
        .dlTeacher,.dlTime{color:var(--muted);line-height:1.7}.dlTime{margin-top:8px;font-weight:750;color:#5b5145}
        .dlJoin{margin-top:24px;border:0;border-radius:999px;padding:15px 28px;background:linear-gradient(135deg,#b78a3b,#8a6221);color:#fff;font:inherit;font-weight:850;cursor:pointer;box-shadow:0 10px 24px rgba(142,102,33,.23)}
        .dlJoin:disabled{background:#d7d0c6;color:#716b63;box-shadow:none;cursor:not-allowed}
        .dlPrivacy{margin:16px auto 0;max-width:660px;color:#81786e;font-size:13px;line-height:1.7}
        .dlGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:26px}
        .dlInfo{background:#fff;border:1px solid #e8dece;border-radius:20px;padding:24px;text-align:left}
        .dlNumber{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#f2e8d7;color:#805d24;font-weight:900}
        .dlInfo h3{margin:15px 0 8px;font-size:18px}.dlInfo p{margin:0;color:var(--muted);line-height:1.75;font-size:14px}
        .dlCommunity{margin-top:28px;padding:36px;border-radius:24px;background:linear-gradient(135deg,#f0e6d4,#f8f4ec);display:grid;grid-template-columns:1.3fr .7fr;gap:28px;align-items:center}
        .dlCommunity h2{margin:0 0 10px;font-family:Georgia,'Noto Serif Thai',serif;font-size:clamp(26px,4vw,38px);font-weight:600}.dlCommunity p{margin:0;color:#655c50;line-height:1.8}
        .dlCommunityMark{font-size:58px;text-align:center}
        .dlBack{display:inline-flex;margin-top:28px;border:0;background:transparent;color:#745621;font-weight:800;cursor:pointer}
        @media(max-width:760px){.dlHero{padding:68px 18px 64px}.dlGrid{grid-template-columns:1fr}.dlCommunity{grid-template-columns:1fr;padding:26px}.dlCommunityMark{display:none}.dlLiveCard{border-radius:22px}.dlMain{padding-left:14px;padding-right:14px}}
      `}</style>

      <section className="dlHero">
        <div className="dlHeroInner">
          <div className="dlGlobe"><GlobeMark /></div>
          <div className="dlEyebrow">{th ? 'ชุมชนธรรมะนานาชาติ' : 'NATHOENG GLOBAL DHAMMA COMMUNITY'}</div>
          <h1>{th ? 'ธรรมะ Live เชื่อมใจทั่วโลก' : 'Live Dhamma, Connecting Hearts Worldwide'}</h1>
          <p>{th
            ? 'ร่วมภาวนา ฟังธรรม และพบกัลยาณมิตรจากทุกมุมโลก ผ่านกิจกรรมออนไลน์ของวัดพุทธอุทยานนาเทิง'
            : 'Meditate, listen to the Dhamma and meet spiritual friends worldwide through online sessions from Buddhist Park Monastery of Nathoeng.'}</p>
        </div>
      </section>

      <main className="dlMain">
        <section className="dlLiveCard" aria-live="polite">
          <div className={`dlStatus ${sessionState === 'live' ? 'live' : ''}`}>
            <span className="dlDot" />
            {sessionState === 'live'
              ? (th ? 'กำลังถ่ายทอดสด' : 'LIVE NOW')
              : sessionState === 'upcoming'
                ? (th ? 'กิจกรรมครั้งถัดไป' : 'UPCOMING SESSION')
                : (th ? 'รอประกาศกำหนดการ' : 'SCHEDULE TO BE ANNOUNCED')}
          </div>

          <h2>{session
            ? (th ? session.titleTh : session.titleEn)
            : (th ? 'Global Dhamma Live' : 'Global Dhamma Live')}</h2>

          {session ? (
            <>
              <div className="dlTeacher">{th ? session.teacherTh : session.teacherEn}</div>
              <div className="dlTime">{formatLocalDate(session.startsAt, lang)}</div>
            </>
          ) : (
            <div className="dlTeacher">{th
              ? 'เมื่อวัดกำหนดกิจกรรม วันและเวลาจะปรากฏที่นี่โดยแสดงตามเวลาท้องถิ่นของผู้ชม'
              : 'When a session is scheduled, its date and time will appear here in each visitor’s local time.'}</div>
          )}

          <button className="dlJoin" type="button" onClick={join} disabled={!session?.participantUrl || sessionState === 'completed'}>
            {session?.participantUrl
              ? (user ? (th ? 'เข้าร่วม Zoom Live' : 'Join Zoom Live') : (th ? 'เข้าสู่ระบบเพื่อเข้าร่วม' : 'Sign in to join'))
              : (th ? 'ยังไม่เปิดห้องถ่ายทอดสด' : 'Live room not open yet')}
          </button>

          <p className="dlPrivacy">{th
            ? 'ลิงก์สำหรับผู้จัดและ Host จะถูกเก็บไว้อย่างปลอดภัยในระบบหลังบ้าน และจะไม่แสดงบนหน้าเว็บไซต์'
            : 'Host and organizer links remain protected in the admin system and are never exposed on the public website.'}</p>
        </section>

        <section className="dlGrid" aria-label={th ? 'ขั้นตอนการเข้าร่วม' : 'How to join'}>
          {[
            [th ? 'ดูตารางกิจกรรม' : 'View the schedule', th ? 'วันและเวลาจะแปลงตามเขตเวลาของอุปกรณ์โดยอัตโนมัติ' : 'Dates and times automatically display in your device’s local timezone.'],
            [th ? 'เข้าสู่ระบบสมาชิก' : 'Sign in as a member', th ? 'ใช้บัญชี LINE หรือ Telegram ของวัดเพื่อยืนยันตัวตน' : 'Use the monastery’s LINE or Telegram sign-in to confirm your identity.'],
            [th ? 'เข้าห้องธรรมะสด' : 'Enter the live room', th ? 'ปุ่มเข้าร่วมจะเปิดเมื่อกิจกรรมพร้อม และนำเข้าสู่ Zoom โดยตรง' : 'The join button activates when the session is ready and opens Zoom directly.']
          ].map(([title, body], index) => (
            <article className="dlInfo" key={title}>
              <span className="dlNumber">{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="dlCommunity">
          <div>
            <h2>{th ? 'พื้นที่ธรรมะสำหรับทุกคน' : 'A Dhamma space for everyone'}</h2>
            <p>{th
              ? 'เปิดต้อนรับผู้สนใจจากทุกประเทศ ทุกเพศ ทุกเชื้อชาติและทุกภูมิหลัง ด้วยบรรยากาศแห่งความสงบ ความเคารพ และความเป็นกัลยาณมิตร'
              : 'Welcoming sincere practitioners from every country, gender, ethnicity and background in an atmosphere of peace, respect and spiritual friendship.'}</p>
          </div>
          <div className="dlCommunityMark" aria-hidden="true">🌏</div>
        </section>

        <button className="dlBack" type="button" onClick={() => goToPage('home')}>
          {th ? '← กลับสู่หน้าหลัก' : '← Back to Home'}
        </button>
      </main>
    </div>
  )
}
