from pathlib import Path

dashboard = Path("src/pages/AdminDashboard.jsx")
if not dashboard.exists():
    raise SystemExit("ไม่พบ src/pages/AdminDashboard.jsx กรุณารันจาก root ของโปรเจกต์ nathoeng-temple")

text = dashboard.read_text(encoding="utf-8")
original = text

def add_once(old, new, label):
    global text
    if new in text:
        print("✓", label, "(มีอยู่แล้ว)")
        return
    if old not in text:
        raise SystemExit("หยุดเพื่อความปลอดภัย: ไม่พบตำแหน่งสำหรับ " + label)
    text = text.replace(old, new, 1)
    print("✓", label)

add_once(
    "import AdminRetreatReviewPanel from '../components/AdminRetreatReviewPanel';",
    "import AdminRetreatReviewPanel from '../components/AdminRetreatReviewPanel';\nimport AdminMembersPanel from '../components/AdminMembersPanel';",
    "import AdminMembersPanel"
)

add_once(
    "      reviewTab: '⭐ Retreat Reviews',",
    "      reviewTab: '⭐ Retreat Reviews',\n      memberTab: '👥 Members',",
    "Members EN label"
)

add_once(
    "      reviewTab: '⭐ รีวิวผู้เข้าปฏิบัติธรรม',",
    "      reviewTab: '⭐ รีวิวผู้เข้าปฏิบัติธรรม',\n      memberTab: '👥 สมาชิก',",
    "Members TH label"
)

old_sections = """    if (
      section === 'students' ||
      section === 'practice-messages' ||
      section === 'reviews'
    ) {"""
new_sections = """    if (
      section === 'students' ||
      section === 'practice-messages' ||
      section === 'reviews' ||
      section === 'members'
    ) {"""
add_once(old_sections, new_sections, "openAdminSection members")

old_menu = """    const menuItems = [
      {
        key: 'bookings',"""
new_menu = """    const menuItems = [
      {
        key: 'members',
        icon: '/icons/profile.svg',
        title: t.memberTab,
        text:
          lang === 'en'
            ? 'Member directory and connected LINE / Telegram accounts.'
            : 'รายชื่อสมาชิกและบัญชี LINE / Telegram ที่เชื่อมต่อ'
      },
      {
        key: 'bookings',"""
add_once(old_menu, new_menu, "Admin menu member card")

old_render = """  if (activeTab === 'students') {
    return ("""
new_render = """  if (activeTab === 'members') {
    return (
      <div className="guidePage">
        <div
          className="guideContainer"
          style={{
            maxWidth: '980px',
            paddingBottom: '70px'
          }}
        >
          <button
            type="button"
            className="backButton"
            onClick={() =>
              setActiveTab('menu')
            }
          >
            {t.backMenu}
          </button>

          <AdminMembersPanel
            lang={lang}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'students') {
    return ("""
add_once(old_render, new_render, "Member List render")

if text != original:
    backup = dashboard.with_suffix(".jsx.member-phase1.bak")
    backup.write_text(original, encoding="utf-8")
    dashboard.write_text(text, encoding="utf-8")
    print("✓ แก้ AdminDashboard สำเร็จ")
    print("✓ สำรองเดิม:", backup)
else:
    print("ไม่มีการเปลี่ยนแปลงเพิ่มเติม")
