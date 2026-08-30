import {
  getSessionFromRequest
} from '../lib/_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({
      success: false,
      loggedIn: false,
      message: 'No valid server session found'
    });
  }

  return res.status(200).json({
    success: true,
    loggedIn: true,
    session: {
      memberId: session.memberId,
      role: session.role,
      hasLineUid: Boolean(session.lineUid)
    }
  });
}