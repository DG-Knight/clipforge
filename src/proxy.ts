import { NextResponse, type NextRequest } from "next/server";

/**
 * Request proxy for /api/* — two independent concerns:
 *
 * 1. CORS (local-tool): browser pages served from OTHER local ports call our API
 *    cross-origin — the first consumer is the infinite-canvas workbench running the
 *    ClipForge video node plugin (canvas at :3800/:3000 → ClipForge at :3457). Only
 *    localhost/127.0.0.1/[::1] origins (any port) are reflected; a remote malicious
 *    page's origin never matches, so the browser-side wall against drive-by abuse of
 *    the local instance (which can trigger paid-model spending) stays intact.
 *    Additional trusted origins via CLIPFORGE_CORS_ORIGINS (comma-separated).
 *
 * 2. Locale bridge: API error helpers (`pickLocale` in api-error.ts) choose the response
 *    language from the request's Accept-Language header, but the UI locale lives in client
 *    state (zustand persist) — a user who picks ไทย in the app while running a Chinese
 *    browser kept seeing Chinese API errors ("没有可用素材…"). LocaleInitializer mirrors
 *    the UI locale into the `clipforge_locale` cookie; this proxy copies that cookie into
 *    Accept-Language for every /api request so the API speaks the language the user chose.
 *    Browsers that never set the cookie keep their own header.
 */

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (LOCAL_ORIGIN.test(origin)) return origin;
  const extra = (process.env.CLIPFORGE_CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(origin) ? origin : null;
}

function corsHeaders(origin: string, req: NextRequest): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    // echo whatever headers the preflight asks for (Content-Type today; future-proof)
    "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") || "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function proxy(request: NextRequest) {
  const origin = allowedOrigin(request.headers.get("origin"));
  // answer preflights here — API routes have no OPTIONS handlers
  if (request.method === "OPTIONS" && origin) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin, request) });
  }

  // locale bridge: cookie → Accept-Language on the forwarded request
  const locale = request.cookies.get("clipforge_locale")?.value;
  const res =
    locale === "th" || locale === "zh" || locale === "en"
      ? (() => {
          const headers = new Headers(request.headers);
          headers.set("accept-language", locale);
          return NextResponse.next({ request: { headers } });
        })()
      : NextResponse.next();

  if (origin) {
    for (const [k, v] of Object.entries(corsHeaders(origin, request))) res.headers.set(k, v);
  }
  return res;
}

export const config = { matcher: "/api/:path*" };
