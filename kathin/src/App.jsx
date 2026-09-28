import React, { useEffect, useState } from 'react';
import KathinDrinkPanel from './components/KathinDrinkPanel.jsx';

export default function App() {
  const [sessionState, setSessionState] = useState('checking');

  useEffect(() => {
    fetch('/api/kathin-drinks?view=member', { credentials: 'include', cache: 'no-store' })
      .then((response) => setSessionState(response.status === 401 ? 'signed-out' : 'ready'))
      .catch(() => setSessionState('offline'));
  }, []);

  return <>
    <header style={{ padding: '14px max(16px, calc((100vw - 1000px) / 2))', background: '#fffaf0', borderBottom: '1px solid #e8dfd0', color: '#57462b', fontWeight: 800 }}>วัดพุทธอุทยานนาเทิง · งานกฐิน 2569</header>
    {sessionState === 'checking' ? <main style={{ padding: 28, textAlign: 'center' }}>กำลังตรวจสอบบัญชีสมาชิก…</main> : sessionState === 'signed-out' ? <main style={{ maxWidth: 620, margin: '8vh auto', padding: 24, textAlign: 'center' }}><h1>เข้าสู่ระบบสมาชิกก่อน</h1><p>ใช้บัญชีสมาชิกวัดเพื่อดูสิทธิ์ สั่งเครื่องดื่ม และติดตามคิว</p><a href="https://watt.nathoeng.com/#login-page" style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 12, background: '#376b4d', color: 'white', fontWeight: 800, textDecoration: 'none' }}>เข้าสู่ระบบสมาชิก</a><p style={{ color: '#756d61' }}>หลังเข้าสู่ระบบแล้ว กลับมาที่ kathin.nathoeng.com</p></main> : sessionState === 'offline' ? <main style={{ padding: 28, textAlign: 'center' }}>เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</main> : <KathinDrinkPanel lang="th" />}
  </>;
}
