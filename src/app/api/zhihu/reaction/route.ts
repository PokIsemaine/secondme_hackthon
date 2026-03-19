import { NextResponse } from 'next/server'
import { zhihuPost } from '@/lib/zhihu'

// POST /api/zhihu/reaction - 点赞/取消点赞
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content_token, content_type, action_type, action_value } = body

    if (!content_token) {
      return NextResponse.json({
        code: 400,
        message: 'content_token is required',
        data: null,
      })
    }

    if (!content_type || !['pin', 'comment'].includes(content_type)) {
      return NextResponse.json({
        code: 400,
        message: 'content_type must be pin or comment',
        data: null,
      })
    }

    if (action_value === undefined || ![0, 1].includes(action_value)) {
      return NextResponse.json({
        code: 400,
        message: 'action_value must be 0 or 1',
        data: null,
      })
    }

    const data = await zhihuPost<{
      status: number
      msg: string
      data: {
        success: boolean
      }
    }>('/openapi/reaction', {
      content_token,
      content_type,
      action_type: action_type || 'like',
      action_value,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu reaction error:', error)
    return NextResponse.json({
      code: 500,
      message: '操作失败',
      data: null,
    })
  }
}
