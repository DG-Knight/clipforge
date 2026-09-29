/**
 * Key-free publish copy pack — works on the export page as "copy and post" even without an LLM configured.
 * Maps category + platform to trending hashtags and assembles titles and promo copy using pain-point / number / emotion hook templates.
 * Pure function, deterministic (same input → same output), unit-testable; users with an LLM still go through /api/llm/publish for higher-quality copy.
 */

import { buildShopLink } from "@/lib/shop-link";

export interface PublishPack {
  titles: string[];
  hashtags: string[]; // already prefixed with # and deduplicated
  caption: string;
  /** UTM-tagged storefront link (only present when a shopUrl was provided) — creators paste it where the platform allows (bio / cart / description) */
  shopLink?: string;
  /** platform AI-disclosure kit: why to declare + a paste-ready caption line (2026: Douyin auto-flags
   * undeclared AI content and throttles it; TikTok C2PA-detects and suppresses 50-70% — self-declaring
   * barely affects reach on either) */
  aiDeclaration: { notice: string; line: string };
  /** comment-section ops kit — the video's second landing page (buyers read comments before ordering) */
  commentKit: CommentKit;
}

/**
 * Comment-section operating material shipped WITH the video (2026 survey: TikTok now frames the
 * comment section as a commerce engine, and维护 vs 不维护 converts on a different order of
 * magnitude at the same view count — yet no video tool ships this).
 */
export interface CommentKit {
  /** pinned self-Q&A: pre-answers the #1 purchase blocker from the creator's own experience */
  pinned: string;
  /** reply templates for the recurring objections (price / effectiveness / hesitation) */
  objections: { q: string; a: string }[];
  /** compliance note — atmosphere comments need a real experience behind them; fabricated
   * customer testimonials are an enforcement target on every platform */
  notice: string;
}

export interface PublishPackInput {
  productName?: string;
  category?: string; // beauty/food/home/fashion/digital/other
  sellingPoints?: string; // selling points / description, may be multiple sentences
  platform?: string; // douyin/kuaishou/xiaohongshu/tiktok
  locale?: "zh" | "en" | "th"; // copy language, defaults to zh; en uses English titles/hashtags/CTA for overseas markets (avoids delivering Chinese copy to English-speaking users)
  shopUrl?: string; // storefront link to drive buyers to (from ingest or set manually); UTM-tagged into shopLink
  affiliateCode?: string; // optional affiliate/partner code for commission tracking
}

// Category trending hashtags (tuned for Douyin/Kuaishou/Xiaohongshu commerce context)
const CATEGORY_TAGS: Record<string, string[]> = {
  beauty: ["好物分享", "美妆", "护肤", "变美", "平价好物", "种草"],
  food: ["美食", "好吃推荐", "零食", "吃货日常", "干饭人", "种草"],
  home: ["家居好物", "居家生活", "生活好物", "收纳", "好物推荐", "种草"],
  fashion: ["穿搭", "时尚", "OOTD", "穿搭分享", "好物分享", "种草"],
  digital: ["数码", "数码好物", "科技", "实用好物", "好物推荐", "种草"],
  other: ["好物推荐", "种草", "好物分享", "值得买", "宝藏好物", "日常分享"],
};

// Category trending hashtags (English TikTok/Reels commerce context)
const CATEGORY_TAGS_EN: Record<string, string[]> = {
  beauty: ["BeautyTok", "SkincareRoutine", "MakeupHacks", "BeautyFinds", "GlowUp", "TikTokMadeMeBuyIt"],
  food: ["FoodTok", "FoodieFinds", "SnackHaul", "TikTokFood", "MustTry", "TikTokMadeMeBuyIt"],
  home: ["HomeFinds", "HomeHacks", "CleanTok", "OrganizationTips", "CozyHome", "TikTokMadeMeBuyIt"],
  fashion: ["OOTD", "FashionTok", "StyleInspo", "OutfitIdeas", "FashionFinds", "TikTokMadeMeBuyIt"],
  digital: ["TechTok", "GadgetFinds", "TechReview", "CoolGadgets", "Innovation", "TikTokMadeMeBuyIt"],
  other: ["TikTokMadeMeBuyIt", "MustHave", "ProductReview", "WorthIt", "TikTokFinds", "DailyFinds"],
};

