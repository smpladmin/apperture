import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from './lib/services/authService';

const authMiddleware = async (request: NextRequest) => {
  const cookieKey = process.env.COOKIE_KEY || 'auth_token';
  const userId = await validateToken(request.cookies.get(cookieKey));
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
};

const privateAuthMiddleware = async (request: NextRequest) => {
  const url = request.nextUrl.search;
  const regex = /[?&]key=([^&]+)/;
  const match = regex.exec(url);
  const value = match && match[1];

  if (!(value === process.env.FRONTEND_API_KEY))
    return NextResponse.redirect(new URL('/404', request.url));
};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/analytics')) {
    return await authMiddleware(request);
  }

  if (request.nextUrl.pathname.startsWith('/private')) {
    return await privateAuthMiddleware(request);
  }
}
