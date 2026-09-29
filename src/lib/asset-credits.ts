/**
 * Asset credits / license manifest — aggregates the provenance every stock provider already persists
 * (assets.sourceUrl/author/license) into an exportable attribution + commercial-risk report.
 *
 * Why (2026 survey): "free tools give no proof of commercial licensing → paid-traffic ad review rejects
 * the video or bans the account" is a recurring domestic pain point. Every provider stores provenance,
 * but nothing aggregated it for the user until now. Pure functions; the route/CLI/MCP feed it DB rows.
 */

export type CreditRisk = "ok" | "attribution" | "review";

export interface CreditAssetInput {
  shotId: number;
  /** assets.type: ai_generated | product_image | user_upload | stock_footage */
  type: string;
  provider?: string | null;
  filePath?: string | null;
  sourceUrl?: string | null;
  author?: string | null;
  license?: string | null;
}

export interface CreditItem {
  shotId: number;
  kind: "image" | "video" | "audio" | "unknown";
  /** stock = fetched from a free library; own = user-provided; ai = AI-generated */
  origin: "stock" | "own" | "ai";
  provider?: string;
  author?: string;
  license?: string;
  sourceUrl?: string;
  requiresAttribution: boolean;
  risk: CreditRisk;
  note: { zh: string; en: string; th?: string };
  /** ready-to-paste attribution line (present when attribution is required) */
  attributionLine?: string;
}

export interface CreditsManifest {
  project: string;
  items: CreditItem[];
  bgm?: CreditItem;
  summary: {
    total: number;
    needsAttribution: number;
    needsReview: number;
    /** false when any item needs manual review (NC/unknown license) */
    commercialSafe: boolean;
  };
}

/** BGM provenance sidecar shape written by free-bgm at download time. */
export interface BgmCredit {
  author?: string;
  license?: string;
  sourceUrl?: string;
}

const VIDEO_EXT = /\.(mp4|webm|mov|mkv|avi)$/i;
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i;

function kindOf(filePath?: string | null): CreditItem["kind"] {
  if (!filePath) return "unknown";
  if (VIDEO_EXT.test(filePath)) return "video";
  if (AUDIO_EXT.test(filePath)) return "audio";
  return "image";
}

/**
 * Classify a license string for commercial short-video use.
 * - review: NC (non-commercial) CC variants must never go into paid traffic; unknown licenses need a human check
 * - attribution: BY-family CC licenses are commercial-safe but require credit
 * - ok: PD / CC0 / platform licenses that are commercial-friendly without attribution (Pexels/Pixabay/NASA)
 */
export function classifyLicense(license?: string | null): { risk: CreditRisk; requiresAttribution: boolean } {
  const l = (license ?? "").trim().toLowerCase();
  if (!l || l === "unknown") return { risk: "review", requiresAttribution: false };
  // CC NonCommercial variants (by-nc, by-nc-sa, cc-by-nc-4.0 …) — commercial use not allowed
  if (/(^|[^a-z])nc([^a-z]|$)/.test(l)) return { risk: "review", requiresAttribution: false };
  // NoDerivatives forbids the edits a video composite inherently makes
  if (/(^|[^a-z])nd([^a-z]|$)/.test(l)) return { risk: "review", requiresAttribution: false };
  if (l.includes("public domain") || l === "pdm" || l.includes("cc0") || l === "pd") {
    return { risk: "ok", requiresAttribution: false };
  }
  // platform licenses: free commercial use, attribution appreciated but not required
  if (l === "pexels" || l === "pixabay") return { risk: "ok", requiresAttribution: false };
  // Coverr: free commercial use, but content fetched via the API requires Coverr attribution
  if (l === "coverr") return { risk: "attribution", requiresAttribution: true };
  // CC BY / BY-SA family (openverse "by-2.0", wikimedia "CC BY-SA 4.0" …)
  if (/(^|[^a-z])by([^a-z]|$)|cc[- ]by/.test(l)) return { risk: "attribution", requiresAttribution: true };
  // anything else (GFDL, custom terms …) — surface for a human decision
  return { risk: "review", requiresAttribution: false };
}

/** "Author · License · URL" — a paste-ready credit for descriptions/end cards. */
export function buildAttributionLine(item: { author?: string | null; license?: string | null; sourceUrl?: string | null }): string {
  const parts = [item.author?.trim() || "Unknown author", item.license?.trim() || "License unknown"];
  if (item.sourceUrl?.trim()) parts.push(item.sourceUrl.trim());
  return parts.join(" · ");
}

