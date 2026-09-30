/**
 * Free Edge TTS voice catalogue — CLIENT-SAFE module (no fs/network imports), so UI code and the
 * variation planner can list voices without dragging the server-only TTS pipeline (edge-tts →
 * tts-cache → fs/promises) into the browser bundle. edge-tts re-exports these for server callers.
 *
 * All entries are real Edge keyless-synthesisable voices (server-tested to produce 18–26 KB mp3);
 * generateSpeechFree already accepts any Edge voice name — this list simply makes voices discoverable.
 */
export const FREE_TTS_VOICES: { value: string; label: string; gender: "female" | "male"; lang: string }[] = [
  // Chinese market (labels shown to all locales; zh voice names kept recognizable in English)
  { value: "zh-CN-XiaoxiaoNeural", label: "Xiaoxiao · gentle female (zh-CN)", gender: "female", lang: "zh-CN" },
  { value: "zh-CN-XiaoyiNeural", label: "Xiaoyi · lively female (zh-CN)", gender: "female", lang: "zh-CN" },
  { value: "zh-CN-YunxiNeural", label: "Yunxi · bright male (zh-CN)", gender: "male", lang: "zh-CN" },
  { value: "zh-CN-YunyangNeural", label: "Yunyang · professional male (zh-CN)", gender: "male", lang: "zh-CN" },
  { value: "zh-CN-YunjianNeural", label: "Yunjian · calm narrator male (zh-CN)", gender: "male", lang: "zh-CN" },
  // English (primary overseas market)
  { value: "en-US-AriaNeural", label: "Aria · US English (female)", gender: "female", lang: "en-US" },
  { value: "en-US-GuyNeural", label: "Guy · US English (male)", gender: "male", lang: "en-US" },
  { value: "en-GB-SoniaNeural", label: "Sonia · UK English (female)", gender: "female", lang: "en-GB" },
  // Thai market (เสียงพากย์ภาษาไทย)
  { value: "th-TH-PremwadeeNeural", label: "Premwadee · เปรมวดี (female/หญิง)", gender: "female", lang: "th-TH" },
  { value: "th-TH-NiwatNeural", label: "Niwat · นิวัฒน์ (male/ชาย)", gender: "male", lang: "th-TH" },
  // Japanese / Korean markets (bundled Noto CJK subtitle font public/fonts/subtitle.otf covers kana + hangul, so subtitles render correctly)
  { value: "ja-JP-NanamiNeural", label: "Nanami · Japanese (female)", gender: "female", lang: "ja-JP" },
  { value: "ko-KR-SunHiNeural", label: "SunHi · Korean (female)", gender: "female", lang: "ko-KR" },
  // Spanish market (Latin glyphs are covered by the CJK font)
  { value: "es-ES-ElviraNeural", label: "Elvira · Spanish (female)", gender: "female", lang: "es-ES" },
];

export const DEFAULT_FREE_VOICE = "zh-CN-XiaoxiaoNeural";

/**
 * คืนค่า Edge voice เริ่มต้นที่เหมาะสมกับภาษาที่ระบุ (เช่น th → th-TH-PremwadeeNeural)
 */
export function defaultVoiceForLang(lang?: string): string {
  const clean = (lang || "").toLowerCase().trim();
  if (clean === "th" || clean.startsWith("th-")) return "th-TH-PremwadeeNeural";
  if (clean === "en" || clean.startsWith("en-")) return "en-US-AriaNeural";
  if (clean === "ja" || clean.startsWith("ja-")) return "ja-JP-NanamiNeural";
  if (clean === "ko" || clean.startsWith("ko-")) return "ko-KR-SunHiNeural";
  if (clean === "es" || clean.startsWith("es-")) return "es-ES-ElviraNeural";
  return DEFAULT_FREE_VOICE;
}

/**
 * วิเคราะห์ภาษาจากข้อความสคริปต์เพื่อเลือกเสียงพากย์ที่เหมาะสมอัตโนมัติ
 * มีอักษรไทย → th-TH-PremwadeeNeural, อักษรจีน → Xiaoxiao, อื่นๆ → Aria
 */
export function defaultVoiceForText(text?: string): string {
  const sample = text || "";
  if (/[\u0E00-\u0E7F]/.test(sample)) return "th-TH-PremwadeeNeural";
  if (/[一-鿿]/.test(sample)) return "zh-CN-XiaoxiaoNeural";
  if (/[a-zA-Z]/.test(sample)) return "en-US-AriaNeural";
  return "th-TH-PremwadeeNeural"; // ค่าเริ่มต้นสำหรับระบบภาษาไทย
}

/**
 * Voice name → SSML xml:lang (e.g. "th-TH-PremwadeeNeural" → "th-TH").
 * Single home for voice→language knowledge: edge-tts SSML, drama casting and batch
 * rotation all derive from here instead of hardcoding "zh-CN" at each call site.
 * Unknown names fall back to zh-CN (the historical default — never break old callers).
 * Pure function.
 */
export function langOfVoice(voice: string): string {
  const m = /^\s*([a-z]{2}-[A-Z]{2})-/.exec(voice || "");
  if (m) return m[1];
  const hit = FREE_TTS_VOICES.find((v) => v.value === (voice || "").trim());
  return hit ? hit.lang : "zh-CN";
}

