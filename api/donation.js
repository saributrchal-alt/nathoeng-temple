import {
  getSessionFromRequest
} from '../lib/_auth.js';

function jsonHeaders(secretKey) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json'
  };
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
  // รายการทำบุญของสมาชิกที่ล็อกอินอยู่
  // =====================================================
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/donations` +
          `?owner_member_id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,donation_type,donor_name_snapshot,amount,item_name,quantity,unit,purpose,custom_purpose,receipt_requested,donation_date,note,created_at` +
          `&order=donation_date.desc`,
        {
          method: 'GET',
          headers: jsonHeaders(supabaseSecretKey)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Donation list lookup failed:',
          data
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to retrieve donations'
        });
      }

      return res.status(200).json({
        success: true,
        donations: Array.isArray(data) ? data : []
      });
    } catch (error) {
      console.error(
        'Donation GET error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to retrieve donations'
      });
    }
  }

  // =====================================================
  // POST
  // บันทึกการทำบุญเป็นเงิน / ถวายสิ่งของ
  // =====================================================
  if (req.method === 'POST') {
    const {
      donationType,
      amount,
      itemName,
      quantity,
      unit,
      purpose,
      customPurpose,
      receiptRequested,
      note
    } = req.body || {};

    if (!['money', 'item'].includes(donationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation type'
      });
    }

    const cleanPurpose =
      String(purpose || 'general').trim();

    if (
      ![
        'general',
        'utilities',
        'development',
        'custom'
      ].includes(cleanPurpose)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation purpose'
      });
    }

    const cleanCustomPurpose =
      customPurpose
        ? String(customPurpose).trim()
        : null;

    if (
      cleanPurpose === 'custom' &&
      !cleanCustomPurpose
    ) {
      return res.status(400).json({
        success: false,
        message: 'Custom purpose is required'
      });
    }

    let cleanAmount = null;
    let cleanItemName = null;
    let cleanQuantity = null;
    let cleanUnit = null;

    if (donationType === 'money') {
      cleanAmount = Number(amount);

      if (
        !Number.isFinite(cleanAmount) ||
        cleanAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Donation amount must be greater than zero'
        });
      }
    }

    if (donationType === 'item') {
      cleanItemName =
        String(itemName || '').trim();

      cleanQuantity =
        Number(quantity);

      cleanUnit =
        String(unit || '').trim();

      if (
        !cleanItemName ||
        !Number.isFinite(cleanQuantity) ||
        cleanQuantity <= 0 ||
        !cleanUnit
      ) {
        return res.status(400).json({
          success: false,
          message: 'Item, quantity and unit are required'
        });
      }
    }

    try {
      // อ่านชื่อจริงจาก member ฝั่ง server
      // ไม่เชื่อชื่อหรือ owner ที่ browser ส่งมา
      const memberResponse = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,full_name,donation_profile_completed_at`,
        {
          method: 'GET',
          headers: jsonHeaders(supabaseSecretKey)
        }
      );

      const memberData =
        await memberResponse.json();

      if (!memberResponse.ok) {
        console.error(
          'Donation member lookup failed:',
          memberData
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to verify member'
        });
      }

      const member =
        Array.isArray(memberData) &&
        memberData.length > 0
          ? memberData[0]
          : null;

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      if (
        !member.full_name ||
        !member.donation_profile_completed_at
      ) {
        return res.status(400).json({
          success: false,
          code: 'DONATION_PROFILE_REQUIRED',
          message: 'Donation profile is not complete'
        });
      }

      const donationData = {
        donation_type:
          donationType,

        owner_member_id:
          memberId,

        donor_name_snapshot:
          member.full_name,

        amount:
          donationType === 'money'
            ? cleanAmount
            : null,

        item_name:
          donationType === 'item'
            ? cleanItemName
            : null,

        quantity:
          donationType === 'item'
            ? cleanQuantity
            : null,

        unit:
          donationType === 'item'
            ? cleanUnit
            : null,

        purpose:
          cleanPurpose,

        custom_purpose:
          cleanPurpose === 'custom'
            ? cleanCustomPurpose
            : null,

        receipt_requested:
          donationType === 'money'
            ? receiptRequested === true
            : false,

        note:
          note
            ? String(note).trim() || null
            : null,

        source:
          'member',

        created_by_member_id:
          memberId
      };

      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/donations`,
        {
          method: 'POST',

          headers: {
            ...jsonHeaders(supabaseSecretKey),
            Prefer: 'return=representation'
          },

          body:
            JSON.stringify(donationData)
        }
      );

      const inserted =
        await insertResponse.json();

      if (!insertResponse.ok) {
        console.error(
          'Donation insert failed:',
          inserted
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to save donation'
        });
      }

      const donation =
        Array.isArray(inserted) &&
        inserted.length > 0
          ? inserted[0]
          : null;

      if (!donation) {
        return res.status(500).json({
          success: false,
          message: 'Donation record was not returned'
        });
      }

      return res.status(201).json({
        success: true,
        donation
      });
    } catch (error) {
      console.error(
        'Donation POST error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to save donation'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
