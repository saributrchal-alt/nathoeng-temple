import React, { useEffect, useState } from 'react';
import MemberPhotoEditor from './MemberPhotoEditor';
import { parseCardFile } from './parseCardFile';
import { readLatestDesktopCard } from '../lib/cardReaderBridge';

export default function AdminMemberProfileEditor({ memberId, lang, onSaved }) {
  const th = lang === 'th';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [cardPhoto, setCardPhoto] = useState('');
  const [cardImported, setCardImported] = useState(false);
  const [cardReviewed, setCardReviewed] = useState(false);
  const [cardError, setCardError] = useState('');
  const [importingCard, setImportingCard] = useState(false);
  const [readerBusy, setReaderBusy] = useState(false);
  const [readerError, setReaderError] = useState('');
  const [readerSuccess, setReaderSuccess] = useState('');
  const [photoVersion, setPhotoVersion] = useState(0);
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

  const update = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    if (cardImported) setCardReviewed(false);
  };
  const field = { display: 'grid', gap: 6, margin: '12px 0', fontWeight: 700, fontSize: 14 };
  const input = { width: '100%', minHeight: 44, boxSizing: 'border-box', border: '1px solid #d8c9b5', borderRadius: 9, padding: '8px 11px', font: 'inherit' };

  async function importCard(file) {
    if (!file || !profile || importingCard) return;
    setImportingCard(true); setCardReviewed(false); setCardError(''); setError(''); setSuccess('');
    try {
      if (file.size > 200000) throw Error('ไฟล์ข้อมูลบัตรใหญ่เกินกำหนด');
      const card = parseCardFile(await file.text());
      if (card.fullName.length < 2 || card.fullName.length > 200)
        throw Error(th ? 'ชื่อจากบัตรไม่ครบหรือยาวเกินกำหนด' : 'Cardholder name is missing or too long.');
      const currentId = String(profile.identityNumber || '').replace(/[\s-]+/g, '').toUpperCase();
      if (currentId && currentId !== card.citizenId)
        throw Error(th ? 'สมาชิกที่เลือกมีเลขประจำตัวคนละเลข กรุณาตรวจสอบบัญชีสมาชิกก่อนนำเข้า' : 'This member has a different ID. Check the selected account before importing.');

      const response = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', citizenId: card.citizenId })
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to check card identity');
      if (data.member && String(data.member.id) !== String(memberId))
        throw Error(th
          ? `เลขบัตรนี้ผูกกับบัญชี ${data.member.fullName || data.member.id} อยู่แล้ว กรุณาเปิดสมาชิกบัญชีนั้น`
          : `This card belongs to ${data.member.fullName || data.member.id}. Open that member account instead.`);

      setProfile((current) => ({ ...current, fullName: card.fullName,
        identityNumber: card.citizenId, birthDate: card.birthDate || current.birthDate,
        countryCode: 'TH' }));
      setNewPhoto(''); setRemovePhoto(false);
      setCardPhoto(card.photo); setPhotoVersion((version) => version + 1);
      setCardImported(true);
    } catch (err) {
      setCardError(err.message || (th ? 'นำเข้าไฟล์บัตรไม่ได้' : 'Unable to import card file.'));
    } finally {
      setImportingCard(false);
    }
  }

  async function importAndSaveFromReader() {
    if (!profile || readerBusy || saving || importingCard) return;
    setReaderBusy(true); setReaderError(''); setReaderSuccess(''); setError(''); setSuccess(''); setCardError('');
    try {
      const card = await readLatestDesktopCard();
      const freshResponse = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_member', memberId })
      });
      const freshData = await freshResponse.json();
      if (!freshResponse.ok || !freshData?.success) throw Error(freshData?.message || 'Unable to check member profile');
      const fresh = freshData.profile;
      const currentId = String(fresh.identityNumber || '').replace(/[\s-]+/g, '').toUpperCase();
      if (currentId && currentId !== card.citizenId)
        throw Error(th ? 'เลขบัตรไม่ตรงกับสมาชิกที่เปิดอยู่ จึงไม่ได้บันทึกข้อมูล' : 'The card does not match the selected member. Nothing was saved.');

      const lookupResponse = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', citizenId: card.citizenId })
      });
      const lookup = await lookupResponse.json();
      if (!lookupResponse.ok || !lookup?.success) throw Error(lookup?.message || 'Unable to check card identity');
      if (lookup.member && String(lookup.member.id) !== String(memberId))
        throw Error(th ? 'เลขบัตรนี้ผูกกับสมาชิกบัญชีอื่นอยู่แล้ว จึงไม่ได้บันทึกข้อมูล' : 'This card belongs to another member. Nothing was saved.');

      const approved = window.confirm((th ? 'ตรวจบัตรกับเจ้าของแล้วใช่ไหม?\nสมาชิก: ' : 'Have you checked the card with its owner?\nMember: ') +
        fresh.fullName + '\n' + (th ? 'ข้อมูลจากบัตร: ' : 'Card name: ') + card.fullName +
        ' (' + card.citizenId.slice(-4) + ')\n' +
        (th ? 'กดตกลงเพื่อนำเข้าและบันทึกทันที' : 'Press OK to import and save now.'));
      if (!approved) return;

      const nextBirthDate = card.birthDate || fresh.birthDate;
      const nextPicture = card.photo || '';
      const response = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_edit_member', memberId,
          fullName: card.fullName, identityNumber: card.citizenId,
          birthDate: nextBirthDate, countryCode: 'TH',
          picture: nextPicture, removePhoto: false,
          username: fresh.username, password: '' })
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to save member');
      setProfile({ ...fresh, fullName: card.fullName, identityNumber: card.citizenId,
        birthDate: nextBirthDate, countryCode: 'TH',
        profileImage: nextPicture || fresh.profileImage,
        picture: nextPicture || fresh.picture,
        username: data.username, hasPasswordAccount: Boolean(data.username) });
      setNewPhoto(''); setRemovePhoto(false); setCardPhoto('');
      setCardImported(false); setCardReviewed(false); setPhotoVersion((version) => version + 1);
      setReaderSuccess(th ? 'นำเข้าข้อมูลจาก Card Reader และบันทึกโปรไฟล์แล้ว' : 'Card Reader data imported and profile saved.');
      onSaved?.(data.member);
    } catch (err) {
      setReaderError(err.message || (th ? 'นำเข้าข้อมูลจาก Card Reader ไม่สำเร็จ' : 'Unable to import from Card Reader.'));
    } finally {
      setReaderBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!profile || saving || importingCard || readerBusy) return;
    setError(''); setSuccess(''); setIssuedPassword('');
    if (cardImported && !cardReviewed) {
      setError(th ? 'กรุณาตรวจข้อมูลบัตรกับเจ้าของก่อนบันทึก' : 'Please review the card details with the member before saving.');
      return;
    }
    if (cardPhoto && !newPhoto) {
      setError(th ? 'รูปจากบัตรยังไม่พร้อม กรุณารอสักครู่หรือเลือกรูปใหม่' : 'The card photo is not ready. Wait a moment or choose another photo.');
      return;
    }
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
      setCardPhoto(''); setCardImported(false); setCardReviewed(false);
      setCardError('');
      setPhotoVersion((version) => version + 1);
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
    <div style={{ margin: '12px 0', padding: 12, borderRadius: 9, background: '#eef5ed' }}>
      <button type="button" disabled={readerBusy || saving || importingCard} onClick={importAndSaveFromReader}
        style={{ minHeight: 44, padding: '9px 15px', border: 0, borderRadius: 9, background: '#405c4c', color: '#fff', fontWeight: 700 }}>
        {readerBusy ? (th ? 'กำลังอ่านและตรวจบัตร...' : 'Reading and checking card...') : (th ? 'นำเข้าและบันทึกจาก Card Reader' : 'Import and save from Card Reader')}
      </button>
      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#665d51' }}>{th
        ? 'เปิดแอปสาริบุตรบนคอมพิวเตอร์ก่อน หากอ่านบัตรด้วยมือถือ ให้กดส่งข้อมูลจนมือถือแจ้งว่าสำเร็จ แล้วกดปุ่มนี้ภายใน 2 นาที'
        : 'Run Saributr Card Reader on this computer. If reading with a phone, send the card to the desktop app first, then click here within two minutes.'}</p>
      {readerError && <p role="alert" style={{ margin: '8px 0 0', color: '#a23f34', fontWeight: 700 }}>{readerError}</p>}
      {readerSuccess && <p role="status" style={{ margin: '8px 0 0', color: '#245635', fontWeight: 700 }}>{readerSuccess}</p>}
    </div>
    <label style={field}>{th ? 'นำเข้า Card Reader เพื่ออัปเดตสมาชิกเดิม (.json)' : 'Import Card Reader data for this member (.json)'}
      <input type="file" accept=".json,application/json" disabled={importingCard || saving || readerBusy}
        onChange={(event) => { importCard(event.target.files?.[0]); event.target.value = ''; }} />
    </label>
    {importingCard && <p role="status">{th ? 'กำลังตรวจเลขบัตรกับสมาชิกในระบบ...' : 'Checking this card against member records...'}</p>}
    {cardError && <p role="alert" style={{ color: '#a23f34' }}>{cardError}</p>}
    {cardImported && <div style={{ margin: '12px 0', padding: 12, borderRadius: 9, background: '#f5f1e8' }}>
      <strong>{th ? 'นำเข้าข้อมูลแล้ว ยังไม่ได้บันทึก' : 'Card imported; changes are not saved yet.'}</strong>
      <p style={{ margin: '6px 0', fontSize: 13 }}>{th ? 'ตรวจชื่อ เลขบัตร วันเกิด และรูปด้านล่างก่อนบันทึก ชื่อผู้ใช้ รหัสผ่าน และบัญชี LINE/Telegram ยังใช้ของเดิม' : 'Review the name, ID, birth date and photo below. The username, password and LINE/Telegram connections stay as they are.'}</p>
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
        <input type="checkbox" checked={cardReviewed} onChange={(event) => setCardReviewed(event.target.checked)} />
        {th ? 'ตรวจบัตรและยืนยันว่าเป็นสมาชิกที่เลือกอยู่แล้ว' : 'I checked that this card belongs to the selected member.'}
      </label>
    </div>}
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
    <MemberPhotoEditor key={photoVersion} initialPhoto={cardPhoto} lang={lang} onChange={(photo) => { setNewPhoto(photo); if (photo) setRemovePhoto(false); }} />
    {cardPhoto && <p role="status" style={{ color: '#805a20' }}>{newPhoto
      ? (th ? 'รูปจากบัตรพร้อมบันทึก สามารถเลื่อนหรือซูมเพิ่มได้' : 'Card photo is ready. You can adjust the crop.')
      : (th ? 'กำลังเตรียมรูปจากบัตร กรุณารอสักครู่' : 'Preparing the card photo...')}</p>}
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
    <button type="submit" disabled={saving || importingCard || readerBusy || (cardImported && (!cardReviewed || Boolean(cardPhoto && !newPhoto)))} style={{ minHeight: 44, border: 0, borderRadius: 9, background: '#405c4c', color: '#fff', padding: '9px 15px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
      {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึกโปรไฟล์และบัญชี' : 'Save profile and account')}
    </button>
  </form>;
}
