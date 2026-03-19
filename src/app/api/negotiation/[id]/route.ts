import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 解析 LLM 返回的 JSON
function parseLLMResponse(content: string): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Parse error:', e)
  }
  return { summary: content.substring(0, 100), content }
}

// GET /api/negotiation/[id] - 获取协商详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const session = await prisma.negotiationSession.findUnique({
      where: { id },
      include: {
        rounds: { orderBy: { roundNumber: 'asc' } },
      },
    })

    if (!session || session.initiatorId !== userId) {
      return NextResponse.json({ code: 404, message: '协商不存在', data: null })
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: session.id,
        topic: session.topic,
        mode: session.mode,
        status: session.status,
        consensus: session.consensus,
        disagreements: session.disagreements,
        recommendedForm: session.recommendedForm,
        recommendedDuration: session.recommendedDuration,
        shouldContinue: session.shouldContinue,
        rounds: session.rounds,
        createdAt: session.createdAt,
      },
    })
  } catch (error) {
    console.error('Get negotiation error:', error)
    return NextResponse.json({ code: 500, message: '获取协商详情失败', data: null })
  }
}
