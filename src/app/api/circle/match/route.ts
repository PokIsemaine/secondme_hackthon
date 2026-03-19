import { NextResponse } from 'next/server'
import { getCurrentUserId, getAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PostData {
  pin_id: string
  content: string
  author_name: string
  ringName?: string
}

interface ProfileData {
  shades?: string[]
  soft_memories?: string[]
  bio?: string
}

interface Thesis {
  forYou: string
  forThem: string
}

interface ReasonObject {
  complementType: string
  thesis: Thesis
  detailLevel: 'detailed' | 'brief'
}

// Extract key fields from bio Markdown
function extractBioFields(bio: string) {
  const mbtiMatch = bio.match(/###\s*MBTI\s*###\s*\n([^\n]+)/i)
  const personalityMatch = bio.match(/###\s*性格特征\s*###\s*\n([\s\S]+?)(?=###\s*[^#]+###|$)/i)
  const valuesMatch = bio.match(/###\s*价值观\s*###\s*\n([\s\S]+?)(?=###\s*[^#]+###|$)/i)
  const overviewMatch = bio.match(/###\s*总体概述\s*###\s*\n([\s\S]+)/i)

  return {
    mbti: mbtiMatch?.[1]?.trim() || null,
    personality: personalityMatch?.[1]?.trim() || null,
    values: valuesMatch?.[1]?.trim() || null,
    overview: overviewMatch?.[1]?.trim() || null,
  }
}

// POST /api/circle/match - AI 匹配分析
export async function POST(request: Request) {
  const TIMEOUT_MS = 30000

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { profile, posts } = body as {
      profile: ProfileData
      posts: PostData[]
    }

    if (!profile || !posts?.length) {
      return NextResponse.json({ code: 400, message: '缺少必要参数', data: null })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.accessToken) {
      return NextResponse.json({ code: 401, message: '用户凭证无效', data: null })
    }

    const config = getAuthConfig()

    // Build prompt using bio fields
    const userStrengths = profile.shades?.join('、') || '未设置'
    const userCharacteristics = profile.soft_memories?.join('、') || '未设置'

    let bioSection = ''
    if (profile.bio) {
      const { mbti, personality, values, overview } = extractBioFields(profile.bio)
      const parts = [
        mbti && `MBTI：${mbti}`,
        personality && `性格特征：${personality.replace(/\n/g, ' ')}`,
        values && `价值观：${values.replace(/\n/g, ' ')}`,
        overview && `总体概述：${overview.replace(/\n/g, ' ')}`,
      ].filter(Boolean)
      if (parts.length > 0) {
        bioSection = parts.join('；')
      }
    }

    const postsSection = posts.map((p, i) => {
      const ringLabel = p.ringName ? `[来自圈子：${p.ringName}]` : ''
      return `${i + 1}. ${ringLabel} 作者：${p.author_name}\n   内容：${p.content.substring(0, 200)}`
    }).join('\n\n')

    const analysisPrompt = `你是一个专业的职业发展顾问和社群匹配专家。基于用户的完整画像，分析以下知乎圈子的帖子，找出互补合作机会。

用户完整画像：
- 擅长领域：${userStrengths}
- 个人特点：${userCharacteristics}
${bioSection ? `- AI分析画像：${bioSection}` : ''}

帖子列表（共${posts.length}条）：
${postsSection}

互补匹配判断标准：
- "能力互补"：你能帮他们解决实际问题
- "认知互补"：他们能填补你的认知盲区
- "双向互助"：双方既能互相帮助
- "相关"：帖子内容与用户相关，但互补关系不明确

请为每条帖子返回一个匹配结果，返回严格JSON数组格式（不要包含任何其他内容）：
当分数>=85时，detailLevel为"detailed"，需要生成完整双向论点；分数<85时，detailLevel为"brief"，可只给单向论点。

格式：
[{"index": 0, "score": 85, "complementType": "能力互补", "reason": {"thesis": {"forYou": "你的技术架构 → 解决他选型困境", "forThem": "他的产品视角 → 弥补你需求表达短板"}, "detailLevel": "detailed"}}]`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response
    try {
      response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          message: analysisPrompt,
          sessionId: null,
        }),
        signal: controller.signal,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('abort')) {
        return NextResponse.json({ code: 408, message: '请求超时，请重试', data: null })
      }
      throw fetchError
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SecondMe API error:', errorText)
      return NextResponse.json({ code: 500, message: 'AI 分析服务暂时不可用', data: null })
    }

    // Process SSE stream
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json({ code: 500, message: '无法读取响应', data: null })
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let assistantMessage = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
    }

    // Parse SSE lines
    const lines = buffer.split('\n')
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

    // Handle leftover buffer content (no trailing newline case)
    if (buffer && !buffer.endsWith('\n')) {
      const lastLine = buffer.split('\n').filter(Boolean).pop()
      if (lastLine && lastLine.startsWith('data: ') && !lastLine.includes('[DONE]')) {
        const dataStr = lastLine.slice(6).trim()
        try {
          const data = JSON.parse(dataStr)
          if (data.content) {
            assistantMessage += data.content
          }
        } catch {
          if (dataStr) {
            assistantMessage += dataStr
          }
        }
      }
    }

    const aiContent = assistantMessage

    // Parse AI response
    let analysisResults: Array<{ index: number; score: number; complementType: string; reason: ReasonObject }> = []
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        analysisResults = parsed.map((r: any) => {
          // Handle structured reason object (new format)
          if (r.reason && typeof r.reason === 'object' && r.reason.thesis) {
            return {
              index: Number(r.index),
              score: Number(r.score) || 50,
              complementType: r.complementType || '相关',
              reason: {
                complementType: r.reason.complementType || r.complementType || '相关',
                thesis: {
                  forYou: r.reason.thesis.forYou || '',
                  forThem: r.reason.thesis.forThem || '',
                },
                detailLevel: r.reason.detailLevel || (Number(r.score) >= 85 ? 'detailed' : 'brief'),
              } as ReasonObject,
            }
          }
          // Handle legacy string reason (backward compatibility)
          const reasonStr = typeof r.reason === 'string' ? r.reason : '内容相关'
          return {
            index: Number(r.index),
            score: Number(r.score) || 50,
            complementType: r.complementType || '相关',
            reason: {
              complementType: r.complementType || '相关',
              thesis: {
                forYou: reasonStr,
                forThem: '',
              },
              detailLevel: 'brief' as const,
            } as ReasonObject,
          }
        })
      }
    } catch (parseError) {
      console.error('Parse AI response error:', parseError)
      // Give random low scores (0-10) to ensure all posts get a result
      analysisResults = posts.map((_, index) => ({
        index,
        score: Math.floor(Math.random() * 11),
        complementType: '相关',
        reason: {
          complementType: '相关',
          thesis: {
            forYou: '内容相关',
            forThem: '',
          },
          detailLevel: 'brief' as const,
        } as ReasonObject,
      }))
    }

    // Build results: fill missing posts, sort by score descending
    const filledResults: typeof analysisResults = [...analysisResults]

    // Ensure every post has a score (fill missing with random low scores 0-10)
    for (let i = 0; i < posts.length; i++) {
      if (!filledResults.find((r) => r.index === i)) {
        filledResults.push({
          index: i,
          score: Math.floor(Math.random() * 11), // 0-10 random
          complementType: '相关',
          reason: {
            complementType: '相关',
            thesis: {
              forYou: '内容相关',
              forThem: '',
            },
            detailLevel: 'brief' as const,
          } as ReasonObject,
        })
      }
    }

    const matches = filledResults
      .map((r) => ({
        post: posts[r.index],
        matchScore: r.score / 100,
        matchReason: r.reason.thesis.forYou,
        complementType: r.reason.complementType,
        reason: r.reason,
        detailLevel: r.reason.detailLevel,
      }))
      .sort((a, b) => b.matchScore - a.matchScore) // 降序排列
      .slice(0, 5) // 只返回 TOP5

    return NextResponse.json({
      code: 0,
      data: {
        matches,
        total: 5,
      },
    })
  } catch (error) {
    console.error('Circle match error:', error)
    return NextResponse.json({ code: 500, message: '匹配分析失败', data: null })
  }
}
