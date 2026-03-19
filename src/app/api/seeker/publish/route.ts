import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { zhihuPost } from '@/lib/zhihu'

// 允许发布的圈子
const ALLOWED_RING_IDS = [
  '2001009660925334090',
  '2015023739549529606',
]

// POST /api/seeker/publish - 发布求补位帖子
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ code: 401, message: '未登录', data: null })
    }

    const body = await request.json()
    const { content, ringId } = body as {
      content: string
      ringId: string
    }

    if (!content) {
      return NextResponse.json({ code: 400, message: '内容不能为空', data: null })
    }

    // 验证圈子是否允许
    if (!ALLOWED_RING_IDS.includes(ringId)) {
      return NextResponse.json({
        code: 400,
        message: '只能在指定的知乎圈子发布内容',
        data: null,
      })
    }

    // 调用知乎发布 API
    const result = await zhihuPost<any>('/openapi/publish/pin', {
      ring_id: ringId,
      content,
    })

    const pinId = (result as any)?.data?.pin_id || `temp_${Date.now()}`

    // 保存到数据库
    await prisma.ringContent.create({
      data: {
        ringId,
        contentToken: pinId,
        title: content.substring(0, 50),
        content,
        authorName: '我',
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        pinId,
        message: '发布成功',
      },
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({ code: 500, message: '发布失败', data: null })
  }
}
