import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateToken } from './lib/services/authService'

export async function middleware(request: NextRequest) {
  console.log("-------------middleware -----------", request.url);
  const userId = await validateToken(request.cookies.get("auth_token"));
  if (!userId) {
    console.log("---------redirecting to login page--------")
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ['/explore'],
}
