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

function isAdmin(session) {
  return session?.role === 'admin';
}

function bangkokDate() {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  ).format(new Date());
}

function cleanDate(value) {
  const date = String(value || '').trim();

  if (!date) {
    return bangkokDate();
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  return date;
}

function validatePurpose(purpose, customPurpose) {
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
    return {
      ok: false,
      message: 'Invalid donation purpose'
    };
  }

  const cleanCustomPurpose =
    customPurpose
      ? String(customPurpose).trim()
      : null;

  if (
    cleanPurpose === 'custom' &&
    !cleanCustomPurpose
  ) {
    return {
      ok: false,
      message: 'Custom purpose is required'
    };
  }

  return {
    ok: true,
    purpose: cleanPurpose,
    customPurpose:
      cleanPurpose === 'custom'
        ? cleanCustomPurpose
        : null
  };
}

function validateDonationValues({
  donationType,
  amount,
  itemName,
  quantity,
  unit
}) {
  if (!['money', 'item'].includes(donationType)) {
    return {
      ok: false,
      message: 'Invalid donation type'
    };
  }

  if (donationType === 'money') {
    const cleanAmount = Number(amount);

    if (
      !Number.isFinite(cleanAmount) ||
      cleanAmount <= 0
    ) {
      return {
        ok: false,
        message: 'Donation amount must be greater than zero'
      };
    }

    return {
      ok: true,
      amount: cleanAmount,
      itemName: null,
      quantity: null,
      unit: null
    };
  }

  const cleanItemName =
    String(itemName || '').trim();

  const cleanQuantity =
    Number(quantity);

  const cleanUnit =
    String(unit || '').trim();

  if (
    !cleanItemName ||
    !Number.isFinite(cleanQuantity) ||
    cleanQuantity <= 0 ||
    !cleanUnit
  ) {
    return {
      ok: false,
      message: 'Item, quantity and unit are required'
    };
  }

  return {
    ok: true,
    amount: null,
    itemName: cleanItemName,
    quantity: cleanQuantity,
    unit: cleanUnit
  };
}

