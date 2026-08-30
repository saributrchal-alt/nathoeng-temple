import { requireStudent } from './_auth.js';
import { getStudentById, todayBangkok, addDaysBangkok } from './_student-db.js';
import { getDayStatus, getEntries, buildRoutineState, getAssignments, getHomeRequests, getMessages, getDayPlan } from './_student-routine.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireStudent(req, res);
  if (!session) return;

  try {
    const student = await getStudentById(session.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const today = todayBangkok();
    const tomorrow = addDaysBangkok(today, 1);
    const [dayStatus, tomorrowStatus, tomorrowPlan, entries, assignments, homeRequests, messages] = await Promise.all([
      getDayStatus(student.id, today), getDayStatus(student.id, tomorrow), getDayPlan(student.id, tomorrow), getEntries(student.id, today),
      getAssignments(student.id, today), getHomeRequests(student.id, 10), getMessages(student.id, 50)
    ]);

    const routine = buildRoutineState(dayStatus, entries, true);
    return res.status(200).json({
      success: true,
      now: new Date().toISOString(),
      today,
      tomorrow,
      student: {
        id: student.id, displayName: student.display_name, nickname: student.nickname || '',
        schoolName: student.school_name || '', gradeLevel: student.grade_level || '',
        aboutMe: student.about_me || '', pictureUrl: student.profile_photo_path ? `/api/student-photo?studentId=${student.id}&v=${encodeURIComponent(student.updated_at || '')}` : ''
      },
      dayStatus,
      tomorrowStatus,
      tomorrowPlan,
      routine,
      assignments,
      homeRequests,
      messages
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load student dashboard' });
  }
}
