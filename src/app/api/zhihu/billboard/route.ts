import { NextResponse } from 'next/server'
import { zhihuGet } from '@/lib/zhihu'

// GET /api/zhihu/billboard - 获取热榜列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topCnt = parseInt(searchParams.get('top_cnt') || '50')
  const publishInHours = parseInt(searchParams.get('publish_in_hours') || '48')

  try {
    const data = await zhihuGet<{
      status: number
      msg: string
      data: {
        list: Array<{
          title: string
          body: string
          link_url: string
          published_time: number
          published_time_str: string
          state: string
          heat_score: number
          token: string
          type: string
          answers?: Array<{
            title: string
            body: string
            link_url: string
            published_time: number
            published_time_str: string
            state: string
            heat_score: number
            token: string
            type: string
            interaction_info: {
              vote_up_count: number
              like_count: number
              comment_count: number
              favorites: number
              pv_count: number
            }
          }>
          interaction_info: {
            vote_up_count: number
            like_count: number
            comment_count: number
            favorites: number
            pv_count: number
          }
        }>
        pagination: {
          total: number
        }
      }
    }>('/openapi/billboard/list', {
      top_cnt: topCnt,
      publish_in_hours: publishInHours,
    })

    return NextResponse.json({
      code: data.status === 0 ? 0 : 1,
      data: data.data,
    })
  } catch (error) {
    console.error('Zhihu billboard error:', error)
    return NextResponse.json({
      code: 500,
      message: '获取热榜失败',
      data: null,
    })
  }
}
