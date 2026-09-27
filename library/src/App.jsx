import React, { useEffect, useMemo, useRef, useState } from 'react';

const TEMPLE_LOGIN = 'https://watt.nathoeng.com/?library-login=1#login-page';
const LABEL = {
  requested: 'รอเจ้าหน้าที่ตรวจสอบ', approved: 'อนุมัติแล้ว', ready_pickup: 'พร้อมรับที่วัด',
  in_transit: 'จัดส่งแล้ว', reading: 'ระหว่างอ่าน', return_in_person: 'แจ้งคืนด้วยตนเอง',
  return_in_transit: 'อยู่ระหว่างส่งคืน', returned: 'บรรณารักษ์รับคืนแล้ว',
  rejected: 'ไม่อนุมัติ', cancelled: 'ยกเลิก'
};
const emptyBook = { id: '', isbn: '', title: '', author: '', publisher: '', publishedYear: '',
  description: '', subject: '', coverUrl: '' };
const todayPlus = (days) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function detailsFromRow(b) {
  return { id: b.id, isbn: b.isbn || '', title: b.title || '', author: b.author || '',
    publisher: b.publisher || '', publishedYear: b.published_year || '',
    description: b.description || '', subject: b.subject || '', coverUrl: b.cover_url || '' };
}
async function api(route, body) {
  const response = await fetch(`/api/library${route ? `?route=${route}` : ''}`, {
    method: body ? 'POST' : 'GET', credentials: 'include', cache: 'no-store',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) throw Error(data?.message || 'ไม่สามารถเชื่อมต่อห้องสมุดได้');
  return data;
}
function Cover({ book, small = false }) {
  return <div className={`cover ${small ? 'small' : ''}`}>
    {book?.cover_url || book?.coverUrl ? <img src={book.cover_url || book.coverUrl} alt="" referrerPolicy="no-referrer"
      onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <span aria-hidden="true">☸</span>}
  </div>;
}
function LoanCard({ loan, staff, onAdvance, busy, tracking, onTracking, dueDate, onDueDate, onPrint }) {
  const items = loan.library_loan_items || [];
  const staffAction = (transition, extras = {}) => onAdvance(loan.id, transition, extras);
  const memberAction = (transition, extras = {}) => onAdvance(loan.id, transition, extras);
  return <article className="loanCard">
    <div className="loanTop"><div>
      <span className="eyebrow">คำขอ #{loan.id.slice(0, 8)}</span>
      <h3>{staff ? loan.member_name : 'รายการยืมของฉัน'}</h3>
      <p>{loan.delivery_method === 'courier' ? 'จัดส่งทางขนส่ง · ผู้ยืมจ่ายค่าส่งปลายทาง' : 'รับหนังสือที่วัด'} · {new Date(loan.created_at).toLocaleDateString('th-TH')}</p>
    </div><span className={`status ${loan.status}`}>{LABEL[loan.status] || loan.status}</span></div>
    <ul className="loanBooks">{items.map(item => <li key={item.id}>
      <strong>{item.library_books?.title || 'หนังสือ'}</strong>
      {item.library_copies?.copy_code && <small>เล่ม {item.library_copies.copy_code}</small>}
    </li>)}</ul>
    {loan.due_date && <p className="due">กำหนดคืน <strong>{new Date(`${loan.due_date}T12:00:00`).toLocaleDateString('th-TH')}</strong></p>}
    {loan.outbound_tracking && <p className="muted">เลขพัสดุขาไป: {loan.outbound_tracking}</p>}
    {loan.return_tracking && <p className="muted">เลขพัสดุส่งคืน: {loan.return_tracking}</p>}
    {staff && loan.delivery_method === 'courier' && !['requested','rejected','cancelled'].includes(loan.status) &&
      <button type="button" className="quiet" onClick={() => onPrint(loan)}>พิมพ์ฉลากหน้ากล่อง</button>}
    <div className="loanActions">
      {staff ? <>
        {loan.status === 'requested' && <><label>กำหนดวันคืน
          <input type="date" min={todayPlus(0)} value={dueDate[loan.id] || todayPlus(14)}
            onChange={e => onDueDate(loan.id, e.target.value)} /></label>
          <button type="button" disabled={busy} onClick={() => staffAction('approve', { dueDate: dueDate[loan.id] || todayPlus(14) })}>ตรวจสอบและอนุมัติ</button>
          <button type="button" className="quiet" disabled={busy} onClick={() => staffAction('reject')}>ไม่อนุมัติ</button></>}
        {loan.status === 'approved' && loan.delivery_method === 'pickup' && <button type="button" disabled={busy}
          onClick={() => staffAction('ready_pickup')}>จัดหนังสือพร้อมรับแล้ว</button>}
        {loan.status === 'approved' && loan.delivery_method === 'courier' && <>
          <label>เลขพัสดุขาไป<input value={tracking[loan.id] || ''} onChange={e => onTracking(loan.id, e.target.value)} placeholder="กรอกหลังส่งพัสดุ" /></label>
          <button type="button" disabled={busy || (tracking[loan.id] || '').trim().length < 4}
            onClick={() => staffAction('ship', { tracking: tracking[loan.id] })}>บันทึกจัดส่ง</button></>}
        {loan.status === 'ready_pickup' && <button type="button" disabled={busy} onClick={() => staffAction('confirm_handover')}>ยืนยันส่งมอบหนังสือ</button>}
        {['return_in_person','return_in_transit'].includes(loan.status) && <button type="button" disabled={busy}
          onClick={() => staffAction('receive_return')}>บรรณารักษ์รับหนังสือแล้ว · ปิดงาน</button>}
      </> : <>
        {loan.status === 'requested' && <button type="button" className="quiet" disabled={busy} onClick={() => memberAction('cancel')}>ยกเลิกคำขอ</button>}
        {['ready_pickup','in_transit'].includes(loan.status) && <button type="button" disabled={busy}
          onClick={() => memberAction('confirm_reading')}>ได้รับหนังสือแล้ว · เริ่มอ่าน</button>}
        {loan.status === 'reading' && <>
          <button type="button" disabled={busy} onClick={() => memberAction('return_in_person')}>แจ้งนำมาคืนด้วยตนเอง</button>
          <label>เลขพัสดุส่งคืน<input value={tracking[loan.id] || ''} onChange={e => onTracking(loan.id, e.target.value)} placeholder="กรอกเลขพัสดุหลังส่งคืน" /></label>
          <button type="button" className="quiet" disabled={busy || (tracking[loan.id] || '').trim().length < 4}
            onClick={() => memberAction('return_by_courier', { tracking: tracking[loan.id] })}>แจ้งส่งคืนทางขนส่ง</button></>}
      </>}
    </div>
  </article>;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') || '');
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('library_cart') || '[]'); } catch { return []; }
  });
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [delivery, setDelivery] = useState('pickup');
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', postal: '' });
  const [accepted, setAccepted] = useState(false);
  const [loans, setLoans] = useState([]);
  const [staffLoans, setStaffLoans] = useState([]);
  const [staffFilter, setStaffFilter] = useState('active');
  const [staffTab, setStaffTab] = useState('loans');
  const [tracking, setTracking] = useState({});
  const [dueDate, setDueDate] = useState({});
  const [isbn, setIsbn] = useState('');
  const [bookForm, setBookForm] = useState(emptyBook);
  const [shelf, setShelf] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardMember, setCardMember] = useState(undefined);
  const [deskBorrower, setDeskBorrower] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const searchRef = useRef(null);
  const isbnPending = useRef('');

  function go(next) {
    history.pushState({}, '', next); setPath(window.location.pathname);
    setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  useEffect(() => {
    const pop = () => { setPath(window.location.pathname); setQuery(new URLSearchParams(window.location.search).get('q') || ''); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => { sessionStorage.setItem('library_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    let active = true;
    (async () => {
      const url = new URL(window.location.href);
      const ticket = url.searchParams.get('ticket');
      if (ticket) {
        url.searchParams.delete('ticket');
        history.replaceState({}, '', url.pathname + url.search + url.hash);
        try { await api('', { action: 'redeem', ticket }); }
        catch (error) { if (active) setMessage(error.message); }
      }
      try {
        const data = await api('session');
        if (active) { setUser(data.user); setShipping(s => ({ ...s, name: s.name || data.user.name })); }
      } catch { if (active) setUser(null); }
      if (active) setSessionLoading(false);
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (path !== '/') return;
    let active = true;
    api(`books&q=${encodeURIComponent(query.trim())}`).then(data => { if (active) setBooks(data.books || []); })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [path, query]);
  useEffect(() => {
    const id = path.match(/^\/book\/([0-9a-f-]+)$/i)?.[1];
    if (!id) return;
    let active = true; setBook(null);
    api(`book&id=${encodeURIComponent(id)}`).then(data => { if (active) setBook(data.book); })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [path]);
  useEffect(() => {
    if (!user || path !== '/my-loans') return;
    let active = true;
    api('my_loans').then(data => { if (active) setLoans(data.loans || []); })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [path, user]);
  useEffect(() => {
    if (!user?.isStaff || path !== '/staff' || staffTab !== 'loans') return;
    let active = true;
    const refresh = () => api('staff_loans').then(data => { if (active) setStaffLoans(data.loans || []); })
      .catch(error => { if (active) setMessage(error.message); });
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [path, user, staffTab]);
  useEffect(() => {
    if (!user?.isAdmin || path !== '/staff' || staffTab !== 'card') return;
    api('staff_members').then(data => setStaffMembers(data.staff || [])).catch(error => setMessage(error.message));
  }, [path, user?.isAdmin, staffTab]);
  const cartBooks = useMemo(() => cart.map(id => books.find(b => b.id === id) || (book?.id === id ? book : null)), [cart, books, book]);
  const activeStaffLoans = staffLoans.filter(loan => staffFilter === 'all' ||
    (staffFilter === 'active' ? !['returned','rejected','cancelled'].includes(loan.status) : loan.status === staffFilter));
  function addToCart(item) {
    if (!item || item.available_copies < 1) return;
    if (cart.includes(item.id)) { setMessage('หนังสือเล่มนี้อยู่ในรายการยืมแล้ว'); return; }
    if (cart.length >= 5) { setMessage('คำขอหนึ่งครั้งเลือกได้ไม่เกิน 5 รายการ'); return; }
    setCart(c => [...c, item.id]); setMessage('เพิ่มหนังสือลงรายการยืมแล้ว');
  }
  async function submitBorrow(event) {
    event.preventDefault(); if (!user) { window.location.assign(TEMPLE_LOGIN); return; }
    setBusy(true); setMessage('');
    try {
      await api('', { action: deskBorrower ? 'borrow_at_desk' : 'borrow',
        ...(deskBorrower ? { memberNumber: deskBorrower.cardNumber } : {}),
        bookIds: cart, delivery, ...shipping, accepted });
      setCart([]); setBorrowOpen(false); setAccepted(false);
      if (deskBorrower) {
        setDeskBorrower(null); go('/staff');
        const data = await api('staff_loans'); setStaffLoans(data.loans || []);
        setMessage('ส่งคำขอยืมของสมาชิกแล้ว กรุณาตรวจสอบและอนุมัติรายการ');
      } else {
        go('/my-loans');
        const data = await api('my_loans'); setLoans(data.loans || []);
        setMessage('ส่งคำขอยืมแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ');
      }
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function advance(loanId, transition, extra = {}) {
    setBusy(true); setMessage('');
    try {
      await api('', { action: 'advance', loanId, transition, ...extra });
      const data = await api(user.isStaff && path === '/staff' ? 'staff_loans' : 'my_loans');
      if (user.isStaff && path === '/staff') setStaffLoans(data.loans || []); else setLoans(data.loans || []);
      setMessage('อัปเดตสถานะเรียบร้อยแล้ว');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function isbnLookup(number) {
    if (!/^(978|979)\d{10}$/.test(number)) { setMessage('กรุณาสแกน ISBN 13 หลักใต้บาร์โค้ดหนังสือ'); return; }
    if (isbnPending.current === number) return;
    isbnPending.current = number;
    setBusy(true); setMessage('');
    try {
      const data = await api('', { action: 'lookup_isbn', isbn: number });
      if (data.existing) {
        setBookForm(detailsFromRow(data.existing)); setMessage('หนังสือนี้มีในระบบแล้ว เพิ่มจำนวนเล่มได้');
      } else if (data.metadata) {
        setBookForm({ ...emptyBook, isbn: number, ...data.metadata });
        setMessage(`พบข้อมูลจาก ${data.metadata.source} กรุณาตรวจทานก่อนบันทึก`);
      } else {
        setBookForm({ ...emptyBook, isbn: number });
        setMessage('ไม่พบข้อมูลอัตโนมัติ กรุณาเติมชื่อหนังสือก่อนบันทึก');
      }
    } catch (error) { setMessage(error.message); }
    finally { isbnPending.current = ''; setBusy(false); }
  }
  async function saveBook(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const saved = await api('', { action: 'save_book', ...bookForm });
      const copy = await api('', { action: 'add_copy', bookId: saved.book.id, shelf });
      setMessage(`รับเข้าหนังสือแล้ว · รหัสเล่ม ${copy.copyCode}`);
      setBookForm(emptyBook); setIsbn(''); setShelf('');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function addCopyToBook() {
    setBusy(true); setMessage('');
    try {
      const data = await api('', { action: 'add_copy', bookId: book.id, shelf });
      setMessage(`เพิ่มเล่ม ${data.copyCode} เรียบร้อยแล้ว`);
      const detail = await api(`book&id=${book.id}`); setBook(detail.book); setShelf('');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function findCard(number) {
    if (!/^2\d{12}$/.test(number)) return;
    setBusy(true); setCardMember(undefined);
    try { const data = await api('', { action: 'find_member_card', memberNumber: number }); setCardMember(data.member || null); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function setStaffPermission(memberId, grant) {
    setBusy(true); setMessage('');
    try {
      await api('', { action: grant ? 'grant_staff' : 'remove_staff', memberId });
      const data = await api('staff_members'); setStaffMembers(data.staff || []);
      setMessage(grant ? 'มอบสิทธิ์เจ้าหน้าที่ห้องสมุดแล้ว' : 'ถอนสิทธิ์เจ้าหน้าที่ห้องสมุดแล้ว');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  function printLabel(loan) {
    const source = document.getElementById(`label-${loan.id}`);
    if (!source) return;
    const popup = window.open('', '_blank', 'width=720,height=650');
    if (!popup) { setMessage('กรุณาอนุญาตหน้าต่างใหม่เพื่อพิมพ์ฉลาก'); return; }
    popup.opener = null;
    const printable = source.cloneNode(true);
    printable.removeAttribute('hidden');
    popup.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>ฉลากพัสดุห้องสมุด</title><style>@page{size:A6;margin:8mm}body{font:16px/1.5 Arial,sans-serif;margin:0;color:#222}.label{border:2px solid #222;padding:15px}h2{margin:0 0 10px;font-size:19px}.row{margin:6px 0}small{display:block;margin-top:12px;border-top:1px solid #aaa;padding-top:10px}</style></head><body>${printable.outerHTML}</body></html>`);
    popup.document.close(); popup.onload = () => { popup.focus(); popup.print(); };
  }
  async function logout() {
    await api('', { action: 'logout' }).catch(() => {});
    setUser(null); setCart([]); setDeskBorrower(null); go('/');
  }

  return <div className="app">
    <header className="siteHeader"><a href="/" onClick={e => { e.preventDefault(); go('/'); }} className="brand"><span>☸</span> ห้องสมุดวัดนาเทิง</a>
      <nav><button onClick={() => go('/')}>ค้นหาหนังสือ</button>
        {user && <button onClick={() => go('/my-loans')}>รายการยืม</button>}
        {user?.isStaff && <button onClick={() => go('/staff')}>โต๊ะบรรณารักษ์</button>}
        {user ? <button className="account" onClick={logout}>ออกจากห้องสมุด</button> :
          <a className="account" href={TEMPLE_LOGIN}>เข้าสู่ระบบสมาชิกวัด</a>}
      </nav></header>
    {message && <div className="toast" role="status">{message}<button onClick={() => setMessage('')} aria-label="ปิดข้อความ">×</button></div>}
    {path === '/' && <main className="home"><section className="searchHero">
      <span className="seal" aria-hidden="true">☸</span>
      <p className="eyebrow">NATHOENG MONASTERY LIBRARY</p>
      <h1>หนังสือหนึ่งเล่ม อาจเปลี่ยนวันธรรมดาให้มีความหมาย</h1>
      <p>ค้นหาหนังสือของวัดได้จากที่นี่</p>
      <form className="searchBox" onSubmit={e => { e.preventDefault(); setQuery(searchRef.current.value); history.replaceState({}, '', `/?q=${encodeURIComponent(searchRef.current.value.trim())}`); }}>
        <span aria-hidden="true">⌕</span><input ref={searchRef} defaultValue={query} autoFocus aria-label="ค้นหาหนังสือ"
          placeholder="ชื่อหนังสือ ผู้แต่ง หัวข้อ หรือ ISBN" />
        <button type="submit">ค้นหา</button>
      </form>
      {user && <p className="signedIn">ยินดีต้อนรับ {user.name}{user.memberNumber ? ` · บัตรสมาชิก ${user.memberNumber}` : ''}</p>}
      {deskBorrower && <p className="deskBanner">กำลังเลือกหนังสือให้ {deskBorrower.name} · บัตร {deskBorrower.cardNumber}
        <button type="button" onClick={() => { setDeskBorrower(null); setCart([]); }}>ยกเลิก</button></p>}
    </section><section className="results content"><div className="sectionTitle"><h2>{query ? `ผลการค้นหา “${query}”` : 'หนังสือในห้องสมุด'}</h2><span>{books.length} รายการ</span></div>
      {books.length ? <div className="bookGrid">{books.map(b => <button type="button" className="bookTile" key={b.id} onClick={() => go(`/book/${b.id}`)}>
        <Cover book={b} /><strong>{b.title}</strong><span>{b.author || 'ไม่ระบุผู้แต่ง'}</span>
        <small className={b.available_copies > 0 ? 'available' : 'unavailable'}>{b.available_copies > 0 ? `ยืมได้ ${b.available_copies} เล่ม` : 'ยังไม่มีเล่มว่าง'}</small>
      </button>)}</div> : <div className="empty">{query ? 'ยังไม่พบหนังสือ ลองค้นด้วยชื่อผู้แต่งหรือ ISBN' : 'ห้องสมุดกำลังเตรียมรายการหนังสือ'}</div>}
    </section></main>}
    {path.startsWith('/book/') && <main className="content detailPage"><button className="back" onClick={() => go('/')}>← กลับไปค้นหา</button>
      {book ? <><div className="bookDetail"><Cover book={book} /><div><span className="eyebrow">หนังสือห้องสมุดวัด</span>
        <h1>{book.title}</h1><p className="author">{book.author || 'ไม่ระบุผู้แต่ง'}</p>
        <dl><dt>สำนักพิมพ์</dt><dd>{book.publisher || '—'}</dd><dt>ปีที่พิมพ์</dt><dd>{book.published_year || '—'}</dd>
          <dt>ISBN</dt><dd>{book.isbn || 'ไม่มี ISBN'}</dd><dt>หัวข้อ</dt><dd>{book.subject || '—'}</dd></dl>
        <p className={book.available_copies ? 'available' : 'unavailable'}>{book.available_copies ? `พร้อมให้ยืม ${book.available_copies} เล่ม` : 'ขณะนี้ไม่มีเล่มว่าง'}</p>
        <button disabled={!book.available_copies} onClick={() => addToCart(book)}>+ เพิ่มในรายการยืม</button>
        <p className="muted">เลือกรับที่วัด หรือให้จัดส่งทางขนส่งโดยชำระค่าส่งปลายทาง</p>
      </div></div>{book.description && <section className="bookDescription"><h2>เกี่ยวกับหนังสือ</h2><p>{book.description}</p></section>}
        {user?.isStaff && <section className="staffInline"><h2>รับหนังสือเล่มใหม่เข้าชั้น</h2>
          <input value={shelf} onChange={e => setShelf(e.target.value)} placeholder="ชั้นวาง / หมวดหนังสือ" />
          <button disabled={busy} onClick={addCopyToBook}>เพิ่มหนังสืออีก 1 เล่ม</button></section>}</> : <p>กำลังโหลดหนังสือ...</p>}
    </main>}
    {path === '/my-loans' && <main className="content dashboard"><button className="back" onClick={() => go('/')}>← กลับไปค้นหา</button>
      <h1>รายการยืมของฉัน</h1><p className="muted">ติดตามตั้งแต่เจ้าหน้าที่ตรวจสอบ จนบรรณารักษ์รับหนังสือคืน</p>
      {!user && !sessionLoading ? <a className="button" href={TEMPLE_LOGIN}>เข้าสู่ระบบสมาชิกวัด</a> :
        loans.length ? loans.map(loan => <LoanCard key={loan.id} loan={loan} busy={busy} onAdvance={advance}
          tracking={tracking} onTracking={(id, value) => setTracking(t => ({ ...t, [id]: value }))} dueDate={dueDate} onDueDate={() => {}} />) : <div className="empty">ยังไม่มีรายการยืม</div>}
    </main>}
    {path === '/staff' && user?.isStaff && <main className="content dashboard"><h1>โต๊ะบรรณารักษ์</h1>
      <p className="muted">ตรวจสอบคำขอ · จัดหนังสือ · ส่งพัสดุ · ยืนยันรับคืน</p>
      <div className="tabs"><button className={staffTab === 'loans' ? 'selected' : ''} onClick={() => setStaffTab('loans')}>รายการยืม</button>
        <button className={staffTab === 'catalog' ? 'selected' : ''} onClick={() => setStaffTab('catalog')}>รับเข้าหนังสือ</button>
        <button className={staffTab === 'card' ? 'selected' : ''} onClick={() => setStaffTab('card')}>ตรวจบัตรสมาชิก</button></div>
      {staffTab === 'loans' && <><label className="filter">แสดงสถานะ <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
        <option value="active">งานที่ยังไม่ปิด</option><option value="all">ทั้งหมด</option>
        {Object.entries(LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label><button type="button" className="quiet" onClick={() => api('staff_loans').then(data => setStaffLoans(data.loans || [])).catch(error => setMessage(error.message))}>อัปเดตรายการ</button>
      {activeStaffLoans.length ? activeStaffLoans.map(loan => <React.Fragment key={loan.id}>
        <LoanCard loan={loan} staff busy={busy} onAdvance={advance} tracking={tracking}
          onTracking={(id, value) => setTracking(t => ({ ...t, [id]: value }))}
          dueDate={dueDate} onDueDate={(id, value) => setDueDate(d => ({ ...d, [id]: value }))} onPrint={printLabel} />
        {loan.delivery_method === 'courier' && <div id={`label-${loan.id}`} className="label" hidden>
          <h2>ผู้รับ: {loan.recipient_name}</h2>
          <div className="row">โทร. {loan.recipient_phone}</div><div className="row">{loan.shipping_address}</div>
          <div className="row">รหัสไปรษณีย์ {loan.postal_code}</div>
          <small>จากห้องสมุดวัดพุทธอุทยานนาเทิง · รายการ: {loan.library_loan_items?.map(i => i.library_books?.title).join(', ')}<br />ค่าส่งขาไปเก็บปลายทางจากผู้ยืม</small>
        </div>}</React.Fragment>) : <div className="empty">ไม่มีรายการตามสถานะนี้</div>}</>}
      {staffTab === 'catalog' && <section className="staffForm"><h2>สแกน ISBN แล้วรับเข้าหนังสือ</h2>
        <p className="muted">เลือกช่องนี้แล้วสแกนบาร์โค้ด 978/979 ที่หลังหนังสือ ตรวจทานข้อมูลก่อนบันทึก</p>
        <form onSubmit={e => { e.preventDefault(); isbnLookup(isbn); }} className="isbnSearch">
          <input value={isbn} inputMode="numeric" maxLength={13} onChange={e => { const next = e.target.value.replace(/\D/g, ''); setIsbn(next); if (next.length === 13) isbnLookup(next); }}
            placeholder="สแกน ISBN 13 หลัก" aria-label="เลข ISBN" />
          <button disabled={busy} type="submit">ดึงข้อมูลหนังสือ</button>
        </form>
        <form onSubmit={saveBook} className="bookForm">
          <label>ชื่อหนังสือ *<input required value={bookForm.title} onChange={e => setBookForm(b => ({ ...b, title: e.target.value }))} /></label>
          <label>ผู้แต่ง<input value={bookForm.author} onChange={e => setBookForm(b => ({ ...b, author: e.target.value }))} /></label>
          <label>สำนักพิมพ์<input value={bookForm.publisher} onChange={e => setBookForm(b => ({ ...b, publisher: e.target.value }))} /></label>
          <label>ISBN<input value={bookForm.isbn} onChange={e => setBookForm(b => ({ ...b, isbn: e.target.value }))} /></label>
          <label>ปีที่พิมพ์<input value={bookForm.publishedYear} onChange={e => setBookForm(b => ({ ...b, publishedYear: e.target.value }))} /></label>
          <label>หัวข้อ<input value={bookForm.subject} onChange={e => setBookForm(b => ({ ...b, subject: e.target.value }))} /></label>
          <label>ภาพปก (URL)<input value={bookForm.coverUrl} onChange={e => setBookForm(b => ({ ...b, coverUrl: e.target.value }))} /></label>
          <label>ชั้นวาง<input value={shelf} onChange={e => setShelf(e.target.value)} placeholder="เช่น ชั้น A / ธรรมะ" /></label>
          <label className="wide">คำอธิบาย<textarea rows={4} value={bookForm.description} onChange={e => setBookForm(b => ({ ...b, description: e.target.value }))} /></label>
          <button disabled={busy || !bookForm.title.trim()} type="submit">บันทึกและรับเข้าหนังสือ 1 เล่ม</button>
        </form>
      </section>}
      {staffTab === 'card' && <section className="staffForm"><h2>ตรวจบัตรสมาชิกที่โต๊ะ</h2><p className="muted">บัตรสมาชิกวัดใบเดิมใช้ระบุตัวผู้ยืมได้ การกดยืมผ่านเว็บยังต้องเข้าสู่ระบบด้วยบัญชีของสมาชิกเอง</p>
        <form className="isbnSearch" onSubmit={e => { e.preventDefault(); findCard(cardNumber); }}><input value={cardNumber} inputMode="numeric" maxLength={13}
          onChange={e => { const next = e.target.value.replace(/\D/g, ''); setCardNumber(next); setCardMember(undefined); if (next.length === 13) findCard(next); }} placeholder="สแกนเลขสมาชิก 13 หลัก" />
          <button type="submit" disabled={busy}>ตรวจสมาชิก</button></form>
        {cardMember !== undefined && <div className="cardResult">{cardMember ? <>สมาชิก: {cardMember.name}
          <button type="button" disabled={busy} onClick={() => { setDeskBorrower({ ...cardMember, cardNumber }); setCart([]); setAccepted(false); setShipping({ name: cardMember.name, phone: '', address: '', postal: '' }); go('/'); }}>เลือกหนังสือให้สมาชิกท่านนี้</button>
          {user.isAdmin && <button type="button" disabled={busy} onClick={() => setStaffPermission(cardMember.id, true)}>มอบสิทธิ์บรรณารักษ์</button>}</> : 'ไม่พบบัตรสมาชิกหมายเลขนี้'}</div>}
        {user.isAdmin && <div className="staffPermissions"><h3>เจ้าหน้าที่ห้องสมุด</h3>
          {staffMembers.length ? staffMembers.map(person => <div key={person.memberId}>
            <span>{person.name}</span><button className="quiet" type="button" disabled={busy} onClick={() => setStaffPermission(person.memberId, false)}>ถอนสิทธิ์</button>
          </div>) : <p className="muted">ยังไม่มีเจ้าหน้าที่ที่มอบสิทธิ์เพิ่มเติม · Admin วัดเข้าใช้งานได้อยู่แล้ว</p>}</div>}
      </section>}
    </main>}
    {path === '/staff' && !user?.isStaff && <main className="content dashboard"><h1>สำหรับบรรณารักษ์</h1><p>กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่ห้องสมุด</p><a className="button" href={TEMPLE_LOGIN}>เข้าสู่ระบบ</a></main>}
    {cart.length > 0 && <button className="cartFab" onClick={() => setBorrowOpen(true)}>{deskBorrower ? `ยืมให้ ${deskBorrower.name} · ` : 'รายการยืม · '}{cart.length} เล่ม →</button>}
    {borrowOpen && <div className="modalShade" onClick={() => setBorrowOpen(false)}><section className="borrowDialog" role="dialog" aria-modal="true" aria-label="ยืนยันคำขอยืม" onClick={e => e.stopPropagation()}>
      <button className="dialogClose" onClick={() => setBorrowOpen(false)} aria-label="ปิด">×</button><span className="eyebrow">ยืมหนังสือห้องสมุดวัด</span><h2>ตรวจสอบรายการยืม</h2>
      {deskBorrower && <p className="deskBanner">ทำรายการที่โต๊ะให้ {deskBorrower.name} · บัตร {deskBorrower.cardNumber}</p>}
      <ul className="cartList">{cart.map((id, index) => <li key={id}><span>{cartBooks[index]?.title || `หนังสือ ${id.slice(0, 8)}`}</span>
        <button onClick={() => setCart(c => c.filter(x => x !== id))}>นำออก</button></li>)}</ul>
      {user ? <form onSubmit={submitBorrow} className="borrowForm"><fieldset><legend>วิธีรับหนังสือ</legend>
        <label><input type="radio" checked={delivery === 'pickup'} onChange={() => setDelivery('pickup')} /> มารับด้วยตนเองที่วัด</label>
        <label><input type="radio" checked={delivery === 'courier'} onChange={() => setDelivery('courier')} /> ให้จัดส่งทางขนส่ง · ชำระค่าส่งปลายทาง</label>
      </fieldset>{delivery === 'courier' && <div className="shipFields">
        <label>ชื่อผู้รับ *<input required value={shipping.name} onChange={e => setShipping(s => ({ ...s, name: e.target.value }))} /></label>
        <label>โทรศัพท์ผู้รับ *<input required inputMode="tel" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} /></label>
        <label>ที่อยู่จัดส่ง *<textarea required rows={3} value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} /></label>
        <label>รหัสไปรษณีย์ *<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={shipping.postal} onChange={e => setShipping(s => ({ ...s, postal: e.target.value }))} /></label>
      </div>}
      <div className="terms"><strong>เงื่อนไขการยืม</strong><p>เจ้าหน้าที่จะตรวจสอบและแจ้งวันกำหนดคืนก่อนส่งมอบ โปรดดูแลหนังสือและคืนตามกำหนด หากเลือกจัดส่ง ผู้ยืมชำระค่าส่งขาไปปลายทาง และรับผิดชอบค่าส่งคืนหากเลือกส่งคืนทางขนส่ง ระบบจะแสดงสถานะจนบรรณารักษ์ยืนยันรับคืน</p>
        <label><input type="checkbox" required checked={accepted} onChange={e => setAccepted(e.target.checked)} /> {deskBorrower ? 'ผู้ยืมอ่านและกดยอมรับเงื่อนไขนี้ด้วยตนเอง' : 'ข้าพเจ้าอ่านและยอมรับเงื่อนไขการยืม'}</label></div>
      <button type="submit" disabled={busy || !accepted || cart.length === 0}>ส่งคำขอยืมให้เจ้าหน้าที่ →</button></form> :
        <div><p>ใช้บัญชีสมาชิกวัดเดิมเพื่อส่งคำขอยืม</p><a className="button" href={TEMPLE_LOGIN}>เข้าสู่ระบบสมาชิกวัด</a></div>}
    </section></div>}
    <footer><span>☸ ห้องสมุดวัดพุทธอุทยานนาเทิง</span><a href="https://watt.nathoeng.com/">กลับสู่เว็บไซต์วัด</a></footer>
  </div>;
}
