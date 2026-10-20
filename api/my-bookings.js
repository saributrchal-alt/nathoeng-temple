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

  return (
    Boolean(booking.completed_at) ||
    ['qr_return', 'admin_return'].includes(
      booking.checkout_method
    )
  );
}

async function getBooking(
  supabaseUrl,
  secret,
  bookingId
) {
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

  return Array.isArray(data) && data.length > 0
    ? data[0]
    : null;
}

async function enrichReviews(
  supabaseUrl,
  secret,
  reviews
) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return [];
  }

  const memberIds = [
    ...new Set(
      reviews
        .map((item) => item.member_id)
        .filter(Boolean)
    )
  ];

  const bookingIds = [
    ...new Set(
      reviews
        .map((item) => item.booking_id)
        .filter(Boolean)
    )
  ];

  let members = [];
  let bookings = [];

  if (memberIds.length > 0) {
    const memberFilter = memberIds
      .map((id) => `"${id}"`)
      .join(',');

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

    if (response.ok && Array.isArray(data)) {
      members = data;
    }
  }

  if (bookingIds.length > 0) {
    const bookingFilter = bookingIds
      .map((id) => `"${id}"`)
      .join(',');

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

    if (response.ok && Array.isArray(data)) {
      bookings = data;
    }
  }

  const memberMap = new Map(
    members.map((member) => [member.id, member])
  );

  const bookingMap = new Map(
    bookings.map((booking) => [booking.id, booking])
  );

  return reviews.map((review) => {
    const member =
      memberMap.get(review.member_id) || null;

    const booking =
      bookingMap.get(review.booking_id) || null;

    return {
      ...review,
      reviewer_name:
        member?.full_name ||
        member?.display_name ||
        null,
      picture_url:
        member?.picture_url || null,
      start_date:
        booking?.start_date || null,
      end_date:
        booking?.end_date || null
    };
  });
}

