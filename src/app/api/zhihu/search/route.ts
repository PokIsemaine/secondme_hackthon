import { NextResponse } from 'next/server'
import { zhihuGet } from '@/lib/zhihu'

// GET /api/zhihu/search - 全网可信搜
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const count = parseInt(searchParams.get('count') || '10')

  if (!query) {
    return NextResponse.json({
      code: 400,
      message: 'query is required',
      data: null,
    })
  }

  try {
    const data = await zhihuGet<{
      status: number
      msg: string
      data: {
        has_more: boolean
        items: Array<{
          title: string
          content_type: string
          content_id: string
          content_text: string
          url: string
          comment_count: number
          vote_up_count: number
          author_name: string
          author_avatar: string
          author_badge: string
          author_badge_text: string
          edit_time: number
          comment_info_list: Array<{
            content: string
          }>
          authority_level: string
        }>
      }
    }>('/openapi/search/global', {
      query,
      count,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu search error:', error)
    return NextResponse.json({
      code: 500,
      message: '搜索失败',
      data: null,
    })
  }
}
