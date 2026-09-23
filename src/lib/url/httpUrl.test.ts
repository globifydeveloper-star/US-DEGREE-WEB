import { describe, it, expect } from "vitest";
import { toSafeHttpUrl } from "./httpUrl";

describe("toSafeHttpUrl", () => {
  it("passes through an already-schemed https URL", () => {
    expect(toSafeHttpUrl("https://example.edu")).toBe("https://example.edu/");
  });

  it("passes through an already-schemed http URL", () => {
    expect(toSafeHttpUrl("http://example.edu")).toBe("http://example.edu/");
  });

  it("adds https:// to a bare domain", () => {
    expect(toSafeHttpUrl("example.edu")).toBe("https://example.edu/");
  });

  it("rejects a javascript: URL", () => {
    expect(toSafeHttpUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects a data: URL", () => {
    expect(toSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(toSafeHttpUrl("")).toBeNull();
  });

  it("rejects null/undefined", () => {
    expect(toSafeHttpUrl(null)).toBeNull();
    expect(toSafeHttpUrl(undefined)).toBeNull();
  });

  it("rejects a malformed URL", () => {
    expect(toSafeHttpUrl("https://")).toBeNull();
  });

  it("trims whitespace before validating", () => {
    expect(toSafeHttpUrl("  example.edu  ")).toBe("https://example.edu/");
  });
});