// Category trending hashtags (Thai TikTok Shop / Shopee / Lazada commerce context)
const CATEGORY_TAGS_TH: Record<string, string[]> = {
  beauty: ["ของดีบอกต่อ", "ป้ายยา", "สกินแคร์", "บิวตี้", "รีวิวบิวตี้", "ใช้ดีบอกต่อ"],
  food: ["ของอร่อย", "ป้ายยาของกิน", "รีวิวอาหาร", "สายกิน", "อร่อยบอกต่อ", "TikTokShopTH"],
  home: ["ของใช้ในบ้าน", "จัดบ้าน", "ของดีเข้าบ้าน", "ป้ายยา", "รีวิวของใช้", "TikTokShopTH"],
  fashion: ["OOTD", "แฟชั่น", "แต่งตัว", "ป้ายยาเสื้อผ้า", "รีวิวแฟชั่น", "TikTokShopTH"],
  digital: ["แก็ดเจ็ต", "รีวิวไอที", "ของมันต้องมี", "ป้ายยาไอที", "TechTH", "TikTokShopTH"],
  other: ["ของดีบอกต่อ", "ป้ายยา", "รีวิว", "ใช้ดีบอกต่อ", "ของมันต้องมี", "TikTokShopTH"],
};

// Platform trending hashtags
const PLATFORM_TAGS: Record<string, string[]> = {
  douyin: ["抖音好物", "抖音电商"],
  kuaishou: ["快手好物", "快手电商"],
  xiaohongshu: ["小红书", "好物推荐"],
  shipinhao: ["视频号", "视频号好物", "视频号小店"],
  tiktok: ["TikTokMadeMeBuyIt", "TikTokShop"],
  reels: ["Reels", "InstagramReels", "ReelsFinds"],
  shorts: ["Shorts", "YouTubeShorts"],
  shopee: ["ShopeeTH", "ShopeeHaul", "ช้อปปี้"],
  lazada: ["LazadaTH", "LazadaFinds", "ลาซาด้า"],
};

/** Extract the first selling point: split on CJK/ASCII punctuation and newlines, trim whitespace, clip to max length (English points are longer, so max is tunable) */
function firstSellingPoint(sp: string | undefined, max: number): string {
  if (!sp) return "";
  const first = sp.split(/[。.,，;；\n、\u0E2F]|\s{2,}/).map((s) => s.trim()).find((s) => s.length > 0) || "";
  return clip(first, max);
}

/** Clip by approximate display width (CJK counts as 1 character, prevents titles from being too long) */
function clip(s: string, max: number): string {
  const arr = Array.from(s.trim());
  return arr.length <= max ? s.trim() : arr.slice(0, max).join("").trim();
}

/**
 * Build the LLM prompt for publish copy (used by users who have an LLM configured for higher-quality results).
 * Follows locale: zh produces Chinese commerce copy, en produces English TikTok copy — avoids the LLM returning Chinese to English-speaking users.
 * Pure function; prompt content is deterministically unit-testable (LLM output itself requires a key and is not tested here).
 */
