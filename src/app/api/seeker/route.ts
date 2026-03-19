import { NextResponse } from 'next/server'
import { getCurrentUserId, getAuthConfig, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { zhihuPost } from '@/lib/zhihu'

// POST /api/seeker/draft - 生成发帖草稿
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { myProblem, myOffer, myNeed } = body as {
      myProblem: string
      myOffer: string
      myNeed: string
    }

    if (!myProblem || !myOffer || !myNeed) {
      return NextResponse.json({ code: 400, message: '缺少必要参数', data: null })
    }

    // 获取用户
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.accessToken) {
      return NextResponse.json({ code: 401, message: '用户凭证无效', data: null })
    }

    const config = getAuthConfig()

    // 构建草稿生成提示词
    const draftPrompt = `你是一个知乎社区互助发起人。请根据以下信息生成一个"求补位"发帖草稿。

我的问题/卡点：${myProblem}
我能提供的价值：${myOffer}
我希望获得的帮助：${myNeed}

要求：
1. 语言自然、真实，不像广告
2. 体现合作精神，不是单纯求助
3. 包含具体场景或案例
4. 适合在知乎技术/产品圈发布
5. 长度 100-200 字

直接输出草稿内容，不要其他解释。`

    // 调用 SecondMe API 生成草稿 (使用流式 API)
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        message: draftPrompt,
        sessionId: null,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Draft generation API error:', errorText)
      return NextResponse.json({
        code: 500,
        message: '草稿生成失败',
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

    const draft = assistantMessage

    return NextResponse.json({
      code: 0,
      data: { draft },
    })
  } catch (error) {
    console.error('Generate draft error:', error)
    return NextResponse.json({ code: 500, message: '生成草稿失败', data: null })
  }
}
