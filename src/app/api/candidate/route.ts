import { NextResponse } from 'next/server'
import { getCurrentUserId, getAuthConfig, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { zhihuGet } from '@/lib/zhihu'

// POST /api/candidate - 创建候选代理
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { targetToken, posts } = body as {
      targetToken: string
      posts: Array<{ content: string; author: string }>
    }

    if (!targetToken || !posts?.length) {
      return NextResponse.json({ code: 400, message: '缺少必要参数', data: null })
    }

    // 检查是否已有现成的候选代理
    const existingProxy = await prisma.candidateProxy.findUnique({
      where: { targetToken },
    })

    if (existingProxy) {
      return NextResponse.json({
        code: 0,
        data: {
          proxyId: existingProxy.id,
          ...existingProxy,
        },
      })
    }

    // 获取用户 access token 进行 LLM 分析
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.accessToken) {
      return NextResponse.json({ code: 401, message: '用户凭证无效', data: null })
    }

    const config = getAuthConfig()

    // 构建分析提示词
    const analysisPrompt = `分析以下用户在知乎讨论中的表现，推断其能力长板和需求。

用户帖子内容：
${posts.map((p, i) => `${i + 1}. ${p.content.substring(0, 200)}`).join('\n\n')}

请推断：
1. 此人可能擅长什么领域（estimated_strengths）- 用逗号分隔的标签
2. 此人可能需要什么帮助（estimated_needs）- 用逗号分隔的标签
3. 此人可能能提供什么价值（estimated_offers）- 用逗号分隔的标签
4. 此人的沟通风格（communication_style）- 简洁描述

输出 JSON 格式：
{"estimated_strengths": "...", "estimated_needs": "...", "estimated_offers": "...", "communication_style": "..."}`

    // 调用 SecondMe API 进行分析 (使用流式 API)
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        message: analysisPrompt,
        sessionId: null,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Candidate analysis API error:', errorText)
      return NextResponse.json({
        code: 500,
        message: '候选代理分析失败',
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

    // 解析结果
    let analysis = {
      estimated_strengths: '',
      estimated_needs: '',
      estimated_offers: '',
      communication_style: '',
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Parse analysis error:', parseError)
    }

    // 计算可信度（基于帖子数量）
    const confidence = Math.min(0.5 + posts.length * 0.1, 0.9)

    // 创建候选代理
    const proxy = await prisma.candidateProxy.create({
      data: {
        targetToken,
        sourcePosts: JSON.stringify(posts.map(p => p.content.substring(0, 100))),
        estimatedStrengths: analysis.estimated_strengths,
        estimatedNeeds: analysis.estimated_needs,
        estimatedOffers: analysis.estimated_offers,
        communicationStyle: analysis.communication_style,
        confidence,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        proxyId: proxy.id,
        ...proxy,
      },
    })
  } catch (error) {
    console.error('Create candidate proxy error:', error)
    return NextResponse.json({ code: 500, message: '创建候选代理失败', data: null })
  }
}

// GET /api/candidate?token=xxx - 获取候选代理
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetToken = searchParams.get('token')

    if (!targetToken) {
      return NextResponse.json({ code: 400, message: '缺少 token 参数', data: null })
    }

    const proxy = await prisma.candidateProxy.findUnique({
      where: { targetToken },
    })

    if (!proxy) {
      return NextResponse.json({
        code: 404,
        message: '候选代理不存在',
        data: null,
      })
    }

    return NextResponse.json({
      code: 0,
      data: proxy,
    })
  } catch (error) {
    console.error('Get candidate proxy error:', error)
    return NextResponse.json({ code: 500, message: '获取候选代理失败', data: null })
  }
}
