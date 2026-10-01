import { describe, it, expect } from "vitest";
import { LOCALES, LOCALE_LABELS, detectBrowserLocale } from "@/lib/i18n/config";
import { messages } from "@/lib/i18n/messages";
import { FREE_TTS_VOICES } from "@/lib/tts-voices";

describe("การตรวจสอบการรองรับภาษาไทยใน i18n (Thai Language Support Tests)", () => {
  it("LOCALES และ LOCALE_LABELS ต้องมีภาษาไทย (th)", () => {
    expect(LOCALES).toContain("th");
    expect(LOCALE_LABELS.th).toBe("ไทย");
  });

  it("detectBrowserLocale ต้องตรวจจับภาษาไทย (th / th-TH) ได้ถูกต้อง", () => {
    const originalNavigator = globalThis.navigator;

    // จำลอง navigator.languages เป็นภาษาไทย
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["th-TH", "th", "en-US", "en"] },
      configurable: true,
    });
    expect(detectBrowserLocale()).toBe("th");

    // จำลอง navigator.languages เป็นภาษาจีน
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["zh-CN", "zh"] },
      configurable: true,
    });
    expect(detectBrowserLocale()).toBe("zh");

    // จำลอง navigator.languages เป็นภาษาอังกฤษ
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["en-US", "en"] },
      configurable: true,
    });
    expect(detectBrowserLocale()).toBe("en");

    // คืนค่า navigator เดิม
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
  });

  it("ทุก Namespace ใน messages ต้องมีภาษาไทย (th) ครบถ้วน", () => {
    const namespaces = Object.keys(messages.zh);
    expect(namespaces.length).toBeGreaterThan(0);

    for (const ns of namespaces) {
      expect(messages.th[ns], `Namespace "${ns}" ต้องมีอยู่ใน messages.th`).toBeDefined();
    }
  });

  it("คีย์ภาษาไทย (th) ต้องครบถ้วนตรงกับภาษาจีน (zh) และอังกฤษ (en) 100% ทุก Namespace", () => {
    const namespaces = Object.keys(messages.zh);

    for (const ns of namespaces) {
      const zhKeys = Object.keys(messages.zh[ns]).sort();
      const thKeys = Object.keys(messages.th[ns] || {}).sort();

      // ตรวจสอบว่าคีย์ที่อยู่ใน zh ต้องมีใน th ทั้งหมด
      const missingInTh = zhKeys.filter((k) => !(k in messages.th[ns]));
      expect(
        missingInTh,
        `Namespace "${ns}" ขาดคีย์ภาษาไทยต่อไปนี้: ${missingInTh.join(", ")}`
      ).toEqual([]);

      // ตรวจสอบว่าไม่มีค่าว่างในคำแปลภาษาไทย
      for (const k of zhKeys) {
        const val = messages.th[ns][k];
        expect(
          val,
          `Namespace "${ns}" คีย์ "${k}" ต้องไม่เป็นค่าว่าง`
        ).toBeTruthy();
        expect(
          typeof val,
          `Namespace "${ns}" คีย์ "${k}" ต้องเป็น string`
        ).toBe("string");
      }
    }
  });

  it("ตัวแปรแทรก {variable} ในภาษาไทยต้องตรงกับภาษาต้นฉบับ", () => {
    const varRegex = /\{(\w+)\}/g;
    const namespaces = Object.keys(messages.zh);

    for (const ns of namespaces) {
      const zhDict = messages.zh[ns];
      const thDict = messages.th[ns];

      for (const key of Object.keys(zhDict)) {
        const zhVars = (zhDict[key].match(varRegex) || []).sort();
        const thVars = (thDict[key].match(varRegex) || []).sort();

        expect(
          thVars,
          `Namespace "${ns}" คีย์ "${key}" ตัวแปรแทรกในภาษาไทยไม่ตรงกับภาษาจีน: คาดหวัง ${zhVars.join(", ")} แต่ได้ ${thVars.join(", ")}`
        ).toEqual(zhVars);
      }
    }
  });

  it("Edge TTS มีตัวเลือกเสียงพากย์ภาษาไทย (Thai Voices)", () => {
    const thaiVoices = FREE_TTS_VOICES.filter((v) => v.lang === "th-TH");
    expect(thaiVoices.length).toBeGreaterThanOrEqual(2);

    const premwadee = thaiVoices.find((v) => v.value === "th-TH-PremwadeeNeural");
    expect(premwadee).toBeDefined();
    expect(premwadee?.gender).toBe("female");

    const niwat = thaiVoices.find((v) => v.value === "th-TH-NiwatNeural");
    expect(niwat).toBeDefined();
    expect(niwat?.gender).toBe("male");
  });

  it("currencySymbolForLocale คืนค่าสกุลเงินบาท (฿) สำหรับภาษาไทย", async () => {
    const { currencySymbolForLocale } = await import("@/lib/examples");
    expect(currencySymbolForLocale("th")).toBe("฿");
    expect(currencySymbolForLocale("en")).toBe("$");
    expect(currencySymbolForLocale("zh")).toBe("¥");
  });
});
