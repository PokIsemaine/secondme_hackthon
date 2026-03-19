import { NextResponse } from 'next/server'
import { generateAuthUrl } from '@/lib/auth'

export async function GET() {
  // 生成随机的 state 用于防止 CSRF 攻击
  const state = crypto.randomUUID()

  // 将 state 存储在 cookie 中（短期）
  const response = NextResponse.redirect(generateAuthUrl(state))

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
