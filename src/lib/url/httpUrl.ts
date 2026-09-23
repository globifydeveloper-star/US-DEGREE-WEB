/**
 * Normalizes a backend-provided URL to a safe http(s) link, or `null` if it
 * isn't one. Backend fields like `schoolUrl` sometimes arrive without a
 * scheme ("example.edu") and are rendered as outbound `<a href>`/`window.open`
 * targets — without validation, a `javascript:` or `data:` value would be
 * opened as-is. Every caller that renders one of these fields as a link
 * should go through this instead of its own `startsWith("http")` check.
 */
export function toSafeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
