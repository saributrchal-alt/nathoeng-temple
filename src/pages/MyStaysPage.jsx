import React from 'react';

function MyRetreatStay({
  lang = 'th',
  application,
  goToPage,
}) {
  const th = lang === 'th';

  /*
    สถานะระบบที่เราใช้

    pending
    approved
    checked_in
    accommodated
    in_retreat
    checked_out
    completed
  */

  const status = application?.status || 'approved';

  const statusOrder = [
    'pending',
    'approved',
    'checked_in',
    'accommodated',
    'in_retreat',
    'checked_out',
    'completed',
  ];

  const currentIndex = Math.max(
    0,
    statusOrder.indexOf(status)
  );

  const steps = [
    {
      key: 'pending',
      titleTh: 'คำขอเข้าพักปฏิบัติธรรม',
      titleEn: 'Retreat stay application',
      descTh: 'ระบบได้รับคำขอของท่านแล้ว',
      descEn: 'Your application has been received.',
    },
    {
      key: 'approved',
      titleTh: 'อนุมัติการเข้าพักปฏิบัติธรรม',
      titleEn: 'Retreat stay approved',
      descTh: 'เจ้าหน้าที่ได้อนุมัติคำขอของท่านแล้ว',
      descEn: 'Your retreat stay has been approved.',
    },
    {
      key: 'checked_in',
      titleTh: 'ลงทะเบียน / เช็กอินที่จุดลงทะเบียน',
      titleEn: 'Registration / Check-in',
      descTh: 'สแกน QR Code ที่จุดลงทะเบียนเมื่อมาถึงวัด',
      descEn:
        'Scan the QR Code at the registration desk when you arrive.',
    },
    {
      key: 'accommodated',
      titleTh: 'เข้าพักที่พักที่ได้รับมอบหมาย',
      titleEn: 'Enter assigned accommodation',
      descTh: 'สแกน QR Code ที่ที่พักของท่าน',
      descEn:
        'Scan the QR Code inside your assigned accommodation.',
    },
    {
      key: 'in_retreat',
      titleTh: 'ปฏิบัติธรรม',
      titleEn: 'Retreat practice',
      descTh:
        'เจ้าหน้าที่จะเปลี่ยนสถานะเมื่อท่านพร้อมปฏิบัติธรรม',
      descEn:
        'Staff will update this status when you are ready for retreat practice.',
    },
    {
      key: 'checked_out',
      titleTh: 'การเข้าพักปฏิบัติครบกำหนดแล้ว',
      titleEn: 'Retreat stay period completed',
      descTh:
        'เจ้าหน้าที่จะเปลี่ยนสถานะเมื่อครบกำหนดการเข้าพัก',
      descEn:
        'Staff will update this status when your retreat stay period ends.',
    },
    {
      key: 'completed',
      titleTh: 'คืนกุญแจ / อุปกรณ์และเช็กเอาท์',
      titleEn: 'Return keys / equipment and check out',
      descTh:
        'สแกน QR Code ที่จุดคืนกุญแจและอุปกรณ์',
      descEn:
        'Scan the QR Code at the key and equipment return desk.',
    },
  ];

  const canScanAtStep = (index) => {
    // หลัง approved -> ขั้น 3
    if (index === 2 && status === 'approved') {
      return true;
    }

    // หลัง checked_in -> ขั้น 4
    if (
      index === 3 &&
      status === 'checked_in'
    ) {
      return true;
    }

    // หลัง checked_out -> ขั้น 7
    if (
      index === 6 &&
      status === 'checked_out'
    ) {
      return true;
    }

    return false;
  };

  const handleScanQr = (stepIndex) => {
    sessionStorage.setItem(
      'retreat_qr_target_step',
      String(stepIndex + 1)
    );

    if (goToPage) {
      goToPage('checkin-page');
      return;
    }

    window.location.href = '/checkin';
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    try {
      return new Intl.DateTimeFormat(
        th ? 'th-TH' : 'en-GB',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
      ).format(
        new Date(`${value}T00:00:00`)
      );
    } catch {
      return value;
    }
  };

  const startDate =
    application?.check_in_date ||
    application?.start_date;

  const endDate =
    application?.check_out_date ||
    application?.end_date;

  const requestCode =
    application?.application_code ||
    application?.reference_code ||
    application?.id ||
    '-';

  const stayTitle = th
    ? 'เข้าพักปฏิบัติธรรม'
    : 'Retreat stay';

  const getStepState = (index) => {
    if (index < currentIndex) {
      return 'completed';
    }

    if (index === currentIndex) {
      /*
        approved หมายถึงขั้น 1,2 เสร็จแล้ว
        และขั้น 3 คือขั้นถัดไปที่รอดำเนินการ
      */

      if (status === 'approved') {
        if (index <= 1) {
          return 'completed';
        }
      }

      return 'current';
    }

    return 'pending';
  };

  const resolvedStepState = (index) => {
    if (status === 'approved') {
      if (index <= 1) {
        return 'completed';
      }

      if (index === 2) {
        return 'current';
      }

      return 'pending';
    }

    if (status === 'checked_in') {
      if (index <= 2) {
        return 'completed';
      }

      if (index === 3) {
        return 'current';
      }

      return 'pending';
    }

    if (status === 'accommodated') {
      if (index <= 3) {
        return 'completed';
      }

      if (index === 4) {
        return 'current';
      }

      return 'pending';
    }

    if (status === 'in_retreat') {
      if (index <= 4) {
        return 'completed';
      }

      if (index === 5) {
        return 'current';
      }

      return 'pending';
    }

    if (status === 'checked_out') {
      if (index <= 5) {
        return 'completed';
      }

      if (index === 6) {
        return 'current';
      }

      return 'pending';
    }

    if (status === 'completed') {
      return 'completed';
    }

    // pending
    if (index === 0) {
      return 'current';
    }

    return 'pending';
  };

  return (
    <>
      <style>{`
        .retreatPage {
          min-height: 100vh;
          background:
            #fbfaf7;
          color: #2d2925;
          font-family:
            Arial,
            "Noto Sans Thai",
            sans-serif;
        }

        .retreatContainer {
          max-width: 1180px;
          margin: 0 auto;
          padding: 42px 22px 60px;
        }

        .pageHeader {
          margin-bottom: 26px;
        }

        .pageTitle {
          margin: 0 0 8px;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 700;
          color: #3f3020;
        }

        .pageSubtitle {
          margin: 0;
          color: #6f655b;
          font-size: 15px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e8e3dc;
          border-radius: 12px;
          box-shadow:
            0 4px 16px rgba(55, 42, 25, 0.06);
          overflow: hidden;
        }

        .requestCard {
          margin-bottom: 22px;
        }

        .cardHeading {
          padding: 15px 20px;
          font-size: 16px;
          font-weight: 700;
          color: #684d2c;
          border-bottom: 1px solid #ece7e0;
        }

        .requestBody {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px;
        }

        .requestIcon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          flex-shrink: 0;
        }

        .requestInfo {
          flex: 1;
          min-width: 0;
        }

        .requestTitle {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .requestDate {
          color: #6b6660;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .requestCode {
          color: #77716b;
          font-size: 13px;
        }

        .approvedBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #e6f4e5;
          color: #27833a;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .trackingCard {
          padding: 22px;
        }

        .trackingTitle {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 28px;
          color: #332a21;
        }

        .timeline {
          position: relative;
        }

        .timelineRow {
          position: relative;
          display: grid;
          grid-template-columns:
            50px
            minmax(0, 1fr)
            230px;
          gap: 16px;
          min-height: 86px;
        }

        .timelineLine {
          position: absolute;
          width: 2px;
          background: #dedbd6;
          left: 20px;
          top: 34px;
          bottom: -8px;
          z-index: 0;
        }

        .timelineRow:last-child
        .timelineLine {
          display: none;
        }

        .timelineLine.complete {
          background: #9dcc9e;
        }

        .stepCircle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          position: relative;
          z-index: 2;
          margin-left: 5px;
        }

        .stepCircle.completed {
          background: #209335;
          color: #fff;
        }

        .stepCircle.current {
          background: #b17a16;
          color: #fff;
        }

        .stepCircle.pending {
          background: #e6e6e6;
          color: #777;
        }

        .stepMain {
          padding-top: 3px;
          padding-bottom: 22px;
        }

        .stepTitle {
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #34302c;
        }

        .stepDesc {
          color: #736d67;
          font-size: 14px;
          line-height: 1.6;
        }

        .stepRight {
          padding-top: 1px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .statusBadge.completed {
          color: #24883b;
          background: #e5f5e5;
        }

        .statusBadge.current {
          color: #a06c0c;
          background: #fff0d2;
        }

        .statusBadge.pending {
          color: #838383;
          background: #f0f0f0;
        }

        .scanButton {
          border: none;
          cursor: pointer;
          min-width: 220px;
          padding: 12px 18px;
          border-radius: 7px;
          background:
            linear-gradient(
              180deg,
              #b8821d,
              #9e6b0f
            );
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          box-shadow:
            0 2px 6px
            rgba(116, 74, 9, 0.2);
        }

        .scanButton:hover {
          filter: brightness(1.05);
        }

        .helpBox {
          margin-top: 12px;
          padding: 15px 16px;
          border-radius: 8px;
          background: #faf7f1;
          border: 1px solid #e8dfd3;
          color: #72573a;
          font-size: 14px;
        }

        .templeFooter {
          background:
            linear-gradient(
              90deg,
              #35200f,
              #583719,
              #3a2513
            );
          color: white;
        }

        .footerInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 26px 22px;
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .footerLeft {
          display: flex;
          gap: 17px;
          align-items: center;
        }

        .footerLogo {
          width: 88px;
          height: 88px;
          object-fit: contain;
        }

        .footerTempleName {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .footerSmall {
          font-size: 12px;
          line-height: 1.7;
          opacity: 0.9;
        }

        .footerRight {
          text-align: right;
          align-self: center;
          font-size: 12px;
          line-height: 1.9;
        }

        @media (max-width: 760px) {
          .retreatContainer {
            padding:
              28px 14px
              40px;
          }

          .pageTitle {
            font-size: 28px;
          }

          .requestBody {
            align-items:
              flex-start;
            flex-wrap: wrap;
          }

          .approvedBadge {
            margin-left: 76px;
          }

          .trackingCard {
            padding:
              18px 14px;
          }

          .timelineRow {
            grid-template-columns:
              42px
              minmax(0, 1fr);
            gap: 9px;
            min-height: 100px;
          }

          .stepRight {
            grid-column: 2;
            padding-top: 0;
            margin-top: -15px;
            padding-bottom: 20px;
          }

          .timelineLine {
            left: 20px;
          }

          .scanButton {
            width: 100%;
            min-width: 0;
          }

          .footerInner {
            flex-direction:
              column;
          }

          .footerRight {
            text-align: left;
          }

          .footerLogo {
            width: 72px;
            height: 72px;
          }
        }
      `}</style>

      <div className="retreatPage">
        <main className="retreatContainer">

          <div className="pageHeader">
            <h1 className="pageTitle">
              {th
                ? 'การเข้าพักปฏิบัติธรรมของฉัน'
                : 'My Retreat Stay'}
            </h1>

            <p className="pageSubtitle">
              {th
                ? 'ติดตามสถานะการเข้าพักปฏิบัติธรรมของท่านแบบเรียลไทม์'
                : 'Track the status of your retreat stay.'}
            </p>
          </div>

          <section className="card requestCard">
            <div className="cardHeading">
              {th
                ? 'รายการคำขอของฉัน'
                : 'My application'}
            </div>

            <div className="requestBody">

              <div className="requestIcon">
                🗓
              </div>

              <div className="requestInfo">
                <div className="requestTitle">
                  {stayTitle}
                </div>

                <div className="requestDate">
                  {formatDate(startDate)}
                  {' – '}
                  {formatDate(endDate)}
                </div>

                <div className="requestCode">
                  {th
                    ? 'รหัสคำขอ: '
                    : 'Application ID: '}
                  {requestCode}
                </div>
              </div>

              {status !== 'pending' && (
                <div className="approvedBadge">
                  ✓{' '}
                  {th
                    ? 'อนุมัติแล้ว'
                    : 'Approved'}
                </div>
              )}

            </div>
          </section>

          <section className="card trackingCard">

            <h2 className="trackingTitle">
              {th
                ? 'สถานะการเข้าพักปฏิบัติธรรม'
                : 'Retreat stay status'}
            </h2>

            <div className="timeline">

              {steps.map((step, index) => {
                const state =
                  resolvedStepState(index);

                const completed =
                  state === 'completed';

                const current =
                  state === 'current';

                const showScan =
                  canScanAtStep(index);

                return (
                  <div
                    className="timelineRow"
                    key={step.key}
                  >

                    <div>
                      {index <
                        steps.length - 1 && (
                        <div
                          className={
                            `timelineLine ${
                              completed
                                ? 'complete'
                                : ''
                            }`
                          }
                        />
                      )}

                      <div
                        className={
                          `stepCircle ${state}`
                        }
                      >
                        {completed
                          ? '✓'
                          : index + 1}
                      </div>
                    </div>

                    <div className="stepMain">

                      <div className="stepTitle">
                        {index + 1}.{' '}
                        {th
                          ? step.titleTh
                          : step.titleEn}
                      </div>

                      <div className="stepDesc">
                        {th
                          ? step.descTh
                          : step.descEn}
                      </div>

                    </div>

                    <div className="stepRight">

                      <div
                        className={
                          `statusBadge ${state}`
                        }
                      >
                        {completed && (
                          <>
                            ✓{' '}
                            {th
                              ? 'เสร็จสิ้น'
                              : 'Completed'}
                          </>
                        )}

                        {current && (
                          <>
                            ◉{' '}
                            {th
                              ? 'รอการดำเนินการ'
                              : 'Action required'}
                          </>
                        )}

                        {state ===
                          'pending' && (
                          <>
                            ●{' '}
                            {th
                              ? 'รอการดำเนินการ'
                              : 'Pending'}
                          </>
                        )}
                      </div>

                      {showScan && (
                        <button
                          className="scanButton"
                          onClick={() =>
                            handleScanQr(
                              index
                            )
                          }
                        >
                          ▦{' '}
                          {th
                            ? 'สแกน QR Code'
                            : 'Scan QR Code'}
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

            <div className="helpBox">
              ⓘ{' '}
              {th
                ? 'หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่ หรือไลน์วัดนาเทิง'
                : 'If you need assistance, please contact monastery staff or Nathoeng LINE.'}
            </div>

          </section>

        </main>

        <footer className="templeFooter">

          <div className="footerInner">

            <div className="footerLeft">

              <img
                src="/images/logo-full-trans.png"
                alt="Wat Phuttha Uthayan Nathoeng"
                className="footerLogo"
              />

              <div>
                <div className="footerTempleName">
                  {th
                    ? 'วัดพุทธอุทยานนาเทิง'
                    : 'Buddhist Park Monastery of Nathoeng'}
                </div>

                <div className="footerSmall">
                  226 บ้านตันเดี่ยว หมู่ 2
                  ตำบลธาตุ อำเภอวานรนิวาส
                  จังหวัดสกลนคร 47120
                </div>

                <div className="footerSmall">
                  LINE @nathoeng
                </div>
              </div>

            </div>

            <div className="footerRight">
              <div>
                Copyright © 2026
              </div>

              <div>
                Buddhist Park Monastery
                of Nathoeng
              </div>

              <div>
                Powered by Nathoeng
                Community of Tech Team
              </div>
            </div>

          </div>

        </footer>
      </div>
    </>
  );
}

export default MyRetreatStay;