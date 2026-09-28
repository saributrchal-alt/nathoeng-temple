const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export function donationPrintHtml(item, { lang = 'th', donorName, dateLabel, purposeLabel, statusLabel } = {}) {
  const th = lang === 'th';
  const title = th ? 'บันทึกรายการทำบุญ' : 'Donation Record';
  const row = (label, value) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || '—')}</td></tr>`;
  const amount = Number(item.amount);
  const value = item.donation_type === 'money'
    ? (Number.isFinite(amount) ? amount.toLocaleString(th ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (th ? ' บาท' : ' THB') : '—')
    : `${item.item_name || '—'} · ${item.quantity ?? '—'} ${item.unit || ''}`;
  const blessing = th
    ? 'ขออนุโมทนาในกุศลศรัทธาของท่าน ด้วยอานิสงส์แห่งบุญกุศลนี้ ขอให้ท่านและครอบครัวเจริญด้วยอายุ วรรณะ สุขะ พละ มีสุขภาพแข็งแรง จิตใจผ่องใส และเจริญในธรรมยิ่ง ๆ ขึ้นไป เทอญ'
    : 'With appreciation for your generosity, may the merit of this offering bring you and your family longevity, well-being, happiness and strength. May your minds be peaceful and bright, and may you continue to grow in the Dhamma.';
  return `<!doctype html><html lang="${th ? 'th' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
*{box-sizing:border-box}body{margin:0;color:#292820;background:#eeece6;font:16px/1.8 Tahoma,Arial,sans-serif}.toolbar{padding:14px;text-align:center}.toolbar button{font:inherit;padding:9px 24px;background:#355b49;color:white;border:0;border-radius:8px;cursor:pointer}.sheet{background:white;max-width:794px;margin:0 auto 24px;padding:48px 52px}header{text-align:center;border-bottom:2px solid #9b7226;padding-bottom:24px}header p{margin:4px 0;color:#686154;font-size:13px}h1{font-size:26px;margin:22px 0 4px}h2{font-size:20px;margin:0;color:#355b49}.reference{font-size:11px;color:#777;overflow-wrap:anywhere;margin:16px 0}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #e5e1d8;padding:13px 10px;overflow-wrap:anywhere;white-space:pre-wrap}th{width:32%;color:#686154;font-weight:normal}td{font-weight:bold}.blessing{text-align:center;border-top:1px solid #b99b60;margin-top:34px;padding-top:24px;break-inside:avoid}.blessing h3{font-size:18px;color:#355b49;margin:0 0 10px}.blessing p{margin:0;line-height:2}footer{text-align:center;color:#777;font-size:11px;margin-top:30px}tr{break-inside:avoid}@page{size:A4;margin:16mm}@media print{body{background:white}.toolbar{display:none}.sheet{max-width:none;margin:0;padding:0}header{break-inside:avoid}footer{break-inside:avoid}}@media screen and (max-width:600px){.sheet{padding:24px 18px}th{width:35%}}
</style></head><body><div class="toolbar"><button id="print">${th ? 'พิมพ์ / บันทึก PDF' : 'Print / Save PDF'}</button></div><main class="sheet"><header><h2>${th ? 'วัดพุทธอุทยานนาเทิง' : 'Buddhist Park Monastery of Nathoeng'}</h2><p>${th ? '231 หมู่ 2 บ้านตาลเดี่ยว ต.ธาตุ อ.วานรนิวาส จ.สกลนคร 47120' : '231 Moo 2, Ban Tan Diao, That, Wanon Niwat, Sakon Nakhon 47120, Thailand'}</p><p>${th ? 'โทร.' : 'Tel.'} 0963513441 · watt.nathoeng.com</p><h1>${title}</h1></header><p class="reference">${th ? 'รหัสอ้างอิงรายการ' : 'Record reference'}: ${escapeHtml(item.id || '—')}</p><table><tbody>
${row(th ? 'ชื่อผู้ทำบุญ' : 'Donor', donorName)}
${row(th ? 'วันที่ทำบุญ' : 'Donation date', dateLabel)}
${row(th ? 'ประเภทการทำบุญ' : 'Donation type', item.donation_type === 'money' ? (th ? 'ทำบุญเป็นเงิน' : 'Monetary donation') : (th ? 'ถวายสิ่งของ' : 'Donation of items'))}
${row(th ? (item.donation_type === 'money' ? 'จำนวนเงิน' : 'รายการ / จำนวน') : 'Amount / Items', value)}
${row(th ? 'วัตถุประสงค์' : 'Purpose', purposeLabel)}
${row(th ? 'สถานะการตรวจสอบ' : 'Review status', statusLabel)}
</tbody></table><section class="blessing"><h3>${th ? 'ขออนุโมทนาบุญ' : 'With blessings and gratitude'}</h3><p>${blessing}</p></section><footer>${th ? 'บันทึกจากระบบรายการทำบุญของวัดพุทธอุทยานนาเทิง' : 'Recorded in the donation system of the Buddhist Park Monastery of Nathoeng'}</footer></main></body></html>`;
}

export function printDonation(item, labels) {
  const popup = window.open('', '_blank', 'width=900,height=850');
  if (!popup) {
    window.alert(labels.lang === 'th' ? 'กรุณาอนุญาตหน้าต่างป๊อปอัปเพื่อพิมพ์รายการทำบุญ' : 'Please allow pop-ups to print the donation record.');
    return;
  }
  popup.opener = null;
  popup.document.open();
  popup.document.write(donationPrintHtml(item, labels));
  popup.document.close();
  popup.document.getElementById('print').addEventListener('click', () => { popup.focus(); popup.print(); });
  // Keep the preview open after printing or cancelling, with a manual print button.
  popup.document.fonts.ready.then(() => {
    if (!popup.closed) { popup.focus(); popup.print(); }
  });
}