async function getMember({
  supabaseUrl,
  secretKey,
  memberId
}) {
  if (!memberId) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/members` +
      `?id=eq.${encodeURIComponent(memberId)}` +
      `&select=id,full_name,display_name,role,line_uid,line_oa_friend`,
    {
      method: 'GET',
      headers: jsonHeaders(secretKey),
      cache: 'no-store'
    }
  );

  const data = await response.json();

  if (
    !response.ok ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return null;
  }

  return data[0];
}

async function getDonation({
  supabaseUrl,
  secretKey,
  donationId
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/donations` +
      `?id=eq.${encodeURIComponent(donationId)}` +
      `&select=*`,
    {
      method: 'GET',
      headers: jsonHeaders(secretKey),
      cache: 'no-store'
    }
  );

  const data = await response.json();

  if (
    !response.ok ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return null;
  }

  return data[0];
}

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );

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
  const adminScope =
    String(req.query?.scope || '') === 'admin';

  // =====================================================
  // GET
  // =====================================================
  if (req.method === 'GET') {
    if (adminScope && !isAdmin(session)) {
      return res.status(403).json({
        success: false,
        message: 'Admin permission required'
      });
    }

    try {
      if (
        adminScope &&
        String(req.query?.resource || '') === 'members'
      ) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/members` +
            `?select=id,full_name,display_name,role` +
            `&order=full_name.asc` +
            `&limit=500`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            'Admin member lookup failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to retrieve members'
          });
        }

        return res.status(200).json({
          success: true,
          members: Array.isArray(data) ? data : []
        });
      }

      const baseSelect =
        'id,donation_type,owner_member_id,donor_name_snapshot,amount,item_name,quantity,unit,purpose,custom_purpose,receipt_requested,donation_date,note,source,created_by_member_id,created_at,updated_at,verification_status,verification_note,verified_at,verified_by_member_id,receipt_url';

      const query = adminScope
        ? `?select=${baseSelect}&order=donation_date.desc,created_at.desc`
        : `?owner_member_id=eq.${encodeURIComponent(memberId)}` +
          `&select=${baseSelect}` +
          `&order=donation_date.desc,created_at.desc`;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/donations${query}`,
        {
          method: 'GET',
          headers: jsonHeaders(supabaseSecretKey),
          cache: 'no-store'
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

      let donations =
        Array.isArray(data) ? data : [];

      // Admin needs to see the CURRENT linked owner, while
      // donor_name_snapshot remains the historical donor name.
      if (adminScope && donations.length > 0) {
        const memberResponse = await fetch(
          `${supabaseUrl}/rest/v1/members` +
            `?select=id,full_name,display_name`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const memberRows =
          await memberResponse.json();

        if (memberResponse.ok && Array.isArray(memberRows)) {
          const memberMap =
            new Map(
              memberRows.map((member) => [
                member.id,
                member
              ])
            );

          donations =
            donations.map((item) => {
              const owner =
                item.owner_member_id
                  ? memberMap.get(
                      item.owner_member_id
                    )
                  : null;

              return {
                ...item,
                owner_current_name:
                  owner?.full_name ||
                  owner?.display_name ||
                  null,
                owner_display_name:
                  owner?.display_name ||
                  null
              };
            });
        }
      }

      return res.status(200).json({
        success: true,
        scope: adminScope ? 'admin' : 'member',
        donations
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
  // =====================================================
  if (req.method === 'POST') {
    const body = req.body || {};
    const action =
      String(body.action || '').trim();

    // -----------------------------------------------------
    // ADMIN: CREATE DONATION
    // -----------------------------------------------------
    if (action === 'admin_create') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const purposeResult =
        validatePurpose(
          body.purpose,
          body.customPurpose
        );

      if (!purposeResult.ok) {
        return res.status(400).json({
          success: false,
          message: purposeResult.message
        });
      }

      const valueResult =
        validateDonationValues({
          donationType: body.donationType,
          amount: body.amount,
          itemName: body.itemName,
          quantity: body.quantity,
          unit: body.unit
        });

      if (!valueResult.ok) {
        return res.status(400).json({
          success: false,
          message: valueResult.message
        });
      }

      const donationDate =
        cleanDate(body.donationDate);

      if (!donationDate) {
        return res.status(400).json({
          success: false,
          message: 'Invalid donation date'
        });
      }

      const ownerMemberId =
        body.ownerMemberId
          ? String(body.ownerMemberId).trim()
          : null;

      let donorName =
        String(body.donorName || '').trim();

      if (ownerMemberId) {
        const owner = await getMember({
          supabaseUrl,
          secretKey: supabaseSecretKey,
          memberId: ownerMemberId
        });

        if (!owner) {
          return res.status(404).json({
            success: false,
            message: 'Selected member was not found'
          });
        }

        donorName =
          String(
            owner.full_name ||
            owner.display_name ||
            donorName
          ).trim();
      }

      if (!donorName) {
        return res.status(400).json({
          success: false,
          message: 'Donor name is required'
        });
      }

      const donationData = {
        donation_type:
          body.donationType,

        owner_member_id:
          ownerMemberId,

        donor_name_snapshot:
          donorName,

        amount:
          valueResult.amount,

        item_name:
          valueResult.itemName,

        quantity:
          valueResult.quantity,

        unit:
          valueResult.unit,

        purpose:
          purposeResult.purpose,

        custom_purpose:
          purposeResult.customPurpose,

        receipt_requested:
          body.donationType === 'money'
            ? body.receiptRequested === true
            : false,

        donation_date:
          donationDate,

        note:
          body.note
            ? String(body.note).trim() || null
            : null,

        source:
          'admin',

        created_by_member_id:
          memberId
      };

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/donations`,
          {
            method: 'POST',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify(donationData)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            'Admin donation insert failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to save donation'
          });
        }

        return res.status(201).json({
          success: true,
          donation:
            Array.isArray(data) && data.length
              ? data[0]
              : null
        });
      } catch (error) {
        console.error(
          'Admin donation create error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to save donation'
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN: EDIT DONATION DETAILS
    // -----------------------------------------------------
    if (action === 'admin_update') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const donationId =
        String(body.donationId || '').trim();

      if (!donationId) {
        return res.status(400).json({
          success: false,
          message: 'Donation ID is required'
        });
      }

      const existing = await getDonation({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        donationId
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      const purposeResult =
        validatePurpose(
          body.purpose,
          body.customPurpose
        );

      if (!purposeResult.ok) {
        return res.status(400).json({
          success: false,
          message: purposeResult.message
        });
      }

      const valueResult =
        validateDonationValues({
          donationType:
            existing.donation_type,
          amount: body.amount,
          itemName: body.itemName,
          quantity: body.quantity,
          unit: body.unit
        });

      if (!valueResult.ok) {
        return res.status(400).json({
          success: false,
          message: valueResult.message
        });
      }

      const donationDate =
        cleanDate(body.donationDate);

      if (!donationDate) {
        return res.status(400).json({
          success: false,
          message: 'Invalid donation date'
        });
      }

      const updateData = {
        donor_name_snapshot:
          String(
            body.donorName ||
            existing.donor_name_snapshot ||
            ''
          ).trim(),

        amount:
          valueResult.amount,

        item_name:
          valueResult.itemName,

        quantity:
          valueResult.quantity,

        unit:
          valueResult.unit,

        purpose:
          purposeResult.purpose,

        custom_purpose:
          purposeResult.customPurpose,

        receipt_requested:
          existing.donation_type === 'money'
            ? body.receiptRequested === true
            : false,

        donation_date:
          donationDate,

        note:
          body.note
            ? String(body.note).trim() || null
            : null,

        updated_at:
          new Date().toISOString()
      };

      if (!updateData.donor_name_snapshot) {
        return res.status(400).json({
          success: false,
          message: 'Donor name is required'
        });
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/donations` +
            `?id=eq.${encodeURIComponent(donationId)}`,
          {
            method: 'PATCH',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify(updateData)
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !Array.isArray(data) ||
          data.length === 0
        ) {
          console.error(
            'Admin donation update failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to update donation'
          });
        }

        return res.status(200).json({
          success: true,
          donation: data[0]
        });
      } catch (error) {
        console.error(
          'Admin donation update error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Unable to update donation'
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN: CHANGE OWNER + AUDIT
    // -----------------------------------------------------
    if (action === 'change_owner') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const donationId =
        String(body.donationId || '').trim();

      const newOwnerMemberId =
        body.newOwnerMemberId
          ? String(body.newOwnerMemberId).trim()
          : null;

      const reason =
        body.reason
          ? String(body.reason).trim() || null
          : null;

      if (!donationId || !newOwnerMemberId) {
        return res.status(400).json({
          success: false,
          message:
            'Donation and new owner are required'
        });
      }

      const existing = await getDonation({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        donationId
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      if (
        existing.owner_member_id ===
        newOwnerMemberId
      ) {
        return res.status(400).json({
          success: false,
          message:
            'This member is already the owner'
        });
      }

      const newOwner = await getMember({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        memberId: newOwnerMemberId
      });

      if (!newOwner) {
        return res.status(404).json({
          success: false,
          message: 'Selected member was not found'
        });
      }

      const previousOwnerMemberId =
        existing.owner_member_id || null;

      try {
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/donations` +
            `?id=eq.${encodeURIComponent(donationId)}`,
          {
            method: 'PATCH',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify({
              owner_member_id:
                newOwnerMemberId,
              updated_at:
                new Date().toISOString()
            })
          }
        );

        const updated =
          await updateResponse.json();

        if (
          !updateResponse.ok ||
          !Array.isArray(updated) ||
          updated.length === 0
        ) {
          console.error(
            'Donation owner update failed:',
            updated
          );

          return res.status(500).json({
            success: false,
            message:
              'Unable to change donation owner'
          });
        }

        const historyResponse = await fetch(
          `${supabaseUrl}/rest/v1/donation_owner_history`,
          {
            method: 'POST',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=minimal'
            },
            body: JSON.stringify({
              donation_id:
                donationId,
              previous_owner_member_id:
                previousOwnerMemberId,
              new_owner_member_id:
                newOwnerMemberId,
              changed_by_member_id:
                memberId,
              reason,
              changed_at:
                new Date().toISOString()
            })
          }
        );

        if (!historyResponse.ok) {
          const historyError =
            await historyResponse.text();

          console.error(
            'Donation owner history insert failed:',
            historyError
          );

          // Roll back owner if audit logging fails.
          await fetch(
            `${supabaseUrl}/rest/v1/donations` +
              `?id=eq.${encodeURIComponent(donationId)}`,
            {
              method: 'PATCH',
              headers: {
                ...jsonHeaders(supabaseSecretKey),
                Prefer: 'return=minimal'
              },
              body: JSON.stringify({
                owner_member_id:
                  previousOwnerMemberId,
                updated_at:
                  new Date().toISOString()
              })
            }
          );

          return res.status(500).json({
            success: false,
            message:
              'Owner was not changed because audit history could not be saved'
          });
        }

        return res.status(200).json({
          success: true,
          donation: updated[0],
          owner: {
            id: newOwner.id,
            fullName:
              newOwner.full_name ||
              newOwner.display_name ||
              ''
          }
        });
      } catch (error) {
        console.error(
          'Donation owner change error:',
          error
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to change donation owner'
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN: VERIFY / CORRECTION / RECEIPT LINK
    // -----------------------------------------------------
    if (action === 'admin_verify') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const donationId = String(body.donationId || '').trim();
      const verificationStatus = String(body.verificationStatus || '').trim();
      const verificationNote = body.verificationNote
        ? String(body.verificationNote).trim() || null
        : null;

      const allowedStatuses = [
        'pending',
        'verified',
        'needs_correction'
      ];

      if (!donationId) {
        return res.status(400).json({
          success: false,
          message: 'Donation ID is required'
        });
      }

      if (!allowedStatuses.includes(verificationStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status'
        });
      }

      const existing = await getDonation({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        donationId
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      const now = new Date().toISOString();
      const updateData = {
        verification_status: verificationStatus,
        verification_note: verificationNote,
        verified_at: verificationStatus === 'verified' ? now : null,
        verified_by_member_id: verificationStatus === 'verified' ? memberId : null,
        updated_at: now
      };

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/donations` +
            `?id=eq.${encodeURIComponent(donationId)}`,
          {
            method: 'PATCH',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify(updateData)
          }
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data) || data.length === 0) {
          console.error('Donation verification update failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to update donation verification'
          });
        }

        return res.status(200).json({
          success: true,
          donation: data[0]
        });
      } catch (error) {
        console.error('Donation verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Unable to update donation verification'
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN: UPDATE RECEIPT URL
    // -----------------------------------------------------
    if (action === 'admin_receipt_url') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const donationId = String(body.donationId || '').trim();
      const receiptUrl = body.receiptUrl
        ? String(body.receiptUrl).trim()
        : '';

      if (!donationId) {
        return res.status(400).json({
          success: false,
          message: 'Donation ID is required'
        });
      }

      const existing = await getDonation({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        donationId
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      if (!existing.receipt_requested) {
        return res.status(400).json({
          success: false,
          message: 'Receipt was not requested for this donation'
        });
      }

      if (receiptUrl) {
        let parsedUrl;
        try {
          parsedUrl = new URL(receiptUrl);
        } catch {
          return res.status(400).json({
            success: false,
            message: 'Invalid receipt URL'
          });
        }

        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          return res.status(400).json({
            success: false,
            message: 'Receipt URL must use HTTP or HTTPS'
          });
        }
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/donations` +
            `?id=eq.${encodeURIComponent(donationId)}`,
          {
            method: 'PATCH',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify({
              receipt_url: receiptUrl || null,
              updated_at: new Date().toISOString()
            })
          }
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data) || data.length === 0) {
          console.error('Receipt URL update failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to update receipt URL'
          });
        }

        return res.status(200).json({
          success: true,
          donation: data[0]
        });
      } catch (error) {
        console.error('Receipt URL update error:', error);
        return res.status(500).json({
          success: false,
          message: 'Unable to update receipt URL'
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN: SEND VERIFIED DONATION NOTICE VIA LINE OA
    // -----------------------------------------------------
    if (action === 'admin_line_notify') {
      if (!isAdmin(session)) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required'
        });
      }

      const donationId = String(body.donationId || '').trim();

      if (!donationId) {
        return res.status(400).json({
          success: false,
          message: 'Donation ID is required'
        });
      }

      const lineMessagingAccessToken =
        process.env.LINE_MESSAGING_ACCESS_TOKEN;

      if (!lineMessagingAccessToken) {
        return res.status(500).json({
          success: false,
          message: 'LINE Messaging API configuration is missing'
        });
      }

      const existing = await getDonation({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        donationId
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      if (existing.verification_status !== 'verified') {
        return res.status(400).json({
          success: false,
          message: 'Donation must be verified before sending LINE notification'
        });
      }

      if (!existing.owner_member_id) {
        return res.status(400).json({
          success: false,
          message: 'This donation is not linked to a registered member'
        });
      }

      const owner = await getMember({
        supabaseUrl,
        secretKey: supabaseSecretKey,
        memberId: existing.owner_member_id
      });

      if (!owner?.line_uid) {
        return res.status(400).json({
          success: false,
          message: 'LINE account was not found for this donor'
        });
      }

      if (owner.line_oa_friend === false) {
        return res.status(400).json({
          success: false,
          message: 'The donor has not added or is no longer connected to the LINE Official Account'
        });
      }

      const donorName =
        owner.full_name ||
        owner.display_name ||
        existing.donor_name_snapshot ||
        '';

      const lines = [
        'สาธุ อนุโมทนาบุญ 🙏',
        donorName ? `คุณ ${donorName}` : '',
        'รายการทำบุญของท่านได้รับการตรวจสอบเรียบร้อยแล้ว',
        'ข้อมูลครบถ้วนสมบูรณ์',
        '',
        'ขออนุโมทนาในกุศลเจตนาของท่าน',
        'สาธุ สาธุ สาธุ 🙏'
      ];

      if (existing.receipt_requested === true) {
        if (existing.receipt_url) {
          lines.push(
            '',
            'ใบอนุโมทนาบัตรพร้อมแล้ว',
            'กรุณาเปิดดูได้ที่ บัญชีของฉัน → การทำบุญของฉัน'
          );
        } else {
          lines.push(
            '',
            'ใบอนุโมทนาบัตรอยู่ระหว่างการจัดทำ'
          );
        }
      }

      lines.push('', 'วัดพุทธอุทยานนาเทิง', 'NATHOENG CONNECT');

      const messageText = lines.filter((line, index, array) => {
        if (line !== '') return true;
        return index > 0 && array[index - 1] !== '';
      }).join('\n');

      try {
        const lineResponse = await fetch(
          'https://api.line.me/v2/bot/message/push',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${lineMessagingAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: owner.line_uid,
              messages: [
                {
                  type: 'text',
                  text: messageText
                }
              ]
            })
          }
        );

        if (!lineResponse.ok) {
          const lineError = await lineResponse.text();
          console.error(
            'LINE donation notification failed:',
            lineResponse.status,
            lineError
          );

          return res.status(502).json({
            success: false,
            message: 'Unable to send LINE notification to donor'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'LINE notification sent',
          donorName
        });
      } catch (error) {
        console.error('LINE donation notification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Unable to send LINE notification to donor'
        });
      }
    }

    // -----------------------------------------------------
    // MEMBER DONATION FLOW
    // -----------------------------------------------------
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
    } = body;

    const purposeResult =
      validatePurpose(
        purpose,
        customPurpose
      );

    if (!purposeResult.ok) {
      return res.status(400).json({
        success: false,
        message: purposeResult.message
      });
    }

    const valueResult =
      validateDonationValues({
        donationType,
        amount,
        itemName,
        quantity,
        unit
      });

    if (!valueResult.ok) {
      return res.status(400).json({
        success: false,
        message: valueResult.message
      });
    }

    try {
      const memberResponse = await fetch(
        `${supabaseUrl}/rest/v1/members` +
          `?id=eq.${encodeURIComponent(memberId)}` +
          `&select=id,full_name,donation_profile_completed_at`,
        {
          method: 'GET',
          headers: jsonHeaders(supabaseSecretKey),
          cache: 'no-store'
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
          valueResult.amount,

        item_name:
          valueResult.itemName,

        quantity:
          valueResult.quantity,

        unit:
          valueResult.unit,

        purpose:
          purposeResult.purpose,

        custom_purpose:
          purposeResult.customPurpose,

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
          message:
            'Donation record was not returned'
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
