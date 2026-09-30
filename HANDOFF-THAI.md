# แฮนด์โอเวอร์: งานรองรับภาษาไทยทั้งระบบ (ClipForge)

> อัปเดตล่าสุด: 30 กันยายน 2026 (รอบสี่ — สแกน CJK หลุดทั้งระบบ + แก้ครบ)
> สถานะ: **งานตามขอบเขต P0–P3 เสร็จสมบูรณ์ + API errors มี th ครบ + throw จีนใน lib หมด (เหลือแต่ model-facing)** — typecheck ผ่าน, tests เท่า baseline
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
- Tests ที่เกี่ยวกับงานนี้ **115/115 ผ่าน** (รอบสอง): ad-templates (25 — มีเคส parity th ใหม่), i18n-parity (21), api-error (8), llm-error (35), platform-specs (11), release-gate (15)
- รอบสาม (e2e ไทย + แก้ edge-tts/style-packs): tsc สะอาด, edge-tts + style-packs + security 26/26 ผ่าน
- รอบสี่ (สแกน CJK หลุด): tsc สะอาด, full vitest = **เท่า baseline ก่อนแก้เป๊ะ (12 ไฟล์ fail / 45-48 tests — เป็นของเดิมจาก FFmpeg-integration + localStorage)**, cors-proxy 4/4 ผ่านหลังแก้ regression, e2e บน dev server: /project/new + /settings (แท็บ providers/TTS + dropdown แพลตฟอร์ม TTS + ปุ่ม quick-preset) **CJK หลุด 0**, Edge TTS ยังสังเคราะห์ได้จริง (MP3 12.5KB)
- eslint บนไฟล์ที่แก้ → ผ่าน
- ⚠️ Test suite เต็มมีชุด DB/media ~42 ตัวที่ **fail มาก่อนงานนี้อยู่แล้ว** (ปัญหา environment เครื่อง — better-sqlite3/media pipeline) ไม่เกี่ยวกับงาน i18n

## 5. งานที่ยังเหลือ (สถานะหลังรอบสอง 30 ก.ย. 2026)

