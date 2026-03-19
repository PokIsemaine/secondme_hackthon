import { NextResponse } from 'next/server'
import { getCurrentUserId, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    // 从数据库获取用户
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    // 从 SecondMe API 获取最新用户信息
    let nickname = user.nickname || ''
    let avatar_url = user.avatarUrl || ''

    try {
      const apiData = await callSecondMeApi<{ code: number; data: { userId: string; name?: string; avatar?: string } }>(
        '/api/secondme/user/info',
        user.accessToken
      )
      if (apiData.code === 0 && apiData.data) {
        nickname = apiData.data.name || nickname
        avatar_url = apiData.data.avatar || avatar_url
      }
    } catch (error) {
      console.error('Failed to fetch user info from SecondMe:', error)
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.secondmeUserId || '',
        nickname: nickname || '',
        avatar_url: avatar_url || '',
        longboard_tags: user.longboardTags || '',
        blindspot_tags: user.blindspotTags || '',
        offer_tags: user.offerTags || '',
        need_tags: user.needTags || '',
        cooperation_pref: user.cooperationPref || '',
      },
    })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json({ code: 500, message: '获取用户信息失败', data: null })
  }
}

// 更新用户画像
export async function PUT(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    const body = await request.json()
    const { longboardTags, blindspotTags, offerTags, needTags, cooperationPref } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        longboardTags,
        blindspotTags,
        offerTags,
        needTags,
        cooperationPref,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        longboard_tags: user.longboardTags,
        blindspot_tags: user.blindspotTags,
        offer_tags: user.offerTags,
        need_tags: user.needTags,
        cooperation_pref: user.cooperationPref,
      },
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json({ code: 500, message: '更新用户画像失败', data: null })
  }
}
