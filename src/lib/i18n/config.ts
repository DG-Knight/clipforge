/** การกำหนดค่าภาษา (Locale configuration): ภาษาจีนเป็นภาษาเริ่มต้นเดิม, ภาษาอังกฤษและภาษาไทยเป็นภาษาที่สามารถสลับใช้งานได้ */
export const LOCALES = ["zh", "en", "th"] as const;
export type Locale = (typeof LOCALES)[number];

/** ภาษาเริ่มต้น: ภาษาจีน */
export const DEFAULT_LOCALE: Locale = "zh";

/** ป้ายกำกับที่แสดงในตัวสลับภาษา (Language Switcher) */
export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  th: "ไทย",
};

/** โครงสร้างข้อความในแต่ละ Namespace รองรับ 3 ภาษา (zh, en, th) */
export interface NamespaceMessages {
  zh: Record<string, string>;
  en: Record<string, string>;
  th: Record<string, string>;
}

/**
 * ตรวจจับภาษาอัตโนมัติจากเบราว์เซอร์หรือระบบของผู้ใช้
 * หากระบบเป็นภาษาจีน (zh) -> "zh"
 * หากระบบเป็นภาษาไทย (th) -> "th"
 * อื่นๆ -> "en"
 */
export function detectBrowserLocale(): Locale {
  if (typeof window !== "undefined" && typeof location !== "undefined") {
    try {
      const params = new URLSearchParams(location.search);
      const lang = params.get("lang");
      if (lang === "th" || lang === "zh" || lang === "en") return lang;
    } catch {
      // ignore
    }
  }
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]) as string[];
  for (const l of langs) {
    if (!l) continue;
    const lower = l.toLowerCase();
    if (lower.startsWith("th")) return "th";
    if (lower.startsWith("zh")) return "zh";
  }
  // หากพบภาษาอังกฤษเป็นหลัก
  for (const l of langs) {
    if (!l) continue;
    if (l.toLowerCase().startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
