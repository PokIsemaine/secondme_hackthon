import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/negotiation - 创建协商会话
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { targetUserToken, topic, peerProxyData } = body as {
      targetUserToken?: string
      topic: string
      peerProxyData?: {
        authorName?: string
        postContent?: string
        ringName?: string
        topic?: string
        estimatedStrengths?: string
        estimatedNeeds?: string
        estimatedOffers?: string
        communicationStyle?: string
      }
    }

    if (!topic) {
      return NextResponse.json({ code: 400, message: '缺少协商主题', data: null })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    // 确定协商模式
    const mode = targetUserToken ? 'full_a2a' : 'semi_a2a'

    // 创建协商会话
    const session = await prisma.negotiationSession.create({
      data: {
        initiatorId: userId,
        targetUserToken: targetUserToken || null,
        mode,
        topic,
        status: 'pending',
        peerProxyData: peerProxyData ?? undefined,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        sessionId: session.id,
        mode: session.mode,
        topic: session.topic,
      },
    })
  } catch (error) {
    console.error('Create negotiation error:', error)
    return NextResponse.json({ code: 500, message: '创建协商失败', data: null })
  }
}

// GET /api/negotiation - 获取协商会话列表
export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const sessions = await prisma.negotiationSession.findMany({
      where: { initiatorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      code: 0,
      data: {
        sessions: sessions.map(s => ({
          id: s.id,
          topic: s.topic,
          mode: s.mode,
          status: s.status,
          consensus: s.consensus,
          shouldContinue: s.shouldContinue,
          createdAt: s.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('Get negotiations error:', error)
    return NextResponse.json({ code: 500, message: '获取协商列表失败', data: null })
  }
}