export function buildPublishPrompt(
  input: { productName: string; category?: string; productDescription?: string; platform?: string },
  locale: "zh" | "en" | "th" = "zh"
): string {
  const { productName, category, productDescription, platform } = input;
  if (locale === "en") {
    const platformHint = platform ? `Target platform: ${platform}.` : "Target platform: TikTok / Reels / Shorts.";
    return `You are a seasoned e-commerce short-video marketer. Write publishing copy for the product below, entirely in ENGLISH. ${platformHint}
Product: ${productName}
${category ? `Category: ${category}\n` : ""}${productDescription ? `Selling points: ${productDescription}\n` : ""}
Output STRICT JSON only (no extra text):
{
  "titles": ["3 catchy short titles with emotion/pain-point/number hooks, each <= 60 chars"],
  "hashtags": ["6-10 hashtags with #, TikTok-style; the FIRST must be a product-specific/branded hashtag (the product name, no spaces) for keyword-search discovery, the rest matching category and platform trends"],
  "caption": "one-line caption, conversational, with a clear call to action, <= 150 chars; lead with the main product keyword in the first ~30 characters for search discoverability",
  "commentKit": {
    "pinned": "a pinned self-Q&A comment: raise THE question buyers hesitate on, answer it from the creator's first-person real experience, invite questions; <= 200 chars",
    "objections": [{ "q": "recurring objection (price / does it work / hesitation)", "a": "friendly first-person reply, honest, no invented claims, <= 120 chars" }]
  }
}
commentKit rules: comments are the video's second landing page. 2-3 objections. NEVER write fake customer testimonials or seeded "I bought it and love it" comments — first-person creator replies only.`;
  }
  if (locale === "th") {
    const platformHint = platform ? `แพลตฟอร์มเป้าหมาย: ${platform}` : "แพลตฟอร์มเป้าหมาย: TikTok Shop / Shopee / Lazada";
    return `คุณคือนักการตลาดวิดีโอสั้นสายขายของมืออาชีพ เขียนแคปชันสำหรับลงขายสินค้าด้านล่างนี้ โดยใช้ภาษาไทยทั้งหมด ${platformHint}
สินค้า: ${productName}
${category ? `หมวดหมู่: ${category}\n` : ""}${productDescription ? `จุดขาย: ${productDescription}\n` : ""}
ตอบเป็น JSON อย่างเคร่งครัดเท่านั้น (ห้ามมีข้อความอื่น):
{
  "titles": ["3 พาดหัวสั้นดึงดูด มีอารมณ์/จุดเจ็บ/ตัวเลข แต่ละอันไม่เกิน 40 ตัวอักษร"],
  "hashtags": ["6-10 แฮชแท็กพร้อม # อันแรกต้องเป็นแท็กเฉพาะสินค้า (ชื่อสินค้าติดกันไม่มีช่องว่าง) เพื่อให้ค้นเจอ ที่เหลือตามกระแสหมวดและแพลตฟอร์ม"],
  "caption": "แคปชันเชียร์ขายประโยคเดียว ภาษาพูด มีคำชวนซื้อ ไม่เกิน 120 ตัวอักษร ขึ้นต้นด้วยคีย์เวิร์ดสินค้า",
  "commentKit": {
    "pinned": "คอมเมนต์ปักหมุดถามตอบ: ตั้งคำถามที่ลูกค้าลังเลที่สุด แล้วตอบจากประสบการณ์ใช้จริงของครีเอเตอร์ พร้อมชวนถามต่อ ไม่เกิน 150 ตัวอักษร",
    "objections": [{ "q": "ข้อโต้แย้งที่เจอบ่อย (แพง/ใช้ดีจริงไหม/ลังเล)", "a": "ตอบแบบเป็นกันเอง ซื่อสัตย์ ไม่แต่งเรื่อง ไม่เกิน 100 ตัวอักษร" }]
  }
}
กฎคอมเมนต์: คอมเมนต์คือหน้าแลนดิ้งที่สอง เตรียมข้อโต้แย้ง 2-3 ข้อ ห้ามเขียนรีวิวปลอมหรือคอมเมนต์หน้าม้า — ตอบจากประสบการณ์จริงเท่านั้น`;
  }
  const platformHint = platform ? `目标平台：${platform}。` : "目标平台：抖音/快手/小红书。";
  return `你是资深电商带货短视频运营。请为以下商品生成发布文案。${platformHint}
商品名称：${productName}
${category ? `品类：${category}\n` : ""}${productDescription ? `卖点：${productDescription}\n` : ""}
要求严格输出 JSON（不要多余文字）：
{
  "titles": ["3 个吸睛短标题，含情绪/痛点/数字钩子，每个 ≤20 字"],
  "hashtags": ["6-10 个带 # 的话题标签；第 1 个必须是商品专属/品牌标签（商品名、不含空格），利于商品词搜索发现，其余贴合品类与平台热点"],
  "caption": "一句话种草文案，口语化，含行动号召，≤40 字；开头先点出商品核心关键词（利于平台搜索发现）",
  "commentKit": {
    "pinned": "一条置顶自问自答评论：提出买家最犹豫的那个问题，用博主第一人称真实体验回答，并邀请提问；≤80 字",
    "objections": [{ "q": "高频异议（价格贵/有没有用/还在犹豫）", "a": "第一人称友好回复，诚实不编造，≤50 字" }]
  }
}
commentKit 规则：评论区是视频的第二落地页，异议给 2-3 条；绝不写伪造顾客证言或「已买真香」式预埋假评论——只写博主第一人称回复。`;
}

