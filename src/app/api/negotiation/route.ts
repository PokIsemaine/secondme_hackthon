import { NextResponse } from 'next/server'
import { getCurrentUserId, getAuthConfig, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 5 轮协商 Prompt 模板
const NEGOTIATION_PROMPTS = {
  round1_defineProblem: (topic: string, myProfile: any, peerProfile: any) => `
你正在代表用户 A 与用户 B（或候选代理）进行协作协商。

## 用户 A 信息
- 擅长领域: ${myProfile.strengths || '未设置'}
- 需要帮助: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 合作边界: ${myProfile.boundary || '未设置'}

## 用户 B / 候选代理信息
- 估计擅长: ${peerProfile.strengths || '未知'}
- 估计需求: ${peerProfile.needs || '未知'}
- 估计能提供: ${peerProfile.offers || '未知'}

## 协商主题
${topic}

## 第 1 轮：定义问题
请明确当前要解决的具体问题是什么。用 1-2 句话简洁描述。

输出格式：
{"summary": "问题描述", "content": "完整发言内容"}
`,

  round2_exchangeValue: (myProfile: any, peerProfile: any) => `
## 第 2 轮：交换价值
请说明你能为对方提供什么价值，以及你希望从对方获得什么。

用户 A 能提供: ${myProfile.offers || '未设置'}
用户 A 需要: ${myProfile.needs || '未设置'}

用户 B 能提供: ${peerProfile.offers || '未知'}
用户 B 需要: ${peerProfile.needs || '未知'}

输出格式：
{"summary": "价值交换摘要", "content": "完整发言内容"}
`,

  round3_confirmBoundary: (myProfile: any, peerProfile: any) => `
## 第 3 轮：确认边界
请明确各方的合作边界和限制条件。

用户 A 边界: ${myProfile.boundary || '未设置'}
用户 B 边界: ${peerProfile.boundary || '未知'}

输出格式：
{"summary": "边界确认摘要", "content": "完整发言内容"}
`,

  round4_designMinCollaboration: () => `
## 第 4 轮：设计最低成本合作形式
基于前面的讨论，请提出一个最小可执行的协作形式。

考虑：
- 最小时间投入
- 最小承诺
- 最有价值的验证点

输出格式：
{"summary": "最小合作形式", "content": "完整发言内容"}
`,

  round5_recommend: () => `
## 第 5 轮：建议继续或终止
综合以上讨论，请给出是否建议真人继续投入的建议。

输出格式：
{"summary": "建议摘要", "shouldContinue": true/false, "reason": "原因", "content": "完整发言内容"}
`
}

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
      peerProxyData?: any
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
        peerProxyData: peerProxyData || null,
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
