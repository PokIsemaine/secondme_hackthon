import { NextResponse } from 'next/server'
import { getCurrentUserId, getAuthConfig, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 5 轮协商模板
const NEGOTIATION_TEMPLATES = {
  round1: (topic: string, myProfile: any, peerProfile: any) => `你正在代表用户 A 与用户 B 进行协作协商。

## 用户 A
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}

## 协商主题: ${topic}

第 1 轮 - 定义问题：
请明确当前要解决的具体问题。用 50 字内概括核心问题。`,

  round2: (myProfile: any, peerProfile: any) => `第 2 轮 - 交换价值：
你能为对方提供什么？你希望从对方获得什么？

你的提供: ${myProfile.offers || '未设置'}
你的需求: ${myProfile.needs || '未设置'}
对方能提供: ${peerProfile.offers || '未知'}
对方需求: ${peerProfile.needs || '未知'}

请简洁说明价值交换内容。`,

  round3: (myProfile: any, peerProfile: any) => `第 3 轮 - 确认边界：
你的合作边界和限制是什么？

你的边界: ${myProfile.boundary || '未设置'}
对方边界: ${peerProfile.boundary || '未知'}`,

  round4: () => `第 4 轮 - 设计最小合作形式：
基于以上讨论，提出一个最小可执行的协作形式。

考虑：最小时间投入、最小承诺、最高价值验证点。`,

  round5: () => `第 5 轮 - 建议：
综合以上讨论，建议是否继续。

输出 JSON 格式：{"recommend": true/false, "reason": "原因", "form": "建议的合作形式", "duration": "建议时长"}`
}

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

// POST /api/negotiation/[id]/execute - 执行协商
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { peerProxyData } = body as { peerProxyData?: any }

    // 获取协商会话
    const session = await prisma.negotiationSession.findUnique({
      where: { id },
    })

    if (!session || session.initiatorId !== userId) {
      return NextResponse.json({ code: 404, message: '协商不存在', data: null })
    }

    if (session.status === 'completed') {
      return NextResponse.json({ code: 400, message: '协商已完成', data: null })
    }

    // 获取用户画像
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.accessToken) {
      return NextResponse.json({ code: 401, message: '用户凭证无效', data: null })
    }

    const myProfile = {
      strengths: user.longboardTags || '',
      needs: user.needTags || '',
      offers: user.offerTags || '',
      boundary: user.cooperationPref || '',
    }

    const peerProfile = peerProxyData || {
      strengths: '未知',
      needs: '未知',
      offers: '未知',
      boundary: '未知',
    }

    const config = getAuthConfig()
    const rounds = []

    // 执行 5 轮协商
    for (let i = 1; i <= 5; i++) {
      let prompt = ''
      let speaker = ''

      switch (i) {
        case 1:
          prompt = NEGOTIATION_TEMPLATES.round1(session.topic || '', myProfile, peerProfile)
          speaker = 'my_agent'
          break
        case 2:
          prompt = NEGOTIATION_TEMPLATES.round2(myProfile, peerProfile)
          speaker = 'peer_proxy'
          break
        case 3:
          prompt = NEGOTIATION_TEMPLATES.round3(myProfile, peerProfile)
          speaker = 'my_agent'
          break
        case 4:
          prompt = NEGOTIATION_TEMPLATES.round4()
          speaker = 'peer_proxy'
          break
        case 5:
          prompt = NEGOTIATION_TEMPLATES.round5()
          speaker = 'my_agent'
          break
      }

      // 调用 SecondMe API (使用流式 API)
      const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          message: prompt,
          sessionId: null,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Round ${i} API error:`, errorText)
        return NextResponse.json({
          code: 500,
          message: `协商第 ${i} 轮失败`,
          data: null,
        })
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        return NextResponse.json({
          code: 500,
          message: '无法读取响应',
          data: null,
        })
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') continue
            try {
              const data = JSON.parse(dataStr)
              if (data.content) {
                assistantMessage += data.content
              }
            } catch {
              if (dataStr && dataStr !== '[DONE]') {
                assistantMessage += dataStr
              }
            }
          }
        }
      }

      const content = assistantMessage
      const parsed = parseLLMResponse(content)

      // 保存轮次
      const round = await prisma.negotiationRound.create({
        data: {
          sessionId: session.id,
          roundNumber: i,
          speaker,
          content,
          summary: parsed.summary || content.substring(0, 100),
        },
      })

      rounds.push(round)
    }

    // 分析协商结果 - 从第 5 轮提取建议
    const lastRound = rounds[4]
    const recommendation = parseLLMResponse(lastRound.content)

    // 更新会话状态
    await prisma.negotiationSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        consensus: rounds[1]?.summary || '', // 价值交换轮次的摘要作为共识基础
        disagreements: null, // 可后续扩展
        recommendedForm: recommendation.form || recommendation.recommend ? '30分钟问题对焦' : null,
        recommendedDuration: recommendation.duration || '30分钟',
        shouldContinue: recommendation.recommend !== false,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        sessionId: session.id,
        status: 'completed',
        rounds: rounds.map(r => ({
          roundNumber: r.roundNumber,
          speaker: r.speaker,
          summary: r.summary,
        })),
        result: {
          consensus: rounds[1]?.summary,
          recommendedForm: recommendation.form,
          recommendedDuration: recommendation.duration,
          shouldContinue: recommendation.recommend,
        },
      },
    })
  } catch (error) {
    console.error('Execute negotiation error:', error)
    return NextResponse.json({ code: 500, message: '执行协商失败', data: null })
  }
}