// Title hook pools — every template embeds the product name; point-requiring ones are dropped when no selling point.
// A varied pool (vs 3 fixed titles) avoids identical hooks across a creator's many videos.
const TITLE_POOL_ZH: Array<{ needsPoint?: boolean; render: (n: string, p: string) => string }> = [
  { render: (n) => `${n}也太好用了吧！后悔没早买` },
  { needsPoint: true, render: (n, p) => `${n}｜${p}，谁用谁回购` },
  { render: (n) => `三个理由让你入手${n}` },
  { render: (n) => `谁懂啊！${n}真的绝了` },
  { render: (n) => `别乱买了，${n}闭眼入不踩雷` },
  { render: (n) => `${n}凭什么这么火？` },
  { render: (n) => `用了${n}才知道之前白买了` },
  { render: (n) => `姐妹们冲！${n}平价宝藏` },
  { needsPoint: true, render: (n, p) => `${n}测评｜${p}` },
  { render: (n) => `入手${n}前，先看这条` },
];
const TITLE_POOL_EN: Array<{ needsPoint?: boolean; render: (n: string, p: string) => string }> = [
  { render: (n) => `This ${n} is a total game-changer 🤯` },
  { needsPoint: true, render: (n, p) => `${n} — ${p}, you'll want one` },
  { render: (n) => `3 reasons to grab the ${n}` },
  { render: (n) => `I can't stop using this ${n}` },
  { render: (n) => `Why is everyone obsessed with ${n}?` },
  { render: (n) => `The ${n} you won't regret buying` },
  { needsPoint: true, render: (n, p) => `${n}: ${p}` },
  { render: (n) => `Don't buy another until you've seen this ${n}` },
];

const TITLE_POOL_TH: Array<{ needsPoint?: boolean; render: (n: string, p: string) => string }> = [
  { render: (n) => `${n}ดีจริงต้องบอกต่อ` },
  { needsPoint: true, render: (n, p) => `${n}｜${p} ใครใช้ก็ติดใจ` },
  { render: (n) => `3 เหตุผลที่ต้องมี${n}` },
  { render: (n) => `ใครยังไม่มี${n}ต้องดู` },
  { render: (n) => `${n}ทำไมขายดีขนาดนี้` },
  { render: (n) => `ใช้${n}แล้วจะรู้ว่าของดีเป็นยังไง` },
  { needsPoint: true, render: (n, p) => `รีวิว${n}｜${p}` },
  { render: (n) => `ก่อนซื้อ${n}ดูคลิปนี้ก่อน` },
];

/** Deterministic string hash (stable per input, so the same product always gets the same titles). */
function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Pick 3 distinct, varied title hooks from the pool (deterministic by name; drops point-requiring templates when no point; zh clipped to 22, th to 30). */
export function pickTitles(name: string, point: string, locale: "zh" | "en" | "th" = "zh"): string[] {
  const pool = (locale === "en" ? TITLE_POOL_EN : locale === "th" ? TITLE_POOL_TH : TITLE_POOL_ZH).filter((t) => point || !t.needsPoint);
  const start = hashStr(name) % pool.length;
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    const s = pool[(start + i) % pool.length].render(name, point);
    out.push(locale === "en" ? clip(s, 60) : locale === "th" ? clip(s, 30) : clip(s, 22));
  }
  return out;
}

