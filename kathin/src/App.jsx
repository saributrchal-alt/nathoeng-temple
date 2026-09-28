import React, { useEffect, useState } from 'react';
import KathinDrinkPanel from './components/KathinDrinkPanel.jsx';

export default function App() {
  const [sessionState, setSessionState] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      try {
        const local = await fetch('/api/kathin-drinks?view=member', { credentials: 'include', cache: 'no-store' });
        if (local.ok) { if (!cancelled) setSessionState('ready'); return; }
        if (local.status !== 401) { if (!cancelled) setSessionState('offline'); return; }
        const temple = await fetch('https://watt.nathoeng.com/api/line-login?route=kathin-session', { credentials: 'include', cache: 'no-store' });
        if (temple.status === 401) { if (!cancelled) setSessionState('signed-out'); return; }
        if (!temple.ok) throw new Error('Temple login bridge unavailable');
        const assertion = await temple.json();
        const exchange = await fetch('/api/kathin-drinks', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'session-exchange', token: assertion.token }) });
        if (!exchange.ok) throw new Error('Kathin session exchange failed');
        if (!cancelled) setSessionState('ready');
      } catch { if (!cancelled) setSessionState('offline'); }
    };
    connect();
    return () => { cancelled = true; };
  }, []);

  return <>
    <header style={{ padding: '14px max(16px, calc((100vw - 1000px) / 2))', background: '#fffaf0', borderBottom: '1px solid #e8dfd0', color: '#57462b', fontWeight: 800 }}>วัดพุทธอุทยานนาเทิง · งานกฐิน 2569</header>
    {sessionState === 'checking' ? <main style={{ padding: 28, textAlign: 'center' }}>กำลังตรวจสอบบัญชีสมาชิก…</main> : sessionState === 'signed-out' ? <main style={{ maxWidth: 620, margin: '8vh auto', padding: 24, textAlign: 'center' }}><h1>เข้าสู่ระบบสมาชิกก่อน</h1><p>ใช้บัญชีสมาชิกวัดเพื่อดูสิทธิ์ สั่งเครื่องดื่ม และติดตามคิว</p><a href="https://watt.nathoeng.com/#login-page" style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 12, background: '#376b4d', color: 'white', fontWeight: 800, textDecoration: 'none' }}>เข้าสู่ระบบสมาชิก</a><p style={{ color: '#756d61' }}>หลังเข้าสู่ระบบแล้ว กลับมาที่ kathin.nathoeng.com</p></main> : sessionState === 'offline' ? <main style={{ padding: 28, textAlign: 'center' }}>เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</main> : <KathinDrinkPanel lang="th" />}
  </>;
}
