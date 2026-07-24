import { NextRequest } from "next/server";

// Shared handler for bodyless methods (GET, DELETE). The client's Authorization
// header (app JWT) is forwarded untouched — never injected or stripped here.
async function forwardNoBody(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: "GET" | "DELETE",
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    const pathStr = path.join("/");
    const searchString = request.nextUrl.search;

    // Server-only API URL, fallback to NEXT_PUBLIC_API_URL or local backend
    const backendBase =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const targetUrl = `${backendBase}/${pathStr}${searchString}`;

    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method,
      headers,
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const bodyText = await res.text();

    return new Response(bodyText, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error(`API Proxy ${method} Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Proxy connection error";
    return Response.json({ error: errorMessage }, { status: 502 });
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

// Shared handler for methods that carry a JSON body (POST, PATCH, PUT). The
// client's Authorization header (app JWT) is forwarded untouched — never
// injected or stripped here — per auth spec §4.9.
async function forwardWithBody(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: "POST" | "PATCH" | "PUT",
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    const pathStr = path.join("/");
    const searchString = request.nextUrl.search;

    // Server-only API URL, fallback to NEXT_PUBLIC_API_URL or local backend
    const backendBase =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const targetUrl = `${backendBase}/${pathStr}${searchString}`;

    let body: unknown = null;
    const contentTypeHeader = request.headers.get("content-type") || "";
    if (contentTypeHeader.includes("application/json")) {
      try {
        body = await request.json();
      } catch {
        // Ignore parse errors for empty/malformed requests
      }
    }

    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const bodyText = await res.text();

    return new Response(bodyText, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error(`API Proxy ${method} Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Proxy connection error";
    return Response.json({ error: errorMessage }, { status: 502 });
  }
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
