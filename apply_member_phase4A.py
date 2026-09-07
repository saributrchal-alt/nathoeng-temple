from pathlib import Path

p = Path("src/components/AdminMembersPanel.jsx")
s = p.read_text(encoding="utf-8")

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f"PATCH FAILED: {label}")
    s = s.replace(old, new, 1)
    print("✓", label)

rep(
"""  const [donations, setDonations] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);""",
"""  const [donations, setDonations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [composeChannel, setComposeChannel] = useState(null);
  const [composeText, setComposeText] = useState('');""",
"communication state"
)

rep(
"""    donationsTab: th ? 'การทำบุญ' : 'Donations',

    stayHistory:""",
"""    donationsTab: th ? 'การทำบุญ' : 'Donations',
    communicationTab: th ? 'การสื่อสาร' : 'Communication',
    communicationHistory: th ? 'ประวัติการสื่อสาร' : 'Communication history',
    noCommunicationHistory: th ? 'ยังไม่มีประวัติข้อความถึงสมาชิกคนนี้' : 'No messages for this member yet.',
    published: th ? 'เผยแพร่แล้ว' : 'Published',
    draft: th ? 'ฉบับร่าง' : 'Draft',
    allAudience: th ? 'ข้อความถึงผู้ปฏิบัติทุกคน' : 'Message to all practitioners',
    directAudience: th ? 'ข้อความเฉพาะสมาชิก' : 'Direct member message',
    sendLine: th ? 'เตรียมส่งผ่าน LINE' : 'Compose for LINE',
    sendTelegram: th ? 'เตรียมส่งผ่าน Telegram' : 'Compose for Telegram',
    composeTitle: th ? 'ตรวจและแก้ไขข้อความก่อนส่ง' : 'Review and edit before sending',
    composeHelp: th ? 'Phase 4A ยังไม่ส่งข้อความจริง ปุ่มนี้ใช้เตรียมข้อความก่อนเชื่อมระบบส่งในขั้นถัดไป' : 'Phase 4A does not send yet. This prepares the message before delivery is connected in the next step.',
    messagePlaceholder: th ? 'พิมพ์ข้อความที่ต้องการส่ง...' : 'Type the message...',
    notConnectedChannel: th ? 'สมาชิกยังไม่ได้เชื่อมต่อช่องทางนี้' : 'This member has not connected this channel.',
    closeComposer: th ? 'ปิดหน้าร่าง' : 'Close composer',

    stayHistory:""",
"communication labels"
)

rep(
"""      const [memberResponse, donationResponse] = await Promise.all([
        fetch('/api/admin-bookings?route=members', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch('/api/donation?scope=admin', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })
      ]);

      const memberData = await memberResponse.json();
      const donationData = await donationResponse.json();""",
"""      const [memberResponse, donationResponse, messageResponse] = await Promise.all([
        fetch('/api/admin-bookings?route=members', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch('/api/donation?scope=admin', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch('/api/practice-messages?scope=admin', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })
      ]);

      const memberData = await memberResponse.json();
      const donationData = await donationResponse.json();
      const messageData = await messageResponse.json();""",
"load communication history"
)

rep(
"""      if (!donationResponse.ok || !donationData?.success) {
        throw new Error(donationData?.message || 'Unable to load donations');
      }

      setMembers(Array.isArray(memberData.members) ? memberData.members : []);
      setDonations(Array.isArray(donationData.donations) ? donationData.donations : []);""",
"""      if (!donationResponse.ok || !donationData?.success) {
        throw new Error(donationData?.message || 'Unable to load donations');
      }

      if (!messageResponse.ok || !messageData?.success) {
        throw new Error(messageData?.message || 'Unable to load communication history');
      }

      setMembers(Array.isArray(memberData.members) ? memberData.members : []);
      setDonations(Array.isArray(donationData.donations) ? donationData.donations : []);
      setMessages(Array.isArray(messageData.messages) ? messageData.messages : []);""",
"store communication history"
)

rep(
"""  const selectedDonations = useMemo(() => {
    if (!selectedMember?.id) return [];
    return donations.filter(
      (item) => String(item?.owner_member_id || '') === String(selectedMember.id)
    );
  }, [donations, selectedMember]);

  if (loading) {""",
"""  const selectedDonations = useMemo(() => {
    if (!selectedMember?.id) return [];
    return donations.filter(
      (item) => String(item?.owner_member_id || '') === String(selectedMember.id)
    );
  }, [donations, selectedMember]);

  const selectedMessages = useMemo(() => {
    if (!selectedMember?.id) return [];
    return messages.filter(
      (item) =>
        item?.audience === 'all' ||
        (
          item?.audience === 'member' &&
          String(item?.target_member_id || '') === String(selectedMember.id)
        )
    );
  }, [messages, selectedMember]);

  const openComposer = (channel) => {
    setComposeChannel(channel);
    setComposeText('');
  };

  if (loading) {""",
"selected communication history"
)

rep(
"""            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>""",
"""            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>""",
"three detail tabs"
)

needle = """              <button
                type="button"
                onClick={() => setDetailTab('donations')}"""
idx = s.find(needle)
if idx < 0:
    raise SystemExit("PATCH FAILED: donations tab")
