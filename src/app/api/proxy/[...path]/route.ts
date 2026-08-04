import { NextRequest } from "next/server";
import { getBackendBaseUrl } from "@/lib/env";

type BodylessMethod = "GET" | "DELETE";
type BodyMethod = "POST" | "PATCH" | "PUT";

/**
 * Resolve the catch-all segments to a backend path.
 *
 * Segments arrive percent-decoded, so a traversal attempt that survives Next's
 * own URL normalisation (`%2e%2e%2f`) would reach us as a literal `..` segment
 * and could walk above the backend base path. Reject those outright rather
 * than relying on the backend to normalise.
 */
function resolvePath(path: string[] | undefined): string | null {
  if (!path || path.length === 0) return null;
  if (path.some((segment) => segment === "." || segment === ".." || segment === "")) {
    return null;
  }
  return path.join("/");
}

/**
 * Errors here are infrastructure faults — DNS failures, refused connections,
 * TLS problems. Their messages embed the backend host and port
 * ("connect ECONNREFUSED 10.0.3.14:8000"), so they are logged server-side and
 * replaced with a generic message for the client.
 */
function proxyFailure(method: string, error: unknown): Response {
  console.error(`API Proxy ${method} Error:`, error);
  return Response.json({ error: "Upstream request failed" }, { status: 502 });
}

function badPath(): Response {
  return Response.json({ error: "Invalid path" }, { status: 400 });
}

/**
 * Relay the upstream response verbatim. The client's Authorization header (app
 * JWT) is forwarded untouched — never injected or stripped here, per auth spec
 * §4.9.
 */
async function relay(res: Response): Promise<Response> {
  const contentType = res.headers.get("content-type") || "application/json";
  const bodyText = await res.text();

  return new Response(bodyText, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}

function forwardedHeaders(
  request: NextRequest,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  return headers;
}

async function forwardNoBody(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: BodylessMethod,
) {
  try {
    const pathStr = resolvePath((await params).path);
    if (pathStr === null) return badPath();

    const targetUrl = `${getBackendBaseUrl()}/${pathStr}${request.nextUrl.search}`;

    return relay(
      await fetch(targetUrl, {
        method,
        headers: forwardedHeaders(request),
      }),
    );
  } catch (error) {
    return proxyFailure(method, error);
  }
}

async function forwardWithBody(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: BodyMethod,
) {
  try {
    const pathStr = resolvePath((await params).path);
    if (pathStr === null) return badPath();

    const targetUrl = `${getBackendBaseUrl()}/${pathStr}${request.nextUrl.search}`;

    // Only JSON bodies are relayed; the backend exposes no multipart endpoints.
    let body: string | undefined;
    if ((request.headers.get("content-type") || "").includes("application/json")) {
      try {
        const raw = await request.text();
        // Forward the raw text rather than re-serialising a parsed object, so
        // a body of `0`, `false` or `""` survives instead of being dropped.
        body = raw.length > 0 ? raw : undefined;
      } catch {
        // Ignore parse errors for empty/malformed requests
      }
    }

    return relay(
      await fetch(targetUrl, {
        method,
        headers: forwardedHeaders(request, {
          "Content-Type": "application/json",
        }),
        body,
      }),
    );
  } catch (error) {
    return proxyFailure(method, error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardNoBody(request, params, "GET");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardNoBody(request, params, "DELETE");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardWithBody(request, params, "POST");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardWithBody(request, params, "PATCH");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forwardWithBody(request, params, "PUT");
}
