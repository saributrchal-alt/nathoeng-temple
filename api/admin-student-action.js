import { requireAdmin } from './_auth.js';
import { sb, q, todayBangkok, addDaysBangkok, getStudentById, listStudents } from './_student-db.js';
import { ROUTINES } from './_student-routine.js';
import { makePinRecord } from './_student-security.js';

const DAY_TYPES = ['school_day', 'no_school', 'sick', 'home', 'special'];
const NUTRITION = ['self_cooked', 'mother', 'other'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireAdmin(req, res);
  if (!session) return;
  const action = req.body?.action;

  try {
    if (action === 'create_student') {
      const existingStudents = await listStudents();
      if (existingStudents.length >= 2) return res.status(400).json({ success: false, message: 'This system is limited to two active temple students' });
      const displayName = String(req.body?.displayName || '').trim();
      const username = String(req.body?.username || '').trim().toLowerCase();
      const pin = String(req.body?.pin || '').trim();
      if (!displayName || !/^[a-z0-9._-]{2,30}$/.test(username) || !/^\d{4,6}$/.test(pin)) {
        return res.status(400).json({ success: false, message: 'Name, username and 4–6 digit PIN are required' });
      }
      const pinRecord = makePinRecord(pin);
      const rows = await sb('/rest/v1/temple_students', {
        method: 'POST', headers: { Prefer: 'return=representation' }, body: [{
          display_name: displayName, username, ...pinRecord, display_order: Number(req.body?.displayOrder || 0), is_active: true
        }]
      });
      return res.status(200).json({ success: true, student: rows?.[0] || null });
    }

    const studentId = String(req.body?.studentId || '');
    if (!studentId || !(await getStudentById(studentId))) return res.status(404).json({ success: false, message: 'Student not found' });

    if (action === 'reset_pin') {
      const pin = String(req.body?.pin || '').trim();
      if (!/^\d{4,6}$/.test(pin)) return res.status(400).json({ success: false, message: 'PIN must be 4–6 digits' });
      await sb(`/rest/v1/temple_students?id=eq.${q(studentId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: makePinRecord(pin) });
      return res.status(200).json({ success: true });
    }

    if (action === 'complete_routine') {
      const key = String(req.body?.activityKey || '');
      if (!ROUTINES.some(r => r.key === key)) return res.status(400).json({ success: false, message: 'Invalid activity' });
      const activityDate = String(req.body?.activityDate || todayBangkok());
      const completedAt = req.body?.completedAt ? new Date(req.body.completedAt) : new Date();
      if (Number.isNaN(completedAt.getTime())) return res.status(400).json({ success: false, message: 'Invalid completion time' });
      let nutritionSource = null;
      let nutritionOther = null;
      if (key === 'dinner') {
        nutritionSource = String(req.body?.nutritionSource || '');
        nutritionOther = String(req.body?.nutritionOther || '').trim() || null;
        if (!NUTRITION.includes(nutritionSource)) return res.status(400).json({ success: false, message: 'Dinner source is required' });
      }
      const rows = await sb('/rest/v1/student_routine_entries?on_conflict=student_id,activity_date,activity_key', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: [{
          student_id: studentId, activity_date: activityDate, activity_key: key,
          completed_at: completedAt.toISOString(), completed_by: 'admin',
          admin_reason: String(req.body?.reason || '').trim() || 'Admin recorded on behalf of student',
          nutrition_source: nutritionSource, nutrition_other: nutritionOther
        }]
      });
      return res.status(200).json({ success: true, entry: rows?.[0] || null });
    }

    if (action === 'set_day_status') {
      const activityDate = String(req.body?.activityDate || todayBangkok());
      const dayType = String(req.body?.dayType || '');
      if (!DAY_TYPES.includes(dayType)) return res.status(400).json({ success: false, message: 'Invalid day type' });
      const note = String(req.body?.note || '').trim() || null;
      const rows = await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: [{
          student_id: studentId, activity_date: activityDate, day_type: dayType, source: 'admin', note
        }]
      });
      return res.status(200).json({ success: true, dayStatus: rows?.[0] || null });
    }

    if (action === 'send_message') {
      const message = String(req.body?.message || '').trim();
      if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
      const rows = await sb('/rest/v1/student_messages', { method: 'POST', headers: { Prefer: 'return=representation' }, body: [{
        student_id: studentId, sender_type: 'admin', message: message.slice(0, 2000)
      }] });
      return res.status(200).json({ success: true, message: rows?.[0] || null });
    }

    if (action === 'create_assignment') {
      const titleTh = String(req.body?.titleTh || '').trim();
      const titleEn = String(req.body?.titleEn || '').trim();
      const assignedDate = String(req.body?.assignedDate || todayBangkok());
      const dueDate = String(req.body?.dueDate || assignedDate);
      if (!titleTh && !titleEn) return res.status(400).json({ success: false, message: 'Assignment title is required' });
      const rows = await sb('/rest/v1/student_assignments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: [{
        student_id: studentId, title_th: titleTh || titleEn, title_en: titleEn || titleTh,
        assigned_date: assignedDate, due_date: dueDate, note: String(req.body?.note || '').trim() || null,
        created_by: 'admin'
      }] });
      return res.status(200).json({ success: true, assignment: rows?.[0] || null });
    }



    if (action === 'set_tomorrow_location') {
      const tomorrow = addDaysBangkok(todayBangkok(), 1);
      const locationPlan = String(req.body?.locationPlan || '');
      if (!['monastery'].includes(locationPlan)) return res.status(400).json({ success: false, message: 'Invalid location plan' });
      await sb('/rest/v1/student_day_plans?on_conflict=student_id,plan_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' },
        body: [{ student_id: studentId, plan_date: tomorrow, location_plan: locationPlan, source: 'admin', note: String(req.body?.note || '').trim() || null }]
      });
      return res.status(200).json({ success: true });
    }

    if (action === 'create_home_request') {
      const departureDate = String(req.body?.departureDate || todayBangkok());
      const expectedReturnDate = String(req.body?.expectedReturnDate || '');
      const method = String(req.body?.method || '');
      const allowed = ['mother','sibling','someone_drives','self','other'];
      const methodOther = String(req.body?.methodOther || '').trim() || null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expectedReturnDate) || !allowed.includes(method)) {
        return res.status(400).json({ success: false, message: 'Home request information is incomplete' });
      }
      if (method === 'other' && !methodOther) return res.status(400).json({ success: false, message: 'Please specify the travel method' });
      const rows = await sb('/rest/v1/student_home_requests', {
        method: 'POST', headers: { Prefer: 'return=representation' }, body: [{
          student_id: studentId, departure_date: departureDate, expected_return_date: expectedReturnDate,
          departure_method: method, departure_method_other: methodOther,
          status: 'approved', requested_by: 'admin', admin_note: String(req.body?.note || '').trim() || 'Admin created and approved home leave',
          decided_at: new Date().toISOString()
        }]
      });
      const reqRow = rows?.[0];
      await sb('/rest/v1/student_day_plans?on_conflict=student_id,plan_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' },
        body: [{ student_id: studentId, plan_date: departureDate, location_plan: 'home', source: 'admin', note: 'Admin-recorded home leave' }]
      });
      if (reqRow) {
        const days = [];
        let d = reqRow.departure_date;
        let guard = 0;
        while (d <= reqRow.expected_return_date && guard < 31) {
          days.push({ student_id: studentId, activity_date: d, day_type: 'home', source: 'admin', note: 'Admin-approved home leave' });
          d = addDaysBangkok(d, 1);
          guard += 1;
        }
        if (days.length) await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: days });
      }
      return res.status(200).json({ success: true, request: reqRow || null });
    }

    if (action === 'approve_home_request' || action === 'reject_home_request') {
      const requestId = String(req.body?.requestId || '');
      const status = action === 'approve_home_request' ? 'approved' : 'rejected';
      const rows = await sb(`/rest/v1/student_home_requests?id=eq.${q(requestId)}&student_id=eq.${q(studentId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: {
          status, admin_note: String(req.body?.note || '').trim() || null, decided_at: new Date().toISOString()
        }
      });
      if (status === 'approved') {
        const reqRow = rows?.[0];
        if (reqRow?.departure_date && reqRow?.expected_return_date) {
          const days = [];
          let d = reqRow.departure_date;
          let guard = 0;
          while (d <= reqRow.expected_return_date && guard < 31) {
            days.push({
              student_id: studentId,
              activity_date: d,
              day_type: 'home',
              source: 'admin',
              note: 'Approved home leave'
            });
            d = addDaysBangkok(d, 1);
            guard += 1;
          }
          if (days.length) {
            await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', {
              method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: days
            });
          }
        }
      }
      return res.status(200).json({ success: true, request: rows?.[0] || null });
    }

    if (action === 'arrived_monastery') {
      const requestId = String(req.body?.requestId || '');
      const method = String(req.body?.method || 'other');
      const methodOther = String(req.body?.methodOther || '').trim() || null;
      const rows = await sb(`/rest/v1/student_home_requests?id=eq.${q(requestId)}&student_id=eq.${q(studentId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: {
          return_arrived_at: new Date().toISOString(), return_method: method, return_method_other: methodOther,
          admin_note: String(req.body?.note || '').trim() || 'Admin recorded return to monastery'
        }
      });
      return res.status(200).json({ success: true, request: rows?.[0] || null });
    }

    if (action === 'set_tomorrow_school') {
      const dayType = String(req.body?.dayType || '');
      if (!['school_day', 'no_school'].includes(dayType)) return res.status(400).json({ success: false, message: 'Invalid day type' });
      const tomorrow = addDaysBangkok(todayBangkok(), 1);
      await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: [{
          student_id: studentId, activity_date: tomorrow, day_type: dayType, source: 'admin', note: String(req.body?.note || '').trim() || null
        }]
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });
  } catch (error) {
    console.error('Admin student action error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to update student' });
  }
}
