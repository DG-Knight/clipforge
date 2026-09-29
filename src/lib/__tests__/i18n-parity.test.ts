import { describe, it, expect } from "vitest";
import { messages } from "@/lib/i18n/messages";

/**
 * i18n key parity guard: every namespace must expose the identical key set in
 * zh/en/th. A missing key renders as a raw key id (or a wrong-language fallback)
 * — historically Thai inherited English-only additions silently (assets/script/batch).
 * Add keys in all three locales, never one.
 */
describe("i18n key parity zh/en/th", () => {
  const namespaces = Object.keys(messages.zh);
  expect(namespaces.length).toBeGreaterThan(0);

  for (const ns of namespaces) {
    it(`${ns}: identical key sets`, () => {
      const zh = new Set(Object.keys(messages.zh[ns] ?? {}));
      const en = new Set(Object.keys(messages.en[ns] ?? {}));
      const th = new Set(Object.keys(messages.th[ns] ?? {}));
      for (const k of zh) {
        expect(en.has(k), `${ns}.en missing "${k}"`).toBe(true);
        expect(th.has(k), `${ns}.th missing "${k}"`).toBe(true);
      }
      for (const k of en) expect(zh.has(k), `${ns}.zh missing "${k}"`).toBe(true);
      for (const k of th) expect(zh.has(k), `${ns}.zh missing "${k}" (stray th key)`).toBe(true);
    });
  }
});
