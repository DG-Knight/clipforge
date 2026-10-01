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

- [x] **14. แก้ไขบัคหลบซ่อนและปรับปรุงการสร้างวิดีโอขายสินค้าสำหรับตลาดไทย (Systematic Thai E-Commerce Pipeline Fixes)**
  - [x] 14.1 แก้ไขปัญหา Script Engine หลุดเป็นภาษาอังกฤษ/จีนเมื่อระบุชื่อสินค้าภาษาอังกฤษ (เช่น แบรนด์ Dyson, Sony, Apple) หรือภาษาจีน (สินค้า 1688) โดยเพิ่ม `locale` ใน `ScriptGenerationInput`, `TopicScriptInput` และปรับแต่ง `buildUserPrompt` กับ `buildTopicPrompt` บังคับภาษาไทยตามบริบท TikTok Shop TH / Shopee TH / Reels TH
  - [x] 14.2 กำหนดอัตราความเร็วการพูดภาษาไทย (10-14 ตัวอักษร/วินาที หรือ 3-4 คำ/วินาที) คำลงท้ายสุภาพ (ครับ/ค่ะ) และการเปิด Hook/ปิดการขายสไตล์ไทย (กดตะกร้าเหลือง, มีเก็บเงินปลายทาง)
  - [x] 14.3 ปรับปรุง API `/api/llm/script`, `/api/topic/script`, `/api/tts/free` และฟังก์ชัน `pickLocale` ใน `src/lib/api-error.ts` ให้รับรู้ locale `th` และส่งคืนเสียงพากย์ดีฟอลต์ไทย `th-TH-PremwadeeNeural`
  - [x] 14.4 เชื่อมต่อส่งต่อ `locale` จากทุกหน้าของ Frontend (`/start`, `/project/[id]/script`, `/project/new`, `/project/clone`, `/project/topic`, `/batch`)
  - [x] 14.5 เพิ่มระบบ Smart Latin Token Extraction ใน `broadenQuery` ของ `src/lib/stock-matcher.ts` ให้สามารถดึงชื่อแบรนด์/รุ่นภาษาอังกฤษจากชื่อสินค้าภาษาไทยไปค้นหาฟุตเทจ Pexels/Pixabay ได้อย่างแม่นยำ ไม่หลุดไป universal fallback
  - [x] 14.6 พัฒนาชุดทดสอบอัตโนมัติ `src/lib/__tests__/thai-systematic-pipeline.test.ts` และรันการทดสอบทั้งหมดผ่าน 100%
  - [x] 14.7 แปลงข้อความคำสั่งกำกับมุมกล้อง (Camera Movement) เป็นภาษาไทยและสากล: ตัดคำนำหน้า `镜头:` ทิ้ง, แปลงชื่อมุมกล้องจีนเป็นภาษาไทยสำหรับ UI display (`formatCameraForDisplay`), ปรับปรุง `cameraPresetGuide` ให้ไกด์เป็นภาษาอังกฤษเมื่อเป็นภาษาไทย, เปลี่ยนไอคอนนาฬิกาเป็นไอคอนกล้องวิดีโอ (`<LuVideo>`) และเพิ่มชุดทดสอบ `camera-display.test.ts` ผ่าน 100%

- [x] **15. ออกแบบ Custom Delete Confirmation Dialog แทนที่ Browser window.confirm**
  - [x] 15.1 แทนที่กล่องยืนยันของเบราว์เซอร์ (`window.confirm`, `window.alert`) ด้วย Custom Dialog สไตล์ Modern Dark Glassmorphism ใน `src/app/projects/page.tsx`
  - [x] 15.2 เพิ่มไอคอนคำเตือนเรืองแสง, การ์ดแสดงพรีวิวโปรเจกต์ที่กำลังจะถูกลบ (ภาพปก/ชื่อโปรเจกต์/ชื่อสินค้า), ปุ่มยกเลิกและปุ่มยืนยันสีแดงอันตราย พร้อมสถานะกำลังลบ (`isDeleting` spinner)
  - [x] 15.3 เพิ่มคีย์คำแปลครบทั้ง 3 ภาษาใน `src/lib/i18n/messages/projectsPage.ts` (`deleteDialogTitle`, `deleteDialogDesc`, `deleteDialogCancel`, `deleteDialogConfirm`, `deleteInProgress`)
  - [x] 15.4 ตรวจสอบความถูกต้องด้วย `tsc --noEmit` และรันชุดทดสอบ i18n ผ่าน 100%

