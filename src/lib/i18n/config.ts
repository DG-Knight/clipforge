/** การกำหนดค่าภาษา (Locale configuration): ภาษาไทยเป็นค่าเริ่มต้น พร้อมรองรับภาษาอังกฤษและภาษาจีน */
export const LOCALES = ["th", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

/** ภาษาเริ่มต้น: ภาษาไทย */
export const DEFAULT_LOCALE: Locale = "th";

/** ป้ายกำกับที่แสดงในตัวสลับภาษา (Language Switcher) */
export const LOCALE_LABELS: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
  zh: "中文",
};

/** โครงสร้างข้อความในแต่ละ Namespace รองรับ 3 ภาษา (zh, en, th) */
export interface NamespaceMessages {
  zh: Record<string, string>;
  en: Record<string, string>;
  th: Record<string, string>;
}

/** Localized display-text triple (shared catalogs, preset libraries, label maps). */
export interface LocaleText {
  zh: string;
  en: string;
  /** Thai optional during migration — falls back to English, never a raw key */
  th?: string;
}

/**
 * Single seam for picking display text by locale: th→th, zh→zh, else en.
 * Replaces ad-hoc `locale === "zh" ? .zh : .en` branches that silently served
 * English to Thai users despite translated `th` data sitting next to it.
 * Pure function.
 */
export function pickLocaleText(locale: Locale | string | undefined, v: LocaleText): string {
  if (locale === "th") return v.th ?? v.en ?? v.zh;
  if (locale === "zh") return v.zh ?? v.en ?? v.th;
  return v.en ?? v.th ?? v.zh;
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
