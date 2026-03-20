import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value
  const { pathname } = request.nextUrl

  // Protect /app route - redirect to /demo if not authenticated
  if (pathname === '/app' && !userId) {
    return NextResponse.redirect(new URL('/demo', request.url))
  }

  // Root path - redirect based on auth state
  if (pathname === '/') {
    if (userId) {
      return NextResponse.redirect(new URL('/app', request.url))
    } else {
      return NextResponse.redirect(new URL('/demo', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/app'],
}
