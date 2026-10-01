import { describe, it, expect } from "vitest";
import { buildUserPrompt, buildTopicPrompt } from "@/lib/script-engine/prompts";
import { pickLocale } from "@/lib/api-error";
import { defaultVoiceForText } from "@/lib/edge-tts";
import { shotQuery, broadenQuery } from "@/lib/stock-matcher";

describe("การตรวจสอบระบบการทำคลิปขายสินค้าสำหรับคนไทย (Thai Systematic Pipeline)", () => {
  it("เมื่อกำหนด locale เป็น 'th' แม้ชื่อสินค้าจะเป็นภาษาอังกฤษ (English Brand Name) ต้องสร้างสคริปต์เป็นภาษาไทยสำหรับขายคนไทย", () => {
    const prompt = buildUserPrompt({
      productName: "Sony WH-1000XM5 Wireless Headphones",
      category: "tech",
      productDescription: "Active noise cancelling, 30 hours battery, premium sound",
      styleType: "pain_point",
      locale: "th",
    });

    expect(prompt).toContain("LANGUAGE — IMPORTANT");
    expect(prompt).toContain("natural spoken Thai");
    expect(prompt).toContain("TikTok Shop");
    expect(prompt).not.toContain("The product info is NOT in Chinese");
  });

  it("เมื่อกำหนด locale เป็น 'th' แม้ข้อความสินค้าจะเป็นภาษาจีน (เช่น นำเข้าจาก 1688) ต้องแปลงเป็นสคริปต์ภาษาไทยสำหรับคนไทย", () => {
    const prompt = buildUserPrompt({
      productName: "便携式榨汁机",
      category: "home",
      productDescription: "无线便携，强劲动力，轻松碎冰",
      styleType: "scene",
      locale: "th",
    });

    expect(prompt).toContain("natural spoken Thai");
    expect(prompt).toContain("TikTok Shop");
  });

  it("พรอมต์สำหรับภาษาไทยต้องมีคำแนะนำจังหวะการพูด (10-14 ตัวอักษร/วินาที หรือ 3-4 คำ/วินาที) และคำลงท้ายสุภาพ (ค่ะ/นะคะ)", () => {
    const prompt = buildUserPrompt({
      productName: "แก้วปั่นพกพา",
      category: "home",
      styleType: "pain_point",
      locale: "th",
    });

    expect(prompt).toContain("10-14");
    expect(prompt).toContain("ค่ะ / นะคะ");
  });

  it("เมื่อเป็นหัวข้อแบบ One-line topic และระบุ locale เป็น 'th' ต้องสร้างสคริปต์เป็นภาษาไทยแม้หัวข้อจะเป็นภาษาอังกฤษ", () => {
    const prompt = buildTopicPrompt({
      topic: "How to make espresso at home",
      locale: "th",
    });

    expect(prompt).toContain("natural Thai");
    expect(prompt).not.toContain("NOT in Chinese");
  });

  it("pickLocale ต้องให้ความสำคัญกับ header 'x-clipforge-locale' และเป็น 'th' โดยเริ่มต้น", () => {
    const reqWithHeader = {
      headers: new Headers({ "x-clipforge-locale": "th" }),
    };
    expect(pickLocale(reqWithHeader)).toBe("th");

    const reqEmpty = {
      headers: new Headers(),
    };
    expect(pickLocale(reqEmpty)).toBe("th");
  });

  it("การเลือกเสียงพากย์ดีฟอลต์สำหรับข้อความภาษาไทยต้องเป็นเสียงไทย (th-TH-PremwadeeNeural)", () => {
    expect(defaultVoiceForText("สวัสดีครับ วันนี้มีสินค้าดีๆ มาแนะนำ")).toBe("th-TH-PremwadeeNeural");
    expect(defaultVoiceForText("")).toBe("th-TH-PremwadeeNeural");
  });

  it("เมื่อค้นหาฟุตเทจจากคำอธิบายภาษาไทย broadenQuery ต้องมีทางออกที่ไม่หลุดไปคำทั่วไปที่ไม่เกี่ยวข้องทันที", () => {
    const thaiQuery = shotQuery({ description: "แก้วปั่นน้ำผลไม้สดพกพา" });
    expect(thaiQuery).toBe("แก้วปั่นน้ำผลไม้สดพกพา");

    const fallbacks = broadenQuery(thaiQuery, "portable blender");
    expect(fallbacks).toContain("portable blender");
  });
});
