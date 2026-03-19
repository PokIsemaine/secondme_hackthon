import { NextResponse } from 'next/server'
import { getCurrentUserId, callSecondMeApi } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未登录', data: null })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在', data: null })
    }

    // 并行获取所有用户数据
    const [infoResult, shadesResult, softmemoryResult, sessionsResult] = await Promise.allSettled([
      // 用户基本信息
      callSecondMeApi<{
        code: number
        data: {
          userId: string
          name?: string
          avatar?: string
          bio?: string
          selfIntroduction?: string
          profileCompleteness?: number
        }
      }>('/api/secondme/user/info', user.accessToken),

      // 兴趣标签
      callSecondMeApi<{
        code: number
        data: { shades: Array<{ shadeName: string; confidenceLevel: string; shadeDescription: string }> }
      }>('/api/secondme/user/shades', user.accessToken),

      // 软记忆
      callSecondMeApi<{
        code: number
        data: { list: Array<{ factObject: string; factContent: string }>; total: number }
      }>('/api/secondme/user/softmemory?pageSize=20', user.accessToken),

      // 会话列表
      callSecondMeApi<{
        code: number
        data: { sessions: Array<{ sessionId: string; lastMessage: string; messageCount: number }> }
      }>('/api/secondme/chat/session/list', user.accessToken),
    ])

    // 处理用户信息
    let nickname = user.nickname || ''
    let avatarUrl = user.avatarUrl || ''
    let bio = ''
    let selfIntroduction = ''
    let profileCompleteness = 0

    if (infoResult.status === 'fulfilled' && infoResult.value.code === 0) {
      const data = infoResult.value.data
      nickname = data.name || nickname
      avatarUrl = data.avatar || avatarUrl
      bio = data.bio || ''
      selfIntroduction = data.selfIntroduction || ''
      profileCompleteness = data.profileCompleteness || 0
    }

    // 处理兴趣标签
    let shades: string[] = []
    if (shadesResult.status === 'fulfilled' && shadesResult.value.code === 0) {
      shades = shadesResult.value.data?.shades?.map(s => s.shadeName) || []
    }

    // 处理软记忆
    let softMemories: string[] = []
    if (softmemoryResult.status === 'fulfilled' && softmemoryResult.value.code === 0) {
      softMemories = softmemoryResult.value.data?.list?.map(m => m.factContent) || []
    }

    // 处理会话摘要
    let chatSummary = ''
    if (sessionsResult.status === 'fulfilled' && sessionsResult.value.code === 0) {
      const sessions = sessionsResult.value.data?.sessions || []
      if (sessions.length > 0) {
        chatSummary = `与 AI 分身对话 ${sessions.length} 次`
      }
    }

    // 保存到数据库
    await prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        avatarUrl,
        longboardTags: shades.join(', '),
        blindspotTags: softMemories.slice(0, 5).join('; '),
        offerTags: chatSummary,
        needTags: bio || selfIntroduction,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        nickname,
        avatar_url: avatarUrl,
        bio,
        self_introduction: selfIntroduction,
        profile_completeness: profileCompleteness,
        shades,
        soft_memories: softMemories,
        chat_summary: chatSummary,
        message: '画像已自动生成',
      },
    })
  } catch (error) {
    console.error('Generate profile error:', error)
    return NextResponse.json({ code: 500, message: '生成画像失败', data: null })
  }
}

// 获取画像
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

    // Parse profileJson if exists
    let profile: Record<string, unknown> | null = null
    if (user.profileJson) {
      try {
        profile = JSON.parse(user.profileJson)
      } catch {
        console.error('Failed to parse profileJson')
      }
    }

    // Try to get fresh data from SecondMe API for flat fields
    let shades: string[] = []
    let softMemories: string[] = []
    let chatSummary = ''

    try {
      const [shadesResult, softmemoryResult, sessionsResult] = await Promise.allSettled([
        callSecondMeApi<{ code: number; data: { shades: Array<{ shadeName: string }> } }>(
          '/api/secondme/user/shades', user.accessToken
        ),
        callSecondMeApi<{ code: number; data: { list: Array<{ factContent: string }> } }>(
          '/api/secondme/user/softmemory?pageSize=20', user.accessToken
        ),
        callSecondMeApi<{ code: number; data: { sessions: Array<{ messageCount: number }> } }>(
          '/api/secondme/chat/session/list', user.accessToken
        ),
      ])

      if (shadesResult.status === 'fulfilled' && shadesResult.value.code === 0) {
        shades = shadesResult.value.data?.shades?.map(s => s.shadeName) || []
      }
      if (softmemoryResult.status === 'fulfilled' && softmemoryResult.value.code === 0) {
        softMemories = softmemoryResult.value.data?.list?.map(m => m.factContent) || []
      }
      if (sessionsResult.status === 'fulfilled' && sessionsResult.value.code === 0) {
        const sessions = sessionsResult.value.data?.sessions || []
        if (sessions.length > 0) {
          chatSummary = `与 AI 分身对话 ${sessions.length} 次`
        }
      }
    } catch (e) {
      console.error('Failed to fetch fresh data:', e)
    }

    return NextResponse.json({
      code: 0,
      data: {
        nickname: user.nickname,
        avatar_url: user.avatarUrl,
        profile,  // Full profileJson
        longboard_tags: (profile?.expertise as { domains?: string[] })?.domains?.join(', ') || shades.join(', ') || user.longboardTags || '',
        blindspot_tags: (profile?.blindspots as { areas?: string[] })?.areas?.join(', ') || softMemories.slice(0, 5).join('; ') || user.blindspotTags || '',
        offer_tags: (profile?.offerings as { tangible?: string[] })?.tangible?.join(', ') || chatSummary || user.offerTags || '',
        need_tags: (profile?.needs as { explicit?: string[] })?.explicit?.join(', ') || user.needTags || '',
        cooperation_pref: (profile?.collaboration as { prefers?: string[] })?.prefers?.join(', ') || user.cooperationPref || '',
        shades,
        soft_memories: softMemories,
        chat_summary: chatSummary,
        has_profile: !!profile,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ code: 500, message: '获取画像失败', data: null })
  }
}
