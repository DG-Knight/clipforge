import { describe, it, expect } from "vitest";
import { alignThaiPoliteParticles } from "@/lib/thai-gender";
import { genderOfVoice } from "@/lib/tts-voices";

describe("Thai Gender & Polite Particle Alignment", () => {
  describe("genderOfVoice", () => {
    it("identifies Thai female voices correctly", () => {
      expect(genderOfVoice("th-TH-PremwadeeNeural")).toBe("female");
      expect(genderOfVoice("th-TH-AcharaNeural")).toBe("female");
    });

    it("identifies Thai male voices correctly", () => {
      expect(genderOfVoice("th-TH-NiwatNeural")).toBe("male");
    });

    it("identifies other multilingual voices correctly", () => {
      expect(genderOfVoice("zh-CN-XiaoxiaoNeural")).toBe("female");
      expect(genderOfVoice("zh-CN-YunjianNeural")).toBe("male");
      expect(genderOfVoice("en-US-JennyNeural")).toBe("female");
      expect(genderOfVoice("en-US-GuyNeural")).toBe("male");
    });

    it("returns undefined for unknown voice IDs", () => {
      expect(genderOfVoice("custom-unknown-voice")).toBeUndefined();
    });
  });

  describe("alignThaiPoliteParticles", () => {
    it("converts male particles to female particles when voice is female", () => {
      const input = "สวัสดีครับทุกคน ตัวนี้เป็นรุ่นใหม่ล่าสุดเลยครับ มีโปรโมชั่นพิเศษนะครับ สนใจสั่งซื้อได้เลยครับ";
      const output = alignThaiPoliteParticles(input, "female");

      expect(output).not.toContain("ครับ");
      expect(output).toContain("สวัสดีค่ะทุกคน");
      expect(output).toContain("รุ่นใหม่ล่าสุดเลยค่ะ");
      expect(output).toContain("โปรโมชั่นพิเศษนะคะ");
      expect(output).toContain("สนใจสั่งซื้อได้เลยค่ะ");
    });

    it("handles question particles correctly for female voice", () => {
      const input = "ชอบไหมครับ สั่งซื้อหรือยังครับ จริงหรือเปล่าครับ";
      const output = alignThaiPoliteParticles(input, "female");

      expect(output).toContain("ชอบไหมคะ");
      expect(output).toContain("หรือยังคะ");
      expect(output).toContain("หรือเปล่าคะ");
      expect(output).not.toContain("ครับ");
    });

    it("converts female particles to male particles when voice is male", () => {
      const input = "สวัสดีค่ะ วันนี้ผมมีของดีมาแนะนำนะคะ สนใจทักมาได้เลยค่ะ";
      const output = alignThaiPoliteParticles(input, "male");

      expect(output).not.toContain("ค่ะ");
      expect(output).not.toContain("นะคะ");
      expect(output).toContain("สวัสดีครับ");
      expect(output).toContain("แนะนำนะครับ");
      expect(output).toContain("ได้เลยครับ");
    });

    it("leaves text untouched when gender is undefined or non-Thai", () => {
      const input = "สวัสดีครับทุกคน";
      expect(alignThaiPoliteParticles(input, undefined)).toBe(input);
      expect(alignThaiPoliteParticles("Hello world", "female")).toBe("Hello world");
    });
  });
});
