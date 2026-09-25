import React, { useEffect, useState } from 'react';
import MemberPhotoEditor from './MemberPhotoEditor';
import { parseCardFile } from './parseCardFile';
import { readLatestDesktopCard } from '../lib/cardReaderBridge';
import { structuredAddress } from '../lib/thaiAddress.js';
import ThaiAddressFields from './ThaiAddressFields.jsx';
import './AdminMemberProfileEditor.css';

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
        fullNameEn: card.fullNameEn || current.fullNameEn,
        memberAddress: card.memberAddress || current.memberAddress,
        ...structuredAddress(card.memberAddress ? card : current),
        addressNeedsReview: card.addressNeedsReview,
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

      if (card.addressNeedsReview) throw Error(th
        ? 'แยกที่อยู่จากบัตรไม่ครบ กรุณานำเข้าไฟล์แล้วเลือกจังหวัด อำเภอ ตำบลด้วยตนเองก่อนบันทึก'
        : 'Card address could not be matched. Import the JSON and select the address manually.');
      const nextBirthDate = card.birthDate || fresh.birthDate;
      const nextPicture = card.photo || '';
      const response = await fetch('/api/donation-profile', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_edit_member', memberId,
          fullName: card.fullName, fullNameEn: card.fullNameEn || fresh.fullNameEn || '',
          memberAddress: card.memberAddress || fresh.memberAddress || '',
          ...structuredAddress(card.memberAddress ? card : fresh), identityNumber: card.citizenId,
          birthDate: nextBirthDate, countryCode: 'TH',
          picture: nextPicture, removePhoto: false,
          username: fresh.username, password: '' })
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to save member');
      setProfile({ ...fresh, fullName: card.fullName,
        fullNameEn: card.fullNameEn || fresh.fullNameEn || '',
        memberAddress: card.memberAddress || fresh.memberAddress || '',
        ...structuredAddress(card.memberAddress ? card : fresh), identityNumber: card.citizenId,
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
    if (cardImported && profile.addressNeedsReview && !profile.addressSubdistrictId) {
      setError(th ? 'กรุณาเลือกจังหวัด อำเภอ ตำบล และตรวจบ้านเลขที่จากบัตรก่อนบันทึก' : 'Select the card address areas before saving.');
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
          fullName: profile.fullName, fullNameEn: profile.fullNameEn || '',
          memberAddress: profile.memberAddress || '', ...structuredAddress(profile.countryCode === 'TH' ? profile : {}),
          identityNumber: profile.identityNumber,
          birthDate: profile.birthDate, countryCode: profile.countryCode,
          picture: newPhoto, removePhoto, username: profile.username, password })
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw Error(data?.message || 'Unable to save member');
      setProfile((current) => ({ ...current, addressNeedsReview: false,
        hasPasswordAccount: Boolean(data.username),
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

  return <form onSubmit={save} className="admin-profile-form">
    <div className="admin-profile-grid">
      <div className="admin-profile-primary">
        <section className="admin-profile-card" aria-labelledby="admin-profile-personal-title">
          <div className="admin-profile-section-heading">
            <span className="admin-profile-step" aria-hidden="true">01</span>
            <div>
              <h3 id="admin-profile-personal-title">{th ? 'ข้อมูลส่วนตัว' : 'Personal details'}</h3>
              <p>{th ? 'ตรวจชื่อและข้อมูลยืนยันตัวตนให้ตรงกับสมาชิก' : 'Confirm the member’s name and identity details.'}</p>
            </div>
          </div>
          <div className="admin-profile-fields admin-profile-fields--two">
            <label className="admin-profile-field admin-profile-span-all">
              <span>{th ? 'ชื่อและนามสกุลภาษาไทย' : 'Thai full name'} <span className="admin-profile-required">*</span></span>
              <input required maxLength={200} value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} autoComplete="name" />
            </label>
            <label className="admin-profile-field admin-profile-span-all">
              <span>{th ? 'ชื่อและนามสกุลภาษาอังกฤษ' : 'English full name'}</span>
              <input maxLength={200} value={profile.fullNameEn || ''} onChange={(e) => update('fullNameEn', e.target.value)} />
            </label>
            <label className="admin-profile-field">
              <span>{th ? 'วันเกิด (ค.ศ.)' : 'Date of birth'}</span>
              <input type="date" value={profile.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
            </label>
            <label className="admin-profile-field">
              <span>{th ? 'รหัสประเทศ' : 'Country code'} <span className="admin-profile-required">*</span></span>
              <input required maxLength={2} pattern="[a-zA-Z]{2}" value={profile.countryCode} onChange={(e) => update('countryCode', e.target.value.toUpperCase())} placeholder="TH" />
            </label>
            <label className="admin-profile-field admin-profile-span-all">
              <span>{th ? 'เลขบัตรประชาชน 13 หลัก หรือพาสปอร์ต' : 'National ID or passport'}</span>
              <input autoComplete="off" maxLength={20} value={profile.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} />
              <small>{th ? 'เว้นว่างเพื่อลบหมายเลขเดิม' : 'Leave blank to remove the saved number.'}</small>
            </label>
          </div>
        </section>

        <section className="admin-profile-card admin-profile-address" aria-labelledby="admin-profile-address-title">
          <div className="admin-profile-section-heading">
            <span className="admin-profile-step" aria-hidden="true">02</span>
            <div>
              <h3 id="admin-profile-address-title">{th ? 'ที่อยู่' : 'Address'}</h3>
              <p>{th ? 'เลือกจังหวัด อำเภอ และตำบลตามลำดับ' : 'Choose province, district and subdistrict in order.'}</p>
            </div>
          </div>
          {profile.countryCode === 'TH' ? <ThaiAddressFields lang={lang} value={profile}
            legacyAddress={profile.memberAddress || ''}
            onChange={(patch) => { setProfile((current) => ({ ...current, ...patch })); if (cardImported) setCardReviewed(false); }} /> :
            <label className="admin-profile-field">
              <span>{th ? 'ที่อยู่ต่างประเทศ' : 'International address'}</span>
              <textarea rows={4} maxLength={500} value={profile.memberAddress || ''} onChange={(e) => update('memberAddress', e.target.value)} />
            </label>}
        </section>
      </div>

      <aside className="admin-profile-aside" aria-label={th ? 'เครื่องมือจัดการสมาชิก' : 'Member tools'}>
        <section className="admin-profile-card admin-profile-import" aria-labelledby="admin-profile-card-title">
          <div className="admin-profile-section-heading">
            <span className="admin-profile-step" aria-hidden="true">03</span>
            <div>
              <h3 id="admin-profile-card-title">{th ? 'นำเข้าข้อมูลจากบัตร' : 'Import ID card'}</h3>
              <p>{th ? 'อ่านบัตรแล้วตรวจข้อมูลก่อนบันทึก' : 'Read and review card details.'}</p>
            </div>
          </div>
          <button className="admin-profile-reader-button" type="button" disabled={readerBusy || saving || importingCard} onClick={importAndSaveFromReader}>
            {readerBusy ? (th ? 'กำลังอ่านและตรวจบัตร...' : 'Reading and checking card...') : (th ? 'นำเข้าและบันทึกจาก Card Reader' : 'Import and save from Card Reader')}
          </button>
          <p className="admin-profile-help">{th
            ? 'เปิดแอปสาริบุตรบนคอมพิวเตอร์ หากอ่านด้วยมือถือ ให้ส่งข้อมูลมาที่คอมพิวเตอร์ก่อน แล้วกดปุ่มนี้ภายใน 2 นาที'
            : 'Open Saributr on the computer. For phone reads, send the card to the computer first, then use this button within two minutes.'}</p>
          {readerError && <p className="admin-profile-message admin-profile-message--error" role="alert">{readerError}</p>}
          {readerSuccess && <p className="admin-profile-message admin-profile-message--success" role="status">{readerSuccess}</p>}
          <div className="admin-profile-divider" />
          <label className="admin-profile-field">
            <span>{th ? 'หรือเลือกไฟล์ JSON จากแอปอ่านบัตร' : 'Or import a card JSON file'}</span>
            <input type="file" accept=".json,application/json" disabled={importingCard || saving || readerBusy}
              onChange={(event) => { importCard(event.target.files?.[0]); event.target.value = ''; }} />
          </label>
          {importingCard && <p role="status" className="admin-profile-help">{th ? 'กำลังตรวจเลขบัตรกับสมาชิก...' : 'Checking the cardholder...'}</p>}
          {cardError && <p role="alert" className="admin-profile-message admin-profile-message--error">{cardError}</p>}
          {profile.addressNeedsReview && <p role="status" className="admin-profile-message admin-profile-message--warning">
            {th ? 'ที่อยู่จากบัตรไม่ตรงกับรายการพื้นที่ กรุณาเลือกพื้นที่ด้วยตนเอง' : 'Please select the card address areas manually.'}
          </p>}
          {cardImported && <div className="admin-profile-review">
            <strong>{th ? 'นำเข้าแล้ว · ยังไม่ได้บันทึก' : 'Imported · not saved yet'}</strong>
            <p>{th ? 'ตรวจชื่อ เลขบัตร วันเกิด ที่อยู่ และรูปก่อนบันทึก' : 'Review the name, ID, birth date, address and photo.'}</p>
            <label>
              <input type="checkbox" checked={cardReviewed} onChange={(event) => setCardReviewed(event.target.checked)} />
              <span>{th ? 'ตรวจแล้วว่าเป็นสมาชิกที่เลือก' : 'I confirmed this card belongs to this member.'}</span>
            </label>
          </div>}
        </section>

        <section className="admin-profile-card" aria-labelledby="admin-profile-photo-title">
          <div className="admin-profile-section-heading">
            <span className="admin-profile-step" aria-hidden="true">04</span>
            <div>
              <h3 id="admin-profile-photo-title">{th ? 'รูปโปรไฟล์' : 'Profile photo'}</h3>
              <p>{th ? 'เลือกรูปหรือใช้รูปจากบัตร' : 'Choose or crop a card photo.'}</p>
            </div>
          </div>
          {profile.picture && !removePhoto && !newPhoto && <div className="admin-profile-current-photo">
            <img src={profile.picture} alt={th ? 'รูปปัจจุบัน' : 'Current photo'} />
            <span>{th ? 'รูปปัจจุบัน' : 'Current photo'}</span>
          </div>}
          <MemberPhotoEditor key={photoVersion} initialPhoto={cardPhoto} lang={lang} onChange={(photo) => { setNewPhoto(photo); if (photo) setRemovePhoto(false); }} />
          {cardPhoto && <p role="status" className="admin-profile-help">{newPhoto
            ? (th ? 'รูปจากบัตรพร้อมบันทึก ปรับตำแหน่งหรือซูมได้' : 'Card photo is ready. Adjust the crop if needed.')
            : (th ? 'กำลังเตรียมรูปจากบัตร' : 'Preparing the card photo...')}</p>}
          {profile.profileImage && !newPhoto && <label className="admin-profile-check">
            <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
            <span>{th ? 'ลบรูปที่วัดอัปโหลด' : 'Remove uploaded photo'}</span>
          </label>}
        </section>

        <section className="admin-profile-card" aria-labelledby="admin-profile-account-title">
          <div className="admin-profile-section-heading">
            <span className="admin-profile-step" aria-hidden="true">05</span>
            <div>
              <h3 id="admin-profile-account-title">{th ? 'บัญชีเข้าสู่ระบบ' : 'Login account'}</h3>
              <p>{th ? 'เว้นรหัสผ่านใหม่ว่างไว้เพื่อคงรหัสเดิม' : 'Leave the new password blank to keep it.'}</p>
            </div>
          </div>
          <div className="admin-profile-fields">
            <label className="admin-profile-field">
              <span>{th ? 'ชื่อผู้ใช้' : 'Username'}</span>
              <input autoComplete="off" pattern="[a-z][a-z0-9._-]{3,31}" value={profile.username} onChange={(e) => update('username', e.target.value.toLowerCase())} placeholder="example.member" />
            </label>
            <label className="admin-profile-field">
              <span>{th ? 'รหัสผ่านใหม่' : 'New password'}</span>
              <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={profile.hasPasswordAccount ? (th ? 'เว้นว่างเพื่อคงรหัสเดิม' : 'Leave blank to keep current password') : ''} />
              <small>{th ? 'อย่างน้อย 12 ตัวอักษร' : 'At least 12 characters'}</small>
            </label>
          </div>
        </section>
      </aside>
    </div>

    <div className="admin-profile-actions">
      <div className="admin-profile-action-feedback">
        {error && <p role="alert" className="admin-profile-message admin-profile-message--error">{error}</p>}
        {success && <p role="status" className="admin-profile-message admin-profile-message--success">{success}</p>}
        {issuedPassword && <p role="status" className="admin-profile-message admin-profile-message--success">
          {th ? 'แจ้งรหัสผ่านให้เจ้าของบัญชีโดยตรง แล้วกดซ่อนรหัสนี้' : 'Give the password directly to the member, then hide it.'}<br />
          <strong>{issuedPassword}</strong>{' '}
          <button type="button" onClick={() => setIssuedPassword('')}>{th ? 'ซ่อนรหัส' : 'Hide password'}</button>
        </p>}
        {!error && !success && !issuedPassword && <span>{th ? 'ตรวจข้อมูลก่อนกดบันทึก' : 'Review the details before saving.'}</span>}
      </div>
      <button className="admin-profile-save" type="submit" disabled={saving || importingCard || readerBusy || (cardImported && (!cardReviewed || Boolean(cardPhoto && !newPhoto)))}>
        {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึกข้อมูลสมาชิก' : 'Save member profile')}
      </button>
    </div>
  </form>;
}
