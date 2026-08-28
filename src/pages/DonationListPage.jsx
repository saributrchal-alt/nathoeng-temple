import { useState, useEffect } from 'react'

export default function DonationListPage({
  lang,
  goToPage
}) {
  const savedUser =
    localStorage.getItem('line_user')

  const user =
    savedUser
      ? JSON.parse(savedUser)
      : null

  const isAdmin =
    user?.isAdmin === true ||
    user?.role === 'admin'

  const text = {
    en: {
      back:
        '← Back to Donation Form',
      eyebrow:
        'ADMIN · DONATIONS',
      title:
        'Donation Records',
      intro:
        'Donation records are available only to authorized monastery administrators.',
      noData:
        'No donation records found.',
      dateHeader:
        'Date',
      nameHeader:
        'Full Name',
      purposeHeader:
        'Purpose',
      receiptHeader:
        'Tax Receipt',
      amountHeader:
        'Amount (THB)',
      deniedEyebrow:
        'NATHOENG CONNECT',
      deniedTitle:
        'Admin Access Only',
      deniedText:
        'This page is available only to authorized monastery administrators.',
      deniedButton:
        'Back to Donation Form'
    },

    th: {
      back:
        '← กลับสู่หน้าฟอร์มบริจาค',
      eyebrow:
        'สำหรับผู้ดูแลระบบ · รายการบริจาค',
      title:
        'ประวัติการทำบุญและบริจาค',
      intro:
        'ข้อมูลหน้านี้แสดงเฉพาะบัญชีผู้ดูแลระบบของวัด เพื่อใช้ตรวจสอบและจัดการข้อมูลการบริจาค',
      noData:
        'ยังไม่มีประวัติการบริจาคในระบบ',
      dateHeader:
        'วันเวลา',
      nameHeader:
        'ชื่อ - สกุล',
      purposeHeader:
        'วัตถุประสงค์',
      receiptHeader:
        'ใบอนุโมทนาฯ',
      amountHeader:
        'ยอดเงิน (บาท)',
      deniedEyebrow:
        'NATHOENG CONNECT',
      deniedTitle:
        'สำหรับผู้ดูแลระบบเท่านั้น',
      deniedText:
        'หน้านี้สามารถเข้าถึงได้เฉพาะบัญชีผู้ดูแลระบบของวัดที่ได้รับอนุญาต',
      deniedButton:
        'กลับสู่หน้าฟอร์มบริจาค'
    }
  }

  const t = text[lang]

  const [donations, setDonations] =
    useState([])

  useEffect(() => {
    // ไม่โหลดข้อมูลการบริจาคถ้าไม่ใช่ Admin
    if (!isAdmin) {
      setDonations([])
      return
    }

    try {
      const saved =
        localStorage.getItem(
          'nathoeng_donations'
        )

      if (saved) {
        setDonations(
          JSON.parse(saved)
        )
      }
    } catch (error) {
      console.error(
        'Unable to read donation records:',
        error
      )
      setDonations([])
    }
  }, [isAdmin])

  // ชั้นที่ 2:
  // ต่อให้ผู้ใช้รู้ hash / URL ของ donation-list
  // ก็ไม่แสดงรายชื่อถ้าไม่ใช่ Admin
  if (!isAdmin) {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '760px'
          }}
        >
          <button
            className="backButton"
            onClick={() =>
              goToPage(
                'donation-page'
              )
            }
          >
            {t.back}
          </button>

          <div
            style={{
              margin:
                '30px auto 10px',
              padding:
                '42px 28px',
              border:
                '1px solid #e5d9c8',
              borderRadius:
                '10px',
              background:
                '#faf7f0',
              textAlign:
                'center'
            }}
          >
            <img
              src="/icons/lotus.svg"
              alt=""
              aria-hidden="true"
              style={{
                width: '42px',
                height: '42px',
                margin:
                  '0 auto 14px',
                display: 'block'
              }}
            />

            <span
              className="eyebrow"
              style={{
                display: 'block',
                textAlign:
                  'center',
                marginBottom:
                  '12px'
              }}
            >
              {t.deniedEyebrow}
            </span>

            <h1
              style={{
                margin:
                  '0 0 14px',
                textAlign:
                  'center'
              }}
            >
              {t.deniedTitle}
            </h1>

            <p
              className="guideIntro"
              style={{
                maxWidth:
                  '520px',
                margin:
                  '0 auto 22px',
                textAlign:
                  'center'
              }}
            >
              {t.deniedText}
            </p>

            <button
              type="button"
              className="primaryContactBtn"
              onClick={() =>
                goToPage(
                  'donation-page'
                )
              }
            >
              {t.deniedButton}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="guidePage">
      <div
        className="guideContainer"
        style={{
          maxWidth: '1000px'
        }}
      >
        <div
          style={{
            marginBottom: '20px'
          }}
        >
          <button
            className="backButton"
            onClick={() =>
              goToPage(
                'donation-page'
              )
            }
            style={{
              margin: 0
            }}
          >
            {t.back}
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginBottom:
              '30px'
          }}
        >
          <img
            src="/icons/donation.svg"
            alt=""
            aria-hidden="true"
            style={{
              width: '40px',
              height: '40px',
              display: 'block',
              margin:
                '0 auto 12px'
            }}
          />

          <span
            className="eyebrow"
            style={{
              display: 'block',
              textAlign:
                'center'
            }}
          >
            {t.eyebrow}
          </span>

          <h1
            style={{
              textAlign:
                'center'
            }}
          >
            {t.title}
          </h1>

          <p
            className="guideIntro"
            style={{
              maxWidth:
                '650px',
              margin:
                '0 auto',
              textAlign:
                'center'
            }}
          >
            {t.intro}
          </p>
        </div>

        {donations.length === 0 ? (
          <div
            style={{
              textAlign:
                'center',
              padding: '40px',
              background:
                '#fcfbfa',
              borderRadius:
                '6px',
              border:
                '1px solid #eeeae2'
            }}
          >
            <p
              style={{
                color: '#777',
                fontSize:
                  '15px'
              }}
            >
              {t.noData}
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX:
                'auto',
              background:
                '#fff',
              border:
                '1px solid #eeeae2',
              borderRadius:
                '6px'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
                fontSize:
                  '14px',
                textAlign:
                  'left'
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      '#fcfbfa',
                    borderBottom:
                      '2px solid #dcd5c8',
                    color:
                      '#625d55'
                  }}
                >
                  <th
                    style={{
                      padding:
                        '12px'
                    }}
                  >
                    {t.dateHeader}
                  </th>

                  <th
                    style={{
                      padding:
                        '12px'
                    }}
                  >
                    {t.nameHeader}
                  </th>

                  <th
                    style={{
                      padding:
                        '12px'
                    }}
                  >
                    {t.purposeHeader}
                  </th>

                  <th
                    style={{
                      padding:
                        '12px',
                      textAlign:
                        'center'
                    }}
                  >
                    {t.receiptHeader}
                  </th>

                  <th
                    style={{
                      padding:
                        '12px',
                      textAlign:
                        'right'
                    }}
                  >
                    {t.amountHeader}
                  </th>
                </tr>
              </thead>

              <tbody>
                {donations.map(
                  (item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom:
                          '1px solid #e6dfd5'
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '12px',
                          color:
                            '#777',
                          fontSize:
                            '13px',
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {item.date}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px',
                          fontWeight:
                            '500',
                          color:
                            '#302d29'
                        }}
                      >
                        {item.name}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px',
                          color:
                            '#625d55'
                        }}
                      >
                        {item.purpose}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px',
                          textAlign:
                            'center'
                        }}
                      >
                        {item.receipt ===
                        'yes' ? (
                          <span
                            style={{
                              background:
                                '#e8f5e9',
                              color:
                                '#2e7d32',
                              padding:
                                '3px 8px',
                              borderRadius:
                                '4px',
                              fontSize:
                                '12px',
                              fontWeight:
                                '500'
                            }}
                          >
                            {lang ===
                            'th'
                              ? '✓ ต้องการ'
                              : '✓ Yes'}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                '#999',
                              fontSize:
                                '12px'
                            }}
                          >
                            {lang ===
                            'th'
                              ? 'ไม่ต้องการ'
                              : 'No'}
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px',
                          textAlign:
                            'right',
                          fontWeight:
                            '600',
                          color:
                            '#9b7226'
                        }}
                      >
                        {Number(
                          String(
                            item.amount
                          ).replace(
                            /,/g,
                            ''
                          )
                        ).toLocaleString()}{' '}
                        ฿
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
