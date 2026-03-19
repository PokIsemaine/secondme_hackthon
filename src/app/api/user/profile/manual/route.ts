import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/user/profile/manual - 手动保存用户画像
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { strengths, needs, offers, boundary } = body as {
      strengths?: string
      needs?: string
      offers?: string
      boundary?: string
    }

    // 计算画像可信度
    let confidence = 0
    let filledFields = 0

    if (strengths) filledFields++
    if (needs) filledFields++
    if (offers) filledFields++
    if (boundary) filledFields++

    // 基础分数 + 字段完成度
    confidence = 0.3 + (filledFields / 4) * 0.7

    // 更新用户画像
    await prisma.user.update({
      where: { id: userId },
      data: {
        longboardTags: strengths || null,
        needTags: needs || null,
        offerTags: offers || null,
        cooperationPref: boundary || null,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        message: '画像保存成功',
        confidence: Math.round(confidence * 100) / 100,
      },
    })
  } catch (error) {
    console.error('Save manual profile error:', error)
    return NextResponse.json({ code: 500, message: '保存失败', data: null })
  }
}
