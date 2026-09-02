import { useEffect, useMemo, useState } from 'react'

export default function DonationListPage({
  lang,
  goToPage
}) {
  const th = lang === 'th'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [donations, setDonations] = useState([])

  const text = {
    th: {
      back: '← กลับสู่บัญชีของฉัน',
      eyebrow: 'NATHOENG CONNECT',
      title: 'การทำบุญของฉัน',
      intro: 'ประวัติการร่วมทำบุญที่บันทึกไว้ในบัญชีของท่าน',
      historyNoticeTitle: 'ข้อมูลประวัติการทำบุญ',
      historyNotice:
        'ระบบเริ่มบันทึกประวัติการทำบุญตั้งแต่วันที่ 2 กันยายน 2569 เป็นต้นไป รายการทำบุญก่อนวันที่ดังกล่าวอาจไม่ปรากฏในประวัตินี้',
      loading: 'กำลังโหลดประวัติการทำบุญ...',
      noData: 'ยังไม่มีประวัติการทำบุญในบัญชีนี้',
      retry: 'ลองใหม่',
      add: '+ ทำรายการบริจาคเพิ่ม',
      money: 'ทำบุญเป็นเงิน',
      item: 'ถวายสิ่งของ',
      amount: 'จำนวนเงิน',
      purpose: 'วัตถุประสงค์',
      itemName: 'สิ่งของที่ถวาย',
      quantity: 'จำนวน',
      note: 'หมายเหตุ',
      receipt: 'ใบอนุโมทนาบัตร',
      receiptYes: 'ต้องการ',
      receiptNo: 'ไม่ต้องการ',
      verificationPending: 'รอตรวจสอบ',
      verificationVerified: 'รายการถูกต้อง',
      verificationNeedsCorrection: 'ต้องแก้ไขข้อมูล',
      receiptWaitingReview: 'รอการตรวจสอบรายการ',
      receiptPreparing: 'กำลังจัดทำใบอนุโมทนาบัตร',
      receiptDownload: 'ดาวน์โหลดใบอนุโมทนาบัตร',
      correctionNote: 'ข้อมูลที่ต้องแก้ไข',
      totalMoney: 'ยอดทำบุญเป็นเงินรวม',
      moneyCount: 'ครั้งที่ทำบุญเป็นเงิน',
      itemCount: 'รายการสิ่งของถวาย',
      baht: 'บาท'
    },
    en: {
      back: '← Back to My Account',
      eyebrow: 'NATHOENG CONNECT',
      title: 'My Donations',
      intro: 'Your donation and merit-making history recorded with the monastery.',
      historyNoticeTitle: 'Donation History Information',
      historyNotice:
        'Donation history has been recorded in this system since 2 September 2026. Donations made before this date may not appear in your history.',
      loading: 'Loading donation history...',
      noData: 'No donation history has been recorded for this account yet.',
      retry: 'Try again',
      add: '+ Make Another Donation',
      money: 'Money Donation',
      item: 'Item Offering',
      amount: 'Amount',
      purpose: 'Purpose',
      itemName: 'Item',
      quantity: 'Quantity',
      note: 'Note',
      receipt: 'Donation receipt',
      receiptYes: 'Requested',
      receiptNo: 'Not requested',
      verificationPending: 'Pending review',
      verificationVerified: 'Verified',
      verificationNeedsCorrection: 'Needs correction',
      receiptWaitingReview: 'Waiting for review',
      receiptPreparing: 'Certificate is being prepared',
      receiptDownload: 'Download donation certificate',
      correctionNote: 'Correction needed',
      totalMoney: 'Total money donations',
      moneyCount: 'Money donations',
      itemCount: 'Items offered',
      baht: 'THB'
    }
  }

  const t = text[th ? 'th' : 'en']

  const loadDonations = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/donation', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to load donations'
        )
      }

      setDonations(
        Array.isArray(data.donations)
          ? data.donations
          : []
      )
    } catch (err) {
      console.error('Donation history error:', err)

      setError(
        th
          ? 'ไม่สามารถโหลดประวัติการทำบุญได้'
          : 'Unable to load donation history'
      )

      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = useMemo(() => {
    const money = donations.filter(
      (item) => item.donation_type === 'money'
    )

    const items = donations.filter(
      (item) => item.donation_type === 'item'
    )

    return {
      total: money.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ),
      moneyCount: money.length,
      itemCount: items.length
    }
  }, [donations])

  const formatDate = (value) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return String(value)
    }

    return new Intl.DateTimeFormat(
      th ? 'th-TH' : 'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Bangkok'
      }
    ).format(date)
  }

  const moneyText = (value) =>
    Number(value || 0).toLocaleString(
      th ? 'th-TH' : 'en-US',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    )

  const getPurposeLabel = (item) => {
    const purpose = item?.purpose || ''

    if (purpose === 'custom') {
      const verificationMeta = (item) => {
    const status = item?.verification_status || 'pending'

    if (status === 'verified') {
      return {
        text: t.verificationVerified,
        color: '#236b4a',
        background: '#edf7f1',
        border: '#cce4d5'
      }
    }

    if (status === 'needs_correction') {
      return {
        text: t.verificationNeedsCorrection,
        color: '#9a3f35',
        background: '#fff1ef',
        border: '#efcfc9'
      }
    }

    return {
      text: t.verificationPending,
      color: '#8a611d',
      background: '#fff7e7',
      border: '#ead6ad'
    }
  }

  const receiptContent = (item) => {
    if (item?.receipt_requested !== true) return null

    const status = item?.verification_status || 'pending'

    if (status === 'verified' && item?.receipt_url) {
      return {
        type: 'download',
        text: t.receiptDownload
      }
    }

    if (status === 'verified') {
      return {
        type: 'text',
        text: t.receiptPreparing
      }
    }

    return {
      type: 'text',
      text: t.receiptWaitingReview
    }
  }

  return (
        item?.custom_purpose ||
        (th ? 'วัตถุประสงค์เฉพาะ' : 'Specific purpose')
      )
    }

    const labels = {
      general: th
        ? 'ทำบุญตามอัธยาศัยทางคณะสงฆ์'
        : 'General donation',
      utilities: th
        ? 'เพื่อค่าน้ำ - ค่าไฟวัด'
        : 'Electricity & water expenses',
      development: th
        ? 'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ'
        : 'Monastery development & maintenance'
    }

    return labels[purpose] || purpose || '—'
  }

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{
          maxWidth: '760px',
          paddingBottom: '110px'
        }}
      >
        <button
          type="button"
          className="backButton"
          onClick={() => goToPage('my-dashboard')}
          style={{ marginBottom: '22px' }}
        >
          {t.back}
        </button>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '26px'
          }}
        >
          <img
            src="/icons/donation.svg"
            alt=""
            aria-hidden="true"
            style={{
              width: '42px',
              height: '42px',
              display: 'block',
              margin: '0 auto 10px'
            }}
          />

          <span
            className="eyebrow"
            style={{
              display: 'block',
              textAlign: 'center'
            }}
          >
            {t.eyebrow}
          </span>

          <h1
            style={{
              margin: '8px 0 8px',
              textAlign: 'center'
            }}
          >
            {t.title}
          </h1>

          <p
            className="guideIntro"
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            {t.intro}
          </p>
        </div>

        <div
          style={{
            marginBottom: '18px',
            padding: '14px 16px',
            border: '1px solid #e4d3ad',
            borderRadius: '14px',
            background: '#fffaf0',
            color: '#655744',
            fontSize: '13px',
            lineHeight: 1.65
          }}
        >
          <strong
            style={{
              display: 'block',
              marginBottom: '3px',
              color: '#9b7226'
            }}
          >
            ⓘ {t.historyNoticeTitle}
          </strong>

          {t.historyNotice}
        </div>

        <div
          style={{
            border: '1px solid #e4ddd2',
            borderRadius: '22px',
            background: '#fff',
            padding: '22px 18px',
            marginBottom: '18px'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#777',
              fontSize: '14px'
            }}
          >
            {t.totalMoney}
          </div>

          <div
            style={{
              textAlign: 'center',
              color: '#236b4a',
              fontWeight: 700,
              fontSize: '34px',
              marginTop: '4px'
            }}
          >
            {loading ? '—' : moneyText(summary.total)}
            {' '}
            <span style={{ fontSize: '15px' }}>
              {t.baht}
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid #eee8df',
              marginTop: '18px',
              paddingTop: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                borderRight: '1px solid #eee8df'
              }}
            >
              <strong
                style={{
                  display: 'block',
                  color: '#236b4a',
                  fontSize: '22px'
                }}
              >
                {loading ? '—' : summary.moneyCount}
              </strong>

              <span
                style={{
                  fontSize: '13px',
                  color: '#777'
                }}
              >
                {t.moneyCount}
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <strong
                style={{
                  display: 'block',
                  color: '#236b4a',
                  fontSize: '22px'
                }}
              >
                {loading ? '—' : summary.itemCount}
              </strong>

              <span
                style={{
                  fontSize: '13px',
                  color: '#777'
                }}
              >
                {t.itemCount}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => goToPage('donation-page')}
          style={{
            width: '100%',
            minHeight: '54px',
            borderRadius: '16px',
            border: '1px solid #b1842b',
            background: '#fffdf8',
            color: '#9b7226',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '22px'
          }}
        >
          {t.add}
        </button>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '34px 16px',
              color: '#777'
            }}
          >
            {t.loading}
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 18px',
              border: '1px solid #eaded2',
              borderRadius: '18px',
              background: '#fff'
            }}
          >
            <p style={{ marginTop: 0 }}>
              {error}
            </p>

            <button
              type="button"
              onClick={loadDonations}
              style={{
                minHeight: '44px',
                padding: '0 24px',
                borderRadius: '12px',
                border: '1px solid #b1842b',
                background: '#b1842b',
                color: '#fff',
                fontWeight: 700
              }}
            >
              {t.retry}
            </button>
          </div>
        ) : donations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '38px 20px',
              border: '1px solid #eee8df',
              borderRadius: '20px',
              background: '#fff',
              color: '#777'
            }}
          >
            {t.noData}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '14px'
            }}
          >
            {donations.map((item) => {
              const isMoney =
                item.donation_type === 'money'

              return (
                <article
                  key={item.id}
                  style={{
                    border: '1px solid #e4ddd2',
                    borderRadius: '20px',
                    background: '#fff',
                    padding: '18px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '14px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: '#9b7226',
                          fontWeight: 700,
                          fontSize: '16px'
                        }}
                      >
                        {isMoney
                          ? t.money
                          : t.item}
                      </div>

                      <div
                        style={{
                          color: '#888',
                          fontSize: '13px',
                          marginTop: '4px'
                        }}
                      >
                        {formatDate(
                          item.donation_date ||
                          item.created_at
                        )}
                      </div>
                    </div>

                    <img
                      src={
                        isMoney
                          ? '/icons/donation.svg'
                          : '/icons/lotus.svg'
                      }
                      alt=""
                      aria-hidden="true"
                      style={{
                        width: '30px',
                        height: '30px'
                      }}
                    />
                  </div>

                  {isMoney ? (
                    <div
                      style={{
                        marginTop: '16px',
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#236b4a'
                      }}
                    >
                      {moneyText(item.amount)}
                      {' '}
                      <span style={{ fontSize: '14px' }}>
                        {t.baht}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '16px',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#302d29'
                      }}
                    >
                      {item.item_name || '—'}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gap: '8px',
                      marginTop: '14px',
                      fontSize: '14px',
                      color: '#625d55'
                    }}
                  >
                    {!isMoney && (
                      <div>
                        <strong>{t.quantity}: </strong>
                        {item.quantity ?? '—'}
                        {item.unit
                          ? ` ${item.unit}`
                          : ''}
                      </div>
                    )}

                    <div>
                      <strong>{t.purpose}: </strong>
                      {getPurposeLabel(item)}
                    </div>

                    {item.note && (
                      <div>
                        <strong>{t.note}: </strong>
                        {item.note}
                      </div>
                    )}

                    {isMoney && (
                      <div>
                        <strong>{t.receipt}: </strong>
                        {item.receipt_requested === true
                          ? t.receiptYes
                          : t.receiptNo}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
