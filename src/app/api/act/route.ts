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
    const { action, content, actionControl } = body

    // 构建发送给 SecondMe Act API 的请求
    const config = getAuthConfig()
    const requestBody: Record<string, unknown> = {
      action,
      content,
    }

    // 如果提供了 actionControl，添加到请求中
    if (actionControl) {
      requestBody.actionControl = actionControl
    }

    const response = await fetch(`${config.apiBaseUrl}/api/secondme/act`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ code: 500, message: `Act 请求失败: ${error}`, data: null })
    }

    const result = await response.json()

    // 解析 JSON 结果
    let parsedResult = result.data
    if (typeof result.data === 'string') {
      try {
        parsedResult = JSON.parse(result.data)
      } catch {
        // 如果解析失败，返回原始字符串
      }
    }

    return NextResponse.json({
      code: 0,
      data: parsedResult,
    })
  } catch (error) {
    console.error('Act error:', error)
    return NextResponse.json({ code: 500, message: 'Act 请求失败', data: null })
  }
}
