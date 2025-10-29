import { NextRequest, NextResponse } from 'next/server';

import { getLanguageCode, parseSlugParams } from '@/lib/locales';

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Block Chrome DevTools requests that cause errors
  if (pathname.includes('.well-known') || pathname.includes('devtools')) {
    return new NextResponse(null, { status: 404 });
  }

  // Parse the pathname to get the locale
  const pathSegments = pathname.split('/').filter(Boolean);
  const { locale } = parseSlugParams(pathSegments);
  const langCode = getLanguageCode(locale);

  // Create the response
  const response = NextResponse.next();

  // Add the language code to headers so the layout can access it
  response.headers.set('x-lang-code', langCode);
  response.headers.set('x-locale', locale);

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  // Match all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - slice-simulator (Prismic slice simulator)
     * - .well-known (Chrome DevTools requests)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|slice-simulator|.well-known).*)',
  ],
};
