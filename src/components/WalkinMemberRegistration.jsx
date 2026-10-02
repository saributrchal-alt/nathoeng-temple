import React, { useEffect, useMemo, useRef, useState } from 'react';
import MemberPhotoEditor from './MemberPhotoEditor';
import ThaiAddressFields from './ThaiAddressFields';
import { parseCardFile } from './parseCardFile';
import { readLatestDesktopCard, readLatestMobileCard, startMobileCardReader,
  pendingMobileCardRequest, MOBILE_CARD_REQUEST_KEY } from '../lib/cardReaderBridge';
import { emptyThaiAddress, structuredAddress, validateThaiAddress } from '../lib/thaiAddress.js';
import './WalkinMemberRegistration.css';

const blankForm = () => ({ fullName: '', fullNameEn: '', citizenId: '', birthDate: '', countryCode: 'TH',
  memberAddress: '', ...emptyThaiAddress, picture: '', username: '', password: '', memberId: '', hasPasswordAccount: false });
const isMobileDevice = () => typeof navigator !== 'undefined' &&
  (navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

async function request(body) {
  const response = await fetch('/api/donation-profile', { method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) throw Error(result.message || `HTTP ${response.status}`);
  return result;
}

export default function WalkinMemberRegistration({ lang = 'th', members = [], onSaved, onDonation }) {
  const th = lang === 'th';
  const [mode, setMode] = useState(() => pendingMobileCardRequest() ? 'reader' : '');
  const [form, setForm] = useState(blankForm);
  const [cardPhoto, setCardPhoto] = useState('');
  const [photoVersion, setPhotoVersion] = useState(0);
  const [cardEvidence, setCardEvidence] = useState(null);
  const [cardImported, setCardImported] = useState(false);
  const [addressNeedsReview, setAddressNeedsReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const busyRef = useRef(false);
  const generation = useRef(0);
  const mobile = isMobileDevice();
  const android = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  useEffect(() => () => { generation.current += 1; }, []);
  const update = (patch) => { setForm((old) => ({ ...old, ...patch })); setReviewed(false); };
  const similar = useMemo(() => {
    const query = form.fullName.toLocaleLowerCase().trim();
    if (query.length < 3 || form.memberId) return [];
    return members.filter((m) => String(m.full_name || m.display_name || '').toLocaleLowerCase().includes(query)).slice(0, 8);
  }, [members, form.fullName, form.memberId]);

  async function run(operation) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    const token = generation.current;
    try { await operation(() => token === generation.current); }
    catch (err) { if (token === generation.current) setError(err.message); }
    finally { if (token === generation.current) { busyRef.current = false; setBusy(false); } }
  }

  async function existingProfile(memberId) {
    return (await request({ action: 'admin_member', memberId })).profile;
  }
  const fromExisting = (p) => ({ ...blankForm(), ...structuredAddress(p), memberId: p.memberId,
    fullName: p.fullName, fullNameEn: p.fullNameEn || '', citizenId: p.identityNumber || '',
    birthDate: p.birthDate || '', countryCode: p.countryCode || 'TH', memberAddress: p.memberAddress || '',
    username: p.username || '', hasPasswordAccount: p.hasPasswordAccount });

  async function selectExisting(memberId) {
    await run(async (active) => {
      const profile = await existingProfile(memberId);
      if (!active()) return;
      setForm(fromExisting(profile)); setCardPhoto(''); setCardImported(false); setCardEvidence(null);
      setAddressNeedsReview(false); setReviewed(false); setPhotoVersion((v) => v + 1);
    });
  }

  async function receiveCard(card, active) {
    const lookup = await request({ action: 'lookup', citizenId: card.citizenId });
    const previous = lookup.member ? fromExisting(await existingProfile(lookup.member.id)) : blankForm();
    if (!active()) return null;
    const next = { ...previous, fullName: card.fullName, citizenId: card.citizenId,
      fullNameEn: card.fullNameEn || previous.fullNameEn, birthDate: card.birthDate || previous.birthDate,
      countryCode: 'TH', memberAddress: card.memberAddress || previous.memberAddress,
      ...structuredAddress(card.memberAddress ? card : previous), picture: '' };
    setForm(next);
    setCardPhoto(card.photo); setPhotoVersion((v) => v + 1);
    setCardImported(true); setReviewed(false); setAddressNeedsReview(Boolean(card.addressNeedsReview));
    setCardEvidence({ citizenId: card.citizenId, fullName: card.fullName, birthDate: card.birthDate || previous.birthDate });
    return next;
  }

  async function importCard(file) {
    if (!file) return;
    await run(async (active) => {
      if (file.size > 200000) throw Error(th ? 'ไฟล์ข้อมูลบัตรใหญ่เกินกำหนด' : 'Card file is too large.');
      await receiveCard(parseCardFile(await file.text()), active);
    });
  }
  async function readDesktopCard() {
    await run(async (active) => { await receiveCard(await readLatestDesktopCard(), active); });
  }
  async function receiveMobileAndSave(nonce) {
    await run(async (active) => {
      const card = await readLatestMobileCard(nonce);
      const next = await receiveCard(card, active);
      if (!next || !active()) return;
      if (!next.memberId) {
        const random = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
        next.username = 'member.' + random().slice(0, 16); next.password = random();
      }
      next.picture = card.photo;
      setForm(next); setReviewed(true);
      if (card.addressNeedsReview) throw Error(th ? 'กรุณาเลือกจังหวัด อำเภอ ตำบลจากข้อมูลบัตรให้ครบก่อนบันทึก' : 'Review and select the card address before saving.');
      const address = validateThaiAddress(next);
      const result = await request({ action: next.memberId ? 'admin_edit_member' : 'register', ...next, ...address,
        identityNumber: next.citizenId, registrationDetails: true, cardReviewed: true,
        cardEvidence: { citizenId: card.citizenId, fullName: card.fullName, birthDate: next.birthDate } });
      if (!active()) return;
      setCreated({ id: result.memberId || next.memberId, name: next.fullName, username: next.username, password: next.password });
      setForm((current) => ({ ...current, password: '' })); setReviewed(false); onSaved?.();
    });
  }
  useEffect(() => {
    const nonce = pendingMobileCardRequest();
    if (!nonce || !mobile) return undefined;
    // Delay until after React's development effect cleanup; consume the explicit request once.
    const timer = setTimeout(() => {
      localStorage.removeItem(MOBILE_CARD_REQUEST_KEY);
      const url = new URL(window.location.href); url.searchParams.delete('reader_nonce');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      receiveMobileAndSave(nonce);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  async function checkIdentity() {
    if (!/^\d{13}$/.test(form.citizenId) || form.memberId) return;
    await run(async (active) => {
      const lookup = await request({ action: 'lookup', citizenId: form.citizenId });
      if (!lookup.member) return;
      const previous = fromExisting(await existingProfile(lookup.member.id));
      if (active()) {
        setForm(previous); setCardPhoto(''); setCardEvidence(null); setCardImported(false);
        setAddressNeedsReview(false); setReviewed(false); setPhotoVersion((v) => v + 1);
      }
    });
  }
  async function save(event) {
    event.preventDefault();
    if (busyRef.current) return;
    if (!reviewed) { setError(th ? 'กรุณายืนยันว่าตรวจข้อมูลกับเจ้าของและตรวจสมาชิกเดิมแล้ว' : 'Confirm the details and existing members first.'); return; }
    if (cardPhoto && !form.picture) { setError(th ? 'รูปจากบัตรยังไม่พร้อม กรุณารอสักครู่หรือเลือกรูปใหม่' : 'Wait for the card photo or choose another photo.'); return; }
    if (addressNeedsReview && !form.addressSubdistrictId) { setError(th ? 'กรุณาตรวจที่อยู่จากบัตรและเลือกจังหวัด อำเภอ ตำบลให้ครบ' : 'Review the card address and select all areas.'); return; }
    await run(async (active) => {
      const address = validateThaiAddress(form.countryCode === 'TH' ? form : {});
      const result = await request({ action: form.memberId ? 'admin_edit_member' : 'register', ...form,
        ...address, identityNumber: form.citizenId, registrationDetails: true,
        cardReviewed: cardImported && reviewed, cardEvidence });
      if (!active()) return;
      setCreated({ id: result.memberId || form.memberId, name: form.fullName,
        username: form.username, password: form.password });
      setForm((current) => ({ ...current, password: '' })); setReviewed(false);
      onSaved?.();
    });
  }
  function reset() {
    if (busyRef.current) return;
    generation.current += 1;
    setMode(''); setForm(blankForm()); setCardPhoto(''); setCardEvidence(null); setCardImported(false);
    setAddressNeedsReview(false); setReviewed(false); setCreated(null); setError(''); setPhotoVersion((v) => v + 1);
  }
  const showForm = mode === 'manual' || (mode === 'reader' && cardImported);
  return <section className="member-registration">
    <h2>{th ? 'เพิ่มสมาชิกใหม่' : 'Add member'}</h2>
    {created ? <div role="status" className="member-registration__success">
      <strong>{th ? 'บันทึกสมาชิกแล้ว' : 'Member saved'}: {created.name}</strong>
      {created.password && <p>{th ? 'แจ้งข้อมูลเข้าใช้งานให้เจ้าของบัญชีโดยตรง แล้วกด “คนถัดไป” เพื่อลบข้อมูลนี้จากหน้าจอ' : 'Give the credentials directly to the member, then clear this screen.'}<br />{th ? 'ชื่อผู้ใช้' : 'Username'}: <strong>{created.username}</strong><br />{th ? 'รหัสผ่าน' : 'Password'}: <strong>{created.password}</strong></p>}
      <button type="button" onClick={() => onDonation?.(created.id)}>{th ? 'ไปบันทึกรายการทำบุญ' : 'Record donation'}</button>{' '}
      <button type="button" onClick={reset}>{th ? 'คนถัดไป' : 'Next person'}</button>
    </div> : <>
      <p>{th ? 'เลือกวิธีเพิ่มข้อมูลสมาชิก' : 'Choose how to enter member details.'}</p>
      <div className="member-registration__choices" role="group" aria-label={th ? 'วิธีเพิ่มสมาชิก' : 'Registration method'}>
        <button type="button" aria-pressed={mode === 'manual'} disabled={busy} onClick={() => { setMode('manual'); setError(''); }}>
          <strong>{th ? 'กรอกโดยเจ้าหน้าที่' : 'Staff entry'}</strong><span>{th ? 'กรอกข้อมูลครบทุกช่อง หรือนำเข้าไฟล์ .json' : 'Complete form or import a .json file'}</span>
        </button>
        <button type="button" aria-pressed={mode === 'reader'} disabled={busy} onClick={() => { setMode('reader'); setError(''); }}>
          <strong>{th ? 'เครื่องอ่านบัตร' : 'Card reader'}</strong><span>{th ? 'รับข้อมูลจากเครื่องอ่านบัตรประชาชน' : 'Receive details from the ID card reader'}</span>
        </button>
      </div>
      {mode === 'reader' && <div className="member-registration__tools">
        {mobile ? <>
          <button type="button" disabled={busy || !android} onClick={() => { try { startMobileCardReader(); } catch { setError(th ? 'เปิดแอปอ่านบัตรไม่ได้ กรุณาใช้ Chrome บน Android และติดตั้งแอป 1.5.4' : 'Use Chrome on Android with reader app 1.5.4.'); } }}>{th ? 'อ่านบัตรและบันทึก' : 'Read card and save'}</button>
          <p className="member-registration__hint">{android ? (th ? 'Android: ติดตั้งแอปสาริบุตร 1.5.4 และต่อเครื่องอ่านผ่าน OTG กดอ่านบัตรแล้วตรวจข้อมูลในแอป เมื่อยืนยันจะกลับมาบันทึกที่หน้านี้' : 'Android: use reader app 1.5.4 with USB OTG. Review the card in the app; confirmation returns here and saves.') : (th ? 'การอ่านบัตรโดยตรงรองรับ Android ผ่านแอปสาริบุตร สำหรับ iPhone ให้ใช้กรอกโดยเจ้าหน้าที่' : 'Direct card reading uses the Android app. On iPhone, use Staff entry.')}</p>
          <a href="/downloads/Saributr-Card-Reader-1.5.4-Android.apk">{th ? 'ดาวน์โหลดแอปอ่านบัตร Android 1.5.4' : 'Download Android reader 1.5.4'}</a>
        </> : <>
          <p>{th ? 'เปิดแอปสาริบุตรบนคอมพิวเตอร์ แล้วอ่านบัตรก่อนกดรับข้อมูลภายใน 2 นาที' : 'Open the desktop reader app, read the card, and receive its details within 2 minutes.'}</p>
          <button type="button" disabled={busy} onClick={readDesktopCard}>{busy ? (th ? 'กำลังรับข้อมูล…' : 'Receiving…') : (th ? 'รับข้อมูลจากเครื่องอ่านบัตร' : 'Receive card reader data')}</button>
          <label className="member-registration__field">{th ? 'หรือรับไฟล์ .json ที่เครื่องอ่านบัตรส่งมา' : 'Or select the .json file from the reader'}
            <input type="file" accept=".json,application/json" disabled={busy} onChange={(e) => { importCard(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </>}
      </div>}
      {showForm && <form onSubmit={save}>
        <fieldset disabled={busy}>
          {mode === 'manual' && <label className="member-registration__field">{th ? 'นำเข้าข้อมูลสมาชิกจากไฟล์บัตร .json' : 'Import member details from a card .json file'}
            <input type="file" accept=".json,application/json" onChange={(e) => { importCard(e.target.files?.[0]); e.target.value = ''; }} />
          </label>}
          {cardImported && <p role="status">{th ? 'รับข้อมูลบัตรแล้ว กรุณาตรวจข้อมูลกับเจ้าของก่อนบันทึก' : 'Card received. Review the details with the member before saving.'}</p>}
          {form.memberId && <p role="status">{th ? 'พบสมาชิกเดิมแล้ว การบันทึกจะอัปเดตบัญชีนี้โดยไม่สร้างซ้ำ' : 'Existing member found. Saving updates this account.'}</p>}
          <div className="member-registration__grid">
            <label className="member-registration__field">{th ? 'ชื่อและนามสกุล' : 'Full name'}<input value={form.fullName} required minLength={2} maxLength={200} onChange={(e) => update({ fullName: e.target.value })} /></label>
            <label className="member-registration__field">{th ? 'ชื่อภาษาอังกฤษ' : 'English name'}<input value={form.fullNameEn} maxLength={200} onChange={(e) => update({ fullNameEn: e.target.value })} /></label>
            <label className="member-registration__field">{th ? 'เลขบัตรประชาชน / หนังสือเดินทาง (ถ้ามี)' : 'National ID / passport (optional)'}<input value={form.citizenId} maxLength={20} autoComplete="off" pattern="[0-9]{13}|[A-Za-z0-9]{5,20}" onChange={(e) => { update({ citizenId: e.target.value.replace(/[\s-]+/g, '').toUpperCase(), ...(form.memberId ? { memberId: '', username: '', password: '', hasPasswordAccount: false } : {}) }); }} onBlur={checkIdentity} /></label>
            <label className="member-registration__field">{th ? 'วันเกิด (ค.ศ.)' : 'Date of birth'}<input type="date" value={form.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => update({ birthDate: e.target.value })} /></label>
            <label className="member-registration__field">{th ? 'ประเทศ (รหัส 2 ตัว เช่น TH)' : 'Country (2-letter code, e.g. TH)'}<input required maxLength={2} pattern="[A-Za-z]{2}" value={form.countryCode} onChange={(e) => update({ countryCode: e.target.value.toUpperCase() })} /></label>
          </div>
          {similar.length > 0 && <div className="member-registration__tools"><p>{th ? 'พบชื่อใกล้เคียง โปรดตรวจสอบก่อนสร้างสมาชิกใหม่' : 'Similar names found. Check before creating a member.'}</p>{similar.map((m) => <button key={m.id} type="button" onClick={() => selectExisting(m.id)}>{m.full_name || m.display_name} · {String(m.id).slice(0, 8)}</button>)}</div>}
          <h3>{th ? 'ที่อยู่' : 'Address'}</h3>
          {form.countryCode === 'TH' ? <ThaiAddressFields value={form} lang={lang} legacyAddress={form.memberAddress} onChange={update} /> :
            <label className="member-registration__field">{th ? 'ที่อยู่ต่างประเทศ' : 'Address abroad'}<textarea rows={3} maxLength={500} value={form.memberAddress} onChange={(e) => update({ memberAddress: e.target.value })} /></label>}
          <h3>{th ? 'รูปสมาชิก' : 'Member photo'}</h3>
          <MemberPhotoEditor key={photoVersion} initialPhoto={cardPhoto} lang={lang} onChange={(picture) => setForm((current) => ({ ...current, picture }))} />
          <h3>{th ? 'ข้อมูลเข้าใช้งาน' : 'Account access'}</h3>
          <div className="member-registration__grid">
            <label className="member-registration__field">{th ? 'ชื่อผู้ใช้ (ไม่ต้องมีอีเมลหรือ LINE)' : 'Username (no email or LINE needed)'}<input value={form.username} autoComplete="off" pattern="[a-z][a-z0-9._-]{3,31}" maxLength={32} placeholder="example.member" onChange={(e) => update({ username: e.target.value.toLowerCase() })} required={!form.memberId || form.hasPasswordAccount} /></label>
            <label className="member-registration__field">{th ? (form.hasPasswordAccount ? 'รหัสผ่านใหม่ (เว้นว่างเพื่อใช้รหัสเดิม)' : 'รหัสผ่านอย่างน้อย 12 ตัวอักษร') : 'Password, at least 12 characters'}<input type="password" value={form.password} minLength={12} maxLength={128} autoComplete="new-password" onChange={(e) => update({ password: e.target.value })} required={Boolean(form.username) && !form.hasPasswordAccount} /></label>
          </div>
          <p className="member-registration__hint">{th ? 'แจ้งเจ้าของข้อมูลถึงการจัดเก็บข้อมูลเพื่อบัญชีสมาชิกและประวัติการทำบุญ พร้อมให้ตรวจทานข้อมูลก่อนบันทึก' : 'Explain the member and donation record purpose and review the details with the member.'}</p>
          <label className="member-registration__review"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />{th ? 'ตรวจสอบกับเจ้าของข้อมูลและตรวจรายชื่อสมาชิกเดิมแล้ว' : 'I checked the details with the member and reviewed existing records.'}</label>
          <button type="submit" className="member-registration__save">{busy ? (th ? 'กำลังบันทึก…' : 'Saving…') : (th ? 'บันทึกสมาชิก' : 'Save member')}</button>
        </fieldset>
      </form>}
      {busy && <p role="status">{th ? 'กำลังดำเนินการ…' : 'Working…'}</p>}
      {error && <p role="alert" className="member-registration__error">{error}</p>}
    </>}
  </section>;
}
