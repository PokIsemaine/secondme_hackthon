import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeCodeForToken, setUserSession, getAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  fetchAllUserData,
  fetchAndCompressSessions,
  type SelectedSession,
} from '@/lib/profile-data'
import {
  assemblePrompt,
  assembleChatFallbackPrompt,
  type ProfilePromptData,
} from '@/lib/profile-prompt'
import {
  callActStream,
  callChatStreamFallback,
  parseProfileJson,
} from '@/lib/llm-call'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // 验证 state（宽松模式，支持 WebView）
  const cookieStore = await cookies()
  const savedState = cookieStore.get('oauth_state')?.value

  if (state !== savedState) {
    console.warn('OAuth state 验证失败，可能是跨 WebView 场景')
    // 宽松模式：记录警告但继续处理
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 交换授权码获取 Token（响应在 data 字段中，且使用驼峰命名）
    const tokenResponse = await exchangeCodeForToken(code) as {
      code: number
      data?: {
        accessToken?: string
        refreshToken?: string
        expiresIn?: number
      }
    }

    // 验证响应
    if (tokenResponse.code !== 0 || !tokenResponse.data) {
      console.error('Token exchange failed:', tokenResponse)
      return NextResponse.redirect(new URL('/?error=token_failed', request.url))
    }

    const tokenData = tokenResponse.data
    if (!tokenData.accessToken || !tokenData.refreshToken || !tokenData.expiresIn) {
      console.error('Invalid token data:', tokenData)
      return NextResponse.redirect(new URL('/?error=token_failed', request.url))
    }

    // 计算 token 过期时间
    const tokenExpiresAt = new Date(Date.now() + tokenData.expiresIn * 1000)

    // 获取用户信息
    const config = getAuthConfig()
    console.log('Fetching user info from:', `${config.apiBaseUrl}/api/secondme/user/info`)

    const userInfoResponse = await fetch(`${config.apiBaseUrl}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${tokenData.accessToken}`,
      },
    })

    console.log('User info response status:', userInfoResponse.status)

    let userInfo: { id: string; nickname?: string; avatar_url?: string } = { id: '' }
    if (userInfoResponse.ok) {
      const userInfoData = await userInfoResponse.json()
      console.log('User info data:', userInfoData)
      if (userInfoData.code === 0 && userInfoData.data?.userId) {
        // 字段映射：userId -> id, name -> nickname, avatar -> avatar_url
        userInfo = {
          id: userInfoData.data.userId,
          nickname: userInfoData.data.name,
          avatar_url: userInfoData.data.avatar,
        }
      }
    } else {
      const errorText = await userInfoResponse.text()
      console.error('User info API error:', errorText)
    }

    // 验证用户 ID
    if (!userInfo.id) {
      console.error('Failed to get user ID from SecondMe API')
      return NextResponse.redirect(new URL('/?error=user_info_failed', request.url))
    }

    // 保存或更新用户
    const user = await prisma.user.upsert({
      where: { secondmeUserId: userInfo.id },
      update: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatar_url,
      },
      create: {
        secondmeUserId: userInfo.id,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatar_url,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt,
      },
    })

    // 设置 Session
    setUserSession(user.id, tokenData.accessToken)

    // 自动生成分身画像（异步，不阻塞登录流程）
    generateAvatarProfile(user.id, tokenData.accessToken).catch(err => {
      console.error('Auto profile generation failed:', err)
    })

    // 清除 state cookie
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('oauth_state')

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}

