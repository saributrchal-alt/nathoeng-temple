import { useState } from 'react'

export default function DonationPage({ lang, goToPage }) {
  // ดึงข้อมูลผู้ใช้ที่ล็อกอินผ่าน LINE จาก localStorage
  const savedUser = localStorage.getItem('line_user')
  const user = savedUser ? JSON.parse(savedUser) : null

  const text = {
    en: {
      back: '← Back to Home',
      eyebrow: 'SUPPORT THE MONASTERY',
      title: 'Make a Donation',
      intro:
        'Your generosity helps sustain the monastery, Dhamma activities, and community service. Anyone can contribute using the form below.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Enter your full name',
      idLabel:
        '13-Digit National ID / Taxpayer Identification Number *',
      idPlaceholder: 'Enter 13-digit ID or Tax ID',
      amountLabel: 'Donation Amount (THB) *',
      amountPlaceholder: 'e.g. 500',
      purposeLabel: 'Donation Purpose *',
      purposeOptions: [
        {
          value: 'general',
          label:
            'General Donation (ตามอัธยาศัยทางคณะสงฆ์)'
        },
        {
          value: 'utilities',
          label:
            'Electricity & Water Bills (ค่าน้ำ ค่าไฟวัด)'
        },
        {
          value: 'development',
          label:
            'Monastery Development & Maintenance (พัฒนาทำนุบำรุงเสนาสนะ)'
        },
        {
          value: 'custom',
          label:
            'Other / Specific Purpose (ระบุเอง)'
        }
      ],
      customPurposeLabel: 'Specify Purpose *',
      customPlaceholder: 'Please specify details',
      taxReceiptLabel:
        'Do you require a donation receipt (ใบอนุโมทนาบัตร)? *',
      taxReceiptYes: 'Yes, I require a receipt',
      taxReceiptNo: 'No, I do not require a receipt',
      submitBtn: 'Confirm Donation',
      viewListBtn:
        'View All Donations (Admin)',
      successTitle: 'Sadhu! อนุโมทนากุศลจิต',
      successMsg:
        'May the Triple Gem bless you and your family with peace, health, and prosperity. Your donation details have been securely sent to the monastery.',
      okBtn: 'OK (Back to Home)'
    },

    th: {
      back: '← กลับสู่หน้าหลัก',
      eyebrow: 'ร่วมสนับสนุนวัด',
      title: 'บันทึกข้อมูลการบริจาค',
      intro:
        'การให้ของท่านช่วยเกื้อกูลวัด กิจกรรมเผยแผ่ธรรมะ และงานเพื่อชุมชน ผู้มีจิตศรัทธาทุกท่านสามารถกรอกข้อมูลร่วมบุญได้ผ่านแบบฟอร์มด้านล่างนี้',
      nameLabel: 'ชื่อ - สกุล *',
      namePlaceholder:
        'ระบุชื่อและนามสกุลของคุณ',
      idLabel:
        'เลขประจำตัวประชาชน หรือเลขประจำตัวผู้เสียภาษี 13 หลัก *',
      idPlaceholder:
        'ระบุเลข 13 หลัก หรือเลขผู้เสียภาษี',
      amountLabel: 'ยอดบริจาค (บาท) *',
      amountPlaceholder: 'เช่น 500',
      purposeLabel:
        'วัตถุประสงค์ในการบริจาค *',
      purposeOptions: [
        {
          value: 'general',
          label:
            'ทำบุญตามอัธยาศัยทางคณะสงฆ์'
        },
        {
          value: 'utilities',
          label: 'เพื่อค่าน้ำ - ค่าไฟวัด'
        },
        {
          value: 'development',
          label:
            'เพื่องานพัฒนาทำนุบำรุงเสนาสนะ'
        },
        {
          value: 'custom',
          label:
            'เพื่อวัตถุประสงค์เฉพาะ (โปรดระบุ)'
        }
      ],
      customPurposeLabel:
        'ระบุวัตถุประสงค์ *',
      customPlaceholder:
        'ระบุรายละเอียดเพิ่มเติม',
      taxReceiptLabel:
        'ความต้องการใบอนุโมทนาบัตร *',
      taxReceiptYes:
        'ต้องการรับใบอนุโมทนาบัตร',
      taxReceiptNo:
        'ไม่ต้องการรับใบอนุโมทนาบัตร',
      submitBtn: 'ยืนยันการบริจาค',
      viewListBtn:
        'ตรวจสอบรายชื่อผู้บริจาคทั้งหมด (สำหรับเจ้าหน้าที่)',
      successTitle:
        'สาธุ อนุโมทนาบุญด้วยครับ',
      successMsg:
        'ขออานุภาพแห่งคุณพระศรีรัตนตรัย จงดลบันดาลให้ท่านและครอบครัวประสบแต่ความสุข ความเจริญ มีอายุ วรรณะ สุขะ พละ ปฏิภาณ ธนสารสมบัติทุกประการ ทางวัดได้ทำการบันทึกและส่งข้อมูลให้ทางวัดเรียบร้อยแล้ว',
      okBtn: 'ตกลง (กลับสู่หน้าหลัก)'
    }
  }

  const t = text[lang]

  // แสดงเมนูเจ้าหน้าที่เฉพาะบัญชี Admin ที่ LINE Login ส่งมาเท่านั้น
  const isAdmin =
    user?.isAdmin === true ||
    user?.role === 'admin'

  const [formData, setFormData] =
    useState({
      fullName: user ? user.name : '',
      idNumber: '',
      amount: '',
      purpose: 'general',
      customPurpose: '',
      taxReceipt: ''
    })

  const [isSubmitted, setIsSubmitted] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [purposeOpen, setPurposeOpen] =
    useState(false)

  const [profileImageError, setProfileImageError] =
    useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePurposeSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      purpose: value
    }))

    setPurposeOpen(false)
  }

  const selectedPurposeOption =
    t.purposeOptions.find(
      (opt) =>
        opt.value === formData.purpose
    ) || t.purposeOptions[0]

  const handleSubmit = async (e) => {
    e.preventDefault()

    // บังคับตรวจเช็ก LINE Login ป้องกัน Spam
    if (!user) {
      alert(
        lang === 'th'
          ? 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนทำการบริจาค'
          : 'Please login with LINE before making a donation.'
      )

      goToPage('login-page')
      return
    }

    if (
      !formData.fullName ||
      !formData.idNumber ||
      !formData.amount ||
      !formData.taxReceipt
    ) {
      alert(
        lang === 'th'
          ? 'กรุณากรอกข้อมูลและเลือกรายการให้ครบถ้วน'
          : 'Please fill in all required fields and select receipt option.'
      )

      return
    }

    let selectedPurposeText = ''

    if (
      formData.purpose === 'custom'
    ) {
      selectedPurposeText =
        formData.customPurpose ||
        (lang === 'th'
          ? 'ระบุเอง'
          : 'Custom')
    } else {
      const found =
        t.purposeOptions.find(
          (opt) =>
            opt.value ===
            formData.purpose
        )

      selectedPurposeText =
        found
          ? found.label
          : formData.purpose
    }

    setLoading(true)

    const now = new Date()

    const formattedDate =
      `${now.getFullYear()}-` +
      `${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-` +
      `${String(
        now.getDate()
      ).padStart(2, '0')} ` +
      `${String(
        now.getHours()
      ).padStart(2, '0')}:` +
      `${String(
        now.getMinutes()
      ).padStart(2, '0')}`

    const newEntry = {
      date: formattedDate,
      name: formData.fullName,
      idNumber: formData.idNumber,
      purpose: selectedPurposeText,
      receipt: formData.taxReceipt,
      amount: Number(
        formData.amount
      ),
      lineUser: user.name
    }

    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            'nathoeng_donations'
          ) || '[]'
        )

      localStorage.setItem(
        'nathoeng_donations',
        JSON.stringify([
          newEntry,
          ...existing
        ])
      )
    } catch (err) {
      console.error(err)
    }

    try {
      await fetch(
        'https://api.web3forms.com/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Accept:
              'application/json'
          },
          body: JSON.stringify({
            access_key:
              '56740213-dd22-4925-948b-66e1bf47d993',
            subject:
              `New Donation from ${formData.fullName}`,
            from_name:
              'Buddhist Park Monastery Website',
            'Full Name':
              formData.fullName,
            'LINE User':
              user.name,
            'ID / Tax ID':
              formData.idNumber,
            'Amount (THB)':
              formData.amount,
            Purpose:
              selectedPurposeText,
            'Needs Tax Receipt':
              formData.taxReceipt ===
              'yes'
                ? 'Yes (ต้องการ)'
                : 'No (ไม่ต้องการ)'
          })
        }
      )

      setIsSubmitted(true)
    } catch (error) {
      console.error(error)

      setIsSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResetAndGoHome =
    () => {
      setIsSubmitted(false)

      setFormData({
        fullName: user
          ? user.name
          : '',
        idNumber: '',
        amount: '',
        purpose: 'general',
        customPurpose: '',
        taxReceipt: ''
      })

      goToPage('home')
    }

  return (
    <div className="guidePage donationPage">
      <div className="guideContainer donationContainer">

        <div className="donationTopBar">
          <button
            className="backButton"
            onClick={() =>
              goToPage('home')
            }
          >
            {t.back}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                goToPage(
                  'donation-list'
                )
              }
              className="donationAdminLink"
            >
              {t.viewListBtn}
            </button>
          )}
        </div>

        {!user ? (
          <div className="donationLoginBox">
            <img
              src="/icons/donation.svg"
              alt=""
              className="donationBoxIcon"
              aria-hidden="true"
            />

            <p>
              {lang === 'th'
                ? 'เพื่อความโปร่งใส ป้องกันสแปม และบันทึกข้อมูลการบริจาคอย่างปลอดภัย กรุณาเข้าสู่ระบบด้วยบัญชี LINE ก่อนทำรายการ'
                : 'Security Check: Please login with your LINE account to proceed with your donation.'}
            </p>

            <button
              onClick={() =>
                goToPage(
                  'login-page'
                )
              }
              className="primaryContactBtn donationLineBtn"
            >
              {lang === 'th'
                ? 'เข้าสู่ระบบด้วย LINE เพื่อร่วมทำบุญ'
                : 'Login with LINE to Donate'}
            </button>
          </div>
        ) : !isSubmitted ? (
          <>
            <div className="donationHero">
              <img
                src="/icons/donation.svg"
                alt=""
                className="donationHeroIcon"
                aria-hidden="true"
              />

              <span className="eyebrow">
                {t.eyebrow}
              </span>

              <h1>
                {t.title}
              </h1>

              <p>
                {t.intro}
              </p>
            </div>

            <div className="donationUserBadge">
              <div className="donationProfileAvatar">
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
                    aria-hidden="true"
                    className="donationProfileFallback"
                  />
                )}
              </div>

              <div className="donationUserIdentity">
                <small>
                  {lang === 'th'
                    ? 'เข้าสู่ระบบแล้ว'
                    : 'SIGNED IN'}
                </small>

                <strong>
                  {user.name}
                </strong>

                <span>
                  {lang === 'th'
                    ? 'ยืนยันตัวตนผ่าน LINE เรียบร้อย'
                    : 'Identity verified with LINE'}
                </span>
              </div>

              <span className="donationLineVerified">
                ✓ LINE
              </span>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="donationForm"
            >

              <div className="donationFormGrid">
                <div className="donationField">
                  <label
                    htmlFor="donation-full-name"
                  >
                    {t.nameLabel}
                  </label>

                  <input
                    id="donation-full-name"
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      t.namePlaceholder
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="donationField">
                  <label
                    htmlFor="donation-id-number"
                  >
                    {t.idLabel}
                  </label>

                  <input
                    id="donation-id-number"
                    type="text"
                    name="idNumber"
                    inputMode="numeric"
                    maxLength="13"
                    value={
                      formData.idNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      t.idPlaceholder
                    }
                    required
                  />
                </div>

                <div className="donationField">
                  <label
                    htmlFor="donation-amount"
                  >
                    {t.amountLabel}
                  </label>

                  <input
                    id="donation-amount"
                    type="number"
                    name="amount"
                    inputMode="decimal"
                    min="1"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      t.amountPlaceholder
                    }
                    required
                  />
                </div>

                <div className="donationField">
                  <label
                    htmlFor="donation-purpose"
                  >
                    {t.purposeLabel}
                  </label>

                  <div className="donationPurposeDropdown">
                    <button
                      id="donation-purpose"
                      type="button"
                      className="donationPurposeTrigger"
                      onClick={() =>
                        setPurposeOpen(
                          (open) => !open
                        )
                      }
                      aria-haspopup="listbox"
                      aria-expanded={purposeOpen}
                    >
                      <span>
                        {selectedPurposeOption.label}
                      </span>

                      <span
                        className={
                          purposeOpen
                            ? 'donationPurposeChevron isOpen'
                            : 'donationPurposeChevron'
                        }
                        aria-hidden="true"
                      >
                       ⌄
                      </span>
                    </button>

                    {purposeOpen && (
                      <div
                        className="donationPurposeMenu"
                        role="listbox"
                        aria-labelledby="donation-purpose"
                      >
                        {t.purposeOptions.map(
                          (opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={
                                formData.purpose ===
                                opt.value
                              }
                              className={
                                formData.purpose ===
                                opt.value
                                  ? 'donationPurposeOption isSelected'
                                  : 'donationPurposeOption'
                              }
                              onClick={() =>
                                handlePurposeSelect(
                                  opt.value
                                )
                              }
                            >
                              <span className="donationPurposeCheck">
                                {formData.purpose ===
                                opt.value
                                  ? '✓'
                                  : ''}
                              </span>

                              <span>
                                {opt.label}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formData.purpose ===
                'custom' && (
                <div className="donationField donationFieldFull">
                  <label
                    htmlFor="donation-custom-purpose"
                  >
                    {t.customPurposeLabel}
                  </label>

                  <input
                    id="donation-custom-purpose"
                    type="text"
                    name="customPurpose"
                    value={
                      formData.customPurpose
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      t.customPlaceholder
                    }
                    required
                  />
                </div>
              )}

              <fieldset className="donationReceiptBox">
                <legend>
                  {t.taxReceiptLabel}
                </legend>

                <div className="donationReceiptOptions">

                  <label className="donationRadioOption">
                    <input
                      type="radio"
                      name="taxReceipt"
                      value="yes"
                      checked={
                        formData.taxReceipt ===
                        'yes'
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                    <span className="donationRadioText">
                      <strong>
                        {t.taxReceiptYes}
                      </strong>

                      <small>
                        {lang === 'th'
                          ? 'ทางวัดจะใช้ข้อมูลที่กรอกเพื่อจัดทำใบอนุโมทนาบัตร'
                          : 'Your submitted information will be used to prepare the receipt.'}
                      </small>
                    </span>
                  </label>

                  <label className="donationRadioOption">
                    <input
                      type="radio"
                      name="taxReceipt"
                      value="no"
                      checked={
                        formData.taxReceipt ===
                        'no'
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                    <span className="donationRadioText">
                      <strong>
                        {t.taxReceiptNo}
                      </strong>

                      <small>
                        {lang === 'th'
                          ? 'บันทึกข้อมูลการร่วมบุญโดยไม่ขอรับใบอนุโมทนาบัตร'
                          : 'Record the donation without requesting a receipt.'}
                      </small>
                    </span>
                  </label>

                </div>
              </fieldset>

              <div className="donationSubmitWrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="primaryContactBtn donationSubmitBtn"
                >
                  {loading
                    ? lang === 'th'
                      ? 'กำลังส่งข้อมูล...'
                      : 'Submitting...'
                    : `${t.submitBtn} →`}
                </button>
              </div>

            </form>
          </>
        ) : (
          <div className="donationSuccessBox">
            <img
              src="/icons/lotus.svg"
              alt=""
              className="donationSuccessIcon"
              aria-hidden="true"
            />

            <h2>
              {t.successTitle}
            </h2>

            <p>
              {t.successMsg}
            </p>

            <div className="donationSuccessActions">
              <button
                onClick={
                  handleResetAndGoHome
                }
                className="primaryContactBtn"
              >
                {t.okBtn}
              </button>

              {isAdmin && (
                <button
                  onClick={() =>
                    goToPage(
                      'donation-list'
                    )
                  }
                  className="donationSecondaryBtn"
                >
                  {t.viewListBtn}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
