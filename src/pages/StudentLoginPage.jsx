import React, { useState } from 'react';
import RoutineIcon from '../components/RoutineIcon';

export default function StudentLoginPage({ lang, goToPage, onStudentLogin }) {
  const th = lang === 'th';
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/student?route=login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('temple_student_user', JSON.stringify(data.student));
      window.dispatchEvent(new Event('temple-student-session-changed'));
      onStudentLogin?.(data.student);
      goToPage('student-dashboard');
    } catch (err) {
      setError(th ? 'ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง' : 'The username or PIN is incorrect.');
    } finally { setLoading(false); }
  };

  return (
    <div className="guidePage" style={{ minHeight: '70vh' }}>
      <div className="guideContainer" style={{ maxWidth: 440, padding: '32px 20px' }}>
        <button className="backButton" onClick={() => goToPage('home')}>{th ? '← กลับหน้าแรก' : '← Back to Home'}</button>
        <div style={{ textAlign: 'center', margin: '18px 0 28px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px', background: '#f3efe6', color: '#8a6a32', display: 'grid', placeItems: 'center' }}><RoutineIcon type="profile" size={32} /></div>
          <span className="eyebrow">{th ? 'ระบบกิจวัตรเด็กวัด' : 'TEMPLE STUDENT ROUTINE'}</span>
          <h1 style={{ margin: '6px 0 8px', fontSize: 30 }}>{th ? 'เข้าสู่ระบบของฉัน' : 'My Student Login'}</h1>
          <p style={{ color: '#6f675e', margin: 0 }}>{th ? 'ข้อมูลของแต่ละคนเป็นส่วนตัวและเห็นได้เฉพาะตนเองกับผู้ดูแลระบบ' : 'Each student can see only their own information. Administrators can manage both students.'}</p>
        </div>

        <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #e3ddd2', borderRadius: 16, padding: 22, boxShadow: '0 10px 30px rgba(55,45,30,.05)' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>{th ? 'ชื่อผู้ใช้' : 'Username'}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" style={inputStyle} placeholder={th ? 'ชื่อผู้ใช้ของฉัน' : 'My username'} />
          <label style={{ display: 'block', fontWeight: 700, margin: '16px 0 8px' }}>{th ? 'รหัส PIN' : 'PIN'}</label>
          <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="current-password" type="password" style={inputStyle} placeholder="4–6 digits" />
          {error && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: '#fff1f0', color: '#9b2c2c', fontSize: 14 }}>{error}</div>}
          <button disabled={loading} type="submit" style={{ width: '100%', marginTop: 18, border: 0, borderRadius: 12, padding: '13px 16px', background: '#7b6033', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: loading ? .65 : 1 }}>
            {loading ? (th ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...') : (th ? 'เข้าสู่ระบบ' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1px solid #d9d1c5', borderRadius: 11, padding: '12px 13px', fontSize: 16, outline: 'none', background: '#fff' };
