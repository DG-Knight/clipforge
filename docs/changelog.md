# บันทึกการเปลี่ยนแปลง (Changelog)

## [v0.9.11] - 2026-09-28

### Added (เพิ่มฟีเจอร์ใหม่)
- **เอกสารโครงการภาษาไทย (Thai README)**:
  - แปลง `README.md` หลักเป็นภาษาไทยฉบับสมบูรณ์ พร้อมสรุปฟีเจอร์เด่น ภาพรวมระบบ และคู่มือติดตั้ง
  - ย้ายเอกสารภาษาจีนเดิมไปที่ `README.zh.md`
  - อัปเดตแถบนำทางสลับภาษาใน `README.md` (ไทย), `README.en.md` (อังกฤษ), และ `README.zh.md` (จีน) ให้เชื่อมโยงถึงกัน
- **รองรับภาษาไทยเต็มรูปแบบในระบบ (Full Thai Localization)**:
  - เพิ่ม Locale `th` ในระบบจัดการภาษา `src/lib/i18n/config.ts`
  - รองรับการตรวจจับภาษาอัตโนมัติจากบราวเซอร์ (`th`, `th-TH`) เพื่อเปลี่ยนเป็นภาษาไทยให้อัตโนมัติ
  - เพิ่มไฟล์คำแปลภาษาไทยครบทั้ง 21 โมดูลใน `src/lib/i18n/messages/` ประกอบด้วย:
    - `common.ts`, `home.ts`, `start.ts`, `topic.ts`, `newProject.ts`
    - `clone.ts`, `batch.ts`, `products.ts`, `settings.ts`, `generationSettings.ts`
    - `showcase.ts`, `script.ts`, `assets.ts`, `video.ts`, `exportPage.ts`
    - `projectsPage.ts`, `presenters.ts`, `mediaLab.ts`, `production.ts`, `transcript.ts`, `materials.ts`
- **เพิ่มเสียงพากย์ภาษาไทยใน Edge TTS**:
  - `th-TH-PremwadeeNeural` (เสียงผู้หญิง - นุ่มนวล ชัดเจน)
  - `th-TH-NiwatNeural` (เสียงผู้ชาย - มั่นใจ ทางการ)
- **ระบบคำบรรยายภาษาไทย (Thai Video Subtitles)**:
  - รองรับการตัดคำภาษาไทยอัตโนมัติ (`wrapCaption`) โดยใช้ `Intl.Segmenter` ป้องกันการตัดคำขาดกลางประโยค
  - จัดการสระบน-ล่างและวรรณยุกต์ (Combining Marks) ให้มีขนาดความกว้างเป็น 0 เพื่อการคำนวณขนาดบรรทัดที่แม่นยำ
  - ป้องกันสระและวรรณยุกต์ลอยขึ้นต้นบรรทัดใหม่ (`NO_LINE_START`)
  - รองรับฟอนต์ภาษาไทยของระบบปฏิบัติการ (Leelawadee UI, Tahoma, Thonburi, Noto Sans Thai)
- **ตัวติดตั้ง Windows Application (.exe Installer)**:
  - สร้างไฟล์ติดตั้ง NSIS สำหรับ Windows สำเร็จ: `ClipForge Setup 0.9.10.exe` (158 MB)
  - ผู้ใช้ทั่วไปสามารถติดตั้งและเปิดใช้งานโปรแกรมได้ทันทีโดยไม่ต้องใช้คอนโซลหรือคำสั่งโปรแกรมเมอร์
  - ผูกรวมโมเดลฐานข้อมูล `better-sqlite3` ที่คอมไพล์เข้ากับ Electron ABI 146
  - รวมไบนารี `ffmpeg` และ `ffprobe` ไว้ในตัวโปรแกรม ไม่จำเป็นต้องติดตั้งโปรแกรมตัดต่อเสริมภายนอก
