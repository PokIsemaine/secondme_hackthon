import { NextResponse } from 'next/server'
import { zhihuGet, getZhihuConfig } from '@/lib/zhihu'

// GET /api/zhihu/ring - 获取圈子内容列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ringId = searchParams.get('ring_id')
  const pageNum = parseInt(searchParams.get('page_num') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '20')

  if (!ringId) {
    // 返回可用的圈子列表
    const config = getZhihuConfig()
    return NextResponse.json({
      code: 0,
      data: {
        rings: config.ringIds.map((id) => ({ ring_id: id })),
        message: '请提供 ring_id 参数获取圈子内容',
      },
    })
  }

  try {
    const data = await zhihuGet<{
      status: number
      msg: string
      data: {
        ring_info: {
          ring_id: string
          ring_name: string
          ring_desc: string
          ring_avatar: string
          membership_num: number
          discussion_num: number
        }
        contents: Array<{
          pin_id?: string
          content: string
          author_name: string
          images?: string[]
          publish_time: number
          like_num: number
          comment_num: number
          share_num: number
          fav_num: number
          comments?: Array<{
            comment_id: number
            content: string
            author_name: string
            author_token: string
            like_count: number
            reply_count: number
            publish_time: number
          }>
        }>
      }
    }>('/openapi/ring/detail', {
      ring_id: ringId,
      page_num: pageNum,
      page_size: pageSize,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu ring error:', error)
    return NextResponse.json({
      code: 500,
      message: '获取圈子内容失败',
      data: null,
    })
  }
}
