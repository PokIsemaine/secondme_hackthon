'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LoginButton from '@/components/LoginButton'
import BioRenderer from '@/components/BioRenderer'
import { useRouter } from 'next/navigation'
import { mockCirclePosts, mockMatchResults, mockNegotiationRounds, mockNegotiationResult } from '@/lib/mock'

// 类型定义
interface ProfileData {
  nickname?: string
  shades?: string[]
  soft_memories?: string[]
  bio?: string
  naturalLanguagePreview?: string
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

// 步骤定义
const STEPS = [
  { name: '我的画像', key: 'profile' },
  { name: '发现内容', key: 'discover' },
  { name: 'AI 匹配', key: 'match' },
  { name: '协商过程', key: 'negotiate' },
  { name: '提案结果', key: 'proposal' },
]

// 支持的圈子 ID 列表
const RING_IDS = [
  '2001009660925334090',
  '2015023739549529606',
]

export default function DemoPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(true) // 演示模式
  const [currentStep, setCurrentStep] = useState(0)

  // 数据状态
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

  // Per-panel state for dual-circle split view
  const [ringPosts, setRingPosts] = useState<Record<string, CirclePost[]>>({})
  const [ringLoading, setRingLoading] = useState<Record<string, boolean>>({})
  const [ringErrors, setRingErrors] = useState<Record<string, string>>({})
  const [ringMeta, setRingMeta] = useState<Record<string, RingMeta>>({})

  // API 加载状态
  const [loadingStep, setLoadingStep] = useState<string | null>(null)

