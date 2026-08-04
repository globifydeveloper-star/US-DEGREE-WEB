import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "./route";

const ORIGINAL = { ...process.env };

function req(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

/** Route params arrive as a promise in the App Router. */
function params(path: string[]) {
  return Promise.resolve({ path });
}

describe("/api/proxy", () => {
  beforeEach(() => {
    process.env.API_URL = "https://api.example.com";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
    vi.restoreAllMocks();
  });

  describe("forwarding", () => {
    it("forwards GET to the backend, preserving path and query string", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response('{"ok":true}', {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );

      const res = await GET(
        req("http://localhost/api/proxy/programs?credential_level=3&q=nurse"),
        { params: params(["programs"]) },
      );

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.example.com/programs?credential_level=3&q=nurse",
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
    });

    it("joins multi-segment catch-all paths", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("[]", { status: 200 }));

      await GET(req("http://localhost/api/proxy/compare/matrix/details"), {
        params: params(["compare", "matrix", "details"]),
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.example.com/compare/matrix/details",
      );
    });

    // Auth spec §4.9: the proxy is a pass-through for identity. It must never
    // mint, inject, or strip the caller's Authorization header.
    it("forwards the caller's Authorization header untouched", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 200 }));

      await GET(
        req("http://localhost/api/proxy/profile", {
          headers: { authorization: "Bearer app-jwt-123" },
        }),
        { params: params(["profile"]) },
      );

      const headers = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect(headers.Authorization).toBe("Bearer app-jwt-123");
    });

    it("omits Authorization entirely when the caller sent none", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 200 }));

      await GET(req("http://localhost/api/proxy/colleges"), {
        params: params(["colleges"]),
      });

      const headers = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect(headers).not.toHaveProperty("Authorization");
    });

    it("relays the upstream status code rather than normalising it", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response('{"error":"limit"}', { status: 409 }),
      );

      const res = await POST(
        req("http://localhost/api/proxy/compare/matrix/entry", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ unitid: "1" }),
        }),
        { params: params(["compare", "matrix", "entry"]) },
      );

      // The compare UI distinguishes 409 (limit reached) from other failures.
      expect(res.status).toBe(409);
    });

    it("forwards DELETE without a body", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("[]", { status: 200 }));

      await DELETE(req("http://localhost/api/proxy/saved-colleges/1234"), {
        params: params(["saved-colleges", "1234"]),
      });

      expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
      expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
    });
  });

  describe("request bodies", () => {
    it("forwards a JSON body verbatim", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 200 }));

      await POST(
        req("http://localhost/api/proxy/saved-colleges", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ unitid: "9999" }),
        }),
        { params: params(["saved-colleges"]) },
      );

      expect(fetchMock.mock.calls[0][1]?.body).toBe('{"unitid":"9999"}');
    });

    // Guards the re-serialisation bug: JSON.stringify(parsed) behind a
    // truthiness check drops bodies that are legitimately falsy.
    it("does not drop a falsy-but-valid JSON body", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 200 }));

      await POST(
        req("http://localhost/api/proxy/flag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "false",
        }),
        { params: params(["flag"]) },
      );

      expect(fetchMock.mock.calls[0][1]?.body).toBe("false");
    });

    it("sends no body for non-JSON content types", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 200 }));

      await POST(
        req("http://localhost/api/proxy/thing", {
          method: "POST",
          headers: { "content-type": "text/plain" },
          body: "hello",
        }),
        { params: params(["thing"]) },
      );

      expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
    });
  });

  describe("input validation", () => {
    it("rejects an empty path", async () => {
      const res = await GET(req("http://localhost/api/proxy/"), {
        params: params([]),
      });
      expect(res.status).toBe(400);
    });

    it("rejects traversal segments instead of forwarding them", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch");

      const res = await GET(req("http://localhost/api/proxy/a"), {
        params: params(["..", "..", "admin"]),
      });

      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    // A raw error.message here reads "connect ECONNREFUSED 10.0.3.14:8000",
    // disclosing the internal backend address to any client.
    it("does not leak the upstream error message to the client", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("connect ECONNREFUSED 10.0.3.14:8000"),
      );

      const res = await GET(req("http://localhost/api/proxy/profile"), {
        params: params(["profile"]),
      });

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toBe("Upstream request failed");
      expect(JSON.stringify(body)).not.toContain("10.0.3.14");
      expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
    });

    it("still logs the real error server-side for debugging", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("connect ECONNREFUSED 10.0.3.14:8000"),
      );

      await GET(req("http://localhost/api/proxy/profile"), {
        params: params(["profile"]),
      });

      expect(errorSpy).toHaveBeenCalled();
    });

    it("returns 502 when API_URL is missing in production", async () => {
      delete process.env.API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      (process.env as Record<string, string>).NODE_ENV = "production";

      const res = await GET(req("http://localhost/api/proxy/colleges"), {
        params: params(["colleges"]),
      });

      expect(res.status).toBe(502);
    });
  });
});
