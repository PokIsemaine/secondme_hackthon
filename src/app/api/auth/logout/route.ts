import { NextResponse } from 'next/server'
import { clearUserSession } from '@/lib/auth'

export async function POST() {
  clearUserSession()
  return NextResponse.redirect(new URL('/demo', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}

export async function GET() {
  clearUserSession()
  return NextResponse.redirect(new URL('/demo', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}
