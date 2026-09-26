import React, { useEffect, useMemo, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { isValidShortMemberNumber } from '../memberNumber';
import './MemberCard.css';

const PRINT_STYLE = `
  @page { size: 85.6mm 54mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 85.6mm; height: 54mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .memberCardSurface { position: relative; display: flex; flex-direction: column; overflow: hidden;
    width: 85.6mm; height: 54mm; border: 0; border-radius: 0; padding: 4mm 5mm 3mm;
    color: #244536; background: linear-gradient(145deg, #f7f4e8 0%, #fffefa 61%, #e8f1e8 100%);
    font-family: Arial, Tahoma, sans-serif; }
  .memberCardSurface::before { content: ''; position: absolute; top: -14mm; right: -13mm;
    width: 42mm; height: 42mm; border: 1.5mm solid rgba(164,124,45,.13); border-radius: 50%; }
  .memberCardHeader { display:flex; align-items:center; gap: 2mm; border-bottom: .25mm solid #d9c9a8;
    padding-bottom: 2mm; z-index:1; }
  .memberCardSeal { display:grid; place-items:center; width:8mm; height:8mm; border: .35mm solid #a78036;
    border-radius:50%; color:#997129; font-size:5mm; }
  .memberCardHeading { min-width:0; }
  .memberCardHeading strong { display:block; font-size: 3.45mm; line-height:1.25; }
  .memberCardHeading span { display:block; font-size: 2.2mm; letter-spacing:.11em; color:#9b752e; }
  .memberCardBody { display:flex; align-items:center; gap:3mm; flex:1; min-height:0; z-index:1; }
  .memberCardPhoto { display:grid; place-items:center; width:16mm; height:16mm; flex:0 0 16mm;
    border-radius:50%; overflow:hidden; background:#efe8d9; border:.6mm solid white; box-shadow:0 1mm 3mm #274a2e22; }
  .memberCardPhoto img { display:block; width:100%; height:100%; object-fit:cover; }
  .memberCardPhoto span { color:#a78036; font-size:8mm; }
  .memberCardIdentity { min-width:0; flex:1; }
  .memberCardIdentity small { display:block; font-size:2.5mm; color:#98792e; margin-bottom:1mm; }
  .memberCardIdentity strong { display:block; font-size:4.1mm; line-height:1.18; max-height:10mm;
    overflow:hidden; overflow-wrap:anywhere; }
  .memberCardIdentity span { display:block; font-size:2.2mm; letter-spacing:.05em; margin-top:1.2mm; }
  .memberCardCode { background:white; padding:1mm 2mm 1.5mm; border-radius:2mm; z-index:1; }
  .memberCardCode svg { display:block; width:100%; height:15mm; }
  .memberCardCode span { display:block; margin-top:.5mm; text-align:center; font: 3mm/1.2 monospace;
    letter-spacing:0; color:#283b31; }
`;

function barcodeBars(value) {
  const data = {};
  JsBarcode(data, value, { format: 'EAN13', displayValue: false, flat: true });
  const bits = data.encodings.map((part) => part.data).join('');
  const bars = [];
  let start = -1;
  for (let index = 0; index <= bits.length; index += 1) {
    if (bits[index] === '1' && start === -1) start = index;
    if (bits[index] !== '1' && start !== -1) {
      bars.push({ x: start + 12, width: index - start });
      start = -1;
    }
  }
  return { bars, width: bits.length + 24 };
}

export default function MemberCard({ memberId, fullName, photo, lang = 'th', verifiedAt }) {
  const th = lang === 'th';
  const [cardResult, setCardResult] = useState({ memberId: '', number: '', error: '' });
  const number = cardResult.memberId === memberId ? cardResult.number : '';
  const cardError = cardResult.memberId === memberId ? cardResult.error : '';
  const barcode = useMemo(() => number ? barcodeBars(number) : null, [number]);
  const [photoError, setPhotoError] = useState(false);
  const [printError, setPrintError] = useState('');
  const cardRef = useRef(null);

  useEffect(() => { setPhotoError(false); }, [photo]);

  useEffect(() => {
    if (!memberId) return;
    const controller = new AbortController();
    fetch('/api/donation-profile', {
      method: 'POST', credentials: 'include', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'member_card_number', memberId })
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data?.success || !isValidShortMemberNumber(data.cardNumber))
        throw Error(data?.message || 'Unable to load member card number');
      if (!controller.signal.aborted) setCardResult({ memberId, number: data.cardNumber, error: '', verifiedAt: data.idCardVerifiedAt || null });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setCardResult({ memberId, number: '', error: error.message || 'Unable to load member card number' });
    });
    return () => controller.abort();
  }, [memberId]);

  if (!memberId) return null;
  if (!number || !barcode) return <p role="status" style={{ margin: 16, color: cardError ? '#a23f34' : '#665d51' }}>
    {cardError || (th ? 'กำลังเตรียมบัตรสมาชิก...' : 'Preparing member card...')}
  </p>;

  const verificationTime = verifiedAt !== undefined ? verifiedAt : cardResult.verifiedAt;
  const verifiedDate = verificationTime ? new Date(verificationTime) : null;
  const isVerified = verifiedDate && Number.isFinite(verifiedDate.getTime());

  const printCard = () => {
    const popup = window.open('', '_blank', 'width=600,height=460');
    if (!popup) {
      setPrintError(th ? 'กรุณาอนุญาตหน้าต่างใหม่เพื่อพิมพ์บัตร' : 'Allow a new window to print the card.');
      return;
    }
    popup.opener = null;
    popup.onload = () => {
      if (!popup.document.querySelector('.memberCardSurface')) return;
      const pictures = Array.from(popup.document.images);
      Promise.all(pictures.map((picture) => picture.complete ? null : new Promise((resolve) => {
        picture.onload = resolve;
        picture.onerror = resolve;
      }))).then(() => {
        popup.focus();
        popup.print();
      });
    };
    popup.document.write(`<!doctype html><html lang="${th ? 'th' : 'en'}"><head><meta charset="utf-8"><title>Member Card</title><style>${PRINT_STYLE}</style></head><body>${cardRef.current.outerHTML}</body></html>`);
    popup.document.close();
  };

  return <section className="memberCardWidget">
    <div className="memberCardToolbar">
      <div>
        <h3>{th ? 'บัตรสมาชิกวัด' : 'Monastery Member Card'}</h3>
        <p>{th ? 'แสดงบัตรบนมือถือ หรือพิมพ์ขนาดบัตรจริง' : 'Show this card on your phone or print it at card size.'}</p>
      </div>
      <div className="memberCardToolbarActions">
        <div className="memberCardVerification" role="status">
          <span className={isVerified ? 'memberCardVerified' : 'memberCardUnverified'}>
            {isVerified ? (th ? '✓ ยืนยันด้วยบัตรประชาชนแล้ว' : '✓ ID card verified')
              : (th ? 'ยังไม่มีข้อมูลยืนยันด้วยบัตร' : 'No ID card verification recorded')}
          </span>
          {isVerified && <small>{th ? 'ล่าสุด ' : 'Last verified '}
            <time dateTime={verifiedDate.toISOString()}>{verifiedDate.toLocaleString(th ? 'th-TH' : 'en-GB', {
              timeZone: 'Asia/Bangkok', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</time>{th ? ' น. (เวลาไทย)' : ' (Thailand time)'}
          </small>}
        </div>
        <button type="button" onClick={printCard}>{th ? 'พิมพ์บัตร' : 'Print card'}</button>
      </div>
    </div>
    <div className="memberCardSurface" ref={cardRef} aria-label={th ? `บัตรสมาชิก ${fullName}` : `Member card for ${fullName}`}>
      <div className="memberCardHeader">
        <div className="memberCardSeal" aria-hidden="true">☸</div>
        <div className="memberCardHeading">
          <strong>{th ? 'วัดพุทธอุทยานนาเทิง' : 'Buddhist Park Monastery of Nathoeng'}</strong>
          <span>NATHOENG CONNECT · MEMBER CARD</span>
        </div>
      </div>
      <div className="memberCardBody">
        <div className="memberCardPhoto">
          {photo && !photoError ? <img src={photo} alt="" referrerPolicy="no-referrer" onError={() => setPhotoError(true)} /> : <span aria-hidden="true">☸</span>}
        </div>
        <div className="memberCardIdentity">
          <small>{th ? 'ชื่อ - สกุล' : 'Full name'}</small>
          <strong>{fullName || (th ? 'สมาชิกวัดพุทธอุทยานนาเทิง' : 'Monastery member')}</strong>
          <span>{th ? 'หมายเลขสมาชิก' : 'Member number'}</span>
        </div>
      </div>
      <div className="memberCardCode">
        <svg viewBox={`0 0 ${barcode.width} 40`} role="img" aria-label={th ? `บาร์โค้ดหมายเลขสมาชิก ${number}` : `Member barcode ${number}`} preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width={barcode.width} height="40" fill="#fff" />
          {barcode.bars.map((bar) => <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="40" fill="#121a17" />)}
        </svg>
        <span>{number}</span>
      </div>
    </div>
    {printError && <p role="alert" style={{ color: '#a23f34' }}>{printError}</p>}
  </section>;
}
