import { NextResponse } from 'next/server'
import { zhihuPost, getZhihuConfig } from '@/lib/zhihu'

// POST /api/zhihu/publish - 发布想法
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, image_urls, ring_id } = body

    if (!ring_id) {
      return NextResponse.json({
        code: 400,
        message: 'ring_id is required',
        data: null,
      })
    }

    // 验证圈子是否在白名单
    const config = getZhihuConfig()
    if (!config.ringIds.includes(ring_id)) {
      return NextResponse.json({
        code: 400,
        message: '仅支持在白名单圈子发布内容',
        data: null,
      })
    }

    if (!title) {
      return NextResponse.json({
        code: 400,
        message: 'title is required',
        data: null,
      })
    }

    const data = await zhihuPost<{
      status: number
      msg: string
      data: {
        content_token: string
      }
    }>('/openapi/publish/pin', {
      title,
      content: content || '',
      image_urls: image_urls || [],
      ring_id,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu publish error:', error)
    return NextResponse.json({
      code: 500,
      message: '发布想法失败',
      data: null,
    })
  }
}
