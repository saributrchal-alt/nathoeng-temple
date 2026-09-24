import React, { useMemo, useState } from 'react';
import MemberPhotoEditor from './MemberPhotoEditor';

function parseCardFile(text) {
  if (text.length > 200000) throw Error('ไฟล์ข้อมูลบัตรใหญ่เกินกำหนด');
  const card = JSON.parse(text);
  if (card?.format !== 'saributr-card-v1') throw Error('กรุณาใช้ไฟล์ JSON จากแอปอ่านบัตรรุ่น 1.4 ขึ้นไป');
  const citizenId = String(card.citizen_id || '').trim();
  if (!/^\d{13}$/.test(citizenId)) throw Error('เลขบัตรต้องมี 13 หลัก');
  const part = (key, limit) => {
    if (typeof card[key] !== 'string' && card[key] != null) throw Error('ข้อมูลบัตรไม่ถูกต้อง');
    const value = String(card[key] || '').trim();
    if (value.length > limit) throw Error('ข้อมูลบัตรยาวเกินกำหนด');
    return value;
  };
  const birthDate = part('birth_date', 10);
  if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !Number.isFinite(Date.parse(birthDate)) || new Date(birthDate).toISOString().slice(0, 10) !== birthDate)) throw Error('วันเกิดไม่ถูกต้อง');
  const photo = part('avatar_image', 100000);
  if (photo && !/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(photo)) throw Error('รูปจากบัตรไม่ถูกต้อง');
  return { citizenId, birthDate, photo, fullName: [part('name_title', 100), part('first_name', 200), part('last_name', 200)].filter(Boolean).join(' ') };
}

