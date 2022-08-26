import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from './lib/services/authService';

export async function middleware(request: NextRequest) {
  const userId = await validateToken(request.cookies.get('auth_token'));
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/analytics/:path*'],
};
