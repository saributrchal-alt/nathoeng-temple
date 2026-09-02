import React, { useEffect, useMemo, useState } from 'react';
import RoutineIcon from './RoutineIcon';

const fmtTime=(iso,lang)=>iso?new Intl.DateTimeFormat(lang==='th'?'th-TH':'en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso)):'—';
const nutritionLabel=(entry,th)=>{
  if(!entry?.nutrition_source) return th?'ไม่ระบุ':'Not specified';
  if(entry.nutrition_source==='self_cooked') return th?'ทำเอง':'Cooked by student';
  if(entry.nutrition_source==='mother') return th?'จากแม่':'From mother';
  return entry.nutrition_other || (th?'อื่น ๆ':'Other');
};

const studentPicture=(student)=>{
  const name=`${student?.displayName||''} ${student?.nickname||''}`.toLowerCase();
  if(name.includes('john')) return '/images/366.jpg';
  if(name.includes('devid') || name.includes('david')) return '/images/365.jpg';
  return student?.pictureUrl || '';
};

export default function StudentAdminPanel({lang}){
  const th=lang==='th';
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const [expanded,setExpanded]=useState({});

  const load=async()=>{
    setError('');
    try{
      const r=await fetch('/api/student?route=admin-students',{credentials:'include',cache:'no-store'});
      const j=await r.json();
      if(!r.ok||!j.success) throw new Error(j.message||'Unable to load');
      setData(j);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const act=async(body,key='admin')=>{
    setBusy(key); setError('');
    try{
      const r=await fetch('/api/student?route=admin-student-action',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j=await r.json(); if(!r.ok||!j.success) throw new Error(j.message||'Unable to save');
      await load(); return true;
    }catch(e){setError(e.message);return false;}finally{setBusy('');}
  };

  const setDay=(studentId)=>{
    const choice=window.prompt(th?'กำหนดสถานะวันนี้: 1 เรียนปกติ, 2 วันหยุด, 3 ป่วย, 4 อยู่บ้าน, 5 วันพิเศษ':'Today status: 1 school day, 2 no school, 3 sick, 4 at home, 5 special day','1');
    if(choice===null)return;
    const map={'1':'school_day','2':'no_school','3':'sick','4':'home','5':'special'};
    const dayType=map[choice]; if(!dayType)return;
    const note=window.prompt(th?'หมายเหตุ / เหตุผลของวันนี้':'Note / reason for today','')||'';
    act({action:'set_day_status',studentId,activityDate:data.today,dayType,note},`day-${studentId}`);
  };

  const assign=(studentId)=>{
    const titleTh=window.prompt(th?'มอบหมายงานอะไร?':'Assignment title (Thai or English)',''); if(!titleTh?.trim())return;
    const titleEn=window.prompt(th?'ชื่อภาษาอังกฤษ (เว้นว่างได้)':'English title (optional)','')||titleTh;
    const dueDate=window.prompt(th?'กำหนดเสร็จวันที่ (YYYY-MM-DD)':'Due date (YYYY-MM-DD)',data.today)||data.today;
    const note=window.prompt(th?'หมายเหตุ (ถ้ามี)':'Note (optional)','')||'';
    act({action:'create_assignment',studentId,titleTh,titleEn,dueDate,note},`assign-${studentId}`);
  };

  const sendMessage=(studentId)=>{
    const message=window.prompt(th?'ข้อความถึงเด็ก':'Message to student',''); if(!message?.trim())return;
    act({action:'send_message',studentId,message},`msg-${studentId}`);
  };

  const recordRoutine=(studentId,item)=>{
    let nutritionSource=item.entry?.nutrition_source||null,nutritionOther=item.entry?.nutrition_other||null;
    if(item.key==='dinner'){
      const defaultChoice=nutritionSource==='mother'?'2':nutritionSource==='other'?'3':'1';
      const c=window.prompt(th?'อาหารเย็น: 1 ทำเอง, 2 จากแม่, 3 อื่น ๆ':'Dinner: 1 self-cooked, 2 mother, 3 other',defaultChoice);
      const map={'1':'self_cooked','2':'mother','3':'other'}; nutritionSource=map[c]; if(!nutritionSource)return;
      if(nutritionSource==='other'){nutritionOther=window.prompt(th?'ระบุอาหาร/แหล่งที่มา':'Specify food/source',nutritionOther||''); if(!nutritionOther?.trim())return;}
    }
    const currentTime=item.entry?fmtTime(item.entry.completed_at,lang):new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    const actualTime=window.prompt(th?'เวลาที่ทำจริง (HH:MM)':'Actual completion time (HH:MM)',currentTime); if(!/^\d{2}:\d{2}$/.test(actualTime||''))return;
    const completedAt=`${data.today}T${actualTime}:00+07:00`;
    const reason=window.prompt(th?'เหตุผลที่ Admin บันทึก/แก้ไขแทน':'Reason Admin is recording/editing on student’s behalf',item.entry?'Admin แก้ไขข้อมูล':'Admin บันทึกแทน')||'Admin recorded on behalf of student';
    act({action:'complete_routine',studentId,activityKey:item.key,activityDate:data.today,completedAt,reason,nutritionSource,nutritionOther},`routine-${studentId}-${item.key}`);
  };

  const approve=(studentId,requestId,yes)=>{
    const note=window.prompt(th?'หมายเหตุของ Admin (ถ้ามี)':'Admin note (optional)','')||'';
    act({action:yes?'approve_home_request':'reject_home_request',studentId,requestId,note},`home-${requestId}`);
  };



  const setTomorrow=(studentId)=>{
    const choice=window.prompt(th?'พรุ่งนี้: 1 เรียนปกติ, 2 วันหยุด':'Tomorrow: 1 school day, 2 no school','1');
    if(choice===null)return;
    const dayType=choice==='1'?'school_day':choice==='2'?'no_school':''; if(!dayType)return;
    const note=window.prompt(th?'หมายเหตุ (ถ้ามี)':'Note (optional)','')||'';
    act({action:'set_tomorrow_school',studentId,dayType,note},`tomorrow-${studentId}`);
  };


  const setStayTomorrow=(studentId)=>{
    const note=window.prompt(th?'หมายเหตุ (ถ้ามี)':'Note (optional)','')||'';
    act({action:'set_tomorrow_location',studentId,locationPlan:'monastery',note},`stay-${studentId}`);
  };

  const createHome=(studentId)=>{
    const departureDate=window.prompt(th?'วันที่กลับบ้าน (YYYY-MM-DD)':'Home leave date (YYYY-MM-DD)',data.tomorrow); if(!departureDate)return;
    const expectedReturnDate=window.prompt(th?'วันที่คาดว่าจะกลับเข้าวัด (YYYY-MM-DD)':'Expected return date (YYYY-MM-DD)',data.tomorrow); if(!expectedReturnDate)return;
    const c=window.prompt(th?'วิธีกลับบ้าน: 1 แม่มารับ, 2 พี่มารับ, 3 มีคนไปส่ง, 4 กลับเอง, 5 อื่น ๆ':'Travel home: 1 mother, 2 sibling, 3 someone drives, 4 self, 5 other','1');
    const map={'1':'mother','2':'sibling','3':'someone_drives','4':'self','5':'other'}; const method=map[c]; if(!method)return;
    let methodOther=null; if(method==='other'){methodOther=window.prompt(th?'ระบุวิธีการกลับบ้าน':'Specify travel method',''); if(!methodOther?.trim())return;}
    const note=window.prompt(th?'หมายเหตุ (ถ้ามี)':'Note (optional)','')||'';
    act({action:'create_home_request',studentId,departureDate,expectedReturnDate,method,methodOther,note},`admin-home-${studentId}`);
  };

  const recordArrival=(studentId,requestId)=>{
    const c=window.prompt(th?'วิธีกลับมาวัด: 1 แม่มาส่ง, 2 พี่มาส่ง, 3 มาเอง, 4 อื่น ๆ':'Return to monastery: 1 mother, 2 sibling, 3 self, 4 other','1');
    const map={'1':'mother','2':'sibling','3':'self','4':'other'}; const method=map[c]; if(!method)return;
    let methodOther=null; if(method==='other'){methodOther=window.prompt(th?'ระบุวิธีกลับมาวัด':'Specify return method',''); if(!methodOther?.trim())return;}
    const note=window.prompt(th?'หมายเหตุ Admin':'Admin note','Admin บันทึกการกลับถึงวัดแทน')||'';
    act({action:'arrived_monastery',studentId,requestId,method,methodOther,note},`arrival-${studentId}`);
  };

  const createStudent=()=>{
    const displayName=window.prompt(th?'ชื่อเด็กที่แสดงในระบบ':'Student display name',''); if(!displayName?.trim())return;
    const username=window.prompt(th?'ชื่อผู้ใช้สำหรับ Login (อังกฤษ/ตัวเลข)':'Login username',''); if(!username?.trim())return;
    const pin=window.prompt(th?'กำหนด PIN 4–6 ตัวเลข':'Set a 4–6 digit PIN',''); if(!/^\d{4,6}$/.test(pin||'')) return alert(th?'PIN ต้องเป็นตัวเลข 4–6 หลัก':'PIN must be 4–6 digits.');
    act({action:'create_student',displayName,username,pin},'create-student');
  };

  const resetPin=(studentId)=>{
    const pin=window.prompt(th?'ตั้ง PIN ใหม่ 4–6 ตัวเลข':'Set a new 4–6 digit PIN',''); if(!/^\d{4,6}$/.test(pin||''))return;
    act({action:'reset_pin',studentId,pin},`pin-${studentId}`);
  };

  const students=data?.students||[];
  const alerts=useMemo(()=>students.reduce((n,s)=>n+s.routine.filter(x=>['late','overdue_no_record','nutrition_missing'].includes(x.status)).length,0),[students]);

  return <section style={{margin:'0 0 30px'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:12}}>
      <div><div style={{fontSize:12,fontWeight:800,letterSpacing:'.08em',color:'#8b6d3c'}}>{th?'เด็กวัดวันนี้':'TEMPLE STUDENTS TODAY'}</div><h2 style={{margin:'3px 0 0',fontSize:24,color:'#3b352e'}}>{th?'กิจวัตรเด็กวัด':'Temple Student Routine'}</h2></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>{alerts>0&&<span style={{fontSize:12,fontWeight:800,color:'#9d4232',background:'#fff2ef',border:'1px solid #eed0c9',borderRadius:99,padding:'6px 9px'}}>{th?`มี ${alerts} จุดต้องตรวจ`:`${alerts} items need review`}</span>}{students.length<2&&<button onClick={createStudent} style={ghostBtn}><RoutineIcon type="plus" size={16}/>{th?'เพิ่มเด็กวัด':'Add Student'}</button>}<button onClick={load} style={ghostBtn}>{th?'โหลดใหม่':'Refresh'}</button></div>
    </div>
    {loading&&<div style={infoBox}>{th?'กำลังโหลดข้อมูลเด็กวัด...':'Loading student data...'}</div>}
    {error&&<div style={{...infoBox,background:'#fff3f0',color:'#942e2e',borderColor:'#efcfc8'}}>{error}</div>}
    {!loading&&!students.length&&<div style={infoBox}>{th?'ยังไม่มีเด็กวัดในระบบ ใช้คำสั่ง SQL หรือ API สร้างบัญชีเด็กหลังทราบชื่อจริง':'No temple students have been created yet. Create the two student accounts after their names are confirmed.'}</div>}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(310px,1fr))',gap:14}}>
      {students.map(s=>{
        const st=s.student;
        const done=s.routine.filter(x=>x.active&&x.entry).length;
        const active=s.routine.filter(x=>x.active).length;
        const wake=s.routine.find(x=>x.key==='wake_up');
        const school=s.routine.find(x=>x.key==='leave_for_school');
        const returned=s.routine.find(x=>x.key==='return_from_school');
        const dinner=s.routine.find(x=>x.key==='dinner');
        const shower=s.routine.find(x=>x.key==='shower');
        const bed=s.routine.find(x=>x.key==='bedtime');
        const pending=s.homeRequests.find(r=>r.status==='pending');
        const currentHome=s.homeRequests.find(r=>r.status==='approved'&&!r.return_arrived_at);
        const open=expanded[st.id];
        return <article key={st.id} style={{background:'#fff',border:'1px solid #ddd6cb',borderRadius:16,padding:15,boxShadow:'0 6px 18px rgba(51,42,28,.04)'}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:54,height:54,borderRadius:14,background:'#eee8dc',overflow:'hidden',display:'grid',placeItems:'center',color:'#775c31'}}>
              {studentPicture(st)
                ? <img src={studentPicture(st)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <RoutineIcon type="profile" size={27}/>}
            </div>
            <div style={{flex:1,minWidth:0}}><strong style={{fontSize:18,color:'#37322c'}}>{st.nickname||st.displayName}</strong><div style={{fontSize:12,color:'#82796d'}}>{done}/{active} {th?'รายการ':'items'} · {dayTypeLabel(s.dayStatus?.day_type,th)}</div></div>
            <button onClick={()=>setExpanded(v=>({...v,[st.id]:!open}))} style={ghostBtn}>{open?(th?'ย่อ':'Less'):(th?'ดูและจัดการ':'View & Manage')}</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginTop:13}}>
            <Mini icon="wake_up" label={th?'ตื่น':'Wake'} item={wake} th={th} lang={lang}/><Mini icon="leave_for_school" label={th?'ไปโรงเรียน':'School'} item={school} th={th} lang={lang}/><Mini icon="return_from_school" label={th?'กลับวัด':'Returned'} item={returned} th={th} lang={lang}/><Mini icon="dinner" label={th?'ข้าวเย็น':'Dinner'} item={dinner} th={th} lang={lang}/><Mini icon="shower" label={th?'อาบน้ำ':'Shower'} item={shower} th={th} lang={lang}/><Mini icon="bedtime" label={th?'เข้านอน':'Bedtime'} item={bed} th={th} lang={lang}/>
          </div>
          <div style={{marginTop:9,padding:'8px 10px',borderRadius:9,background:s.tomorrowPlan?'#f1f5f1':'#fff7e9',border:`1px solid ${s.tomorrowPlan?'#d6e0d7':'#ead7ae'}`,fontSize:12,color:'#665e54',display:'flex',gap:7,alignItems:'center'}}><RoutineIcon type="calendar" size={16}/><strong>{th?'แผนพรุ่งนี้:':'Tomorrow:'}</strong><span>{s.tomorrowPlan?(s.tomorrowPlan.location_plan==='monastery'?(th?'อยู่ที่วัด':'Stay at monastery'):(th?'ขอกลับบ้าน':'Home leave')):(th?'ยังไม่ได้แจ้ง':'Not reported yet')}</span></div>

          {pending&&<div style={{marginTop:10,padding:11,borderRadius:11,background:'#fff7e8',border:'1px solid #ead4a5'}}><strong style={{display:'block',fontSize:13}}>{th?'คำขอกลับบ้านรออนุมัติ':'Home request pending'}</strong><div style={{fontSize:12,color:'#73685c',margin:'3px 0 8px'}}>{pending.departure_date} → {pending.expected_return_date}</div><div style={{display:'flex',gap:7}}><button disabled={busy===`home-${pending.id}`} onClick={()=>approve(st.id,pending.id,true)} style={{...smallAction,background:'#355f48'}}>{th?'อนุมัติ':'Approve'}</button><button disabled={busy===`home-${pending.id}`} onClick={()=>approve(st.id,pending.id,false)} style={{...smallAction,background:'#9a4539'}}>{th?'ไม่อนุมัติ':'Reject'}</button></div></div>}
          {currentHome&&<div style={{marginTop:10,padding:11,borderRadius:11,background:'#edf5f0',border:'1px solid #c9dfd2'}}><strong style={{display:'block',fontSize:13}}>{th?'กำลังกลับบ้าน / ยังไม่บันทึกว่ากลับถึงวัด':'Home leave active / return not recorded'}</strong><div style={{fontSize:12,color:'#5e6f64',margin:'3px 0 8px'}}>{currentHome.departure_date} → {currentHome.expected_return_date}</div><button disabled={busy===`arrival-${st.id}`} onClick={()=>recordArrival(st.id,currentHome.id)} style={{...smallAction,background:'#355f48'}}>{th?'บันทึกว่ากลับถึงวัดแล้ว':'Record Return to Monastery'}</button></div>}

          {open&&<div style={{marginTop:13,borderTop:'1px solid #ece6dd',paddingTop:12}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:12}}><button onClick={()=>setDay(st.id)} style={ghostBtn}><RoutineIcon type="calendar" size={16}/>{th?'กำหนดสถานะวันนี้':'Set Today Status'}</button><button onClick={()=>setTomorrow(st.id)} style={ghostBtn}><RoutineIcon type="calendar" size={16}/>{th?'กำหนดเรียนพรุ่งนี้':'Set School Tomorrow'}</button><button onClick={()=>setStayTomorrow(st.id)} style={ghostBtn}><RoutineIcon type="home" size={16}/>{th?'พรุ่งนี้อยู่วัด':'Stay Tomorrow'}</button><button onClick={()=>createHome(st.id)} style={ghostBtn}><RoutineIcon type="home" size={16}/>{th?'บันทึกกลับบ้านแทน':'Home Leave'}</button><button onClick={()=>assign(st.id)} style={ghostBtn}><RoutineIcon type="plus" size={16}/>{th?'มอบหมายงาน':'Assign Task'}</button><button onClick={()=>sendMessage(st.id)} style={ghostBtn}><RoutineIcon type="message" size={16}/>{th?'ส่งข้อความ':'Message'}</button><button onClick={()=>resetPin(st.id)} style={ghostBtn}><RoutineIcon type="settings" size={16}/>{th?'เปลี่ยน PIN':'Reset PIN'}</button></div>
            <div style={{fontSize:12,fontWeight:800,color:'#796c5c',marginBottom:7}}>{th?'ADMIN ทำแทนเด็ก':'ADMIN RECORD ON BEHALF'}</div>
            <div style={{display:'grid',gap:6}}>{s.routine.filter(x=>x.active).map(item=><button key={item.key} disabled={busy===`routine-${st.id}-${item.key}`} onClick={()=>recordRoutine(st.id,item)} style={{...rowBtn,borderColor:item.status==='overdue_no_record'?'#e5b9af':'#e6e0d6'}}><RoutineIcon type={item.key} size={17}/><span style={{flex:1,textAlign:'left'}}>{th?item.label.th:item.label.en}{item.entry&&<small style={{display:'block',color:'#7c746a'}}>{fmtTime(item.entry.completed_at,lang)} · {th?'บันทึกโดย':'by'} {item.entry.completed_by}</small>}</span>{item.status==='overdue_no_record'&&<span style={{fontSize:11,color:'#a14737'}}>{th?'เกินเวลา':'Overdue'}</span>}<span style={{fontSize:11,fontWeight:800,color:'#795f36'}}>{item.entry?(th?'แก้ไข':'Edit'):(th?'บันทึกแทน':'Record')}</span></button>)}</div>
            {!!s.assignments.length&&<div style={{marginTop:12,fontSize:12,color:'#71675c'}}><strong>{th?'งานมอบหมาย':'Assignments'}:</strong> {s.assignments.filter(a=>!a.completed_at).length} {th?'งานยังไม่เสร็จ':'open'}</div>}
            {!!s.messages.length&&<div style={{marginTop:7,fontSize:12,color:'#71675c'}}><strong>{th?'ข้อความล่าสุด':'Latest message'}:</strong> {s.messages[s.messages.length-1]?.message}</div>}
          </div>}
        </article>;
      })}
    </div>
  </section>;
}

