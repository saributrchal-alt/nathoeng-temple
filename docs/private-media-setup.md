# เปิดใช้รูปส่วนตัวบน media สำหรับ watt

## ติดตั้งตามลำดับ

1. เพิ่ม `hostinger/private-media.php` ลง `public_html/media/private-media.php` บน Hostinger ข้าง `config.php` ใช้ upload_key เดิม ไม่แทน upload.php หรือ signatures.php
2. รัน `supabase/private-media-member-photos.sql` ใน Supabase โครงการสมาชิกวัด เป็นการขยาย validation ของ function เดิม ไม่ลบหรือย้ายข้อมูล
3. ตั้งค่า Vercel nathoeng-temple: `MEDIA_UPLOAD_URL=https://media.nathoeng.com/upload.php` และ `MEDIA_UPLOAD_KEY` ค่าเดิม (พระอาจารย์ตั้งแล้ว)
4. หลัง deploy โค้ดนี้ เข้าระบบ watt ด้วยบัญชี admin แล้วเปิด `https://watt.nathoeng.com/api/donation-profile?media=health` ต้องเห็น `success: true` และ `privateMediaReady: true` การตรวจนี้ไม่สร้างไฟล์ทดสอบ และไม่แสดง key
5. เพิ่ม `MEDIA_PRIVATE_ENABLED=true` ใน Production ของ Vercel แล้ว Redeploy เปิด health อีกครั้งต้องเห็น `enabled: true`
6. ทดสอบเปลี่ยนรูปสมาชิกด้วยบัญชีตนเอง, แก้รูปโดย admin, ลงทะเบียนสมาชิกผ่านเจ้าหน้าที่ และเปลี่ยนรูปเด็กวัด ตรวจการบันทึก/เปิดดู/พิมพ์บัตร จากนั้นลองเปิด URL รูปในหน้าต่างที่ไม่ได้ล็อกอิน ต้องเปิดไม่ได้

## การทำงาน

- ไฟล์ใหม่เก็บนอก public_html ที่ `nathoeng-private-media/temple/` บน Hostinger แปลงเป็น WebP ลบ metadata ผ่านการ re-encode
- ฐานข้อมูลสมาชิกเก็บ URL ของตัวเปิดรูปที่ watt; ไฟล์จริงอยู่ media สมาชิกดูได้เฉพาะรูปตนเอง admin ดูรูปที่มีสมาชิกอ้างอิงได้
- ฐานข้อมูลเด็กวัดเก็บ `media:<id>` และใช้ API รูปเดิมที่ตรวจ studentId/role
- URL เก่าและ private bucket เดิมยังอ่านได้ ไม่ย้ายหรือลบไฟล์เก่าอัตโนมัติ
- ก่อนเปิด flag ระบบยังทำงานแบบเดิมเพื่อให้ติดตั้งครบก่อน หลังเปิด flag หาก media ล้มเหลว จะตอบ error และไม่ fallback ไป Base64 หรือ Supabase Storage
- รูปสมาชิกที่ยังค้างใน session/browser อาจต้อง refresh หลังบันทึก รูปจาก LINE/Telegram ไม่ได้คัดลอก
- รูปใหม่นี้ไม่ใช่ URL สาธารณะ การส่ง URL ให้ระบบภายนอกดึงโดยไม่มี session จะเปิดไม่ได้ตามสิทธิ์ที่กำหนด
- เสียง วิดีโอ เอกสาร และการย้ายไฟล์เก่ายังเป็นขั้นถัดไป ไม่รับผ่าน endpoint รูปนี้

## การตรวจสอบและย้อนกลับ

Mock tests ครอบคลุม auth, ownership, project, URL, error และ student upload; ยังต้องตรวจ PHP GD/สิทธิ์โฟลเดอร์และอัปโหลดจริงบน Hostinger ตามขั้นตอนข้างบน (เครื่องพัฒนาไม่มี PHP runtime)

หากต้องหยุดเปิดรับรูปแบบใหม่ ตั้ง MEDIA_PRIVATE_ENABLED=false แล้ว redeploy; ตัวอ่านยังอ่านรูป media ที่บันทึกแล้วได้ จึงต้องคง private-media.php ไว้ เมื่อฐานข้อมูลบันทึกล้มเหลวหลังอัปโหลด อาจมีไฟล์ที่ยังไม่มีรายการอ้างอิง; ห้ามลบแบบเหมารวม ให้ตรวจ mapping ก่อนทำ cleanup ภายหลัง
