import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

function PracticeMessagesPage({
  lang,
  goToPage
}) {
  const th = lang === 'th';

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [openId, setOpenId] =
    useState(null);

  const loadMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/practice-messages',
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          'Unable to load messages'
        );
      }

      const rows =
        Array.isArray(data.messages)
          ? data.messages
          : [];

      setMessages(rows);

      if (
        rows.length > 0 &&
        !openId
      ) {
        setOpenId(rows[0].id);
      }
    } catch (err) {
      console.error(
        'Practice messages load error:',
        err
      );

      setError(
        th
          ? 'ไม่สามารถโหลดเนื้อหาปฏิบัติได้ กรุณาลองใหม่'
          : 'Unable to load practice messages. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [lang]);

  const formatDate =
    (value) => {
      if (!value) return '';

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '';
      }

      return new Intl.DateTimeFormat(
        th ? 'th-TH' : 'en-GB',
        {
          timeZone:
            'Asia/Bangkok',
          dateStyle: 'medium',
          timeStyle: 'short'
        }
      ).format(date);
    };

  const latest =
    useMemo(
      () => messages[0] || null,
      [messages]
    );

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{
          maxWidth: '760px',
          paddingBottom: '80px'
        }}
      >
        <button
          type="button"
          className="backButton"
          onClick={() =>
            goToPage('my-dashboard')
          }
        >
          {th
            ? '← กลับบัญชีของฉัน'
            : '← Back to My Account'}
        </button>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          <span className="eyebrow">
            NATHOENG CONNECT
          </span>

          <h1
            style={{
              marginBottom: '10px'
            }}
          >
            {th
              ? 'เนื้อหาปฏิบัติถึงฉัน'
              : 'Practice Messages for Me'}
          </h1>

          <p
            style={{
              margin:
                '0 auto',
              maxWidth: '620px',
              color: '#6f675d',
              lineHeight: 1.7
            }}
          >
            {th
              ? 'ข้อความและแนวทางปฏิบัติที่พระอาจารย์ฝากไว้สำหรับผู้ปฏิบัติ อ่านและรับฟังได้จากหน้านี้'
              : 'Read one-way practice guidance and messages shared by the teacher for practitioners.'}
          </p>
        </div>

        {loading ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              color: '#81786d'
            }}
          >
            {th
              ? 'กำลังโหลดเนื้อหาปฏิบัติ...'
              : 'Loading practice messages...'}
          </div>
        ) : error ? (
          <div
            style={{
              padding: '18px',
              border:
                '1px solid #efd3cd',
              borderRadius: '16px',
              background: '#fff3f1',
              color: '#8f4036'
            }}
          >
            <div>{error}</div>

            <button
              type="button"
              onClick={loadMessages}
              style={{
                marginTop: '12px',
                minHeight: '40px',
                padding: '0 14px',
                border:
                  '1px solid #d8c9b5',
                borderRadius: '10px',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              {th
                ? 'ลองใหม่'
                : 'Try again'}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              padding:
                '34px 20px',
              border:
                '1px solid #e3ddd2',
              borderRadius: '18px',
              background: '#fff',
              textAlign: 'center'
            }}
          >
            <img
              src="/icons/dhamma-book.svg"
              alt=""
              aria-hidden="true"
              style={{
                width: '38px',
                height: '38px',
                marginBottom: '12px'
              }}
            />

            <strong
              style={{
                display: 'block',
                fontSize: '18px'
              }}
            >
              {th
                ? 'ยังไม่มีเนื้อหาปฏิบัติใหม่'
                : 'No practice messages yet'}
            </strong>

            <span
              style={{
                display: 'block',
                marginTop: '6px',
                color: '#81786d',
                lineHeight: 1.6
              }}
            >
              {th
                ? 'เมื่อพระอาจารย์ฝากข้อความหรือแนวทางปฏิบัติไว้ จะปรากฏที่หน้านี้'
                : 'Messages shared by the teacher will appear here.'}
            </span>
          </div>
        ) : (
          <>
            {latest && (
              <div
                style={{
                  marginBottom: '14px',
                  padding:
                    '14px 16px',
                  border:
                    '1px solid #d8e6dc',
                  borderRadius: '16px',
                  background: '#f1f8f3',
                  color: '#355b49'
                }}
              >
                <strong>
                  {th
                    ? 'ล่าสุดจากพระอาจารย์'
                    : 'Latest from the teacher'}
                </strong>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '13px'
                  }}
                >
                  {formatDate(
                    latest.created_at
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gap: '12px'
              }}
            >
              {messages.map(
                (item) => {
                  const open =
                    openId === item.id;

                  return (
                    <article
                      key={item.id}
                      style={{
                        border:
                          '1px solid #e0d9ce',
                        borderRadius:
                          '18px',
                        background: '#fff',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenId(
                            open
                              ? null
                              : item.id
                          )
                        }
                        style={{
                          width: '100%',
                          border: 0,
                          background: '#fff',
                          padding:
                            '16px 18px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          gap: '14px',
                          alignItems:
                            'flex-start'
                        }}
                      >
                        <span>
                          <span
                            style={{
                              display:
                                'block',
                              color:
                                '#9b7226',
                              fontSize:
                                '12px',
                              fontWeight:
                                800,
                              marginBottom:
                                '5px'
                            }}
                          >
                            {formatDate(
                              item.created_at
                            )}
                          </span>

                          <strong
                            style={{
                              display:
                                'block',
                              color:
                                '#332f29',
                              fontSize:
                                '17px',
                              lineHeight:
                                1.45
                            }}
                          >
                            {item.title}
                          </strong>

                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '5px',
                              color:
                                '#81786d'
                            }}
                          >
                            {item.audience ===
                            'member'
                              ? (th
                                  ? 'ข้อความเฉพาะถึงท่าน'
                                  : 'A message for you')
                              : (th
                                  ? 'ฝากถึงผู้ปฏิบัติ'
                                  : 'For practitioners')}
                          </small>
                        </span>

                        <span
                          aria-hidden="true"
                          style={{
                            color:
                              '#9b7226',
                            fontSize:
                              '22px',
                            lineHeight: 1
                          }}
                        >
                          {open
                            ? '⌃'
                            : '⌄'}
                        </span>
                      </button>

                      {open && (
                        <div
                          style={{
                            borderTop:
                              '1px solid #eee8df',
                            padding:
                              '17px 18px 20px',
                            color:
                              '#4c463f',
                            lineHeight:
                              1.8,
                            whiteSpace:
                              'pre-wrap',
                            fontSize:
                              '15px'
                          }}
                        >
                          {item.body}

                          <div
                            style={{
                              marginTop:
                                '18px',
                              paddingTop:
                                '12px',
                              borderTop:
                                '1px solid #eee8df',
                              color:
                                '#81786d',
                              fontSize:
                                '12px'
                            }}
                          >
                            {th
                              ? '— ข้อความจากพระอาจารย์'
                              : '— Message from the teacher'}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PracticeMessagesPage;
