import React, { useEffect, useMemo, useState } from 'react';

function AdminMembersPanel({ lang }) {
  const th = lang === 'th';
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const text = {
    title: th ? 'สมาชิก' : 'Members',
    help: th
      ? 'รายชื่อสมาชิกทั้งหมดของวัด โดย LINE และ Telegram ของบุคคลเดียวกันจะอยู่ภายใต้บัญชีสมาชิกเดียว'
      : 'All monastery members. LINE and Telegram identities for the same person are kept under one member account.',
    search: th ? 'ค้นหาชื่อ / Telegram / Member ID' : 'Search name / Telegram / Member ID',
    all: th ? 'ทั้งหมด' : 'All',
    line: 'LINE',
    telegram: 'Telegram',
    both: 'LINE + Telegram',
    noMembers: th ? 'ยังไม่มีสมาชิกในระบบ' : 'No members found.',
    noMatch: th ? 'ไม่พบสมาชิกที่ตรงกับการค้นหา' : 'No matching members.',
    retry: th ? 'ลองใหม่' : 'Retry',
    total: th ? 'สมาชิกทั้งหมด' : 'Total members',
    connectedBoth: th ? 'เชื่อมต่อทั้งสองช่องทาง' : 'Both connected',
    lineOnly: th ? 'LINE เท่านั้น' : 'LINE only',
    telegramOnly: th ? 'Telegram เท่านั้น' : 'Telegram only',
    connectedAccounts: th ? 'บัญชีที่เชื่อมต่อ' : 'Connected accounts',
    memberDetail: th ? 'ข้อมูลสมาชิก' : 'Member details',
    memberId: 'Member ID',
    role: th ? 'สิทธิ์' : 'Role',
    joined: th ? 'สมัครสมาชิกเมื่อ' : 'Joined',
    lastLogin: th ? 'เข้าใช้ล่าสุด' : 'Last login',
    close: th ? 'ปิด' : 'Close',
    admin: th ? 'ผู้ดูแลระบบ' : 'Admin',
    member: th ? 'สมาชิก' : 'Member',
    connected: th ? 'เชื่อมต่อแล้ว' : 'Connected',
    notConnected: th ? 'ยังไม่เชื่อมต่อ' : 'Not connected',
    phase2: th
      ? 'ประวัติการเข้าพัก การทำบุญ และการติดต่อ จะเชื่อมเข้าหน้านี้ในขั้นต่อไป'
      : 'Stay, donation and communication history will be connected here in the next phase.'
  };

  const loadMembers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin-bookings?route=members', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to load members');
      }

      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      console.error('Admin members load error:', err);
      setError(th ? 'ไม่สามารถโหลดรายชื่อสมาชิกได้' : 'Unable to load member list.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const memberName = (member) =>
    member?.full_name ||
    member?.display_name ||
    member?.name ||
    member?.line_display_name ||
    member?.telegram_username ||
    (th ? 'ไม่ระบุชื่อ' : 'Unnamed member');

  const pictureUrl = (member) =>
    member?.picture_url ||
    member?.profile_image_url ||
    member?.line_picture_url ||
    member?.avatar_url ||
    '';

  const hasLine = (member) => Boolean(member?.line_uid);
  const hasTelegram = (member) => Boolean(member?.telegram_uid);

  const providerLabel = (member) => {
    if (hasLine(member) && hasTelegram(member)) return text.both;
    if (hasLine(member)) return text.line;
    if (hasTelegram(member)) return text.telegram;
    return '—';
  };

  const formatDate = (raw) => {
    if (!raw) return '—';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);

    return new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    }).format(date);
  };

  const stats = useMemo(() => {
    let both = 0;
    let lineOnly = 0;
    let telegramOnly = 0;

    members.forEach((member) => {
      const line = hasLine(member);
      const telegram = hasTelegram(member);
      if (line && telegram) both += 1;
      else if (line) lineOnly += 1;
      else if (telegram) telegramOnly += 1;
    });

    return { both, lineOnly, telegramOnly };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return members.filter((member) => {
      const line = hasLine(member);
      const telegram = hasTelegram(member);

      if (providerFilter === 'both' && !(line && telegram)) return false;
      if (providerFilter === 'line' && !line) return false;
      if (providerFilter === 'telegram' && !telegram) return false;

      if (!q) return true;

      return [
        memberName(member),
        member?.telegram_username,
        member?.id
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [members, search, providerFilter]);

  if (loading) {
    return (
      <div style={{ padding: '30px 0', textAlign: 'center', color: '#756c60' }}>
        {th ? 'กำลังโหลดรายชื่อสมาชิก...' : 'Loading members...'}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <span className="eyebrow">NATHOENG CONNECT</span>
        <h1 style={{ marginBottom: '8px' }}>{text.title}</h1>
        <p style={{ margin: 0, color: '#756c60', lineHeight: 1.65 }}>{text.help}</p>
      </div>

      {error ? (
        <div style={{ border: '1px solid #efc7c2', background: '#fff7f6', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#9f2f25' }}>
          {error} <button type="button" onClick={loadMembers}>{text.retry}</button>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px', marginBottom: '18px' }}>
        {[
          [text.total, members.length],
          [text.connectedBoth, stats.both],
          [text.lineOnly, stats.lineOnly],
          [text.telegramOnly, stats.telegramOnly]
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#f7f3eb', border: '1px solid #e2d8c8', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: '#786f63' }}>{label}</div>
            <div style={{ marginTop: '4px', fontSize: '25px', fontWeight: 800, color: '#332f29' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={text.search}
          style={{ flex: '1 1 260px', minWidth: 0, padding: '11px 13px', border: '1px solid #d9d0c2', borderRadius: '10px', fontSize: '14px' }}
        />
        <select
          value={providerFilter}
          onChange={(event) => setProviderFilter(event.target.value)}
          style={{ padding: '11px 13px', border: '1px solid #d9d0c2', borderRadius: '10px', background: '#fff', fontSize: '14px' }}
        >
          <option value="all">{text.all}</option>
          <option value="both">{text.both}</option>
          <option value="line">{text.line}</option>
          <option value="telegram">{text.telegram}</option>
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div style={{ padding: '28px', textAlign: 'center', border: '1px dashed #d8cdbd', borderRadius: '14px', color: '#756c60' }}>
          {members.length ? text.noMatch : text.noMembers}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filteredMembers.map((member) => (
            <button
              type="button"
              key={member.id}
              onClick={() => setSelectedMember(member)}
              style={{ width: '100%', border: '1px solid #e2d8c8', borderRadius: '14px', background: '#fff', padding: '14px', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {pictureUrl(member) ? (
                  <img
                    src={pictureUrl(member)}
                    alt=""
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flex: '0 0 48px' }}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f2ede4', display: 'grid', placeItems: 'center', fontSize: '20px', flex: '0 0 48px' }}>👤</div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: 'block', color: '#332f29', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {memberName(member)}
                  </strong>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#756c60' }}>
                    {providerLabel(member)}
                    {member?.role === 'admin' ? ` · ${text.admin}` : ''}
                  </div>
                </div>
                <div style={{ color: '#9b7226', fontWeight: 800 }}>›</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMember ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedMember(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '18px' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(560px, 100%)', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}
          >
            <h2 style={{ marginTop: 0 }}>{memberName(selectedMember)}</h2>

            <h3>{text.connectedAccounts}</h3>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
              <div style={{ padding: '11px 12px', borderRadius: '10px', background: hasLine(selectedMember) ? '#f2fbf5' : '#f7f7f7' }}>
                <strong>LINE</strong> · {hasLine(selectedMember) ? text.connected : text.notConnected}
              </div>
              <div style={{ padding: '11px 12px', borderRadius: '10px', background: hasTelegram(selectedMember) ? '#f3f8fc' : '#f7f7f7' }}>
                <strong>Telegram</strong> · {hasTelegram(selectedMember) ? text.connected : text.notConnected}
                {selectedMember?.telegram_username ? ` · @${String(selectedMember.telegram_username).replace(/^@/, '')}` : ''}
              </div>
            </div>

            <h3>{text.memberDetail}</h3>
            <div style={{ display: 'grid', gap: '9px', fontSize: '14px' }}>
              <div><strong>{text.memberId}:</strong> {selectedMember.id}</div>
              <div><strong>{text.role}:</strong> {selectedMember?.role === 'admin' ? text.admin : text.member}</div>
              <div><strong>{text.joined}:</strong> {formatDate(selectedMember.created_at)}</div>
              <div><strong>{text.lastLogin}:</strong> {formatDate(selectedMember.last_login_at)}</div>
            </div>

            <div style={{ marginTop: '18px', padding: '12px', borderRadius: '10px', background: '#fbf8f2', color: '#756c60', fontSize: '13px', lineHeight: 1.55 }}>
              {text.phase2}
            </div>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              style={{ width: '100%', marginTop: '16px', border: 'none', borderRadius: '10px', padding: '11px 14px', background: '#736f66', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {text.close}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminMembersPanel;
