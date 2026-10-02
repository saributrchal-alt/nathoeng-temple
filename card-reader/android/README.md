# สาริบุตร อ่านบัตร Android 1.5.6

ใช้ package และ signing certificate เดิม ติดตั้ง APK รุ่นนี้ทับ 1.5.3–1.5.5 ได้ รองรับ Android 8 ขึ้นไปที่มี USB Host/OTG และใช้ Chrome ส่งกลับเข้าหน้าเว็บ

## ใช้งาน

1. ติดตั้ง `public/downloads/Saributr-Card-Reader-1.5.6-Android.apk` ทับรุ่นเดิม แล้วรีเฟรชเว็บไซต์
2. ผู้ดูแลเข้าสู่ระบบ `https://watt.nathoeng.com/` เปิด Admin → สมาชิก → เพิ่มสมาชิกใหม่ → เครื่องอ่านบัตร
3. ต่อเครื่องอ่าน CCID ผ่าน OTG แล้วกด **อ่านบัตรและบันทึก** อนุญาต USB หากมีข้อความถาม หากมีหลายเครื่องให้เลือกเครื่องที่ต้องการ
4. ตรวจชื่อ เลขบัตร วันเกิด รูป และที่อยู่กับเจ้าของ แล้วกด **ตรวจข้อมูลแล้ว บันทึกสมาชิกในเว็บ**
5. Chrome กลับไปหน้าสมาชิก เว็บตรวจสมาชิกซ้ำและบันทึก หากเป็นสมาชิกใหม่ เว็บสร้างชื่อผู้ใช้/รหัสผ่านและแสดงให้แจ้งเจ้าของโดยตรง
6. หากแยกจังหวัด อำเภอ หรือตำบลไม่ครบ เว็บให้ตรวจ/เลือกที่อยู่ก่อนบันทึก หากพบสมาชิกเดิม บัญชี/รหัสผ่าน/LINE/Telegram/บทบาทเดิมถูกเก็บไว้

หากเห็น `[CARD_RETURN_MISSING]` ให้ตรวจว่าติดตั้ง **1.5.6** แล้วรีเฟรชเว็บและเริ่มอ่านใหม่ หากคำขอเกิน 5 นาทีหรือบัตรอ่านเกิน 2 นาที ให้เริ่มอ่านใหม่ ใช้ Chrome ที่เปิดเว็บไซต์และเริ่มคำขอเดิม

การส่งข้อมูลเข้าคอมพิวเตอร์ผ่าน Wi-Fi และส่งออก JSON ยังใช้ได้เหมือนเดิม บน iPhone ใช้แบบกรอกโดยเจ้าหน้าที่

## ช่องส่งข้อมูลเข้าเว็บ 1.5.6

เว็บสร้าง nonce 16 ไบต์และกุญแจสุ่ม 32 ไบต์ต่อคำขอ เก็บ nonce/key/เวลาหมดอายุไว้ใน origin ของเว็บ แล้วเปิด Intent ที่ระบุ package `com.saributr.usbprobe` พร้อม `saributr-card://read?nonce=<32 hex>&key=<64 hex>` คำขอใช้ได้ 5 นาที แอปนำข้อมูลออกจาก Intent หลังรับคำขอ

หลังผู้ดูแลยืนยัน แอปเข้ารหัส JSON ด้วย AES-256-GCM, IV สุ่ม 12 ไบต์ และ tag 128 บิต ผูกข้อมูลกับ origin, protocol และ nonce ผ่าน AAD จากนั้นเปิด Chrome ไปยัง `https://watt.nathoeng.com/?reader_nonce=<nonce>#admin-dashboard&reader_card=v1.<iv>.<ciphertext>` กุญแจและข้อมูลบัตรที่อ่านได้ไม่มีอยู่ใน URL ส่งกลับ ข้อมูลเข้ารหัสอยู่เฉพาะ fragment ซึ่งไม่เป็นส่วนของ HTTP request