function toItem(a: CreditAssetInput): CreditItem {
  const kind = kindOf(a.filePath);
  if (a.type === "product_image" || a.type === "user_upload" || a.provider === "local") {
    return {
      shotId: a.shotId,
      kind,
      origin: "own",
      provider: a.provider ?? undefined,
      requiresAttribution: false,
      risk: "ok",
      note: { zh: "自有素材（上传/商品图），无需第三方授权", en: "Own material (upload/product image); no third-party license needed", th: "สื่อของตัวเอง (อัปโหลด/รูปสินค้า) ไม่ต้องขออนุญาตบุคคลที่สาม" },
    };
  }
  if (a.type === "ai_generated") {
    return {
      shotId: a.shotId,
      kind,
      origin: "ai",
      provider: a.provider ?? undefined,
      requiresAttribution: false,
      risk: "ok",
      note: { zh: "AI 生成素材（发布时保持 AIGC 标识合规即可）", en: "AI-generated material (keep the AIGC disclosure compliant when publishing)", th: "สื่อที่ AI สร้าง (ตอนเผยแพร่คงป้าย AIGC ให้ถูกต้อง)" },
    };
  }
  const { risk, requiresAttribution } = classifyLicense(a.license);
  const base: CreditItem = {
    shotId: a.shotId,
    kind,
    origin: "stock",
    provider: a.provider ?? undefined,
    author: a.author ?? undefined,
    license: a.license ?? undefined,
    sourceUrl: a.sourceUrl ?? undefined,
    requiresAttribution,
    risk,
    note:
      risk === "review"
        ? { zh: "许可不明或含 NC/ND 限制，商用投流前请人工确认或替换", en: "Unclear or NC/ND-restricted license; confirm or replace before commercial ads", th: "ใบอนุญาตไม่ชัดหรือมีข้อจำกัด NC/ND ตรวจทานหรือเปลี่ยนก่อนยิงแอดเชิงพาณิชย์" }
        : requiresAttribution
          ? { zh: "CC 署名类许可：可商用，发布时需附署名（下方给出可直接复制的署名行）", en: "CC attribution license: commercial use OK, credit required (paste-ready line below)", th: "ใบอนุญาต CC แบบต้องระบุที่มา: ใช้เชิงพาณิชย์ได้ แต่ต้องระบุที่มา (มีบรรทัดพร้อมคัดลอกด้านล่าง)" }
          : { zh: "可免署名商用", en: "Commercial use without attribution", th: "ใช้เชิงพาณิชย์ได้โดยไม่ต้องระบุที่มา" },
  };
  if (requiresAttribution) base.attributionLine = buildAttributionLine(a);
  return base;
}

/** Build the manifest from asset rows (+ optional BGM sidecar credit). Pure function. */
export function buildCreditsManifest(
  projectName: string,
  assets: CreditAssetInput[],
  bgm?: BgmCredit | null
): CreditsManifest {
  const items = assets.map(toItem);
  let bgmItem: CreditItem | undefined;
  if (bgm) {
    const { risk, requiresAttribution } = classifyLicense(bgm.license);
    bgmItem = {
      shotId: -1,
      kind: "audio",
      origin: "stock",
      author: bgm.author,
      license: bgm.license,
      sourceUrl: bgm.sourceUrl,
      requiresAttribution,
      risk,
      note:
        risk === "review"
          ? { zh: "BGM 许可不明，投流前请人工确认", en: "BGM license unclear; confirm before running ads", th: "ใบอนุญาต BGM ไม่ชัด ยิงแอดก่อนโปรดให้คนยืนยัน" }
          : requiresAttribution
            ? { zh: "BGM 为 CC 署名类许可，发布时需附署名", en: "BGM is CC-attribution licensed; credit required", th: "BGM เป็นใบอนุญาต CC แบบต้องระบุที่มา เผยแพร่ต้องระบุที่มา" }
            : { zh: "BGM 可免署名商用", en: "BGM: commercial use without attribution", th: "BGM ใช้เชิงพาณิชย์ได้โดยไม่ต้องระบุที่มา" },
    };
    if (requiresAttribution) bgmItem.attributionLine = buildAttributionLine(bgm);
  }
  const all = bgmItem ? [...items, bgmItem] : items;
  const needsAttribution = all.filter((i) => i.requiresAttribution).length;
  const needsReview = all.filter((i) => i.risk === "review").length;
  return {
    project: projectName,
    items,
    ...(bgmItem ? { bgm: bgmItem } : {}),
    summary: { total: all.length, needsAttribution, needsReview, commercialSafe: needsReview === 0 },
  };
}

