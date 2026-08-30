import { requireAdminOrStudent } from '../_auth.js';
import { getStudentById } from './_student-db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed');
  const session = requireAdminOrStudent(req, res);
  if (!session) return;
  const studentId = String(req.query?.studentId || '');
  if (!studentId) return res.status(400).end('Missing studentId');
  if (session.role === 'temple_student' && session.studentId !== studentId) {
    return res.status(403).end('Forbidden');
  }
  try {
    const student = await getStudentById(studentId);
    if (!student?.profile_photo_path) return res.status(404).end('Photo not found');
    const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const key = process.env.SUPABASE_SECRET_KEY;
    const r = await fetch(`${url}/storage/v1/object/student-profile-photos/${student.profile_photo_path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!r.ok) return res.status(r.status).end('Photo unavailable');
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    const bytes = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).send(bytes);
  } catch (error) {
    console.error('Student photo error:', error);
    return res.status(500).end('Unable to load photo');
  }
}