1. ~~**API errors ระลอกสอง**~~ — ✅ **เสร็จแล้วรอบนี้**: สแกนครบด้วย parser (balanced-paren) เจอ 243 call ที่ยังไม่มี th ใน 40 ไฟล์ → เติมครบหมด (สคริปต์/พจนานุกรมที่ใช้เก็บไว้ที่ `.freebuff/` — ignored) พร้อมแก้มือ 17 จุดที่เป็น template literal, เพิ่ม `th` ให้ `OffSiteQrPolicy.reason` ครบทุก policy ([platform-specs.ts](src/lib/platform-specs.ts)), และ `SHARE_ERRORS` ใน [ad-template/mine](src/app/api/ad-template/mine/route.ts) ยืนยันด้วย analyzer ซ้ำ: **missing-th = 0**
2. **คำแปล ad-templates รีวิวโดยคน** — ยังเหลือ: แปลด้วย agent ทั้ง 391 แบบ แนะให้อ่านสกัดใน UI จริงหน้า new-project locale=th แก้คำที่แปลดง (~30 นาที)
3. ~~**scriptHint ยังจีนล้วน**~~ — ✅ **ตัดสินใจแล้ว: ปล่อยจีนต่อไป** เหตุผล: (1) มันถูกฉีดเข้า prompt ผ่าน `adTemplateScriptDirective()` ซึ่งเป็น **model-facing directive จีนล้วนทั้งก้อน** (name.zh + look.zh + camera preset prompts) — แปลเฉพาะ hint จะได้ prompt ภาษาผสมโดยไม่จำเป็น (2) route สร้างเทมเพลต AI ก็สั่ง LLM ให้เขียน hint เป็นจีน (3) ผู้ใช้ทั่วไปไม่เห็น hint — เห็นเฉพาะใน textarea ของ template editor ขั้นสูงซึ่งแก้ข้อมูลต้นทางจริง ถ้าวันหนึ่งจะให้ directive เป็นไทยต้องแปลทั้ง directive พร้อมกัน ไม่ใช่แค่ scriptHint
4. **optionals**: ~~ทดสอบ e2e ไทย~~ — ✅ **ทดแล้ว 30 ก.ย. (dev server + เบราว์เซอร์จริง)**: เดินครบทุกหน้า (/start → /project/new → สร้างโปรเจกต์จริงเก็บลง DB ไทยถูกต้อง → script → assets → video → export) — **ข้อความจีนหลุด 0 ตัวอักษรทุกหน้า**, error จาก API flow จริงเป็นไทย, และ**สังเคราะห์เสียงพากย์ไทยสำเร็จจริง** (Edge TTS th-TH-PremwadeeNeural → MP3 ได้ไฟล์จริง) ขั้นต่อไปที่ยังไม่ทดคือ render จริงซึ่งต้องมี LLM key — **README ไทยไม่ต้องทำ** (README.md หลักเป็นไทยอยู่แล้ว)
5. ~~**ระลอกสาม: `throw new Error("จีน…")` ใน src/lib**~~ — ✅ **เสร็จรอบสี่ (30 ก.ย.)**: สแกน CJK ทั้ง src/ ด้วย node script (`.freebuff/cjk-classify.cjs`) จำแนก throw/review/zh-data — แทนที่ด้วย codemod + พจนานุกรม 112 คำ (`.freebuff/throw-codemod.cjs`, `throw-en-dict.json`): **throw จีน 131 จุดใน 33 ไฟล์ → อังกฤษ**, + `ProviderError` อีก 19 จุด (codemod รอบแรกจับเฉพาะ `new Error`), + `reject(new Error(…))` 5 จุด (edge-tts timeout, transcript-render-process), + providers/index createProvider — throw จีนใน src ที่ไม่ใช่ test = **0** แล้ว (ยังเหลือโดยเจตนา: LLMRequestError.zh ซึ่งเป็น zh เทียบเท่าของ pair และ retry-instruction ที่เป็น model-facing)
6. **🆕 แก้แล้วตอน e2e**: ปุ่มแพ็กสไตล์หน้า /video เป็นจีนล้วน (带货重击 ฯลฯ) → เปลี่ยน [style-packs.ts](src/lib/style-packs.ts) เป็น "English / ไทย" + หน้า [video/page.tsx](src/app/project/[id]/video/page.tsx) เลือกก้อนตาม locale (th→ไทย) — ปุ่มบนจอเป็นไทยแล้ว (ตีตลาดจัดเต็ม/คาราโอเคะไวรัล/สารคดีมินิมอล/มาตรฐาน)
7. **🆕 ปัญหาที่ผู้ใช้เจอจริง: error จีนทั้งที่เลือกไทย** — สาเหตุ: error ฝั่ง server เลือกภาษาจาก Accept-Language ของเบราว์เซอร์ (เครื่องผู้ใช้เป็น zh) ไม่ใช่ locale ที่เลือกในแอป — แก้เชิงระบบ: [locale-initializer.tsx](src/components/locale-initializer.tsx) mirror locale → cookie `clipforge_locale` + [src/proxy.ts](src/proxy.ts) (Next.js 16 ใช้ proxy.ts แทน middleware.ts) แปลง cookie → Accept-Language ทุก /api/* อัตโนมัติ — พิสูจน์แล้ว: ส่ง Accept-Language จีน + cookie th → error ไทย
8. **🆕 แก้เพิ่ม**: default ชื่อร้าน "我的店铺" / "默认字体" ใน [brand-store.ts](src/lib/stores/brand-store.ts) → "My Store"/"default" พร้อม persist migrate version 1 (เครื่องเดิมที่เคยเซฟค่าจีนจะถูกแก้อัตโนมัติ) — หมายเหตุ: test ชุด Product/Template store 32 ตัว fail มาก่อนแล้วจาก localStorage ไม่มีใน env test เครื่องนี้ (พิสูจน์ด้วย git stash) ไม่เกี่ยวกับงาน
9. **🆕 รอบสี่ — UI data จีนที่ render ตรง ๆ**: [tts-presets.ts](src/lib/tts-presets.ts) (labels แพลตฟอร์ม/โมเดล/โวยซ์/hint จีนล้วน → อังกฤษ เช่น 甜美女声 → "Sweet female"), [tts-voices.ts](src/lib/tts-voices.ts) (โวยซ์ zh เหลือชื่อ pinyin en), [llm-presets.ts](src/lib/llm-presets.ts) (智谱 GLM→"Zhipu GLM", 豆包→"Doubao", Ollama 本地→"Ollama (local)") — **แก้ test ที่อ้าง label เดิมแล้ว** (llm-error/llm-probe), [settings/page.tsx](src/app/settings/page.tsx) เพิ่ม `providerDisplayName()` ตัดสำเนาจีนจาก AI_PROVIDERS.name เมื่อไม่มี i18n key, [local-asr.ts](src/lib/local-asr.ts) descriptions → en, [db/index.ts](src/lib/db/index.ts) migration error → en, [asr.worker.ts](src/workers/asr.worker.ts) fallback → en, [tts/free](src/app/api/tts/free/route.ts) default preview text → ไทย + fallback error → en
10. **🆕 รอบสี่ — route-level ที่เหลือ**: fallback `error.message : "จีน"` → `errText(req, zh, en, th)` ครบ (project, project/[id]/assets, works, tasks, batch, pipeline — เพิ่ม `req` param / import ให้ routes ที่ขาด), stored task errors + resume hints (ai/video, repair, storyboard-film) → en, defaults: 未命名项目→"Untitled project", 导入的商品→"Imported product", 图文→"Image-text", 导入脚本→"Imported script", 九宫格整片·→"Storyboard film ·", compose console.info → en
11. **🆕 รอบสี่ — แก้ regression ของ proxy.ts**: เวอร์ชัน cookie→Accept-Language ของรอบก่อน **ทับ logic CORS ทั้งหมด** (localhost-origin reflection สำหรับ infinite-canvas หาย) — merge สองอย่างกลับเข้า [src/proxy.ts](src/proxy.ts) แล้ว, cors-proxy.test.ts 4/4 ผ่าน — ต่อไปแก้ proxy.ts ต้องรัน test นี้ด้วย
12. **เพิ่มใหม่รอบก่อน**: test บังคับ th ใน AD_TEMPLATES (name/tagline ทุก template + ทุกกลุ่ม ห้ามซ้ำกับ zh/en) อยู่ใน [ad-templates.test.ts](src/lib/__tests__/ad-templates.test.ts) — ตอนนี้เพิ่มเทมเพลตใหม่แล้วลืม th จะ fail test ทันที
13. **🆕 รอบสี่ — test กัน CJK หลุด**: [cjk-leak-guard.test.ts](src/lib/__tests__/cjk-leak-guard.test.ts) สแกน src/lib + src/app/api + src/workers (string-aware, mask comment, paren-balanced): (1) `new XxxError(...)` message literal ห้ามมี CJK — ยกเว้น LLMRequestError ตรวจ literal ที่สอง (en) แทน, (2) ฟิลด์ `error:`/`errorMessage` หลังตัด errText/apiError span และ `new Error(...)` span ต้องปลอด CJK — ยกเว้น ternary th-first (`isTh ? …`) ตาม convention — พิสูจน์แล้วว่า inject จีนแล้ว fail / ลบ fix แล้ว fail / ปกติผ่าน — **guard ช่วยจับ fix ที่หายไปจริงระหว่างพัฒนา** (pexels.ts โดน checkout คืน → codemod รันซ้ำ) และช่วยให้เจอ ProviderError จีนอีก 16 จุด + taskStatus.error 2 จุดที่ codemod รอบสี่พลาด (แก้ครบแล้ว)
14. **🆕 รอบห้า — วรรคตอน CJK ในสตริงไทย**: สแกนพบ 「」/、/：/； หลุดในสตริงไทย 28 คีย์ (12 ไฟล์ i18n messages, block th) + en 1 คีย์ + route 1 + UI join("、") 6 จุด — แทนครบ: 「X」→«X» (guillemet — **ห้ามใช้ " เพราะหัก JS string**), 、→", ", ：→": ", ；→"; ", （）→() — codemod ที่ถูกต้องคือ `.freebuff/punct-codemod2.cjs` (แทนเฉพาะภายใน literal ที่มีไทย — key ASCII ไม่โดน) **บทเรียน: repair แบบ line-heuristic ทำ key เสียหาย (production.ts multi-key lines) ต้อง restore จาก HEAD แล้วทำใหม่แบบ literal-level** — ไม่แก้: zh data, model-facing (generate route gloss join、storyboard-film zh), regex parsers (จับวรรคตอนจีนเพื่อ parse จีน), export-guard zh append, native-language options (日本語 ใน dub lang picker) — ตรวจแล้ว e2e: /export /assets /script punct=0 CJK=0

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
- ถ้าเพิ่ม ad template ใหม่: ใส่ `th` ใน name/tagline ด้วย — **มี test บังคับแล้ว** (ad-templates.test.ts parity เคส "每个模板与分组的名称/卖点都有泰语")

## 7. หมายเหตุ

- Remote: `origin` = github.com/DG-Knight/clipforge (repo ของคุณ), `upstream` = repo ต้นทาง — push ที่ `origin` เท่านั้น
- `.freebuff/` เป็น local state ของ Freebuff agent — เพิ่มเป็น ignored แล้ว **อย่าคอมมิต**
- ไฟล์นี้ (HANDOFF-THAI.md) commit รวมไปด้วยเพื่อให้กลับมาอ่านต่อจากเครื่องไหนก็ได้
