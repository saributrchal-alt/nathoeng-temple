import { sb, q, defaultDayType, weekdayForBangkokDate, bangkokParts } from './_student-db.js';

export const ROUTINES = [
  { key: 'wake_up', section: 'morning', timeRule: '05:45', schoolOnly: false },
  { key: 'clean_sala', section: 'morning', schoolOnly: false },
  { key: 'receive_alms_items', section: 'morning', schoolOnly: false },
  { key: 'offer_meal', section: 'morning', schoolOnly: false },
  { key: 'clear_room', section: 'morning', schoolOnly: false },
  { key: 'leave_for_school', section: 'morning', timeRule: '07:20', schoolOnly: true },
  { key: 'return_from_school', section: 'after_school', schoolOnly: true },
  { key: 'prepare_uniform', section: 'evening', schoolOnly: true },
  { key: 'homework_done', section: 'evening', schoolOnly: true },
  { key: 'dinner', section: 'evening', schoolOnly: false, nutrition: true },
  { key: 'shower', section: 'evening', schoolOnly: false },
  { key: 'bedtime', section: 'evening', timeRule: '22:30', schoolOnly: false }
];

export const LABELS = {
  wake_up: { th: 'ตื่นนอน', en: 'Wake Up' },
  clean_sala: { th: 'เก็บกวาด / ถูศาลา', en: 'Sweep / Mop the Sala' },
  receive_alms_items: { th: 'ออกช่วยรับของพระบิณฑบาต', en: 'Help Receive Alms Items' },
  offer_meal: { th: 'ถวายภัตตาหารพระ', en: 'Offer the Monks’ Meal' },
  clear_room: { th: 'เก็บสายไฟ / ปิดสวิตช์ไฟ / เคลียร์ขยะที่ห้อง', en: 'Clear Cables, Switches and Room Waste' },
  leave_for_school: { th: 'ออกจากวัดไปโรงเรียน', en: 'Leave the Monastery for School' },
  return_from_school: { th: 'กลับจากโรงเรียนถึงวัด', en: 'Return to the Monastery from School' },
  prepare_uniform: { th: 'รีดผ้าชุดนักเรียน / เตรียมชุดวันต่อไป', en: 'Prepare School Uniform for Tomorrow' },
  homework_done: { th: 'การบ้านเรียบร้อย', en: 'Homework Completed' },
  dinner: { th: 'ทานข้าวเย็น', en: 'Dinner' },
  shower: { th: 'ผมอาบน้ำแล้ว', en: 'I’ve Taken a Shower' },
  bedtime: { th: 'เข้านอน', en: 'Bedtime' }
};

export async function getDayStatus(studentId, date) {
  const rows = await sb(`/rest/v1/student_day_status?student_id=eq.${q(studentId)}&activity_date=eq.${q(date)}&select=*&limit=1`);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (row) return row;
  return {
    student_id: studentId,
    activity_date: date,
    day_type: defaultDayType(date),
    source: 'system',
    note: null
  };
}

export async function getEntries(studentId, date) {
  const rows = await sb(`/rest/v1/student_routine_entries?student_id=eq.${q(studentId)}&activity_date=eq.${q(date)}&select=*&order=completed_at.asc`);
  return Array.isArray(rows) ? rows : [];
}

function isSchoolDay(dayStatus) {
  return dayStatus?.day_type === 'school_day';
}

function isAwayDay(dayStatus) {
  return ['home', 'sick'].includes(dayStatus?.day_type);
}

function minutesNowBangkok() {
  const p = bangkokParts();
  return Number(p.hour) * 60 + Number(p.minute);
}

function ruleMinutes(rule) {
  if (!rule) return null;
  const [h, m] = rule.split(':').map(Number);
  return h * 60 + m;
}

function completedMinutesBangkok(isoTimestamp) {
  const p = bangkokParts(new Date(isoTimestamp));
  return Number(p.hour) * 60 + Number(p.minute);
}

export function buildRoutineState(dayStatus, entries, isToday = true) {
  const entryMap = Object.fromEntries(entries.map(e => [e.activity_key, e]));
  const schoolDay = isSchoolDay(dayStatus);
  const away = isAwayDay(dayStatus);
  const nowMinutes = minutesNowBangkok();

  return ROUTINES.map(def => {
    const entry = entryMap[def.key] || null;
    const active = !away && (!def.schoolOnly || schoolDay);
    const target = ruleMinutes(def.timeRule);
    let lateMinutes = 0;
    let status = active ? 'pending' : 'not_required';

    if (entry) {
      status = 'done';
      if (target != null) {
        lateMinutes = Math.max(0, completedMinutesBangkok(entry.completed_at) - target);
        if (lateMinutes > 0) status = 'late';
      }
      if (def.nutrition && !entry.nutrition_source) status = 'nutrition_missing';
    } else if (active && isToday && target != null && nowMinutes > target) {
      lateMinutes = nowMinutes - target;
      status = 'overdue_no_record';
    }

    return {
      ...def,
      label: LABELS[def.key],
      active,
      status,
      lateMinutes,
      entry
    };
  });
}

export async function getAssignments(studentId, date) {
  const rows = await sb(`/rest/v1/student_assignments?student_id=eq.${q(studentId)}&assigned_date=lte.${q(date)}&due_date=gte.${q(date)}&select=*&order=created_at.asc`);
  return Array.isArray(rows) ? rows : [];
}


export async function getDayPlan(studentId, date) {
  const rows = await sb(`/rest/v1/student_day_plans?student_id=eq.${q(studentId)}&plan_date=eq.${q(date)}&select=*&limit=1`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function getHomeRequests(studentId, limit = 10) {
  const rows = await sb(`/rest/v1/student_home_requests?student_id=eq.${q(studentId)}&select=*&order=created_at.desc&limit=${limit}`);
  return Array.isArray(rows) ? rows : [];
}

export async function getMessages(studentId, limit = 50) {
  const rows = await sb(`/rest/v1/student_messages?student_id=eq.${q(studentId)}&select=*&order=created_at.desc&limit=${limit}`);
  return Array.isArray(rows) ? rows.reverse() : [];
}
