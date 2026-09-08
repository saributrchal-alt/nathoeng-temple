import {
  getSessionFromRequest
} from '../lib/_auth.js';

function supabaseHeaders(secretKey, extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

function normalizeIdentityNumber(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '');
}

function isValidIdentityNumber(value) {
  if (/^\d{13}$/.test(value)) return true;
  return /^[A-Z0-9]{5,20}$/.test(value);
}

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
  // ข้อมูลโปรไฟล์สมาชิกสำหรับ Dashboard / การทำบุญ
  // ใช้ country_code ชุดเดียวกับแผนที่สมาชิกทั่วโลก
  // =====================================================
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,full_name,tax_id,country_code,donation_profile_completed_at`,
        {
          method: 'GET',
          headers: supabaseHeaders(supabaseSecretKey),
          cache: 'no-store'
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

      const hasIdentityNumber =
        Boolean(String(member.tax_id || '').trim());

      const completed =
        Boolean(
          member.full_name &&
          hasIdentityNumber &&
          member.donation_profile_completed_at
        );

      return res.status(200).json({
        success: true,
        donationProfileComplete: completed,
        fullName: member.full_name || '',
        countryCode:
          String(member.country_code || '')
            .trim()
            .toUpperCase(),
        // Do not return the actual ID/passport number to the browser.
        hasIdentityNumber
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
  // บันทึกครั้งแรก / แก้ไขโปรไฟล์
  // รองรับเลขประจำตัวประชาชนไทย 13 หลัก หรือ Passport
  // countryCode เป็น optional เพื่อไม่ให้กระทบ flow การทำบุญเดิม
  // =====================================================
  if (req.method === 'POST') {
    const {
      fullName,
      taxId,
      countryCode
    } = req.body || {};

    const cleanFullName =
      String(fullName || '').trim();

    const identityWasProvided =
      String(taxId || '').trim().length > 0;

    const cleanIdentityNumber =
      normalizeIdentityNumber(taxId);

    const countryWasProvided =
      String(countryCode || '').trim().length > 0;

    const cleanCountryCode =
      String(countryCode || '')
        .trim()
        .toUpperCase();

    if (!cleanFullName) {
      return res.status(400).json({
        success: false,
        message:
          'Full name is required'
      });
    }

    if (
      identityWasProvided &&
      !isValidIdentityNumber(cleanIdentityNumber)
    ) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_IDENTITY_NUMBER',
        message:
          'Enter a 13-digit national ID or a valid passport number (5-20 letters/numbers)'
      });
    }

    if (
      countryWasProvided &&
      !/^[A-Z]{2}$/.test(cleanCountryCode)
    ) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_COUNTRY_CODE',
        message: 'Country code must be a 2-letter ISO code'
      });
    }

    const now =
      new Date().toISOString();

    try {
      // Read the current member first so profile updates do not force
      // an already-verified member to re-enter an ID/passport number.
      const currentResponse = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,tax_id,country_code,donation_profile_completed_at`,
        {
          method: 'GET',
          headers: supabaseHeaders(supabaseSecretKey),
          cache: 'no-store'
        }
      );

      const currentData = await currentResponse.json();

      if (!currentResponse.ok) {
        console.error(
          'Donation profile current member lookup failed:',
          currentData
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to retrieve current member profile'
        });
      }

      const currentMember =
        Array.isArray(currentData) && currentData.length > 0
          ? currentData[0]
          : null;

      if (!currentMember) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      const existingIdentityNumber =
        String(currentMember.tax_id || '').trim();

      if (!identityWasProvided && !existingIdentityNumber) {
        return res.status(400).json({
          success: false,
          code: 'IDENTITY_NUMBER_REQUIRED',
          message:
            'A 13-digit national ID or passport number is required'
        });
      }

      const patch = {
        full_name: cleanFullName,
        donation_profile_updated_at: now,
        donation_profile_completed_at:
          currentMember.donation_profile_completed_at || now
      };

      if (identityWasProvided) {
        patch.tax_id = cleanIdentityNumber;
      }

      if (countryWasProvided) {
        patch.country_code = cleanCountryCode;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}`,
        {
          method: 'PATCH',
          headers: supabaseHeaders(
            supabaseSecretKey,
            { Prefer: 'return=representation' }
          ),
          body: JSON.stringify(patch)
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
        donationProfileComplete: true,
        fullName:
          savedMember.full_name || cleanFullName,
        countryCode:
          String(
            savedMember.country_code ||
            (countryWasProvided
              ? cleanCountryCode
              : currentMember.country_code) ||
            ''
          )
            .trim()
            .toUpperCase(),
        hasIdentityNumber: true
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
