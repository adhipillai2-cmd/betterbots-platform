// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'https://cdpn.io',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin');

  // Handle preflight (OPTIONS) requests
  if (request.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return new NextResponse(null, { status: 204, headers });
    }
    // If origin is not allowed, return a simple response
    return new NextResponse(null, { status: 204 });
  }

  // Handle actual POST requests
  if (request.method === 'POST') {
    if (origin && allowedOrigins.includes(origin)) {
      // Clone the request headers and set the origin for the actual response
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin);
      return response;
    }
  }

  return NextResponse.next();
}

// Apply the middleware only to the /api/chat route
export const config = {
  matcher: '/api/chat',
};