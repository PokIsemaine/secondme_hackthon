import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal - 创建提案
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { negotiationId, targetUserId, contextToken } = body as {
      negotiationId?: string
      targetUserId?: string
      contextToken?: string
    }

    // 如果有协商 ID，从协商中提取信息
    let complementReason = ''
    let offerSummary = ''
    let needSummary = ''

    if (negotiationId) {
      const negotiation = await prisma.negotiationSession.findUnique({
        where: { id: negotiationId },
      })
      if (negotiation) {
        complementReason = negotiation.consensus || ''
        offerSummary = negotiation.recommendedForm || ''
        needSummary = negotiation.recommendedDuration || ''
      }
    }

    const proposal = await prisma.proposal.create({
      data: {
        initiatorId: userId,
        targetUserId: targetUserId || null,
        contextToken: contextToken || negotiationId || null,
        complementReason,
        offerSummary,
        needSummary,
        collaborationType: '30分钟互助对话',
        status: 'pending',
      },
    })

    return NextResponse.json({
      code: 0,
      data: { proposalId: proposal.id },
    })
  } catch (error) {
    console.error('Create proposal error:', error)
    return NextResponse.json({ code: 500, message: '创建提案失败', data: null })
  }
}

// GET /api/proposal - 获取提案列表
export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const proposals = await prisma.proposal.findMany({
      where: { initiatorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      code: 0,
      data: { proposals },
    })
  } catch (error) {
    console.error('Get proposals error:', error)
    return NextResponse.json({ code: 500, message: '获取提案失败', data: null })
  }
}
