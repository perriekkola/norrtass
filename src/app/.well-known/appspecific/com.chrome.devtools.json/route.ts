import { NextResponse } from 'next/server';

export async function GET() {
  // Return 404 for Chrome DevTools requests
  return new NextResponse(null, { status: 404 });
}