เว็บรับ fragment ก่อนอ่าน hash route และนำ fragment ข้อมูลออกจาก URL ทันที ยอมถอดรหัสเฉพาะคำขอที่เริ่มในเบราว์เซอร์นี้และยังไม่หมดอายุ ตรวจ tag, nonce, อายุบัตรไม่เกิน 2 นาที และรูปแบบข้อมูลก่อนส่งเข้า API สมาชิกเดิม กุญแจ/nonce ถูกล้างหลังรับสำเร็จหรือข้อมูลไม่ผ่านการตรวจ คำขอหมดอายุถูกล้างเมื่อเว็บตรวจคำขอครั้งถัดไป แอปล้างกุญแจและข้อมูลบัตรหลังเปิด Chrome สำเร็จ

ช่องทางใหม่ไม่ใช้ HTTP localhost จึงไม่ต้องขอสิทธิ์เครือข่ายภายในเครื่องสำหรับการรับข้อมูลบัตรบนมือถือ จำกัด JSON ที่ 32000 ไบต์และ packet ที่ 45000 อักขระ ไม่ส่งกุญแจในคำขอ API หรือเก็บข้อมูลบัตรลงไฟล์เพื่อส่งกลับ

คำขอเก่าที่เริ่มจากเว็บรุ่นเดิมและไม่มีกุญแจยังใช้ `CardHandoffService`/`WebCardBridge` ของ 1.5.5: foreground shortService, loopback `127.0.0.1:8765`, Origin เฉพาะเว็บวัด, nonce, อ่านครั้งเดียว และหมดอายุบัตร 2 นาที เส้นทางนี้อาจต้องให้สิทธิ์เครือข่ายภายในเครื่องใน Chrome คำขอใหม่ที่มีกุญแจจะไม่ fallback ไปช่องทางเก่าเมื่อถอดรหัสไม่ผ่าน

การลงทะเบียนเต็มใช้ `supabase/walkin-member-full-registration.sql` เดิม การอัปเดตจากเว็บ/แอป 1.5.5 เป็น 1.5.6 ไม่ต้องรัน SQL เพิ่ม

## Build และตรวจสอบ

เตรียม Eclipse ECJ, Android platform 35 `android.jar`, Android build tools และ keystore เดิมไว้ภายนอก repository ห้าม commit signing keys หรือรหัสผ่าน

- ใช้ ECJ Java 8 target compile `src/com/saributr/usbprobe/*.java` ด้วย classpath `android.jar`
- ใช้ D8 `--min-api 26` สร้าง `classes.dex` จาก source ของแอปเท่านั้น
- ใช้ AAPT2 link `AndroidManifest.xml`, ใส่ `classes.dex`, zipalign 4 แล้ว apksigner ด้วย keystore เดิม
- ตรวจ APK versionCode 12/versionName 1.5.6, signature v2/v3 และเทียบ certificate กับ APK รุ่นเดิม

`CardReturnCipherTest.java` ตรวจ UTF-8, IV ใหม่, nonce/key binding, การแก้ไข ciphertext, อายุบัตร และขนาดข้อมูล ใช้โหมด `--fixture <synthetic-json>` ร่วมกับ `tests/card-reader-mobile.test.js` ผ่าน `CARD_RETURN_JAVA_CLASSES` เพื่อตรวจ ciphertext จาก Java จริงกับ Web Crypto จริง

`WebCardBridgeTest.java`, `CcidTest.java` และ `ThaiCardTest.java` ตรวจ regression ของ loopback/CCID/ThaiCard เดิม ชุดทดสอบเว็บตรวจการคืน route, ปฏิเสธ callback ปลอม/หมดอายุ/ข้อมูลแก้ไข/กุญแจไม่ถูกต้อง, ไม่เรียก localhost ในช่องทางใหม่ และบันทึกเพียงครั้งเดียวใน React StrictMode

การทดสอบใช้ข้อมูลสังเคราะห์ ยังต้องยืนยัน flow Chrome → แอป → เครื่องอ่านจริง → Chrome → บันทึกสมาชิกบนอุปกรณ์จริงก่อนสรุปผลฮาร์ดแวร์