const KIND_LABEL: Record<string, { zh: string; en: string; th: string }> = {
  image: { zh: "图片", en: "Image", th: "รูปภาพ" },
  video: { zh: "视频", en: "Video", th: "วิดีโอ" },
  audio: { zh: "音频", en: "Audio", th: "เสียง" },
  unknown: { zh: "素材", en: "Asset", th: "สื่อ" },
};

/** Render the manifest as a human-readable Markdown report (paste into ad review / description / archives). */
export function renderCreditsMarkdown(m: CreditsManifest, locale: "zh" | "en" | "th" = "zh"): string {
  const zh = locale === "zh";
  const th = locale === "th";
  const lines: string[] = [];
  lines.push(
    zh
      ? `# 素材授权清单 — ${m.project}`
      : th
        ? `# รายการลิขสิทธิ์สื่อ — ${m.project}`
        : `# Asset license manifest — ${m.project}`
  );
  lines.push("");
  lines.push(
    zh
      ? `共 ${m.summary.total} 项素材：需署名 ${m.summary.needsAttribution} 项，需人工复核 ${m.summary.needsReview} 项。`
      : th
        ? `สื่อทั้งหมด ${m.summary.total} รายการ: ต้องระบุที่มา ${m.summary.needsAttribution} รายการ ต้องตรวจทาน ${m.summary.needsReview} รายการ`
        : `${m.summary.total} asset(s): ${m.summary.needsAttribution} need attribution, ${m.summary.needsReview} need manual review.`
  );
  lines.push(
    m.summary.commercialSafe
      ? zh
        ? "✅ 未发现商用限制素材（NC/ND/未知许可为 0）。"
        : th
          ? "✅ ไม่พบสื่อที่มีข้อจำกัดเชิงพาณิชย์ (NC/ND/ใบอนุญาตไม่ทราบ = 0)"
          : "✅ No commercially-restricted assets found (0 NC/ND/unknown licenses)."
      : zh
        ? "⚠️ 存在需人工复核的素材，投流前请确认或替换（见下方标注）。"
        : th
          ? "⚠️ มีสื่อที่ต้องตรวจทานก่อนยิงแอด โปรดยืนยันหรือเปลี่ยน (ดูรายการด้านล่าง)"
          : "⚠️ Some assets need manual review; confirm or replace before running paid ads (flagged below)."
  );
  lines.push("");

  const attributions = [...m.items, ...(m.bgm ? [m.bgm] : [])].filter((i) => i.attributionLine);
  if (attributions.length > 0) {
    lines.push(zh ? "## 需附署名（可直接复制到发布文案/简介）" : th ? "## ต้องระบุที่มา (คัดลอกไปใส่แคปชัน/คำอธิบายได้เลย)" : "## Required attributions (paste into caption/description)");
    for (const a of attributions) lines.push(`- ${a.attributionLine}`);
    lines.push("");
  }

  const reviews = [...m.items, ...(m.bgm ? [m.bgm] : [])].filter((i) => i.risk === "review");
  if (reviews.length > 0) {
    lines.push(zh ? "## 需人工复核" : th ? "## ต้องตรวจทานโดยคน" : "## Needs manual review");
    for (const r of reviews) {
      const where = r.shotId >= 0 ? (zh ? `分镜 ${r.shotId + 1}` : th ? `ช็อต ${r.shotId + 1}` : `Shot ${r.shotId + 1}`) : "BGM";
      lines.push(`- ${where}: ${r.license || (zh ? "许可未知" : th ? "ไม่ทราบใบอนุญาต" : "license unknown")}${r.sourceUrl ? ` · ${r.sourceUrl}` : ""}`);
    }
    lines.push("");
  }

  lines.push(zh ? "## 全部素材" : th ? "## สื่อทั้งหมด" : "## All assets");
  const rows = [...m.items, ...(m.bgm ? [m.bgm] : [])];
  for (const i of rows) {
    const where = i.shotId >= 0 ? (zh ? `分镜 ${i.shotId + 1}` : th ? `ช็อต ${i.shotId + 1}` : `Shot ${i.shotId + 1}`) : "BGM";
    const kind = KIND_LABEL[i.kind]?.[locale] ?? KIND_LABEL[i.kind]?.en ?? i.kind;
    const bits = [where, kind];
    if (i.provider) bits.push(i.provider);
    if (i.author) bits.push(i.author);
    if (i.license) bits.push(i.license);
    if (i.sourceUrl) bits.push(i.sourceUrl);
    lines.push(`- ${bits.join(" · ")}${i.note ? ` — ${i.note[locale] ?? i.note.en}` : ""}`);
  }
  lines.push("");
  return lines.join("\n");
}
