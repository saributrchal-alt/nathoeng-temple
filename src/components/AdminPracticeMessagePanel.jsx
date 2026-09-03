import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

function AdminPracticeMessagePanel({
  lang
}) {
  const th = lang === 'th';

  const emptyForm = {
    audience: 'all',
    targetMemberId: '',
    title: '',
    body: '',
    isPublished: true
  };

  const [messages, setMessages] =
    useState([]);

  const [members, setMembers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const memberName =
    (member) =>
      member?.full_name ||
      member?.display_name ||
      (th ? 'สมาชิก' : 'Member');

  const memberMap =
    useMemo(() => {
      return new Map(
        members.map((member) => [
          member.id,
          memberName(member)
        ])
      );
    }, [members, lang]);

  const loadAll = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        messagesResult,
        membersResult
      ] = await Promise.allSettled([
        fetch(
          '/api/practice-messages?scope=admin',
          {
            credentials: 'include',
            cache: 'no-store'
          }
        ),
        fetch(
          '/api/practice-messages?scope=members',
          {
            credentials: 'include',
            cache: 'no-store'
          }
        )
      ]);

      if (
        messagesResult.status !== 'fulfilled'
      ) {
        throw messagesResult.reason;
      }

      const messagesResponse =
        messagesResult.value;

      const messagesData =
        await messagesResponse.json();

      if (
        !messagesResponse.ok ||
        !messagesData.success
      ) {
        throw new Error(
          messagesData.message ||
          'Unable to load messages'
        );
      }

      setMessages(
        Array.isArray(messagesData.messages)
          ? messagesData.messages
          : []
      );

      if (
        membersResult.status === 'fulfilled'
      ) {
        const membersResponse =
          membersResult.value;

        const membersData =
          await membersResponse.json();

        if (
          membersResponse.ok &&
          membersData.success
        ) {
          setMembers(
            Array.isArray(membersData.members)
              ? membersData.members
              : []
          );
        } else {
          console.error(
            'Admin practice member load error:',
            membersData
          );

          setMembers([]);

          setError(
            th
              ? 'โหลดข้อความได้ แต่ยังโหลดรายชื่อสมาชิกไม่ได้ กรุณากด “โหลดใหม่”'
              : 'Messages loaded, but the member list could not be loaded. Please reload.'
          );
        }
      } else {
        console.error(
          'Admin practice member request error:',
          membersResult.reason
        );

        setMembers([]);

        setError(
          th
            ? 'โหลดข้อความได้ แต่ยังโหลดรายชื่อสมาชิกไม่ได้ กรุณากด “โหลดใหม่”'
            : 'Messages loaded, but the member list could not be loaded. Please reload.'
        );
      }
    } catch (err) {
      console.error(
        'Admin practice messages load error:',
        err
      );

      setError(
        th
          ? 'ไม่สามารถโหลดระบบเนื้อหาปฏิบัติได้'
          : 'Unable to load practice message management.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [lang]);

  const post = async (payload) => {
    const response = await fetch(
      '/api/practice-messages',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json'
        },
        body:
          JSON.stringify(payload)
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
        'Unable to save'
      );
    }

    return data;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const editMessage = (item) => {
    setEditingId(item.id);

    setForm({
      audience:
        item.audience === 'member'
          ? 'member'
          : 'all',
      targetMemberId:
        item.target_member_id || '',
      title:
        item.title || '',
      body:
        item.body || '',
      isPublished:
        item.is_published !== false
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const saveMessage = async () => {
    const title =
      form.title.trim();

    const body =
      form.body.trim();

    if (!title || !body) {
      setError(
        th
          ? 'กรุณากรอกหัวข้อและข้อความ'
          : 'Please enter a title and message.'
      );
      return;
    }

    if (
      form.audience === 'member' &&
      !form.targetMemberId
    ) {
      setError(
        th
          ? 'กรุณาเลือกผู้รับข้อความ'
          : 'Please select a recipient.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      await post({
        action:
          editingId
            ? 'update'
            : 'create',
        messageId:
          editingId || undefined,
        audience:
          form.audience,
        targetMemberId:
          form.audience ===
          'member'
            ? form.targetMemberId
            : null,
        title,
        body,
        isPublished:
          form.isPublished
      });

      resetForm();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePublish =
    async (item) => {
      setBusy(true);
      setError('');

      try {
        await post({
          action:
            'toggle_publish',
          messageId: item.id,
          isPublished:
            !item.is_published
        });

        await loadAll();
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    };

  const deleteMessage =
    async (item) => {
      if (
        !window.confirm(
          th
            ? 'ยืนยันลบข้อความนี้หรือไม่?'
            : 'Delete this message?'
        )
      ) {
        return;
      }

      setBusy(true);
      setError('');

      try {
        await post({
          action: 'delete',
          messageId: item.id
        });

        if (
          editingId === item.id
        ) {
          resetForm();
        }

        await loadAll();
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    };

  const formatDate =
    (value) => {
      if (!value) return '—';

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '—';
      }

      return new Intl.DateTimeFormat(
        th ? 'th-TH' : 'en-GB',
        {
          timeZone:
            'Asia/Bangkok',
          dateStyle:
            'medium',
          timeStyle:
            'short'
        }
      ).format(date);
    };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '46px',
    border:
      '1px solid #d8c9b5',
    borderRadius: '11px',
    background: '#fff',
    padding: '10px 12px',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#332f29'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 800,
    color: '#4b443b',
    fontSize: '13px'
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '40px 0',
          textAlign: 'center',
          color: '#81786d'
        }}
      >
        {th
          ? 'กำลังโหลดเนื้อหาปฏิบัติ...'
          : 'Loading practice messages...'}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: '20px'
        }}
      >
        <span className="eyebrow">
          {th
            ? 'ข้อความแบบทางเดียว'
            : 'ONE-WAY PRACTICE MESSAGES'}
        </span>

        <h1
          style={{
            marginBottom: '8px'
          }}
        >
          {th
            ? 'จัดการ “เนื้อหาปฏิบัติถึงฉัน”'
            : 'Manage Practice Messages'}
        </h1>

        <p
          style={{
            margin: 0,
            color: '#756c60',
            lineHeight: 1.6
          }}
        >
          {th
            ? 'พระอาจารย์ฝากข้อความ แนวทาง หรือข้อปฏิบัติให้ผู้ปฏิบัติอ่านได้อย่างเดียว เลือกส่งถึงทุกคนหรือเฉพาะสมาชิกได้'
            : 'Publish one-way practice guidance for all practitioners or a selected member.'}
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '14px',
            padding: '11px 13px',
            borderRadius: '11px',
            background: '#fff2ef',
            border:
              '1px solid #efd3cd',
            color: '#923d35'
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          border:
            '1px solid #e1d8ca',
          borderRadius: '18px',
          background: '#fff',
          padding: '18px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '19px'
            }}
          >
            {editingId
              ? (th
                  ? 'แก้ไขข้อความ'
                  : 'Edit message')
              : (th
                  ? 'ฝากเนื้อหาปฏิบัติใหม่'
                  : 'New practice message')}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                minHeight: '36px',
                border:
                  '1px solid #d8c9b5',
                borderRadius:
                  '9px',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              {th
                ? 'ยกเลิกแก้ไข'
                : 'Cancel edit'}
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gap: '14px'
          }}
        >
          <div>
            <label style={labelStyle}>
              {th
                ? 'ส่งถึง'
                : 'Audience'}
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '8px'
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    audience: 'all',
                    targetMemberId: ''
                  }))
                }
                style={{
                  minHeight: '44px',
                  border:
                    form.audience ===
                    'all'
                      ? '2px solid #9b7226'
                      : '1px solid #d8c9b5',
                  borderRadius:
                    '11px',
                  background:
                    form.audience ===
                    'all'
                      ? '#fff8e8'
                      : '#fff',
                  color: '#4b443b',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'ผู้ปฏิบัติทุกคน'
                  : 'All practitioners'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    audience:
                      'member'
                  }))
                }
                style={{
                  minHeight: '44px',
                  border:
                    form.audience ===
                    'member'
                      ? '2px solid #9b7226'
                      : '1px solid #d8c9b5',
                  borderRadius:
                    '11px',
                  background:
                    form.audience ===
                    'member'
                      ? '#fff8e8'
                      : '#fff',
                  color: '#4b443b',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'เลือกผู้รับรายบุคคล'
                  : 'Individual recipient'}
              </button>
            </div>
          </div>

          {form.audience ===
            'member' && (
            <div>
              <label style={labelStyle}>
                {th
                  ? 'เลือกผู้รับ'
                  : 'Recipient'}
              </label>

              <select
                value={
                  form.targetMemberId
                }
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    targetMemberId:
                      event.target.value
                  }))
                }
                style={inputStyle}
              >
                <option value="">
                  {members.length === 0
                    ? (th
                        ? 'ยังไม่มีรายชื่อสมาชิกให้เลือก'
                        : 'No members available')
                    : (th
                        ? 'กรุณาเลือกสมาชิก'
                        : 'Please select a member')}
                </option>

                {members.map(
                  (member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {memberName(
                        member
                      )}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>
              {th
                ? 'หัวข้อ'
                : 'Title'}
            </label>

            <input
              type="text"
              value={form.title}
              maxLength="200"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  title:
                    event.target.value
                }))
              }
              placeholder={
                th
                  ? 'เช่น ข้อปฏิบัติสำหรับคืนนี้'
                  : 'e.g. Practice guidance for tonight'
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              {th
                ? 'ข้อความ / แนวทางปฏิบัติ'
                : 'Message / Guidance'}
            </label>

            <textarea
              rows="8"
              value={form.body}
              maxLength="10000"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  body:
                    event.target.value
                }))
              }
              placeholder={
                th
                  ? 'พิมพ์ข้อความที่ต้องการฝากถึงผู้ปฏิบัติ...'
                  : 'Write the practice guidance...'
              }
              style={{
                ...inputStyle,
                minHeight: '190px',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />

            <div
              style={{
                marginTop: '4px',
                textAlign: 'right',
                color: '#81786d',
                fontSize: '11px'
              }}
            >
              {form.body.length}/10000
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              gap: '9px',
              alignItems: 'center',
              cursor: 'pointer',
              color: '#4b443b',
              fontWeight: 700
            }}
          >
            <input
              type="checkbox"
              checked={
                form.isPublished
              }
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isPublished:
                    event.target.checked
                }))
              }
            />

            {th
              ? 'เผยแพร่ให้ผู้ปฏิบัติเห็นทันที'
              : 'Publish immediately'}
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={saveMessage}
            style={{
              minHeight: '48px',
              border: 0,
              borderRadius: '12px',
              background: '#355b49',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
              opacity:
                busy ? .65 : 1
            }}
          >
            {busy
              ? (th
                  ? 'กำลังบันทึก...'
                  : 'Saving...')
              : editingId
                ? (th
                    ? 'บันทึกการแก้ไข'
                    : 'Save changes')
                : (th
                    ? 'ฝากข้อความถึงผู้ปฏิบัติ'
                    : 'Publish practice message')}
          </button>
        </div>
      </section>

      <section>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '19px'
            }}
          >
            {th
              ? 'ข้อความที่ฝากไว้'
              : 'Published & Draft Messages'}
          </h2>

          <button
            type="button"
            onClick={loadAll}
            style={{
              minHeight: '38px',
              padding: '0 12px',
              border:
                '1px solid #d8c9b5',
              borderRadius: '9px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            ↻ {th
              ? 'โหลดใหม่'
              : 'Refresh'}
          </button>
        </div>

        {messages.length === 0 ? (
          <div
            style={{
              padding: '28px',
              border:
                '1px solid #e1d8ca',
              borderRadius:
                '16px',
              textAlign: 'center',
              color: '#81786d'
            }}
          >
            {th
              ? 'ยังไม่มีข้อความ'
              : 'No messages yet.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '11px'
            }}
          >
            {messages.map(
              (item) => (
                <article
                  key={item.id}
                  style={{
                    padding:
                      '15px 16px',
                    border:
                      '1px solid #e1d8ca',
                    borderRadius:
                      '16px',
                    background: '#fff'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '12px',
                      alignItems:
                        'flex-start'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display:
                            'flex',
                          gap: '7px',
                          flexWrap:
                            'wrap',
                          marginBottom:
                            '6px'
                        }}
                      >
                        <span
                          style={{
                            padding:
                              '3px 8px',
                            borderRadius:
                              '999px',
                            background:
                              item.is_published
                                ? '#edf7f1'
                                : '#f1efeb',
                            color:
                              item.is_published
                                ? '#236b4a'
                                : '#756c60',
                            fontSize:
                              '11px',
                            fontWeight:
                              800
                          }}
                        >
                          {item.is_published
                            ? (th
                                ? 'เผยแพร่แล้ว'
                                : 'Published')
                            : (th
                                ? 'แบบร่าง'
                                : 'Draft')}
                        </span>

                        <span
                          style={{
                            padding:
                              '3px 8px',
                            borderRadius:
                              '999px',
                            background:
                              '#fff7e7',
                            color:
                              '#8a611d',
                            fontSize:
                              '11px',
                            fontWeight:
                              800
                          }}
                        >
                          {item.audience ===
                          'member'
                            ? (
                              memberMap.get(
                                item.target_member_id
                              ) ||
                              (th
                                ? 'เลือกผู้รับรายบุคคล'
                                : 'Individual recipient')
                            )
                            : (th
                                ? 'ผู้ปฏิบัติทุกคน'
                                : 'All practitioners')}
                        </span>
                      </div>

                      <strong
                        style={{
                          display:
                            'block',
                          fontSize:
                            '16px',
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
                            '4px',
                          color:
                            '#81786d'
                        }}
                      >
                        {formatDate(
                          item.created_at
                        )}
                      </small>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        '10px',
                      color: '#5d564d',
                      lineHeight: 1.65,
                      whiteSpace:
                        'pre-wrap',
                      display:
                        '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient:
                        'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.body}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginTop: '12px'
                    }}
                  >
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        editMessage(item)
                      }
                      style={{
                        minHeight:
                          '38px',
                        padding:
                          '0 12px',
                        border:
                          '1px solid #d8c9b5',
                        borderRadius:
                          '9px',
                        background:
                          '#fff',
                        cursor:
                          'pointer',
                        fontWeight:
                          700
                      }}
                    >
                      {th
                        ? 'แก้ไข'
                        : 'Edit'}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        togglePublish(item)
                      }
                      style={{
                        minHeight:
                          '38px',
                        padding:
                          '0 12px',
                        border:
                          '1px solid #d8c9b5',
                        borderRadius:
                          '9px',
                        background:
                          item.is_published
                            ? '#fff8e8'
                            : '#edf7f1',
                        cursor:
                          'pointer',
                        fontWeight:
                          700
                      }}
                    >
                      {item.is_published
                        ? (th
                            ? 'ซ่อนจากผู้ปฏิบัติ'
                            : 'Unpublish')
                        : (th
                            ? 'เผยแพร่'
                            : 'Publish')}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        deleteMessage(item)
                      }
                      style={{
                        minHeight:
                          '38px',
                        padding:
                          '0 12px',
                        border:
                          '1px solid #efd3cd',
                        borderRadius:
                          '9px',
                        background:
                          '#fff3f1',
                        color:
                          '#923d35',
                        cursor:
                          'pointer',
                        fontWeight:
                          700
                      }}
                    >
                      {th
                        ? 'ลบ'
                        : 'Delete'}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPracticeMessagePanel;
