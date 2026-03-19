import { NextResponse } from 'next/server'
import { getCurrentUserId, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    // 调用 SecondMe API 获取兴趣标签
    const apiData = await callSecondMeApi<{ code: number; data: { shades: Array<{ tag: string; score: number }> } }>(
      '/api/secondme/user/shades',
      user.accessToken
    )

    return NextResponse.json({
      code: 0,
      data: apiData.data || { shades: [] },
    })
  } catch (error) {
    console.error('Get user shades error:', error)
    return NextResponse.json({ code: 500, message: '获取兴趣标签失败', data: null })
  }
}
