import React, { useEffect, useMemo, useState } from 'react';

function AdminMembersPanel({ lang }) {
  const th = lang === 'th';
  const [members, setMembers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailTab, setDetailTab] = useState('stays');
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

    staysTab: th ? 'เข้าพักปฏิบัติธรรม' : 'Retreat stays',
    donationsTab: th ? 'การทำบุญ' : 'Donations',

    stayHistory: th ? 'ประวัติการเข้าพักปฏิบัติธรรม' : 'Retreat stay history',
    noStayHistory: th ? 'ยังไม่มีประวัติการเข้าพักปฏิบัติธรรม' : 'No retreat stay history yet.',
    stayPeriod: th ? 'ช่วงเข้าพัก' : 'Stay period',
    status: th ? 'สถานะ' : 'Status',
    phone: th ? 'โทรศัพท์' : 'Phone',
    purpose: th ? 'วัตถุประสงค์' : 'Purpose',
    accommodation: th ? 'ที่พัก' : 'Accommodation',
    bookingId: th ? 'รหัสการเข้าพัก' : 'Booking ID',

    donationHistory: th ? 'ประวัติการทำบุญ' : 'Donation history',
    noDonationHistory: th ? 'ยังไม่มีประวัติการทำบุญ' : 'No donation history yet.',
    moneyDonation: th ? 'เงิน' : 'Money',
    itemDonation: th ? 'สิ่งของ' : 'Item',
    amount: th ? 'จำนวนเงิน' : 'Amount',
    item: th ? 'รายการ' : 'Item',
    quantity: th ? 'จำนวน' : 'Quantity',
    donationPurpose: th ? 'ประเภทบุญ' : 'Purpose',
    donationDate: th ? 'วันที่ทำบุญ' : 'Donation date',
    receipt: th ? 'ใบอนุโมทนาบัตร' : 'Receipt',
    receiptRequested: th ? 'ขอใบอนุโมทนาบัตร' : 'Receipt requested',
    receiptNotRequested: th ? 'ไม่ขอใบอนุโมทนาบัตร' : 'Receipt not requested',
    verification: th ? 'การตรวจสอบ' : 'Verification',
    source: th ? 'บันทึกโดย' : 'Source',
    note: th ? 'หมายเหตุ' : 'Note',
    viewReceipt: th ? 'เปิดใบอนุโมทนาบัตร' : 'View receipt',
    general: th ? 'ทั่วไป' : 'General',
    utilities: th ? 'ค่าน้ำ-ค่าไฟ/สาธารณูปโภค' : 'Utilities',
    development: th ? 'พัฒนาวัด' : 'Temple development',
    custom: th ? 'ระบุเอง' : 'Custom',
    verified: th ? 'ตรวจสอบแล้ว' : 'Verified',
    pendingVerify: th ? 'รอตรวจสอบ' : 'Pending verification',
    rejectedVerify: th ? 'ไม่ผ่านการตรวจสอบ' : 'Verification rejected',
    nextPhase: th
      ? 'ประวัติการติดต่อ LINE / Telegram จะเชื่อมเข้าหน้านี้ในขั้นต่อไป'
      : 'LINE / Telegram communication history will be connected here in the next phase.'
  };

  const loadMembers = async () => {
    setLoading(true);
    setError('');

    try {
      const [memberResponse, donationResponse] = await Promise.all([
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
      const donationData = await donationResponse.json();

      if (!memberResponse.ok || !memberData?.success) {
        throw new Error(memberData?.message || 'Unable to load members');
      }

      if (!donationResponse.ok || !donationData?.success) {
        throw new Error(donationData?.message || 'Unable to load donations');
      }

      setMembers(Array.isArray(memberData.members) ? memberData.members : []);
      setDonations(Array.isArray(donationData.donations) ? donationData.donations : []);
    } catch (err) {
      console.error('Admin members load error:', err);
      setError(
        th
          ? 'ไม่สามารถโหลดข้อมูลสมาชิกหรือประวัติการทำบุญได้'
          : 'Unable to load members or donation history.'
      );
      setMembers([]);
      setDonations([]);
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

  const formatDateTime = (raw) => {
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

  const formatDateOnly = (raw) => {
    if (!raw) return '—';
    const rawText = String(raw);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(rawText)
      ? new Date(`${rawText}T12:00:00+07:00`)
      : new Date(rawText);
    if (Number.isNaN(date.getTime())) return rawText;

    return new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Bangkok'
    }).format(date);
  };

  const formatMoney = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return new Intl.NumberFormat(th ? 'th-TH' : 'en-GB', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2
    }).format(number);
  };

  const statusLabel = (status) => {
    const labels = {
      pending: th ? 'รอการอนุมัติ' : 'Pending approval',
      approved: th ? 'อนุมัติแล้ว' : 'Approved',
      checked_in: th ? 'ลงทะเบียนเข้าพักแล้ว' : 'Registered',
      accommodated: th ? 'เข้าที่พักแล้ว' : 'Accommodation assigned',
      in_retreat: th ? 'อยู่ระหว่างปฏิบัติธรรม' : 'In retreat',
      checked_out: th ? 'คืนอุปกรณ์ / ส่งคืนห้องแล้ว' : 'Checked out / returned items',
      completed: th ? 'การเข้าพักเสร็จสิ้น' : 'Completed',
      rejected: th ? 'ไม่อนุมัติ' : 'Rejected',
      cancelled: th ? 'ยกเลิกแล้ว' : 'Cancelled'
    };
    return labels[status] || status || '—';
  };

  const verificationLabel = (status) => {
    const labels = {
      verified: text.verified,
      approved: text.verified,
      pending: text.pendingVerify,
      rejected: text.rejectedVerify
    };
    return labels[status] || status || text.pendingVerify;
  };

  const donationPurposeLabel = (donation) => {
    if (donation?.purpose === 'custom') {
      return donation?.custom_purpose || text.custom;
    }
    const labels = {
      general: text.general,
      utilities: text.utilities,
      development: text.development,
      custom: text.custom
    };
    return labels[donation?.purpose] || donation?.purpose || '—';
  };

  const accommodationName = (booking) =>
    booking?.accommodation_name ||
    booking?.accommodationName ||
    booking?.assigned_accommodation ||
    booking?.room_name ||
    booking?.room ||
    '';

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

  const selectedDonations = useMemo(() => {
    if (!selectedMember?.id) return [];
    return donations.filter(
      (item) => String(item?.owner_member_id || '') === String(selectedMember.id)
    );
  }, [donations, selectedMember]);

  if (loading) {
    return (
      <div style={{ padding: '30px 0', textAlign: 'center', color: '#756c60' }}>
        {th ? 'กำลังโหลดข้อมูลสมาชิก...' : 'Loading member data...'}
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
          {filteredMembers.map((member) => {
            const donationCount = donations.filter(
              (item) => String(item?.owner_member_id || '') === String(member.id)
            ).length;

            return (
              <button
                type="button"
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  setDetailTab('stays');
                }}
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
                      {Array.isArray(member?.stay_history) && member.stay_history.length
                        ? ` · ${text.staysTab} ${member.stay_history.length}`
                        : ''}
                      {donationCount ? ` · ${text.donationsTab} ${donationCount}` : ''}
                    </div>
                  </div>
                  <div style={{ color: '#9b7226', fontWeight: 800 }}>›</div>
                </div>
              </button>
            );
          })}
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
            style={{ width: 'min(660px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}
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
            <div style={{ display: 'grid', gap: '9px', fontSize: '14px', marginBottom: '20px' }}>
              <div><strong>{text.memberId}:</strong> {selectedMember.id}</div>
              <div><strong>{text.role}:</strong> {selectedMember?.role === 'admin' ? text.admin : text.member}</div>
              <div><strong>{text.joined}:</strong> {formatDateTime(selectedMember.created_at)}</div>
              <div><strong>{text.lastLogin}:</strong> {formatDateTime(selectedMember.last_login_at)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setDetailTab('stays')}
                style={{
                  border: '1px solid #d9d0c2',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: detailTab === 'stays' ? '#6f5d3f' : '#fff',
                  color: detailTab === 'stays' ? '#fff' : '#4b443c'
                }}
              >
                {text.staysTab} ({Array.isArray(selectedMember?.stay_history) ? selectedMember.stay_history.length : 0})
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('donations')}
                style={{
                  border: '1px solid #d9d0c2',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: detailTab === 'donations' ? '#6f5d3f' : '#fff',
                  color: detailTab === 'donations' ? '#fff' : '#4b443c'
                }}
              >
                {text.donationsTab} ({selectedDonations.length})
              </button>
            </div>

            {detailTab === 'stays' ? (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.stayHistory}</h3>

                {!Array.isArray(selectedMember?.stay_history) || selectedMember.stay_history.length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f8f6f1', color: '#756c60', marginBottom: '18px' }}>
                    {text.noStayHistory}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
                    {selectedMember.stay_history.map((booking, index) => (
                      <div
                        key={booking?.id || index}
                        style={{ border: '1px solid #e2d8c8', borderRadius: '13px', padding: '13px 14px', background: '#fffdf9' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <strong style={{ color: '#332f29' }}>
                            {formatDateOnly(booking?.start_date)} – {formatDateOnly(booking?.end_date)}
                          </strong>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: '#f2ede4', color: '#665c4e' }}>
                            {statusLabel(booking?.status)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gap: '5px', fontSize: '13px', color: '#5f584f', lineHeight: 1.5 }}>
                          {booking?.phone ? <div><strong>{text.phone}:</strong> {booking.phone}</div> : null}
                          {booking?.purpose ? <div><strong>{text.purpose}:</strong> {booking.purpose}</div> : null}
                          {accommodationName(booking) ? <div><strong>{text.accommodation}:</strong> {accommodationName(booking)}</div> : null}
                          {booking?.id ? <div style={{ color: '#8a8176' }}><strong>{text.bookingId}:</strong> {booking.id}</div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.donationHistory}</h3>

                {selectedDonations.length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '12px', background: '#f8f6f1', color: '#756c60', marginBottom: '18px' }}>
                    {text.noDonationHistory}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
                    {selectedDonations.map((donation, index) => (
                      <div
                        key={donation?.id || index}
                        style={{ border: '1px solid #e2d8c8', borderRadius: '13px', padding: '13px 14px', background: '#fffdf9' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ color: '#332f29', display: 'block' }}>
                              {donation?.donation_type === 'item' ? text.itemDonation : text.moneyDonation}
                              {donation?.donation_type === 'money' && Number.isFinite(Number(donation?.amount))
                                ? ` · ${formatMoney(donation.amount)}`
                                : ''}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#82786c' }}>
                              {formatDateOnly(donation?.donation_date || donation?.created_at)}
                            </span>
                          </div>

                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: '#f2ede4', color: '#665c4e' }}>
                            {verificationLabel(donation?.verification_status)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gap: '5px', fontSize: '13px', color: '#5f584f', lineHeight: 1.5 }}>
                          {donation?.donation_type === 'item' ? (
                            <>
                              <div><strong>{text.item}:</strong> {donation?.item_name || '—'}</div>
                              <div><strong>{text.quantity}:</strong> {donation?.quantity ?? '—'} {donation?.unit || ''}</div>
                            </>
                          ) : (
                            <div><strong>{text.amount}:</strong> {formatMoney(donation?.amount)}</div>
                          )}

                          <div><strong>{text.donationPurpose}:</strong> {donationPurposeLabel(donation)}</div>
                          <div><strong>{text.receipt}:</strong> {donation?.receipt_requested ? text.receiptRequested : text.receiptNotRequested}</div>
                          {donation?.source ? <div><strong>{text.source}:</strong> {donation.source}</div> : null}
                          {donation?.note ? <div><strong>{text.note}:</strong> {donation.note}</div> : null}

                          {donation?.receipt_url ? (
                            <div style={{ marginTop: '4px' }}>
                              <a
                                href={donation.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#8b671f', fontWeight: 700 }}
                              >
                                {text.viewReceipt}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ padding: '12px', borderRadius: '10px', background: '#fbf8f2', color: '#756c60', fontSize: '13px', lineHeight: 1.55 }}>
              {text.nextPhase}
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
