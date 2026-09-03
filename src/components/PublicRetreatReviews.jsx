import React, { useEffect, useState } from 'react';

function PublicRetreatReviews({ lang = 'th' }) {
  const th = lang === 'th';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `/api/my-bookings?route=reviews&scope=public&ts=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Public retreat reviews load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (raw) => {
    if (!raw) return '';
    const date = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Bangkok'
    }).format(date);
  };

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="publicRetreatReviews">
      <style>{`
        .publicRetreatReviews {
          margin-top: 34px;
          padding-top: 34px;
          border-top: 1px solid #e7ddcf;
        }

        .publicReviewHeader {
          text-align: center;
          margin-bottom: 22px;
        }

        .publicReviewHeader img {
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
        }

        .publicReviewHeader h2 {
          margin: 0 0 6px;
          color: #3e3025;
          font-size: 24px;
          font-weight: 600;
        }

        .publicReviewHeader p {
          margin: 0;
          color: #7a7066;
          font-size: 13px;
        }

        .publicReviewGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 14px;
        }

        .publicReviewCard {
          padding: 18px;
          border: 1px solid #e4dacb;
          border-radius: 14px;
          background: #fffdf9;
          box-shadow: 0 8px 22px rgba(68, 48, 26, .04);
        }

        .publicReviewPerson {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .publicReviewAvatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #dfd4c4;
          background: #f4efe7;
        }

        .publicReviewFallback {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f3eee5;
          color: #a57929;
          font-weight: 800;
        }

        .publicReviewName {
          color: #3e352d;
          font-size: 14px;
          font-weight: 700;
        }

        .publicReviewStars {
          margin-top: 2px;
          color: #c58b1c;
          letter-spacing: 1px;
          font-size: 16px;
        }

        .publicReviewMonth {
          margin-top: 2px;
          color: #958a7d;
          font-size: 10.5px;
        }

        .publicReviewComment {
          margin-top: 14px;
          color: #5b534b;
          font-size: 13px;
          line-height: 1.75;
          white-space: pre-wrap;
        }

        .publicReviewLoading {
          padding: 24px;
          text-align: center;
          color: #8a7e70;
          font-size: 12px;
        }

        @media (max-width: 720px) {
          .publicRetreatReviews {
            margin-top: 28px;
            padding-top: 28px;
          }

          .publicReviewHeader h2 {
            font-size: 21px;
          }

          .publicReviewGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="publicReviewHeader">
        <img src="/icons/lotus.svg" alt="" aria-hidden="true" />
        <h2>
          {th ? 'เสียงจากผู้เข้าปฏิบัติธรรม' : 'Experiences from Retreat Participants'}
        </h2>
        <p>
          {th
            ? 'ความคิดเห็นจากผู้ที่เข้าพักและปฏิบัติธรรม ณ วัดพุทธอุทยานนาเทิง'
            : 'Reflections from verified retreat participants at Buddhist Park Monastery of Nathoeng.'}
        </p>
      </div>

      {loading ? (
        <div className="publicReviewLoading">
          {th ? 'กำลังโหลดความคิดเห็น...' : 'Loading participant reviews...'}
        </div>
      ) : (
        <div className="publicReviewGrid">
          {reviews.map((review) => {
            const name = review.reviewer_name || (th ? 'ผู้เข้าปฏิบัติธรรม' : 'Retreat participant');
            const initial = String(name).trim().charAt(0) || '•';

            return (
              <article key={review.id} className="publicReviewCard">
                <div className="publicReviewPerson">
                  {review.picture_url ? (
                    <img
                      className="publicReviewAvatar"
                      src={review.picture_url}
                      alt={name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="publicReviewFallback" aria-hidden="true">
                      {initial}
                    </div>
                  )}

                  <div>
                    <div className="publicReviewName">{name}</div>
                    <div className="publicReviewStars" aria-label={`${review.rating} stars`}>
                      {'★'.repeat(Number(review.rating) || 0)}
                      <span style={{ color: '#ddd4c8' }}>
                        {'★'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
                      </span>
                    </div>
                    {review.start_date && (
                      <div className="publicReviewMonth">
                        {formatMonth(review.start_date)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="publicReviewComment">
                  “{review.comment}”
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PublicRetreatReviews;
