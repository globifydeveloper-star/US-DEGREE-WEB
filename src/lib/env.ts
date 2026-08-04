/**
 * Server-side environment resolution.
 *
 * These helpers are intentionally called at *request* time rather than at
 * module load. `next build` imports route modules to collect page data, and a
 * module-level throw would make the build fail in any environment that legimately
 * lacks a backend (CI, for example). Failing per-request keeps the build
 * portable while still refusing to serve traffic against a misconfigured
 * backend.
 */

/**
 * Base URL of the API backend that /api/proxy forwards to.
 *
 * In production a missing API_URL is a deploy misconfiguration, not something
 * to paper over: silently falling back to loopback produces an app that builds,
 * deploys and serves pages while every API call fails against an address that
 * isn't the backend. Throw instead so the failure is attributable.
 */
export function getBackendBaseUrl(): string {
  const configured = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "API_URL is not set. Refusing to fall back to the local development " +
        "backend in production — set API_URL to the backend base URL.",
    );
  }

  return "http://127.0.0.1:8000";
}

/**
 * Public origin of this site, used for canonical URLs in sitemap.ts/robots.ts.
 *
 * Both of those are *prerendered*, so this is read at BUILD time — the value
 * must be present in the build environment (e.g. the hosting provider's
 * project env vars), not just at runtime. Setting it only at runtime leaves
 * the fallback baked into the emitted robots.txt/sitemap.xml.
 *
 * A missing value warns rather than throws: a hard failure would break builds
 * in environments that legitimately have no site URL (CI), and a wrong
 * canonical URL is an SEO problem, not a correctness one. The warning is
 * loud enough to catch in build logs.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configured && process.env.NODE_ENV === "production") {
    console.warn(
      "[env] NEXT_PUBLIC_SITE_URL is not set — robots.txt and sitemap.xml " +
        "will be generated with the localhost fallback. Set it in the build " +
        "environment to emit correct canonical URLs.",
    );
  }

  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}
