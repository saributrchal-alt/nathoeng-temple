# สาริบุตร อ่านบัตร Android 1.5.5

เพิ่มการลงทะเบียนสมาชิกบนมือถือให้แอป 1.5.3 เดิม ใช้ชื่อ package และ signing certificate เดิม จึงติดตั้ง APK รุ่นนี้ทับรุ่น 1.5.3 หรือ 1.5.4 ได้ Android 8 ขึ้นไปที่รองรับ USB Host/OTG; ใช้ Chrome สำหรับการส่งกลับเข้าหน้าเว็บ

## ใช้งาน

1. ผู้ดูแลเข้าสู่ระบบที่ `https://watt.nathoeng.com/` เปิด Admin → สมาชิก → เพิ่มสมาชิกใหม่ → เครื่องอ่านบัตร
2. ต่อเครื่องอ่านบัตร CCID ผ่าน OTG แล้วกด **อ่านบัตรและบันทึก** เพื่อเปิดแอป
3. อนุญาต USB ถ้ามีข้อความถาม แอปอ่านบัตรที่เสียบอยู่ ถ้ามีหลายเครื่องให้เลือกเครื่องที่ต้องการ
4. ตรวจชื่อ เลขบัตร วันเกิด รูป และที่อยู่กับเจ้าของ แล้วกด **ตรวจข้อมูลแล้ว บันทึกสมาชิกในเว็บ**
5. Chrome กลับไปหน้าสมาชิก เว็บตรวจสมาชิกซ้ำและบันทึก หากเป็นสมาชิกใหม่ เว็บสร้างชื่อผู้ใช้/รหัสผ่านและแสดงให้แจ้งเจ้าของโดยตรง
6. หากแยกจังหวัด อำเภอ หรือตำบลไม่ครบ เว็บให้ตรวจ/เลือกที่อยู่ก่อนกดบันทึก หากพบสมาชิกเดิม บัญชี/รหัสผ่าน/LINE/Telegram/บทบาทเดิมถูกเก็บไว้

การส่งข้อมูลเข้าคอมพิวเตอร์ผ่าน Wi-Fi และการส่งออก JSON ยังใช้ได้เหมือนรุ่น 1.5.3 บน iPhone ใช้แบบกรอกโดยเจ้าหน้าที่

## ช่องส่งข้อมูลเข้าเว็บ

แอปรับ deep link `saributr-card://read?nonce=<32 lowercase hex>` และเปิด Chrome กลับเฉพาะ `https://watt.nathoeng.com/?reader_nonce=<nonce>#admin-dashboard` URL ไม่มีข้อมูลบัตร เว็บรับกลับเฉพาะ nonce ที่เกิดจากการกดอ่านของผู้ดูแลภายใน 5 นาที

`WebCardBridge` bind เฉพาะ `127.0.0.1:8765` หลังเจ้าหน้าที่กดยืนยัน แอปเก็บ JSON และ nonce ในหน่วยความจำไม่เกิน 2 นาที ยอมให้ Origin `https://watt.nathoeng.com` อ่านเพียงครั้งเดียวผ่าน `/v1/card/latest?token=<nonce>` ไม่ใช้ wildcard CORS ไม่ส่งบัตรออกอินเทอร์เน็ตจาก native app ไม่เก็บข้อมูลบัตรลงไฟล์สำหรับช่องทางนี้ และล้างข้อมูลเมื่อเครื่องอ่านถูกถอด ยกเลิกการส่ง นำแอปออกจากรายการล่าสุด หรือหมดอายุ รุ่น 1.5.5 ใช้ CardHandoffService แบบ foreground shortService รักษาช่องส่งข้อมูลระหว่างสลับไป Chrome โดยเริ่ม service และเปิด socket ก่อนเปิด Chrome หน้าจอแอปถูกพักหรือทำลายได้โดยไม่ปิดช่องส่งข้อมูล มี notification รอส่งข้อมูลพร้อมปุ่มยกเลิกและล้างข้อมูล ไม่มีชื่อหรือเลขบัตรบน notification และ service หยุดทันทีเมื่อรับสำเร็จ ถอด USB ยกเลิก หรือครบอายุบัตร 2 นาที ไม่ restart service หรือเก็บบัตรลง disk

Chrome อาจขออนุญาตเข้าถึงเครือข่ายภายในเครื่อง ให้กดอนุญาต เว็บไซต์รอคำตอบได้ 1 นาที และเก็บคำขอไว้เมื่อรับไม่สำเร็จเพื่อให้กด **รับข้อมูลบัตรอีกครั้ง** ได้ โดยไม่ต้องอ่านบัตรซ้ำภายใน 2 นาที หากปฏิเสธสิทธิ์ไว้ ให้เปิดสิทธิ์ของ watt.nathoeng.com ใน Chrome แล้วลองใหม่ หากเกิน 2 นาทีต้องอ่านบัตรใหม่

ก่อนเปิดจริงต้องรัน `supabase/walkin-member-full-registration.sql` ใน Supabase ของวัดและ deploy ชุดฟอร์ม/API นี้ก่อน APK รุ่นนี้จะบันทึกข้อมูลเต็มได้

## Build

เตรียม Eclipse ECJ, Android platform 35 `android.jar`, Android build tools 35 และ keystore เดิมไว้ภายนอก repository ห้าม commit signing keys จาก source archive เดิม

- ใช้ ECJ Java 8 target compile `src/com/saributr/usbprobe/*.java` ด้วย classpath `android.jar`
- ใช้ D8 `--min-api 26` สร้าง `classes.dex`
- ใช้ AAPT2 link `AndroidManifest.xml` ใส่ `classes.dex`, zipalign 4 แล้ว apksigner ด้วย keystore เดิม
- ตรวจ `apksigner verify` และเทียบ certificate กับ APK 1.5.3 ก่อนแจก

`WebCardBridgeTest.java` ทดสอบ origin, nonce, OPTIONS/PNA, method, การอ่านครั้งเดียว, อายุข้อมูล และการล้าง ส่วน `CcidTest.java` และ `ThaiCardTest.java` เป็น regression tests ของโปรโตคอลเดิม ชุดนี้ผ่านการ compile, protocol/bridge tests และ APK signature verification แต่ยังต้องทดลอง flow Chrome → แอป → เครื่องอ่านจริง → Chrome บนมือถือจริงก่อนยืนยันผลฮาร์ดแวร์

ผลตรวจรุ่น 1.5.5: compile Android platform 35, bridge callback/CCID/ThaiCard tests, APK v2/v3 signature และ certificate เดิมผ่าน ทดสอบเว็บเมื่อ fetch ถูกปฏิเสธครั้งแรกแล้ว retry รวมถึง StrictMode และป้องกันกดซ้ำผ่าน ยังต้องให้ผู้ดูแลทดลองการสลับแอปและ Chrome permission บนอุปกรณ์จริง
