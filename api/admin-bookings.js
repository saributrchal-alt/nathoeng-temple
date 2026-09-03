import {
  requireAdmin
} from '../lib/_auth.js';

function supabaseHeaders(secretKey, extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra
  };
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function enrichReviews(supabaseUrl, secretKey, reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return [];

  const memberIds = [...new Set(reviews.map((r) => r.member_id).filter(Boolean))];
  const bookingIds = [...new Set(reviews.map((r) => r.booking_id).filter(Boolean))];
  let members = [];
  let bookings = [];

  if (memberIds.length) {
    const filter = `(${memberIds.join(',')})`;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/members?id=in.${encodeURIComponent(filter)}&select=*`,
      { headers: supabaseHeaders(secretKey), cache: 'no-store' }
    );
    const data = await readJson(response);
    if (response.ok && Array.isArray(data)) members = data;
  }

  if (bookingIds.length) {
    const filter = `(${bookingIds.join(',')})`;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/bookings?id=in.${encodeURIComponent(filter)}&select=id,start_date,end_date`,
      { headers: supabaseHeaders(secretKey), cache: 'no-store' }
    );
    const data = await readJson(response);
    if (response.ok && Array.isArray(data)) bookings = data;
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const bookingMap = new Map(bookings.map((b) => [b.id, b]));

  return reviews.map((review) => {
    const member = memberMap.get(review.member_id) || {};
    const booking = bookingMap.get(review.booking_id) || {};
    return {
      ...review,
      reviewer_name:
        member.full_name ||
        member.display_name ||
        member.name ||
        member.line_display_name ||
        null,
      picture_url:
        member.picture_url ||
        member.profile_image_url ||
        member.line_picture_url ||
        member.avatar_url ||
        null,
      start_date: booking.start_date || null,
      end_date: booking.end_date || null
    };
  });
}

async function handleReviews(req, res, session, supabaseUrl, secretKey) {
  if (req.method === 'GET') {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/retreat_reviews?select=*&order=created_at.desc`,
      { headers: supabaseHeaders(secretKey), cache: 'no-store' }
    );
    const data = await readJson(response);

    if (!response.ok) {
      console.error('Admin retreat reviews lookup failed:', data);
      return res.status(500).json({
        success: false,
        message: 'Unable to load retreat reviews',
        databaseError: data
      });
    }

    const reviews = await enrichReviews(
      supabaseUrl,
      secretKey,
      Array.isArray(data) ? data : []
    );

    return res.status(200).json({ success: true, reviews });
  }

  if (req.method === 'POST') {
    const action = String(req.body?.action || '').trim();
    const reviewId = String(req.body?.reviewId || '').trim();

    if (!['publish', 'hide'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid review action' });
    }
    if (!reviewId) {
      return res.status(400).json({ success: false, message: 'Review ID is required' });
    }

    if (action === 'publish') {
      const lookup = await fetch(
        `${supabaseUrl}/rest/v1/retreat_reviews?id=eq.${encodeURIComponent(reviewId)}&select=id,consent_public&limit=1`,
        { headers: supabaseHeaders(secretKey), cache: 'no-store' }
      );
      const rows = await readJson(lookup);
      const review = lookup.ok && Array.isArray(rows) ? rows[0] : null;

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      if (review.consent_public !== true) {
        return res.status(400).json({
          success: false,
          message: 'Reviewer has not consented to public display'
        });
      }
    }

    const now = new Date().toISOString();
    const patch = action === 'publish'
      ? {
          status: 'published',
          published_at: now,
          reviewed_at: now,
          reviewed_by_member_id: session.memberId,
          updated_at: now
        }
      : {
          status: 'hidden',
          published_at: null,
          reviewed_at: now,
          reviewed_by_member_id: session.memberId,
          updated_at: now
        };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/retreat_reviews?id=eq.${encodeURIComponent(reviewId)}`,
      {
        method: 'PATCH',
        headers: supabaseHeaders(secretKey, { Prefer: 'return=representation' }),
        body: JSON.stringify(patch)
      }
    );
    const data = await readJson(response);

    if (!response.ok) {
      console.error('Admin retreat review update failed:', data);
      return res.status(500).json({
        success: false,
        message: 'Unable to update review',
        databaseError: data
      });
    }

    return res.status(200).json({
      success: true,
      review: Array.isArray(data) && data.length ? data[0] : null
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const session = requireAdmin(req, res);
  if (!session) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  const route = String(req.query?.route || '').trim();
  if (route === 'reviews') {
    try {
      return await handleReviews(
        req,
        res,
        session,
        supabaseUrl,
        supabaseSecretKey
      );
    } catch (error) {
      console.error('Admin retreat reviews server error:', error);
      return res.status(500).json({
        success: false,
        message: 'Admin retreat review server error'
      });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const bookingResponse = await fetch(
      supabaseUrl + '/rest/v1/bookings?select=*&order=created_at.desc',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: 'Bearer ' + supabaseSecretKey,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    );

    const responseText = await bookingResponse.text();
    let bookings = [];

    try {
      bookings = responseText ? JSON.parse(responseText) : [];
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Invalid database response'
      });
    }

    if (!bookingResponse.ok) {
      console.error('Supabase admin bookings fetch failed:', bookings);
      return res.status(500).json({
        success: false,
        message: 'Unable to load bookings',
        databaseError: bookings
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        memberId: session.memberId,
        role: session.role
      },
      bookings: Array.isArray(bookings) ? bookings : []
    });
  } catch (error) {
    console.error('Admin bookings server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin bookings server error'
    });
  }
}