async function handleReviewRoute(
  req,
  res,
  supabaseUrl,
  supabaseSecretKey
) {
  if (req.method === 'GET') {
    const scope = String(
      req.query?.scope || 'public'
    );

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
            headers: jsonHeaders(
              supabaseSecretKey
            ),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error(
            'Public retreat reviews lookup failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message:
              'Unable to load retreat reviews'
          });
        }

        const reviews = await enrichReviews(
          supabaseUrl,
          supabaseSecretKey,
          Array.isArray(data) ? data : []
        );

        return res.status(200).json({
          success: true,
          reviews
        });
      }

      if (scope === 'mine') {
        const session =
          getSessionFromRequest(req);

        if (!session?.memberId) {
          return res.status(401).json({
            success: false,
            message: 'Login required'
          });
        }

        const bookingId = String(
          req.query?.bookingId || ''
        ).trim();

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

        if (
          !booking ||
          booking.member_id !== session.memberId
        ) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?booking_id=eq.${encodeURIComponent(
              bookingId
            )}` +
            `&member_id=eq.${encodeURIComponent(
              session.memberId
            )}` +
            `&select=*` +
            `&limit=1`,
          {
            method: 'GET',
            headers: jsonHeaders(
              supabaseSecretKey
            ),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error(
            'Member retreat review lookup failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to load review'
          });
        }

        return res.status(200).json({
          success: true,
          review:
            Array.isArray(data) &&
            data.length > 0
              ? data[0]
              : null
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
            headers: jsonHeaders(
              supabaseSecretKey
            ),
            cache: 'no-store'
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error(
            'Admin retreat reviews lookup failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message:
              'Unable to load retreat reviews'
          });
        }

        const reviews = await enrichReviews(
          supabaseUrl,
          supabaseSecretKey,
          Array.isArray(data) ? data : []
        );

        return res.status(200).json({
          success: true,
          reviews
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid review scope'
      });
    } catch (error) {
      console.error(
        'Retreat reviews GET error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Retreat review server error'
      });
    }
  }

  if (req.method === 'POST') {
    const action = String(
      req.body?.action || ''
    ).trim();

    try {
      if (action === 'submit') {
        const session =
          getSessionFromRequest(req);

        if (!session?.memberId) {
          return res.status(401).json({
            success: false,
            message: 'Login required'
          });
        }

        const bookingId = String(
          req.body?.bookingId || ''
        ).trim();

        const rating = Number(
          req.body?.rating
        );

        const comment = String(
          req.body?.comment || ''
        ).trim();

        const consentPublic =
          req.body?.consentPublic === true;

        if (!bookingId) {
          return res.status(400).json({
            success: false,
            message: 'Booking ID is required'
          });
        }

        if (
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Rating must be between 1 and 5'
          });
        }

        if (
          comment.length < 3 ||
          comment.length > 2000
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Comment must contain 3–2,000 characters'
          });
        }

        const booking = await getBooking(
          supabaseUrl,
          supabaseSecretKey,
          bookingId
        );

        if (
          !booking ||
          booking.member_id !== session.memberId
        ) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        if (!isBookingCompleted(booking)) {
          return res.status(400).json({
            success: false,
            message:
              'Only completed retreat stays can be reviewed'
          });
        }

        const existingResponse = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?booking_id=eq.${encodeURIComponent(bookingId)}` +
            `&member_id=eq.${encodeURIComponent(session.memberId)}` +
            `&select=id` +
            `&limit=1`,
          {
            method: 'GET',
            headers: jsonHeaders(supabaseSecretKey),
            cache: 'no-store'
          }
        );

        const existingRows = await readJson(existingResponse);

        if (!existingResponse.ok) {
          console.error(
            'Retreat review duplicate check failed:',
            existingRows
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to verify review'
          });
        }

        if (Array.isArray(existingRows) && existingRows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'This retreat stay has already been reviewed'
          });
        }

        const now = new Date().toISOString();

        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews`,
          {
            method: 'POST',
            headers: {
              ...jsonHeaders(
                supabaseSecretKey
              ),
              Prefer: 'return=representation'
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
          console.error(
            'Retreat review insert failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to save review'
          });
        }

        return res.status(200).json({
          success: true,
          review:
            Array.isArray(data) &&
            data.length > 0
              ? data[0]
              : null
        });
      }

      if (
        action === 'publish' ||
        action === 'hide'
      ) {
        const session = requireAdmin(req, res);
        if (!session) return;

        const reviewId = String(
          req.body?.reviewId || ''
        ).trim();

        if (!reviewId) {
          return res.status(400).json({
            success: false,
            message: 'Review ID is required'
          });
        }

        if (action === 'publish') {
          const lookup = await fetch(
            `${supabaseUrl}/rest/v1/retreat_reviews` +
              `?id=eq.${encodeURIComponent(
                reviewId
              )}` +
              `&select=id,consent_public` +
              `&limit=1`,
            {
              method: 'GET',
              headers: jsonHeaders(
                supabaseSecretKey
              ),
              cache: 'no-store'
            }
          );

          const rows = await readJson(lookup);

          const review =
            Array.isArray(rows) &&
            rows.length > 0
              ? rows[0]
              : null;

          if (!lookup.ok || !review) {
            return res.status(404).json({
              success: false,
              message: 'Review not found'
            });
          }

          if (review.consent_public !== true) {
            return res.status(400).json({
              success: false,
              message:
                'Reviewer has not consented to public display'
            });
          }
        }

        const now = new Date().toISOString();

        const patch =
          action === 'publish'
            ? {
                status: 'published',
                published_at: now,
                reviewed_at: now,
                reviewed_by_member_id:
                  session.memberId,
                updated_at: now
              }
            : {
                status: 'hidden',
                published_at: null,
                reviewed_at: now,
                reviewed_by_member_id:
                  session.memberId,
                updated_at: now
              };

        const response = await fetch(
          `${supabaseUrl}/rest/v1/retreat_reviews` +
            `?id=eq.${encodeURIComponent(
              reviewId
            )}`,
          {
            method: 'PATCH',
            headers: {
              ...jsonHeaders(
                supabaseSecretKey
              ),
              Prefer: 'return=representation'
            },
            body: JSON.stringify(patch)
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          console.error(
            'Admin retreat review update failed:',
            data
          );

          return res.status(500).json({
            success: false,
            message: 'Unable to update review'
          });
        }

        return res.status(200).json({
          success: true,
          review:
            Array.isArray(data) &&
            data.length > 0
              ? data[0]
              : null
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid review action'
      });
    } catch (error) {
      console.error(
        'Retreat reviews POST error:',
        error
      );

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

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error(
      'Missing Supabase environment variables'
    );

    return res.status(500).json({
      success: false,
      message:
        'Database configuration is missing'
    });
  }

  const route = String(
    req.query?.route || ''
  ).trim();

  if (route === 'school-member-status') {
    if (req.method !== 'POST') return res.status(405).json({success:false,message:'Method not allowed'});
    const bridgeKey = process.env.SCHOOL_BRIDGE_KEY;
    if (!bridgeKey) return res.status(503).json({success:false,message:'School bridge is not configured'});
    const payload = req.body;
    const issued = Date.parse(payload?.issued_at);
    if (!payload || !/^[\w-]{1,100}$/.test(payload.member_id || '') || !Number.isFinite(issued) || issued > Date.now()+30000 || Date.now()-issued > 300000) return res.status(403).json({success:false,message:'Invalid School request'});
    const crypto = await import('node:crypto');
    const signature = String(req.headers['x-school-signature'] || '');
    const expected = crypto.createHmac('sha256',bridgeKey).update(JSON.stringify(payload)).digest('hex');
    if (!/^[a-f0-9]{64}$/.test(signature) || !crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected))) return res.status(403).json({success:false,message:'Invalid School signature'});
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(payload.member_id)}&select=id,membership_status&limit=1`, {headers:jsonHeaders(supabaseSecretKey),cache:'no-store'});
      const rows = await response.json();
      if (!response.ok || !Array.isArray(rows)) return res.status(503).json({success:false,message:'Member verification unavailable'});
      const member = rows[0];
      return res.status(200).json({success:true,is_active:Boolean(member && (!member.membership_status || member.membership_status === 'active'))});
    } catch { return res.status(503).json({success:false,message:'Member verification unavailable'}); }
  }

  if (route === 'reviews') {
    return handleReviewRoute(
      req,
      res,
      supabaseUrl,
      supabaseSecretKey
    );
  }

  if (route === 'kathin-trip-admin') {
    const admin = requireAdmin(req,res);
    if (!admin) return;
    const headers=jsonHeaders(supabaseSecretKey);
    try {
      if (req.method==='GET') {
        const q=String(req.query?.q||'').trim().slice(0,65);
        if (q.length<2) return res.status(200).json({success:true,members:[]});
        const term=q.replace(/[%*(),.]/g,' ').trim();
        const filter=encodeURIComponent('*'+term+'*');
        const response=await fetch(`${supabaseUrl}/rest/v1/members?or=(full_name.ilike.${filter},display_name.ilike.${filter})&select=id,full_name,display_name,picture_url,profile_image_url,membership_status&limit=20`,
          {headers,cache:'no-store'});
        const members=await readJson(response);
        if(!response.ok || !Array.isArray(members)) throw Error('Member search failed');
        return res.status(200).json({success:true,members:members.filter(m=>!m.membership_status||m.membership_status==='active').map(m=>({
          id:m.id,name:m.display_name||m.full_name||'สมาชิก',picture_url:m.picture_url||m.profile_image_url||null
        }))});
      }
      if(req.method!=='POST') return res.status(405).json({success:false,message:'Method not allowed'});
      if(req.body?.action==='cancel'){
        const van=String(req.body?.van_id||'');
        const seat=Number(req.body?.seat_number);
        if(!/^[a-f\d-]{36}$/i.test(van)||!Number.isInteger(seat)||seat<1||seat>13) return res.status(400).json({success:false,message:'เบาะไม่ถูกต้อง'});
        const response=await fetch(`${supabaseUrl}/rest/v1/kathin_trip_bookings?van_id=eq.${encodeURIComponent(van)}&seat_number=eq.${seat}&status=eq.booked`,{
          method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:admin.memberId})
        });
        if(!response.ok) return res.status(503).json({success:false,message:'ยกเลิกไม่สำเร็จ'});
        return res.status(200).json({success:true});
      }
      const targetId=String(req.body?.member_id||'');
      const bookingMode=String(req.body?.booking_mode||'member');
      const vanId=String(req.body?.van_id||'');
      const seat=Number(req.body?.seat_number);
      if(!['member','placeholder_male','placeholder_female'].includes(bookingMode) || (bookingMode==='member' && !/^[a-f\d-]{36}$/i.test(targetId)) || !/^[a-f\d-]{36}$/i.test(vanId)||!Number.isInteger(seat)||seat<1||seat>13)
        return res.status(400).json({success:false,message:'ข้อมูลสมาชิกหรือเบาะไม่ถูกต้อง'});
      const response=await fetch(`${supabaseUrl}/rest/v1/rpc/kathin_trip_admin_assign`,{
        method:'POST',headers,body:JSON.stringify({p_member_id:bookingMode==='member'?targetId:null,p_booking_mode:bookingMode,p_van_id:vanId,p_seat_number:seat})
      });
      const result=await readJson(response);
      if(!response.ok) return res.status(409).json({success:false,message:result?.message||'เบาะถูกจองแล้ว'});
      return res.status(200).json({success:true,booking:result});
    }catch(error){console.error('Kathin admin seat:',error);return res.status(503).json({success:false,message:'ระบบแอดมินจองที่นั่งไม่พร้อม'});}
  }

  if (route === 'kathin-trip') {
    const session = getSessionFromRequest(req);
    if (!session?.memberId || session.actingAdminId)
      return res.status(401).json({success:false,message:'กรุณาเข้าสู่ระบบด้วยบัญชีสมาชิกจริง'});
    const memberId = session.memberId;
    const headers = jsonHeaders(supabaseSecretKey);
    try {
      const memberRes = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,membership_status&limit=1`,
        {headers,cache:'no-store'});
      const memberRows = await readJson(memberRes);
      if (!memberRes.ok || !Array.isArray(memberRows)) throw new Error('ตรวจสมาชิกไม่สำเร็จ');
      if (!memberRows[0] || (memberRows[0].membership_status && memberRows[0].membership_status !== 'active'))
        return res.status(403).json({success:false,message:'สมาชิกไม่อยู่ในสถานะใช้งาน'});
      if (req.method === 'GET') {
        const [vansRes,bookRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/kathin_trip_vans?active=eq.true&select=id,van_number,seat_count&order=van_number.asc`,{headers,cache:'no-store'}),
          fetch(`${supabaseUrl}/rest/v1/kathin_trip_bookings?event_key=eq.kathin-2569-trip-2026-11-07&status=eq.booked&select=member_id,van_id,seat_number,booking_mode`,{headers,cache:'no-store'})
        ]);
        const [vans,bookings] = await Promise.all([readJson(vansRes),readJson(bookRes)]);
        if (!vansRes.ok || !bookRes.ok || !Array.isArray(vans) || !Array.isArray(bookings)) throw new Error('อ่านที่นั่งไม่สำเร็จ');
        // Restrict passenger profiles to authenticated active members on this trip page.
        // Never expose phone, ID documents, or account identifiers in the response.
        let passengers = [];
        if (bookings.length) {
          const ids = [...new Set(bookings.map(b=>b.member_id).filter(Boolean))];
          const list = ids.map(id=>'\"'+id+'\"').join(',');
          const passengersRes = await fetch(
            `${supabaseUrl}/rest/v1/members?id=in.(${encodeURIComponent(list)})&select=id,display_name,full_name,picture_url,profile_image_url`,
            {headers,cache:'no-store'}
          );
          passengers = await readJson(passengersRes);
          if (!passengersRes.ok || !Array.isArray(passengers)) throw new Error('อ่านรูปโปรไฟล์ไม่สำเร็จ');
        }
        const passengerMap = new Map(passengers.map(p=>[p.id,p]));
        res.setHeader('Cache-Control','private, no-store');
        return res.status(200).json({success:true,vans,occupied:bookings.map(b=>{
            const passenger=passengerMap.get(b.member_id);
            return {van_id:b.van_id,seat_number:b.seat_number,is_mine:b.member_id===memberId,
              booking_mode:b.booking_mode||'member',passenger_name:b.booking_mode==='placeholder_male'?'สำรองชาย':b.booking_mode==='placeholder_female'?'สำรองหญิง':passenger?.display_name||passenger?.full_name||'สมาชิก',
              picture_url:b.booking_mode==='member'?(passenger?.picture_url||passenger?.profile_image_url||null):null};
          }),
          mine:bookings.find(b=>b.member_id===memberId)?{van_id:bookings.find(b=>b.member_id===memberId).van_id,seat_number:bookings.find(b=>b.member_id===memberId).seat_number}:null});
      }
      if (req.method !== 'POST') return res.status(405).json({success:false,message:'Method not allowed'});
      if (req.body?.action==='cancel') {
        const response=await fetch(`${supabaseUrl}/rest/v1/kathin_trip_bookings?event_key=eq.kathin-2569-trip-2026-11-07&member_id=eq.${encodeURIComponent(memberId)}&status=eq.booked`,{
          method:'PATCH',headers:{...headers,Prefer:'return=representation'},
          body:JSON.stringify({status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:memberId})
        });
        const cancelled=await readJson(response);
        if(!response.ok || !Array.isArray(cancelled)) throw Error('ยกเลิกการจองไม่สำเร็จ');
        return res.status(200).json({success:true,cancelled:cancelled.length});
      }
      const passportStatus=String(req.body?.passport_status||'');
      if(!['has_passport','no_passport'].includes(passportStatus))
        return res.status(400).json({success:false,message:'กรุณาเลือกสถานะ Passport ก่อนยืนยัน'});
      const vanId=String(req.body?.van_id||'');
      const seatNumber=Number(req.body?.seat_number);
      if (!/^[a-f0-9-]{36}$/i.test(vanId) || !Number.isInteger(seatNumber) || seatNumber<1 || seatNumber>30)
        return res.status(400).json({success:false,message:'ข้อมูลที่นั่งไม่ถูกต้อง'});
      const response=await fetch(`${supabaseUrl}/rest/v1/rpc/kathin_trip_confirm_seat`,{
        method:'POST',headers:{...headers,Prefer:'return=representation'},
        body:JSON.stringify({p_member_id:memberId,p_van_id:vanId,p_seat_number:seatNumber,p_passport_status:passportStatus})
      });
      const result=await readJson(response);
      if (!response.ok) return res.status(response.status===409?409:400).json({success:false,message:String(result?.message||'ไม่สามารถจองที่นั่งได้')});
      return res.status(200).json({success:true,booking:result});
    } catch(error) { console.error('Kathin trip booking:',error); return res.status(503).json({success:false,message:'ระบบจองทริปไม่พร้อม กรุณาลองอีกครั้ง'}); }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const session = getSessionFromRequest(req);

  if (!session || !session.memberId) {
    return res.status(401).json({
      success: false,
      message: 'Login required'
    });
  }

  if (route === 'school-handoff') {
    if (session.actingAdminId) return res.status(403).json({success:false,message:'กรุณาใช้บัญชีสมาชิกของตนเองเข้า School'});
    const bridgeKey = process.env.SCHOOL_BRIDGE_KEY;
    if (!bridgeKey) return res.status(503).json({success:false,message:'ยังไม่ได้ตั้งค่า SCHOOL_BRIDGE_KEY'});
    try {
      const memberResponse = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(session.memberId)}&select=id,membership_status&limit=1`, {headers:jsonHeaders(supabaseSecretKey),cache:'no-store'});
      const rows = await memberResponse.json();
      if (!memberResponse.ok || !Array.isArray(rows)) return res.status(503).json({success:false,message:'ตรวจสมาชิกไม่สำเร็จ'});
      const member = rows[0];
      if (!member || (member.membership_status && member.membership_status !== 'active')) return res.status(403).json({success:false,message:'บัญชีสมาชิกนี้หยุดใช้งานแล้ว'});
      // School membership is stored in the same Supabase project as Temple.
      // Avoid a brittle cross-domain round-trip for this preflight check;
      // School still verifies member permissions and Temple status on POST /api/session.
      const schoolResponse = await fetch(
        `${supabaseUrl}/rest/v1/school_members?member_id=eq.${encodeURIComponent(member.id)}&select=member_id,is_active,can_study,can_teach,can_manage&limit=1`,
        {headers:jsonHeaders(supabaseSecretKey),cache:'no-store',signal:AbortSignal.timeout(8000)}
      );
      if (!schoolResponse.ok) return res.status(503).json({success:false,message:'ตรวจสิทธิ์ School ไม่สำเร็จ'});
      const schoolRows = await schoolResponse.json();
      if (!Array.isArray(schoolRows)) return res.status(503).json({success:false,message:'ตรวจสิทธิ์ School ไม่สำเร็จ'});
      const school = schoolRows[0];
      const crypto = await import('node:crypto');
      if (!school?.is_active || !(school.can_study || school.can_teach || school.can_manage)) return res.status(403).json({success:false,message:'กรุณาให้ผู้ดูแลวัดมอบสิทธิ์ School จากรายการสมาชิกก่อน'});
      const now = Date.now();
      const encoded = Buffer.from(JSON.stringify({memberId:String(member.id),purpose:'school-handoff',aud:'school.nathoeng.com',iat:now,exp:now+300000})).toString('base64url');
      const token = encoded + '.' + crypto.createHmac('sha256',bridgeKey).update(encoded).digest('base64url');
      return res.status(200).json({success:true,token});
    } catch { return res.status(503).json({success:false,message:'เชื่อมต่อ School ไม่สำเร็จ กรุณาลองใหม่'}); }
  }

  try {
    const bookingResponse = await fetch(
      supabaseUrl +
        '/rest/v1/bookings' +
        '?member_id=eq.' +
        encodeURIComponent(session.memberId) +
        '&select=*' +
        '&order=created_at.desc',
      {
        method: 'GET',
        headers: {
          apikey: supabaseSecretKey,
          Authorization:
            'Bearer ' + supabaseSecretKey,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    );

    const bookingText =
      await bookingResponse.text();

    let bookings = [];

    try {
      bookings = bookingText
        ? JSON.parse(bookingText)
        : [];
    } catch (error) {
      console.error(
        'Unable to parse member bookings:',
        bookingText
      );

      return res.status(500).json({
        success: false,
        message: 'Invalid database response'
      });
    }

    if (!bookingResponse.ok) {
      console.error(
        'My bookings fetch failed:',
        bookings
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to load stay bookings'
      });
    }

    return res.status(200).json({
      success: true,
      member: {
        memberId: session.memberId,
        role: session.role
      },
      bookings:
        Array.isArray(bookings)
          ? bookings
          : []
    });
  } catch (error) {
    console.error(
      'My bookings server error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'My bookings server error'
    });
  }
}
