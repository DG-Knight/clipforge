import { describe, it, expect, beforeAll, vi } from "vitest";
import { nextTTSForOneKey } from "@/lib/stores/settings-store";
import { isPaidTTSReady, resolveTTSConfig } from "@/lib/tts-presets";
import type { TTSSetting } from "@/lib/stores/settings-store";

const brokenOpenai = {
  enabled: true, provider: "openai", baseUrl: "https://api.siliconflow.cn/v1",
  apiKey: "", model: "FunAudioLLM/CosyVoice2-0.5B", voice: "FunAudioLLM/CosyVoice2-0.5B:alex", speed: 1,
} as TTSSetting;
const workingMinimax = {
  enabled: true, provider: "minimax", baseUrl: "https://api.minimax.chat/v1",
  apiKey: "mm-key", model: "speech-2.6-hd", voice: "female-tianmei", speed: 1,
} as unknown as TTSSetting;
const providersWithAtlas = { "atlas-cloud": { enabled: true, apiKey: "sk-atlas" } };

describe("nextTTSForOneKey（一键接入配音守门）", () => {
  it("开了但 Key 为空的旧配置 → 改接 Atlas（不再保持 broken）", () => {
    const next = nextTTSForOneKey(brokenOpenai, providersWithAtlas);
    expect(next.provider).toBe("atlas");
    expect(next.enabled).toBe(true);
    expect(isPaidTTSReady(next, providersWithAtlas)).toBe(true);
    expect(resolveTTSConfig(next, providersWithAtlas).apiKey).toBe("sk-atlas");
  });

  it("从没开过配音 → 默认接 Atlas（保持老行为）", () => {
    const next = nextTTSForOneKey({ ...brokenOpenai, enabled: false }, providersWithAtlas);
    expect(next.provider).toBe("atlas");
    expect(next.enabled).toBe(true);
  });

  it("已配好且能用的（MiniMax 有 Key）→ 保持不动", () => {
    expect(nextTTSForOneKey(workingMinimax, providersWithAtlas)).toBe(workingMinimax);
  });
});

describe("applyAtlasOneKey 端到端 + 重启不丢 Key", () => {
  const mem = new Map<string, string>();
  beforeAll(() => {
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => { mem.set(k, String(v)); },
      removeItem: (k: string) => { mem.delete(k); },
      clear: () => mem.clear(),
      get length() { return mem.size; },
      key: (i: number) => [...mem.keys()][i] ?? null,
    });
  });

  it("一键接入后 TTS 可用、Key 落盘、重启后仍在", async () => {
    vi.resetModules();
    const { useSettingsStore } = await import("@/lib/stores/settings-store");
    // 先模拟用户旧状态：配音开着但 Key 为空（截图里的样子）
    useSettingsStore.getState().setTTS({ ...brokenOpenai });
    useSettingsStore.getState().applyAtlasOneKey("sk-atlas-restart");
    const s = useSettingsStore.getState();
    expect(s.tts.provider).toBe("atlas");
    expect(s.llm.apiKey).toBe("sk-atlas-restart");
    // 已落盘（localStorage 有 Key）
    const raw = mem.get("daihuo-jianshou-settings") ?? "";
    expect(raw).toContain("sk-atlas-restart");
    // 模拟重启：清模块缓存重载，状态应从盘恢复
    vi.resetModules();
    const re = await import("@/lib/stores/settings-store");
    const s2 = re.useSettingsStore.getState();
    expect(s2.llm.apiKey).toBe("sk-atlas-restart");
    expect(s2.tts.provider).toBe("atlas");
    expect(isPaidTTSReady(s2.tts, s2.providers)).toBe(true);
  });
});
