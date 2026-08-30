import React, { useEffect, useMemo, useRef, useState } from 'react';
import RoutineIcon from '../components/RoutineIcon';

const timeFmt = (iso, lang) => iso ? new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)) : '';
const dateFmt = (iso, lang) => {
  const [y,m,d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { timeZone:'Asia/Bangkok', weekday:'short', day:'numeric', month:'short', year:'numeric' }).format(new Date(Date.UTC(y,m-1,d,12)));
};

const homeMethodLabels = {
  mother: { th: 'แม่มารับ', en: 'Mother will pick me up' },
  sibling: { th: 'พี่มารับ', en: 'Older sibling will pick me up' },
  someone_drives: { th: 'มีคนไปส่ง', en: 'Someone will take me home' },
  self: { th: 'กลับเอง', en: 'I will go by myself' },
  other: { th: 'อื่น ๆ', en: 'Other' }
};
const returnMethodLabels = {
  mother: { th: 'แม่มาส่ง', en: 'Mother brought me back' },
  sibling: { th: 'พี่มาส่ง', en: 'Older sibling brought me back' },
  self: { th: 'มาเอง', en: 'I came back by myself' },
  other: { th: 'อื่น ๆ', en: 'Other' }
};

export default function StudentDashboard({ lang, goToPage, studentUser, onStudentLogout }) {
  const th = lang === 'th';
  const [tab, setTab] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({ nickname:'', schoolName:'', gradeLevel:'', aboutMe:'' });
  const fileRef = useRef(null);

  const load = async () => {
    setError('');
    try {
      const r = await fetch('/api/student?route=dashboard', { credentials: 'include' });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.message || 'Unable to load');
      setData(j);
      setProfile({ nickname:j.student.nickname || '', schoolName:j.student.schoolName || '', gradeLevel:j.student.gradeLevel || '', aboutMe:j.student.aboutMe || '' });
    } catch (e) {
      setError(th ? 'ไม่สามารถเปิดข้อมูลกิจวัตรได้ กรุณาเข้าสู่ระบบใหม่' : 'Unable to load your routine. Please sign in again.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const postAction = async (body, key='action') => {
    setBusy(key); setError('');
    try {
      const r = await fetch('/api/student?route=action', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.message || 'Unable to save');
      await load();
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setBusy(''); }
  };

  const completeRoutine = async (item) => {
    if (!item.active || item.entry) return;
    let nutritionSource, nutritionOther;
    if (item.key === 'dinner') {
      nutritionSource = window.prompt(th ? 'ระบุอาหารเย็น: 1 = ทำเอง, 2 = จากแม่, 3 = อื่น ๆ' : 'Dinner source: 1 = cooked by myself, 2 = from mother, 3 = other', '1');
      if (nutritionSource === null) return;
      nutritionSource = nutritionSource === '1' ? 'self_cooked' : nutritionSource === '2' ? 'mother' : nutritionSource === '3' ? 'other' : '';
      if (!nutritionSource) return alert(th ? 'กรุณาเลือก 1, 2 หรือ 3' : 'Please choose 1, 2 or 3.');
      if (nutritionSource === 'other') {
        nutritionOther = window.prompt(th ? 'ระบุว่าอาหารมาจากไหน / อะไร' : 'Please specify where the food came from');
        if (!nutritionOther?.trim()) return;
      }
    }
    const ok = window.confirm(th ? `ยืนยันว่า “${item.label.th}” ทำแล้วตอนนี้ ระบบจะบันทึกเวลาจริงอัตโนมัติ` : `Confirm “${item.label.en}” is completed now. The system will record the real time automatically.`);
    if (!ok) return;
    await postAction({ action:'complete_routine', activityKey:item.key, nutritionSource, nutritionOther }, item.key);
  };

  const saveTomorrow = (dayType) => postAction({ action:'set_tomorrow_school', dayType }, 'tomorrow');
  const stayTomorrow = () => postAction({ action:'set_tomorrow_location', locationPlan:'monastery' }, 'stay');

  const requestHome = async () => {
    const methodChoice = window.prompt(th ? 'วิธีกลับบ้าน: 1 แม่มารับ, 2 พี่มารับ, 3 มีคนไปส่ง, 4 กลับเอง, 5 อื่น ๆ' : 'Going home: 1 mother picks up, 2 sibling picks up, 3 someone drives, 4 by myself, 5 other', '1');
    if (methodChoice === null) return;
    const map = { '1':'mother','2':'sibling','3':'someone_drives','4':'self','5':'other' };
    const method = map[methodChoice]; if (!method) return;
    let methodOther = null;
    if (method === 'other') { methodOther = window.prompt(th ? 'ระบุวิธีการกลับบ้าน' : 'Specify the travel method'); if (!methodOther?.trim()) return; }
    const expectedReturnDate = window.prompt(th ? 'วันที่คาดว่าจะกลับเข้าวัด (YYYY-MM-DD)' : 'Expected return date (YYYY-MM-DD)', data.tomorrow);
    if (!expectedReturnDate) return;
    await postAction({ action:'request_home', departureDate:data.tomorrow, expectedReturnDate, method, methodOther }, 'home');
  };

  const arrived = async (req) => {
    const choice = window.prompt(th ? 'วิธีกลับมาวัด: 1 แม่มาส่ง, 2 พี่มาส่ง, 3 มาเอง, 4 อื่น ๆ' : 'Return to monastery: 1 mother brought me, 2 sibling brought me, 3 by myself, 4 other', '1');
    if (choice === null) return;
    const map = { '1':'mother','2':'sibling','3':'self','4':'other' };
    const method = map[choice]; if (!method) return;
    let methodOther = null;
    if (method === 'other') { methodOther = window.prompt(th ? 'ระบุวิธีกลับมาวัด' : 'Specify the return method'); if (!methodOther?.trim()) return; }
    await postAction({ action:'arrived_monastery', requestId:req.id, method, methodOther }, 'arrived');
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setBusy('message');
    try {
      const r = await fetch('/api/student?route=message', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message }) });
      const j = await r.json(); if (!r.ok || !j.success) throw new Error(j.message || 'Unable to send');
      setMessage(''); await load();
    } catch(e) { setError(e.message); } finally { setBusy(''); }
  };

  const saveProfile = async (imageData = '') => {
    setBusy('profile');
    try {
      const r = await fetch('/api/student?route=profile', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...profile, imageData }) });
      const j = await r.json(); if (!r.ok || !j.success) throw new Error(j.message || 'Unable to save');
      await load();
    } catch(e) { setError(e.message); } finally { setBusy(''); }
  };
  const pickPhoto = (file) => {
    if (!file) return;
    if (file.size > 2*1024*1024) return alert(th ? 'รูปต้องมีขนาดไม่เกิน 2 MB' : 'Image must be under 2 MB.');
    const reader = new FileReader(); reader.onload = () => saveProfile(reader.result); reader.readAsDataURL(file);
  };

  const doneCount = useMemo(() => data?.routine?.filter(x => x.active && x.entry).length || 0, [data]);
  const activeCount = useMemo(() => data?.routine?.filter(x => x.active).length || 0, [data]);
  const currentHome = data?.homeRequests?.find(r => r.status === 'approved' && !r.return_arrived_at);

  if (loading) return <div className="guidePage" style={{padding:'80px 20px',textAlign:'center'}}>{th ? 'กำลังโหลดกิจวัตร...' : 'Loading routine...'}</div>;
  if (!data) return <div className="guidePage"><div className="guideContainer" style={{maxWidth:600,padding:30,textAlign:'center'}}><p>{error}</p><button className="primaryContactBtn" onClick={() => goToPage('student-login')}>{th ? 'เข้าสู่ระบบใหม่' : 'Sign in again'}</button></div></div>;

  return (
    <div style={{ background:'#f7f5f0', minHeight:'100vh', paddingBottom:86 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'18px 14px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, background:'#fff', border:'1px solid #e3ddd2', borderRadius:18, padding:16 }}>
          <div style={{ width:58, height:58, borderRadius:16, overflow:'hidden', background:'#eee8dc', display:'grid', placeItems:'center', color:'#7d6236', flex:'0 0 auto' }}>
            {data.student.pictureUrl ? <img src={data.student.pictureUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <RoutineIcon type="profile" size={28}/>} 
          </div>
          <div style={{minWidth:0,flex:1}}><div style={{fontSize:12,color:'#8a7d6d',fontWeight:800,letterSpacing:'.08em'}}>{th ? 'กิจวัตรของฉัน' : 'MY ROUTINE'}</div><div style={{fontSize:22,fontWeight:800,color:'#332f29',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{data.student.nickname || data.student.displayName}</div><div style={{fontSize:13,color:'#756c60'}}>{dateFmt(data.today, lang)} · {doneCount}/{activeCount}</div></div>
          <button onClick={async () => { try { await fetch('/api/student?route=logout',{method:'POST',credentials:'include'}); } catch {} localStorage.removeItem('temple_student_user'); onStudentLogout?.(); goToPage('student-login'); }} style={ghostBtn}>{th ? 'ออก' : 'Logout'}</button>
        </div>

        {error && <div style={{marginTop:12,padding:12,borderRadius:12,background:'#fff2ef',color:'#972d2d',border:'1px solid #f0d2cc'}}>{error}</div>}
        {currentHome && <button onClick={() => arrived(currentHome)} style={{...primaryWide,marginTop:12,background:'#355b49'}}><RoutineIcon type="home" size={20}/>{th ? 'วันนี้ผมมาถึงวัดแล้ว — บันทึกเวลาจริง' : 'I have arrived at the monastery — record real time'}</button>}

        {tab === 'today' && <>
          {new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',weekday:'short'}).format(new Date(`${data.today}T12:00:00+07:00`)) === 'Fri' && !data.tomorrowPlan && <button onClick={()=>setTab('plan')} style={{...primaryWide,marginTop:12,background:'#8a6a36'}}><RoutineIcon type="calendar" size={20}/>{th?'กรุณาแจ้งแผนวันเสาร์: อยู่ที่วัดหรือขอกลับบ้าน':'Please report Saturday plan: stay at monastery or request home leave'}</button>}
          <TodayView th={th} lang={lang} data={data} busy={busy} onComplete={completeRoutine} onAssignment={id=>postAction({action:'complete_assignment',assignmentId:id},`a-${id}`)} />
        </>}
        {tab === 'plan' && <PlanView th={th} data={data} busy={busy} onSchool={saveTomorrow} onStay={stayTomorrow} onHome={requestHome} />}
        {tab === 'messages' && <MessagesView th={th} lang={lang} messages={data.messages} message={message} setMessage={setMessage} sendMessage={sendMessage} busy={busy} />}
        {tab === 'profile' && <ProfileView th={th} data={data} profile={profile} setProfile={setProfile} saveProfile={saveProfile} busy={busy} fileRef={fileRef} pickPhoto={pickPhoto} />}
      </div>
      <nav style={bottomNav}>
        <NavButton active={tab==='today'} onClick={()=>setTab('today')} icon="check" label={th?'วันนี้':'Today'} />
        <NavButton active={tab==='plan'} onClick={()=>setTab('plan')} icon="calendar" label={th?'แผน':'Plan'} />
        <NavButton active={tab==='messages'} onClick={()=>setTab('messages')} icon="message" label={th?'ข้อความ':'Messages'} />
        <NavButton active={tab==='profile'} onClick={()=>setTab('profile')} icon="profile" label={th?'โปรไฟล์':'Profile'} />
      </nav>
    </div>
  );
}

function TodayView({ th, lang, data, busy, onComplete, onAssignment }) {
  const sections = [
    ['morning', th?'ช่วงเช้า':'Morning'], ['after_school', th?'หลังเลิกเรียน':'After School'], ['evening', th?'ช่วงเย็น':'Evening']
  ];
  return <div style={{marginTop:14}}>
    <DayStatus status={data.dayStatus} th={th}/>
    {sections.map(([key,label]) => {
      const items=data.routine.filter(i=>i.section===key && i.active);
      if(!items.length) return null;
      return <section key={key} style={{marginTop:16}}><h2 style={sectionTitle}>{label}</h2><div style={{display:'grid',gap:9}}>{items.map(item=><RoutineCard key={item.key} item={item} th={th} lang={lang} busy={busy===item.key} onClick={()=>onComplete(item)}/>)}</div></section>
    })}
    {!!data.assignments?.length && <section style={{marginTop:18}}><h2 style={sectionTitle}>{th?'งานที่ได้รับมอบหมาย':'Assigned Tasks'}</h2><div style={{display:'grid',gap:9}}>{data.assignments.map(a=><button key={a.id} disabled={!!a.completed_at || busy===`a-${a.id}`} onClick={()=>onAssignment(a.id)} style={{...cardBtn,textAlign:'left',opacity:a.completed_at?.75:1}}><span style={iconBox}><RoutineIcon type="assignment" size={22}/></span><span style={{flex:1}}><strong>{th?a.title_th:a.title_en}</strong>{a.note&&<small style={small}>{a.note}</small>}</span><span style={{fontWeight:800,color:a.completed_at?'#2f6d4c':'#8c6b34'}}>{a.completed_at ? (th?'ทำแล้ว':'Done') : (th?'กดเมื่อทำเสร็จ':'Complete')}</span></button>)}</div></section>}
  </div>;
}

function DayStatus({status,th}) {
  const map={school_day:th?'วันเรียนปกติ':'School Day',no_school:th?'วันหยุด':'No School',sick:th?'ป่วย / หยุดเรียน':'Sick / No School',home:th?'อยู่บ้าน':'At Home',special:th?'วันพิเศษ':'Special Day'};
  return <div style={{padding:'12px 14px',borderRadius:12,background:'#efeade',border:'1px solid #ddd3c3',display:'flex',gap:10,alignItems:'center'}}><RoutineIcon type="calendar" size={19}/><div><strong>{map[status?.day_type]||status?.day_type}</strong>{status?.note&&<div style={{fontSize:12,color:'#746a5d',marginTop:2}}>{status.note}</div>}</div></div>
}

function RoutineCard({ item, th, lang, busy, onClick }) {
  const done=!!item.entry; const warn=['late','overdue_no_record','nutrition_missing'].includes(item.status);
  let status='';
  if(done) status=timeFmt(item.entry.completed_at,lang);
  if(item.status==='late') status += ` · ${th?'สาย':'Late'} ${item.lateMinutes} ${th?'นาที':'min'}`;
  if(item.status==='overdue_no_record') status=`${th?'เกินเวลา':'Overdue'} ${item.lateMinutes} ${th?'นาที · ยังไม่มีการบันทึก':'min · no record'}`;
  if(item.status==='nutrition_missing') status=th?'ข้อมูลโภชนาการไม่ครบ':'Nutrition information missing';
  if(item.key==='dinner'&&item.entry?.nutrition_source){ const map={self_cooked:th?'ทำเอง':'Cooked by myself',mother:th?'จากแม่':'From mother',other:item.entry.nutrition_other|| (th?'อื่น ๆ':'Other')}; status += ` · ${map[item.entry.nutrition_source]}`; }
  return <button disabled={done||busy} onClick={onClick} style={{...cardBtn,borderColor:warn?'#e3b7ad':'#e3ddd2',background:warn?'#fff8f6':'#fff',cursor:done?'default':'pointer'}}>
    <span style={{...iconBox,color:done?'#2d6b49':warn?'#a54634':'#7c6238'}}><RoutineIcon type={item.key} size={23}/></span>
    <span style={{flex:1,minWidth:0,textAlign:'left'}}><strong style={{display:'block',fontSize:15.5,color:'#37322c'}}>{th?item.label.th:item.label.en}</strong>{item.timeRule&&<small style={small}>{th?'กำหนดไม่เกิน':'Rule: no later than'} {item.timeRule}</small>}{status&&<small style={{...small,color:warn?'#a24433':done?'#2f6d4c':'#766c60'}}>{status}</small>}</span>
    <span style={{fontWeight:800,color:done?'#2f6d4c':'#8c6b34',fontSize:13}}>{busy?(th?'กำลังบันทึก':'Saving'):done?(th?'ทำแล้ว':'Done'):(th?'กดเมื่อทำแล้ว':'Complete')}</span>
  </button>;
}

function PlanView({th,data,busy,onSchool,onStay,onHome}) {
  const wd = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',weekday:'short'}).format(new Date(`${data.tomorrow}T12:00:00+07:00`));
  const weekend=['Sat','Sun'].includes(wd);
  const pending=data.homeRequests?.find(r=>r.status==='pending');
  return <div style={{marginTop:16,display:'grid',gap:14}}>
    <div style={panel}><h2 style={{...sectionTitle,marginTop:0}}>{th?'แผนวันพรุ่งนี้':'Tomorrow’s Plan'}</h2><p style={{color:'#6f675e',marginTop:4}}>{dateFmt(data.tomorrow,th?'th':'en')}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
        <button disabled={busy==='tomorrow'} onClick={()=>onSchool('school_day')} style={optionBtn(data.tomorrowStatus?.day_type==='school_day')}><RoutineIcon type="leave_for_school" size={22}/><strong>{th?'เรียนปกติ':'School Day'}</strong></button>
        <button disabled={busy==='tomorrow'} onClick={()=>onSchool('no_school')} style={optionBtn(data.tomorrowStatus?.day_type==='no_school')}><RoutineIcon type="calendar" size={22}/><strong>{th?'วันหยุด':'No School'}</strong></button>
      </div>
      <p style={{fontSize:12,color:'#81786d',margin:'10px 0 0'}}>{weekend?(th?'เสาร์–อาทิตย์ ระบบกำหนดเป็นวันหยุดอัตโนมัติ เปลี่ยนได้เมื่อมีเรียนพิเศษ':'Saturday–Sunday default to No School. Change only for special school activities.'):(th?'จันทร์–ศุกร์ ระบบกำหนดเป็นวันเรียนปกติ เปลี่ยนเฉพาะเมื่อโรงเรียนหยุด':'Monday–Friday default to School Day. Change only when school is closed.')}</p>
    </div>
    <div style={panel}><h2 style={{...sectionTitle,marginTop:0}}>{th?'พรุ่งนี้จะอยู่ที่ไหน':'Where will I stay tomorrow?'}</h2>
      {data.tomorrowPlan && <div style={{padding:11,borderRadius:10,background:'#eef4ef',border:'1px solid #d3e0d5',marginBottom:10}}><strong>{data.tomorrowPlan.location_plan==='monastery'?(th?'แจ้งแล้ว: อยู่ที่วัด':'Reported: Stay at the monastery'):(th?'แจ้งแล้ว: ขอกลับบ้าน':'Reported: Home leave')}</strong></div>}
      {pending?<div style={{padding:12,borderRadius:10,background:'#fff8e8',border:'1px solid #ead6a5'}}><strong>{th?'คำขอกลับบ้านกำลังรออนุมัติ':'Home request pending approval'}</strong><div style={small}>{pending.departure_date} → {pending.expected_return_date}</div><div style={small}>{homeMethodLabels[pending.departure_method]?.[th?'th':'en'] || pending.departure_method}</div></div>:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}><button disabled={busy==='stay'} onClick={onStay} style={optionBtn(data.tomorrowPlan?.location_plan==='monastery')}><RoutineIcon type="home" size={22}/><strong>{th?'อยู่ที่วัด':'Stay at Monastery'}</strong></button><button disabled={busy==='home'} onClick={onHome} style={optionBtn(data.tomorrowPlan?.location_plan==='home')}><RoutineIcon type="home" size={22}/><strong>{th?'ขอกลับบ้าน':'Request Home Leave'}</strong></button></div>}
      <div style={{marginTop:10,fontSize:13,color:'#70675d'}}>{th?'วันศุกร์ควรแจ้งแผนวันเสาร์ให้ชัดเจน เพื่อให้พระอาจารย์เห็นจาก Dashboard':'On Friday, please report Saturday’s plan so Admin can see it on the dashboard.'}</div></div>
    {!!data.homeRequests?.length && <div style={panel}><h2 style={{...sectionTitle,marginTop:0}}>{th?'ประวัติการกลับบ้านล่าสุด':'Recent Home Leave'}</h2>{data.homeRequests.slice(0,4).map(r=><div key={r.id} style={{padding:'9px 0',borderBottom:'1px solid #eee7db',fontSize:13}}><strong>{r.departure_date} → {r.expected_return_date}</strong><div>{homeMethodLabels[r.departure_method]?.[th?'th':'en'] || r.departure_method} · {r.status}</div>{r.return_arrived_at&&<div>{th?'กลับถึงวัด':'Returned'} {timeFmt(r.return_arrived_at,th?'th':'en')} · {returnMethodLabels[r.return_method]?.[th?'th':'en']||r.return_method}</div>}</div>)}</div>}
  </div>;
}

function MessagesView({th,lang,messages,message,setMessage,sendMessage,busy}){return <div style={{marginTop:16}}><div style={{...panel,minHeight:300}}><h2 style={{...sectionTitle,marginTop:0}}>{th?'ข้อความถึงพระอาจารย์':'Messages to Admin'}</h2><div style={{display:'grid',gap:8,maxHeight:390,overflowY:'auto',padding:'4px 0 12px'}}>{!messages?.length&&<p style={{color:'#887f74'}}>{th?'ยังไม่มีข้อความ':'No messages yet.'}</p>}{messages?.map(m=><div key={m.id} style={{maxWidth:'84%',justifySelf:m.sender_type==='student'?'end':'start',background:m.sender_type==='student'?'#eee7da':'#f4f3ef',border:'1px solid #e1dbcf',borderRadius:14,padding:'9px 11px'}}><div style={{fontSize:12,fontWeight:800,color:'#766b5e',marginBottom:3}}>{m.sender_type==='student'?(th?'ผม':'Me'):(th?'พระอาจารย์':'Admin')}</div><div style={{whiteSpace:'pre-wrap'}}>{m.message}</div><div style={{fontSize:11,color:'#968d81',marginTop:4}}>{timeFmt(m.created_at,lang)}</div></div>)}</div><div style={{display:'flex',gap:8}}><textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2} style={{...inputStyle,resize:'vertical'}} placeholder={th?'พิมพ์ข้อความถึงพระอาจารย์...':'Write a message to Admin...'}/><button disabled={busy==='message'||!message.trim()} onClick={sendMessage} style={{...ghostBtn,background:'#7b6033',color:'#fff',minWidth:74}}>{th?'ส่ง':'Send'}</button></div></div></div>}

function ProfileView({th,data,profile,setProfile,saveProfile,busy,fileRef,pickPhoto}){return <div style={{marginTop:16}}><div style={panel}><h2 style={{...sectionTitle,marginTop:0}}>{th?'โปรไฟล์ของฉัน':'My Profile'}</h2><div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}><div style={{width:78,height:78,borderRadius:18,overflow:'hidden',background:'#eee8dc',display:'grid',placeItems:'center',color:'#7d6236'}}>{data.student.pictureUrl?<img src={data.student.pictureUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<RoutineIcon type="profile" size={34}/>}</div><div><button onClick={()=>fileRef.current?.click()} style={ghostBtn}>{th?'เปลี่ยนรูป':'Change Photo'}</button><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>pickPhoto(e.target.files?.[0])}/><div style={{fontSize:11,color:'#8c8277',marginTop:6}}>{th?'ไม่เกิน 2 MB':'Max 2 MB'}</div></div></div><Field label={th?'ชื่อเล่น':'Nickname'} value={profile.nickname} onChange={v=>setProfile({...profile,nickname:v})}/><Field label={th?'โรงเรียน':'School'} value={profile.schoolName} onChange={v=>setProfile({...profile,schoolName:v})}/><Field label={th?'ชั้นเรียน':'Grade / Class'} value={profile.gradeLevel} onChange={v=>setProfile({...profile,gradeLevel:v})}/><label style={fieldLabel}>{th?'เกี่ยวกับฉัน':'About Me'}</label><textarea value={profile.aboutMe} onChange={e=>setProfile({...profile,aboutMe:e.target.value})} rows={4} style={{...inputStyle,resize:'vertical'}}/><button disabled={busy==='profile'} onClick={()=>saveProfile()} style={{...primaryWide,marginTop:14,justifyContent:'center'}}>{busy==='profile'?(th?'กำลังบันทึก...':'Saving...'):(th?'บันทึกโปรไฟล์':'Save Profile')}</button></div></div>}
function Field({label,value,onChange}){return <><label style={fieldLabel}>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} style={inputStyle}/></>}
function NavButton({active,onClick,icon,label}){return <button onClick={onClick} style={{border:0,background:'transparent',color:active?'#6f5428':'#80786e',display:'grid',placeItems:'center',gap:3,fontSize:11,fontWeight:active?800:600,minWidth:68}}><RoutineIcon type={icon} size={22}/><span>{label}</span></button>}

const panel={background:'#fff',border:'1px solid #e3ddd2',borderRadius:16,padding:16};
const sectionTitle={fontSize:17,margin:'0 0 10px',color:'#3d372f'};
const cardBtn={width:'100%',border:'1px solid #e3ddd2',borderRadius:14,background:'#fff',padding:'11px 12px',display:'flex',alignItems:'center',gap:11,color:'#403a33'};
const iconBox={width:42,height:42,borderRadius:12,background:'#f1ede5',display:'grid',placeItems:'center',flex:'0 0 auto',color:'#7c6238'};
const small={display:'block',fontSize:12,color:'#837a6f',marginTop:3,fontWeight:500};
const primaryWide={width:'100%',border:0,borderRadius:12,padding:'12px 14px',background:'#7b6033',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:800,cursor:'pointer'};
const ghostBtn={border:'1px solid #d8d0c4',background:'#fff',borderRadius:10,padding:'8px 11px',fontWeight:700,color:'#554d43',cursor:'pointer'};
const bottomNav={position:'fixed',left:'50%',bottom:10,transform:'translateX(-50%)',width:'calc(100% - 24px)',maxWidth:640,background:'rgba(255,255,255,.97)',border:'1px solid #ddd5c9',borderRadius:18,boxShadow:'0 10px 28px rgba(40,32,20,.12)',padding:'8px 6px',display:'flex',justifyContent:'space-around',zIndex:40};
const inputStyle={width:'100%',boxSizing:'border-box',border:'1px solid #d9d1c5',borderRadius:10,padding:'10px 11px',fontSize:15,background:'#fff'};
const fieldLabel={display:'block',fontWeight:700,fontSize:13,margin:'12px 0 6px',color:'#514a42'};
const optionBtn=active=>({border:`1px solid ${active?'#8b6d3c':'#ddd5ca'}`,background:active?'#f3ecdf':'#fff',borderRadius:12,padding:'14px 10px',display:'grid',placeItems:'center',gap:7,color:'#4b4339',cursor:'pointer'});
