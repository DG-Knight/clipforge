import { describe, it, expect } from "vitest";
import { settings } from "@/lib/i18n/messages/settings";
import { pickLocaleText } from "@/lib/i18n/config";

/**
 * Audit-fix regression: the settings page previously hard-coded Chinese provider names
 * (Volcengine / Alibaba Bailian / SiliconFlow) and "network error" strings, which English
 * users saw as raw Chinese. These are now i18n keys; this suite guards that the keys exist
 * in both zh and en, and that the en values contain no Chinese characters.
 */
describe("settings i18n 厂商名/错误无中文泄漏（审计修复）", () => {
  const en = settings.en as Record<string, string>;
  const zh = settings.zh as Record<string, string>;

  it("3 个厂商名键 + connectFailed 在 zh/en 都存在", () => {
    for (const k of ["providerVolcengineName", "providerAlibabaName", "providerSiliconflowName", "connectFailed"]) {
      expect(zh[k]).toBeTruthy();
      expect(en[k]).toBeTruthy();
    }
  });

  it("en 厂商名是英文品牌、不含中文（否则英文用户仍见中文）", () => {
    expect(en.providerVolcengineName).toBe("Volcengine");
    expect(en.providerAlibabaName).toBe("Alibaba Bailian");
    expect(en.providerSiliconflowName).toBe("SiliconFlow");
    for (const k of ["providerVolcengineName", "providerAlibabaName", "providerSiliconflowName"]) {
      expect(/[一-鿿]/.test(en[k])).toBe(false);
    }
  });

  it("zh 厂商名保持中文原名", () => {
    expect(zh.providerVolcengineName).toBe("火山引擎");
    expect(zh.providerAlibabaName).toBe("阿里百炼");
    expect(zh.providerSiliconflowName).toBe("硅基流动");
  });
});

describe("pickLocaleText（三语分支单点）", () => {
  const v = { zh: "无", en: "None", th: "ไม่ใส่" };
  it("th→th，zh→zh，其他→en", () => {
    expect(pickLocaleText("th", v)).toBe("ไม่ใส่");
    expect(pickLocaleText("zh", v)).toBe("无");
    expect(pickLocaleText("en", v)).toBe("None");
    expect(pickLocaleText(undefined, v)).toBe("None");
  });
  it("缺 th 时回落英文而非 key（迁移期不断档）", () => {
    expect(pickLocaleText("th", { zh: "无", en: "None" })).toBe("None");
  });
});
