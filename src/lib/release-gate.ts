/**
 * Release gate — one aggregated pre-publish verdict over the checks the pipeline already runs
 * separately: script publish-readiness (ad-law words / hook / duration / CTA / early product),
 * composed-video QC (streams / black / silence / loudness) and the asset license manifest
 * (commercial risk / attribution). Callers assemble the three sub-reports; this module only maps
 * them onto a single pass|warn|fail report with strict, scriptable semantics:
 *
 *   - fail  → something is objectively broken or platform-risky; do not publish as-is
 *   - warn  → needs a human decision (license review, attribution, soft risks)
 *   - pass  → nothing blocking found by the automated checks
 *
 * Pure functions; the route/CLI/MCP feed it data. CLI maps fail (and warn under --strict) to
 * exit code 2 so shell scripts and agents can gate on it.
 */
import type { QcReport } from "@/lib/video-composer/qc";
import type { CreditsManifest } from "@/lib/asset-credits";
import type { ReadinessReport } from "@/lib/publish-readiness";
import type { AiCommerceWarning } from "@/lib/ai-commerce-compliance";
import type { RealMixReport } from "@/lib/real-mix";

export type GateStatus = "pass" | "warn" | "fail";
export type GateItemId = "readiness" | "qc" | "quality" | "credits" | "aiPolicy" | "realMix";

export interface GateItem {
  id: GateItemId;
  status: GateStatus;
  /** one-line summary, trilingual — UI/CLI pick by locale (th optional, falls back to en) */
  message: { zh: string; en: string; th?: string };
  /** concrete problems behind a warn/fail, ready to display as sub-lines */
  problems: { zh: string; en: string; th?: string }[];
}

export interface GateReport {
  /** worst status across items */
  status: GateStatus;
  items: GateItem[];
  summary: { pass: number; warn: number; fail: number };
  verdict: { zh: string; en: string; th?: string };
}

/**
 * Script readiness → gate item. `checkPublishReadiness` returns single-locale strings, so the
 * caller runs it once per locale on identical input; the item lists are index-aligned because the
 * checker is deterministic.
 */
export function gateItemFromReadiness(
  zh: ReadinessReport | null,
  en: ReadinessReport | null,
  th: ReadinessReport | null = null
): GateItem {
  if (!zh || !en) {
    return {
      id: "readiness",
      status: "fail",
      message: {
        zh: "没有可检查的脚本——先生成并选择脚本",
        en: "No script to check — generate and select a script first",
        th: "ยังไม่มีสคริปต์ให้ตรวจ — สร้างและเลือกสคริปต์ก่อน",
      },
      problems: [],
    };
  }
  const problems = zh.items
    .map((item, i) => ({
      item,
      enMsg: en.items[i]?.message ?? item.message,
      thMsg: th?.items[i]?.message ?? item.message,
    }))
    .filter(({ item }) => item.status !== "pass")
    .map(({ item, enMsg, thMsg }) => ({ zh: item.message, en: enMsg, ...(th ? { th: thMsg } : {}) }));
  if (zh.overall === "needsWork") {
    return {
      id: "readiness",
      status: "fail",
      message: {
        zh: `脚本发布就绪检查未过（${zh.fail} 项需修复、${zh.warn} 项有风险）`,
        en: `Script readiness check failed (${zh.fail} to fix, ${zh.warn} risky)`,
        ...(th ? { th: `ตรวจความพร้อมสคริปต์ไม่ผ่าน (ต้องแก้ ${th.fail} ข้อ เสี่ยง ${th.warn} ข้อ)` } : {}),
      },
      problems,
    };
  }
  if (zh.overall === "risky") {
    return {
      id: "readiness",
      status: "warn",
      message: {
        zh: `脚本发布就绪检查有 ${zh.warn} 项风险提示`,
        en: `Script readiness check has ${zh.warn} risk warning(s)`,
        ...(th ? { th: `ตรวจความพร้อมสคริปต์มีข้อควรระวัง ${th.warn} ข้อ` } : {}),
      },
      problems,
    };
  }
  return {
    id: "readiness",
    status: "pass",
    message: {
      zh: "脚本发布就绪检查全部通过",
      en: "Script readiness checks all passed",
      ...(th ? { th: "ตรวจความพร้อมสคริปต์ผ่านทั้งหมด" } : {}),
    },
    problems: [],
  };
}

