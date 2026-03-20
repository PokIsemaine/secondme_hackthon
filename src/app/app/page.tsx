'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BioRenderer from '@/components/BioRenderer'
import { useRouter } from 'next/navigation'

// 类型定义
interface ProfileData {
  nickname?: string
  shades?: string[]
  soft_memories?: string[]
  bio?: string
  has_profile?: boolean
  profile?: {
    naturalLanguagePreview?: string
    meta?: { confidence?: number; generatedAt?: string; basedOnSessionsCount?: number }
  }
}

interface CirclePost {
  pin_id: string
  content: string
  author_name: string
  publish_time: number
  like_num: number
  comment_num: number
  ringName?: string
  topic?: string
  title?: string
}

interface RingMeta {
  name: string
  ringId: string
  memberCount: number
}

interface MatchResult {
  post: CirclePost
  matchScore: number
  matchReason: string
  complementType?: string
}

interface NegotiationRound {
  roundNumber: number
  speaker: string
  summary: string
  content?: string
}

interface NegotiationResult {
  consensus: string
  recommendedForm: string
  recommendedDuration: string
  shouldContinue: boolean
}

const STEPS = [
  { name: '我的画像', key: 'profile' },
  { name: '发现内容', key: 'discover' },
  { name: 'AI 匹配', key: 'match' },
  { name: '协商过程', key: 'negotiate' },
  { name: '提案结果', key: 'proposal' },
]

const RING_IDS = [
  '2001009660925334090',
  '2015023739549529606',
]

