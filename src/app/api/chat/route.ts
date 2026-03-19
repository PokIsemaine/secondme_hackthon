import { NextResponse } from 'next/server'
import { getCurrentUserId, callSecondMeApi, getAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    const body = await request.json()
    const { message, sessionId } = body

    // 如果提供了 sessionId，获取历史消息
    let messages: Array<{ role: string; content: string }> = []
    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
      if (session) {
        messages = session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      }
    }

    // 添加当前消息
    messages.push({ role: 'user', content: message })

    // 调用 SecondMe API 进行流式对话
    const config = getAuthConfig()
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ code: 500, message: `聊天失败: ${error}`, data: null })
    }

    // 处理流式 SSE 响应
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json({ code: 500, message: '无法读取响应', data: null })
    }

    const decoder = new TextDecoder()
    let assistantMessage = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // 解析 SSE 格式: data: {"content":"xxx"}\n\n
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              assistantMessage += data.content
            }
          } catch {
            // 如果不是 JSON，可能是纯文本
            assistantMessage += line.slice(6)
          }
        }
      }
    }

    // 处理剩余的 buffer
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6))
        if (data.content) {
          assistantMessage += data.content
        }
      } catch {
        assistantMessage += buffer.slice(6)
      }
    }

    // 保存会话和消息到数据库
    let session
    if (sessionId) {
      session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          updatedAt: new Date(),
        },
      })
    } else {
      session = await prisma.session.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50),
        },
      })
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    })

    // 保存助手消息
    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        session_id: session.id,
        message: assistantMessage,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ code: 500, message: '聊天失败', data: null })
  }
}
