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
- **Automated Tests**:
  - เพิ่มชุดทดสอบ `src/lib/__tests__/i18n-thai.test.ts` เพื่อรับประกันความถูกต้องของคีย์และตัวแปรแทรก 100%
  - เพิ่มการทดสอบการตัดบรรทัดภาษาไทยใน `src/lib/__tests__/backend.test.ts`

### Documentation (เอกสารกลาง)
- เพิ่ม `docs/implementation-plan.md` แผนงานพัฒนารองรับภาษาไทย
- เพิ่ม `docs/task.md` รายการและสถานะการดำเนินงาน
- เพิ่ม `docs/walkthrough.md` สรุปขั้นตอนและคุณค่าทางธุรกิจที่ได้รับ
- เพิ่ม `docs/changelog.md` บันทึกประวัติการปรับปรุงระบบ
