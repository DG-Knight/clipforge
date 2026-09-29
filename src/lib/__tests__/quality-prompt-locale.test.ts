import { describe, it, expect } from "vitest";
import { buildQualityEvaluationPrompt, type ShotQualityContract } from "@/lib/generation-quality";

const contract: ShotQualityContract = {
  version: 1,
  shotId: 1,
  shotType: "demo",
  mediaType: "image",
  targetDuration: 5,
  description: "test",
  prompt: "test",
  camera: "static",
  voiceover: "",
  anchors: { character: [], product: [], wardrobe: [], environment: [] },
  dimensions: [],
  referenceRoles: ["output"],
} as unknown as ShotQualityContract;

describe("buildQualityEvaluationPrompt 输出语言跟随 locale", () => {
  it("th → ภาษาไทย（不再回落中文）", () => {
    const p = buildQualityEvaluationPrompt(contract, "th");
    expect(p).toContain("ภาษาไทย");
    expect(p).not.toContain("简体中文");
  });
  it("zh/en 保持原行为", () => {
    expect(buildQualityEvaluationPrompt(contract, "zh")).toContain("简体中文");
    expect(buildQualityEvaluationPrompt(contract, "en")).toContain("English");
  });
});