- **ชุดข้อมูลตัวอย่างภาษาไทย (Thai Onboarding Examples)**:
  - เพิ่มตัวอย่างสินค้าภาษาไทย (แก้วปั่นพกพา, กาแฟ Cold Brew, ทิชชู่หนานุ่ม)
  - เพิ่มเทมเพลตโครงสร้างคลิปภาษาไทย (เจาะจุดเจ็บปวด, เปรียบเทียบรีวิว, เรื่องราวละคร)
  - เพิ่มตัวอย่างโชว์เคสวิดีโอภาษาไทยพร้อมพรีวิว
- **Automated Tests**:
  - เพิ่มชุดทดสอบ `src/lib/__tests__/i18n-thai.test.ts` เพื่อรับประกันความถูกต้องของคีย์และตัวแปรแทรก 100%
  - เพิ่มการทดสอบการตัดบรรทัดภาษาไทยใน `src/lib/__tests__/backend.test.ts`

### Fixed (แก้ไขข้อผิดพลาดและปรับปรุง)
- **กำจัดข้อความภาษาจีนตกค้าง (Hardcoded Chinese Strings Elimination)** ตามรายงาน `chinese-text-audit-report.md`:
  - ปรับค่าเริ่มต้น `DEFAULT_LOCALE` เป็นภาษาไทย (`th`) และจัดลำดับการสลับภาษาเป็น `["th", "en", "zh"]`
  - อัปเดต HTML Metadata และ `lang="th"` ใน Root Layout (`src/app/layout.tsx`)
  - แก้ไขปุ่มสลับภาษา `LanguageToggle` ให้แสดงคำอธิบายรองรับ 3 ภาษาอย่างครบถ้วน
  - แปลงสถานะโมเดลใน `ModelCatalogStatus` ให้รองรับภาษาไทยทุกกรณี
  - แปลงข้อมูลเชิงสถิติ (ยอดวิว, ตัวชี้วัด, สไตล์ 39 สไตล์) ใน `PerformanceFeedback` เป็นภาษาไทย
  - แปลงชื่อผู้ให้บริการ AI ใน `GenerationSettings` ให้เป็นชื่อแบรนด์สากล
  - เพิ่มคำแปลตัวเลือก BGM, คุณภาพ, รูปแบบซับไตเติล และปุ่มตัวกรองในหน้าสร้างโปรเจกต์ใหม่ (`src/app/project/new/page.tsx`)
  - เพิ่มคำแปลภาษาไทยในกลุ่มเทมเพลตโฆษณา (`src/lib/ad-templates.ts`)
  - รองรับการแสดงผลคำอธิบาย Variation Slot เป็นภาษาไทยในหน้าการผลิตวิดีโอแบบกลุ่ม (`src/app/batch/page.tsx`)
  - ปรับปรุงข้อความแจ้งเตือนข้อผิดพลาดในการอัปโหลดไฟล์ในเครื่อง (`src/lib/upload-local-material.ts`)
  - เพิ่มการรองรับข้อความภาษาไทยใน `LLMRequestError` (`src/lib/llm-error.ts`) พร้อมรักษาความเข้ากันได้ย้อนหลังกับชุดทดสอบเดิม
  - รองรับภาษาไทยในข้อความแจ้งเตือนข้อผิดพลาด (`friendly-error.ts`), เวลาสัมพัทธ์ (`relative-time.ts`), และการประเมินคุณภาพคลิป (`publish-readiness.ts`)


### Documentation (เอกสารกลาง)
- เพิ่ม `docs/implementation-plan.md` แผนงานพัฒนารองรับภาษาไทย
- เพิ่ม `docs/task.md` รายการและสถานะการดำเนินงาน
- เพิ่ม `docs/walkthrough.md` สรุปขั้นตอนและคุณค่าทางธุรกิจที่ได้รับ
- เพิ่ม `docs/changelog.md` บันทึกประวัติการปรับปรุงระบบ

