import { useEffect, useState } from 'react'

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

  const [donationType, setDonationType] = useState('')

  const [formData, setFormData] =
    useState({
      amount: '',
      itemName: '',
      quantity: '',
      unit: '',
      note: '',
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

  // Donation profile: ชื่อ-สกุล + เลข 13 หลัก เก็บครั้งเดียวใน Supabase
  const [profileChecking, setProfileChecking] = useState(Boolean(user))
  const [profileComplete, setProfileComplete] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileData, setProfileData] = useState({
    fullName: '',
    taxId: ''
  })

  useEffect(() => {
    if (!user) {
      setProfileChecking(false)
      return
    }

    let cancelled = false

    const checkDonationProfile = async () => {
      setProfileChecking(true)
      setProfileError('')

      try {
        const response = await fetch('/api/donation-profile', {
          method: 'GET',
          credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            (lang === 'th'
              ? 'ไม่สามารถตรวจสอบข้อมูลผู้ทำบุญได้'
              : 'Unable to check donation profile')
          )
        }

        if (cancelled) return

        const completed = data.donationProfileComplete === true
        setProfileComplete(completed)

        if (data.fullName) {
          setProfileData((prev) => ({
            ...prev,
            fullName: data.fullName
          }))
        }

        if (!completed) {
          setProfileModalOpen(true)
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(error.message || 'Unable to check donation profile')
        }
      } finally {
        if (!cancelled) {
          setProfileChecking(false)
        }
      }
    }

    checkDonationProfile()

    return () => {
      cancelled = true
    }
  }, [user?.memberId, lang])

  const handleProfileChange = (e) => {
    const { name, value } = e.target

    setProfileData((prev) => ({
      ...prev,
      [name]:
        name === 'taxId'
          ? value.replace(/\D/g, '').slice(0, 13)
          : value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')

    const fullName = profileData.fullName.trim()
    const taxId = profileData.taxId.replace(/\D/g, '')

    if (!fullName) {
      setProfileError(
        lang === 'th'
          ? 'กรุณาระบุชื่อและนามสกุล'
          : 'Please enter your full name.'
      )
      return
    }

    if (taxId.length !== 13) {
      setProfileError(
        lang === 'th'
          ? 'กรุณาระบุเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษีให้ครบ 13 หลัก'
          : 'Please enter a 13-digit National ID or Tax ID.'
      )
      return
    }

    setProfileSaving(true)

    try {
      const response = await fetch('/api/donation-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          taxId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          (lang === 'th'
            ? 'ไม่สามารถบันทึกข้อมูลได้'
            : 'Unable to save donation profile')
        )
      }

      setProfileComplete(true)
      setProfileModalOpen(false)
      setProfileData({
        fullName: data.fullName || fullName,
        taxId: ''
      })
    } catch (error) {
      setProfileError(
        error.message ||
        (lang === 'th'
          ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
          : 'Something went wrong. Please try again.')
      )
    } finally {
      setProfileSaving(false)
    }
  }

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

    if (!profileComplete) {
      setProfileModalOpen(true)
      return
    }

    if (!donationType) {
      alert(
        lang === 'th'
          ? 'กรุณาเลือกรูปแบบการทำบุญ'
          : 'Please choose a donation type.'
      )
      return
    }

    if (
      (donationType === 'money' &&
        (!formData.amount || !formData.taxReceipt)) ||
      (donationType === 'item' &&
        (!formData.itemName || !formData.quantity || !formData.unit))
    ) {
      alert(
        lang === 'th'
          ? 'กรุณากรอกข้อมูลให้ครบถ้วน'
          : 'Please fill in all required fields.'
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
      name: profileData.fullName || user.name,
      donationType,
      purpose: selectedPurposeText,
      receipt:
        donationType === 'money'
          ? formData.taxReceipt
          : 'no',
      amount:
        donationType === 'money'
          ? Number(formData.amount)
          : null,
      itemName:
        donationType === 'item'
          ? formData.itemName
          : '',
      quantity:
        donationType === 'item'
          ? Number(formData.quantity)
          : null,
      unit:
        donationType === 'item'
          ? formData.unit
          : '',
      note: formData.note,
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
              `New Donation from ${profileData.fullName || user.name}`,
            from_name:
              'Buddhist Park Monastery Website',
            'Full Name':
              profileData.fullName || user.name,
            'LINE User':
              user.name,
            'Donation Type':
              donationType === 'money' ? 'Money' : 'Item',
            'Amount (THB)':
              donationType === 'money' ? formData.amount : '',
            'Item':
              donationType === 'item' ? formData.itemName : '',
            'Quantity':
              donationType === 'item' ? formData.quantity : '',
            'Unit':
              donationType === 'item' ? formData.unit : '',
            Note:
              formData.note,
            Purpose:
              selectedPurposeText,
            'Needs Tax Receipt':
              donationType === 'money' && formData.taxReceipt === 'yes'
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

      setDonationType('')
      setFormData({
        amount: '',
        itemName: '',
        quantity: '',
        unit: '',
        note: '',
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

            <div className="donationTypeSection">
              <div className="donationTypeHeading">
                <strong>
                  {lang === 'th'
                    ? 'เลือกรูปแบบการทำบุญ'
                    : 'Choose donation type'}
                </strong>
                <span>
                  {lang === 'th'
                    ? 'เลือก 1 รายการ แล้วกรอกข้อมูลด้านล่าง'
                    : 'Choose one option, then complete the form below.'}
                </span>
              </div>

              <div className="donationTypeGrid">
                <button
                  type="button"
                  className={
                    donationType === 'money'
                      ? 'donationTypeCard isSelected'
                      : 'donationTypeCard'
                  }
                  onClick={() => {
                    setDonationType('money')
                    setFormData((prev) => ({
                      ...prev,
                      itemName: '',
                      quantity: '',
                      unit: '',
                      note: ''
                    }))
                  }}
                >
                  <img src="/icons/donation.svg" alt="" aria-hidden="true" />
                  <span>
                    <strong>
                      {lang === 'th' ? 'ทำบุญเป็นเงิน' : 'Money Donation'}
                    </strong>
                    <small>
                      {lang === 'th'
                        ? 'บันทึกยอดเงินและวัตถุประสงค์'
                        : 'Record amount and purpose'}
                    </small>
                  </span>
                  <b>{donationType === 'money' ? '✓' : '›'}</b>
                </button>

                <button
                  type="button"
                  className={
                    donationType === 'item'
                      ? 'donationTypeCard isSelected'
                      : 'donationTypeCard'
                  }
                  onClick={() => {
                    setDonationType('item')
                    setFormData((prev) => ({
                      ...prev,
                      amount: '',
                      taxReceipt: ''
                    }))
                  }}
                >
                  <img src="/icons/lotus.svg" alt="" aria-hidden="true" />
                  <span>
                    <strong>
                      {lang === 'th' ? 'ถวายสิ่งของ' : 'Offer Items'}
                    </strong>
                    <small>
                      {lang === 'th'
                        ? 'บันทึกสิ่งของ จำนวน และหน่วย'
                        : 'Record item, quantity and unit'}
                    </small>
                  </span>
                  <b>{donationType === 'item' ? '✓' : '›'}</b>
                </button>
              </div>
            </div>

            {donationType && (
            <form
              onSubmit={
                handleSubmit
              }
              className="donationForm"
            >

              {donationType === 'money' ? (
              <div className="donationFormGrid">
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
              ) : (
                <div className="donationFormGrid">
                  <div className="donationField donationFieldFull">
                    <label htmlFor="donation-item-name">
                      {lang === 'th' ? 'สิ่งของที่ถวาย *' : 'Item Offered *'}
                    </label>
                    <input
                      id="donation-item-name"
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder={
                        lang === 'th'
                          ? 'เช่น ข้าวสาร น้ำดื่ม พัดลม'
                          : 'e.g. rice, drinking water, fan'
                      }
                      required
                    />
                  </div>

                  <div className="donationField">
                    <label htmlFor="donation-quantity">
                      {lang === 'th' ? 'จำนวน *' : 'Quantity *'}
                    </label>
                    <input
                      id="donation-quantity"
                      type="number"
                      name="quantity"
                      inputMode="decimal"
                      min="0.01"
                      step="any"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder={lang === 'th' ? 'เช่น 2' : 'e.g. 2'}
                      required
                    />
                  </div>

                  <div className="donationField">
                    <label htmlFor="donation-unit">
                      {lang === 'th' ? 'หน่วย *' : 'Unit *'}
                    </label>
                    <input
                      id="donation-unit"
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder={
                        lang === 'th'
                          ? 'เช่น ถุง กล่อง เครื่อง กระสอบ'
                          : 'e.g. bags, boxes, units'
                      }
                      required
                    />
                  </div>

                  <div className="donationField donationFieldFull">
                    <label htmlFor="donation-item-note">
                      {lang === 'th' ? 'หมายเหตุ' : 'Note'}
                    </label>
                    <textarea
                      id="donation-item-note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      placeholder={
                        lang === 'th'
                          ? 'รายละเอียดเพิ่มเติม (ถ้ามี)'
                          : 'Additional details (optional)'
                      }
                    />
                  </div>

                  <div className="donationField donationFieldFull">
                    <label htmlFor="donation-purpose-item">
                      {t.purposeLabel}
                    </label>
                    <div className="donationPurposeDropdown">
                      <button
                        id="donation-purpose-item"
                        type="button"
                        className="donationPurposeTrigger"
                        onClick={() => setPurposeOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={purposeOpen}
                      >
                        <span>{selectedPurposeOption.label}</span>
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
                        <div className="donationPurposeMenu" role="listbox">
                          {t.purposeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={formData.purpose === opt.value}
                              className={
                                formData.purpose === opt.value
                                  ? 'donationPurposeOption isSelected'
                                  : 'donationPurposeOption'
                              }
                              onClick={() => handlePurposeSelect(opt.value)}
                            >
                              <span className="donationPurposeCheck">
                                {formData.purpose === opt.value ? '✓' : ''}
                              </span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

              {donationType === 'money' && (
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
              )}

              <div className="donationSubmitWrap">
                <button
                  type="submit"
                  disabled={loading || profileChecking || !profileComplete}
                  className="primaryContactBtn donationSubmitBtn"
                >
                  {loading
                    ? lang === 'th'
                      ? 'กำลังส่งข้อมูล...'
                      : 'Submitting...'
                    : donationType === 'item'
                      ? lang === 'th'
                        ? 'ยืนยันการถวายสิ่งของ →'
                        : 'Confirm Item Offering →'
                      : `${t.submitBtn} →`}
                </button>
              </div>

            </form>
            )}
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

        {user && profileModalOpen && (
          <div className="donationProfileOverlay" role="presentation">
            <div
              className="donationProfileModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="donation-profile-title"
            >
              <img
                src="/icons/donation.svg"
                alt=""
                className="donationProfileModalIcon"
                aria-hidden="true"
              />

              <span className="eyebrow">
                {lang === 'th'
                  ? 'ข้อมูลผู้ร่วมทำบุญ'
                  : 'DONOR INFORMATION'}
              </span>

              <h2 id="donation-profile-title">
                {lang === 'th'
                  ? 'บันทึกข้อมูลครั้งแรก'
                  : 'Save Your Information Once'}
              </h2>

              <p className="donationProfileIntro">
                {lang === 'th'
                  ? 'กรุณาบันทึกชื่อ-สกุล และเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี ข้อมูลนี้บันทึกครั้งเดียว ครั้งต่อไปไม่ต้องกรอกซ้ำ'
                  : 'Please save your full name and 13-digit National ID or Tax ID once. You will not need to enter them again for future donation records.'}
              </p>

              <form onSubmit={handleProfileSubmit}>
                <div className="donationField">
                  <label htmlFor="profile-full-name">
                    {lang === 'th' ? 'ชื่อ - สกุล *' : 'Full Name *'}
                  </label>
                  <input
                    id="profile-full-name"
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    autoComplete="name"
                    placeholder={
                      lang === 'th'
                        ? 'ระบุชื่อและนามสกุล'
                        : 'Enter your full name'
                    }
                    required
                  />
                </div>

                <div className="donationField">
                  <label htmlFor="profile-tax-id">
                    {lang === 'th'
                      ? 'เลขประจำตัวประชาชน / เลขประจำตัวผู้เสียภาษี 13 หลัก *'
                      : '13-Digit National ID / Tax ID *'}
                  </label>
                  <input
                    id="profile-tax-id"
                    type="text"
                    name="taxId"
                    inputMode="numeric"
                    maxLength="13"
                    value={profileData.taxId}
                    onChange={handleProfileChange}
                    placeholder={
                      lang === 'th'
                        ? 'กรอกตัวเลข 13 หลัก'
                        : 'Enter 13 digits'
                    }
                    required
                  />
                </div>

                <p className="donationProfilePrivacy">
                  {lang === 'th'
                    ? 'ข้อมูลเลขประจำตัวจะจัดเก็บในระบบของวัด และจะไม่แสดงในหน้ารายการทำบุญทั่วไป'
                    : 'Your identification number is stored securely and is not displayed in the general donation list.'}
                </p>

                {profileError && (
                  <div className="donationProfileError">
                    {profileError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="primaryContactBtn donationProfileSaveBtn"
                >
                  {profileSaving
                    ? lang === 'th'
                      ? 'กำลังบันทึก...'
                      : 'Saving...'
                    : lang === 'th'
                      ? 'บันทึกและดำเนินการต่อ →'
                      : 'Save and Continue →'}
                </button>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .donationTypeSection {
            margin: 22px 0;
          }

          .donationTypeHeading {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
          }

          .donationTypeHeading strong {
            color: #3d3025;
            font-size: 18px;
          }

          .donationTypeHeading span {
            color: #7c7269;
            font-size: 12px;
          }

          .donationTypeGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .donationTypeCard {
            width: 100%;
            min-height: 108px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border: 1px solid #ded5c8;
            border-radius: 14px;
            background: #fffefb;
            text-align: left;
            cursor: pointer;
          }

          .donationTypeCard.isSelected {
            border: 2px solid #a97a24;
            background: #fffaf0;
          }

          .donationTypeCard img {
            width: 36px;
            height: 36px;
            flex: 0 0 auto;
          }

          .donationTypeCard span {
            min-width: 0;
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 4px;
          }

          .donationTypeCard strong {
            color: #3d3025;
            font-size: 16px;
          }

          .donationTypeCard small {
            color: #7c7269;
            font-size: 11px;
            line-height: 1.45;
          }

          .donationTypeCard b {
            color: #a97a24;
            font-size: 20px;
          }

          .donationField textarea {
            width: 100%;
            box-sizing: border-box;
            resize: vertical;
          }

          @media (max-width: 480px) {
            .donationTypeGrid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .donationTypeCard {
              min-height: 88px;
              padding: 14px;
            }
          }

          .donationProfileOverlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            background: rgba(39, 31, 24, .58);
            backdrop-filter: blur(3px);
          }

          .donationProfileModal {
            width: min(100%, 460px);
            max-height: calc(100vh - 36px);
            overflow-y: auto;
            padding: 28px 22px 24px;
            border: 1px solid #e5d8c6;
            border-radius: 18px;
            background: #fffefb;
            box-shadow: 0 24px 70px rgba(40, 30, 20, .22);
          }

          .donationProfileModalIcon {
            width: 44px;
            height: 44px;
            display: block;
            margin: 0 auto 12px;
          }

          .donationProfileModal .eyebrow,
          .donationProfileModal h2,
          .donationProfileIntro {
            text-align: center;
          }

          .donationProfileModal h2 {
            margin: 8px 0 10px;
            color: #3d3025;
            font-size: 23px;
            font-weight: 600;
          }

          .donationProfileIntro {
            margin: 0 0 20px;
            color: #6f655c;
            font-size: 13px;
            line-height: 1.75;
          }

          .donationProfileModal .donationField {
            margin-bottom: 15px;
          }

          .donationProfilePrivacy {
            margin: 4px 0 14px;
            color: #857b72;
            font-size: 11.5px;
            line-height: 1.65;
          }

          .donationProfileError {
            margin: 0 0 14px;
            padding: 10px 12px;
            border: 1px solid #e8c7c2;
            border-radius: 8px;
            background: #fff5f3;
            color: #9a3d34;
            font-size: 12px;
            line-height: 1.5;
          }

          .donationProfileSaveBtn {
            width: 100%;
            min-height: 50px;
            margin-top: 4px;
          }

          @media (max-width: 480px) {
            .donationProfileOverlay {
              align-items: flex-end;
              padding: 10px;
            }

            .donationProfileModal {
              width: 100%;
              padding: 24px 18px 20px;
              border-radius: 18px 18px 12px 12px;
            }
          }
        `}</style>

      </div>
    </div>
  )
}
