import { UserInfo, Shade, SoftMemory, SelectedSession } from './profile-data'

export interface ProfilePromptData {
  username: string
  userInfo: { data: UserInfo | null; status: 'success' | 'failed'; error?: string }
  shades: { data: Shade[]; status: 'success' | 'failed'; error?: string; count: number }
  softmemory: { data: SoftMemory[]; status: 'success' | 'failed'; error?: string; count: number }
  sessions: { data: { sessionId: string; lastMessage?: string; messageCount?: number; updatedAt?: string }[]; status: 'success' | 'failed'; error?: string; count: number }
  selectedSessions: SelectedSession[]
}

export function buildDataAvailabilityDeclaration(
  userInfo: ProfilePromptData['userInfo'],
  shades: ProfilePromptData['shades'],
  softmemory: ProfilePromptData['softmemory'],
  sessions: ProfilePromptData['sessions']
): string {
  const parts: string[] = []

  if (userInfo.status === 'failed') {
    parts.push(`- user/info: 获取失败 (${userInfo.error})`)
  } else {
    parts.push(`- user/info: ✓ 获取成功`)
  }

  if (shades.status === 'failed') {
    parts.push(`- user/shades: 获取失败 (${shades.error})`)
  } else {
    parts.push(`- user/shades: ✓ 获取成功 (共 ${shades.count} 条)`)
  }

  if (softmemory.status === 'failed') {
    parts.push(`- user/softmemory: ⚠️ 获取失败，请基于其他数据推断 (${softmemory.error})`)
  } else {
    parts.push(`- user/softmemory: ✓ 获取成功 (共 ${softmemory.count} 条)`)
  }

  if (sessions.status === 'failed') {
    parts.push(`- chat/sessions: ⚠️ 获取失败 (${sessions.error})`)
  } else {
    parts.push(`- chat/sessions: ✓ 获取成功 (共 ${sessions.count} 条，选 ${selectedSessionsCount(sessions.data)} 条代表性会话)`)
  }

  return parts.join('\n')
}

function selectedSessionsCount(sessions: { sessionId: string }[]): number {
  return sessions.length
}

export function buildUserInfoSection(userInfo: { data: UserInfo | null }): string {
  if (!userInfo.data) return '- 昵称: 未知\n- 简介: (无)\n- 自我介绍: (无)'

  const { name, bio, selfIntroduction } = userInfo.data
  return [
    `- 昵称: ${name || '未知'}`,
    `- 简介: ${bio || '(无)'}`,
    `- 自我介绍: ${selfIntroduction || '(无)'}`,
  ].join('\n')
}

export function buildShadesSection(shades: { data: Shade[] }): string {
  if (!shades.data || shades.data.length === 0) {
    return '暂无兴趣标签数据'
  }

  return shades.data
    .map((shade, idx) => {
      const lines = [`${idx + 1}. ${shade.shadeName}`]
      if (shade.confidenceLevel) lines.push(`   置信度: ${shade.confidenceLevel}`)
      if (shade.shadeDescription) lines.push(`   描述: ${shade.shadeDescription}`)
      return lines.join('\n')
    })
    .join('\n')
}

export function buildSoftMemorySection(softmemory: { data: SoftMemory[] }): string {
  if (!softmemory.data || softmemory.data.length === 0) {
    return '(无软记忆数据)'
  }

  return softmemory.data.map(m => `- ${m.factContent}`).join('\n')
}

export function buildSessionsSection(sessions: SelectedSession[]): string {
  if (!sessions || sessions.length === 0) {
    return '(无会话数据)'
  }

  return sessions
    .map((session, idx) => {
      const lines = [
        `会话「${session.lastMessage?.slice(0, 20) || '无标题'}...」`,
        `(消息数: ${session.messages.length}, 最近消息: ${session.lastMessage?.slice(0, 30) || '无'}...)`,
        `摘要: ${session.compressedSummary}`,
      ]
      return lines.join('\n')
    })
    .join('\n\n')
}

export function assemblePrompt(data: ProfilePromptData): string {
  const availability = buildDataAvailabilityDeclaration(
    data.userInfo,
    data.shades,
    data.softmemory,
    data.sessions
  )

  const prompt = `你是【${data.username}】的 AI 分身画像分析师。请根据提供的用户数据，生成该用户的分身画像。

【数据可用性声明】
${availability}

【用户基本信息】
${buildUserInfoSection(data.userInfo)}

【兴趣标签】(共 ${data.shades.count} 条)
${buildShadesSection(data.shades)}

【软记忆】(共 ${data.softmemory.count} 条)
${buildSoftMemorySection(data.softmemory)}

【对话摘要】(选 ${data.selectedSessions.length} 条代表性会话)
${buildSessionsSection(data.selectedSessions)}

【输出要求】
1. 严格输出 JSON 格式，不输出任何其他内容
2. confidence 由你根据数据完整度综合判断(0-1)
3. blindspots 是你推断的用户认知盲区，需具体且有洞察力
4. naturalLanguagePreview 用第一人称写 200-300 字自我介绍

【JSON 输出格式】
{
  "personality": {
    "traits": ["string"],
    "communicationStyle": "string",
    "emotionalPattern": "string"
  },
  "expertise": {
    "domains": ["string"],
    "depthLevels": { "domain": "level" },
    "certifications": ["string"]
  },
  "blindspots": {
    "areas": ["string"],
    "descriptions": "string"
  },
  "collaboration": {
    "prefers": ["string"],
    "avoids": ["string"],
    "minCollaborationUnit": "string"
  },
  "needs": {
    "explicit": ["string"],
    "latent": ["string"]
  },
  "offerings": {
    "tangible": ["string"],
    "intangible": ["string"]
  },
  "naturalLanguagePreview": "string (200-300字第一人称)",
  "meta": {
    "confidence": "number (0-1)",
    "generatedAt": "ISO8601",
    "dataFreshness": "ISO8601",
    "dataSources": ["string"],
    "basedOnSessionsCount": "number",
    "basedOnMessagesCount": "number",
    "oldestDataPoint": "ISO8601"
  }
}`

  return prompt
}

export function assembleChatFallbackPrompt(username: string): string {
  return `你是【${username}】的 AI 分身。请用第一人称写一段 200-300 字的自我介绍，描述自己的长板、短板和合作偏好。直接输出文字，不要输出任何其他内容。`
}
