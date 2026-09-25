# สาริบุตร อ่านบัตร 1.5 (Windows)

Build จาก GitHub Actions หรือบน Windows ที่ติดตั้ง .NET 8 SDK:
`dotnet publish SaributrCardBridge/SaributrCardBridge.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o publish`

เปิดโปรแกรมเพื่อดู IP และรหัสจับคู่ 6 หลัก เครื่องอ่าน CCID ที่ Windows รู้จักอ่านด้วย PC/SC ได้จากปุ่มในโปรแกรม มือถือ Android 1.5 ใช้เครื่องอ่าน OTG แล้วส่งข้อมูลไปยัง IP:8766 ของคอมพิวเตอร์หลังใส่รหัสจับคู่ จากหน้าเว็บ `https://watt.nathoeng.com` ที่คอมพิวเตอร์ กดปุ่มนำเข้าและบันทึกจาก Card Reader ภายใน 2 นาที โปรแกรมเปิดพอร์ต 127.0.0.1:8765 ให้เว็บอ่าน และพอร์ต 8766 สำหรับรับข้อมูลจากมือถือใน Wi-Fi วงเดียวกัน หาก Windows Firewall ถาม ให้อนุญาตบนเครือข่ายส่วนตัวเท่านั้น

ข้อมูลบัตรอยู่ในหน่วยความจำและหมดอายุใน 2 นาที กดล้างข้อมูลเมื่อเลิกใช้งาน ห้ามส่งรหัสจับคู่ให้ผู้อื่น เปลี่ยนรหัสได้ในโปรแกรม โปรแกรมไม่ส่งข้อมูลบัตรขึ้นเว็บเอง

สถานะ: ยังต้องทดสอบกับเครื่องอ่านจริง คอมพิวเตอร์ Windows และ Chrome ของผู้ใช้ก่อนนำไปใช้งานจริง
