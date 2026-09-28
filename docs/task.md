# รายการงานพัฒนารองรับภาษาไทย (Tasks)

- [x] **1. เตรียมความพร้อมและโครงสร้างแกนกลาง i18n**
  - [x] 1.1 อัปเดต `src/lib/i18n/config.ts` (เพิ่ม `th`, ปรับ `LOCALES`, `LOCALE_LABELS`, `NamespaceMessages`, และ `detectBrowserLocale()`)
  - [x] 1.2 อัปเดต `src/lib/i18n/messages/index.ts` (ผูกข้อความภาษาไทยเข้ากับระบบกลาง)

- [x] **2. แปลและเพิ่มข้อความภาษาไทยในทุก Namespace (ครบถ้วน 21 ไฟล์ 100%)**
  - [x] 2.1 `common.ts` (ปุ่ม, เมนูนำทาง, สถานะทั่วไป)
  - [x] 2.2 `home.ts` (หน้าแรก, เมนูหลัก)
  - [x] 2.3 `start.ts` (การเริ่มต้นสร้างวิดีโอ)
  - [x] 2.4 `topic.ts` (หัวข้อและธีม)
  - [x] 2.5 `newProject.ts` (วิซาร์ดสร้างโปรเจกต์)
  - [x] 2.6 `clone.ts` (ฟังก์ชันโคลนคลิปดัง)
  - [x] 2.7 `batch.ts` (การประมวลผลเป็นชุด)
  - [x] 2.8 `products.ts` (คลังสินค้า)
  - [x] 2.9 `settings.ts` (การตั้งค่าระบบและโมเดล AI)
  - [x] 2.10 `generationSettings.ts` (การตั้งค่าการสร้าง)
  - [x] 2.11 `showcase.ts` (ตัวอย่างผลงาน)
  - [x] 2.12 `script.ts` (สคริปต์และบทพากย์)
  - [x] 2.13 `assets.ts` (การจัดการวัตถุดิบและสื่อ)
  - [x] 2.14 `video.ts` (วิดีโอและตัวอย่าง)
  - [x] 2.15 `exportPage.ts` (การส่งออกวิดีโอ)
  - [x] 2.16 `projectsPage.ts` (รายการโปรเจกต์)
  - [x] 2.17 `presenters.ts` (ผู้ประกาศ/ผู้พากย์)
  - [x] 2.18 `mediaLab.ts` (แล็บสื่อ)
  - [x] 2.19 `production.ts` (การผลิตวิดีโอ)
  - [x] 2.20 `transcript.ts` (การถอดเสียงและข้อความ)
  - [x] 2.21 `materials.ts` (คลังวัตถุดิบ)

- [x] **3. รองรับเสียงพากย์ภาษาไทย (Thai Text-To-Speech)**
  - [x] 3.1 เพิ่มเสียงภาษาไทยใน `src/lib/tts-voices.ts` (เสียงพรีเมียมฟรี: Premwadee หญิง และ Niwat ชาย)

- [x] **4. การเรนเดอร์คำบรรยายภาษาไทยในวิดีโอ (Video Caption & Typography)**
  - [x] 4.1 อัปเดต `resolveChineseFontFile()` และ `resolveChineseFontFamily()` ใน `src/lib/video-composer/composer.ts` ให้รองรับฟอนต์ภาษาไทยและระบบปฏิบัติการต่างๆ
  - [x] 4.2 พัฒนาระบบตัดคำและตัดบรรทัด `wrapCaption` สำหรับภาษาไทย ด้วย `Intl.Segmenter` โดยไม่ตัดกลางคำ และคำนึงถึงสระ/วรรณยุกต์ลอย (Combining marks)

- [x] **5. ปรับปรุงและการทดสอบอัตโนมัติ (Automated Testing)**
  - [x] 5.1 สร้างไฟล์ทดสอบ `src/lib/__tests__/i18n-thai.test.ts` เพื่อตรวจเช็คความครบถ้วนของคีย์คำแปล 100%
  - [x] 5.2 ตรวจสอบตัวแปรแทรก `{...}` ในคำแปลภาษาไทยว่าตรงกับภาษาต้นฉบับ
  - [x] 5.3 เพิ่มเคสทดสอบ `wrapCaption` ภาษาไทยใน `src/lib/__tests__/backend.test.ts`
  - [x] 5.4 รันชุดทดสอบด้วย Vitest ผ่านครบทุกการทดสอบ

- [x] **6. เอกสาร README ภาษาไทยฉบับสมบูรณ์ (ทางเลือกที่ 2)**
  - [x] 6.1 ย้ายเอกสารภาษาจีนเดิมไปที่ `README.zh.md`
  - [x] 6.2 แปลงไฟล์หลัก `README.md` เป็นภาษาไทยฉบับสมบูรณ์ พร้อมภาพรวม ฟีเจอร์เด่น และขั้นตอนติดตั้ง
  - [x] 6.3 อัปเดตแถบสลับภาษาเชื่อมโยงกันระหว่าง `README.md` (ไทย), `README.en.md` (อังกฤษ), และ `README.zh.md` (จีน)

- [x] **7. บันทึกและสรุปเอกสาร (Documentation & Changelog)**
  - [x] 7.1 อัปเดต `docs/walkthrough.md`
  - [x] 7.2 อัปเดต `docs/changelog.md`
  - [x] 7.3 Commit งานเข้าสู่ Git
