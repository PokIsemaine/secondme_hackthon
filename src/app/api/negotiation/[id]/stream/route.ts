import { getCurrentUserId, getAuthConfig } from '@/lib/auth'
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

输出 JSON 格式：{"recommend": true/false, "reason": "原因", "form": "建议的合作形式", "duration": "建议时长"}`,
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

// GET /api/negotiation/[id]/stream - 流式协商 SSE
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const userId = await getCurrentUserId()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 获取协商会话
  const session = await prisma.negotiationSession.findUnique({
    where: { id },
  })

  if (!session || session.initiatorId !== userId) {
    return new Response('Negotiation not found', { status: 404 })
  }

  if (session.status === 'completed') {
    return new Response('Negotiation already completed', { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.accessToken) {
    return new Response('Invalid credentials', { status: 401 })
  }

  const myProfile = {
    strengths: user.longboardTags || '',
    needs: user.needTags || '',
    offers: user.offerTags || '',
    boundary: user.cooperationPref || '',
  }

  // 从保存的 peerProxyData 加载对方画像
  const savedPeerData = session.peerProxyData as {
    strengths?: string
    needs?: string
    offers?: string
    boundary?: string
  } | null

  const peerProfile = savedPeerData || {
    strengths: '未知',
    needs: '未知',
    offers: '未知',
    boundary: '未知',
  }

  const config = getAuthConfig()

  // 构建 ReadableStream SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n`))
      }

      try {
        // 执行 5 轮协商
        const roundsConfig = [
          { template: NEGOTIATION_TEMPLATES.round1(session.topic || '', myProfile, peerProfile), speaker: 'my_agent' },
          { template: NEGOTIATION_TEMPLATES.round2(myProfile, peerProfile), speaker: 'peer_proxy' },
          { template: NEGOTIATION_TEMPLATES.round3(myProfile, peerProfile), speaker: 'my_agent' },
          { template: NEGOTIATION_TEMPLATES.round4(), speaker: 'peer_proxy' },
          { template: NEGOTIATION_TEMPLATES.round5(), speaker: 'my_agent' },
        ]

        for (let i = 0; i < roundsConfig.length; i++) {
          const { template, speaker } = roundsConfig[i]
          const roundNumber = i + 1

          // 调用 SecondMe 流式 API
          const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.accessToken}`,
            },
            body: JSON.stringify({ message: template, sessionId: null }),
          })

          if (!response.ok) {
            sendEvent({ type: 'error', round: roundNumber, message: `Round ${roundNumber} failed` })
            continue
          }

          const reader = response.body?.getReader()
          if (!reader) {
            sendEvent({ type: 'error', round: roundNumber, message: 'Cannot read stream' })
            continue
          }

          const decoder = new TextDecoder()
          let buffer = ''
          let fullContent = ''

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
                  // SecondMe API format: {"choices": [{"delta": {"content": "..."}}]}
                  const content = data.choices?.[0]?.delta?.content
                  if (content) {
                    fullContent += content
                    sendEvent({
                      round: roundNumber,
                      speaker,
                      done: false,
                      content,
                    })
                  }
                } catch {
                  if (dataStr) {
                    fullContent += dataStr
                    sendEvent({
                      round: roundNumber,
                      speaker,
                      done: false,
                      content: dataStr,
                    })
                  }
                }
              }
            }
          }

          // 处理剩余 buffer
          if (buffer) {
            const lastLine = buffer.split('\n').filter(Boolean).pop()
            if (lastLine && lastLine.startsWith('data: ') && !lastLine.includes('[DONE]')) {
              const dataStr = lastLine.slice(6).trim()
              try {
                const data = JSON.parse(dataStr)
                // SecondMe API format: {"choices": [{"delta": {"content": "..."}}]}
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  fullContent += content
                  sendEvent({ round: roundNumber, speaker, done: false, content })
                }
              } catch {
                if (dataStr) {
                  fullContent += dataStr
                  sendEvent({ round: roundNumber, speaker, done: false, content: dataStr })
                }
              }
            }
          }

          // Round 完成：提取 summary 并发送 done 事件
          const parsed = parseLLMResponse(fullContent)
          sendEvent({
            round: roundNumber,
            speaker,
            done: true,
            summary: parsed.summary || fullContent.substring(0, 100),
          })

          // 保存 round 到数据库
          await prisma.negotiationRound.create({
            data: {
              sessionId: session.id,
              roundNumber,
              speaker,
              content: fullContent,
              summary: parsed.summary || fullContent.substring(0, 100),
            },
          })
        }

        // 从第 5 轮提取最终建议
        const lastRound = await prisma.negotiationRound.findFirst({
          where: { sessionId: session.id },
          orderBy: { roundNumber: 'desc' },
        })

        const recommendation = parseLLMResponse(lastRound?.content || '')
        const consensus = await prisma.negotiationRound.findFirst({
          where: { sessionId: session.id, roundNumber: 2 },
        })

        // 更新会话状态
        await prisma.negotiationSession.update({
          where: { id: session.id },
          data: {
            status: 'completed',
            consensus: consensus?.summary || '',
            recommendedForm: recommendation.form || (recommendation.recommend !== false ? '30分钟问题对焦' : null),
            recommendedDuration: recommendation.duration || '30分钟',
            shouldContinue: recommendation.recommend !== false,
          },
        })

        // 发送最终结果
        sendEvent({
          type: 'result',
          status: 'completed',
          consensus: consensus?.summary || '',
          recommendedForm: recommendation.form || (recommendation.recommend !== false ? '30分钟问题对焦' : null),
          recommendedDuration: recommendation.duration || '30分钟',
          shouldContinue: recommendation.recommend !== false,
        })

        // 发送 DONE
        controller.enqueue(encoder.encode('data: [DONE]\n'))
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        sendEvent({ type: 'error', message: 'Negotiation failed' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
