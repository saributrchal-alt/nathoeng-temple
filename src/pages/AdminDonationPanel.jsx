import React, { useMemo, useState } from 'react';

export default function AdminDonationPanel({
  lang,
  t,
  donationLoading,
  donationError,
  donationSearch,
  setDonationSearch,
  donationFilter,
  setDonationFilter,
  loadDonations,
  totalDonationAmount,
  donationMoneyCount,
  donationItemCount,
  filteredDonations,
  formatDonationDate,
  donationPurposeLabel
}) {
  const th = lang === 'th';

  const today = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

  const freshForm = () => ({
    donationType: 'money',
    ownerMode: 'general',
    ownerMemberId: '',
    donorName: '',
    amount: '',
    itemName: '',
    quantity: '',
    unit: '',
    purpose: 'general',
    customPurpose: '',
    receiptRequested: false,
    donationDate: today(),
    note: ''
  });

  const [mode, setMode] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(freshForm);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [members, setMembers] = useState([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [ownerReason, setOwnerReason] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationNote, setVerificationNote] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const input = {
    width: '100%',
    minHeight: 44,
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid #ddd3c6',
    borderRadius: 12,
    background: '#fff',
    font: 'inherit'
  };

  const label = {
    display: 'block',
    marginBottom: 6,
    color: '#5d554d',
    fontSize: 12,
    fontWeight: 800
  };

  const memberName = (m) =>
    m?.full_name || m?.display_name || (th ? 'สมาชิก' : 'Member');


  const safePurposeLabel = (item) => {
    const raw =
      String(item?.purpose || '')
        .trim()
        .toLowerCase();

    const custom =
      String(item?.custom_purpose || '')
        .trim();

    const groups = {
      general: [
        'general',
        'general_donation',
        'merit',
        'merit_making',
        'unspecified'
      ],
      utilities: [
        'utilities',
        'utility',
        'electricity_water',
        'water_electricity',
        'water_and_electricity'
      ],
      development: [
        'development',
        'monastery_development',
        'maintenance',
        'building_maintenance',
        'facility_development'
      ],
      custom: [
        'custom',
        'other',
        'specific',
        'specific_purpose'
      ]
    };

    if (groups.general.includes(raw)) {
      return th
        ? 'ทำบุญตามอัธยาศัยทางคณะสงฆ์'
        : 'General donation';
    }

    if (groups.utilities.includes(raw)) {
      return th
        ? 'เพื่อค่าน้ำ - ค่าไฟวัด'
        : 'Electricity & water expenses';
    }

    if (groups.development.includes(raw)) {
      return th
        ? 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ'
        : 'Monastery development & maintenance';
    }

    if (groups.custom.includes(raw)) {
      return custom ||
        (th
          ? 'วัตถุประสงค์อื่น'
          : 'Other purpose');
    }

    // If the database already contains a human-readable phrase,
    // keep it. Never expose snake_case/system codes to users.
    if (
      raw &&
      !raw.includes('_') &&
      !/^[a-z0-9-]+$/.test(raw)
    ) {
      return item.purpose;
    }

    const legacy =
      donationPurposeLabel?.(item);

    if (
      legacy &&
      legacy !== item?.purpose &&
      !String(legacy).includes('_')
    ) {
      return legacy;
    }

    return th
      ? 'วัตถุประสงค์อื่น'
      : 'Other purpose';
  };

  const currentOwnerName = (item) =>
    item?.owner_member_id
      ? (
          item?.owner_current_name ||
          (th ? 'สมาชิกในระบบ' : 'Registered member')
        )
      : (
          th
            ? 'บุคคลทั่วไป / ยังไม่ผูกสมาชิก'
            : 'Guest / not linked'
        );

  const matchingMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return members
      .filter((m) =>
        !q ||
        `${m.full_name || ''} ${m.display_name || ''}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 20);
  }, [members, memberSearch]);

  const selectedMember = members.find(
    (m) => m.id === form.ownerMemberId
  );

  const loadMembers = async () => {
    if (membersLoaded) return;
    const r = await fetch('/api/donation?scope=admin&resource=members', {
      credentials: 'include',
      cache: 'no-store'
    });
    const j = await r.json();
    if (!r.ok || !j.success) {
      throw new Error(j.message || (th ? 'โหลดรายชื่อสมาชิกไม่สำเร็จ' : 'Unable to load members'));
    }
    setMembers(Array.isArray(j.members) ? j.members : []);
    setMembersLoaded(true);
  };

  const close = () => {
    setMode('');
    setSelected(null);
    setFormError('');
    setOwnerReason('');
    setMemberSearch('');
    setVerificationStatus('pending');
    setVerificationNote('');
    setReceiptUrl('');
  };

  const openAdd = async () => {
    setForm(freshForm());
    setSelected(null);
    setFormError('');
    setMemberSearch('');
    setMode('add');
    try { await loadMembers(); } catch (e) { setFormError(e.message); }
  };

  const openEdit = (item) => {
    setSelected(item);
    setFormError('');
    setForm({
      donationType: item.donation_type,
      ownerMode: item.owner_member_id ? 'member' : 'general',
      ownerMemberId: item.owner_member_id || '',
      donorName: item.donor_name_snapshot || '',
      amount: item.amount ?? '',
      itemName: item.item_name || '',
      quantity: item.quantity ?? '',
      unit: item.unit || '',
      purpose: item.purpose || 'general',
      customPurpose: item.custom_purpose || '',
      receiptRequested: item.receipt_requested === true,
      donationDate: item.donation_date || today(),
      note: item.note || ''
    });
    setMode('edit');
  };

  const openOwner = async (item) => {
    setSelected(item);
    setForm((p) => ({ ...p, ownerMemberId: item.owner_member_id || '' }));
    setFormError('');
    setOwnerReason('');
    setMemberSearch('');
    setMode('owner');
    try { await loadMembers(); } catch (e) { setFormError(e.message); }
  };

  const post = async (body) => {
    const r = await fetch('/api/donation', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (!r.ok || !j.success) throw new Error(j.message || 'Unable to continue');
    return j;
  };

  const save = async () => {
    if (mode === 'add' && form.ownerMode === 'member' && !form.ownerMemberId) {
      setFormError(th ? 'กรุณาเลือกสมาชิก' : 'Please select a member');
      return;
    }

    setBusy(true);
    setFormError('');
    try {
      await post({
        action: mode === 'add' ? 'admin_create' : 'admin_update',
        donationId: selected?.id,
        donationType: form.donationType,
        ownerMemberId:
          mode === 'add' && form.ownerMode === 'member'
            ? form.ownerMemberId
            : null,
        donorName: form.donorName,
        amount: form.amount,
        itemName: form.itemName,
        quantity: form.quantity,
        unit: form.unit,
        purpose: form.purpose,
        customPurpose: form.customPurpose,
        receiptRequested: form.receiptRequested,
        donationDate: form.donationDate,
        note: form.note
      });
      await loadDonations();
      close();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const changeOwner = async () => {
    if (!form.ownerMemberId) {
      setFormError(th ? 'กรุณาเลือกเจ้าของใหม่' : 'Please select the new owner');
      return;
    }
    if (!window.confirm(th ? 'ยืนยันการเปลี่ยนเจ้าของรายการนี้หรือไม่?' : 'Confirm owner change?')) return;

    setBusy(true);
    setFormError('');
    try {
      await post({
        action: 'change_owner',
        donationId: selected.id,
        newOwnerMemberId: form.ownerMemberId,
        reason: ownerReason
      });
      await loadDonations();
      close();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const openVerify = (item) => {
    setSelected(item);
    setFormError('');
    setVerificationStatus(item.verification_status || 'pending');
    setVerificationNote(item.verification_note || '');
    setReceiptUrl(item.receipt_url || '');
    setMode('verify');
  };

  const saveVerification = async () => {
    if (!selected?.id) return;

    setBusy(true);
    setFormError('');

    try {
      await post({
        action: 'admin_verify',
        donationId: selected.id,
        verificationStatus,
        verificationNote
      });

      if (selected.receipt_requested === true) {
        await post({
          action: 'admin_receipt_url',
          donationId: selected.id,
          receiptUrl
        });
      }

      await loadDonations();
      close();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const sendLineNotification = async (item) => {
    if (!item?.id) return;

    const donorName = item.owner_member_id
      ? currentOwnerName(item)
      : (item.donor_name_snapshot || '');

    const confirmed = window.confirm(
      th
        ? `ยืนยันส่งข้อความ LINE OA แจ้ง ${donorName || 'ผู้บริจาค'} ว่ารายการตรวจสอบสมบูรณ์แล้วหรือไม่?`
        : `Send a LINE OA message to ${donorName || 'this donor'} confirming that the donation has been verified?`
    );

    if (!confirmed) return;

    setBusy(`line-${item.id}`);
    setFormError('');

    try {
      await post({
        action: 'admin_line_notify',
        donationId: item.id
      });

      window.alert(
        th
          ? 'ส่งข้อความแจ้งผู้บริจาคทาง LINE OA เรียบร้อยแล้ว สาธุ 🙏'
          : 'LINE OA notification sent successfully.'
      );
    } catch (e) {
      window.alert(
        th
          ? `ส่งข้อความ LINE ไม่สำเร็จ: ${e.message}`
          : `Unable to send LINE message: ${e.message}`
      );
    } finally {
      setBusy(false);
    }
  };

  const verificationMeta = (item) => {
    const status = item?.verification_status || 'pending';

    if (status === 'verified') {
      return {
        text: th ? 'รายการถูกต้อง' : 'Verified',
        fg: '#236b4a',
        bg: '#edf7f1',
        border: '#cce4d5'
      };
    }

    if (status === 'needs_correction') {
      return {
        text: th ? 'ต้องแก้ไขข้อมูล' : 'Needs correction',
        fg: '#9a3f35',
        bg: '#fff1ef',
        border: '#efcfc9'
      };
    }

    return {
      text: th ? 'รอตรวจสอบ' : 'Pending review',
      fg: '#8a611d',
      bg: '#fff7e7',
      border: '#ead6ad'
    };
  };

  const chooseMember = (m) => {
    setForm((p) => ({
      ...p,
      ownerMemberId: m.id,
      donorName: mode === 'add' ? memberName(m) : p.donorName
    }));
  };

  const purposeOptions = [
    ['general', th ? 'ทำบุญตามอัธยาศัยทางคณะสงฆ์' : 'General donation'],
    ['utilities', th ? 'เพื่อค่าน้ำ - ค่าไฟวัด' : 'Electricity & water expenses'],
    ['development', th ? 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ' : 'Monastery development & maintenance'],
    ['custom', th ? 'ระบุวัตถุประสงค์อื่น' : 'Other purpose']
  ].filter(([value]) => !(form.donationType === 'item' && value === 'utilities'));

  const smallBtn = {
    minHeight: 40,
    padding: '0 13px',
    border: '1px solid #d8ccb9',
    borderRadius: 11,
    background: '#fff',
    color: '#6e5a3b',
    fontWeight: 700,
    cursor: 'pointer'
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap',marginBottom:16}}>
        <div>
          <h3 style={{margin:0}}>{t.donationTitle}</h3>
          <div style={{marginTop:5,color:'#7a7066',fontSize:12}}>{t.donationSystemStart}</div>
        </div>
        <button type="button" onClick={openAdd} style={{minHeight:44,padding:'0 16px',border:0,borderRadius:12,background:'#9b7226',color:'#fff',fontWeight:800,cursor:'pointer'}}>
          ＋ {th ? 'เพิ่มรายการทำบุญ' : 'Add Donation'}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginBottom:14}}>
        {[
          [t.donationTotal, `${Number(totalDonationAmount || 0).toLocaleString()} ฿`],
          [t.donationMoneyCount, donationMoneyCount],
          [t.donationItemCount, donationItemCount]
        ].map(([k,v]) => (
          <div key={k} style={{padding:14,border:'1px solid #e4ddd2',borderRadius:16,background:'#fff'}}>
            <div style={{color:'#777',fontSize:11}}>{k}</div>
            <strong style={{display:'block',marginTop:4,color:'#8a611d',fontSize:20}}>{v}</strong>
          </div>
        ))}
      </div>

      <input type="search" value={donationSearch} onChange={(e)=>setDonationSearch(e.target.value)} placeholder={t.donationSearch} style={{...input,marginBottom:10}} />

      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
        {[['all',t.donationAll],['money',t.donationMoney],['item',t.donationItem]].map(([v,l])=>(
          <button key={v} type="button" onClick={()=>setDonationFilter(v)} style={{minHeight:40,padding:'0 14px',border:donationFilter===v?'1px solid #9b7226':'1px solid #ddd3c6',borderRadius:999,background:donationFilter===v?'#fff7e7':'#fff',color:donationFilter===v?'#8a611d':'#655d55',fontWeight:700,whiteSpace:'nowrap',cursor:'pointer'}}>{l}</button>
        ))}
      </div>

      {donationLoading ? (
        <div style={{padding:'34px 16px',textAlign:'center',color:'#777'}}>{t.loading}</div>
      ) : donationError ? (
        <div style={{padding:'24px 16px',textAlign:'center',color:'#a2463d'}}>{donationError}</div>
      ) : filteredDonations.length === 0 ? (
        <div style={{padding:'34px 16px',textAlign:'center',border:'1px solid #eee8df',borderRadius:16,background:'#fff',color:'#777'}}>{t.noDonations}</div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filteredDonations.map((item)=>{
            const money=item.donation_type==='money';
            return <article key={item.id} style={{border:'1px solid #e4ddd2',borderRadius:18,background:'#fff',padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                <div style={{minWidth:0}}>
                  <div style={{color:'#9b7226',fontSize:12,fontWeight:800}}>
                    {money?t.donationMoney:t.donationItem} · {item.owner_member_id?(th?'สมาชิก':'Member'):(th?'บุคคลทั่วไป':'Guest')}
                  </div>
                  <strong style={{display:'block',marginTop:3,color:'#302d29',fontSize:16,overflowWrap:'anywhere'}}>
                    {item.owner_member_id
                      ? currentOwnerName(item)
                      : (item.donor_name_snapshot || '—')}
                  </strong>

                  {item.owner_member_id &&
                    item.donor_name_snapshot &&
                    item.donor_name_snapshot !== item.owner_current_name && (
                    <div style={{marginTop:3,color:'#8a8178',fontSize:11,lineHeight:1.45}}>
                      {th
                        ? `ชื่อที่บันทึกตอนทำบุญ: ${item.donor_name_snapshot}`
                        : `Recorded donor name: ${item.donor_name_snapshot}`}
                    </div>
                  )}

                  <div style={{marginTop:4,color:'#888',fontSize:12}}>{formatDonationDate(item)}</div>
                </div>
                <div style={{flex:'0 0 auto',display:'grid',justifyItems:'end',gap:7}}>
                  {money && <strong style={{color:'#236b4a',fontSize:20}}>{Number(item.amount||0).toLocaleString()} ฿</strong>}
                  {(() => {
                    const vm = verificationMeta(item);
                    return <span style={{fontSize:11,fontWeight:800,color:vm.fg,background:vm.bg,border:`1px solid ${vm.border}`,borderRadius:999,padding:'5px 9px',whiteSpace:'nowrap'}}>{vm.text}</span>;
                  })()}
                </div>
              </div>

              {!money && <div style={{marginTop:13,padding:'11px 12px',borderRadius:12,background:'#faf8f4'}}>
                <strong>{item.item_name||'—'}</strong>
                <span style={{marginLeft:8,color:'#8a611d',fontWeight:700}}>{item.quantity??'—'}{item.unit?` ${item.unit}`:''}</span>
              </div>}

              <div style={{marginTop:12,color:'#625d55',fontSize:12,lineHeight:1.55}}>
                <strong>{t.donationPurpose}: </strong>{safePurposeLabel(item)}
              </div>

              {item.verification_status==='needs_correction' && item.verification_note && (
                <div style={{marginTop:10,padding:'9px 11px',borderRadius:11,background:'#fff3f1',border:'1px solid #efd3cd',color:'#8f4036',fontSize:12,lineHeight:1.5}}>
                  <strong>{th?'เหตุผลที่ต้องแก้ไข: ':'Correction note: '}</strong>{item.verification_note}
                </div>
              )}

              {item.receipt_requested === true && (
                <div style={{marginTop:10,padding:'9px 11px',borderRadius:11,background:'#f8f6f1',border:'1px solid #e4ddd2',fontSize:12,color:'#665d52'}}>
                  <strong>{th?'ใบอนุโมทนาบัตร: ':'Receipt: '}</strong>
                  {item.receipt_url
                    ? <a href={item.receipt_url} target="_blank" rel="noreferrer" style={{color:'#236b4a',fontWeight:800}}>{th?'มีลิงก์แล้ว':'Link ready'}</a>
                    : (th?'ยังไม่มีลิงก์':'No link yet')}
                </div>
              )}

              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
                <button type="button" onClick={()=>openVerify(item)} style={{...smallBtn,background:'#355b49',borderColor:'#355b49',color:'#fff',fontWeight:800}}>{th?'ตรวจสอบรายการ':'Review'}</button>
                <button type="button" onClick={()=>openEdit(item)} style={smallBtn}>{th?'แก้ไขรายละเอียด':'Edit Details'}</button>
                <button type="button" onClick={()=>openOwner(item)} style={{...smallBtn,background:'#fff8e8',color:'#8a611d',fontWeight:800}}>{th?'เปลี่ยนเจ้าของรายการ':'Change Owner'}</button>
              </div>
            </article>;
          })}
        </div>
      )}

      {mode && <div role="dialog" aria-modal="true" onMouseDown={(e)=>{if(e.target===e.currentTarget)close();}} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(29,25,20,.52)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:12}}>
        <div style={{width:'100%',maxWidth:600,maxHeight:'88vh',overflowY:'auto',background:'#fcfbf8',borderRadius:'20px 20px 12px 12px',padding:18,boxSizing:'border-box'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>
              {mode==='add'
                ? (th?'เพิ่มรายการทำบุญ':'Add Donation')
                : mode==='edit'
                  ? (th?'แก้ไขรายละเอียด':'Edit Donation')
                  : mode==='verify'
                    ? (th?'ตรวจสอบรายการทำบุญ':'Review Donation')
                    : (th?'เปลี่ยนเจ้าของรายการ':'Change Owner')}
            </h3>
            <button type="button" onClick={close} style={{width:40,height:40,borderRadius:'50%',border:'1px solid #ddd3c6',background:'#fff',cursor:'pointer'}}>×</button>
          </div>

          {formError && <div style={{marginBottom:12,padding:'10px 12px',borderRadius:10,background:'#fff1ef',color:'#9a3d34',fontSize:13}}>{formError}</div>}

          {mode==='verify' ? <>
            <div style={{padding:12,marginBottom:14,borderRadius:12,background:'#f7f5f0'}}>
              <div style={{fontSize:12,color:'#81786d'}}>{th?'ผู้บริจาค':'Donor'}</div>
              <strong>{selected?.owner_member_id ? currentOwnerName(selected) : (selected?.donor_name_snapshot || '—')}</strong>
              <div style={{marginTop:6,fontSize:12,color:'#81786d'}}>
                {selected?.donation_type==='money'
                  ? `${Number(selected?.amount||0).toLocaleString()} ฿`
                  : `${selected?.item_name||'—'} ${selected?.quantity??''} ${selected?.unit||''}`}
              </div>
            </div>

            <label style={label}>{th?'สถานะการตรวจสอบ':'Verification status'}</label>
            <div style={{display:'grid',gap:8,marginBottom:14}}>
              {[
                ['pending', th?'รอตรวจสอบ':'Pending review'],
                ['verified', th?'รายการถูกต้อง':'Verified'],
                ['needs_correction', th?'ต้องแก้ไขข้อมูล':'Needs correction']
              ].map(([v,l])=><button key={v} type="button" onClick={()=>setVerificationStatus(v)} style={{minHeight:44,border:verificationStatus===v?'2px solid #9b7226':'1px solid #ddd3c6',borderRadius:12,background:verificationStatus===v?'#fff8e8':'#fff',fontWeight:800,textAlign:'left',padding:'0 12px',cursor:'pointer'}}>{verificationStatus===v?'✓ ':''}{l}</button>)}
            </div>

            <label style={label}>{th?'หมายเหตุการตรวจสอบ':'Verification note'}</label>
            <textarea rows="3" value={verificationNote} onChange={(e)=>setVerificationNote(e.target.value)} style={{...input,resize:'vertical'}} placeholder={verificationStatus==='needs_correction'?(th?'ระบุข้อมูลที่ต้องแก้ไข...':'Describe what needs correction...'):''}/>

            {selected?.receipt_requested === true && (
              <div style={{marginTop:15,paddingTop:14,borderTop:'1px solid #e4ddd2'}}>
                <label style={label}>{th?'ลิงก์ใบอนุโมทนาบัตร':'Receipt / certificate URL'}</label>
                <input type="url" inputMode="url" value={receiptUrl} onChange={(e)=>setReceiptUrl(e.target.value)} style={input} placeholder="https://..." />
                <div style={{marginTop:6,fontSize:11,color:'#82786d',lineHeight:1.45}}>
                  {th?'ใส่เมื่อจัดทำใบอนุโมทนาบัตรเสร็จแล้ว เว้นว่างไว้ได้หากยังจัดทำไม่เสร็จ':'Add the URL when the certificate is ready. It may be left blank while being prepared.'}
                </div>
              </div>
            )}

            <button type="button" disabled={busy} onClick={saveVerification} style={{width:'100%',minHeight:48,marginTop:16,border:0,borderRadius:12,background:'#355b49',color:'#fff',fontWeight:800,cursor:'pointer',opacity:busy?.65:1}}>
              {busy?(th?'กำลังบันทึก...':'Saving...'):(th?'บันทึกผลการตรวจสอบ':'Save Review')}
            </button>
          </> : mode==='owner' ? <>
            <div style={{padding:12,marginBottom:12,borderRadius:12,background:'#f7f5f0'}}>
              <div style={{fontSize:12,color:'#81786d'}}>{th?'เจ้าของรายการปัจจุบัน':'Current linked owner'}</div>
              <strong>{selected ? currentOwnerName(selected) : '—'}</strong>

              <div style={{fontSize:12,color:'#81786d',marginTop:9}}>{th?'ชื่อผู้บริจาคที่บันทึกไว้เดิม':'Original recorded donor name'}</div>
              <strong>{selected?.donor_name_snapshot||'—'}</strong>

              <div style={{marginTop:5,color:'#8a611d',fontSize:12}}>
                {th
                  ? 'ชื่อเดิมจะเก็บไว้เป็นประวัติ แต่ชื่อเจ้าของปัจจุบันจะเปลี่ยนตามสมาชิกที่เลือก'
                  : 'The original snapshot is preserved, while the current owner changes to the selected member.'}
              </div>
            </div>

            <label style={label}>{th?'ค้นหาสมาชิกเจ้าของใหม่':'Search new owner'}</label>
            <input type="search" value={memberSearch} onChange={(e)=>setMemberSearch(e.target.value)} style={input} placeholder={th?'พิมพ์ชื่อสมาชิก...':'Type member name...'} />
            <div style={{display:'grid',gap:7,marginTop:9,maxHeight:220,overflowY:'auto'}}>
              {matchingMembers.map((m)=><button key={m.id} type="button" onClick={()=>chooseMember(m)} style={{padding:10,border:form.ownerMemberId===m.id?'2px solid #9b7226':'1px solid #e1d8ca',borderRadius:11,background:form.ownerMemberId===m.id?'#fff8e8':'#fff',textAlign:'left',cursor:'pointer'}}>
                <strong>{memberName(m)}</strong>
                {m.display_name&&m.full_name&&<div style={{fontSize:11,color:'#80776d'}}>LINE: {m.display_name}</div>}
              </button>)}
            </div>

            {selectedMember && <div style={{marginTop:10,color:'#236b4a',fontSize:13,fontWeight:800}}>✓ {memberName(selectedMember)}</div>}

            <label style={{...label,marginTop:14}}>{th?'เหตุผลในการเปลี่ยน':'Reason'}</label>
            <textarea rows="3" value={ownerReason} onChange={(e)=>setOwnerReason(e.target.value)} style={{...input,resize:'vertical'}} placeholder={th?'เช่น ผู้บริจาคสมัครสมาชิกภายหลัง':'e.g. donor registered later'} />

            <button type="button" disabled={busy||!form.ownerMemberId} onClick={changeOwner} style={{width:'100%',minHeight:48,marginTop:16,border:0,borderRadius:12,background:'#355b49',color:'#fff',fontWeight:800,cursor:'pointer',opacity:busy?.65:1}}>
              {busy?(th?'กำลังบันทึก...':'Saving...'):(th?'ยืนยันเปลี่ยนเจ้าของ':'Confirm Owner Change')}
            </button>
          </> : <>
            {mode==='add' && <>
              <label style={label}>{th?'ประเภทการทำบุญ':'Donation type'}</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                {[['money',th?'ทำบุญเป็นเงิน':'Money'],['item',th?'ถวายสิ่งของ':'Items']].map(([v,l])=><button key={v} type="button" onClick={()=>setForm((p)=>({...p,donationType:v,purpose:v==='item'&&p.purpose==='utilities'?'general':p.purpose}))} style={{minHeight:46,border:form.donationType===v?'2px solid #9b7226':'1px solid #ddd3c6',borderRadius:12,background:form.donationType===v?'#fff8e8':'#fff',fontWeight:800,cursor:'pointer'}}>{l}</button>)}
              </div>

              <label style={label}>{th?'ผู้บริจาค':'Donor'}</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {[['general',th?'บุคคลทั่วไป':'Guest'],['member',th?'สมาชิกในระบบ':'Member']].map(([v,l])=><button key={v} type="button" onClick={()=>setForm((p)=>({...p,ownerMode:v,ownerMemberId:v==='general'?'':p.ownerMemberId}))} style={{minHeight:44,border:form.ownerMode===v?'2px solid #9b7226':'1px solid #ddd3c6',borderRadius:12,background:form.ownerMode===v?'#fff8e8':'#fff',fontWeight:700,cursor:'pointer'}}>{l}</button>)}
              </div>

              {form.ownerMode==='member' ? <>
                <input type="search" value={memberSearch} onChange={(e)=>setMemberSearch(e.target.value)} style={input} placeholder={th?'ค้นหาชื่อสมาชิก...':'Search member...'} />
                <div style={{display:'grid',gap:7,margin:'9px 0 14px',maxHeight:180,overflowY:'auto'}}>
                  {matchingMembers.map((m)=><button key={m.id} type="button" onClick={()=>chooseMember(m)} style={{padding:10,border:form.ownerMemberId===m.id?'2px solid #9b7226':'1px solid #e1d8ca',borderRadius:11,background:form.ownerMemberId===m.id?'#fff8e8':'#fff',textAlign:'left',cursor:'pointer'}}><strong>{memberName(m)}</strong></button>)}
                </div>
              </> : <div style={{marginBottom:13}}>
                <label style={label}>{th?'ชื่อผู้บริจาค':'Donor name'}</label>
                <input value={form.donorName} onChange={(e)=>setForm((p)=>({...p,donorName:e.target.value}))} style={input}/>
              </div>}
            </>}

            {mode==='edit' && <div style={{marginBottom:13}}>
              <label style={label}>{th?'ชื่อผู้บริจาคที่บันทึกไว้':'Recorded donor name'}</label>
              <input value={form.donorName} onChange={(e)=>setForm((p)=>({...p,donorName:e.target.value}))} style={input}/>
            </div>}

            {form.donationType==='money' ? <div style={{marginBottom:13}}>
              <label style={label}>{th?'จำนวนเงิน (บาท)':'Amount (THB)'}</label>
              <input type="number" min="0.01" step="any" inputMode="decimal" value={form.amount} onChange={(e)=>setForm((p)=>({...p,amount:e.target.value}))} style={input}/>
            </div> : <div style={{display:'grid',gap:10,marginBottom:13}}>
              <div><label style={label}>{th?'สิ่งของที่ถวาย':'Item offered'}</label><input value={form.itemName} onChange={(e)=>setForm((p)=>({...p,itemName:e.target.value}))} style={input}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div><label style={label}>{th?'จำนวน':'Quantity'}</label><input type="number" min="0.01" step="any" inputMode="decimal" value={form.quantity} onChange={(e)=>setForm((p)=>({...p,quantity:e.target.value}))} style={input}/></div>
                <div><label style={label}>{th?'หน่วย':'Unit'}</label><input value={form.unit} onChange={(e)=>setForm((p)=>({...p,unit:e.target.value}))} style={input}/></div>
              </div>
            </div>}

            <div style={{marginBottom:13}}>
              <label style={label}>{th?'วัตถุประสงค์':'Purpose'}</label>
              <select value={form.purpose} onChange={(e)=>setForm((p)=>({...p,purpose:e.target.value}))} style={input}>
                {purposeOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {form.purpose==='custom' && <div style={{marginBottom:13}}>
              <label style={label}>{th?'ระบุวัตถุประสงค์':'Specify purpose'}</label>
              <input value={form.customPurpose} onChange={(e)=>setForm((p)=>({...p,customPurpose:e.target.value}))} style={input}/>
            </div>}

            <div style={{marginBottom:13}}>
              <label style={label}>{th?'วันที่ทำบุญ':'Donation date'}</label>
              <input type="date" value={form.donationDate} onChange={(e)=>setForm((p)=>({...p,donationDate:e.target.value}))} style={input}/>
            </div>

            {form.donationType==='money' && <label style={{display:'flex',gap:9,alignItems:'center',marginBottom:13,fontSize:13}}>
              <input type="checkbox" checked={form.receiptRequested} onChange={(e)=>setForm((p)=>({...p,receiptRequested:e.target.checked}))}/>
              {th?'ผู้บริจาคต้องการใบอนุโมทนา':'Receipt requested'}
            </label>}

            <div style={{marginBottom:13}}>
              <label style={label}>{th?'หมายเหตุ':'Note'}</label>
              <textarea rows="3" value={form.note} onChange={(e)=>setForm((p)=>({...p,note:e.target.value}))} style={{...input,resize:'vertical'}}/>
            </div>

            <button type="button" disabled={busy} onClick={save} style={{width:'100%',minHeight:48,border:0,borderRadius:12,background:'#355b49',color:'#fff',fontWeight:800,cursor:'pointer',opacity:busy?.65:1}}>
              {busy?(th?'กำลังบันทึก...':'Saving...'):(th?'บันทึกข้อมูล':'Save')}
            </button>
          </>}
        </div>
      </div>}
    </div>
  );
}