/** Composed-video QC → gate item. `null` means nothing was composed yet — that alone blocks publishing. */
export function gateItemFromQc(qc: QcReport | null): GateItem {
  if (!qc) {
    return {
      id: "qc",
      status: "fail",
      message: { zh: "还没有成片——先合成视频再过门禁", en: "No composed video yet — compose before gating", th: "ยังไม่มีวิดีโอรวมฉาก — รวมวิดีโอก่อนแล้วค่อยตรวจ" },
      problems: [],
    };
  }
  const problems = qc.checks.filter((c) => c.level !== "ok").map((c) => c.message);
  if (qc.status === "fail") {
    const n = qc.checks.filter((c) => c.level === "fail").length;
    return {
      id: "qc",
      status: "fail",
      message: { zh: `成片质检不通过（${n} 项失败）`, en: `Video QC failed (${n} check(s))`, th: `ตรวจคุณภาพวิดีโอไม่ผ่าน (ล้มเหลว ${n} รายการ)` },
      problems,
    };
  }
  if (qc.status === "warn") {
    return {
      id: "qc",
      status: "warn",
      message: {
        zh: `成片质检有 ${problems.length} 项警告`,
        en: `Video QC has ${problems.length} warning(s)`,
        th: `ตรวจคุณภาพวิดีโอมีข้อควรระวัง ${problems.length} รายการ`,
      },
      problems,
    };
  }
  return {
    id: "qc",
    status: "pass",
    message: { zh: "成片质检通过", en: "Video QC passed", th: "ตรวจคุณภาพวิดีโอผ่าน" },
    problems: [],
  };
}

export interface QualityGateRow {
  shotId: number;
  verdict?: "accept" | "review" | "reject" | null;
  humanDecision?: "accepted" | "rejected" | null;
  overall?: number | null;
}

/** Semantic generation quality → gate item. Automated doubt warns; an explicit human rejection fails. */
export function gateItemFromGenerationQuality(rows: QualityGateRow[]): GateItem {
  if (rows.length === 0) {
    return {
      id: "quality",
      status: "pass",
      message: { zh: "没有需要语义验收的 AI 生成镜头", en: "No AI-generated shots require semantic review", th: "ไม่มีช็อตที่ AI สร้างซึ่งต้องตรวจรับโดยคน" },
      problems: [],
    };
  }
  const rejected = rows.filter((row) => row.humanDecision === "rejected");
  const pending = rows.filter((row) => !row.humanDecision && !row.verdict);
  const flagged = rows.filter((row) => !row.humanDecision && (row.verdict === "review" || row.verdict === "reject"));
  const problems = [
    ...rejected.map((row) => ({ zh: `分镜 ${row.shotId}：人工已标记不采用`, en: `Shot ${row.shotId}: explicitly rejected by the reviewer`, th: `ช็อต ${row.shotId}: ผู้ตรวจปฏิเสธอย่างชัดเจน` })),
    ...pending.map((row) => ({ zh: `分镜 ${row.shotId}：尚未运行镜头质量评估`, en: `Shot ${row.shotId}: shot quality has not been evaluated`, th: `ช็อต ${row.shotId}: ยังไม่ได้ประเมินคุณภาพช็อต` })),
    ...flagged.map((row) => ({
      zh: `分镜 ${row.shotId}：自动评估${row.overall != null ? ` ${Math.round(row.overall)} 分` : ""}，需人工确认`,
      en: `Shot ${row.shotId}: automated review${row.overall != null ? ` scored ${Math.round(row.overall)}` : ""}; human confirmation needed`,
      th: `ช็อต ${row.shotId}: ประเมินอัตโนมัติ${row.overall != null ? ` ได้ ${Math.round(row.overall)} คะแนน` : ""} ต้องให้คนยืนยัน`,
    })),
  ];
  if (rejected.length > 0) {
    return {
      id: "quality",
      status: "fail",
      message: { zh: `${rejected.length} 个当前镜头已被人工拒绝，请先切换或修复`, en: `${rejected.length} active shot(s) were explicitly rejected; replace or fix them before release`, th: `มีช็อตที่ถูกปฏิเสธแล้ว ${rejected.length} ช็อต — เปลี่ยนหรือแก้ก่อนเผยแพร่` },
      problems,
    };
  }
  if (pending.length > 0 || flagged.length > 0) {
    return {
      id: "quality",
      status: "warn",
      message: { zh: `${pending.length + flagged.length} 个 AI 镜头仍需质量确认`, en: `${pending.length + flagged.length} AI-generated shot(s) still need quality confirmation`, th: `ยังมีช็อต AI ที่ต้องยืนยันคุณภาพอีก ${pending.length + flagged.length} ช็อต` },
      problems,
    };
  }
  return {
    id: "quality",
    status: "pass",
    message: { zh: "当前 AI 镜头均已通过自动建议或人工验收", en: "All active AI-generated shots passed automated or human review", th: "ช็อต AI ทั้งหมดผ่านการตรวจอัตโนมัติหรือตรวจโดยคนแล้ว" },
    problems: [],
  };
}

