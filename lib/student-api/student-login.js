import { createSessionToken, setSessionCookie } from '../_auth.js';
import { getStudentByUsername } from './_student-db.js';
import { verifyPin } from './_student-security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const username = String(req.body?.username || '').trim().toLowerCase();
  const pin = String(req.body?.pin || '').trim();
  if (!username || !/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ success: false, message: 'Username and 4–6 digit PIN are required' });
  }

  try {
    const student = await getStudentByUsername(username);
    if (!student || !verifyPin(pin, student.pin_salt, student.pin_hash)) {
      return res.status(401).json({ success: false, message: 'Invalid username or PIN' });
    }

    const token = createSessionToken({
      memberId: `student:${student.id}`,
      lineUid: null,
      role: 'temple_student',
      studentId: student.id
    });
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      student: {
        id: student.id,
        displayName: student.display_name,
        nickname: student.nickname || '',
        pictureUrl: student.profile_photo_path ? `/api/student-photo?studentId=${student.id}&v=${encodeURIComponent(student.updated_at || '')}` : ''
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to login' });
  }
}
