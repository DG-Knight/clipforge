# แฮนด์โอเวอร์: งานรองรับภาษาไทยทั้งระบบ (ClipForge)

> อัปเดตล่าสุด: 29 กันยายน 2026
> สถานะ: **งานตามขอบเขต P0–P3 เสร็จสมบูรณ์** — typecheck ผ่าน, tests ที่เกี่ยวข้องผ่านทั้งหมด
> เอกสารนี้สำหรับกลับมาทำต่อ: ทบทวนงานที่ทำไป, งานเก็บกวาดที่เหลือ, และแนวทางไปต่อ

---

## 1. ภารกิจคืออะไร

ทำให้ ClipForge (Next.js 16 + React 19 + Electron — แอปผลิตวิดีโอขายของออนไลน์) รองรับภาษาไทยทั้งระบบ
โดยผู้ใช้เริ่มทำเองมาก่อนแล้วบางส่วน (~71 ไฟล์แก้ไว้ก่อนเริ่มภารกิจ) รอบนี้สำรวจ → วางแผนตามลำดับความสำคัญ P0–P3 → ลงมือเก็บให้ครบ

## 2. กลไก i18n ของโปรเจกต์ (ใช้ตามนี้ต่อ อย่าคลาดแนวทาง)

- **Zero-dependency i18n เขียนเอง**: [src/lib/i18n/index.ts](src/lib/i18n/index.ts) มี `useT(namespace)` / `useLocale()` / `useSetLocale()`
- **Locale**: `th` (ค่าเริ่มต้น) / `en` / `zh` — ดูที่ [src/lib/i18n/config.ts](src/lib/i18n/config.ts)
  - `pickLocaleText(locale, v)` — seam เดียวสำหรับข้อมูล 3 ภาษา, fallback `th ?? en ?? zh`
  - `detectBrowserLocale()` — รองรับ `?lang=` query
- **ข้อความ UI**: [src/lib/i18n/messages/](src/lib/i18n/messages) — 22 namespaces แบบ `{ zh, en, th }` ต่อ key — **test บังคับ parity ที่ [src/lib/__tests__/i18n-parity.test.ts](src/lib/__tests__/i18n-parity.test.ts) เพิ่ม key ใหม่ต้องครบ 3 ภาษาไม่งั้น fail**
- **ฝั่ง server/API**: [src/lib/api-error.ts](src/lib/api-error.ts) — `pickLocale(req)` อ่าน Accept-Language, `errText(req, zh, en, th?)`, `apiError(...)` ยืดหยุ่นรับ `(req, zh, en, th, status)` หรือ `(req, zh, en, status, th)` ได้ทั้งคู่
- **ข้อมูล preset 3 ภาษา**: object `{ zh, en, th? }` render ผ่าน `pickLocaleText` (camera-presets, look-presets, ad-templates ฯลฯ)
- **แนวทางแยกแยะสำคัญ**: สตริงที่เป็น **prompt ส่งเข้าโมเดล** (motion-prompt, look-presets.image/motion, publish-pack prompts) เลือกภาษาด้วย `hasCjk(เนื้อหาอินพุต)` — **ไม่ต้องแปลเป็นไทย** เพราะโมเดลวิดีโอ/ภาพไม่รับ prompt ไทยดี

## 3. สิ่งที่ทำไปแล้วในรอบนี้ (ทั้งหมดอยู่ใน working tree — คอมมิตแล้วใน git)

### P0 — Error หลักที่ผู้ใช้ใหม่เจอ
- [src/lib/llm-error.ts](src/lib/llm-error.ts), [llm-models.ts](src/lib/llm-models.ts), [llm-probe.ts](src/lib/llm-probe.ts) — `LLMMessagePair` ขยายเป็น 3 ภาษาครบทุก message/hint/warning
- Callers ทั้ง 7 ไฟล์อัปเดต: llm/test, llm/models, ai/test-provider, llm/script, media/analyze, topic/script, project/[id]/quality, script-judge, ad-template/generate, llm/publish

### P0 — Dub + Release gate
- Dub dropdown หน้า export เพิ่มตัวเลือก "ไทย" — `defaultVoiceForLang("th")` หยิบเสียง `th-TH-PremwadeeNeural` จาก FREE_TTS_VOICES อัตโนมัติ
- [release-gate.ts](src/lib/release-gate.ts) + publish-readiness เติม `th` ครบ

