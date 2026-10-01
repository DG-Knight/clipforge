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

- [x] **8. กำจัดข้อความภาษาจีนที่ฝังในโค้ดตามรายงาน Audit (chinese-text-audit-report.md)**
  - [x] 8.1 ปรับ `DEFAULT_LOCALE = "th"` และลำดับภาษา `["th", "en", "zh"]` ใน `src/lib/i18n/config.ts`
  - [x] 8.2 เพิ่ม Metadata ภาษาไทยและตั้งค่า `<html lang="th">` ใน `src/app/layout.tsx`
  - [x] 8.3 ปรับปุ่มสลับภาษา `src/components/language-toggle.tsx` รองรับ 3 ภาษาอย่างสมบูรณ์
  - [x] 8.4 แปลงสถานะโมเดลใน `src/components/model-catalog-status.tsx` ให้มีภาษาไทยครบถ้วน
  - [x] 8.5 แปลงป้ายกำกับสไตล์ 39 สไตล์, ยอดวิว, ตัวชี้วัดประสิทธิภาพใน `src/components/performance-feedback.tsx`
  - [x] 8.6 เปลี่ยนชื่อคลาวด์จีนเป็นชื่อสากลใน `src/components/generation-settings.tsx`
  - [x] 8.7 เพิ่มคำแปล BGM, คุณภาพ, รูปแบบคำบรรยาย และตัวกรองใน `src/app/project/new/page.tsx`
  - [x] 8.8 เพิ่มคำแปลภาษาไทยใน `AD_TEMPLATE_GROUPS` ของ `src/lib/ad-templates.ts`
  - [x] 8.9 รองรับการแสดงผลรายละเอียด Variation Slot ภาษาไทยใน `src/lib/variation-plan.ts` และ `src/app/batch/page.tsx`
  - [x] 8.10 ปรับแต่งข้อความแจ้งเตือนการอัปโหลดไฟล์ใน `src/lib/upload-local-material.ts`
  - [x] 8.11 เพิ่มฟิลด์ `th` และ `getMessage()` ใน `src/lib/llm-error.ts` พร้อมรักษาความเข้ากันได้ของเทสต์เดิม
  - [x] 8.12 รันการทดสอบอัตโนมัติ 115 tests ผ่าน 100%

- [x] **10. สร้างตัวติดตั้ง Windows Application (.exe Installer)**
  - [x] 10.1 ปรับแต่ง Type และฟังก์ชัน i18n สำหรับการคอมไพล์ Production Build (`Next.js Build`)
  - [x] 10.2 เพิ่มชุดข้อมูลตัวอย่างสินค้า เทมเพลต และโชว์เคสภาษาไทยใน `src/lib/examples.ts`
  - [x] 10.3 รองรับภาษาไทยในข้อความแจ้งเตือนข้อผิดพลาด (`friendly-error.ts`), เวลาสัมพัทธ์ (`relative-time.ts`), และการประเมินคุณภาพคลิป (`publish-readiness.ts`)
  - [x] 10.4 ผูกรวมทรัพยากร Standalone และคอมไพล์ native modules (Better-SQLite3) เข้ากับ Electron ABI
  - [x] 10.5 แพ็กเกจระบบเป็นไฟล์ติดตั้ง Windows NSIS Installer สำเร็จ: `release/ClipForge Setup 0.9.10.exe` (158 MB)

- [x] **11. แก้ไขข้อบกพร่องแกนกลางการสร้างวิดีโอภาษาไทย (Core Thai Video Pipeline Fixes)**
  - [x] 11.1 เสียงพากย์ดีฟอลต์ภาษาไทยอัตโนมัติ (`src/lib/tts-voices.ts`, `src/app/api/project/[id]/compose/route.ts`, `src/app/project/[id]/video/page.tsx`)
  - [x] 11.2 กรรมการ AI ตรวจสคริปต์รองรับภาษาไทย (`src/lib/script-judge.ts`)
  - [x] 11.3 ลบคำลงท้ายสุภาพ "ครับ/ค่ะ/คะ" ออกจากรายการคำฟุ่มเฟือย (`src/lib/transcript-editor.ts`)
  - [x] 11.4 แก้ไขฟอนต์ภาพหน้าปก (Cover) และการ์ดสรุป (Carousel) ให้แสดงภาษาไทยถูกต้อง (`src/lib/video-composer/cover.ts`, `carousel.ts`)
  - [x] 11.5 แก้ไขระบบแบ่งท่อนคำบรรยายสั้น `chunkCaption` ภาษาไทย (`src/lib/video-composer/composer.ts`)
  - [x] 11.6 แก้ไขระบบคาราโอเกะไม่ให้ทิ้งเครื่องหมาย `฿` และสัญลักษณ์ (`src/lib/video-composer/karaoke.ts`)
  - [x] 11.7 ปรับปรุงข้อจำกัดความสมจริงสินค้าในพรอมต์ภาพให้เป็นสากล (`src/app/project/[id]/assets/page.tsx`)
  - [x] 11.8 เพิ่มชุดทดสอบอัตโนมัติและรันการทดสอบยืนยันผล 100%

- [x] **12. แก้ไขสกุลเงินตามภาษา (Currency Localization Fixes)**
  - [x] 12.1 ปรับปรุงสัญลักษณ์สกุลเงินในหน้าแรก (`/start`) และหน้าสร้างโปรเจกต์ (`/project/new`) ให้แสดง `฿` เมื่อเป็นภาษาไทย
  - [x] 12.2 เพิ่มการรองรับสกุลเงินบาท THB (`฿`) ในระบบดึงข้อมูลสินค้าจากลิงก์ (`src/lib/product-ingest.ts`)
  - [x] 12.3 ปรับปรุงการนำเข้าตัวอย่างสินค้าในคลังสินค้าและโหมดผลิตชุด (`products/page.tsx`, `batch/page.tsx`) ให้ติดสัญลักษณ์สกุลเงินตามภาษา
  - [x] 12.4 เพิ่มชุดทดสอบอัตโนมัติยืนยันความถูกต้อง 100%

- [x] **13. จัดทำเอกสารคู่มือการติดตั้งและการรันระบบ (Setup & Run Documentation)**
  - [x] 13.1 จัดทำไฟล์ `HOW_TO_RUN.md` รวบรวมวิธีติดตั้ง, การเปิดโหมด Dev (`pnpm dev`), โหมด Desktop (`pnpm electron`), การบิลด์ `.exe` (`pnpm dist`) และวิธีแก้ปัญหาเบื้องต้น
  - [x] 13.2 เชื่อมโยงคู่มือ `HOW_TO_RUN.md` เข้ากับส่วนบนสุดของ `README.md`


