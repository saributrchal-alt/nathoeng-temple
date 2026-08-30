import { requireStudent } from '../_auth.js';
import { sb } from './_student-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const session = requireStudent(req, res);
  if (!session) return;
  const message = String(req.body?.message || '').trim();
  if (!message || message.length > 2000) return res.status(400).json({ success: false, message: 'Message is required' });
  try {
    const rows = await sb('/rest/v1/student_messages', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: [{ student_id: session.studentId, sender_type: 'student', message }]
    });
    return res.status(200).json({ success: true, message: rows?.[0] || null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to send message' });
  }
}
