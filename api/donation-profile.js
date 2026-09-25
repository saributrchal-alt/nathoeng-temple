import {
  getSessionFromRequest,
  clearSessionCookie
} from '../lib/_auth.js';
import { handleWalkinMemberRequest } from '../lib/_walkin-members.js';
import { getMemberProfileDetails } from '../lib/_member-profile-details.js';
import {
  hasCompleteDonationIdentity,
  isValidIdentityNumber,
  normalizeIdentityNumber
} from '../lib/_donation-identity.js';

function supabaseHeaders(secretKey, extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export default async function handler(req, res) {
  // Share an existing Vercel function for member registration and password login.
  if (req.method === 'POST' && req.body && Object.hasOwn(req.body, 'action')) {
    return handleWalkinMemberRequest(req, res);
  }

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
          `&select=id,full_name,tax_id,country_code,birth_date,profile_image_url`,
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

      const details = await getMemberProfileDetails(supabaseUrl, supabaseSecretKey, memberId);
      const hasIdentityNumber =
        isValidIdentityNumber(normalizeIdentityNumber(member.tax_id));

      const completed =
        hasCompleteDonationIdentity(member);

      return res.status(200).json({
        success: true,
        donationProfileComplete: completed,
        fullName: member.full_name || '',
        fullNameEn: details.fullNameEn, memberAddress: details.memberAddress,
        birthDate: member.birth_date || '',
        picture: member.profile_image_url || '',
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
      fullNameEn,
      memberAddress,
      taxId,
      countryCode,
      birthDate,
      picture
    } = req.body || {};

    const cleanFullName =
      String(fullName || '').trim();
    const detailsWereProvided = Object.hasOwn(req.body || {}, 'fullNameEn') || Object.hasOwn(req.body || {}, 'memberAddress');
    const cleanFullNameEn = String(fullNameEn || '').trim().replace(/\s+/g, ' ');
    const cleanMemberAddress = String(memberAddress || '').trim();
    if (cleanFullNameEn.length > 200 || cleanMemberAddress.length > 500)
      return res.status(400).json({ success: false, message: 'English name or address is too long' });

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

    const cleanBirthDate = String(birthDate || '').trim();
    const cleanPicture = String(picture || '');
    if (cleanBirthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(cleanBirthDate) ||
      !Number.isFinite(Date.parse(cleanBirthDate)) || new Date(cleanBirthDate).toISOString().slice(0, 10) !== cleanBirthDate ||
      cleanBirthDate > new Date().toISOString().slice(0, 10))) {
      return res.status(400).json({ success: false, message: 'Invalid date of birth' });
    }
    if (cleanPicture && (cleanPicture.length > 100000 || !/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(cleanPicture))) {
      return res.status(400).json({ success: false, message: 'Invalid profile picture' });
    }

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

      let details = { available: false, fullNameEn: '', memberAddress: '' };
      if (detailsWereProvided) {
        details = await getMemberProfileDetails(supabaseUrl, supabaseSecretKey, memberId);
        if (!details.available && (cleanFullNameEn || cleanMemberAddress))
          return res.status(503).json({ success: false, message: 'Run supabase/member-profile-details.sql before saving English name or address' });
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
      if (cleanBirthDate) patch.birth_date = cleanBirthDate;
      if (cleanPicture) patch.profile_image_url = cleanPicture;

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

      if (detailsWereProvided && details.available) {
        const detailResponse = await fetch(`${supabaseUrl}/rest/v1/member_profile_details?on_conflict=member_id`, {
          method: 'POST', headers: supabaseHeaders(supabaseSecretKey, { Prefer: 'resolution=merge-duplicates' }),
          body: JSON.stringify({ member_id: memberId, full_name_en: cleanFullNameEn,
            member_address: cleanMemberAddress, updated_at: now })
        });
        if (!detailResponse.ok) {
          const detailError = await detailResponse.json().catch(() => ({}));
          console.error('Member profile details save failed:', detailError.code || detailResponse.status);
          return res.status(503).json({ success: false, message: 'Name and address could not be saved; please retry' });
        }
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
        fullNameEn: detailsWereProvided ? cleanFullNameEn : details.fullNameEn,
        memberAddress: detailsWereProvided ? cleanMemberAddress : details.memberAddress,
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
        hasIdentityNumber: true,
        birthDate: savedMember.birth_date || '',
        picture: savedMember.profile_image_url || ''
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

  // =====================================================
  // DELETE - soft-cancel membership and keep historical records
  // =====================================================
  if (req.method === 'DELETE') {
    const allowedReasons = [
      'not_using', 'no_news', 'duplicate_account',
      'use_another_account', 'privacy', 'other'
    ];
    const reason = String(req.body?.reason || '').trim();
    const reasonDetail = String(req.body?.reasonDetail || '').trim().slice(0, 500);

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Please select a cancellation reason' });
    }
    if (reason === 'other' && !reasonDetail) {
      return res.status(400).json({ success: false, message: 'Please provide the cancellation reason' });
    }

    const now = new Date().toISOString();
    try {
      const memberResponse = await fetch(
        supabaseUrl + '/rest/v1/members?id=eq.' + encodeURIComponent(memberId),
        {
          method: 'PATCH',
          headers: supabaseHeaders(supabaseSecretKey, { Prefer: 'return=representation' }),
          body: JSON.stringify({ membership_status: 'inactive', membership_cancelled_at: now })
        }
      );
      const memberData = await memberResponse.json();
      if (!memberResponse.ok) {
        console.error('Membership cancellation member update failed:', memberData);
        return res.status(500).json({ success: false, message: 'Unable to cancel membership', databaseError: memberData });
      }

      const historyResponse = await fetch(supabaseUrl + '/rest/v1/membership_cancellations', {
        method: 'POST',
        headers: supabaseHeaders(
          supabaseSecretKey,
          { Prefer: 'return=minimal' }
        ),
        body: JSON.stringify({
          member_id: String(memberId),
          reason,
          reason_detail: reasonDetail || null,
          cancelled_at: now
        })
      });
      if (!historyResponse.ok) {
        const historyText = await historyResponse.text();
        let historyData = null;
        try {
          historyData = historyText ? JSON.parse(historyText) : null;
        } catch {
          historyData = { message: historyText };
        }
        console.error('Membership cancellation history insert failed:', historyData);
        await fetch(
          supabaseUrl + '/rest/v1/members?id=eq.' + encodeURIComponent(memberId),
          {
            method: 'PATCH',
            headers: supabaseHeaders(supabaseSecretKey),
            body: JSON.stringify({ membership_status: 'active', membership_cancelled_at: null })
          }
        );
        return res.status(500).json({
          success: false,
          message: 'Unable to save cancellation reason',
          databaseError: historyData
        });
      }

      await fetch(
        supabaseUrl + '/rest/v1/push_subscriptions?member_id=eq.' + encodeURIComponent(memberId) + '&is_active=eq.true',
        {
          method: 'PATCH',
          headers: supabaseHeaders(supabaseSecretKey),
          body: JSON.stringify({ is_active: false, updated_at: now })
        }
      );

      clearSessionCookie(res);
      return res.status(200).json({ success: true, cancelled: true });
    } catch (error) {
      console.error('Membership cancellation error:', error);
      return res.status(500).json({ success: false, message: 'Unable to cancel membership' });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
