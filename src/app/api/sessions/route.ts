import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
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

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      code: 0,
      data: {
        sessions: sessions.map((s) => ({
          id: s.id,
          title: s.title,
          last_message: s.messages[0]?.content || '',
          updated_at: s.updatedAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ code: 500, message: '获取会话列表失败', data: null })
  }
}
