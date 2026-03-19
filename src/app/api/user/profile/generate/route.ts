import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
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

interface ProfileJson {
  personality: {
    traits: string[]
    communicationStyle: string
    emotionalPattern: string
  }
  expertise: {
    domains: string[]
    depthLevels: Record<string, string>
    certifications: string[]
  }
  blindspots: {
    areas: string[]
    descriptions: string
  }
  collaboration: {
    prefers: string[]
    avoids: string[]
    minCollaborationUnit: string
  }
  needs: {
    explicit: string[]
    latent: string[]
  }
  offerings: {
    tangible: string[]
    intangible: string[]
  }
  naturalLanguagePreview?: string
  meta: {
    confidence: number
    generatedAt: string
    dataFreshness: string
    dataSources: string[]
    basedOnSessionsCount: number
    basedOnMessagesCount: number
    oldestDataPoint: string
  }
}

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

    // Step 1: Parallel fetch all user data
    const dataFetchResult = await fetchAllUserData(user.accessToken)

    // Step 2: Select and compress sessions
    const selectedSessions: SelectedSession[] = dataFetchResult.sessions.status === 'success'
      ? await fetchAndCompressSessions(user.accessToken, dataFetchResult.sessions.data)
      : []

    // Count total messages
    const basedOnMessagesCount = selectedSessions.reduce(
      (sum, s) => sum + s.messages.length,
      0
    )

    // Find oldest data point
    let oldestDataPoint = new Date().toISOString()
    if (dataFetchResult.softmemory.status === 'success' && dataFetchResult.softmemory.data.length > 0) {
      // SoftMemory doesn't have createdAt, use current date as approximation
      oldestDataPoint = new Date().toISOString()
    }

    // Step 3: Build prompt data
    const username = user.nickname || dataFetchResult.userInfo.data?.name || '用户'
    const promptData: ProfilePromptData = {
      username,
      userInfo: dataFetchResult.userInfo,
      shades: {
        ...dataFetchResult.shades,
        count: dataFetchResult.shades.data.length,
      },
      softmemory: {
        ...dataFetchResult.softmemory,
        count: dataFetchResult.softmemory.data.length,
      },
      sessions: {
        ...dataFetchResult.sessions,
        count: dataFetchResult.sessions.data.length,
      },
      selectedSessions,
    }

    // Step 4: Call act/stream
    const prompt = assemblePrompt(promptData)
    const actResult = await callActStream(user.accessToken, prompt)

    let profileJson: ProfileJson | null = null
    let naturalLanguagePreview: string | undefined = undefined

    if (actResult.success && actResult.content) {
      const parsed = parseProfileJson(actResult.content)
      if (parsed) {
        profileJson = parsed as unknown as ProfileJson
      }
    }

    // Step 5: Fallback to chat/stream if act/stream failed or JSON parsing failed
    if (!profileJson) {
      const fallbackPrompt = assembleChatFallbackPrompt(username)
      const chatResult = await callChatStreamFallback(user.accessToken, fallbackPrompt)
      if (chatResult.success && chatResult.content) {
        naturalLanguagePreview = chatResult.content
      }
    }

    // If still no structured profile, create a minimal one
    if (!profileJson) {
      profileJson = createMinimalProfile(username, dataFetchResult)
      if (naturalLanguagePreview) {
        profileJson.naturalLanguagePreview = naturalLanguagePreview
      }
    } else if (naturalLanguagePreview && !profileJson.naturalLanguagePreview) {
      profileJson.naturalLanguagePreview = naturalLanguagePreview
    }

    // Step 6: Set meta information
    const now = new Date().toISOString()
    profileJson.meta = {
      confidence: profileJson.meta?.confidence || calculateDefaultConfidence(dataFetchResult),
      generatedAt: now,
      dataFreshness: now,
      dataSources: collectDataSources(dataFetchResult),
      basedOnSessionsCount: selectedSessions.length,
      basedOnMessagesCount,
      oldestDataPoint,
    }

    // Step 7: Store in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileJson: JSON.stringify(profileJson),
        // Also update flat fields for compatibility
        longboardTags: profileJson.expertise?.domains?.join(', ') || '',
        blindspotTags: profileJson.blindspots?.areas?.join(', ') || '',
        offerTags: profileJson.offerings?.tangible?.join(', ') || '',
        needTags: profileJson.needs?.explicit?.join(', ') || '',
        cooperationPref: profileJson.collaboration?.prefers?.join(', ') || '',
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        profile: profileJson,
        message: '画像已重新生成',
      },
    })
  } catch (error) {
    console.error('Generate profile error:', error)
    return NextResponse.json({ code: 500, message: '生成画像失败', data: null })
  }
}

function createMinimalProfile(
  username: string,
  dataFetchResult: Awaited<ReturnType<typeof fetchAllUserData>>
): ProfileJson {
  return {
    personality: {
      traits: [],
      communicationStyle: '未知',
      emotionalPattern: '未知',
    },
    expertise: {
      domains: [],
      depthLevels: {},
      certifications: [],
    },
    blindspots: {
      areas: [],
      descriptions: '暂无数据',
    },
    collaboration: {
      prefers: [],
      avoids: [],
      minCollaborationUnit: '未知',
    },
    needs: {
      explicit: [],
      latent: [],
    },
    offerings: {
      tangible: [],
      intangible: [],
    },
    meta: {
      confidence: 0,
      generatedAt: new Date().toISOString(),
      dataFreshness: new Date().toISOString(),
      dataSources: [],
      basedOnSessionsCount: 0,
      basedOnMessagesCount: 0,
      oldestDataPoint: new Date().toISOString(),
    },
  }
}

function calculateDefaultConfidence(
  dataFetchResult: Awaited<ReturnType<typeof fetchAllUserData>>
): number {
  let score = 0.3 // Base score

  if (dataFetchResult.userInfo.status === 'success') score += 0.15
  if (dataFetchResult.shades.status === 'success' && dataFetchResult.shades.data.length > 0) score += 0.2
  if (dataFetchResult.softmemory.status === 'success' && dataFetchResult.softmemory.data.length > 0) score += 0.15
  if (dataFetchResult.sessions.status === 'success' && dataFetchResult.sessions.data.length > 0) score += 0.2

  return Math.min(score, 1)
}

function collectDataSources(
  dataFetchResult: Awaited<ReturnType<typeof fetchAllUserData>>
): string[] {
  const sources: string[] = []
  if (dataFetchResult.userInfo.status === 'success') sources.push('user.info')
  if (dataFetchResult.shades.status === 'success') sources.push('shades')
  if (dataFetchResult.softmemory.status === 'success') sources.push('softmemory')
  if (dataFetchResult.sessions.status === 'success') sources.push('chat')
  return sources
}
