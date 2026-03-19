import { getCurrentUserId, getAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Profile {
  strengths: string
  needs: string
  offers: string
  boundary: string
  communicationStyle?: string
}

interface PostContext {
  authorName: string
  postContent: string
  ringName: string
  topic: string
}

const NEGOTIATION_TEMPLATES = {
  round1: (topic: string, myProfile: Profile, peerProfile: Profile, postContext: PostContext, conversationHistory: string) => `你正在代表用户 A 与用户 B（${postContext.authorName}）进行协作协商。

## 用户 A 信息
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B 信息
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}
- 沟通风格: ${peerProfile.communicationStyle || '未知'}

## 用户 B 的帖子原文
"""
${postContext.postContent}
"""

## 帖子信息
- 作者: ${postContext.authorName}
- 圈子: ${postContext.ringName}
- 主题: ${postContext.topic}

## 协商主题: ${topic}
${conversationHistory ? `## 对话历史\n${conversationHistory}` : ''}
第 1 轮 - 定义问题：
请理解用户 B 的帖子内容，找到它与你的个人画像（擅长、需求、能提供）之间的连接点，然后明确当前要解决的具体问题。用 1-2 句话简洁描述核心问题。`,

  round2: (topic: string, myProfile: Profile, peerProfile: Profile, postContext: PostContext, conversationHistory: string) => `你正在代表用户 A 与用户 B（${postContext.authorName}）进行协作协商。

## 用户 A 信息
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B 信息
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}
- 沟通风格: ${peerProfile.communicationStyle || '未知'}

## 用户 B 的帖子原文
"""
${postContext.postContent}
"""

## 帖子信息
- 作者: ${postContext.authorName}
- 圈子: ${postContext.ringName}
- 主题: ${postContext.topic}

## 协商主题: ${topic}
${conversationHistory ? `## 对话历史\n${conversationHistory}` : ''}
第 2 轮 - 交换价值：
基于用户 B 的帖子内容和你之前在对话历史中的发言，你能推断他/她可能需要什么帮助？你能提供什么价值？请从帖子主题出发，说明你能为对方提供什么，以及你希望从对方获得什么。

你的提供: ${myProfile.offers || '未设置'}
你的需求: ${myProfile.needs || '未设置'}
对方能提供: ${peerProfile.offers || '未知'}
对方需求: ${peerProfile.needs || '未知'}

请简洁说明价值交换内容，1-2 句话。`,

  round3: (topic: string, myProfile: Profile, peerProfile: Profile, postContext: PostContext, conversationHistory: string) => `你正在代表用户 A 与用户 B（${postContext.authorName}）进行协作协商。

## 用户 A 信息
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B 信息
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}
- 沟通风格: ${peerProfile.communicationStyle || '未知'}

## 用户 B 的帖子原文
"""
${postContext.postContent}
"""

## 帖子信息
- 作者: ${postContext.authorName}
- 圈子: ${postContext.ringName}
- 主题: ${postContext.topic}

## 协商主题: ${topic}
${conversationHistory ? `## 对话历史\n${conversationHistory}` : ''}
第 3 轮 - 确认边界：
基于以上对话历史和用户 B 的帖子主题，明确你的合作边界和限制条件。

你的边界: ${myProfile.boundary || '未设置'}
对方边界: ${peerProfile.boundary || '未知'}

请简洁说明各自边界的差异和可协商的空间，1-2 句话。`,

  round4: (topic: string, myProfile: Profile, peerProfile: Profile, postContext: PostContext, conversationHistory: string) => `你正在代表用户 A 与用户 B（${postContext.authorName}）进行协作协商。

## 用户 A 信息
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B 信息
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}
- 沟通风格: ${peerProfile.communicationStyle || '未知'}

## 用户 B 的帖子原文
"""
${postContext.postContent}
"""

## 帖子信息
- 作者: ${postContext.authorName}
- 圈子: ${postContext.ringName}
- 主题: ${postContext.topic}

## 协商主题: ${topic}
${conversationHistory ? `## 对话历史\n${conversationHistory}` : ''}
第 4 轮 - 设计最小合作形式：
基于以上 3 轮对话历史和用户 B 的帖子主题，设计一个与帖子讨论相关的、最小可执行的协作形式。

考虑：最小时间投入、最小承诺、最高价值验证点，且合作行动应与帖子话题相关。

请用 1 句话描述这个最小合作形式。`,

  round5: (topic: string, myProfile: Profile, peerProfile: Profile, postContext: PostContext, conversationHistory: string) => `你正在代表用户 A 与用户 B（${postContext.authorName}）进行协作协商。

