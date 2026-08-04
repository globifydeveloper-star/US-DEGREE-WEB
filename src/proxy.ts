import { NextRequest, NextResponse } from "next/server";

/**
 * Per-request CSP nonce.
 *
 * Flow: a fresh random nonce is minted here → written into the
 * Content-Security-Policy header → Next.js parses that header during SSR and
 * stamps the nonce onto every framework/page script tag it emits → those
 * scripts run, and anything injected later (an XSS payload writing an inline
 * <script>) has no matching nonce and is blocked.
 *
 * `'strict-dynamic'` extends that trust transitively: a script already trusted
 * via nonce may load further scripts. Both third-party SDKs here rely on this —
 * Firebase injects the gapi loader (apis.google.com/js/api.js) and
 * lib/appleAuth.ts injects Apple's SDK, both via document.createElement from
 * bundled (nonced) code. The explicit host allowlist is kept alongside as a
 * fallback for CSP Level 2 browsers, which ignore 'strict-dynamic' and honour
 * the host list instead. CSP3 browsers do the reverse.
 *
 * NOTE ON style-src: 'unsafe-inline' is retained for styles. antd v6 injects
 * its component CSS as runtime <style> tags via @ant-design/cssinjs, and React
 * writes inline style attributes; neither carries a nonce, so a nonce-only
 * style-src would strip the app's styling entirely. Inline *styles* are a far
 * narrower risk than inline *scripts* — the nonce is doing its real work on
 * script-src.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://apis.google.com https://appleid.cdn-apple.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://appleid.apple.com",
    // signInWithPopup relies on a hidden helper iframe served from the Firebase
    // authDomain (project.firebaseapp.com) to relay the popup's auth result
    // back to this page — without it in frame-src, Firebase surfaces the
    // failure as a generic auth/internal-error.
    "frame-src 'self' https://appleid.apple.com https://apis.google.com https://*.firebaseapp.com",
    "form-action 'self' https://appleid.apple.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");

  // Next.js reads the nonce off the *request* CSP header to stamp script tags
  // during SSR; x-nonce exposes it to server components that need it directly.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except:
     * - api        — /api/auth/apple/callback serves hand-written HTML with a
     *                static external <script>, which 'strict-dynamic' would
     *                block. That route gets its own CSP in next.config.ts.
     * - _next/static, _next/image, favicon.ico — assets, not documents.
     * Prefetches are skipped too: they don't render a document, so minting a
     * nonce for them is wasted work.
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
