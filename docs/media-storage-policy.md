# นโยบายคลังไฟล์กลาง — 28 กันยายน 2569

ไฟล์อัปโหลดใหม่ของทุกโครงการต้องมุ่งไปที่ media.nathoeng.com บน Hostinger; Supabase เก็บ URL/รหัสอ้างอิงและ metadata เท่านั้น ห้ามเก็บ secret ใน browser หรือ VITE_*.

| เว็บไซต์ | โฟลเดอร์รูปสาธารณะ |
|---|---|
| watt.nathoeng.com | uploads/temple/YYYY/MM/ |
| nathoeng.com (โครงการถัดไป) | uploads/nathoeng/YYYY/MM/ |
| gears.nathoeng.com | uploads/gears/YYYY/MM/ |
| library.nathoeng.com | uploads/library/YYYY/MM/ |

## สิ่งที่เตรียมใน commit นี้

- hostinger/upload.php ขยาย allowlist จาก gears/library ให้รองรับ temple/nathoeng ด้วย โดยคง protocol เดิมและ config.php เดิม
- lib/_media-upload.js ตัวเชื่อม server-to-server สำหรับรูปสาธารณะ มี timeout, ไม่ตาม redirect และตรวจ URL ผลลัพธ์ให้ตรงโครงการ
- เพิ่มเส้นทางรูปสมาชิกและเด็กวัดแบบ private แล้ว เปิดใช้ตาม docs/private-media-setup.md เมื่อ PHP และ SQL พร้อม; ไฟล์เดิมยังอ่านได้และยังไม่ได้ย้าย

## ขั้นตอนเปิดใช้งาน

1. สำรอง upload.php เดิมบน Hostinger แล้วนำ hostinger/upload.php ไปแทน public_html/media/upload.php เท่านั้น ไม่แทน config.php หรือ signatures.php
2. ตั้ง MEDIA_UPLOAD_URL=https://media.nathoeng.com/upload.php และ MEDIA_UPLOAD_KEY ให้ตรง upload_key เดิมใน server environment ของแต่ละโครงการ แล้ว redeploy ห้ามใส่ key ลง Git
3. Backend ต้องตรวจ session และสิทธิ์ของผู้ส่งก่อนเรียก uploadPublicImage; กำหนด project ฝั่ง server ห้ามรับจากผู้ใช้โดยตรง
4. ทดสอบรูปสาธารณะทั้ง 4 โฟลเดอร์ ตรวจว่าเปิด URL ได้ แล้วบันทึก URL ลงฐานข้อมูลหลัง upload สำเร็จเท่านั้น
5. หากล้มเหลว ต้องแจ้งผู้ใช้และให้ลองใหม่ ห้าม fallback ไปเก็บ Base64/Supabase โดยเงียบ

## ไฟล์ส่วนบุคคลและสื่อชนิดอื่น

รูปเด็กวัดปัจจุบันใช้ private bucket และ API ตรวจสิทธิ์; ลายเซ็น Gears ใช้ signatures.php เก็บนอก public_html ต้องคงการป้องกันนี้ไว้ ห้ามใช้ uploadPublicImage กับลายเซ็น รูปบัตร เอกสารสมาชิก หรือไฟล์ส่วนตัว

นโยบายครอบคลุมเสียง วิดีโอ PDF และเอกสาร แต่ upload.php รุ่นนี้ยังรับเฉพาะ JPEG/PNG/WebP ไม่เกิน config max_bytes (ปัจจุบัน 2 MiB) และแปลง WebP สื่ออื่นต้องเพิ่ม endpoint ที่ตรวจ MIME/ขนาดและสิทธิ์เฉพาะประเภทก่อนเปิดใช้ วิดีโอขนาดใหญ่ต้องออกแบบอัปโหลดตรง/แบ่งส่วนตามข้อจำกัดโฮสต์ ไม่ส่งผ่าน API รูปนี้

## งานต่อสำหรับ watt และโครงการใหม่

- api/donation-profile.js และ lib/_walkin-members.js: รูปใหม่ใช้ private media เมื่อเปิด MEDIA_PRIVATE_ENABLED; รูปเก่ายังเก็บตามเดิมจนย้ายแยกต่างหาก
- lib/student-api/student-profile.js และ student-photo.js: รูปใหม่ใช้ private media เมื่อเปิด MEDIA_PRIVATE_ENABLED และคง authorization เดิม; รูปเก่ายังอ่านจาก Supabase
- รูปจาก LINE/Telegram และภาพที่มากับ source code ยังไม่ได้คัดลอก
- nathoeng.com: ใช้ project=nathoeng เมื่อเริ่มโครงการ ไม่ถือว่า nathoeng-experience เป็นโครงการนี้โดยอัตโนมัติ
- ย้ายไฟล์เดิมด้วยรายการ mapping URL เก่า/ใหม่ ตรวจขนาดหรือ checksum และการเปิดอ่านก่อนเปลี่ยนฐานข้อมูล เก็บต้นฉบับไว้จนตรวจครบ

ตรวจโค้ดและ mock tests ได้โดยไม่ใช้ secret; ยังต้องทดสอบ PHP GD และการอัปโหลดบน Hostinger จริงหลังติดตั้ง
