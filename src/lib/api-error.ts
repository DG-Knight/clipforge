/**
 * Locale-aware API error helper.
 *
 * API routes historically returned hardcoded Chinese error strings, so overseas users (English
 * browsers hitting TikTok/Reels/Shorts flows) saw Chinese error text they couldn't read. This helper
 * keeps the Chinese message byte-for-byte for domestic users (the default) and returns an English
 * message only when the request's `Accept-Language` clearly prefers English.
 *
 * Design: bilingual strings are passed INLINE at each call site (no central key registry) — this keeps
 * the zh text provably unchanged, avoids key collisions, and makes each route self-contained.
 */
import { NextResponse } from "next/server";

export type ApiLocale = "zh" | "en" | "th";

/** Minimal shape we need — works for NextRequest and the standard Request. */
interface HasHeaders {
  headers: { get(name: string): string | null };
}

/**
 * Pick the response locale from the request's Accept-Language header.
 * Domestic-first: default to Chinese; Thai clients get "th" (callers fall back
 * to their English string unless they pass a Thai one — readable and
 * machine-translatable, instead of Chinese). Pure-ish, unit-testable.
 */
export function pickLocale(req: HasHeaders): ApiLocale {
  const header = req.headers.get("accept-language") || "";
  const first = header.split(",")[0]?.trim().toLowerCase() || "";
  if (first.startsWith("th")) return "th";
  return first.startsWith("en") ? "en" : "zh";
}

/** Localized error string for the request (zh by default, en for English clients, th when passed). */
export function errText(req: HasHeaders, zh: string, en: string, th: string = en): string {
  const locale = pickLocale(req);
  return locale === "th" ? th : locale === "en" ? en : zh;
}

/**
 * Build a localized error JSON response. Use for the common `{ error }`-only case.
 * For responses that carry extra fields (e.g. `{ error, projectId }`), use `errText` inline instead.
 *
 * Argument shapes (number = HTTP status, string = Thai text — position-independent):
 * - apiError(req, zh, en)               → 400, no Thai
 * - apiError(req, zh, en, 404)          → 404, no Thai
 * - apiError(req, zh, en, th)           → 400 + Thai
 * - apiError(req, zh, en, 404, th)      → 404 + Thai
 * - apiError(req, zh, en, th, 502)      → 502 + Thai (Thai-first reading order)
 */
export function apiError(
  req: HasHeaders,
  zh: string,
  en: string,
  statusOrTh: number | string = 400,
  thOrStatus?: number | string
): NextResponse {
  let status = 400;
  let thai = en;
  for (const arg of [statusOrTh, thOrStatus]) {
    if (typeof arg === "number") status = arg;
    else if (typeof arg === "string") thai = arg;
  }
  return NextResponse.json({ error: errText(req, zh, en, thai) }, { status });
}
