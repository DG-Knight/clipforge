import { describe, it, expect } from "vitest";
import { formatCameraForDisplay, cameraPresetGuide } from "@/lib/camera-presets";

describe("formatCameraForDisplay: การแสดงผลมุมกล้องภาษาไทย", () => {
  it("ตัดคำนำหน้า '镜头:' หรือ '镜头：' หรือ 'camera:' ออกอัตโนมัติ", () => {
    expect(formatCameraForDisplay("镜头:快速推近主体", "zh")).toBe("快速推近主体");
    expect(formatCameraForDisplay("镜头：围绕主体旋转", "zh")).toBe("围绕主体旋转");
    expect(formatCameraForDisplay("camera: slow orbit", "en")).toBe("slow orbit");
  });

  it("แปลง preset ภาษาจีน/อังกฤษให้แสดงเป็นชื่อภาษาไทยที่เข้าใจง่าย", () => {
    // crash_push prompt.zh: "镜头急速推近主体，冲击力强，开场抓眼"
    expect(formatCameraForDisplay("镜头急速推近主体，冲击力强，开场抓眼", "th")).toBe("พุ่งเข้าอย่างเร็ว");
    expect(formatCameraForDisplay("camera crashes in fast on the subject, high impact, attention-grabbing opening", "th")).toBe("พุ่งเข้าอย่างเร็ว");
    expect(formatCameraForDisplay("low-angle hero shot, camera pushing in slowly, commanding presence", "th")).toBe("ช็อตฮีโร่");
  });

  it("แปลข้อความมุมกล้องภาษาจีนจากภาพจริงของผู้ใช้ให้เป็นภาษาไทย", () => {
    // Shot 01 ในภาพ: 镜头:快速推运动向主体、动感强烈、节奏极强
    const shot01 = formatCameraForDisplay("镜头:快速推运动向主体、动感强烈、节奏极强", "th");
    expect(shot01).toContain("ดอลลี่เข้าเร็วหาสินค้า");
    expect(shot01).not.toContain("镜头:");

    // Shot 02 ในภาพ: 镜头:围绕主体旋转半圈、高光沿表面流动、立体感强
    const shot02 = formatCameraForDisplay("镜头:围绕主体旋转半圈、高光沿表面流动、立体感强", "th");
    expect(shot02).toContain("หมุนวนรอบสินค้าครึ่งรอบ");
    expect(shot02).not.toContain("镜头:");

    // Shot 03 ในภาพ: 镜头:低角度俯视推进主体、强调画面细节
    const shot03 = formatCameraForDisplay("镜头:低角度俯视推进主体、强调画面细节", "th");
    expect(shot03).toContain("มุมมองกดลงระดับต่ำ");
    expect(shot03).not.toContain("镜头:");
  });

  it("รองรับข้อความภาษาอังกฤษและภาษาไทยที่มีอยู่แล้วโดยไม่เปลี่ยนความหมาย", () => {
    expect(formatCameraForDisplay("ซูมเข้าช้าๆ", "th")).toBe("ซูมเข้าช้าๆ");
    expect(formatCameraForDisplay("slow orbit around product", "en")).toBe("slow orbit around product");
  });

  it("cameraPresetGuide รองรับ locale th/en โดยไม่มีภาษาจีน", () => {
    const thGuide = cameraPresetGuide("th");
    expect(thGuide).not.toContain("中文镜头运动描述");
    expect(thGuide).toContain("Camera movement description");

    const zhGuide = cameraPresetGuide("zh");
    expect(zhGuide).toContain("中文镜头运动描述");
  });
});