/**
 * Key-free comment-section ops kit (deterministic templates; the LLM publish path produces a
 * tailored version through the same JSON contract). Deliberately ships NO "seed comments" —
 * fabricated bought-it/love-it comments are astroturfing and an enforcement target; a pinned
 * self-Q&A and objection reply templates are legitimate customer-service material.
 */
export function buildCommentKit(input: PublishPackInput): CommentKit {
  const en = input.locale === "en";
  const th = input.locale === "th";
  const name = clip((input.productName || "").trim() || (en ? "this find" : th ? "ไอเทมนี้" : "这款好物"), en ? 40 : th ? 24 : 16);
  const point = firstSellingPoint(input.sellingPoints, en ? 40 : th ? 24 : 12);
  if (en) {
    return {
      pinned: `Most-asked question first: is the ${name} actually worth it? I've been using it myself${point ? ` — ${point}` : ""}, ask me anything below 👇`,
      objections: [
        {
          q: "Too expensive / not worth it",
          a: `Break it down per use and it's less than a coffee — and you can return it if it's not for you.`,
        },
        {
          q: "Does it really work?",
          a: `Fair question — the video shows exactly how I use it${point ? ` (${point})` : ""}. Happy to post a follow-up after longer use.`,
        },
        {
          q: "Still hesitating",
          a: `No rush — save this video, check the reviews, and grab it when you're ready.`,
        },
      ],
      notice:
        "Reply with your real experience only — fabricated customer testimonials and seeded fake comments are an enforcement target on every platform.",
    };
  }
  if (th) {
    return {
      pinned: `คำถามที่โดนถามบ่อยที่สุด: ${name}คุ้มไหม เราใช้เอง${point ? ` ${point}` : ""} สงสัยอะไรถามใต้คลิปได้เลย`,
      objections: [
        { q: "แพงไปไหม/คุ้มไหม", a: "หารเป็นราคาต่อครั้งที่ใช้ ตกครั้งละไม่กี่บาท ไม่โอเคคืนได้" },
        { q: "ใช้ดีจริงเหรอ", a: `ในคลิปคือวิธีใช้จริงของเรา${point ? ` (${point})` : ""} ใช้ไปนานๆ จะมารีวิวเพิ่ม` },
        { q: "ยังลังเลอยู่", a: "ไม่ต้องรีบ เซฟคลิปไว้ก่อน ดูรีวิวแล้วค่อยกด" },
      ],
      notice: "ตอบจากประสบการณ์ใช้จริงเท่านั้น — ห้ามเขียนรีวิวปลอมหรือคอมเมนต์หน้าม้า ทุกแพลตฟอร์มตรวจจับ",
    };
  }
  return {
    pinned: `评论区问得最多的先答：${name}到底值不值？我自己在用${point ? `，${point}` : ""}，有问题评论区直接问👇`,
    objections: [
      { q: "太贵了/不值", a: "拆到每次使用算一下，比一杯奶茶还便宜；不合适也支持退，先看再定。" },
      { q: "真的有用吗", a: `问得好——视频里就是我的真实用法${point ? `（${point}）` : ""}，用久了我再来追评。` },
      { q: "还在犹豫", a: "不着急，先收藏这条，看看评价，想好了再入。" },
    ],
    notice: "回复只写自己的真实体验——伪造顾客证言、预埋假评论是各平台重点打击项，别碰。",
  };
}

