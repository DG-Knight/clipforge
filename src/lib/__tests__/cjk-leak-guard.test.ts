/**
 * CJK leak guard — กันข้อความภาษาจีนหลุดไปถึงผู้ใช้ผ่านเส้นทาง error
 *
 * นโยบายภาษาของโปรเจกต์ (HANDOFF-THAI.md §2/§5):
 * - ข้อความ error ที่ผู้ใช้เห็น = อังกฤษ (ข้าม locale) หรือสามภาษาผ่าน errText/apiError
 * - routes ส่ง `error.message` ดิบขึ้น client เสมอ ดังนั้น throw/reject ใน lib/api/workers
 *   ห้ามเป็นจีนล้วน (จีนล้วน = ผู้ใช้ไทย/อังกฤษอ่านไม่ออก)
 *
 * กติกาที่ test นี้บังคับ (สแกนบน source ที่ mask comment แล้ว, string-aware, paren-balanced):
 * 1. `new XxxError(...)` ทุกชนิด — string literal แรก (message) ห้ามมี CJK
 *    · ยกเว้น `LLMRequestError(zh, en, ...)`: zh (literal แรก) เป็นจีนได้ตาม signature แต่
 *      en (literal ที่สอง) ต้องไม่มี CJK — เพราะ en เป็นเส้นทางหลักของผู้ใช้ข้าม locale
 *    · throw แบบ trilingual ternary (isTh ? "ไทย" : isZh ? "中文" : "English") ผ่าน เพราะ
 *      literal แรกเป็นไทย (จงใจจัดลำดับ isTh ก่อนตาม convention ที่มีอยู่)
 * 2. ฟิลด์ `error:` / `errorMessage:` (stored task errors, JSON responses) — หลังตัด span
 *    ของ errText(...)/apiError(...) ออก (trilingual by design) ห้ามเหลือ CJK
 *
 * ขอบเขต: src/lib, src/app/api, src/workers (ไม่รวม __tests__ และ i18n)
 * ข้อจำกัดที่รับไว้: field แบบ ternary หลายบรรทัดที่ขึ้นต้นด้วย `error: isTh` ไม่ถูกจับ
 *   (ไม่มี pattern นี้ในโค้ดปัจจุบัน — ถ้าจะเขียนให้ใช้ errText แทน)
 *
 * ถ้า test นี้ fail: มีข้อความจีนหลุดเข้าเส้นทาง error — แก้เป็นอังกฤษ หรือเพิ่มไฟล์เข้า
 * ALLOWLIST พร้อมเหตุผล
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..", ".."); // src/lib/__tests__ → project root
const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
// จับ `new Identifier(` ทั้งหมด แล้วกรองเฉพาะ identifier ลงท้าย Error ในโค้ด —
// regex แบบ [\w$]*?Error พลาด `new Error(` ธรรมดา (identifier = "Error" ไม่มีส่วนนำหน้า)
const NEW_ERROR_CTOR = /\bnew\s+([A-Za-z_$][\w$]*)\s*\(/g;
// `error:` ที่เป็นชื่อพารามิเตอร์/ฟิลด์ interface (เช่น `function f(error: unknown)`) ไม่ใช่การ assign
// ข้อความ — กรองด้วย expression-marker ใน rule 2 · `.error =` และ `error:` property ถูกจับปกติ
const ERROR_FIELD = /(?:^|[^\w$])(error|errorMessage)\s*[:=]\s*(?!\s*[{\[])/g;
const TRILINGUAL_CALL = /\b(errText|apiError)\s*\(/g;

/** ไฟล์ที่ยอมรับได้เป็นกรณีพิเศษ — เพิ่มได้แต่ต้องมีเหตุผลกำกับ */
const ALLOWLIST = new Set<string>([
  // (ว่างอยู่ — ไม่มีไฟล์ใดต้องยกเว้น ณ วันที่เขียน test)
]);

/* ---------- scanner primitives (string-aware) ---------- */

/** แทนที่ comment ด้วยช่องว่าง (คง newline) เพื่อไม่ให้ CJK ใน comment ถูกจับ */
function maskComments(src: string): string {
  let out = "";
  let inStr: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inStr) {
      if (c === "\\") { out += c + (n ?? ""); i++; continue; }
      if (c === inStr) inStr = null;
      out += c;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; continue; }
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
      i--;
      continue;
    }
    if (c === "/" && n === "*") {
      out += "  "; i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " "; i++;
      }
      out += "  "; i++;
      continue;
    }
    out += c;
  }
  return out;
}

/** index ของ `)` ที่คู่กับ `(` ที่ตำแหน่ง open (string-aware) */
function parenClose(masked: string, open: number): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = open; i < masked.length; i++) {
    const c = masked[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** ดึง "เนื้อ" string literal ทั้งหมด (', ", `) จากข้อความ (string-aware, ไม่รวม quote) */
function stringLiterals(text: string): string[] {
  const out: string[] = [];
  let inStr: string | null = null;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) { out.push(text.slice(start + 1, i)); inStr = null; }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; start = i; }
  }
  return out;
}

/** span ของค่าที่ assigned ให้ field: จากหลัง `[:=]` จบที่ `;` `,` `}` หรือ newline ที่ paren-depth 0 */
function fieldValueSpan(masked: string, from: number): string {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = from; i < masked.length; i++) {
    const c = masked[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") { depth--; continue; }
    if (depth === 0 && (c === ";" || c === "," || c === "}" || c === "\n")) {
      return masked.slice(from, i);
    }
  }
  return masked.slice(from);
}

