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
    const { content, source = 'manual' } = body

    if (!content) {
      return NextResponse.json({ code: 400, message: '笔记内容不能为空', data: null })
    }

    // 调用 SecondMe API 添加笔记到用户分身
    const config = getAuthConfig()
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/note/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ code: 500, message: `添加笔记失败: ${error}`, data: null })
    }

    const secondmeResult = await response.json()

    // 保存到本地数据库
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        content,
        source,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        id: note.id,
        content: note.content,
        source: note.source,
        created_at: note.createdAt.toISOString(),
        secondme_response: secondmeResult.data,
      },
    })
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json({ code: 500, message: '添加笔记失败', data: null })
  }
}

// 获取用户笔记列表
export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      code: 0,
      data: {
        notes: notes.map((n) => ({
          id: n.id,
          content: n.content,
          source: n.source,
          created_at: n.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ code: 500, message: '获取笔记列表失败', data: null })
  }
}
