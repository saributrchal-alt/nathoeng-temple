import React, { useEffect, useMemo, useState } from 'react';

function AdminRetreatReviewPanel({ lang = 'th' }) {
  const th = lang === 'th';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin-bookings?route=reviews&ts=${Date.now()}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load reviews');
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      console.error('Admin retreat reviews load error:', err);
      setError(
        err.message ||
          (th ? 'ไม่สามารถโหลดรีวิวได้' : 'Unable to load retreat reviews.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((item) => item.status === filter);
  }, [reviews, filter]);

  const updateStatus = async (review, action) => {
    const wording = action === 'publish'
      ? th
        ? 'ยืนยันเผยแพร่รีวิวนี้บนเว็บไซต์หรือไม่?'
        : 'Publish this review on the website?'
      : th
      ? 'ยืนยันซ่อนรีวิวนี้จากเว็บไซต์หรือไม่?'
      : 'Hide this review from the website?';

    if (!window.confirm(wording)) return;

    setProcessingId(review.id);
    setError('');

    try {
      const response = await fetch('/api/admin-bookings?route=reviews', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          reviewId: review.id
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to update review');
      }

      await loadReviews();
    } catch (err) {
      console.error('Admin review action error:', err);
      setError(
        err.message ||
          (th ? 'ไม่สามารถอัปเดตรีวิวได้' : 'Unable to update review.')
      );
    } finally {
      setProcessingId('');
    }
  };

  const formatDate = (raw) => {
    if (!raw) return '—';
    const date = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(raw);

    return new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Bangkok'
    }).format(date);
  };

  const statusLabel = (status) => ({
    pending: th ? 'รอตรวจสอบ' : 'Pending',
    published: th ? 'เผยแพร่แล้ว' : 'Published',
    hidden: th ? 'ซ่อน' : 'Hidden'
  }[status] || status);

  return (
    <section className="adminRetreatReviews">
      <style>{`
        .adminRetreatReviews h1 {
          margin-bottom: 6px;
        }

        .adminReviewHelp {
          margin: 0 0 20px;
          color: #756c60;
          line-height: 1.65;
        }

        .adminReviewToolbar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .adminReviewFilter {
          padding: 8px 12px;
          border: 1px solid #ddd2c2;
          border-radius: 999px;
          background: #fff;
          color: #6b5b47;
          font: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .adminReviewFilter.active {
          border-color: #a57929;
          background: #fff6e5;
          color: #8b601b;
          font-weight: 700;
        }

        .adminReviewList {
          display: grid;
          gap: 14px;
        }

        .adminReviewCard {
          padding: 18px;
          border: 1px solid #e1d7c9;
          border-radius: 14px;
          background: #fff;
        }

        .adminReviewTop {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .adminReviewAvatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 50%;
          object-fit: cover;
          background: #f2ece3;
        }

        .adminReviewName {
          font-weight: 800;
          color: #382f28;
        }

        .adminReviewStars {
          color: #c58b1c;
          font-size: 17px;
          letter-spacing: 1px;
        }

        .adminReviewMeta {
          margin-top: 3px;
          color: #8c8276;
          font-size: 11px;
        }

        .adminReviewComment {
          margin-top: 14px;
          padding: 14px;
          border-radius: 10px;
          background: #faf8f4;
          color: #514941;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .adminReviewBottom {
          margin-top: 14px;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .adminReviewStatus {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f0ece5;
          color: #6d6256;
          font-size: 11px;
          font-weight: 700;
        }

        .adminReviewConsent {
          color: #84796d;
          font-size: 11px;
        }

        .adminReviewAction {
          min-height: 38px;
          padding: 8px 13px;
          border-radius: 999px;
          font: inherit;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .adminReviewPublish {
          border: 1px solid #2f8a42;
          background: #2f8a42;
          color: #fff;
        }

        .adminReviewHide {
          border: 1px solid #d0c4b5;
          background: #fff;
          color: #765f43;
        }

        .adminReviewAction:disabled {
          opacity: .55;
          cursor: wait;
        }

        .adminReviewError {
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #fff1ef;
          color: #9d3d33;
          font-size: 12px;
        }

        @media (max-width: 720px) {
          .adminReviewCard {
            padding: 15px;
          }
        }
      `}</style>

      <span className="eyebrow">
        {th ? 'รีวิวจากผู้เข้าปฏิบัติธรรม' : 'RETREAT REVIEWS'}
      </span>
      <h1>{th ? 'จัดการรีวิว' : 'Review Management'}</h1>
      <p className="adminReviewHelp">
        {th
          ? 'ตรวจสอบความคิดเห็นก่อนเผยแพร่สู่หน้าเว็บไซต์ ผู้ดูแลสามารถเผยแพร่หรือซ่อนได้ แต่ไม่แก้ไขคำพูดของผู้รีวิว'
          : 'Review participant feedback before publication. Administrators can publish or hide reviews, but do not edit the reviewer’s words.'}
      </p>

      <div className="adminReviewToolbar">
        {[
          ['all', th ? 'ทั้งหมด' : 'All'],
          ['pending', th ? 'รอตรวจสอบ' : 'Pending'],
          ['published', th ? 'เผยแพร่แล้ว' : 'Published'],
          ['hidden', th ? 'ซ่อน' : 'Hidden']
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`adminReviewFilter ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}

        <button type="button" className="adminReviewFilter" onClick={loadReviews}>
          ↻ {th ? 'โหลดใหม่' : 'Refresh'}
        </button>
      </div>

      {error && <div className="adminReviewError">{error}</div>}

      {loading ? (
        <div>{th ? 'กำลังโหลดรีวิว...' : 'Loading reviews...'}</div>
      ) : filtered.length === 0 ? (
        <div>{th ? 'ยังไม่มีรีวิวในหมวดนี้' : 'No reviews in this category.'}</div>
      ) : (
        <div className="adminReviewList">
          {filtered.map((review) => (
            <article key={review.id} className="adminReviewCard">
              <div className="adminReviewTop">
                {review.picture_url ? (
                  <img
                    src={review.picture_url}
                    alt=""
                    className="adminReviewAvatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="adminReviewAvatar" />
                )}

                <div>
                  <div className="adminReviewName">
                    {review.reviewer_name || (th ? 'ผู้เข้าปฏิบัติธรรม' : 'Retreat participant')}
                  </div>
                  <div className="adminReviewStars">
                    {'★'.repeat(Number(review.rating) || 0)}
                    <span style={{ color: '#ddd4c8' }}>
                      {'★'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
                    </span>
                  </div>
                  <div className="adminReviewMeta">
                    {formatDate(review.start_date)} – {formatDate(review.end_date)}
                    {' · '}
                    {formatDate(review.updated_at || review.created_at)}
                  </div>
                </div>
              </div>

              <div className="adminReviewComment">{review.comment}</div>

              <div className="adminReviewBottom">
                <span className="adminReviewStatus">
                  {statusLabel(review.status)}
                </span>
                <span className="adminReviewConsent">
                  {review.consent_public
                    ? th
                      ? '✓ ยินยอมเผยแพร่'
                      : '✓ Public consent given'
                    : th
                    ? 'ไม่ยินยอมเผยแพร่'
                    : 'No public consent'}
                </span>

                {review.status !== 'published' && (
                  <button
                    type="button"
                    className="adminReviewAction adminReviewPublish"
                    disabled={processingId === review.id || !review.consent_public}
                    onClick={() => updateStatus(review, 'publish')}
                  >
                    {th ? 'เผยแพร่' : 'Publish'}
                  </button>
                )}

                {review.status !== 'hidden' && (
                  <button
                    type="button"
                    className="adminReviewAction adminReviewHide"
                    disabled={processingId === review.id}
                    onClick={() => updateStatus(review, 'hide')}
                  >
                    {th ? 'ซ่อน' : 'Hide'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminRetreatReviewPanel;