/**
 * Asset license manifest → gate item. License review is inherently a human decision, so restricted /
 * unknown licenses map to warn (blocking under --strict), never to an automated fail.
 */
export function gateItemFromCredits(m: CreditsManifest | null): GateItem {
  if (!m) {
    return {
      id: "credits",
      status: "warn",
      message: {
        zh: "没有素材记录可核对授权——若用了外部素材请人工确认",
        en: "No asset records to verify licensing — confirm manually if external footage was used",
        th: "ไม่มีบันทึกสื่อให้ตรวจสอบลิขสิทธิ์ — หากใช้สื่อจากภายนอกโปรดตรวจสอบเอง",
      },
      problems: [],
    };
  }
  const rows = [...m.items, ...(m.bgm ? [m.bgm] : [])];
  const problems = rows
    .filter((i) => i.risk === "review")
    .map((i) => {
      const zhWhere = i.shotId >= 0 ? `分镜 ${i.shotId + 1}` : "BGM";
      const enWhere = i.shotId >= 0 ? `Shot ${i.shotId + 1}` : "BGM";
      return {
        zh: `${zhWhere}：${i.license || "许可未知"} — ${i.note.zh}`,
        en: `${enWhere}: ${i.license || "license unknown"} — ${i.note.en}`,
        th: `${enWhere}: ${i.license || "ไม่ทราบใบอนุญาต"} — ${i.note.th ?? i.note.en}`,
      };
    });
  if (m.summary.needsAttribution > 0) {
    problems.push({
      zh: `${m.summary.needsAttribution} 条署名行需随发布文案附上（见授权清单）`,
      en: `${m.summary.needsAttribution} attribution line(s) must accompany the post (see the manifest)`,
      th: `ต้องแนบบรรทัดระบุที่มา ${m.summary.needsAttribution} รายการไปกับโพสต์ (ดูในรายการลิขสิทธิ์)`,
    });
  }
  if (m.summary.needsReview > 0) {
    return {
      id: "credits",
      status: "warn",
      message: {
        zh: `${m.summary.needsReview} 项素材许可需人工复核（NC/ND/未知）——投流前确认或替换`,
        en: `${m.summary.needsReview} asset license(s) need manual review (NC/ND/unknown) — confirm or replace before running ads`,
        th: `มีใบอนุญาตสื่อที่ต้องให้คนตรวจอีก ${m.summary.needsReview} รายการ (NC/ND/ไม่ทราบ) — ยืนยันหรือเปลี่ยนก่อนยิงแอด`,
      },
      problems,
    };
  }
  if (m.summary.needsAttribution > 0) {
    return {
      id: "credits",
      status: "warn",
      message: {
        zh: `素材可商用，但 ${m.summary.needsAttribution} 条署名需随发布附上`,
        en: `Assets are commercial-safe, but ${m.summary.needsAttribution} attribution(s) must accompany the post`,
        th: `สื่อใช้เชิงพาณิชย์ได้ แต่ต้องระบุที่มา ${m.summary.needsAttribution} รายการเมื่อเผยแพร่`,
      },
      problems,
    };
  }
  return {
    id: "credits",
    status: "pass",
    message: { zh: "素材授权可商用，无需署名", en: "Assets are commercial-safe, no attribution required", th: "สื่อใช้เชิงพาณิชย์ได้อย่างปลอดภัย ไม่ต้องระบุที่มา" },
    problems: [],
  };
}

