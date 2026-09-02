import React, { useState } from 'react';

function BookingPage({ lang, goToPage }) {
  const savedUser = localStorage.getItem('line_user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [retreatPurpose, setRetreatPurpose] = useState('');
  const [purposeOpen, setPurposeOpen] = useState(false);

  const th = lang === 'th';

  const purposeOptions = [
    { value: 'เพื่อรักษาศีล 5', th: '1. เพื่อรักษาศีล 5', en: '1. To observe the Five Precepts' },
    { value: 'เพื่อรักษาศีล 5 และฝึกสมาธิ', th: '2. เพื่อรักษาศีล 5 และฝึกสมาธิ', en: '2. To observe the Five Precepts and practice meditation' },
    { value: 'เพื่อรักษาศีล 8', th: '3. เพื่อรักษาศีล 8', en: '3. To observe the Eight Precepts' },
    { value: 'เพื่อฝึกฝนการพิจารณาเสือดำ', th: '4. เพื่อฝึกฝนการพิจารณาเสือดำ', en: '4. To practise contemplation of Suea Dam' },
    { value: 'เพื่อฝึกฝนหลักสูตรการย้ายบ้าน', th: '5. เพื่อฝึกฝนหลักสูตรการย้ายบ้าน', en: '5. To practise the Moving House course' },
    { value: 'custom', th: '6. เพื่อจุดประสงค์เฉพาะ ระบุ', en: '6. Other specific purpose' }
  ];

  const selectedPurposeOption =
    purposeOptions.find(
      (option) => option.value === retreatPurpose
    ) || null;

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!user || !user.lineUid) {
      alert(
        lang === 'en'
          ? 'Please login with LINE first.'
          : 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนทำการจอง'
      );

      goToPage('login-page');
      return;
    }

    if (!retreatPurpose) {
      alert(
        th
          ? 'กรุณาเลือกจุดประสงค์การปฏิบัติธรรม'
          : 'Please select a purpose of Dhamma practice.'
      );
      return;
    }

    setLoading(true);

    const formData = new FormData(event.target);

    const name = formData.get('name');
    const phone = formData.get('phone');
    const startDate = formData.get('start_date');
    const endDate = formData.get('end_date');

    const purposeChoice =
      formData.get('purpose_choice') || '';

    const customPurpose =
      String(
        formData.get('custom_purpose') || ''
      ).trim();

    const purpose =
      purposeChoice === 'custom'
        ? customPurpose
        : purposeChoice ||
          (lang === 'en'
            ? 'General Stay'
            : 'ปฏิบัติธรรมทั่วไป');

    try {
      // 1. บันทึก Booking ลง Supabase ผ่าน Backend
      const bookingResponse = await fetch(
        '/api/create-booking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineUid: user.lineUid,
            name,
            phone,
            startDate,
            endDate,
            purpose
          })
        }
      );

      const bookingData =
        await bookingResponse.json();

      if (
        !bookingResponse.ok ||
        !bookingData.success
      ) {
        throw new Error(
          bookingData.message ||
          'Unable to save booking'
        );
      }

      // 2. ส่งอีเมลแจ้งเตือนผ่าน Web3Forms
      formData.append(
        'access_key',
        'd80a991c-5b9f-4273-a730-8de806f45da3'
      );

      formData.append(
        'line_user_name',
        user.name || ''
      );

      formData.append(
        'line_uid',
        user.lineUid
      );

      formData.append(
        'booking_id',
        bookingData.booking.id
      );

      const web3Response = await fetch(
        'https://api.web3forms.com/submit',
        {
          method: 'POST',
          body: formData
        }
      );

      const web3Data =
        await web3Response.json();

      if (!web3Data.success) {
        console.error(
          'Web3Forms notification failed:',
          web3Data
        );

        alert(
          lang === 'en'
            ? 'Your booking was saved, but the email notification could not be sent.'
            : 'บันทึกการจองเรียบร้อยแล้ว แต่ระบบแจ้งเตือนทางอีเมลส่งไม่สำเร็จ'
        );
      }

      setSubmitted(true);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error(
        'Booking error:',
        error
      );

      alert(
        lang === 'en'
          ? error.message ||
            'An error occurred. Please try again.'
          : error.message ||
            'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guidePage bookingPage">
      <div className="guideContainer bookingContainer">

        <button
          className="backButton bookingBackButton"
          onClick={() => goToPage('home')}
        >
          {th
            ? '← กลับสู่หน้าหลัก'
            : '← Back to Home'}
        </button>

        <div className="bookingHero">
          <img
            src="/icons/lotus.svg"
            alt=""
            className="bookingHeroIcon"
            aria-hidden="true"
          />

          <span className="eyebrow">
            {th
              ? 'ระบบจองเข้าปฏิบัติธรรม'
              : 'MONASTERY STAY BOOKING'}
          </span>

          <h1>
            {th
              ? 'จองวันเข้าพักปฏิบัติธรรม'
              : 'Book Your Retreat Stay'}
          </h1>

          <div
            className="bookingHeroOrnament"
            aria-hidden="true"
          >
            <span></span>
            <img src="/icons/lotus.svg" alt="" />
            <span></span>
          </div>

          <p>
            {th
              ? 'กรุณากรอกข้อมูลเพื่อส่งคำขอเข้าพักปฏิบัติธรรม ทางวัดจะตรวจสอบรายละเอียดและแจ้งผลการอนุมัติผ่านระบบ Nathoeng Connect'
              : 'Please complete the form to request a retreat stay. The monastery will review your request and update you through Nathoeng Connect.'}
          </p>
        </div>

        {!user ? (
          <div className="bookingLoginBox">
            <img
              src="/icons/contact.svg"
              alt=""
              className="bookingLoginIcon"
              aria-hidden="true"
            />

            <h3>
              {th
                ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ'
                : 'Please sign in before booking'}
            </h3>

            <p>
              {th
                ? 'เพื่อยืนยันตัวตน ป้องกันข้อความขยะ และใช้สำหรับติดตามสถานะคำขอ กรุณาเข้าสู่ระบบด้วยบัญชี LINE'
                : 'Please sign in with LINE so your identity can be verified and your retreat request can be tracked.'}
            </p>

            <button
              onClick={() =>
                goToPage('login-page')
              }
              className="primaryContactBtn bookingLineBtn"
            >
              {th
                ? 'เข้าสู่ระบบด้วย LINE เพื่อทำการจอง'
                : 'Login with LINE to Book'}
            </button>
          </div>
        ) : submitted ? (
          <div className="bookingSuccessBox">
            <img
              src="/icons/lotus.svg"
              alt=""
              className="bookingSuccessIcon"
              aria-hidden="true"
            />

            <h2>
              {th
                ? 'ส่งคำขอเข้าพักเรียบร้อยแล้ว'
                : 'Retreat Request Submitted'}
            </h2>

            <p>
              {th
                ? 'ทางวัดได้รับคำขอของท่านแล้ว สามารถติดตามสถานะการพิจารณาและขั้นตอนการเข้าพักได้ที่ “การเข้าพักของฉัน”'
                : 'The monastery has received your request. You can follow its review and stay progress in “My Retreat Stays.”'}
            </p>

            <div className="bookingSuccessActions">
              <button
                onClick={() =>
                  goToPage('my-stays')
                }
                className="primaryContactBtn"
              >
                {th
                  ? 'ดูการเข้าพักของฉัน →'
                  : 'View My Retreat Stays →'}
              </button>

              <button
                onClick={() =>
                  goToPage('home')
                }
                className="bookingSecondaryBtn"
              >
                {th
                  ? 'กลับสู่หน้าหลัก'
                  : 'Back to Home'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bookingVerifiedCard">
              <div className="bookingProfileAvatar">
                {user.picture &&
                !profileImageError ? (
                  <img
                    src={user.picture}
                    alt={user.name || ''}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setProfileImageError(true)
                    }
                  />
                ) : (
                  <img
                    src="/icons/meditation.svg"
                    alt=""
                    className="bookingProfileFallback"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="bookingVerifiedText">
                <small>
                  {th
                    ? 'เข้าสู่ระบบแล้ว'
                    : 'SIGNED IN'}
                </small>

                <strong>
                  {user.name}
                </strong>

                <span>
                  {th
                    ? 'ยืนยันตัวตนผ่าน LINE เรียบร้อย'
                    : 'Identity verified with LINE'}
                </span>
              </div>

              <span className="bookingVerifiedBadge">
                ✓ LINE
              </span>
            </div>

            <form
              onSubmit={onSubmit}
              className="bookingForm"
            >
              <div className="bookingField bookingFieldFull">
                <div className="bookingFieldIcon" aria-hidden="true">
                  <img src="/icons/contact.svg" alt="" />
                </div>

                <div className="bookingFieldBody">
                  <label htmlFor="booking-name">
                    {th
                      ? 'ชื่อ - นามสกุล (หรือหัวหน้าคณะ) *'
                      : 'Full Name / Group Leader *'}
                  </label>

                  <input
                    id="booking-name"
                    type="text"
                    name="name"
                    defaultValue={
                      user.name || ''
                    }
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="bookingField bookingFieldFull">
                <div className="bookingFieldIcon" aria-hidden="true">
                  <img src="/icons/phone.svg" alt="" />
                </div>

                <div className="bookingFieldBody">
                  <label htmlFor="booking-phone">
                    {th
                      ? 'เบอร์โทรศัพท์ที่ติดต่อได้ *'
                      : 'Phone Number *'}
                  </label>

                  <input
                    id="booking-phone"
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="08xxxxxxxx"
                  />
                </div>
              </div>

              <div className="bookingDateGrid">
                <div className="bookingField">
                  <div className="bookingFieldIcon" aria-hidden="true">
                    <img src="/icons/calendar.svg" alt="" />
                  </div>

                  <div className="bookingFieldBody">
                    <label htmlFor="booking-start">
                      {th
                        ? 'วันที่เข้าพัก *'
                        : 'Start Date *'}
                    </label>

                    <input
                      id="booking-start"
                      type="date"
                      name="start_date"
                      required
                    />
                  </div>
                </div>

                <div className="bookingField">
                  <div className="bookingFieldIcon" aria-hidden="true">
                    <img src="/icons/calendar.svg" alt="" />
                  </div>

                  <div className="bookingFieldBody">
                    <label htmlFor="booking-end">
                      {th
                        ? 'วันสิ้นสุดการพัก *'
                        : 'End Date *'}
                    </label>

                    <input
                      id="booking-end"
                      type="date"
                      name="end_date"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bookingField bookingFieldFull bookingMessageField">
                <div className="bookingFieldIcon" aria-hidden="true">
                  <img src="/icons/dhamma-book.svg" alt="" />
                </div>

                <div className="bookingFieldBody">
                  <label htmlFor="booking-purpose">
                    {th
                      ? 'จุดประสงค์การปฏิบัติธรรม *'
                      : 'Purpose of Dhamma Practice *'}
                  </label>

                  <input
                    type="hidden"
                    name="purpose_choice"
                    value={retreatPurpose}
                  />

                  <div style={{ position: 'relative' }}>
                    <button
                      id="booking-purpose"
                      type="button"
                      onClick={() =>
                        setPurposeOpen((prev) => !prev)
                      }
                      aria-haspopup="listbox"
                      aria-expanded={purposeOpen}
                      style={{
                        width: '100%',
                        minHeight: '52px',
                        border: '1px solid #d8c9b5',
                        borderRadius: '10px',
                        background: '#fff',
                        padding: '0 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        color: retreatPurpose ? '#302d29' : '#9b958d',
                        fontSize: '15px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <span>
                        {selectedPurposeOption
                          ? (th
                              ? selectedPurposeOption.th
                              : selectedPurposeOption.en)
                          : (th
                              ? 'กรุณาเลือกจุดประสงค์'
                              : 'Please select a purpose')}
                      </span>

                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: '14px',
                          transform: purposeOpen
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                          transition: 'transform .18s ease'
                        }}
                      >
                        ▾
                      </span>
                    </button>

                    {purposeOpen && (
                      <div
                        role="listbox"
                        style={{
                          position: 'absolute',
                          zIndex: 30,
                          top: 'calc(100% + 8px)',
                          left: 0,
                          right: 0,
                          border: '1px solid #d8c9b5',
                          borderRadius: '12px',
                          background: '#fff',
                          boxShadow: '0 14px 30px rgba(54, 40, 22, .12)',
                          overflow: 'hidden'
                        }}
                      >
                        {purposeOptions.map((option, index) => {
                          const active =
                            option.value === retreatPurpose;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => {
                                setRetreatPurpose(option.value);
                                setPurposeOpen(false);
                              }}
                              style={{
                                width: '100%',
                                border: 0,
                                borderBottom:
                                  index === purposeOptions.length - 1
                                    ? 'none'
                                    : '1px solid #eee8df',
                                background: active ? '#fff8e8' : '#fff',
                                color: '#302d29',
                                padding: '12px 14px',
                                fontSize: '15px',
                                lineHeight: 1.45,
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              {active ? '✓ ' : ''}
                              {th ? option.th : option.en}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {retreatPurpose === 'custom' && (
                    <input
                      type="text"
                      name="custom_purpose"
                      placeholder={
                        th
                          ? 'กรุณาระบุจุดประสงค์การปฏิบัติธรรม'
                          : 'Please specify your purpose'
                      }
                      style={{ marginTop: '12px' }}
                      required
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="primaryContactBtn bookingSubmitBtn"
                disabled={loading}
              >
                <img
                  src="/icons/lotus.svg"
                  alt=""
                  aria-hidden="true"
                />

                <span>
                  {loading
                    ? th
                      ? 'กำลังส่งข้อมูล...'
                      : 'Submitting...'
                    : th
                      ? 'ยืนยันการจองเข้าพัก'
                      : 'Confirm Retreat Request'}
                </span>
              </button>

              <div className="bookingPrivacyNote">
                <span aria-hidden="true">🔒</span>
                <span>
                  {th
                    ? 'ข้อมูลของท่านจะใช้เพื่อการพิจารณาคำขอและการติดต่อเกี่ยวกับการเข้าพักเท่านั้น'
                    : 'Your information will only be used to review and manage your monastery stay request.'}
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
