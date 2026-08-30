import { requireStudent } from '../_auth.js';
import { sb, q, getStudentById } from './_student-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireStudent(req, res);
  if (!session) return;

  try {
    const patch = {};
    if ('nickname' in (req.body || {})) patch.nickname = String(req.body.nickname || '').trim().slice(0, 80) || null;
    if ('schoolName' in (req.body || {})) patch.school_name = String(req.body.schoolName || '').trim().slice(0, 160) || null;
    if ('gradeLevel' in (req.body || {})) patch.grade_level = String(req.body.gradeLevel || '').trim().slice(0, 80) || null;
    if ('aboutMe' in (req.body || {})) patch.about_me = String(req.body.aboutMe || '').trim().slice(0, 1000) || null;

    const imageData = String(req.body?.imageData || '');
    if (imageData) {
      const match = imageData.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
      if (!match) return res.status(400).json({ success: false, message: 'Invalid image format' });
      const bytes = Buffer.from(match[2], 'base64');
      if (bytes.length > 2 * 1024 * 1024) return res.status(400).json({ success: false, message: 'Image must be smaller than 2 MB' });
      const ext = match[1] === 'image/png' ? 'png' : match[1] === 'image/webp' ? 'webp' : 'jpg';
      const path = `${session.studentId}/profile-${Date.now()}.${ext}`;
      const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
      const key = process.env.SUPABASE_SECRET_KEY;
      const upload = await fetch(`${supabaseUrl}/storage/v1/object/student-profile-photos/${path}`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': match[1], 'x-upsert': 'true' }, body: bytes
      });
      if (!upload.ok) throw new Error(`Photo upload failed (${upload.status})`);
      patch.profile_photo_path = path;
    }

    if (Object.keys(patch).length) {
      await sb(`/rest/v1/temple_students?id=eq.${q(session.studentId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: patch });
    }
    const student = await getStudentById(session.studentId);
    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error('Student profile error:', error);
    return res.status(500).json({ success: false, message: 'Unable to save profile' });
  }
}
