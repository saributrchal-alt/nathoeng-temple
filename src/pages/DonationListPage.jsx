import { useState, useEffect } from 'react'

export default function DonationListPage({ lang, goToPage }) {
  const text = {
    en: {
      back: '← Back to Donation Form',
      eyebrow: 'PUBLIC DONATIONS',
      title: 'Recent Donation Records',
      intro: 'List of contributions from our generous donors. Thank you for supporting the monastery.',
      noData: 'No donation records found.',
      dateHeader: 'Date',
      nameHeader: 'Full Name',
      purposeHeader: 'Purpose',
      receiptHeader: 'Tax Receipt',
      amountHeader: 'Amount (THB)',
      totalLabel: 'Total Donations:'
    },
    th: {
      back: '← กลับสู่หน้าฟอร์มบริจาค',
      eyebrow: 'รายชื่อผู้บริจาค',
      title: 'ประวัติการทำบุญและบริจาค',
      intro: 'รวบรวมรายชื่อผู้มีจิตศรัทธาทุกท่านที่ร่วมทำบุญ เพื่อร่วมอนุโมทนาบุญร่วมกัน ขอขอบพระคุณและอนุโมทนามา ณ ที่นี้',
      noData: 'ยังไม่มีประวัติการบริจาคในระบบ',
      dateHeader: 'วันเวลา',
      nameHeader: 'ชื่อ - สกุล',
      purposeHeader: 'วัตถุประสงค์',
      receiptHeader: 'ใบอนุโมทนาฯ',
      amountHeader: 'ยอดเงิน (บาท)',
      totalLabel: 'ยอดบริจาคสะสมรวมทั้งสิ้น:'
    }
  }

  const t = text[lang]

  const [donations, setDonations] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('nathoeng_donations')
    if (saved) {
      setDonations(JSON.parse(saved))
    }
  }, [])

  const totalAmount = donations.reduce((sum, item) => sum + Number(String(item.amount).replace(/,/g, '')), 0)

  return (
    <div className="guidePage">
      <div className="guideContainer" style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button className="backButton" onClick={() => goToPage('donation-page')} style={{ margin: 0 }}>
            {t.back}
          </button>
        </div>

        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="guideIntro">{t.intro}</p>

        {donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fcfbfa', borderRadius: '6px', border: '1px solid #eeeae2' }}>
            <p style={{ color: '#777', fontSize: '15px' }}>{t.noData}</p>
          </div>
        ) : (
          <div>
            <div style={{ background: '#f6f4ef', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #eeeae2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#302d29' }}>{t.totalLabel}</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#9b7226' }}>{totalAmount.toLocaleString()} ฿</span>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #eeeae2', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#fcfbfa', borderBottom: '2px solid #dcd5c8', color: '#625d55' }}>
                    <th style={{ padding: '12px' }}>{t.dateHeader}</th>
                    <th style={{ padding: '12px' }}>{t.nameHeader}</th>
                    <th style={{ padding: '12px' }}>{t.purposeHeader}</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>{t.receiptHeader}</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>{t.amountHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e6dfd5' }}>
                      <td style={{ padding: '12px', color: '#777', fontSize: '13px', whiteSpace: 'nowrap' }}>{item.date}</td>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#302d29' }}>{item.name}</td>
                      <td style={{ padding: '12px', color: '#625d55' }}>{item.purpose}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {item.receipt === 'yes' ? (
                          <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                            {lang === 'th' ? '✓ ต้องการ' : '✓ Yes'}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {lang === 'th' ? 'ไม่ต้องการ' : 'No'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#9b7226' }}>
                        {Number(String(item.amount).replace(/,/g, '')).toLocaleString()} ฿
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}