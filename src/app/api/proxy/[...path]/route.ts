import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    const pathStr = path.join('/');
    const searchString = request.nextUrl.search;
    
    // Server-only API URL, fallback to NEXT_PUBLIC_API_URL or local backend
    const backendBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    const targetUrl = `${backendBase}/${pathStr}${searchString}`;
    
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    
    const contentType = res.headers.get('content-type') || 'application/json';
    const bodyText = await res.text();
    
    return new Response(bodyText, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Proxy connection error";
    return Response.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    const pathStr = path.join('/');
    const searchString = request.nextUrl.search;
    
    // Server-only API URL, fallback to NEXT_PUBLIC_API_URL or local backend
    const backendBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    const targetUrl = `${backendBase}/${pathStr}${searchString}`;
    
    let body: unknown = null;
    const contentTypeHeader = request.headers.get('content-type') || '';
    if (contentTypeHeader.includes('application/json')) {
      try {
        body = await request.json();
      } catch {
        // Ignore parse errors for empty/malformed requests
      }
    }

    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const contentType = res.headers.get('content-type') || 'application/json';
    const bodyText = await res.text();
    
    return new Response(bodyText, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error("API Proxy POST Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Proxy connection error";
    return Response.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}
