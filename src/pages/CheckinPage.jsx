import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import { Html5Qrcode } from 'html5-qrcode';


function CheckinPage({
  lang,
  goToPage,
  user,
  handleLineLogin
}) {
  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState('');

  const [errorTitle, setErrorTitle] =
    useState('');

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [scannerMessage, setScannerMessage] =
    useState('');

  const scannerRef = useRef(null);

  const scanLockedRef = useRef(false);

  const fileInputRef = useRef(null);

  const th = lang === 'th';


  /* =========================================================
     READ TOKEN FROM CURRENT PAGE URL
     ========================================================= */

  const getQrToken = () => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get(
      'checkin_token'
    );
  };


  /* =========================================================
     READ TOKEN FROM QR CONTENT

     รองรับทั้ง:
     1. QR ที่เก็บเฉพาะ token
     2. URL ที่มี ?checkin_token=xxxxx
     ========================================================= */

  const extractTokenFromQr = (
    qrText
  ) => {
    if (!qrText) {
      return '';
    }

    const text =
      qrText.trim();

    try {
      const url =
        new URL(text);

      const token =
        url.searchParams.get(
          'checkin_token'
        );

      if (token) {
        return token;
      }

      /*
       รองรับกรณีในอนาคต เช่น
       #checkin-page?checkin_token=xxxxx
      */

      if (
        url.hash &&
        url.hash.includes(
          'checkin_token='
        )
      ) {
        const hashQuery =
          url.hash.split('?')[1];

        if (hashQuery) {
          const hashParams =
            new URLSearchParams(
              hashQuery
            );

          const hashToken =
            hashParams.get(
              'checkin_token'
            );

          if (hashToken) {
            return hashToken;
          }
        }
      }

    } catch {
      /*
       ถ้าไม่ใช่ URL
       ให้ถือว่า QR นั้นอาจเป็น token โดยตรง
      */
    }

    return text;
  };


  const getQrErrorPresentation = (data) => {
    const code = data?.code || '';

    if (code === 'WRONG_ACCOMMODATION') {
      const assigned =
        data?.assignedAccommodation || '-';

      const scanned =
        data?.scannedAccommodation || '-';

      return {
        title: th
          ? 'QR Code ไม่ตรงกับที่พักที่ได้รับการจัดสรร'
          : 'QR Code Does Not Match Assigned Accommodation',
        message: th
          ? `ที่พักที่ได้รับ: ${assigned}\nQR ที่สแกน: ${scanned}\nกรุณาสแกน QR Code ของที่พักที่ได้รับการจัดสรรเท่านั้น`
          : `Assigned accommodation: ${assigned}\nScanned QR: ${scanned}\nPlease scan only the QR code for your assigned accommodation.`
      };
    }

    if (code === 'WRONG_QR_TYPE_EXPECT_RETURN') {
      return {
        title: th
          ? 'QR Code นี้ไม่ใช่จุดคืนกุญแจ/อุปกรณ์'
          : 'This Is Not the Return-Point QR Code',
        message: th
          ? 'ขณะนี้อยู่ในขั้นตอนคืนกุญแจ/อุปกรณ์ กรุณาสแกน QR Code ที่จุดคืนกุญแจ/อุปกรณ์ของวัด'
          : 'You are at the return stage. Please scan the monastery return-point QR code.'
      };
    }

    if (code === 'WRONG_QR_TYPE_EXPECT_ACCOMMODATION') {
      return {
        title: th
          ? 'QR Code นี้ยังไม่ใช่ขั้นตอนที่ต้องสแกน'
          : 'This QR Code Is Not for the Current Step',
        message: th
          ? 'กรุณาสแกน QR Code ของที่พักที่เจ้าหน้าที่จัดสรรให้ก่อน แล้วจึงดำเนินขั้นตอนถัดไป'
          : 'Please scan the QR code for your assigned accommodation before proceeding to the next step.'
      };
    }

    if (code === 'WRONG_QR_TYPE_EXPECT_REGISTRATION') {
      return {
        title: th
          ? 'กรุณาลงทะเบียนเข้าพักก่อน'
          : 'Please Complete Registration First',
        message: th
          ? 'QR Code ที่สแกนไม่ตรงกับขั้นตอนปัจจุบัน กรุณาสแกน QR Code ที่จุดลงทะเบียนเข้าพักก่อน'
          : 'The scanned QR code does not match the current step. Please scan the registration-point QR code first.'
      };
    }

    if (code === 'RETURN_NOT_READY') {
      return {
        title: th
          ? 'ยังไม่ถึงขั้นตอนคืนกุญแจ/อุปกรณ์'
          : 'Return Step Is Not Yet Available',
        message: th
          ? 'การเข้าพักยังไม่ถึงขั้นคืนกุญแจ/อุปกรณ์ กรุณารอเจ้าหน้าที่ยืนยันว่าการเข้าพักปฏิบัติครบกำหนดแล้ว'
          : 'Your stay has not yet reached the return stage. Please wait for staff to confirm that the retreat stay period is completed.'
      };
    }

    if (code === 'STAY_ALREADY_COMPLETED') {
      return {
        title: th
          ? 'การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์แล้ว'
          : 'Retreat Stay Already Completed',
        message: th
          ? 'รายการนี้เสร็จสมบูรณ์แล้ว ไม่จำเป็นต้องสแกน QR Code เพิ่ม'
          : 'This retreat stay is already completed. No further QR scan is required.'
      };
    }

    if (
      code === 'ACCOMMODATION_ALREADY_CONFIRMED' ||
      code === 'ACCOMMODATION_ALREADY_PROCESSED'
    ) {
      return {
        title: th
          ? 'ยืนยันที่พักเรียบร้อยแล้ว'
          : 'Accommodation Already Confirmed',
        message: th
          ? 'รายการนี้ยืนยันที่พักเรียบร้อยแล้ว ไม่จำเป็นต้องสแกน QR ที่พักซ้ำ'
          : 'Accommodation has already been confirmed for this retreat stay. No repeat scan is required.'
      };
    }

    if (code === 'ACCOMMODATION_NOT_ASSIGNED') {
      return {
        title: th
          ? 'ยังไม่ได้รับการจัดสรรที่พัก'
          : 'Accommodation Not Yet Assigned',
        message: th
          ? 'เจ้าหน้าที่ยังไม่ได้จัดสรรสถานที่พัก กรุณาติดต่อเจ้าหน้าที่ก่อนสแกน QR Code ที่พัก'
          : 'Accommodation has not yet been assigned. Please contact monastery staff before scanning an accommodation QR code.'
      };
    }

    if (code === 'NO_CHECKED_IN_BOOKING') {
      return {
        title: th
          ? 'ยังไม่สามารถยืนยันเข้าที่พักได้'
          : 'Accommodation Confirmation Unavailable',
        message: th
          ? 'ไม่พบรายการที่อยู่ในขั้นรอยืนยันเข้าที่พัก กรุณาตรวจสอบสถานะการเข้าพักของท่าน'
          : 'No retreat stay is currently waiting for accommodation confirmation. Please check your stay status.'
      };
    }

    if (code === 'NO_RETURN_ELIGIBLE_BOOKING') {
      return {
        title: th
          ? 'ยังไม่สามารถยืนยันการคืนได้'
          : 'Return Confirmation Unavailable',
        message: th
          ? 'ไม่พบรายการที่อยู่ในขั้นพร้อมคืนกุญแจ/อุปกรณ์ กรุณาตรวจสอบสถานะการเข้าพักของท่าน'
          : 'No retreat stay is currently ready for return confirmation. Please check your stay status.'
      };
    }

    if (code === 'RETURN_ALREADY_PROCESSED') {
      return {
        title: th
          ? 'ยืนยันการคืนเรียบร้อยแล้ว'
          : 'Return Already Confirmed',
        message: th
          ? 'รายการนี้ได้รับการยืนยันการคืนเรียบร้อยแล้ว ไม่จำเป็นต้องสแกนซ้ำ'
          : 'The return has already been confirmed. No repeat scan is required.'
      };
    }

    if (code === 'NO_ELIGIBLE_BOOKING') {
      return {
        title: th
          ? 'ยังไม่สามารถลงทะเบียนเข้าพักได้'
          : 'Registration Not Yet Available',
        message: th
          ? 'วันนี้ยังไม่มีรายการเข้าพักปฏิบัติธรรมที่ได้รับอนุมัติและถึงกำหนดลงทะเบียน กรุณาติดต่อเจ้าหน้าที่วัด'
          : 'There is no approved retreat stay eligible for registration today. Please contact monastery staff.'
      };
    }

    if (code === 'INVALID_QR') {
      return {
        title: th
          ? 'QR Code ไม่ถูกต้อง'
          : 'Invalid QR Code',
        message: th
          ? 'QR Code นี้ไม่ใช่ QR Code ที่ใช้กับระบบเข้าพักปฏิบัติธรรม กรุณาสแกน QR Code ของวัดที่ตรงกับขั้นตอนปัจจุบัน'
          : 'This QR code is not valid for the retreat-stay system. Please scan the monastery QR code for your current step.'
      };
    }

    if (code === 'MULTIPLE_BOOKINGS') {
      return {
        title: th
          ? 'พบรายการเข้าพักมากกว่าหนึ่งรายการ'
          : 'Multiple Retreat Stays Found',
        message: th
          ? 'ระบบพบรายการที่อาจดำเนินการได้มากกว่าหนึ่งรายการ กรุณาติดต่อเจ้าหน้าที่วัด'
          : 'More than one eligible retreat stay was found. Please contact monastery staff.'
      };
    }

    return {
      title: th
        ? 'ไม่สามารถดำเนินการด้วย QR Code นี้ได้'
        : 'Unable to Process This QR Code',
      message:
        data?.message ||
        (th
          ? 'กรุณาตรวจสอบ QR Code และสถานะการเข้าพัก แล้วลองอีกครั้ง'
          : 'Please check the QR code and your retreat-stay status, then try again.')
    };
  };


  /* =========================================================
     STOP CAMERA
     ========================================================= */

  const stopScanner =
    async () => {

      const scanner =
        scannerRef.current;

      if (!scanner) {
        return;
      }

      try {
        await scanner.stop();
      } catch {
        /*
         scanner อาจหยุดไปแล้ว
         จึงไม่จำเป็นต้องแสดง error
        */
      }

      try {
        await scanner.clear();
      } catch {
        // ignore
      }

      scannerRef.current =
        null;
    };


  /* =========================================================
     CHECK-IN
     ========================================================= */

  const handleCheckin =
    async (
      providedToken = null
    ) => {

      const token =
        providedToken ||
        getQrToken() ||
        sessionStorage.getItem(
          'pending_checkin_token'
        ) ||
        localStorage.getItem(
          'pending_checkin_token'
        );


      /*
       ยังไม่ได้ Login LINE
      */

      if (!user) {
        if (!token) {
          setError(
            th
              ? 'กรุณาสแกน QR Code ที่จุดลงทะเบียนของวัดก่อนเข้าสู่ระบบ'
              : 'Please scan the QR code at the monastery registration point before logging in.'
          );

          return;
        }

        sessionStorage.setItem(
          'after_login_page',
          'checkin-page'
        );

        sessionStorage.setItem(
          'pending_checkin_token',
          token
        );

        /*
         สำรองไว้ใน localStorage
         สำหรับ browser มือถือบางรุ่น
         ที่อาจเสีย sessionStorage
         ระหว่าง LINE Login
        */

        localStorage.setItem(
          'after_login_page',
          'checkin-page'
        );

        localStorage.setItem(
          'pending_checkin_token',
          token
        );

        handleLineLogin();

        return;
      }


      if (!token) {
        setError(
          th
            ? 'ไม่พบข้อมูล QR Check-in กรุณากดปุ่มสแกน QR Code และสแกน QR ที่จุดลงทะเบียนของวัด'
            : 'Check-in QR information was not found. Please scan the QR code at the monastery registration point.'
        );

        return;
      }


      setLoading(true);
      setError('');
      setErrorTitle('');
      setScannerMessage('');


      try {
        const response =
          await fetch(
            '/api/checkin-by-qr',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              credentials:
                'include',

              body:
                JSON.stringify({
                  token
                })
            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {
          const presentation =
            getQrErrorPresentation(
              data
            );

          setErrorTitle(
            presentation.title
          );

          throw new Error(
            presentation.message
          );
        }


        sessionStorage.removeItem(
          'pending_checkin_token'
        );

        sessionStorage.removeItem(
          'after_login_page'
        );

        localStorage.removeItem(
          'pending_checkin_token'
        );

        localStorage.removeItem(
          'after_login_page'
        );


        setResult(
          data.booking
        );

      } catch (err) {

        console.error(
          'QR check-in error:',
          err
        );


        setError(
          err.message ||
          (
            th
              ? 'เกิดข้อผิดพลาดในการลงทะเบียนเข้าพัก'
              : 'Stay registration error'
          )
        );

      } finally {

        setLoading(false);

      }
    };



  /* =========================================================
     SCAN QR FROM PHOTO
     ใช้เป็นทางสำรองกรณี live camera มีปัญหา
     ========================================================= */

  const handleQrImageFile =
    async (event) => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      event.target.value = '';

      setError('');
      setScannerMessage(
        th
          ? 'กำลังอ่าน QR Code จากภาพ...'
          : 'Reading QR code from image...'
      );

      try {

        const imageScanner =
          new Html5Qrcode(
            'qr-file-reader'
          );

        const decodedText =
          await imageScanner.scanFile(
            file,
            true
          );

        try {
          await imageScanner.clear();
        } catch {
          // ignore
        }

        const token =
          extractTokenFromQr(
            decodedText
          );

        if (!token) {
          throw new Error(
            th
              ? 'ไม่พบข้อมูล Check-in ใน QR Code นี้'
              : 'No check-in information was found in this QR code.'
          );
        }

        setScannerMessage(
          th
            ? 'อ่าน QR Code สำเร็จ'
            : 'QR code detected'
        );

        await handleCheckin(
          token
        );

      } catch (err) {

        console.error(
          'QR image scan error:',
          err
        );

        setScannerMessage('');

        setError(
          th
            ? 'ไม่สามารถอ่าน QR Code จากภาพได้ กรุณาถ่ายให้เห็น QR Code ชัดเจนเต็มภาพ แล้วลองใหม่อีกครั้ง'
            : 'Unable to read the QR code from the image. Please take a clear photo showing the full QR code and try again.'
        );
      }
    };


  /* =========================================================
     START CAMERA WHEN scannerOpen = true

     ใช้ config เดิมที่เคยเปิดกล้องได้จริง
     และ clear scanner เก่าก่อนเริ่มใหม่
     ========================================================= */

  useEffect(() => {

    if (!scannerOpen) {
      return;
    }


    let cancelled = false;

    scanLockedRef.current =
      false;


    const startCamera =
      async () => {

        setError('');

        setScannerMessage(
          th
            ? 'กำลังเปิดกล้อง...'
            : 'Opening camera...'
        );


        try {

          /*
           เคลียร์ scanner รอบก่อน ถ้ามีค้างอยู่
          */

          await stopScanner();

          if (cancelled) {
            return;
          }


          const scanner =
            new Html5Qrcode(
              'qr-reader'
            );

          scannerRef.current =
            scanner;


          /*
           กลับมาใช้ config เดิม:
           config ชุดนี้เคยเปิดกล้องบนเครื่องนี้ได้
          */

          await scanner.start(

            {
              facingMode:
                'environment'
            },

            {
              fps: 10,

              qrbox: {
                width: 240,
                height: 240
              }
            },

            async (
              decodedText
            ) => {

              if (
                scanLockedRef.current
              ) {
                return;
              }


              scanLockedRef.current =
                true;


              const token =
                extractTokenFromQr(
                  decodedText
                );


              if (!token) {

                scanLockedRef.current =
                  false;

                setScannerMessage(
                  th
                    ? 'ไม่พบข้อมูล Check-in ใน QR Code นี้'
                    : 'No check-in information was found in this QR code.'
                );

                return;
              }


              setScannerMessage(
                th
                  ? 'อ่าน QR Code สำเร็จ'
                  : 'QR code detected'
              );


              await stopScanner();

              if (cancelled) {
                return;
              }


              setScannerOpen(
                false
              );


              await handleCheckin(
                token
              );
            },

            () => {
              /*
               callback นี้ทำงานบ่อยมาก
               ตอนกล้องยังหา QR ไม่เจอ
               จึงไม่แสดง error
              */
            }
          );


          if (cancelled) {
            await stopScanner();
            return;
          }


          setScannerMessage(
            th
              ? 'วาง QR Code ให้อยู่ภายในกรอบ'
              : 'Position the QR code inside the frame.'
          );


        } catch (err) {

          console.error(
            'Camera error:',
            err
          );


          /*
           สำคัญมาก:
           ถ้าเปิดกล้องล้มเหลว ต้อง clear instance ทิ้ง
           ไม่เช่นนั้นปุ่ม "สแกนอีกครั้ง" อาจดูเหมือนกดไม่ได้
          */

          await stopScanner();


          if (cancelled) {
            return;
          }


          setScannerOpen(
            false
          );


          const cameraDetail =
            err?.name ||
            err?.message ||
            'Camera start failed';


          setError(
            th
              ? `ไม่สามารถเปิดกล้องสแกนสดได้ (${cameraDetail}) กรุณากด “สแกนอีกครั้ง” หรือใช้ปุ่ม “ถ่ายภาพ QR Code”`
              : `Unable to open the live QR scanner (${cameraDetail}). Please tap “Scan Again” or use “Take QR Photo”.`
          );

        }
      };


    const timer =
      setTimeout(
        startCamera,
        150
      );


    return () => {

      cancelled = true;

      clearTimeout(
        timer
      );

      stopScanner();

    };

  }, [scannerOpen]);


  /*
   บังคับ restart จริง
   ปิดก่อน แล้วค่อยเปิดใหม่ใน tick ถัดไป
  */

  const restartScanner =
    async () => {

      setError('');
      setErrorTitle('');
      setScannerMessage('');

      await stopScanner();

      setScannerOpen(
        false
      );

      setTimeout(
        () => {

          scanLockedRef.current =
            false;

          setScannerOpen(
            true
          );

        },
        100
      );
    };


  /* =========================================================
     RETURN FROM LINE LOGIN

     ถ้ามี pending token
     ให้ดำเนินการต่ออัตโนมัติ
     ========================================================= */

  useEffect(() => {

    if (!user) {
      return;
    }


    const pendingToken =

      sessionStorage.getItem(
        'pending_checkin_token'
      ) ||

      localStorage.getItem(
        'pending_checkin_token'
      );


    if (
      pendingToken &&
      !result &&
      !loading
    ) {

      handleCheckin(
        pendingToken
      );

    }

  }, [user]);


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="guidePage">

      <div
        className="guideContainer"
        style={{
          maxWidth: '700px'
        }}
      >


        {/* BACK */}

        <button
          className="backButton"
          onClick={() =>
            goToPage(
              'my-stays'
            )
          }
        >
          {th
            ? '← กลับสู่การเข้าพักปฏิบัติธรรมของฉัน'
            : '← Back to My Retreat Stays'}
        </button>


        {/* HEADER */}

        <div
          style={{
            textAlign: 'center',
            marginTop: '35px'
          }}
        >

          <div
            style={{
              fontSize: '48px',
              marginBottom: '10px',
              color: '#9b7226'
            }}
          >
            ☸
          </div>


          <span
            className="eyebrow"
          >
            {th
              ? 'จุดลงทะเบียนเข้าพักปฏิบัติธรรม'
              : 'RETREAT REGISTRATION'}
          </span>


          <h1>
            {th
              ? 'ลงทะเบียนเข้าพักปฏิบัติธรรม'
              : 'Retreat Stay Registration'}
          </h1>


          <p
            style={{
              color: '#625d55',
              lineHeight: '1.8',
              maxWidth: '560px',
              margin:
                '0 auto'
            }}
          >
            {th
              ? 'เมื่อเดินทางมาถึงวัด กรุณาสแกน QR Code ที่จุดลงทะเบียน เพื่อยืนยันการเข้าพักปฏิบัติธรรม'
              : 'When you arrive at the monastery, please scan the QR code at the registration point to confirm your retreat stay.'}
          </p>

        </div>


        {/* =====================================================
            QR SCANNER BUTTON
            ===================================================== */}

        {!result &&
          !scannerOpen && (

          <div
            style={{
              marginTop: '32px',
              padding: '30px',
              textAlign: 'center',
              background: '#faf9f6',
              border:
                '1px solid #e3ddd3'
            }}
          >

            <div
              style={{
                width: '70px',
                height: '70px',
                margin:
                  '0 auto 18px',
                border:
                  '1px solid #d9c8a4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#9b7226',
                background: '#fff'
              }}
            >
              ▦
            </div>


            <h3
              style={{
                marginBottom: '10px'
              }}
            >
              {th
                ? 'สแกน QR Code ของวัด'
                : 'Scan Monastery QR Code'}
            </h3>


            <p
              style={{
                color: '#6f6960',
                lineHeight: '1.7'
              }}
            >
              {th
                ? 'กดปุ่มด้านล่างเพื่อเปิดกล้อง แล้วสแกน QR Code ที่จุดลงทะเบียนเข้าพัก'
                : 'Open your camera and scan the QR code displayed at the monastery registration point.'}
            </p>


            <button
              onClick={restartScanner}
              className="primaryContactBtn"
              style={{
                marginTop: '15px',
                padding:
                  '13px 24px',
                cursor: 'pointer'
              }}
            >
              📷{' '}
              {th
                ? 'เปิดกล้องสแกน QR Code'
                : 'Open QR Scanner'}
            </button>

          </div>

        )}


        {/* =====================================================
            CAMERA
            ===================================================== */}

        {scannerOpen && (

          <div
            style={{
              marginTop: '30px',
              padding: '22px',
              border:
                '1px solid #e3ddd3',
              background: '#fff'
            }}
          >

            <h3
              style={{
                textAlign: 'center',
                marginTop: 0
              }}
            >
              {th
                ? 'สแกน QR Code'
                : 'Scan QR Code'}
            </h3>


            <p
              style={{
                textAlign: 'center',
                color: '#777',
                fontSize: '14px'
              }}
            >
              {scannerMessage}
            </p>


            <div
              id="qr-reader"
              style={{
                width: '100%',
                maxWidth: '480px',
                margin:
                  '20px auto'
              }}
            />


            <div
              style={{
                textAlign: 'center'
              }}
            >

              <button
                onClick={async () => {

                  await stopScanner();

                  setScannerOpen(
                    false
                  );

                }}
                style={{
                  padding:
                    '10px 20px',
                  background: '#fff',
                  border:
                    '1px solid #bbb',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'ยกเลิกการสแกน'
                  : 'Cancel Scan'}
              </button>

            </div>

          </div>

        )}



        {/* =====================================================
            PHOTO FALLBACK

            ใช้ label -> input โดยตรง
            ไม่เรียก input.click() หลัง await
            เพื่อให้ Android / LINE browser เปิดกล้องได้แน่นอนกว่า
            ===================================================== */}

        {!result && (

          <div
            style={{
              marginTop: '18px',
              textAlign: 'center'
            }}
          >

            <input
              id="qr-photo-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleQrImageFile}
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />

            <div
              id="qr-file-reader"
              style={{
                display: 'none'
              }}
            />


            <label
              htmlFor="qr-photo-input"
              onClick={() => {

                setError('');
                setScannerMessage('');

                stopScanner();

                setScannerOpen(
                  false
                );
              }}
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: '#fff',
                border: '1px solid #c5a880',
                color: '#8f6a27',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📷{' '}
              {th
                ? 'ถ่ายภาพ QR Code'
                : 'Take QR Photo'}
            </label>


            <p
              style={{
                marginTop: '10px',
                color: '#777',
                fontSize: '13px',
                lineHeight: '1.6'
              }}
            >
              {th
                ? 'ถ้าสแกนสดไม่ได้ ให้ใช้ปุ่มนี้เปิดกล้องถ่าย QR Code โดยตรง'
                : 'If live scanning is unavailable, use this button to take a QR photo directly.'}
            </p>

          </div>

        )}


        {/* =====================================================
            PROCESSING
            ===================================================== */}

        {loading && (

          <div
            style={{
              marginTop: '30px',
              padding: '25px',
              textAlign: 'center',
              background: '#faf7ef'
            }}
          >

            <div
              style={{
                fontSize: '30px'
              }}
            >
              ◌
            </div>

            <p>
              {th
                ? 'กำลังตรวจสอบข้อมูลและลงทะเบียนเข้าพัก...'
                : 'Verifying your information and registering your stay...'}
            </p>

          </div>

        )}


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (

          <div
            style={{
              marginTop: '30px',
              padding: '25px',
              border:
                '1px solid #efc7c7',
              background: '#fff7f7',
              textAlign: 'center'
            }}
          >

            <h3
              style={{
                color: '#c62828'
              }}
            >
              {errorTitle ||
                (th
                  ? 'ไม่สามารถดำเนินการได้'
                  : 'Unable to Continue')}
            </h3>


            <p
              style={{
                lineHeight: '1.7',
                whiteSpace: 'pre-line'
              }}
            >
              {error}
            </p>


            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >

              <button
                type="button"
                onClick={restartScanner}
                className="primaryContactBtn"
              >
                📷{' '}
                {th
                  ? 'สแกนอีกครั้ง'
                  : 'Scan Again'}
              </button>


              <label
                htmlFor="qr-photo-input"
                onClick={() => {

                  setError('');
                  setScannerMessage('');

                  stopScanner();

                  setScannerOpen(
                    false
                  );
                }}
                style={{
                  padding:
                    '10px 18px',
                  background: '#fff',
                  border:
                    '1px solid #c5a880',
                  color: '#8f6a27',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📷{' '}
                {th
                  ? 'ถ่ายภาพ QR Code'
                  : 'Take QR Photo'}
              </label>


              <button
                onClick={() =>
                  goToPage(
                    'my-stays'
                  )
                }
                style={{
                  padding:
                    '10px 18px',
                  background: '#fff',
                  border:
                    '1px solid #c5a880',
                  color: '#8f6a27',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {th
                  ? 'ดูการเข้าพักปฏิบัติธรรมของฉัน'
                  : 'View My Retreat Stays'}
              </button>

            </div>

          </div>

        )}


        {/* =====================================================
            SUCCESS
            ===================================================== */}

        {result && (

          <div
            style={{
              marginTop: '30px',
              padding: '35px',
              background: '#eef6ed',
              border:
                '1px solid #cfe4cc',
              textAlign: 'center'
            }}
          >

            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fff',
                border:
                  '2px solid #8ead86',
                margin:
                  '0 auto 15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                color: '#2e7d32'
              }}
            >
              ✓
            </div>


            <h2
              style={{
                color: '#2e7d32'
              }}
            >
              {result.status === 'completed'
                ? (th
                    ? 'การเข้าพักปฏิบัติธรรมเสร็จสมบูรณ์แล้ว'
                    : 'Retreat Stay Completed')
                : result.status === 'accommodated'
                  ? (th
                      ? 'ยืนยันเข้าที่พักเรียบร้อยแล้ว'
                      : 'Accommodation Confirmed')
                  : (th
                      ? 'ลงทะเบียนเข้าพักเรียบร้อยแล้ว'
                      : 'Stay Registration Completed')}
            </h2>


            <p>
              <strong>
                {result.name}
              </strong>
            </p>


            <p>
              {result.startDate}
              {' → '}
              {result.endDate}
            </p>


            <p
              style={{
                marginTop: '20px',
                lineHeight: '1.8'
              }}
            >
              {result.status === 'completed'
                ? (th
                    ? 'ขอบคุณที่มาพักปฏิบัติธรรม ณ วัดพุทธอุทยานนาเทิง'
                    : 'Thank you for staying and practicing Dhamma at Buddhist Park Monastery of Nathoeng.')
                : result.status === 'accommodated'
                  ? (th
                      ? 'ยืนยันสถานที่พักเรียบร้อยแล้ว กรุณาเข้าพักตามสถานที่ที่ได้รับการจัดสรร และปฏิบัติตามคำแนะนำของเจ้าหน้าที่'
                      : 'Your accommodation has been confirmed. Please stay in the assigned accommodation and follow the monastery staff guidance.')
                  : (th
                      ? 'ลงทะเบียนเข้าพักเรียบร้อยแล้ว กรุณาติดต่อเจ้าหน้าที่เพื่อรับการจัดสรรสถานที่พัก และคำแนะนำสำหรับการเข้าพักปฏิบัติธรรม'
                      : 'Your stay registration is complete. Please contact monastery staff for accommodation assignment and retreat guidance.')}
            </p>


            <button
              onClick={() =>
                goToPage(
                  'my-stays'
                )
              }
              className="primaryContactBtn"
              style={{
                marginTop: '20px'
              }}
            >
              {result.status === 'completed'
                ? (th
                    ? 'ดูรายละเอียดการเข้าพักปฏิบัติธรรม'
                    : 'View Retreat Stay Details')
                : (th
                    ? 'ดูความคืบหน้าการเข้าพักปฏิบัติธรรม'
                    : 'View Retreat Stay Progress')}
            </button>

          </div>

        )}

      </div>

    </div>
  );
}


export default CheckinPage;