export default function AppPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [posts, setPosts] = useState<CirclePost[]>([])
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0)
  const [negotiationRounds, setNegotiationRounds] = useState<NegotiationRound[]>([])
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null)
  const [streamingRounds, setStreamingRounds] = useState<NegotiationRound[]>([])
  const [ringStyles, setRingStyles] = useState<Record<string, { bg: string; text: string }>>({})

  const [ringPosts, setRingPosts] = useState<Record<string, CirclePost[]>>({})
  const [ringLoading, setRingLoading] = useState<Record<string, boolean>>({})
  const [ringErrors, setRingErrors] = useState<Record<string, string>>({})
  const [ringMeta, setRingMeta] = useState<Record<string, RingMeta>>({})

  const [loadingStep, setLoadingStep] = useState<string | null>(null)

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (data.code !== 0) {
        router.push('/demo')
        return
      }
      if (data.data) {
        setProfile(data.data)
        if (!data.data.has_profile || !data.data.profile?.naturalLanguagePreview) {
          triggerAutoGenerate()
        }
      }
    } catch (e) {
      console.error('Check login error:', e)
      router.push('/demo')
    } finally {
      setLoading(false)
    }
  }

  const triggerAutoGenerate = async () => {
    setIsAutoGenerating(true)
    try {
      const res = await fetch('/api/user/profile', { method: 'POST' })
      const data = await res.json()
      if (data.code === 0) {
        setProfile(data.data)
      }
    } catch (e) {
      console.error('Auto generate error:', e)
    } finally {
      setIsAutoGenerating(false)
    }
  }

  const loadProfile = async () => {
    setLoadingStep('profile')
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (data.code === 0) {
        setProfile(data.data)
      }
    } catch (e) {
      console.error('Load profile error:', e)
    } finally {
      setLoadingStep(null)
    }
  }

  const refreshProfile = async () => {
    setLoadingStep('profile')
    try {
      const res = await fetch('/api/user/profile', { method: 'POST' })
      const data = await res.json()
      if (data.code === 0) {
        setProfile(data.data)
        alert('画像刷新成功！')
      } else {
        alert(data.message || '刷新失败')
      }
    } catch (e) {
      console.error('Refresh profile error:', e)
      alert('刷新失败，请重试')
    } finally {
      setLoadingStep(null)
    }
  }

  const loadCircleContent = async () => {
    setLoadingStep('discover')

    const initialLoading: Record<string, boolean> = {}
    const initialErrors: Record<string, string> = {}
    RING_IDS.forEach(id => {
      initialLoading[id] = true
      initialErrors[id] = ''
    })
    setRingLoading(initialLoading)
    setRingErrors(initialErrors)

    try {
      const results = await Promise.allSettled(
        RING_IDS.map(ringId =>
          fetch(`/api/zhihu/ring?ring_id=${ringId}&page_num=1&page_size=10`).then(res => res.json())
        )
      )

      const allPosts: CirclePost[] = []
      const ringColors = [
        { bg: 'bg-blue-100', text: 'text-blue-700' },
        { bg: 'bg-purple-100', text: 'text-purple-700' },
      ]
      const newRingPosts: Record<string, CirclePost[]> = {}
      const newRingMeta: Record<string, RingMeta> = {}
      const newStyles: Record<string, { bg: string; text: string }> = {}
      const newLoading: Record<string, boolean> = {}
      const newErrors: Record<string, string> = {}
      let styleIdx = 0

      for (const ringId of RING_IDS) {
        newLoading[ringId] = false
        newErrors[ringId] = ''
      }

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.code === 0) {
          const ringName = result.value.data?.ring_info?.ring_name || ''
          const ringId = result.value.data?.ring_info?.ring_id || ''
          const membershipNum = result.value.data?.ring_info?.membership_num || 0
          const postsData = result.value.data?.contents || []

          if (ringName && ringId) {
            const color = ringColors[styleIdx % ringColors.length]
            newStyles[ringName] = color
            newRingMeta[ringId] = { name: ringName, ringId, memberCount: membershipNum }
            newRingPosts[ringId] = (postsData as CirclePost[]).map(p => ({ ...p, ringName }))
            allPosts.push(...newRingPosts[ringId])
            styleIdx++
          }
        } else if (result.status === 'rejected') {
          const ringId = RING_IDS[results.indexOf(result)]
          newErrors[ringId] = '加载失败，请重试'
          newLoading[ringId] = false
          console.error('Circle fetch rejected:', result.reason)
        } else if (result.status === 'fulfilled' && result.value.code !== 0) {
          const ringId = RING_IDS[results.indexOf(result)]
          newErrors[ringId] = result.value.message || '加载失败，请重试'
          newLoading[ringId] = false
          console.error('Circle fetch error:', result.value.message)
        }
      }

      setRingStyles(newStyles)
      setRingMeta(newRingMeta)
      setRingPosts(newRingPosts)
      setRingLoading(newLoading)
      setRingErrors(newErrors)

      const uniquePosts = allPosts.filter((post, idx, arr) =>
        arr.findIndex(p => p.pin_id === post.pin_id) === idx
      )
      setPosts(uniquePosts)
    } catch (e) {
      console.error('Load circle error:', e)
    } finally {
      setLoadingStep(null)
    }
  }

  const refreshRing = async (ringId: string) => {
    setRingLoading(prev => ({ ...prev, [ringId]: true }))
    setRingErrors(prev => ({ ...prev, [ringId]: '' }))

    try {
      const res = await fetch(`/api/zhihu/ring?ring_id=${ringId}&page_num=1&page_size=10`)
      const data = await res.json()

      if (data.code === 0) {
        const ringName = data.data?.ring_info?.ring_name || ''
        const postsData = data.data?.contents || []
        const memberCount = data.data?.ring_info?.membership_num || 0

        setRingPosts(prev => ({
          ...prev,
          [ringId]: (postsData as CirclePost[]).map(p => ({ ...p, ringName })),
        }))
        setRingMeta(prev => ({
          ...prev,
          [ringId]: { name: ringName, ringId, memberCount },
        }))
        setRingErrors(prev => ({ ...prev, [ringId]: '' }))
      } else {
        setRingErrors(prev => ({ ...prev, [ringId]: data.message || '加载失败，请重试' }))
      }
    } catch (e) {
      console.error('Refresh ring error:', e)
      setRingErrors(prev => ({ ...prev, [ringId]: '加载失败，请重试' }))
    } finally {
      setRingLoading(prev => ({ ...prev, [ringId]: false }))
    }
  }

  const runAIMatch = async () => {
    setLoadingStep('match')

    if (!profile || posts.length === 0) {
      alert('请先完成画像和圈子内容加载')
      setLoadingStep(null)
      return
    }

    const allPosts: CirclePost[] = Object.values(ringPosts).flat()

    try {
      const res = await fetch('/api/circle/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            shades: profile.shades || [],
            soft_memories: profile.soft_memories || [],
            bio: profile.bio,
          },
          posts: allPosts.map(p => ({
            pin_id: p.pin_id,
            content: p.content,
            author_name: p.author_name,
            ringName: p.ringName,
          })),
        }),
      })
      const data = await res.json()

      if (data.code === 0 && data.data?.matches) {
        setMatches(data.data.matches)
      } else {
        alert(data.message || 'AI 匹配失败')
      }
    } catch (e) {
      console.error('Match error:', e)
      alert('网络错误')
    } finally {
      setLoadingStep(null)
    }
  }

  const runNegotiation = async () => {
    setLoadingStep('negotiate')

    if (matches.length === 0) {
      alert('请先完成 AI 匹配')
      setLoadingStep(null)
      return
    }

    const targetPost = matches[selectedMatchIndex].post

    let candidateData = {
      estimatedStrengths: '',
      estimatedNeeds: '',
      estimatedOffers: '',
      communicationStyle: '',
    }
    try {
      const candidateRes = await fetch('/api/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetToken: targetPost.pin_id,
          posts: [{ content: targetPost.content, author: targetPost.author_name }],
        }),
      })
      const candidateJson = await candidateRes.json()
      if (candidateJson.code === 0 && candidateJson.data) {
        candidateData = {
          estimatedStrengths: candidateJson.data.estimatedStrengths || '',
          estimatedNeeds: candidateJson.data.estimatedNeeds || '',
          estimatedOffers: candidateJson.data.estimatedOffers || '',
          communicationStyle: candidateJson.data.communicationStyle || '',
        }
      }
    } catch (e) {
      console.error('Candidate API error:', e)
    }

    try {
      const createRes = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${targetPost.author_name} 的讨论互补分析`,
          peerProxyData: {
            authorName: targetPost.author_name,
            postContent: targetPost.content,
            ringName: targetPost.ringName,
            topic: targetPost.topic || targetPost.title || `${targetPost.author_name} 的讨论`,
            estimatedStrengths: candidateData.estimatedStrengths,
            estimatedNeeds: candidateData.estimatedNeeds,
            estimatedOffers: candidateData.estimatedOffers,
            communicationStyle: candidateData.communicationStyle,
          },
        }),
      })
      const createData = await createRes.json()

      if (createData.code !== 0) {
        throw new Error(createData.message)
      }

      const sessionId = createData.data.sessionId

      setStreamingRounds([])
      setNegotiationRounds([])
      setNegotiationResult(null)

      const streamRes = await fetch(`/api/negotiation/${sessionId}/stream`)
      const reader = streamRes.body?.getReader()
      if (!reader) throw new Error('Cannot read stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') continue
            try {
              const data = JSON.parse(dataStr)

              if (data.type === 'result') {
                setNegotiationResult({
                  consensus: data.consensus || '',
                  recommendedForm: data.recommendedForm || '',
                  recommendedDuration: data.recommendedDuration || '',
                  shouldContinue: data.shouldContinue ?? true,
                })
              } else if (data.type === 'error') {
                console.error('Stream error:', data.message)
              } else if (data.done === true) {
                setStreamingRounds(prev => {
                  const existing = prev.find(r => r.roundNumber === data.round)
                  if (existing) {
                    return prev.map(r => r.roundNumber === data.round ? { ...r, summary: data.summary } : r)
                  } else {
                    return [...prev, { roundNumber: data.round, speaker: data.speaker, summary: data.summary }]
                  }
                })
              } else if (data.done === false && data.content) {
                setStreamingRounds(prev => {
                  const existing = prev.find(r => r.roundNumber === data.round)
                  if (existing) {
                    return prev.map(r =>
                      r.roundNumber === data.round
                        ? { ...r, content: (r.content || '') + data.content }
                        : r
                    )
                  } else {
                    return [...prev, { roundNumber: data.round, speaker: data.speaker, summary: '', content: data.content }]
                  }
                })
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      const finalRounds = await fetch(`/api/negotiation/${sessionId}`)
        .then(r => r.json())
        .then(d => d.data?.rounds || [])
      setNegotiationRounds(finalRounds)
      setStreamingRounds([])
    } catch (e) {
      console.error('Negotiation error:', e)
      alert('协商失败，请重试')
    } finally {
      setLoadingStep(null)
    }
  }

  const acceptProposal = async () => {
    setLoadingStep('proposal')
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextToken: matches[selectedMatchIndex]?.post.pin_id,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        alert('提案已创建！')
      }
    } catch (e) {
      console.error('Proposal error:', e)
    } finally {
      setLoadingStep(null)
    }
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  const handleStepChange = async (step: number) => {
    setCurrentStep(step)

    switch (step) {
      case 0:
        if (!profile) await loadProfile()
        break
      case 1:
        if (Object.keys(ringPosts).length === 0) await loadCircleContent()
        break
      case 2:
        if (matches.length === 0) await runAIMatch()
        break
      case 3:
        if (negotiationRounds.length === 0) await runNegotiation()
        break
      case 4:
        break
    }
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() / 1000 - timestamp
    const hours = Math.floor(diff / 3600)
    if (hours > 24) return `${Math.floor(hours / 24)}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">正在加载...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">认知盲区拼图</h1>
          <div className="flex items-center gap-4">
            {profile?.nickname && (
              <span className="text-sm text-gray-600">{profile.nickname}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8 flex-wrap gap-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => handleStepChange(i)}
                disabled={!!loadingStep}
                className={`px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 ${
                  currentStep === i
                    ? 'bg-blue-600 text-white'
                    : currentStep > i
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {currentStep > i ? '✓' : i + 1}. {step.name}
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-0.5 bg-gray-300 mx-1"></div>}
            </div>
          ))}
        </div>

        {loadingStep && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700">正在加载...</span>
          </div>
        )}

        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">我的互补画像</h2>
              <button
                onClick={refreshProfile}
                disabled={!!loadingStep}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {loadingStep === 'profile' ? '刷新中...' : '刷新'}
              </button>
            </div>
            {profile && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {profile.nickname?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.nickname || '用户'}</h3>
                  </div>
                </div>

                {profile.shades && profile.shades.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">擅长领域</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.shades.map((shade, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {shade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.soft_memories && profile.soft_memories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">个人特点</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.soft_memories.map((mem, i) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {mem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.profile?.naturalLanguagePreview && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">AI 分身自我介绍</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {profile.profile.naturalLanguagePreview}
                    </p>
                    {profile.profile.meta && (
                      <p className="text-xs text-gray-400 mt-2">
                        可信度: {Math.round((profile.profile.meta.confidence || 0) * 100)}% |
                        基于 {profile.profile.meta.basedOnSessionsCount || 0} 个会话生成
                      </p>
                    )}
                  </div>
                )}

                {isAutoGenerating && !profile.profile?.naturalLanguagePreview && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm font-medium text-blue-700">
                        {pollCount === 0 ? 'AI 分身正在分析你的数据，稍等...' : `仍在分析中...（第 ${pollCount}/10 次）`}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      首次登录需要一点时间生成个性化画像
                    </p>
                  </div>
                )}

                {!isAutoGenerating && !profile.profile?.naturalLanguagePreview && !profile.has_profile && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                    还没有分身画像，点击「刷新」让 AI 分身基于你的数据生成个性化画像
                  </div>
                )}

                {profile.bio && (
                  <div>
                    <BioRenderer bio={profile.bio} />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => handleStepChange(1)}
              disabled={!profile || !!loadingStep}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              发现互补内容 →
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">知乎圈子动态</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RING_IDS.map(ringId => {
                const meta = ringMeta[ringId]
                const ringPostsList = ringPosts[ringId] || []
                const isLoading = ringLoading[ringId] ?? false
                const error = ringErrors[ringId] || ''
                const ringName = meta?.name || ringId
                const styles = ringStyles[ringName] || { bg: 'bg-gray-100', text: 'text-gray-700' }

                return (
                  <div key={ringId} className="flex flex-col border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles.bg} ${styles.text}`}>
                          {ringName}
                        </span>
                        {meta?.memberCount ? (
                          <span className="text-xs text-gray-400">{meta.memberCount} 成员</span>
                        ) : null}
                      </div>
                      <button
                        onClick={() => refreshRing(ringId)}
                        disabled={isLoading}
                        className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <span className={isLoading ? 'animate-spin' : ''}>↻</span>
                        {isLoading ? '刷新中' : '刷新'}
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto" style={{ maxHeight: '480px' }}>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32 gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center h-32 text-sm text-red-500">
                          {error}
                        </div>
                      ) : ringPostsList.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                          该圈子暂无内容
                        </div>
                      ) : (
                        <div className="divide-y">
                          {ringPostsList.map((post) => (
                            <div key={post.pin_id} className="p-3 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-gray-900 text-sm">{post.author_name}</span>
                                <span className="text-xs text-gray-400">{formatTime(post.publish_time)}</span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span>👍 {post.like_num}</span>
                                <span>💬 {post.comment_num}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => handleStepChange(2)}
              disabled={posts.length === 0 || !!loadingStep}
              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              AI 智能匹配 →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">AI 推荐匹配</h2>
            {profile && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">您的画像：</span>
                  {profile.shades?.join('、') || '未设置'}
                </p>
              </div>
            )}

            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedMatchIndex(idx)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMatchIndex === idx
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400 ring-2 ring-blue-200'
                        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {result.complementType && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            result.complementType === '你能帮他们' ? 'bg-green-100 text-green-700' :
                            result.complementType === '他们能帮你' ? 'bg-orange-100 text-orange-700' :
                            result.complementType === '双向互补' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {result.complementType}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{result.post.author_name}</span>
                        {selectedMatchIndex === idx && (
                          <span className="text-xs text-blue-600 font-medium">✓ 已选择</span>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        匹配度 {Math.round(result.matchScore * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{result.post.content}</p>
                    <p className="text-xs text-purple-700 italic">{result.matchReason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loadingStep === 'match' ? 'AI 匹配中...' : '点击上方按钮进行 AI 匹配'}
              </div>
            )}

            <button
              onClick={() => handleStepChange(3)}
              disabled={matches.length === 0 || !!loadingStep}
              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              发起 Agent 协商 →
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Agent 协商室</h2>
              <p className="text-sm text-gray-500 mt-1">
                主题: {matches[selectedMatchIndex]?.post.author_name || '待确定'} 的讨论互补分析
              </p>
            </div>

            {matches[selectedMatchIndex]?.post && (
              <div className="p-4 bg-gray-50 border-b">
                <p className="text-xs text-gray-500 mb-1 font-medium">引用的帖子</p>
                <p className="text-sm text-gray-700 mb-2">{matches[selectedMatchIndex].post.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>👍 {matches[selectedMatchIndex].post.like_num}</span>
                  <span>💬 {matches[selectedMatchIndex].post.comment_num}</span>
                </div>
              </div>
            )}

            {(streamingRounds.length > 0 || negotiationRounds.length > 0) ? (
              <>
                <div className="p-6">
                  <h4 className="font-medium mb-4">
                    {streamingRounds.length > 0 ? '协商进行中 (实时对话)...' : '协商过程'}
                  </h4>
                  <div className="space-y-4">
                    {(streamingRounds.length > 0 ? streamingRounds : negotiationRounds).map((round) => (
                      <div key={round.roundNumber} className="flex gap-4">
                        <div
                          className={`w-3 h-3 rounded-full mt-2 ${
                            round.speaker === 'my_agent' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {round.speaker === 'my_agent' ? '我的 Agent' : (matches[selectedMatchIndex]?.post.author_name || '候选代理')}
                            </span>
                            <span className="text-xs text-gray-400">第 {round.roundNumber} 轮</span>
                            {streamingRounds.find(r => r.roundNumber === round.roundNumber) && (
                              <span className="text-xs text-blue-500 animate-pulse">打字中...</span>
                            )}
                          </div>
                          {round.content && (
                            <p className="text-sm text-gray-800 leading-relaxed">{round.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {negotiationResult && (
                  <div className="p-6 bg-gray-50 border-t">
                    <h4 className="font-medium mb-4">协商结果</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500 mb-1">推荐合作形式</p>
                        <p className="font-medium">{negotiationResult.recommendedForm}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500 mb-1">建议时长</p>
                        <p className="font-medium">{negotiationResult.recommendedDuration}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {loadingStep === 'negotiate' ? 'Agent 协商中...' : '点击上方按钮开始协商'}
              </div>
            )}

            <div className="p-6 border-t flex gap-3 flex-wrap">
              <button
                onClick={() => handleStepChange(4)}
                disabled={negotiationRounds.length === 0 || !!loadingStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                接受提案
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                请求真实协商
              </button>
              <button
                onClick={() => handleStepChange(4)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                放弃
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">提案已接受</h2>
            <p className="text-gray-600 mb-6">
              对方已确认愿意进行 30 分钟问题对焦
              <br />
              请在知乎私信中约定具体时间
            </p>
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
              <h4 className="font-medium mb-2">合作摘要</h4>
              <p className="text-sm text-gray-600">
                {negotiationResult?.consensus || '协商完成'}
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => {
                  setCurrentStep(0)
                  setProfile(null)
                  setPosts([])
                  setMatches([])
                  setNegotiationRounds([])
                  setNegotiationResult(null)
                  checkLoginStatus()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                重新开始
              </button>
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