- [x] **16. สแกนตรวจสอบกล่องข้อความ Windows ทั่วทั้งระบบ และเพิ่ม Custom Dialog ในส่วนที่เหลือ**
  - [x] 16.1 สแกนหาคำสั่ง `window.confirm`, `window.alert`, `window.prompt`, `confirm(`, `alert(` ทั่วทั้ง codebase ยืนยันว่าไม่มีจุดใดใน UI ที่ยังเรียกใช้ Dialog ระบบปฏิบัติการ Windows อีกแล้ว
  - [x] 16.2 ยกระดับระบบความปลอดภัยและความสวยงาม: เพิ่ม Custom Confirmation Dialog สไตล์ Dark Glassmorphism สำหรับ **การลบสินค้าในคลังสินค้า** (`/products`) พร้อมการ์ดภาพสินค้าและชื่อสินค้า
  - [x] 16.3 เพิ่ม Custom Confirmation Dialog สไตล์ Dark Glassmorphism สำหรับ **การลบตัวละครในคลังผู้ประกาศ** (`/presenters` & `PresenterManager`) พร้อมการ์ดแสดงรูปและชื่อผู้ประกาศ
  - [x] 16.4 เพิ่มคีย์ภาษา i18n ครบ 3 ภาษาใน `products.ts` และ `settings.ts` พร้อมผ่าน Automated Tests และ Type Checking 100%

- [x] **17. ปรับดีไซน์ Scrollbar ทั้งระบบให้เป็นหนึ่งเดียวกับโปรแกรม (Custom Studio Dark Scrollbar)**
  - [x] 17.1 กำจัด Scrollbar สีขาวของ Windows แบบดั้งเดิมในทุกหน้าและทุกคอนเทนเนอร์ (รวมถึงกล่องเลือกโมเดลในหน้าตั้งค่า, ไซด์บาร์, หน้าต่างป๊อปอัป และเนื้อหาหลัก)
  - [x] 17.2 ออกแบบสไตล์ Dark Glassmorphism: แถบเลื่อนบาง 6px ขอบมนแคปซูล รางโปร่งใส ตัวเลื่อนสีขาวโปร่งแสง และเปลี่ยนเป็นสีม่วงสดใสของแบรนด์เมื่อนำเมาส์ไปชี้ (Hover) หรือคลิกลาก (Active)
  - [x] 17.3 ซ่อนปุ่มลูกศรหัวท้ายของ Windows Scrollbar ทิ้งอย่างเด็ดขาด
  - [x] 17.4 รองรับทั้ง WebKit/Chromium/Electron และ W3C Standard Scrollbar

- [x] **18. แก้ไขปัญหาเสียงพากย์ขาดหาย (ซับขึ้นแต่ไม่มีเสียง) และแก้คำลงท้ายเสียงผู้หญิงใช้ "ครับ" ในโหมดตัดต่อด่วน**
  - [x] 18.1 พัฒนาโมดูลแปลงคำลงท้ายสุภาพตามเพศผู้พากย์ `alignThaiPoliteParticles` ใน `src/lib/thai-gender.ts` (แปลง "ครับ/นะครับ/เลยครับ" ↔ "ค่ะ/นะคะ/เลยค่ะ" และประโยคคำถามอย่างแม่นยำ)
  - [x] 18.2 เพิ่มฟังก์ชันระบุเพศเสียง `genderOfVoice` ใน `src/lib/tts-voices.ts` และ re-export ใน `src/lib/edge-tts.ts`
  - [x] 18.3 ปรับปรุง Prompt สคริปต์ภาษาไทยใน `src/lib/script-engine/prompts.ts` สั่ง AI บังคับใช้คำลงท้าย "ค่ะ/นะคะ" ตามเสียงพากย์ดีฟอลต์หญิง (เปรมวดี)
  - [x] 18.4 แก้ไขเงื่อนไขการสร้างเสียงพากย์ใน `src/app/api/project/[id]/compose/route.ts` ให้สังเคราะห์เสียง TTS เสมอเมื่อมีบทพูด โดยไม่ถูกบล็อกด้วยแทร็กเสียงเดิมของวิดีโอสต็อก (B-roll)
  - [x] 18.5 เพิ่มระบบ Retry 3 ครั้งพร้อม Exponential Backoff ใน `buildVoiceover` ป้องกันปัญหาเสียงหลุดจากความไม่เสถียรของเครือข่าย
  - [x] 18.6 ปิดเสียง ambient noise ของวิดีโอสต็อกเมื่อมีเสียงพากย์ AI เพื่อให้เสียงพากย์คมชัด ไร้เสียงลมรบกวน
  - [x] 18.7 ซิงค์บทพากย์ที่ปรับคำลงท้ายแล้วเข้าสู่ซับไตเติล ให้ตัวหนังสือและเสียงพูดตรงกัน 100%
  - [x] 18.8 พัฒนา Automated Unit Tests `src/lib/__tests__/thai-gender.test.ts` และรันผ่านครบ 100%

