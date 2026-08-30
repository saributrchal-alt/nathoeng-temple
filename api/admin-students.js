import { requireAdmin } from './_auth.js';
import { listStudents, todayBangkok, addDaysBangkok } from './_student-db.js';
import { getDayStatus, getEntries, buildRoutineState, getAssignments, getHomeRequests, getMessages, getDayPlan } from './_student-routine.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireAdmin(req, res);
  if (!session) return;

  try {
    const students = await listStudents();
    const today = todayBangkok();
    const tomorrow = addDaysBangkok(today, 1);
    const data = await Promise.all(students.map(async student => {
      const [dayStatus, tomorrowStatus, tomorrowPlan, entries, assignments, homeRequests, messages] = await Promise.all([
        getDayStatus(student.id, today), getDayStatus(student.id, tomorrow), getDayPlan(student.id, tomorrow), getEntries(student.id, today),
        getAssignments(student.id, today), getHomeRequests(student.id, 8), getMessages(student.id, 20)
      ]);
      return {
        student: {
          id: student.id, displayName: student.display_name, nickname: student.nickname || '',
          pictureUrl: student.profile_photo_path ? `/api/student-photo?studentId=${student.id}&v=${encodeURIComponent(student.updated_at || '')}` : '', schoolName: student.school_name || '', gradeLevel: student.grade_level || ''
        },
        dayStatus, tomorrowStatus, tomorrowPlan,
        routine: buildRoutineState(dayStatus, entries, true),
        assignments, homeRequests, messages
      };
    }));

    return res.status(200).json({ success: true, today, tomorrow, students: data });
  } catch (error) {
    console.error('Admin students error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load temple students' });
  }
}
