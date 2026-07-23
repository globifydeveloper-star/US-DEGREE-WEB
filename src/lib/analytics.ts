type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// No analytics vendor is wired into this project yet. This is a minimal seam
// so call sites don't need to change when one is added: forwards to
// window.gtag if it's present, and always logs outside production so events
// are visible during development.
export function trackEvent(name: string, props?: AnalyticsProps): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", name, props);
  }
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, props);
  }
}