- [x] **19. แก้ไขบัค UI ป้ายประเภทช็อต (Shot Type Badges) ล้นและถูกขอบซ้ายตัดขาดในการ์ดไทม์ไลน์**
  - [x] 19.1 ขยายความกว้างของคอลัมน์ซ้ายในการ์ดช็อตจาก `w-16` (64px) เป็น `w-28` (112px) พร้อมใส่ padding `px-1.5` ใน `src/app/project/[id]/script/page.tsx`
  - [x] 19.2 ปรับปรุงและป้องกันการตัดขอบในการ์ดมีเดีย (`src/app/project/[id]/assets/page.tsx`) แบบเดียวกัน เพื่อความสม่ำเสมอทั้งระบบ
  - [x] 19.3 เพิ่มคลาส `max-w-full text-center truncate px-2 py-0.5 font-medium` และ `title` ในคอมโพเนนต์ Badge เพื่อให้ข้อความอยู่ตรงกลางกล่องอย่างสวยงาม ไม่ล้นและไม่ถูกตัดขอบ
  - [x] 19.4 ปรับข้อความป้าย `shotTypeSocialProof` ในไฟล์ i18n (`script.ts`, `assets.ts`, `video.ts`, `showcase.ts`) ให้กระชับเป็น `"การันตี (Proof)"` พอดีกับขนาด Badge
  - [x] 19.5 ตรวจสอบด้วย `tsc --noEmit` และรันชุดทดสอบ i18n ผ่าน 100%

- [x] **20. แก้ไขปัญหา Build Error และข้อผิดพลาดในคำสั่ง `pnpm build && pnpm bundle:standalone`**
  - [x] 20.1 ตรวจสอบและค้นหาสาเหตุที่แท้จริง: สคริปต์ `bundle-standalone.mjs` เดิมทำการค้นหาโฟลเดอร์ `.next/standalone/.next/node_modules/better-sqlite3-*` ซึ่งบนระบบ Windows นั้น Next.js สร้างเป็น Directory Junction ชี้กลับไปยัง `root node_modules/better-sqlite3` ทำให้คำสั่งแทนที่ไฟล์ไปลบและเขียนทับ `better_sqlite3.node` ใน root workspace ให้กลายเป็น Electron ABI (146) ส่งผลให้การรัน `pnpm build` ถัดมาเกิดข้อผิดพลาด `The module was compiled against a different Node.js version using NODE_MODULE_VERSION 146. This version of Node.js requires NODE_MODULE_VERSION 147.` เต็มหน้าจอ
  - [x] 20.2 ปรับปรุงสคริปต์ `scripts/bundle-standalone.mjs` ให้ตรวจสอบสถานะ Directory Junction/Symlink บน Windows: ทำการตัดการเชื่อมต่อ (unlink junction) ทิ้ง แล้วคัดลอกโฟลเดอร์ไบนารี Electron ABI แยกออกมาเป็นโฟลเดอร์อิสระใน standalone โดยไม่แตะต้อง root `node_modules` อีกต่อไป
  - [x] 20.3 ทำการ Rebuild `better-sqlite3` ใน root workspace ให้กลับมาเป็น Node ABI (147) เพื่อรองรับการทำงานของ Next.js Turbopack build
  - [x] 20.4 เพิ่มคอนฟิก `metadataBase` ใน `src/app/layout.tsx` เพื่อกำจัดคำเตือน metadata base ของ Next.js ตอน build
  - [x] 20.5 ตรวจสอบและรันคำสั่ง `pnpm build && pnpm bundle:standalone` ยืนยันว่าการ build ทั้ง 50 หน้าผ่านฉลุย ไร้ Error สีแดง 100%


