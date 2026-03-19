import { NextResponse } from 'next/server'
import { zhihuGet, zhihuPost } from '@/lib/zhihu'

// POST /api/zhihu/comment - 创建评论
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content_token, content_type, content, reply_comment_id } = body

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

    if (!content) {
      return NextResponse.json({
        code: 400,
        message: 'content is required',
        data: null,
      })
    }

    const requestBody: Record<string, string> = {
      content_token,
      content_type,
      content,
    }

    if (reply_comment_id) {
      requestBody.reply_comment_id = reply_comment_id.toString()
    }

    const data = await zhihuPost<{
      code: number
      msg: string
      data: {
        comment_id: number
      }
    }>('/openapi/comment/create', requestBody)

    return NextResponse.json({
      code: data.code,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu comment error:', error)
    return NextResponse.json({
      code: 500,
      message: '创建评论失败',
      data: null,
    })
  }
}

// GET /api/zhihu/comment - 获取评论列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const contentToken = searchParams.get('content_token')
  const contentType = searchParams.get('content_type') || 'pin'
  const pageNum = parseInt(searchParams.get('page_num') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '10')

  if (!contentToken) {
    return NextResponse.json({
      code: 400,
      message: 'content_token is required',
      data: null,
    })
  }

  try {
    const data = await zhihuGet<{
      status: number
      msg: string
      data: {
        comments: Array<{
          comment_id: string
          content: string
          author_name: string
          author_token: string
          like_count: number
          reply_count: number
          publish_time: number
        }>
        has_more: boolean
      }
    }>('/openapi/comment/list', {
      content_token: contentToken,
      content_type: contentType,
      page_num: pageNum,
      page_size: pageSize,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu comment list error:', error)
    return NextResponse.json({
      code: 500,
      message: '获取评论列表失败',
      data: null,
    })
  }
}
