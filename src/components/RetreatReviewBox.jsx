import React, { useEffect, useState } from 'react';

function RetreatReviewBox({ lang = 'th', booking }) {
  const th = lang === 'th';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [consentPublic, setConsentPublic] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!booking?.id) return;
    loadReview();
  }, [booking?.id]);

  const loadReview = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/retreat-reviews?scope=mine&bookingId=${encodeURIComponent(booking.id)}&ts=${Date.now()}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load review');
      }

      const existing = data.review || null;
      setReview(existing);

      if (existing) {
        setRating(Number(existing.rating) || 5);
        setComment(existing.comment || '');
        setConsentPublic(existing.consent_public !== false);
      }
    } catch (err) {
      console.error('Retreat review load error:', err);
      setError(
        th
          ? 'ไม่สามารถโหลดข้อมูลรีวิวได้'
          : 'Unable to load your review.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async () => {
    const cleanComment = String(comment || '').trim();

    if (!rating || rating < 1 || rating > 5) {
      setError(th ? 'กรุณาให้คะแนน 1–5 ดาว' : 'Please select 1–5 stars.');
      return;
    }

    if (cleanComment.length < 3) {
      setError(
        th
          ? 'กรุณาเขียนความคิดเห็นอย่างน้อยเล็กน้อย'
          : 'Please write a short comment.'
      );
      return;
    }

    if (cleanComment.length > 2000) {
      setError(
        th
          ? 'ความคิดเห็นยาวเกิน 2,000 ตัวอักษร'
          : 'Comment exceeds 2,000 characters.'
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/retreat-reviews', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit',
          bookingId: booking.id,
          rating,
          comment: cleanComment,
          consentPublic
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save review');
      }

      setReview(data.review || null);
      setEditing(false);
    } catch (err) {
      console.error('Retreat review save error:', err);
      setError(
        err.message ||
          (th ? 'ไม่สามารถบันทึกรีวิวได้' : 'Unable to save review.')
      );
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (status) => {
    const labels = {
      pending: th ? 'รอผู้ดูแลตรวจสอบ' : 'Awaiting admin review',
      published: th ? 'เผยแพร่บนเว็บไซต์แล้ว' : 'Published on the website',
      hidden: th ? 'ยังไม่เผยแพร่' : 'Not published'
    };

    return labels[status] || status || '';
  };

  if (!booking?.id) return null;

  return (
    <section className="retreatReviewBox">
      <style>{`
        .retreatReviewBox {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid #e6dccd;
          border-radius: 12px;
          background: #fffdf8;
        }

        .retreatReviewBox h3 {
          margin: 0 0 6px;
          color: #3d3027;
          font-size: 17px;
        }

        .retreatReviewHelp {
          margin: 0 0 16px;
          color: #786e64;
          font-size: 12.5px;
          line-height: 1.65;
        }

        .retreatReviewStars {
          display: flex;
          gap: 6px;
          margin: 8px 0 14px;
        }

        .retreatReviewStar {
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid #dfd5c7;
          border-radius: 9px;
          background: #fff;
          color: #c7b9a4;
          font-size: 24px;
          cursor: pointer;
        }

        .retreatReviewStar.active {
          border-color: #d2aa5a;
          background: #fff8e8;
          color: #c58b1c;
        }

        .retreatReviewTextarea {
          width: 100%;
          min-height: 120px;
          padding: 12px 14px;
          border: 1px solid #dcd2c4;
          border-radius: 10px;
          resize: vertical;
          font: inherit;
          line-height: 1.6;
          box-sizing: border-box;
        }

        .retreatReviewConsent {
          margin: 14px 0;
          display: flex;
          gap: 9px;
          align-items: flex-start;
          color: #5f574f;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .retreatReviewActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .retreatReviewPrimary,
        .retreatReviewSecondary {
          min-height: 42px;
          padding: 9px 16px;
          border-radius: 999px;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .retreatReviewPrimary {
          border: 1px solid #a8711c;
          background: #a8711c;
          color: #fff;
        }

        .retreatReviewSecondary {
          border: 1px solid #d8cbb7;
          background: #fff;
          color: #6d5a42;
        }

        .retreatReviewPrimary:disabled,
        .retreatReviewSecondary:disabled {
          opacity: .55;
          cursor: wait;
        }

        .retreatReviewStatus {
          display: inline-flex;
          margin: 10px 0 14px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f3efe7;
          color: #79613d;
          font-size: 11px;
          font-weight: 700;
        }

        .retreatReviewReadOnlyComment {
          margin-top: 12px;
          padding: 14px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #ece4d8;
          color: #4f473f;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .retreatReviewError {
          margin: 10px 0;
          color: #a43f35;
          font-size: 12px;
        }

        @media (max-width: 720px) {
          .retreatReviewBox {
            padding: 16px;
          }

          .retreatReviewStar {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <h3>
        {th ? 'รีวิวการเข้าพักปฏิบัติธรรมครั้งนี้' : 'Review this retreat stay'}
      </h3>
      <p className="retreatReviewHelp">
        {th
          ? 'ให้คะแนน 1–5 ดาวและแบ่งปันความคิดเห็นของท่าน รีวิวจะผ่านการตรวจสอบโดยผู้ดูแลก่อนนำไปแสดงต่อสาธารณะ'
          : 'Rate your experience from 1–5 stars and share a comment. Reviews are checked by an administrator before public display.'}
      </p>

      {loading ? (
        <div className="retreatReviewHelp">
          {th ? 'กำลังโหลดรีวิว...' : 'Loading review...'}
        </div>
      ) : review && !editing ? (
        <>
          <div className="retreatReviewStars" aria-label={`${review.rating} stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: '24px',
                  color: star <= Number(review.rating) ? '#c58b1c' : '#d9d2c8'
                }}
              >
                ★
              </span>
            ))}
          </div>

          <div className="retreatReviewStatus">
            {statusLabel(review.status)}
          </div>

          <div className="retreatReviewReadOnlyComment">
            {review.comment}
          </div>

          <div className="retreatReviewActions" style={{ marginTop: '14px' }}>
            <button
              type="button"
              className="retreatReviewSecondary"
              onClick={() => setEditing(true)}
            >
              {th ? 'แก้ไขรีวิว' : 'Edit review'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="retreatReviewStars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`retreatReviewStar ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="retreatReviewTextarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            placeholder={
              th
                ? 'เขียนความคิดเห็นเกี่ยวกับการเข้าพักและการปฏิบัติธรรม...'
                : 'Share your thoughts about your retreat stay and practice...'
            }
          />

          <label className="retreatReviewConsent">
            <input
              type="checkbox"
              checked={consentPublic}
              onChange={(e) => setConsentPublic(e.target.checked)}
            />
            <span>
              {th
                ? 'ยินยอมให้ทางวัดนำชื่อ รูปโปรไฟล์ คะแนน และความคิดเห็นนี้ไปเผยแพร่บนเว็บไซต์ หลังผ่านการตรวจสอบจากผู้ดูแล'
                : 'I consent to the monastery publishing my name, profile photo, rating, and comment on the website after administrator review.'}
            </span>
          </label>

          {error && <div className="retreatReviewError">{error}</div>}

          <div className="retreatReviewActions">
            <button
              type="button"
              className="retreatReviewPrimary"
              onClick={saveReview}
              disabled={saving}
            >
              {saving
                ? th
                  ? 'กำลังบันทึก...'
                  : 'Saving...'
                : review
                ? th
                  ? 'บันทึกการแก้ไข'
                  : 'Save changes'
                : th
                ? 'ส่งรีวิว'
                : 'Submit review'}
            </button>

            {review && (
              <button
                type="button"
                className="retreatReviewSecondary"
                onClick={() => {
                  setEditing(false);
                  setRating(Number(review.rating) || 5);
                  setComment(review.comment || '');
                  setConsentPublic(review.consent_public !== false);
                  setError('');
                }}
                disabled={saving}
              >
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
            )}
          </div>
        </>
      )}

      {!loading && review && !editing && error && (
        <div className="retreatReviewError">{error}</div>
      )}
    </section>
  );
}

export default RetreatReviewBox;
