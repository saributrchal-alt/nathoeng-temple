import { requireStudent } from './_auth.js';
import { sb, q, todayBangkok, addDaysBangkok, defaultDayType } from './_student-db.js';
import { ROUTINES } from './_student-routine.js';

const ALLOWED_HOME_METHODS = ['mother', 'sibling', 'someone_drives', 'self', 'other'];
const ALLOWED_RETURN_METHODS = ['mother', 'sibling', 'self', 'other'];
const ALLOWED_NUTRITION = ['self_cooked', 'mother', 'other'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireStudent(req, res);
  if (!session) return;
  const studentId = session.studentId;
  const action = req.body?.action;

  try {
    if (action === 'complete_routine') {
      const key = String(req.body?.activityKey || '');
      const def = ROUTINES.find(r => r.key === key);
      if (!def) return res.status(400).json({ success: false, message: 'Invalid activity' });
      const date = todayBangkok();
      let nutritionSource = null;
      let nutritionOther = null;
      if (key === 'dinner') {
        nutritionSource = String(req.body?.nutritionSource || '');
        nutritionOther = String(req.body?.nutritionOther || '').trim() || null;
        if (!ALLOWED_NUTRITION.includes(nutritionSource)) {
          return res.status(400).json({ success: false, message: 'Dinner source is required' });
        }
        if (nutritionSource === 'other' && !nutritionOther) {
          return res.status(400).json({ success: false, message: 'Please specify the dinner source' });
        }
      }

      const existing = await sb(`/rest/v1/student_routine_entries?student_id=eq.${q(studentId)}&activity_date=eq.${q(date)}&activity_key=eq.${q(key)}&select=id,completed_at`);
      if (Array.isArray(existing) && existing.length) {
        return res.status(409).json({ success: false, message: 'This activity has already been recorded' });
      }

      const rows = await sb('/rest/v1/student_routine_entries', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: [{
          student_id: studentId,
          activity_date: date,
          activity_key: key,
          completed_at: new Date().toISOString(),
          completed_by: 'student',
          nutrition_source: nutritionSource,
          nutrition_other: nutritionOther
        }]
      });
      return res.status(200).json({ success: true, entry: rows?.[0] || null });
    }

    if (action === 'set_tomorrow_school') {
      const tomorrow = addDaysBangkok(todayBangkok(), 1);
      const dayType = req.body?.dayType;
      if (!['school_day', 'no_school'].includes(dayType)) {
        return res.status(400).json({ success: false, message: 'Invalid day type' });
      }
      const rows = await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: [{ student_id: studentId, activity_date: tomorrow, day_type: dayType, source: 'student', note: null }]
      });
      return res.status(200).json({ success: true, dayStatus: rows?.[0] || null });
    }


    if (action === 'set_tomorrow_location') {
      const tomorrow = addDaysBangkok(todayBangkok(), 1);
      const locationPlan = String(req.body?.locationPlan || '');
      if (!['monastery'].includes(locationPlan)) {
        return res.status(400).json({ success: false, message: 'Invalid location plan' });
      }
      const rows = await sb('/rest/v1/student_day_plans?on_conflict=student_id,plan_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: [{ student_id: studentId, plan_date: tomorrow, location_plan: locationPlan, source: 'student', note: null }]
      });
      return res.status(200).json({ success: true, plan: rows?.[0] || null });
    }

    if (action === 'request_home') {
      const departureDate = String(req.body?.departureDate || todayBangkok());
      const expectedReturnDate = String(req.body?.expectedReturnDate || '');
      const method = String(req.body?.method || '');
      const methodOther = String(req.body?.methodOther || '').trim() || null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(expectedReturnDate)) return res.status(400).json({ success: false, message: 'Expected return date is required' });
      if (!ALLOWED_HOME_METHODS.includes(method)) return res.status(400).json({ success: false, message: 'Return-home method is required' });
      if (method === 'other' && !methodOther) return res.status(400).json({ success: false, message: 'Please specify the method' });

      const rows = await sb('/rest/v1/student_home_requests', {
        method: 'POST', headers: { Prefer: 'return=representation' }, body: [{
          student_id: studentId, departure_date: departureDate, expected_return_date: expectedReturnDate,
          departure_method: method, departure_method_other: methodOther,
          status: 'pending', requested_by: 'student', note: String(req.body?.note || '').trim() || null
        }]
      });
      await sb('/rest/v1/student_day_plans?on_conflict=student_id,plan_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' },
        body: [{ student_id: studentId, plan_date: departureDate, location_plan: 'home', source: 'student', note: 'Home leave requested' }]
      });
      return res.status(200).json({ success: true, request: rows?.[0] || null });
    }

    if (action === 'arrived_monastery') {
      const requestId = String(req.body?.requestId || '');
      const method = String(req.body?.method || '');
      const methodOther = String(req.body?.methodOther || '').trim() || null;
      if (!requestId || !ALLOWED_RETURN_METHODS.includes(method)) return res.status(400).json({ success: false, message: 'Return information is incomplete' });
      if (method === 'other' && !methodOther) return res.status(400).json({ success: false, message: 'Please specify the method' });

      const rows = await sb(`/rest/v1/student_home_requests?id=eq.${q(requestId)}&student_id=eq.${q(studentId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: {
          return_arrived_at: new Date().toISOString(), return_method: method, return_method_other: methodOther
        }
      });
      await sb('/rest/v1/student_day_status?on_conflict=student_id,activity_date', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: [{
          student_id: studentId, activity_date: todayBangkok(), day_type: defaultDayType(todayBangkok()), source: 'student', note: 'Returned to monastery'
        }]
      });
      return res.status(200).json({ success: true, request: rows?.[0] || null });
    }

    if (action === 'complete_assignment') {
      const assignmentId = String(req.body?.assignmentId || '');
      const rows = await sb(`/rest/v1/student_assignments?id=eq.${q(assignmentId)}&student_id=eq.${q(studentId)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: { completed_at: new Date().toISOString(), completed_by: 'student' }
      });
      return res.status(200).json({ success: true, assignment: rows?.[0] || null });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });
  } catch (error) {
    console.error('Student action error:', error);
    return res.status(500).json({ success: false, message: 'Unable to save student activity' });
  }
}
