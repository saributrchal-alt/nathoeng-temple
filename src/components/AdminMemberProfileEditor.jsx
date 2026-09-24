import React, { useEffect, useState } from 'react';
import MemberPhotoEditor from './MemberPhotoEditor';

export default function AdminMemberProfileEditor({ memberId, lang, onSaved }) {
  const th = lang === 'th';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [password, setPassword] = useState('');
  const [issuedPassword, setIssuedPassword] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/donation-profile', {
          method: 'POST', credentials: 'include', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'admin_member', memberId })
        });
        const data = await response.json();
        if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to load member');
        if (active) setProfile(data.profile);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [memberId]);

  const update = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const field = { display: 'grid', gap: 6, margin: '12px 0', fontWeight: 700, fontSize: 14 };
  const input = { width: '100%', minHeight: 44, boxSizing: 'border-box', border: '1px solid #d8c9b5', borderRadius: 9, padding: '8px 11px', font: 'inherit' };

  async function save(event) {
    event.preventDefault();
    if (!profile || saving) return;
    setError(''); setSuccess(''); setIssuedPassword('');
    if (profile.hasPasswordAccount && !profile.username.trim()) {
      setError(th ? 'บัญชีที่มีรหัสผ่านแล้วต้องมีชื่อผู้ใช้' : 'An existing password account needs a username.');
      return;
    }
    if (!profile.hasPasswordAccount && (profile.username.trim() || password) && (!profile.username.trim() || !password)) {
      setError(th ? 'การสร้างบัญชีใหม่ต้องกรอกทั้งชื่อผู้ใช้และรหัสผ่าน' : 'A new password account needs both a username and a password.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_edit_member', memberId,
          fullName: profile.fullName, identityNumber: profile.identityNumber,
          birthDate: profile.birthDate, countryCode: profile.countryCode,
          picture: newPhoto, removePhoto, username: profile.username, password })
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to save member');
      setProfile((current) => ({ ...current, hasPasswordAccount: Boolean(data.username),
        profileImage: removePhoto ? '' : newPhoto || current.profileImage,
        picture: removePhoto ? '' : newPhoto || current.picture,
        username: data.username }));
      setIssuedPassword(password);
      setPassword(''); setNewPhoto(''); setRemovePhoto(false);
      setSuccess(th ? 'บันทึกข้อมูลสมาชิกแล้ว' : 'Member profile saved.');
      onSaved?.(data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status">{th ? 'กำลังโหลดโปรไฟล์...' : 'Loading profile...'}</p>;
  if (!profile) return <p role="alert" style={{ color: '#a23f34' }}>{error || (th ? 'เปิดข้อมูลสมาชิกไม่ได้' : 'Unable to open member profile.')}</p>;

  return <form onSubmit={save} style={{ border: '1px solid #d9c9af', borderRadius: 14, background: '#fffdf8', padding: 16, marginBottom: 18 }}>
    <h3 style={{ marginTop: 0 }}>{th ? 'แก้ไขโปรไฟล์และบัญชีเข้าสู่ระบบ' : 'Edit profile and login account'}</h3>
    <label style={field}>{th ? 'ชื่อและนามสกุล' : 'Full name'}
      <input style={input} required maxLength={200} value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} />
    </label>
    <label style={field}>{th ? 'เลขบัตรประชาชน 13 หลัก หรือพาสปอร์ต (เว้นว่างเพื่อลบ)' : '13-digit national ID or passport (blank to clear)'}
      <input style={input} autoComplete="off" maxLength={20} value={profile.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} />
    </label>
    <label style={field}>{th ? 'วันเกิด (ค.ศ.)' : 'Date of birth'}
      <input style={input} type="date" value={profile.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
    </label>
    <label style={field}>{th ? 'รหัสประเทศ 2 ตัวอักษร' : 'Two-letter country code'}
      <input style={input} required maxLength={2} pattern="[a-zA-Z]{2}" value={profile.countryCode} onChange={(e) => update('countryCode', e.target.value.toUpperCase())} placeholder="TH" />
    </label>
    {profile.picture && !removePhoto && !newPhoto && <img src={profile.picture} alt={th ? 'รูปปัจจุบัน' : 'Current picture'} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '50%' }} />}
    <MemberPhotoEditor lang={lang} onChange={(photo) => { setNewPhoto(photo); if (photo) setRemovePhoto(false); }} />
    {profile.profileImage && !newPhoto && <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
      {th ? 'ลบรูปที่วัดอัปโหลด (รูป LINE/Telegram ยังอยู่)' : 'Remove uploaded photo (LINE/Telegram picture remains)'}
    </label>}
    <hr style={{ border: 0, borderTop: '1px solid #e4d9c9', margin: '20px 0' }} />
    <p style={{ fontSize: 13, color: '#665d51' }}>{th ? 'ตั้งชื่อผู้ใช้ให้สมาชิกทุกคนได้ แม้สมัครผ่าน LINE/Telegram รหัสผ่านเดิมจะไม่แสดง หากเว้นช่องรหัสผ่านใหม่ไว้ ระบบจะคงรหัสเดิม' : 'Any member can also have a username. The existing password cannot be viewed; leave the new password blank to keep it.'}</p>
    <label style={field}>{th ? 'ชื่อผู้ใช้' : 'Username'}
      <input style={input} autoComplete="off" pattern="[a-z][a-z0-9._-]{3,31}" value={profile.username} onChange={(e) => update('username', e.target.value.toLowerCase())} placeholder="example.member" />
    </label>
    <label style={field}>{th ? 'รหัสผ่านใหม่ (อย่างน้อย 12 ตัวอักษร)' : 'New password (at least 12 characters)'}
      <input style={input} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={profile.hasPasswordAccount ? (th ? 'เว้นว่างเพื่อคงรหัสเดิม' : 'Leave blank to keep current password') : ''} />
    </label>
    {error && <p role="alert" style={{ color: '#a23f34' }}>{error}</p>}
    {success && <p role="status" style={{ color: '#26723d' }}>{success}</p>}
    {issuedPassword && <p role="status" style={{ background: '#eef8ec', padding: 10, borderRadius: 8 }}>
      {th ? 'แจ้งรหัสผ่านใหัเจ้าของบัญชีโดยตรง แล้วกดซ่อนรหัสนี้' : 'Give this password to the member directly, then hide it.'}<br />
      <strong>{issuedPassword}</strong>{' '}
      <button type="button" onClick={() => setIssuedPassword('')}>{th ? 'ซ่อนรหัส' : 'Hide password'}</button>
    </p>}
    <button type="submit" disabled={saving} style={{ minHeight: 44, border: 0, borderRadius: 9, background: '#405c4c', color: '#fff', padding: '9px 15px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
      {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึกโปรไฟล์และบัญชี' : 'Save profile and account')}
    </button>
  </form>;
}