/** ลบ span ของ errText(...)/apiError(...) ออก (แทนด้วยช่องว่าง คงตำแหน่งอื่นไว้) */
function stripTrilingualCalls(text: string): string {
  let result = text;
  for (;;) {
    TRILINGUAL_CALL.lastIndex = 0;
    const m = TRILINGUAL_CALL.exec(result);
    if (!m) return result;
    const open = m.index + m[0].length - 1;
    const close = parenClose(result, open);
    if (close === -1) return result;
    // replace the whole call with spaces — keeping `errText(` would re-match forever
    result = result.slice(0, m.index) + " ".repeat(close + 1 - m.index) + result.slice(close + 1);
  }
}

/** ลบ span ของ `new XxxError(...)` ออก (rule 1 เป็นคนตรวจ message ของ ctor อยู่แล้ว) */
function stripErrorCtorSpans(text: string): string {
  let result = text;
  NEW_ERROR_CTOR.lastIndex = 0;
  for (;;) {
    const m = NEW_ERROR_CTOR.exec(result);
    if (!m) return result;
    const open = m.index + m[0].length - 1;
    const close = parenClose(result, open);
    if (close === -1) return result;
    result = result.slice(0, m.index) + " ".repeat(close + 1 - m.index) + result.slice(close + 1);
    NEW_ERROR_CTOR.lastIndex = 0;
  }
}

function lineOf(masked: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < masked.length; i++) if (masked[i] === "\n") line++;
  return line;
}

/* ---------- scan ---------- */

interface Offender { file: string; line: number; rule: string; snippet: string }

function scanFile(rel: string, src: string): Offender[] {
  const masked = maskComments(src);
  const offenders: Offender[] = [];

  // rule 1: new XxxError(...) — message literal ห้ามมี CJK (LLMRequestError: literal ที่สองห้ามมี CJK)
  NEW_ERROR_CTOR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NEW_ERROR_CTOR.exec(masked))) {
    const className = m[1];
    if (!className.endsWith("Error")) continue; // ไม่ใช่ error class (Promise, Map, ฯลฯ)
    const open = m.index + m[0].length - 1;
    const close = parenClose(masked, open);
    if (close === -1) continue;
    const args = masked.slice(open + 1, close);
    const literals = stringLiterals(args);
    if (literals.length === 0) continue;
    if (className === "LLMRequestError") {
      // (zh, en, ...) — zh จีนได้ แต่ en (literal ถัดไป) ต้องปลอด CJK
      const en = literals[1];
      if (en !== undefined && CJK.test(en)) {
        offenders.push({ file: rel, line: lineOf(masked, m.index), rule: `LLMRequestError: en message มี CJK`, snippet: en.slice(0, 120) });
      }
      continue;
    }
    const message = literals[0];
    if (CJK.test(message)) {
      offenders.push({ file: rel, line: lineOf(masked, m.index), rule: `${className}: message มี CJK`, snippet: message.slice(0, 120) });
    }
  }

  // rule 2: error/errorMessage field — หลังตัด errText/apiError แล้วห้ามเหลือ CJK
  // ข้าม: type annotation (param/interface — chunk แรกไม่มี expression marker)
  //       และ ternary แบบ th-first (`error: isTh ? …`) ตาม convention เดิมของโปรเจกต์
  ERROR_FIELD.lastIndex = 0;
  while ((m = ERROR_FIELD.exec(masked))) {
    const valueStart = m.index + m[0].length;
    const rawValue = fieldValueSpan(masked, valueStart);
    const v = rawValue.trim();
    const firstChunk = v.split(/[\n;)}]/)[0];
    if (!/[("'`]/.test(firstChunk)) continue; // type annotation เช่น `error: unknown`
    if (/^isTh\b/.test(v)) continue; // th-first trilingual ternary
    const value = stripTrilingualCalls(stripErrorCtorSpans(rawValue));
    if (CJK.test(value)) {
      offenders.push({ file: rel, line: lineOf(masked, m.index), rule: "error field มี CJK นอก errText/apiError", snippet: value.trim().slice(0, 140) });
    }
  }

  return offenders;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "i18n" || entry === "node_modules" || entry === "__tests__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("CJK leak guard — ข้อความจีนห้ามหลุดเส้นทาง error ที่ผู้ใช้เห็น", () => {
  it("throw/reject Error* และ error field ใน src/lib, src/app/api, src/workers ปลอด CJK", () => {
    const targets = [join(ROOT, "src", "lib"), join(ROOT, "src", "app", "api"), join(ROOT, "src", "workers")].filter(
      (d) => {
        try { statSync(d); return true; } catch { return false; }
      }
    );

    const offenders: Offender[] = [];
    for (const dir of targets) {
      for (const file of walk(dir)) {
        const rel = relative(ROOT, file).split(sep).join("/");
        if (ALLOWLIST.has(rel)) continue;
        const src = readFileSync(file, "utf8");
        if (!CJK.test(src)) continue;
        offenders.push(...scanFile(rel, src));
      }
    }

    const detail = offenders.map((o) => `${o.file}:${o.line} [${o.rule}] ${o.snippet}`).join("\n");
    expect(
      offenders,
      `ข้อความจีนหลุดเข้าเส้นทาง error ที่ผู้ใช้อาจเห็น:\n${detail}\n\n` +
        `แก้เป็นอังกฤษ (นโยบาย: ข้อความข้าม locale ใช้ en) หรือใช้ errText/apiError สามภาษา — ` +
        `กรณีพิเศษจริงเท่านั้นให้เพิ่มไฟล์เข้า ALLOWLIST พร้อมเหตุผล`
    ).toEqual([]);
  });
});