/**
 * AI-commerce policy warnings → gate item. Always warn, never fail: these are platform-policy
 * judgment calls (Douyin's AI-content rules), and per product direction every feature stays
 * available — the user decides after seeing the risk.
 */
export function gateItemFromAiPolicy(warnings: AiCommerceWarning[]): GateItem {
  if (warnings.length === 0) {
    return {
      id: "aiPolicy",
      status: "pass",
      message: {
        zh: "AI 带货平台规则检查通过（测评形态/数字人类目/亲测宣称）",
        en: "AI-commerce platform-policy checks passed (review form / digital-human category / testimony claims)",
        th: "ผ่านการตรวจกฎแพลตฟอร์ม AI คอมเมิร์ซ (รูปแบบรีวิว/หมวดดิจิทัลฮิวแมน/การอ้างทดลองจริง)",
      },
      problems: [],
    };
  }
  return {
    id: "aiPolicy",
    status: "warn",
    message: {
      zh: `AI 带货平台规则有 ${warnings.length} 项风险提示（抖音 2026-07 规则，功能不受限，人工确认后发布）`,
      en: `AI-commerce platform policy raised ${warnings.length} risk warning(s) (Douyin 2026-07 rules; nothing is blocked — review before publishing)`,
      th: `กฎแพลตฟอร์ม AI คอมเมิร์ซมีข้อควรระวัง ${warnings.length} ข้อ (กฎ TikTok ปี 2026 — ไม่ปิดกั้นฟีเจอร์ ตรวจสอบก่อนเผยแพร่)`,
    },
    problems: warnings.map((w) => w.message),
  };
}

/**
 * Real/AI mix metering → gate item. Purely informative and ALWAYS pass: a labeled pure-AI video
 * is publishable, so the mix ratio must never block a pipeline (or trip CLI --strict). It exists
 * to make the Douyin hybrid-content traffic tilt visible and actionable.
 */
export function gateItemFromRealMix(mix: RealMixReport | null): GateItem {
  if (!mix) {
    return {
      id: "realMix",
      status: "pass",
      message: {
        zh: "无脚本/素材，实拍占比暂不可计算",
        en: "No script/assets yet — real-footage share not computable",
        th: "ยังไม่มีสคริปต์/สื่อ — ยังคำนวณสัดส่วนฟุตเทจจริงไม่ได้",
      },
      problems: [],
    };
  }
  return { id: "realMix", status: "pass", message: mix.message, problems: [] };
}

/** Aggregate gate items into the final report (worst status wins). Pure function. */
export function buildGateReport(items: GateItem[]): GateReport {
  const pass = items.filter((i) => i.status === "pass").length;
  const warn = items.filter((i) => i.status === "warn").length;
  const fail = items.filter((i) => i.status === "fail").length;
  const status: GateStatus = fail > 0 ? "fail" : warn > 0 ? "warn" : "pass";
  const verdict =
    status === "fail"
      ? {
          zh: "未过发布门禁——存在必须修复的问题，请勿直接发布/投流",
          en: "Release gate failed — fix the blocking issues before publishing or running ads",
          th: "ไม่ผ่านประตูก่อนเผยแพร่ — มีปัญหาที่ต้องแก้ก่อน ห้ามเผยแพร่หรือยิงแอดทันที",
        }
      : status === "warn"
        ? {
            zh: "有条件通过——存在需人工确认的风险项，确认后再发布",
            en: "Conditionally passed — review the flagged risks before publishing",
            th: "ผ่านแบบมีเงื่อนไข — มีความเสี่ยงที่ต้องให้คนยืนยัน ตรวจสอบก่อนเผยแพร่",
          }
        : {
            zh: "通过发布门禁——自动检查未发现拦截项",
            en: "Release gate passed — no blocking issues found by automated checks",
            th: "ผ่านประตูก่อนเผยแพร่ — การตรวจอัตโนมัติไม่พบปัญหาที่ขวางทาง",
          };
  return { status, items, summary: { pass, warn, fail }, verdict };
}
