import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow these paths
  const allowedPaths = [
    '/detect',
    '/api/tags',
    '/event-photo.jpeg',
    '/models',
  ];

  // Check if the path is allowed
  const isAllowed = allowedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(path + '/') ||
    pathname.startsWith('/models/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')  // Allow static files
  );

  // If not allowed, redirect to /detect
  if (!isAllowed && pathname !== '/') {
    return NextResponse.redirect(new URL('/detect', request.url));
  }

  // Redirect root to /detect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/detect', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
