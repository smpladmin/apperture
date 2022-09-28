import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from './lib/services/authService';

export async function middleware(request: NextRequest) {
  const cookieKey = process.env.COOKIE_KEY || 'auth_token'
  const userId = await validateToken(request.cookies.get(cookieKey));
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/analytics/:path*'],
};
