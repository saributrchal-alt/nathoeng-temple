import adminStudents from '../lib/student-api/admin-students.js';
import adminStudentAction from '../lib/student-api/admin-student-action.js';
import studentAction from '../lib/student-api/student-action.js';
import studentDashboard from '../lib/student-api/student-dashboard.js';
import studentLogin from '../lib/student-api/student-login.js';
import studentLogout from '../lib/student-api/student-logout.js';
import studentMessage from '../lib/student-api/student-message.js';
import studentPhoto from '../lib/student-api/student-photo.js';
import studentProfile from '../lib/student-api/student-profile.js';
import studentSession from '../lib/student-api/student-session.js';

const handlers = {
  'admin-students': adminStudents,
  'admin-student-action': adminStudentAction,
  'action': studentAction,
  'dashboard': studentDashboard,
  'login': studentLogin,
  'logout': studentLogout,
  'message': studentMessage,
  'photo': studentPhoto,
  'profile': studentProfile,
  'session': studentSession
};

export default async function handler(req, res) {
  const route = String(req.query?.route || '').trim();

  const target = handlers[route];

  if (!target) {
    return res.status(404).json({
      success: false,
      message: 'Student API route not found'
    });
  }

  return target(req, res);
}
