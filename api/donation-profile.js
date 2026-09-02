import {
  getSessionFromRequest
} from '../lib/_auth.js';

export default async function handler(req, res) {
  const session = getSessionFromRequest(req);

  if (!session?.memberId) {
    return res.status(401).json({
      success: false,
      message: 'Login required'
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  const memberId = session.memberId;

  // =====================================================
  // GET
  // ตรวจว่ากรอกข้อมูลการทำบุญแล้วหรือยัง
  // =====================================================
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,full_name,donation_profile_completed_at`,
        {
          method: 'GET',
          headers: {
            apikey: supabaseSecretKey,
            Authorization:
              `Bearer ${supabaseSecretKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Donation profile lookup failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to retrieve donation profile'
        });
      }

      const member =
        Array.isArray(data) && data.length > 0
          ? data[0]
          : null;

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      const completed =
        Boolean(
          member.full_name &&
          member.donation_profile_completed_at
        );

      return res.status(200).json({
        success: true,

        donationProfileComplete:
          completed,

        fullName:
          completed
            ? member.full_name
            : ''
      });
    } catch (error) {
      console.error(
        'Donation profile GET error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to retrieve donation profile'
      });
    }
  }

  // =====================================================
  // POST
  // บันทึกข้อมูลครั้งแรก / แก้ข้อมูล
  // =====================================================
  if (req.method === 'POST') {
    const {
      fullName,
      taxId
    } = req.body || {};

    const cleanFullName =
      String(fullName || '').trim();

    const cleanTaxId =
      String(taxId || '')
        .replace(/\D/g, '');

    if (!cleanFullName) {
      return res.status(400).json({
        success: false,
        message:
          'Full name is required'
      });
    }

    if (cleanTaxId.length !== 13) {
      return res.status(400).json({
        success: false,
        message:
          'Identification number must contain 13 digits'
      });
    }

    const now =
      new Date().toISOString();

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}`,
        {
          method: 'PATCH',

          headers: {
            apikey:
              supabaseSecretKey,

            Authorization:
              `Bearer ${supabaseSecretKey}`,

            'Content-Type':
              'application/json',

            Prefer:
              'return=representation'
          },

          body: JSON.stringify({
            full_name:
              cleanFullName,

            tax_id:
              cleanTaxId,

            donation_profile_completed_at:
              now,

            donation_profile_updated_at:
              now
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Donation profile update failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to save donation profile'
        });
      }

      const savedMember =
        Array.isArray(data) &&
        data.length > 0
          ? data[0]
          : null;

      if (!savedMember) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      return res.status(200).json({
        success: true,

        donationProfileComplete:
          true,

        fullName:
          cleanFullName
      });
    } catch (error) {
      console.error(
        'Donation profile POST error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to save donation profile'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}