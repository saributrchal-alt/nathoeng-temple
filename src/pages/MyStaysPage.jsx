import React from 'react';

function MyRetreatStay({
  lang = 'th',
  application,
  goToPage,
}) {
  const th = lang === 'th';

  /*
    RETREAT STATUS

    pending
    approved
    checked_in
    accommodated
    in_retreat
    checked_out
    completed
  */

  const status =
    application?.status || 'approved';

  const steps = [
    {
      key: 'pending',

      titleTh:
        'คำขอเข้าพักปฏิบัติธรรม',

      titleEn:
        'Retreat stay application',

      descTh:
        'ระบบได้รับคำขอของท่านแล้ว',

      descEn:
        'Your application has been received.',
    },

    {
      key: 'approved',

      titleTh:
        'อนุมัติการเข้าพักปฏิบัติธรรม',

      titleEn:
        'Retreat stay approved',

      descTh:
        'เจ้าหน้าที่ได้อนุมัติคำขอของท่านแล้ว',

      descEn:
        'Your retreat stay has been approved.',
    },

    {
      key: 'checked_in',

      titleTh:
        'ลงทะเบียน / เช็กอินที่จุดลงทะเบียน',

      titleEn:
        'Registration / Check-in',

      descTh:
        'สแกน QR Code ที่จุดลงทะเบียนเมื่อมาถึงวัด',

      descEn:
        'Scan the QR Code at the registration desk when you arrive.',
    },

    {
      key: 'accommodated',

      titleTh:
        'เข้าพักที่พักที่ได้รับมอบหมาย',

      titleEn:
        'Enter assigned accommodation',

      descTh:
        'สแกน QR Code ที่ที่พักของท่าน',

      descEn:
        'Scan the QR Code inside your assigned accommodation.',
    },

    {
      key: 'in_retreat',

      titleTh:
        'ปฏิบัติธรรม',

      titleEn:
        'Retreat practice',

      descTh:
        'เจ้าหน้าที่จะเปลี่ยนสถานะเมื่อท่านพร้อมปฏิบัติธรรม',

      descEn:
        'Staff will update this status when you are ready for retreat practice.',
    },

    {
      key: 'checked_out',

      titleTh:
        'การเข้าพักปฏิบัติธรรมครบกำหนดแล้ว',

      titleEn:
        'Retreat stay period completed',

      descTh:
        'เจ้าหน้าที่จะเปลี่ยนสถานะเมื่อครบกำหนดการเข้าพัก',

      descEn:
        'Staff will update this status when your retreat stay period ends.',
    },

    {
      key: 'completed',

      titleTh:
        'คืนกุญแจ / อุปกรณ์และเช็กเอาท์',

      titleEn:
        'Return keys / equipment and check out',

      descTh:
        'สแกน QR Code ที่จุดคืนกุญแจและอุปกรณ์',

      descEn:
        'Scan the QR Code at the key and equipment return desk.',
    },
  ];

  /*
    QR BUTTON

    approved
      -> step 3

    checked_in
      -> step 4

    checked_out
      -> step 7
  */

  const canScanAtStep = (index) => {
    if (
      index === 2 &&
      status === 'approved'
    ) {
      return true;
    }

    if (
      index === 3 &&
      status === 'checked_in'
    ) {
      return true;
    }

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

    window.location.href =
      '/checkin';
  };

  /*
    DATE
  */

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
        new Date(
          `${value}T00:00:00`
        )
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

  /*
    TIMELINE STATE
  */

  const resolvedStepState = (
    index
  ) => {
    /*
      pending
    */

    if (status === 'pending') {
      if (index === 0) {
        return 'current';
      }

      return 'pending';
    }

    /*
      approved
      1 + 2 completed
      3 current
    */

    if (status === 'approved') {
      if (index <= 1) {
        return 'completed';
      }

      if (index === 2) {
        return 'current';
      }

      return 'pending';
    }

    /*
      checked_in
      1-3 completed
      4 current
    */

    if (
      status === 'checked_in'
    ) {
      if (index <= 2) {
        return 'completed';
      }

      if (index === 3) {
        return 'current';
      }

      return 'pending';
    }

    /*
      accommodated
      1-4 completed
      5 current
    */

    if (
      status === 'accommodated'
    ) {
      if (index <= 3) {
        return 'completed';
      }

      if (index === 4) {
        return 'current';
      }

      return 'pending';
    }

    /*
      in_retreat
      1-5 completed
      6 current
    */

    if (
      status === 'in_retreat'
    ) {
      if (index <= 4) {
        return 'completed';
      }

      if (index === 5) {
        return 'current';
      }

      return 'pending';
    }

    /*
      checked_out
      1-6 completed
      7 current
    */

    if (
      status === 'checked_out'
    ) {
      if (index <= 5) {
        return 'completed';
      }

      if (index === 6) {
        return 'current';
      }

      return 'pending';
    }

    /*
      completed
      all completed
    */

    if (
      status === 'completed'
    ) {
      return 'completed';
    }

    return 'pending';
  };

  const approved =
    status !== 'pending';

  return (
    <>
      <style>{`

        /*
          IMPORTANT

          ไม่มี font-family ตรงนี้
          เพื่อให้รับ Font หลัก
          จากเว็บไซต์โดยอัตโนมัติ
        */

        .retreatPage {
          width: 100%;
          background: #fbfaf7;
          color: #2d2925;
        }

        .retreatContainer {
          max-width: 1180px;
          margin: 0 auto;
          padding:
            48px
            22px
            60px;
        }

        /*
          PAGE HEADER
        */

        .retreatPageHeader {
          text-align: center;
          margin-bottom: 30px;
        }

        .retreatPageTitle {
          margin:
            0
            0
            8px;

          font-size: 34px;
          line-height: 1.3;
          font-weight: 600;

          color: #30251a;
        }

        .retreatPageSubtitle {
          margin: 0;

          color: #74685d;

          font-size: 15px;

          line-height: 1.7;
        }

        /*
          CARD
        */

        .retreatCard {
          background: #ffffff;

          border:
            1px solid
            #e6e0d8;

          border-radius: 14px;

          box-shadow:
            0
            5px
            18px
            rgba(
              69,
              51,
              30,
              0.05
            );

          overflow: hidden;
        }

        /*
          APPLICATION
        */

        .retreatRequestCard {
          margin-bottom: 22px;
        }

        .retreatCardHeading {
          padding:
            16px
            22px;

          font-size: 17px;

          font-weight: 600;

          color: #68491f;

          border-bottom:
            1px solid
            #ece5dc;

          text-align: center;
        }

        .retreatRequestBody {
          display: grid;

          grid-template-columns:
            70px
            1fr
            auto;

          gap: 20px;

          align-items: center;

          padding:
            26px
            24px;
        }

        .retreatRequestIcon {
          width: 58px;
          height: 58px;

          border-radius: 50%;

          background:
            #f5f0e8;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 26px;

          color: #815a23;
        }

        .retreatRequestInfo {
          min-width: 0;

          text-align: center;
        }

        .retreatRequestTitle {
          font-size: 18px;

          font-weight: 600;

          color: #30291f;

          margin-bottom: 7px;
        }

        .retreatRequestDate {
          color: #6e665e;

          font-size: 14px;

          margin-bottom: 7px;
        }

        .retreatRequestCode {
          color: #82786e;

          font-size: 13px;
        }

        .retreatApprovedBadge {
          display:
            inline-flex;

          align-items:
            center;

          gap: 6px;

          padding:
            8px
            13px;

          border-radius:
            999px;

          background:
            #e5f4e2;

          color:
            #25833b;

          font-size:
            13px;

          font-weight:
            600;

          white-space:
            nowrap;
        }

        /*
          TRACKING
        */

        .retreatTrackingCard {
          padding:
            26px
            22px
            22px;
        }

        .retreatTrackingTitle {
          margin:
            0
            0
            28px;

          text-align:
            center;

          font-size:
            20px;

          font-weight:
            600;

          color:
            #30291f;
        }

        .retreatTimeline {
          position:
            relative;

          max-width:
            980px;

          margin:
            0 auto;
        }

        /*
          ROW
        */

        .retreatTimelineRow {
          position:
            relative;

          display:
            grid;

          grid-template-columns:
            54px
            minmax(
              0,
              1fr
            )
            220px;

          column-gap:
            18px;

          min-height:
            86px;
        }

        /*
          LINE
        */

        .retreatTimelineLine {
          position:
            absolute;

          width:
            2px;

          left:
            20px;

          top:
            32px;

          bottom:
            -10px;

          z-index:
            0;

          background:
            #dfdfdf;
        }

        .retreatTimelineLine.complete {
          background:
            #8fc895;
        }

        /*
          CIRCLE
        */

        .retreatStepCircle {
          position:
            relative;

          z-index:
            2;

          margin-left:
            5px;

          width:
            32px;

          height:
            32px;

          border-radius:
            50%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            14px;

          font-weight:
            600;
        }

        .retreatStepCircle.completed {
          background:
            #20963b;

          color:
            #ffffff;
        }

        .retreatStepCircle.current {
          background:
            #be8317;

          color:
            #ffffff;
        }

        .retreatStepCircle.pending {
          background:
            #e6e6e6;

          color:
            #777777;
        }

        /*
          STEP CONTENT
        */

        .retreatStepMain {
          padding:
            3px
            0
            23px;

          text-align:
            center;
        }

        .retreatStepTitle {
          font-size:
            17px;

          font-weight:
            600;

          color:
            #302b26;

          margin-bottom:
            6px;
        }

        .retreatStepDescription {
          font-size:
            14px;

          color:
            #746c64;

          line-height:
            1.7;
        }

        /*
          RIGHT STATUS
        */

        .retreatStepRight {
          display:
            flex;

          flex-direction:
            column;

          align-items:
            flex-start;

          gap:
            8px;

          padding-top:
            2px;
        }

        .retreatStatusBadge {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            5px;

          padding:
            7px
            11px;

          border-radius:
            999px;

          font-size:
            12px;

          font-weight:
            600;

          white-space:
            nowrap;
        }

        .retreatStatusBadge.completed {
          background:
            #e4f5e5;

          color:
            #25893c;
        }

        .retreatStatusBadge.current {
          background:
            #fff0cf;

          color:
            #a66d07;
        }

        .retreatStatusBadge.pending {
          background:
            #efefef;

          color:
            #858585;
        }

        /*
          QR BUTTON
        */

        .retreatScanButton {
          width:
            220px;

          min-height:
            42px;

          border:
            0;

          border-radius:
            7px;

          padding:
            11px
            18px;

          cursor:
            pointer;

          background:
            #b77a0d;

          color:
            #ffffff;

          font: inherit;

          font-size:
            14px;

          font-weight:
            600;

          transition:
            transform
            0.15s ease,
            opacity
            0.15s ease;
        }

        .retreatScanButton:hover {
          opacity:
            0.92;

          transform:
            translateY(
              -1px
            );
        }

        /*
          HELP
        */

        .retreatHelpBox {
          max-width:
            1000px;

          margin:
            12px
            auto
            0;

          padding:
            15px
            18px;

          border-radius:
            8px;

          background:
            #faf7f1;

          border:
            1px solid
            #e7ddce;

          color:
            #755434;

          font-size:
            14px;

          text-align:
            center;

          line-height:
            1.7;
        }

        /*
          TABLET + MOBILE
        */

        @media (
          max-width: 760px
        ) {

          .retreatContainer {
            padding:
              34px
              14px
              42px;
          }

          .retreatPageTitle {
            font-size:
              27px;
          }

          .retreatPageSubtitle {
            font-size:
              14px;
          }

          .retreatRequestBody {
            grid-template-columns:
              58px
              1fr;

            gap:
              12px;

            padding:
              20px
              16px;
          }

          .retreatRequestIcon {
            width:
              50px;

            height:
              50px;

            font-size:
              23px;
          }

          .retreatRequestInfo {
            text-align:
              left;
          }

          .retreatApprovedBadge {
            grid-column:
              2;

            justify-self:
              start;
          }

          .retreatTrackingCard {
            padding:
              22px
              14px
              18px;
          }

          .retreatTrackingTitle {
            text-align:
              left;

            font-size:
              19px;
          }

          .retreatTimelineRow {
            grid-template-columns:
              44px
              minmax(
                0,
                1fr
              );

            column-gap:
              8px;

            min-height:
              106px;
          }

          .retreatTimelineLine {
            left:
              20px;
          }

          .retreatStepMain {
            text-align:
              left;

            padding-bottom:
              10px;
          }

          .retreatStepRight {
            grid-column:
              2;

            padding:
              0
              0
              22px;

            margin-top:
              -4px;
          }

          .retreatScanButton {
            width:
              100%;
          }

          .retreatHelpBox {
            text-align:
              left;

            margin-top:
              8px;
          }
        }

      `}</style>

      <div className="retreatPage">

        <main className="retreatContainer">

          {/* PAGE TITLE */}

          <header className="retreatPageHeader">

            <h1 className="retreatPageTitle">
              {th
                ? 'การเข้าพักปฏิบัติธรรมของฉัน'
                : 'My Retreat Stay'}
            </h1>

            <p className="retreatPageSubtitle">
              {th
                ? 'ติดตามสถานะการเข้าพักปฏิบัติธรรมของท่านแบบเรียลไทม์'
                : 'Track the status of your retreat stay in real time.'}
            </p>

          </header>

          {/* APPLICATION CARD */}

          <section
            className="
              retreatCard
              retreatRequestCard
            "
          >

            <div className="retreatCardHeading">
              {th
                ? 'รายการคำขอของฉัน'
                : 'My application'}
            </div>

            <div className="retreatRequestBody">

              <div className="retreatRequestIcon">
                🗓
              </div>

              <div className="retreatRequestInfo">

                <div className="retreatRequestTitle">
                  {th
                    ? 'เข้าพักปฏิบัติธรรม'
                    : 'Retreat stay'}
                </div>

                <div className="retreatRequestDate">
                  {formatDate(
                    startDate
                  )}
                  {' – '}
                  {formatDate(
                    endDate
                  )}
                </div>

                <div className="retreatRequestCode">
                  {th
                    ? 'รหัสคำขอ: '
                    : 'Application ID: '}

                  {requestCode}
                </div>

              </div>

              {approved && (
                <div className="retreatApprovedBadge">
                  ✓{' '}
                  {th
                    ? 'อนุมัติแล้ว'
                    : 'Approved'}
                </div>
              )}

            </div>

          </section>

          {/* TRACKING */}

          <section
            className="
              retreatCard
              retreatTrackingCard
            "
          >

            <h2 className="retreatTrackingTitle">
              {th
                ? 'สถานะการเข้าพักปฏิบัติธรรม'
                : 'Retreat stay status'}
            </h2>

            <div className="retreatTimeline">

              {steps.map(
                (
                  step,
                  index
                ) => {

                  const state =
                    resolvedStepState(
                      index
                    );

                  const completed =
                    state ===
                    'completed';

                  const current =
                    state ===
                    'current';

                  const showScan =
                    canScanAtStep(
                      index
                    );

                  return (
                    <div
                      className="retreatTimelineRow"
                      key={
                        step.key
                      }
                    >

                      {/* LEFT */}

                      <div>

                        {index <
                          steps.length -
                            1 && (
                          <div
                            className={
                              `retreatTimelineLine ${
                                completed
                                  ? 'complete'
                                  : ''
                              }`
                            }
                          />
                        )}

                        <div
                          className={
                            `retreatStepCircle ${state}`
                          }
                        >
                          {completed
                            ? '✓'
                            : index +
                              1}
                        </div>

                      </div>

                      {/* CENTER */}

                      <div className="retreatStepMain">

                        <div className="retreatStepTitle">
                          {index +
                            1}
                          .{' '}

                          {th
                            ? step.titleTh
                            : step.titleEn}
                        </div>

                        <div className="retreatStepDescription">
                          {th
                            ? step.descTh
                            : step.descEn}
                        </div>

                      </div>

                      {/* RIGHT */}

                      <div className="retreatStepRight">

                        <div
                          className={
                            `retreatStatusBadge ${state}`
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
                              ⊙{' '}
                              {th
                                ? 'รอการดำเนินการ'
                                : 'Action required'}
                            </>
                          )}

                          {state ===
                            'pending' && (
                            <>
                              •{' '}
                              {th
                                ? 'รอการดำเนินการ'
                                : 'Pending'}
                            </>
                          )}

                        </div>

                        {showScan && (

                          <button
                            type="button"
                            className="retreatScanButton"
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
                }
              )}

            </div>

            {/* HELP */}

            <div className="retreatHelpBox">
              ⓘ{' '}
              {th
                ? 'หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่ หรือไลน์วัดพุทธอุทยานนาเทิง'
                : 'If you need assistance, please contact monastery staff or Nathoeng LINE.'}
            </div>

          </section>

        </main>

        {/*
          IMPORTANT

          ไม่มี Footer ตรงนี้แล้ว

          เพราะเว็บไซต์มี Footer หลัก
          อยู่ใน App.jsx / Layout อยู่แล้ว
        */}

      </div>
    </>
  );
}

export default MyRetreatStay;