export function buildPublishPack(input: PublishPackInput): PublishPack {
  const en = input.locale === "en";
  const th = input.locale === "th";
  const name = clip((input.productName || "").trim() || (en ? "this find" : th ? "ไอเทมนี้" : "这款好物"), en ? 40 : th ? 24 : 16);
  const cat = (input.category || "other").toLowerCase();
  const point = firstSellingPoint(input.sellingPoints, en ? 40 : th ? 24 : 12);

  // Titles: pick 3 varied hooks from the pool (deterministic per product, so a creator's many videos don't share identical titles)
  const titles = pickTitles(name, point, input.locale ?? "zh");

  // Hashtags: product-specific tag + category + platform, deduplicated, prefixed with #, capped at ~10.
  // Product-specific tag goes first — in 2026, Douyin/TikTok discovery relies heavily on product keywords;
  // generic category tags give broad but unfocused exposure.
  // Adding a product-name tag lets people searching for that exact product find your video directly.
  const platform = (input.platform || "").toLowerCase();
  const catTags = en ? CATEGORY_TAGS_EN : th ? CATEGORY_TAGS_TH : CATEGORY_TAGS;
  const rawName = (input.productName || "").trim();
  // Strip spaces/punctuation from the product name (hashtags cannot contain spaces); keep only letters, digits, and CJK; clip to max length
  const productTag = rawName ? `#${clip(rawName.replace(/[^\p{L}\p{N}]/gu, ""), en ? 24 : th ? 18 : 12)}` : "";
  const tagWords = [
    ...(catTags[cat] || catTags.other),
    ...(PLATFORM_TAGS[platform] || []),
  ];
  const seen = new Set<string>();
  const hashtags: string[] = [];
  for (const tag of [productTag, ...tagWords.map((w) => `#${w}`)]) {
    if (!tag || tag === "#" || seen.has(tag)) continue;
    seen.add(tag);
    hashtags.push(tag);
    if (hashtags.length >= 10) break;
  }

  // Promo caption: conversational + call to action. Clip the lead phrase first, then append the fixed CTA so the CTA tail is never truncated
  const cta = en ? " — tap the link below to grab it 🛒" : th ? " กดตะกร้าด้านล่างเลย~" : "，点下方小黄车带走它～";
  const lead = en
    ? `Obsessed with ${name}${point ? ", " + point : ""}`
    : th
      ? `${name}ดีจริงต้องบอกต่อ${point ? " " + point : ""}`
      : `${name}真的绝了${point ? "，" + point : ""}`;
  const capMax = en ? 130 : th ? 90 : 40;
  const caption = clip(lead, capMax - Array.from(cta).length) + cta;

  // UTM-tagged storefront link (only when a shopUrl was supplied) so the creator can attribute traffic per platform
  const shopLink = buildShopLink(input.shopUrl, { platform, affiliateCode: input.affiliateCode });

  return {
    titles,
    hashtags,
    caption,
    aiDeclaration: buildAiDeclaration(input.locale),
    commentKit: buildCommentKit(input),
    ...(shopLink && { shopLink }),
  };
}

/**
 * Platform AI-disclosure kit — platforms now auto-detect undeclared AI content (Douyin appends a
 * "疑似AI生成" badge + throttles; TikTok C2PA-flags and suppresses reach 50-70%), while self-declared
 * content distributes normally. Standalone so both the key-free pack and the LLM publish path use it.
 */
export function buildAiDeclaration(locale?: "zh" | "en" | "th"): { notice: string; line: string } {
  if (locale === "th") {
    return {
      notice: "ลงโพสต์อย่าลืมเปิดป้ายเนื้อหาที่สร้างโดย AI ของแพลตฟอร์ม — ไม่ประกาศจะโดนติดป้ายและลดการมองเห็น ประกาศเองไม่มีผลต่อการแจกจ่าย",
      line: "วิดีโอนี้มีเนื้อหาที่สร้างโดย AI",
    };
  }
  return locale === "en"
    ? {
        notice:
          'Turn on the platform\'s "AI-generated content" toggle when posting — undeclared AI content gets auto-flagged and suppressed (TikTok C2PA detection); self-declared content distributes normally.',
        line: "Contains AI-generated content",
      }
    : {
        notice: "发布时记得勾选平台的「内容由 AI 生成」声明——未主动声明会被自动打「疑似AI生成」标并限流，主动声明基本不影响分发。",
        line: "本视频含 AI 生成内容",
      };
}
