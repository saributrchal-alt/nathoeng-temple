import { requireStudent } from './_auth.js';
import { getStudentById } from './_student-db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireStudent(req, res);
  if (!session) return;
  try {
    const student = await getStudentById(session.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.status(200).json({ success: true, student: {
      id: student.id,
      displayName: student.display_name,
      nickname: student.nickname || '',
      pictureUrl: student.profile_photo_path ? `/api/student-photo?studentId=${student.id}&v=${encodeURIComponent(student.updated_at || '')}` : ''
    }});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load session' });
  }
}
