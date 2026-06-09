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
    
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const contentType = res.headers.get('content-type') || 'application/json';
    const bodyText = await res.text();
    
    return new Response(bodyText, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return Response.json(
      { error: error.message || "Proxy connection error" },
      { status: 502 }
    );
  }
}
