export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const clientId =
    process.env.TELEGRAM_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: 'Telegram client ID is missing'
    });
  }

  return res.status(200).json({
    success: true,
    clientId
  });
}