  // 初始化：检测登录状态
  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setIsLoggedIn(data.code === 0)
      if (data.code === 0 && data.data) {
        setProfile(data.data)
        setDemoMode(false)
        // 如果还没有画像或缺少分身自我介绍，自动触发生成 + 轮询
        if (!data.data.has_profile || !data.data.profile?.naturalLanguagePreview) {
          triggerAutoGenerate()
        }
      }
    } catch (e) {
      console.error('Check login error:', e)
    } finally {
      setLoading(false)
    }
  }

  // 触发自动画像生成
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

  // Step 1: 加载用户画像
  const loadProfile = async () => {
    if (demoMode) {
      setProfile({
        nickname: '演示用户',
        shades: ['技术架构判断', '产品结构化', '用户研究'],
        soft_memories: ['擅长技术落地', '有创业经验'],
      })
      return
    }

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

  // 刷新用户画像
  const refreshProfile = async () => {
    if (demoMode) {
      alert('演示模式下无法刷新')
      return
    }

    setLoadingStep('profile')
    try {
      const res = await fetch('/api/user/profile', { method: 'POST' })
      const data = await res.json()
      console.log('[Refresh Profile] Response:', data)
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

  // Step 2: 加载圈子内容
  const loadCircleContent = async () => {
    setLoadingStep('discover')

    if (demoMode) {
      setPosts(mockCirclePosts)
      // Populate ringPosts for demo mode
      const demoRingPosts: Record<string, CirclePost[]> = {}
      const demoRings: RingMeta[] = [
        { name: '产品经理', ringId: '2001009660925334090', memberCount: 0 },
        { name: '互联网职场', ringId: '2015023739549529606', memberCount: 0 },
      ]
      const demoMeta: Record<string, RingMeta> = {}
      const demoStyles: Record<string, { bg: string; text: string }> = {}
      const demoColors = [
        { bg: 'bg-blue-100', text: 'text-blue-700' },
        { bg: 'bg-purple-100', text: 'text-purple-700' },
      ]
      demoRings.forEach((ring, idx) => {
        demoRingPosts[ring.ringId] = (mockCirclePosts as CirclePost[]).filter(p => p.ringName === ring.name)
        demoMeta[ring.ringId] = ring
        demoStyles[ring.name] = demoColors[idx % demoColors.length]
      })
      setRingPosts(demoRingPosts)
      setRingMeta(demoMeta)
      setRingStyles(demoStyles)
      setLoadingStep(null)
      return
    }

    // Initialize all rings as loading
    const initialLoading: Record<string, boolean> = {}
    const initialErrors: Record<string, string> = {}
    RING_IDS.forEach(id => {
      initialLoading[id] = true
      initialErrors[id] = ''
    })
    setRingLoading(initialLoading)
    setRingErrors(initialErrors)

    try {
      // 并行拉取两个圈子的帖子
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
          const posts = result.value.data?.contents || []

          if (ringName && ringId) {
            const color = ringColors[styleIdx % ringColors.length]
            newStyles[ringName] = color
            newRingMeta[ringId] = { name: ringName, ringId, memberCount: membershipNum }
            newRingPosts[ringId] = (posts as CirclePost[]).map(p => ({ ...p, ringName }))
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

      // 按 pin_id 去重
      const uniquePosts = allPosts.filter((post, idx, arr) =>
        arr.findIndex(p => p.pin_id === post.pin_id) === idx
      )
      setPosts(uniquePosts)
    } catch (e) {
      console.error('Load circle error:', e)
      RING_IDS.forEach(id => {
        setRingErrors(prev => ({ ...prev, [id]: '加载失败，请重试' }))
        setRingLoading(prev => ({ ...prev, [id]: false }))
      })
      setPosts(mockCirclePosts)
    } finally {
      setLoadingStep(null)
    }
  }

  // Per-panel refresh: re-fetch a single circle's posts
  const refreshRing = async (ringId: string) => {
    setRingLoading(prev => ({ ...prev, [ringId]: true }))
    setRingErrors(prev => ({ ...prev, [ringId]: '' }))

    try {
      const res = await fetch(`/api/zhihu/ring?ring_id=${ringId}&page_num=1&page_size=10`)
      const data = await res.json()

      if (data.code === 0) {
        const ringName = data.data?.ring_info?.ring_name || ''
        const posts = data.data?.contents || []
        const memberCount = data.data?.ring_info?.membership_num || 0

        setRingPosts(prev => ({
          ...prev,
          [ringId]: (posts as CirclePost[]).map(p => ({ ...p, ringName })),
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

  // Step 3: AI 匹配
  const runAIMatch = async () => {
    setLoadingStep('match')

    if (demoMode) {
      setMatches(mockMatchResults)
      setLoadingStep(null)
      return
    }

    if (!profile || posts.length === 0) {
      alert('请先完成画像和圈子内容加载')
      setLoadingStep(null)
      return
    }

    // Flatten ringPosts back to CirclePost[] for AI match
    const allPosts: CirclePost[] = Object.values(ringPosts).flat()

    try {
      console.log('[AI Match] Starting match request...')
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
      console.log('[AI Match] Response:', data)

      if (data.code === 0 && data.data?.matches) {
        setMatches(data.data.matches)
        console.log('[AI Match] Success, matches:', data.data.matches.length)
      } else {
        // API 返回错误
        console.error('[AI Match] API error:', data)
        alert(data.message || 'AI 匹配失败，已使用演示数据')
        setMatches(mockMatchResults)
      }
    } catch (e) {
      console.error('Match error:', e)
      alert('网络错误，已使用演示数据')
      setMatches(mockMatchResults)
    } finally {
      setLoadingStep(null)
    }
  }

  // Step 4: A2A 协商
  const runNegotiation = async () => {
    setLoadingStep('negotiate')

    if (demoMode) {
      // Demo mode: 模拟流式渲染
      setStreamingRounds([])
      setNegotiationRounds([])
      setNegotiationResult(null)

      for (let i = 0; i < mockNegotiationRounds.length; i++) {
        const mockRound = mockNegotiationRounds[i]
        // 模拟 token 流式到达：每个 round 分段添加
        const words = mockRound.summary.split('')
        let content = ''
        for (let j = 0; j < words.length; j++) {
          content += words[j]
          setStreamingRounds(prev => {
            const existing = prev.find(r => r.roundNumber === mockRound.roundNumber)
            if (existing) {
              return prev.map(r => r.roundNumber === mockRound.roundNumber ? { ...r, content } : r)
            } else {
              return [...prev, { ...mockRound, content }]
            }
          })
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        // Round 完成：显示 summary
        setStreamingRounds(prev => {
          const existing = prev.find(r => r.roundNumber === mockRound.roundNumber)
          if (existing) {
            return prev.map(r => r.roundNumber === mockRound.roundNumber ? { ...r, summary: mockRound.summary } : r)
          } else {
            return [...prev, { ...mockRound, summary: mockRound.summary }]
          }
        })
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      setNegotiationRounds(mockNegotiationRounds)
      setNegotiationResult(mockNegotiationResult)
      setStreamingRounds([])
      setLoadingStep(null)
      return
    }

    if (matches.length === 0) {
      alert('请先完成 AI 匹配')
      setLoadingStep(null)
      return
    }

    const targetPost = matches[selectedMatchIndex].post

    // 调用 candidate API 分析目标帖子
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
      // 创建协商会话
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

      // 流式 SSE 消费
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
                // 协商完成：设置最终结果
                setNegotiationResult({
                  consensus: data.consensus || '',
                  recommendedForm: data.recommendedForm || '',
                  recommendedDuration: data.recommendedDuration || '',
                  shouldContinue: data.shouldContinue ?? true,
                })
              } else if (data.type === 'error') {
                console.error('Stream error:', data.message)
              } else if (data.done === true) {
                // Round 完成：更新 summary
                setStreamingRounds(prev => {
                  const existing = prev.find(r => r.roundNumber === data.round)
                  if (existing) {
                    return prev.map(r => r.roundNumber === data.round ? { ...r, summary: data.summary } : r)
                  } else {
                    return [...prev, { roundNumber: data.round, speaker: data.speaker, summary: data.summary }]
                  }
                })
              } else if (data.done === false && data.content) {
                // Token 到达：追加 content
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

      // SSE 结束后，获取完整的 rounds
      const finalRounds = await fetch(`/api/negotiation/${sessionId}`)
        .then(r => r.json())
        .then(d => d.data?.rounds || [])
      setNegotiationRounds(finalRounds)
      setStreamingRounds([])
    } catch (e) {
      console.error('Negotiation error:', e)
      setStreamingRounds([])
      setNegotiationRounds(mockNegotiationRounds)
      setNegotiationResult(mockNegotiationResult)
    } finally {
      setLoadingStep(null)
    }
  }

  // Step 5: 接受提案
  const acceptProposal = async () => {
    setLoadingStep('proposal')

    if (demoMode) {
      alert('提案已接受（演示模式）')
      setLoadingStep(null)
      return
    }

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

  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    resetAllState()
  }

  // 重置所有客户端状态
  const resetAllState = () => {
    setIsLoggedIn(false)
    setDemoMode(false)
    setProfile(null)
    setPosts([])
    setMatches([])
    setNegotiationRounds([])
    setNegotiationResult(null)
    setStreamingRounds([])
    setCurrentStep(0)
    setIsAutoGenerating(false)
    setPollCount(0)
    setRingPosts({})
    setRingLoading({})
    setRingErrors({})
    setRingMeta({})
  }

  // 处理步骤切换
  const handleStepChange = async (step: number) => {
    setCurrentStep(step)

    // 根据步骤加载数据
    switch (step) {
      case 0: // 画像
        if (!profile) await loadProfile()
        break
      case 1: // 发现内容
        if (Object.keys(ringPosts).length === 0) await loadCircleContent()
        break
      case 2: // AI 匹配
        if (matches.length === 0) await runAIMatch()
        break
      case 3: // 协商
        if (negotiationRounds.length === 0) await runNegotiation()
        break
      case 4: // 提案
        // 无需额外加载
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

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // 未登录状态：显示登录引导
  if (!isLoggedIn && !demoMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">认知盲区拼图</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              发现能力互补的伙伴
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              在知乎圈子的真实讨论中，识别"谁缺什么、谁会什么"，
              让 AI 分身先完成互补分析与协作撮合，再决定是否连接。
            </p>

            <div className="flex flex-col gap-4 items-center">
              <LoginButton />

              <div className="text-gray-400 text-sm">或</div>

              <button
                onClick={() => {
                  setDemoMode(true)
                  setIsLoggedIn(false)
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                体验演示模式
              </button>
            </div>
          </div>

          <section className="mt-16 py-12 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">产品功能</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">AI 画像分析</h3>
                <p className="text-gray-600 text-sm">
                  通过与 AI 分身对话，识别你的能力长板与认知短板
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">圈子内容发现</h3>
                <p className="text-gray-600 text-sm">
                  在知乎指定圈子的真实讨论中发现潜在互补机会
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">智能提案生成</h3>
                <p className="text-gray-600 text-sm">
                  AI 分析后生成结构化合作提案，只需确认是否连接
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white border-t py-6 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
            认知盲区拼图 - 基于 Second Me 与知乎能力构建
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">认知盲区拼图</h1>
          <div className="flex items-center gap-4">
            {demoMode && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                演示模式
              </span>
            )}
            {isLoggedIn && profile?.nickname && (
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
        {/* 步骤导航 */}
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

        {/* 加载指示器 */}
        {loadingStep && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700">正在加载...</span>
          </div>
        )}

        {/* Step 0: 我的画像 */}
        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">我的互补画像</h2>
              {!demoMode && (
                <button
                  onClick={refreshProfile}
                  disabled={!!loadingStep}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loadingStep === 'profile' ? '刷新中...' : '刷新'}
                </button>
              )}
            </div>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {profile.nickname?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.nickname || '用户'}</h3>
                    <p className="text-sm text-gray-500">
                      {demoMode ? '（演示数据）' : '（真实数据）'}
                    </p>
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

                {/* AI 分身自我介绍 */}
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

                {/* 乐观 UI：自动生成中 */}
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

                {/* 轮询超时降级 */}
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isLoggedIn ? '正在加载画像...' : '请先登录'}
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

        {/* Step 1: 发现内容 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">知乎圈子动态</h2>

            {/* Dual-panel split layout */}
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
                    {/* Panel header */}
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

                    {/* Panel content */}
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

        {/* Step 2: AI 匹配 */}
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

        {/* Step 3: 协商过程 */}
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

        {/* Step 4: 提案结果 */}
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
                {negotiationResult?.consensus || mockNegotiationResult.consensus}
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
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                重新演示
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