// 生成分身画像（异步，不阻塞主流程）
async function generateAvatarProfile(userId: string, accessToken: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    // Step 1: Parallel fetch all user data
    const dataFetchResult = await fetchAllUserData(accessToken)

    // Step 2: Select and compress sessions
    const selectedSessions: SelectedSession[] = dataFetchResult.sessions.status === 'success'
      ? await fetchAndCompressSessions(accessToken, dataFetchResult.sessions.data)
      : []

    const basedOnMessagesCount = selectedSessions.reduce((sum, s) => sum + s.messages.length, 0)

    // Step 3: Build prompt data
    const username = user.nickname || dataFetchResult.userInfo.data?.name || '用户'
    const promptData: ProfilePromptData = {
      username,
      userInfo: dataFetchResult.userInfo,
      shades: { ...dataFetchResult.shades, count: dataFetchResult.shades.data.length },
      softmemory: { ...dataFetchResult.softmemory, count: dataFetchResult.softmemory.data.length },
      sessions: { ...dataFetchResult.sessions, count: dataFetchResult.sessions.data.length },
      selectedSessions,
    }

    // Step 4: Call act/stream
    const prompt = assemblePrompt(promptData)
    const actResult = await callActStream(accessToken, prompt)

    let profileJson: Record<string, unknown> | null = null
    let naturalLanguagePreview: string | undefined = undefined

    if (actResult.success && actResult.content) {
      const parsed = parseProfileJson(actResult.content)
      if (parsed) {
        profileJson = parsed as Record<string, unknown>
      }
    }

    // Step 5: Fallback to chat/stream if act/stream failed
    if (!profileJson) {
      const fallbackPrompt = assembleChatFallbackPrompt(username)
      const chatResult = await callChatStreamFallback(accessToken, fallbackPrompt)
      if (chatResult.success && chatResult.content) {
        naturalLanguagePreview = chatResult.content
      }
    }

    // Create minimal profile if needed
    if (!profileJson) {
      profileJson = {
        personality: { traits: [], communicationStyle: '未知', emotionalPattern: '未知' },
        expertise: { domains: [], depthLevels: {}, certifications: [] },
        blindspots: { areas: [], descriptions: '暂无数据' },
        collaboration: { prefers: [], avoids: [], minCollaborationUnit: '未知' },
        needs: { explicit: [], latent: [] },
        offerings: { tangible: [], intangible: [] },
        meta: {
          confidence: 0.3,
          generatedAt: new Date().toISOString(),
          dataFreshness: new Date().toISOString(),
          dataSources: [],
          basedOnSessionsCount: 0,
          basedOnMessagesCount: 0,
          oldestDataPoint: new Date().toISOString(),
        },
      }
    }

    // Set meta
    const now = new Date().toISOString()
    ;(profileJson as Record<string, unknown>).meta = {
      confidence: ((profileJson as Record<string, unknown>).meta as Record<string, unknown>)?.confidence || 0.3,
      generatedAt: now,
      dataFreshness: now,
      dataSources: ['user.info', 'shades', 'softmemory', 'chat'].filter((_, i) => [
        dataFetchResult.userInfo.status,
        dataFetchResult.shades.status,
        dataFetchResult.softmemory.status,
        dataFetchResult.sessions.status,
      ][i] === 'success'),
      basedOnSessionsCount: selectedSessions.length,
      basedOnMessagesCount,
      oldestDataPoint: now,
    }

    if (naturalLanguagePreview && !(profileJson as Record<string, unknown>).naturalLanguagePreview) {
      (profileJson as Record<string, unknown>).naturalLanguagePreview = naturalLanguagePreview
    }

    // Step 6: Store in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileJson: JSON.stringify(profileJson),
        longboardTags: ((profileJson as { expertise?: { domains?: string[] } })?.expertise?.domains?.join(', ')) || '',
        blindspotTags: ((profileJson as { blindspots?: { areas?: string[] } })?.blindspots?.areas?.join(', ')) || '',
        offerTags: ((profileJson as { offerings?: { tangible?: string[] } })?.offerings?.tangible?.join(', ')) || '',
        needTags: ((profileJson as { needs?: { explicit?: string[] } })?.needs?.explicit?.join(', ')) || '',
        cooperationPref: ((profileJson as { collaboration?: { prefers?: string[] } })?.collaboration?.prefers?.join(', ')) || '',
      },
    })

    console.log('Avatar profile auto-generated successfully')
  } catch (error) {
    console.error('Auto profile generation error:', error)
  }
}
