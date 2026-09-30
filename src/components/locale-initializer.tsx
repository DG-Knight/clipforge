"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useLocale } from "@/lib/i18n";
import { detectBrowserLocale } from "@/lib/i18n/config";

/**
 * Locale initializer (mounted in the root layout, renders nothing):
 * 1) On first load, auto-detect the UI language from the user's system/browser settings
 *    (only when the user has not manually switched, i.e. localeSource === "auto");
 * 2) Keep <html lang> in sync with the current UI language for accessibility and SEO.
 */
export function LocaleInitializer() {
  const locale = useLocale();

  // auto-detect from system language (do not override if the user has manually selected)
  useEffect(() => {
    const { localeSource, applyAutoLocale } = useSettingsStore.getState();
    // only follow system language when the user has not manually chosen (auto, or field absent in older persisted state)
    if (localeSource !== "user") {
      applyAutoLocale(detectBrowserLocale());
    }
  }, []);

  // sync <html lang>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "zh" ? "zh-CN" : locale === "th" ? "th" : "en";
    }
  }, [locale]);

  // mirror the UI locale into a cookie so src/proxy.ts can forward it as Accept-Language
  // on every /api request — server error messages then follow the language the user chose
  // in the app instead of their browser's language
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `clipforge_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [locale]);

  return null;
}