### P1 — API errors flow หลัก (~60 จุด)
Routes ที่เติม th ครบแล้ว: upload, products/upload, tts, ai/image, ai/status, ai/tasks, ai/video, ai/video/task, project/[id]/compose, gate, dub, credits, llm/* ทั้งหมด

### P1 — ad-templates.ts (งานหนักสุดของรอบ)
- แปล name + tagline ไทยครบ **391/391 templates (782 สตริง)** ใน [src/lib/ad-templates.ts](src/lib/ad-templates.ts)
- type ขยายเป็น `{ zh, en, th? }` — หน้า new-project/video แสดงไทยทันทีผ่าน `pickLocaleText`
- กลุ่ม (AD_TEMPLATE_GROUPS) มี th มาก่อนแล้ว

### P2 — ตรวจแล้ว ไม่ต้องแก้ (จดไว้ไม่ให้งงตอนกลับมา)
- [motion-prompt.ts](src/lib/motion-prompt.ts) / [emotion-acting.ts](src/lib/emotion-acting.ts) / storyboard-film = **model-facing prompts** เลือกภาษาด้วย hasCjk ถูกต้องแล้ว — ห้ามแปลเป็นไทย
- `EMOTION_TTS.instruction` เป็นคำสั่ง MiniMax TTS (engine-facing)
- Indent/prettier: โปรเจกต์ไม่มี prettier, eslint ผ่านหมด

### P3 — ตรวจแล้วเป็น no-op
- `formatHotValue` (万/亿) ใช้เฉพาะ parser Douyin/Toutiao (แหล่งจีน) — Google Trends (geo=TH) ส่ง traffic string มาเอง
- ASR model description จีนไม่ถูก render (UI ใช้ i18n keys modelTiny/Base/Small แล้ว)
- Preset libs ที่เหลือ zh-only = prompt fields, LLM presets ใช้ i18n tipKey แล้ว

### งานพื้นฐานที่ผู้ใช้ทำไว้ก่อนหน้า (ยังอยู่ใน diff เดียวกัน)
ฟอนต์ Noto Sans Thai + auto font-picking, wrapCaption ด้วย Intl.Segmenter (ไม่ตัดกลางสระ/วรรณยุกต์), karaoke ไทย, เสียง Edge TTS ไทย, `detectScriptLanguage()` บังคับ LLM เขียนสคริปต์ไทย, publish-pack คอนเทนต์ commerce ไทย (ป้ายยา/TikTokShopTH), ad-compliance คำเสี่ยงไทย, trends geo=TH

## 4. สถานะการตรวจสอบ

- `pnpm exec tsc --noEmit` → **ผ่านสะอาด**
- Tests ที่เกี่ยวกับงานนี้ **103/103 ผ่าน**: ad-templates (24), i18n-parity (21), api-error (8), llm-error, release-gate (15)
- eslint บนไฟล์ที่แก้ → ผ่าน
- ⚠️ Test suite เต็มมีชุด DB/media ~42 ตัวที่ **fail มาก่อนงานนี้อยู่แล้ว** (ปัญหา environment เครื่อง — better-sqlite3/media pipeline) ไม่เกี่ยวกับงาน i18n

## 5. งานที่ยังเหลือ (เรียงตามความคุ้ม)

1. **API errors ระลอกสอง** — routes นอก flow หลักที่ยังจีนล้วน วิธีหา: `grep -rn "apiError\|errText" src/app/api | grep -v th` แล้วเติม th ตาม pattern ใน §2 (~1 ชม.)
2. **คำแปล ad-templates รีวิวโดยคน** — แปลด้วย agent ทั้ง 391 แบบ แนะให้อ่านสกัดใน UI จริงหน้า new-project locale=th แก้คำที่แปลดง (~30 นาที)
3. **scriptHint ยังจีนล้วน** — 391 hints ใน ad-templates.ts เป็นคำสั่งเนรมิตสคริปต์ ถ้าจะให้ LLM เขียนสคริปต์ไทยดีขึ้น อาจแปลเป็นไทย หรือปล่อยจีน (LLM เข้าใจอยู่แล้ว) — ตัดสินใจเอง
4. **optionals**: ทดสอบ e2e ไทย (สร้างโปรเจกต์ภาษาไทยเต็ม flow → render), README ภาษาไทยส่วนใช้งานภาษาไทย

## 6. วิธีกลับมาทำต่อ

```bash
git pull origin main
pnpm install
pnpm dev                # เปิดลอง UI ภาษาไทย (ค่าเริ่มต้น locale = th แล้ว)
pnpm exec tsc --noEmit  # เช็ค type
pnpm vitest run src/lib/__tests__/i18n-parity.test.ts src/lib/__tests__/ad-templates.test.ts
```

- ภาษาของแอปสลับได้ที่ language toggle มุมขวาบน / `?lang=th`
- ถ้าเพิ่ม key ใหม่ใน messages: ใส่ครบ `{ zh, en, th }` ไม่งั้น i18n-parity test จะ fail (ตั้งใจให้เป็นด่านกันพลาด)
- ถ้าเพิ่ม ad template ใหม่: ใส่ `th` ใน name/tagline ด้วย (ยังไม่มี test บังคับ — ดูข้อเสนอใน §5.1 เดิม)

## 7. หมายเหตุ

- Remote: `origin` = github.com/DG-Knight/clipforge (repo ของคุณ), `upstream` = repo ต้นทาง — push ที่ `origin` เท่านั้น
- `.freebuff/` เป็น local state ของ Freebuff agent — เพิ่มเป็น ignored แล้ว **อย่าคอมมิต**
- ไฟล์นี้ (HANDOFF-THAI.md) commit รวมไปด้วยเพื่อให้กลับมาอ่านต่อจากเครื่องไหนก็ได้
