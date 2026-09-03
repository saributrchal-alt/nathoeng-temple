import {
  getSessionFromRequest,
  requireAdmin
} from '../lib/_auth.js';

function jsonHeaders(secret) {
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
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

function isBookingCompleted(booking) {
  if (!booking) return false;

  if (booking.status === 'completed') {
    return true;
  }

  if (booking.status !== 'checked_out') {
    return false;
  }

  return Boolean(booking.completed_at) ||
    ['qr_return', 'admin_return'].includes(booking.checkout_method);
}

async function getBooking(supabaseUrl, secret, bookingId) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/bookings` +
      `?id=eq.${encodeURIComponent(bookingId)}` +
      `&select=id,member_id,status,start_date,end_date,completed_at,checkout_method`,
    {
      method: 'GET',
      headers: jsonHeaders(secret),
      cache: 'no-store'
    }
  );

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error('Unable to load booking');
  }

  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function enrichReviews(supabaseUrl, secret, reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return [];

  const memberIds = [...new Set(reviews.map((item) => item.member_id).filter(Boolean))];
  const bookingIds = [...new Set(reviews.map((item) => item.booking_id).filter(Boolean))];

  let members = [];
  let bookings = [];

  if (memberIds.length > 0) {
    const memberFilter = memberIds.map((id) => `"${id}"`).join(',');
    const response = await fetch(
      `${supabaseUrl}/rest/v1/members` +
        `?id=in.(${encodeURIComponent(memberFilter)})` +
        `&select=id,full_name,display_name,picture_url`,
      {
        method: 'GET',
        headers: jsonHeaders(secret),
        cache: 'no-store'
      }
    );

    const data = await readJson(response);
    if (response.ok && Array.isArray(data)) members = data;
  }

  if (bookingIds.length > 0) {
    const bookingFilter = bookingIds.map((id) => `"${id}"`).join(',');
    const response = await fetch(
      `${supabaseUrl}/rest/v1/bookings` +
        `?id=in.(${encodeURIComponent(bookingFilter)})` +
        `&select=id,start_date,end_date`,
      {
        method: 'GET',
        headers: jsonHeaders(secret),
        cache: 'no-store'
      }
    );

    const data = await readJson(response);
    if (response.ok && Array.isArray(data)) bookings = data;
  }

  const memberMap = new Map(members.map((member) => [member.id, member]));
  const bookingMap = new Map(bookings.map((booking) => [booking.id, booking]));

  return reviews.map((review) => {
    const member = memberMap.get(review.member_id) || null;
    const booking = bookingMap.get(review.booking_id) || null;

    return {
      ...review,
      reviewer_name:
        member?.full_name ||
        member?.display_name ||
        null,
      picture_url: member?.picture_url || null,
      start_date: booking?.start_date || null,
      end_date: booking?.end_date || null
    };
  });
}

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration is missing'
    });
  }

  if (req.method === 'GET') {
    const scope = String(req.query?.scope || 'public');

    try {
      if (scope === 'public') {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?status=eq.published` +
            `&consent_public=eq.true` +
            `&select=id,booking_id,member_id,rating,comment,status,consent_public,created_at,updated_at,published_at` +
            `&order=published_at.desc.nullslast,created_at.desc` +
            `&limit=50`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error('Public retreat reviews lookup failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to load retreat reviews'
          });
        }

        const reviews = await enrichReviews(
          supabaseUrl,
          supabaseSecretKey,
          Array.isArray(data) ? data : []
        );

        return res.status(200).json({ success: true, reviews });
      }

      if (scope === 'mine') {
        const session = getSessionFromRequest(req);

        if (!session?.memberId) {
          return res.status(401).json({
            success: false,
            message: 'Login required'
          });
        }

        const bookingId = String(req.query?.bookingId || '').trim();

        if (!bookingId) {
          return res.status(400).json({
            success: false,
            message: 'Booking ID is required'
          });
        }

        const booking = await getBooking(
          supabaseUrl,
          supabaseSecretKey,
          bookingId
        );

        if (!booking || booking.member_id !== session.memberId) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?booking_id=eq.${encodeURIComponent(bookingId)}` +
            `&member_id=eq.${encodeURIComponent(session.memberId)}` +
            `&select=*` +
            `&limit=1`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error('Member retreat review lookup failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to load review'
          });
        }

        return res.status(200).json({
          success: true,
          review: Array.isArray(data) && data.length > 0 ? data[0] : null
        });
      }

      if (scope === 'admin') {
        const session = requireAdmin(req, res);
        if (!session) return;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?select=*` +
            `&order=created_at.desc`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error('Admin retreat reviews lookup failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to load retreat reviews'
          });
        }

        const reviews = await enrichReviews(
          supabaseUrl,
          supabaseSecretKey,
          Array.isArray(data) ? data : []
        );

        return res.status(200).json({ success: true, reviews });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid review scope'
      });
    } catch (error) {
      console.error('Retreat reviews GET error:', error);
      return res.status(500).json({
        success: false,
        message: 'Retreat review server error'
      });
    }
  }

  if (req.method === 'POST') {
    const action = String(req.body?.action || '').trim();

    try {
      if (action === 'submit') {
        const session = getSessionFromRequest(req);

        if (!session?.memberId) {
          return res.status(401).json({
            success: false,
            message: 'Login required'
          });
        }

        const bookingId = String(req.body?.bookingId || '').trim();
        const rating = Number(req.body?.rating);
        const comment = String(req.body?.comment || '').trim();
        const consentPublic = req.body?.consentPublic === true;

        if (!bookingId) {
          return res.status(400).json({
            success: false,
            message: 'Booking ID is required'
          });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
          });
        }

        if (comment.length < 3 || comment.length > 2000) {
          return res.status(400).json({
            success: false,
            message: 'Comment must contain 3–2,000 characters'
          });
        }

        const booking = await getBooking(
          supabaseUrl,
          supabaseSecretKey,
          bookingId
        );

        if (!booking || booking.member_id !== session.memberId) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        if (!isBookingCompleted(booking)) {
          return res.status(400).json({
            success: false,
            message: 'Only completed retreat stays can be reviewed'
          });
        }

        const now = new Date().toISOString();
        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews?on_conflict=booking_id`,
          {
            method: 'POST',
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify({
              booking_id: bookingId,
              member_id: session.memberId,
              rating,
              comment,
              consent_public: consentPublic,
              status: 'pending',
              published_at: null,
              updated_at: now
            })
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error('Retreat review upsert failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to save review'
          });
        }

        return res.status(200).json({
          success: true,
          review: Array.isArray(data) && data.length > 0 ? data[0] : null
        });
      }

      if (action === 'publish' || action === 'hide') {
        const session = requireAdmin(req, res);
        if (!session) return;

        const reviewId = String(req.body?.reviewId || '').trim();

        if (!reviewId) {
          return res.status(400).json({
            success: false,
            message: 'Review ID is required'
          });
        }

        if (action === 'publish') {
          const lookup = await fetch(
            `${supabaseUrl}/rest/v1/retreat_reviews` +
              `?id=eq.${encodeURIComponent(reviewId)}` +
              `&select=id,consent_public` +
              `&limit=1`,
            {
              method: 'GET',
              headers: jsonHeaders(supabaseSecretKey),
              cache: 'no-store'
            }
          );

          const rows = await readJson(lookup);
          const review = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

          if (!lookup.ok || !review) {
            return res.status(404).json({
              success: false,
              message: 'Review not found'
            });
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
            headers: {
              ...jsonHeaders(supabaseSecretKey),
              Prefer: 'return=representation'
            },
            body: JSON.stringify(patch)
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error('Admin retreat review update failed:', data);
          return res.status(500).json({
            success: false,
            message: 'Unable to update review'
          });
        }

        return res.status(200).json({
          success: true,
          review: Array.isArray(data) && data.length > 0 ? data[0] : null
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid review action'
      });
    } catch (error) {
      console.error('Retreat reviews POST error:', error);
      return res.status(500).json({
        success: false,
        message: 'Retreat review server error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
