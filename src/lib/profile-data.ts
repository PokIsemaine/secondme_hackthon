import { callSecondMeApi } from './auth'

export interface UserInfo {
  userId: string
  name?: string
  avatar?: string
  bio?: string
  selfIntroduction?: string
  profileCompleteness?: number
}

export interface Shade {
  shadeName: string
  confidenceLevel?: string
  shadeDescription?: string
}

export interface SoftMemory {
  factObject: string
  factContent: string
}

export interface Session {
  sessionId: string
  lastMessage?: string
  messageCount?: number
  updatedAt?: string
}

export interface Message {
  role: string
  content: string
  createdAt?: string
}

export interface DataFetchResult {
  userInfo: { data: UserInfo | null; status: 'success' | 'failed'; error?: string }
  shades: { data: Shade[]; status: 'success' | 'failed'; error?: string }
  softmemory: { data: SoftMemory[]; status: 'success' | 'failed'; error?: string }
  sessions: { data: Session[]; status: 'success' | 'failed'; error?: string }
}

export interface SelectedSession extends Session {
  compressedSummary: string
  messages: Message[]
}

const FETCH_TIMEOUT = 10000 // 10 seconds timeout

async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = FETCH_TIMEOUT
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
    ),
  ])
}

export async function fetchAllUserData(accessToken: string): Promise<DataFetchResult> {
  const [infoResult, shadesResult, softmemoryResult, sessionsResult] = await Promise.allSettled([
    fetchUserInfo(accessToken),
    fetchShades(accessToken),
    fetchSoftmemory(accessToken),
    fetchSessions(accessToken),
  ])

  return {
    userInfo: infoResult.status === 'fulfilled' ? infoResult.value : { data: null, status: 'failed' as const, error: 'Promise rejected' },
    shades: shadesResult.status === 'fulfilled' ? shadesResult.value : { data: [] as Shade[], status: 'failed' as const, error: 'Promise rejected' },
    softmemory: softmemoryResult.status === 'fulfilled' ? softmemoryResult.value : { data: [] as SoftMemory[], status: 'failed' as const, error: 'Promise rejected' },
    sessions: sessionsResult.status === 'fulfilled' ? sessionsResult.value : { data: [] as Session[], status: 'failed' as const, error: 'Promise rejected' },
  }
}

async function fetchUserInfo(accessToken: string): Promise<{ data: UserInfo | null; status: 'success' | 'failed'; error?: string }> {
  try {
    const response = await callSecondMeApi<{ code: number; data: UserInfo }>(
      '/api/secondme/user/info',
      accessToken
    )
    if (response.code === 0 && response.data) {
      return { data: response.data, status: 'success' }
    }
    return { data: null, status: 'failed', error: `API returned code ${response.code}` }
  } catch (error) {
    return { data: null, status: 'failed', error: String(error) }
  }
}

async function fetchShades(accessToken: string): Promise<{ data: Shade[]; status: 'success' | 'failed'; error?: string }> {
  try {
    const response = await callSecondMeApi<{ code: number; data: { shades: Shade[] } }>(
      '/api/secondme/user/shades',
      accessToken
    )
    if (response.code === 0 && response.data?.shades) {
      return { data: response.data.shades, status: 'success' }
    }
    return { data: [], status: 'failed', error: `API returned code ${response.code}` }
  } catch (error) {
    return { data: [], status: 'failed', error: String(error) }
  }
}

async function fetchSoftmemory(accessToken: string): Promise<{ data: SoftMemory[]; status: 'success' | 'failed'; error?: string }> {
  try {
    const response = await callSecondMeApi<{ code: number; data: { list: SoftMemory[] } }>(
      '/api/secondme/user/softmemory?pageSize=20',
      accessToken
    )
    if (response.code === 0 && response.data?.list) {
      return { data: response.data.list, status: 'success' }
    }
    return { data: [], status: 'failed', error: `API returned code ${response.code}` }
  } catch (error) {
    return { data: [], status: 'failed', error: String(error) }
  }
}

async function fetchSessions(accessToken: string): Promise<{ data: Session[]; status: 'success' | 'failed'; error?: string }> {
  try {
    const response = await callSecondMeApi<{ code: number; data: { sessions: Session[] } }>(
      '/api/secondme/chat/session/list',
      accessToken
    )
    if (response.code === 0 && response.data?.sessions) {
      return { data: response.data.sessions, status: 'success' }
    }
    return { data: [], status: 'failed', error: `API returned code ${response.code}` }
  } catch (error) {
    return { data: [], status: 'failed', error: String(error) }
  }
}

export function selectSessions(sessions: Session[]): Session[] {
  if (sessions.length === 0) return []
  if (sessions.length === 1) return [sessions[0]]

  // Sort by updatedAt descending for recent
  const sortedByRecent = [...sessions].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return dateB - dateA
  })

  // Sort by messageCount descending for longest
  const sortedByLongest = [...sessions].sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))

  // Get recent 2 (avoiding duplicates)
  const recent2 = sortedByRecent.slice(0, 2)

  // Get longest 2 (avoiding duplicates with recent)
  const recentIds = new Set(recent2.map(s => s.sessionId))
  const longest2 = sortedByLongest.filter(s => !recentIds.has(s.sessionId)).slice(0, 2)

  // Combine and deduplicate
  const combined = [...recent2]
  for (const s of longest2) {
    if (!recentIds.has(s.sessionId)) {
      combined.push(s)
    }
  }

  return combined
}

export function compressMessages(messages: Message[]): string {
  if (messages.length === 0) return ''
  if (messages.length === 1) return `用户: ${messages[0].content.slice(0, 100)}`

  // Find first user message and first assistant response
  const userMsg = messages.find(m => m.role === 'user')
  const assistantMsg = messages.find(m => m.role === 'assistant')

  if (userMsg && assistantMsg) {
    return `用户问: ${userMsg.content.slice(0, 80)}${userMsg.content.length > 80 ? '...' : ''} | AI答: ${assistantMsg.content.slice(0, 80)}${assistantMsg.content.length > 80 ? '...' : ''}`
  }

  if (userMsg) {
    return `用户问: ${userMsg.content.slice(0, 100)}${userMsg.content.length > 100 ? '...' : ''}`
  }

  return messages[0].content.slice(0, 100)
}

export async function fetchSessionMessages(
  accessToken: string,
  sessionId: string
): Promise<{ messages: Message[]; status: 'success' | 'failed'; error?: string }> {
  try {
    const response = await callSecondMeApi<{ code: number; data: { messages: Message[] } }>(
      `/api/secondme/chat/session/messages?sessionId=${sessionId}`,
      accessToken
    )
    if (response.code === 0 && response.data?.messages) {
      return { messages: response.data.messages, status: 'success' }
    }
    return { messages: [], status: 'failed', error: `API returned code ${response.code}` }
  } catch (error) {
    return { messages: [], status: 'failed', error: String(error) }
  }
}

export async function fetchAndCompressSessions(
  accessToken: string,
  sessions: Session[]
): Promise<SelectedSession[]> {
  const selected = selectSessions(sessions)
  const results = await Promise.all(
    selected.map(async (session) => {
      const { messages, status, error } = await fetchSessionMessages(accessToken, session.sessionId)
      const compressedSummary = status === 'success' ? compressMessages(messages) : `获取失败: ${error}`
      return {
        ...session,
        compressedSummary,
        messages: status === 'success' ? messages : [],
      }
    })
  )
  return results
}