## 用户 A 信息
- 擅长: ${myProfile.strengths || '未设置'}
- 需求: ${myProfile.needs || '未设置'}
- 能提供: ${myProfile.offers || '未设置'}
- 边界: ${myProfile.boundary || '未设置'}

## 用户 B 信息
- 擅长: ${peerProfile.strengths || '未知'}
- 需求: ${peerProfile.needs || '未知'}
- 能提供: ${peerProfile.offers || '未知'}
- 沟通风格: ${peerProfile.communicationStyle || '未知'}

## 用户 B 的帖子原文
"""
${postContext.postContent}
"""

## 帖子信息
- 作者: ${postContext.authorName}
- 圈子: ${postContext.ringName}
- 主题: ${postContext.topic}

## 协商主题: ${topic}
${conversationHistory ? `## 对话历史\n${conversationHistory}` : ''}
第 5 轮 - 建议：
综合以上 4 轮对话历史和用户 B 的帖子内容，给出是否建议真人继续投入的决定。

输出 JSON 格式：
{"recommend": true/false, "reason": "原因（基于帖子讨论）", "form": "建议的合作形式", "duration": "建议时长", "consensus": "一句话合作摘要（说明双方各自提供什么、协作方向）"}`,
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
  return {
    summary: content.substring(0, 100),
    content,
    consensus: '',
  }
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
    authorName?: string
    postContent?: string
    ringName?: string
    topic?: string
    estimatedStrengths?: string
    estimatedNeeds?: string
    estimatedOffers?: string
    communicationStyle?: string
  } | null

  // 提取 postContext（向后兼容旧会话）
  const postContext: PostContext = {
    authorName: savedPeerData?.authorName || '',
    postContent: savedPeerData?.postContent || '',
    ringName: savedPeerData?.ringName || '',
    topic: savedPeerData?.topic || session.topic || '',
  }

  const peerProfile = savedPeerData ? {
    strengths: savedPeerData.estimatedStrengths || '未知',
    needs: savedPeerData.estimatedNeeds || '未知',
    offers: savedPeerData.estimatedOffers || '未知',
    boundary: '未知',
    communicationStyle: savedPeerData.communicationStyle || '未知',
  } : {
    strengths: '未知',
    needs: '未知',
    offers: '未知',
    boundary: '未知',
    communicationStyle: '未知',
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
        let conversationHistory = ''
        const roundsConfig = [
          { templateFn: NEGOTIATION_TEMPLATES.round1, speaker: 'my_agent' as const },
          { templateFn: NEGOTIATION_TEMPLATES.round2, speaker: 'peer_proxy' as const },
          { templateFn: NEGOTIATION_TEMPLATES.round3, speaker: 'my_agent' as const },
          { templateFn: NEGOTIATION_TEMPLATES.round4, speaker: 'peer_proxy' as const },
          { templateFn: NEGOTIATION_TEMPLATES.round5, speaker: 'my_agent' as const },
        ]

        for (let i = 0; i < roundsConfig.length; i++) {
          const { templateFn, speaker } = roundsConfig[i]
          const roundNumber = i + 1

          // 构建当前轮次的 prompt（传入当前对话历史）
          const template = templateFn(session.topic || '', myProfile, peerProfile, postContext, conversationHistory)

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

          // 追加到对话历史
          const speakerLabel = speaker === 'my_agent' ? '用户 A（我的 Agent）' : '用户 B（对方 Agent）'
          conversationHistory += `${speakerLabel}: ${fullContent}\n\n`
        }

        // 从第 5 轮提取最终建议
        const lastRound = await prisma.negotiationRound.findFirst({
          where: { sessionId: session.id },
          orderBy: { roundNumber: 'desc' },
        })

        const recommendation = parseLLMResponse(lastRound?.content || '')
        // consensus 来自 Round 5 JSON 中的 consensus 字段（LLM 生成的真正合作摘要）
        const consensusText = recommendation.consensus || recommendation.summary || lastRound?.content?.substring(0, 100) || ''

        // 更新会话状态
        await prisma.negotiationSession.update({
          where: { id: session.id },
          data: {
            status: 'completed',
            consensus: consensusText,
            recommendedForm: recommendation.form || (recommendation.recommend !== false ? '30分钟问题对焦' : null),
            recommendedDuration: recommendation.duration || '30分钟',
            shouldContinue: recommendation.recommend !== false,
          },
        })

        // 发送最终结果
        sendEvent({
          type: 'result',
          status: 'completed',
          consensus: consensusText,
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
