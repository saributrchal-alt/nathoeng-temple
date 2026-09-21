import React, {
  useCallback,
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

  const storageKey = 'nathoeng_connect_read_ids';

  const getReadIds = () => {
    if (typeof window === 'undefined') return [];

    try {
      const value = JSON.parse(
        window.localStorage.getItem(storageKey) || '[]'
      );

      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const [readIds, setReadIds] =
    useState(() => getReadIds());

  const markRead = (messageId) => {
    if (!messageId || readIds.includes(messageId)) return;

    const next = [...readIds, messageId];
    setReadIds(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(next)
      );
      window.dispatchEvent(
        new CustomEvent('nathoeng-connect-read')
      );
    }
  };

  const loadMessages = useCallback(async () => {
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
    } catch (err) {
      console.error(
        'Practice messages load error:',
        err
      );

      setError(
        th
          ? 'ไม่สามารถโหลดข้อความ Nathoeng Connect ได้ กรุณาลองใหม่'
          : 'Unable to load Nathoeng Connect messages. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [th]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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

  const unreadCount =
    useMemo(
      () =>
        messages.filter(
          (item) => !readIds.includes(item.id)
        ).length,
      [messages, readIds]
    );

  const markAllRead = () => {
    const next = messages.map((item) => item.id);
    setReadIds(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(next)
      );
      window.dispatchEvent(
        new CustomEvent('nathoeng-connect-read')
      );
    }
  };

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
            Nathoeng Connect
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
              ? 'ข้อความ ข่าวสาร และประกาศจากวัดสำหรับสมาชิก จะถูกรวบรวมไว้ใน Nathoeng Connect'
              : 'Messages, news and monastery announcements for members are collected here in Nathoeng Connect.'}
          </p>
        </div>

        {!loading && !error && messages.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '14px',
              padding: '12px 14px',
              border: '1px solid #e2dacd',
              borderRadius: '14px',
              background: '#fff'
            }}
          >
            <span
              style={{
                color: '#625a51',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {unreadCount > 0
                ? (th
                    ? `ยังไม่ได้อ่าน ${unreadCount} ข้อความ`
                    : `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`)
                : (th
                    ? 'อ่านข้อความทั้งหมดแล้ว'
                    : 'All messages read')}
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  minHeight: '34px',
                  padding: '0 11px',
                  border: '1px solid #d8c9b5',
                  borderRadius: '9px',
                  background: '#fffaf0',
                  color: '#8a611d',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '12px'
                }}
              >
                {th ? 'อ่านทั้งหมด' : 'Mark all read'}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              color: '#81786d'
            }}
          >
            {th
              ? 'กำลังโหลด Nathoeng Connect...'
              : 'Loading Nathoeng Connect...'}
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
                ? 'ยังไม่มีข้อความ'
                : 'No messages yet'}
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
                ? 'เมื่อทางวัดส่งข้อความ ข่าวสาร หรือประกาศ จะปรากฏที่หน้านี้'
                : 'Messages and announcements from the monastery will appear here.'}
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
                    ? 'ข้อความล่าสุด'
                    : 'Latest message'}
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
                        onClick={() => {
                          const nextOpen =
                            open ? null : item.id;

                          setOpenId(nextOpen);

                          if (nextOpen) {
                            markRead(item.id);
                          }
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
                        <span style={{ minWidth: 0 }}>
                          {!readIds.includes(item.id) && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginBottom: '7px',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                background: '#9b7226',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800
                              }}
                            >
                              {th ? 'ใหม่' : 'NEW'}
                            </span>
                          )}

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
                                  ? 'ถึงสมาชิกทุกคน'
                                  : 'For all members')}
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
                              ? '— Nathoeng Connect'
                              : '— Nathoeng Connect'}
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