# locate end of second button after donations
end_marker = """              </button>
            </div>

            {detailTab === 'stays' ? ("""
start = idx
end = s.find(end_marker, start)
if end < 0:
    raise SystemExit("PATCH FAILED: tab end")
end += len("""              </button>""")
insert = """

              <button
                type="button"
                onClick={() => setDetailTab('communication')}
                style={{
                  border: '1px solid #d9d0c2',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: detailTab === 'communication' ? '#6f5d3f' : '#fff',
                  color: detailTab === 'communication' ? '#fff' : '#4b443c'
                }}
              >
                {text.communicationTab} ({selectedMessages.length})
              </button>"""
s = s[:end] + insert + s[end:]
print("✓ communication tab")

# Change binary stays/donations rendering to stays / donations / communication.
rep(
"""            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.donationHistory}</h3>""",
"""            ) : detailTab === 'donations' ? (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.donationHistory}</h3>""",
"three-way tab content"
)

# Insert communication content before nextPhase box.
marker = """            <div style={{ padding: '12px', borderRadius: '10px', background: '#fbf8f2', color: '#756c60', fontSize: '13px', lineHeight: 1.55 }}>
              {text.nextPhase}
            </div>"""
comm = """            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.communicationHistory}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    disabled={!hasLine(selectedMember)}
                    onClick={() => openComposer('LINE')}
                    style={{ border: 'none', borderRadius: '10px', padding: '11px 12px', fontWeight: 800, cursor: hasLine(selectedMember) ? 'pointer' : 'not-allowed', background: hasLine(selectedMember) ? '#eaf8ee' : '#f2f2f2', color: hasLine(selectedMember) ? '#28723d' : '#999' }}
                  >
                    {text.sendLine}
                  </button>
                  <button
                    type="button"
                    disabled={!hasTelegram(selectedMember)}
                    onClick={() => openComposer('Telegram')}
                    style={{ border: 'none', borderRadius: '10px', padding: '11px 12px', fontWeight: 800, cursor: hasTelegram(selectedMember) ? 'pointer' : 'not-allowed', background: hasTelegram(selectedMember) ? '#edf7fd' : '#f2f2f2', color: hasTelegram(selectedMember) ? '#2673a5' : '#999' }}
                  >
                    {text.sendTelegram}
                  </button>
                </div>

                {selectedMessages.length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f8f6f1', color: '#756c60', marginBottom: '18px' }}>
                    {text.noCommunicationHistory}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
                    {selectedMessages.map((message, index) => (
                      <div key={message?.id || index} style={{ border: '1px solid #e2d8c8', borderRadius: '13px', padding: '13px 14px', background: '#fffdf9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '7px' }}>
                          <strong>{message?.title || '—'}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: message?.is_published !== false ? '#eef7ef' : '#f2ede4' }}>
                            {message?.is_published !== false ? text.published : text.draft}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#81786d', marginBottom: '8px' }}>
                          {message?.audience === 'all' ? text.allAudience : text.directAudience} · {formatDateTime(message?.created_at)}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#514b43', fontSize: '14px' }}>
                          {message?.body || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {composeChannel ? (
                  <div style={{ border: '1px solid #d8c9b5', borderRadius: '14px', padding: '14px', background: '#fbf8f2', marginBottom: '18px' }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>
                      {text.composeTitle} · {composeChannel}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#756c60', lineHeight: 1.5, marginBottom: '10px' }}>
                      {text.composeHelp}
                    </div>
                    <textarea
                      value={composeText}
                      onChange={(event) => setComposeText(event.target.value)}
                      placeholder={text.messagePlaceholder}
                      rows={6}
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid #d8c9b5', borderRadius: '10px', padding: '11px', fontFamily: 'inherit', fontSize: '14px' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setComposeChannel(null); setComposeText(''); }}
                      style={{ marginTop: '9px', border: '1px solid #d8c9b5', borderRadius: '9px', background: '#fff', padding: '9px 12px', cursor: 'pointer' }}
                    >
                      {text.closeComposer}
                    </button>
                  </div>
                ) : null}
              </>
            )}

            <div style={{ padding: '12px', borderRadius: '10px', background: '#fbf8f2', color: '#756c60', fontSize: '13px', lineHeight: 1.55 }}>
              {th
                ? 'Phase 4A: แสดงประวัติข้อความและเตรียมข้อความ LINE / Telegram โดยยังไม่ส่งจริง'
                : 'Phase 4A: communication history and LINE / Telegram message preparation; delivery is not enabled yet.'}
            </div>"""

# The existing donation branch closes with `</> )}` just before marker. Replace only marker but add needed closing transition:
if marker not in s:
    raise SystemExit("PATCH FAILED: communication insertion marker")
# At this point binary expression ends just before marker. Need turn its existing final `)}` into `) : (` transition.
prefix = s[:s.index(marker)]
tail = s[s.index(marker)+len(marker):]
last = prefix.rfind("""              </>
            )}""")
if last < 0:
    raise SystemExit("PATCH FAILED: donation branch close")
prefix = prefix[:last] + comm
s = prefix + tail
print("✓ communication content")

p.write_text(s, encoding="utf-8")
print("\nPhase 4A patch complete:", p)