function Mini({icon,label,item,th,lang}){
  const warn=item&&['late','overdue_no_record','nutrition_missing'].includes(item.status);
  let text='—';
  if(item?.entry) text=fmtTime(item.entry.completed_at,lang);
  if(item?.status==='late') text+=` · +${item.lateMinutes} ${th?'น.':'m'}`;
  if(item?.status==='overdue_no_record') text=`${th?'ยังไม่บันทึก':'No record'} · +${item.lateMinutes}`;
  if(item?.status==='not_required') text=th?'ไม่ใช้วันนี้':'Not required';
  if(item?.key==='dinner'&&item.entry) text+=` · ${nutritionLabel(item.entry,th)}`;
  return <div style={{padding:9,border:'1px solid #e7e1d7',borderRadius:10,background:warn?'#fff7f4':'#faf9f6',display:'flex',gap:8,alignItems:'center',minWidth:0}}><span style={{color:warn?'#a24737':'#77634a'}}><RoutineIcon type={icon} size={18}/></span><span style={{minWidth:0}}><small style={{display:'block',fontSize:10,color:'#887e72'}}>{label}</small><strong style={{display:'block',fontSize:12,color:warn?'#9c4032':'#48413a',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{text}</strong></span></div>
}
function dayTypeLabel(type,th){const m={school_day:th?'วันเรียน':'School Day',no_school:th?'วันหยุด':'No School',sick:th?'ป่วย':'Sick',home:th?'อยู่บ้าน':'At Home',special:th?'วันพิเศษ':'Special'};return m[type]||type||'—'}
const infoBox={padding:14,border:'1px solid #ded7cb',borderRadius:12,background:'#faf8f4',color:'#6d655a',marginBottom:12};
const ghostBtn={border:'1px solid #d7cfc2',background:'#fff',borderRadius:9,padding:'7px 9px',fontWeight:700,color:'#524b42',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5};
const smallAction={border:0,borderRadius:8,padding:'7px 9px',color:'#fff',fontWeight:800,cursor:'pointer'};
const rowBtn={border:'1px solid #e6e0d6',borderRadius:9,padding:'8px 9px',background:'#fff',display:'flex',alignItems:'center',gap:8,color:'#504840',cursor:'pointer'};
