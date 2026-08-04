import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getBackendBaseUrl, getSiteUrl } from "./env";

const ORIGINAL = { ...process.env };

/**
 * NODE_ENV is read-only in the Next type defs but writable at runtime; tests
 * need to simulate a production deploy.
 */
function setNodeEnv(value: string) {
  (process.env as Record<string, string>).NODE_ENV = value;
}

describe("getBackendBaseUrl", () => {
  beforeEach(() => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("prefers the server-only API_URL over the public one", () => {
    process.env.API_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_API_URL = "https://public.example.com";
    expect(getBackendBaseUrl()).toBe("https://api.example.com");
  });

  it("falls back to NEXT_PUBLIC_API_URL when API_URL is absent", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://public.example.com";
    expect(getBackendBaseUrl()).toBe("https://public.example.com");
  });

  it("strips trailing slashes so joined paths don't double up", () => {
    process.env.API_URL = "https://api.example.com///";
    expect(getBackendBaseUrl()).toBe("https://api.example.com");
  });

  it("falls back to loopback in development", () => {
    setNodeEnv("development");
    expect(getBackendBaseUrl()).toBe("http://127.0.0.1:8000");
  });

  // The regression this guards: a production deploy missing API_URL used to
  // silently proxy every API call to localhost, so the app built, deployed and
  // served pages while every request failed against the wrong host.
  it("throws in production rather than silently using loopback", () => {
    setNodeEnv("production");
    expect(() => getBackendBaseUrl()).toThrow(/API_URL is not set/);
  });
});

describe("getSiteUrl", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL };
    vi.restoreAllMocks();
  });

  it("strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://usdegrees.com/";
    expect(getSiteUrl()).toBe("https://usdegrees.com");
  });

  it("falls back to localhost when unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    setNodeEnv("development");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  // sitemap.xml and robots.txt are prerendered, so an unset value here is
  // baked into the deployed files — it must be visible in the build log.
  it("warns when unset in production instead of silently using localhost", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    delete process.env.NEXT_PUBLIC_SITE_URL;
    setNodeEnv("production");

    expect(getSiteUrl()).toBe("http://localhost:3000");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("NEXT_PUBLIC_SITE_URL is not set"),
    );
  });

  it("does not warn when it is set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.NEXT_PUBLIC_SITE_URL = "https://us-degree-web.vercel.app";
    setNodeEnv("production");

    expect(getSiteUrl()).toBe("https://us-degree-web.vercel.app");
    expect(warn).not.toHaveBeenCalled();
  });
});