export default function WalkinMemberRegistration({ lang, members = [], onSaved, onDonation }) {
  const th = lang === 'th';
  const [form, setForm] = useState({ fullName: '', citizenId: '', birthDate: '', picture: '', username: '', password: '', memberId: '' });
  const [cardPhoto, setCardPhoto] = useState('');
  const [cardMatched, setCardMatched] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const similar = useMemo(() => {
    const query = form.fullName.toLocaleLowerCase().trim();
    if (query.length < 3) return [];
    return members.filter((m) => String(m.full_name || m.display_name || '').toLocaleLowerCase().includes(query)).slice(0, 8);
  }, [members, form.fullName]);

  async function request(body) {
    const response = await fetch('/api/walkin-members', { method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw Error(result.message || `HTTP ${response.status}`);
    return result;
  }
  async function checkCard(id) {
    const result = await request({ action: 'lookup', citizenId: id });
    setCardMatched(Boolean(result.member));
    update('memberId', result.member?.id || '');
    return result.member;
  }
  async function importCard(file) {
    if (!file) return;
    setBusy(true); setError(''); setReviewed(false); setCreated(null);
    try {
      if (file.size > 200000) throw Error('ไฟล์ข้อมูลบัตรใหญ่เกินกำหนด');
      const card = parseCardFile(await file.text());
      setForm({ fullName: card.fullName, citizenId: card.citizenId, birthDate: card.birthDate,
        picture: '', username: '', password: '', memberId: '' });
      setCardPhoto(card.photo);
      const match = await request({ action: 'lookup', citizenId: card.citizenId });
      setCardMatched(Boolean(match.member));
      if (match.member) update('memberId', match.member.id);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault();
    if (!reviewed) return;
    setBusy(true); setError('');
    try {
      const result = await request({ action: 'register', ...form });
      setCreated({ id: result.memberId, name: form.fullName, username: form.username, password: form.password });
      setReviewed(false);
      onSaved?.();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function reset() {
    setForm({ fullName: '', citizenId: '', birthDate: '', picture: '', username: '', password: '', memberId: '' });
    setCardPhoto(''); setCardMatched(false); setReviewed(false); setCreated(null); setError('');
  }
  const field = { display: 'grid', gap: 6, margin: '12px 0', fontWeight: 700 };
  const input = { minHeight: 44, border: '1px solid #d8c9b5', borderRadius: 9, padding: '8px 11px', font: 'inherit', maxWidth: '100%', boxSizing: 'border-box' };
  return <section style={{ padding: '20px', marginBottom: '24px', border: '1px solid #e1d3bd', borderRadius: 16, background: '#fffdfa' }}>
    <h2 style={{ marginTop: 0 }}>{th ? 'ลงทะเบียนสมาชิกที่โต๊ะงานบุญ' : 'Register a walk-in donor'}</h2>
    <p>{th ? 'นำเข้าไฟล์จากแอปอ่านบัตรที่ใช้ในระบบเครือญาติ หรือกรอกข้อมูลด้วยเจ้าหน้าที่ จากนั้นบันทึกรายการบริจาคในชื่อสมาชิกนี้' : 'Import a card file from the family app or enter details manually, then record the donation for this member.'}</p>
    {created ? <div role="status" style={{ padding: 16, borderRadius: 12, background: '#eff8ee' }}>
      <strong>{th ? 'บันทึกสมาชิกแล้ว' : 'Member saved'}: {created.name}</strong>
      {created.username && <p>{th ? 'แจ้งชื่อผู้ใช้และรหัสผ่านให้เจ้าของบัญชีโดยตรง เมื่อเสร็จแล้วให้กด “คนถัดไป” เพื่อลบข้อมูลนี้ออกจากหน้าจอ' : 'Give the credentials directly to the member, then clear this screen.'}<br />{th ? 'ชื่อผู้ใช้' : 'Username'}: <strong>{created.username}</strong><br />{th ? 'รหัสผ่าน' : 'Password'}: <strong>{created.password}</strong></p>}
      <button type="button" onClick={() => onDonation?.(created.id)}>{th ? 'ไปบันทึกรายการทำบุญ' : 'Record donation'}</button>{' '}
      <button type="button" onClick={reset}>{th ? 'คนถัดไป' : 'Next person'}</button>
    </div> : <>
      <label style={field}>{th ? 'ไฟล์จาก Card Reader (.json)' : 'Card Reader file (.json)'}
        <input type="file" accept=".json,application/json" disabled={busy} onChange={(e) => { importCard(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      <form onSubmit={save}>
        <label style={field}>{th ? 'ชื่อและนามสกุล' : 'Full name'}<input style={input} value={form.fullName} required maxLength={200} onChange={(e) => { update('fullName', e.target.value); setReviewed(false); }} /></label>
        <label style={field}>{th ? 'เลขบัตรประชาชน 13 หลัก (ถ้ามี)' : '13-digit national ID (optional)'}<input style={input} value={form.citizenId} inputMode="numeric" pattern="[0-9]{13}" maxLength={13} autoComplete="off" onChange={(e) => { update('citizenId', e.target.value.replace(/\D/g, '')); setCardMatched(false); update('memberId', ''); setReviewed(false); }} onBlur={async () => { if (/^\d{13}$/.test(form.citizenId)) { try { await checkCard(form.citizenId); } catch (e) { setError(e.message); } } }} /></label>
        {cardMatched && <p role="status" style={{ color: '#805a20' }}>{th ? 'พบบัตรนี้ในระบบแล้ว จะอัปเดตสมาชิกเดิม ไม่สร้างซ้ำ' : 'This card belongs to an existing member. The existing record will be updated.'}</p>}
        <label style={field}>{th ? 'วันเกิด (ค.ศ.)' : 'Date of birth'}<input type="date" style={input} value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></label>
        {!cardMatched && similar.length > 0 && <label style={field}>{th ? 'ตรวจชื่อใกล้เคียงก่อนสมัครใหม่' : 'Check similar names before creating a member'}
          <select style={input} value={form.memberId} onChange={(e) => { update('memberId', e.target.value); setReviewed(false); }}>
            <option value="">{th ? 'เป็นบุคคลใหม่' : 'New person'}</option>
            {similar.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.display_name} · {String(m.id).slice(0, 8)}</option>)}
          </select>
        </label>}
        <MemberPhotoEditor key={cardPhoto || 'manual'} initialPhoto={cardPhoto} lang={lang} onChange={(picture) => update('picture', picture)} />
        {cardPhoto && !form.picture && <p style={{ color: '#805a20' }}>{th ? 'เลื่อน/ซูมรูปจากบัตร แล้วกด “ใช้รูปนี้” ก่อนบันทึก' : 'Adjust the card photo and press “Use this photo” before saving.'}</p>}
        <label style={field}>{th ? 'ชื่อผู้ใช้ (ไม่ต้องมีอีเมลหรือ LINE)' : 'Username (no email or LINE needed)'}<input style={input} value={form.username} autoComplete="off" pattern="[a-z][a-z0-9._-]{3,31}" placeholder="example.member" onChange={(e) => update('username', e.target.value.toLowerCase())} required={!form.memberId} /></label>
        <label style={field}>{th ? 'รหัสผ่านอย่างน้อย 12 ตัวอักษร' : 'Password, at least 12 characters'}<input style={input} type="password" value={form.password} minLength={12} maxLength={128} autoComplete="new-password" onChange={(e) => update('password', e.target.value)} required={Boolean(form.username)} /></label>
        <p style={{ fontSize: 12, color: '#746a5f' }}>{th ? 'แจ้งเจ้าของข้อมูลว่าระบบเก็บชื่อ วันเกิด รูป และเลขบัตร (ถ้ามี) เพื่อทำบัญชีสมาชิกและประวัติการทำบุญ แล้วให้เจ้าของข้อมูลตรวจทานก่อนบันทึก' : 'Explain the member and donation record purpose, and ask the member to review their details before saving.'}</p>
        <label style={{ display: 'flex', gap: 9, alignItems: 'start', margin: '14px 0' }}><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />{th ? 'ตรวจสอบกับเจ้าของข้อมูลและตรวจรายชื่อสมาชิกเดิมแล้ว' : 'I checked these details with the member and reviewed existing records.'}</label>
        {error && <p role="alert" style={{ color: '#a23f34' }}>{error}</p>}
        <button type="submit" disabled={busy || !reviewed || (cardPhoto && !form.picture) || (form.citizenId && !/^\d{13}$/.test(form.citizenId))} style={{ minHeight: 46, padding: '9px 18px', background: '#405c4c', color: '#fff', border: 0, borderRadius: 10 }}>{busy ? (th ? 'กำลังบันทึก…' : 'Saving…') : (th ? 'บันทึกสมาชิก' : 'Save member')}</button>
      </form>
    </>}
  </section>;
}
