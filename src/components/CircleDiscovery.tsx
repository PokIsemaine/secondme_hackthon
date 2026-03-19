'use client'

import { useState, useEffect } from 'react'

interface ProfileData {
  nickname?: string
  avatar_url?: string
  shades?: string[]
  soft_memories?: string[]
}

interface CirclePost {
  pin_id: string
  content: string
  author_name: string
  images?: string[]
  publish_time: number
  like_num: number
  comment_num: number
}

interface Thesis {
  forYou: string
  forThem: string
}

interface ReasonObject {
  complementType: string
  thesis: Thesis
  detailLevel: 'detailed' | 'brief'
}

interface MatchResult {
  post: CirclePost
  matchScore: number
  matchReason: string
  complementType?: string
  reason?: ReasonObject
  detailLevel?: 'detailed' | 'brief'
}

interface RingInfo {
  ring_id: string
  ring_name: string
  ring_desc: string
  ring_avatar: string
  membership_num: number
  discussion_num: number
}

export default function CircleDiscovery() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [rings, setRings] = useState<RingInfo[]>([])
  const [selectedRing, setSelectedRing] = useState<string>('')
  const [posts, setPosts] = useState<CirclePost[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [matching, setMatching] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')

  // 加载用户画像
  useEffect(() => {
    fetchProfile()
  }, [])

  // 加载圈子列表
  useEffect(() => {
    fetchRings()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      if (result.code === 0 && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchRings = async () => {
    try {
      const response = await fetch('/api/zhihu/ring')
      const result = await response.json()
      if (result.code === 0 && result.data?.rings) {
        // 加载每个圈子的详细信息
        const ringDetails = await Promise.all(
          result.data.rings.map(async (ring: { ring_id: string }) => {
            const res = await fetch(`/api/zhihu/ring?ring_id=${ring.ring_id}`)
            const data = await res.json()
            return data.data?.ring_info || { ring_id: ring.ring_id }
          })
        )
        setRings(ringDetails)
        if (ringDetails.length > 0) {
          setSelectedRing(ringDetails[0].ring_id)
        }
      }
    } catch (error) {
      console.error('Fetch rings error:', error)
    }
  }

  const fetchPosts = async (ringId: string) => {
    if (!ringId) return
    setLoading(true)
    setError('')
    setMatchResults([])
    try {
      const response = await fetch(`/api/zhihu/ring?ring_id=${ringId}&page_num=1&page_size=20`)
      const result = await response.json()
      if (result.code === 0 && result.data?.contents) {
        setPosts(result.data.contents)
      } else {
        setError(result.message || '获取圈子内容失败')
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
      setError('获取圈子内容失败')
    } finally {
      setLoading(false)
    }
  }

  // 切换圈子时加载帖子
  useEffect(() => {
    if (selectedRing) {
      fetchPosts(selectedRing)
    }
  }, [selectedRing])

  const handleMatch = async () => {
    if (!profile || posts.length === 0) return

    setMatching(true)
    setError('')

    try {
      const response = await fetch('/api/circle/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            shades: profile.shades || [],
            soft_memories: profile.soft_memories || [],
          },
          posts: posts.map(p => ({
            pin_id: p.pin_id,
            content: p.content,
            author_name: p.author_name,
          })),
        }),
      })

      const result = await response.json()
      if (result.code === 0 && result.data?.matches) {
        // 按匹配度排序
        const sorted = result.data.matches.sort((a: MatchResult, b: MatchResult) => b.matchScore - a.matchScore)
        setMatchResults(sorted)
      } else {
        setError(result.message || '匹配分析失败')
      }
    } catch (error) {
      console.error('Match error:', error)
      setError('匹配分析失败')
    } finally {
      setMatching(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  const toggleCard = (pinId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(pinId)) {
        next.delete(pinId)
      } else {
        next.add(pinId)
      }
      return next
    })
  }

  const getTypeTagStyle = (complementType: string) => {
    switch (complementType) {
      case '能力互补':
        return 'bg-blue-100 text-blue-700'
      case '认知互补':
        return 'bg-amber-100 text-amber-700'
      case '双向互助':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loadingProfile) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // 检查是否有画像
  const hasProfile = profile?.shades?.length || profile?.soft_memories?.length

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">圈子内容发现</h2>
        {hasProfile && (
          <button
            onClick={handleMatch}
            disabled={matching || posts.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {matching ? 'AI 匹配中...' : 'AI 智能匹配'}
          </button>
        )}
      </div>

      {/* 画像提示 */}
      {!hasProfile && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            请先在左侧生成您的互补画像，然后使用 AI 智能匹配发现相关内容
          </p>
        </div>
      )}

      {/* 圈子选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择圈子</label>
        <select
          value={selectedRing}
          onChange={(e) => setSelectedRing(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {rings.map((ring) => (
            <option key={ring.ring_id} value={ring.ring_id}>
              {ring.ring_name || ring.ring_id} ({ring.membership_num || 0}人)
            </option>
          ))}
        </select>
      </div>

      {/* 用户画像摘要 */}
      {hasProfile && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">您的画像：</span>
            {profile?.shades?.slice(0, 3).join('、')}
            {profile?.soft_memories && profile.soft_memories.length > 0 && ` | ${profile.soft_memories[0]}`}
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex space-x-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <p className="text-sm text-gray-500 mt-2">加载圈子内容...</p>
        </div>
      )}

      {/* 匹配结果 */}
      {!loading && matchResults.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">
            AI 推荐匹配 ({matchResults.length} 条)
          </h3>
          {matchResults.slice(0, 5).map((result) => {
            const isExpanded = expandedCards.has(result.post.pin_id)
            const shouldAutoExpand = result.detailLevel === 'detailed'
            const isEffectivelyExpanded = isExpanded || shouldAutoExpand
            const complementType = result.complementType || result.reason?.complementType || '相关'
            const forYou = result.reason?.thesis?.forYou || result.matchReason
            const forThem = result.reason?.thesis?.forThem || ''

            return (
              <div
                key={result.post.pin_id}
                className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 cursor-pointer"
                onClick={() => toggleCard(result.post.pin_id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeTagStyle(complementType)}`}>
                      {complementType}
                    </span>
                    <span className="font-medium text-gray-900">{result.post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {Math.round(result.matchScore * 100)}%
                    </span>
                    <span className="text-gray-400 text-xs">
                      {isEffectivelyExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{result.post.content}</p>

                {/* 理由展示区 */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    "{forYou}"
                  </p>
                  {isEffectivelyExpanded && forThem && (
                    <p className="text-sm text-gray-700">
                      "{forThem}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>👍 {result.post.like_num}</span>
                  <span>💬 {result.post.comment_num}</span>
                  <span>{formatTime(result.post.publish_time)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 帖子列表 */}
      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            {matchResults.length > 0 ? '更多内容' : '圈子动态'}
          </h3>
          {posts.map((post) => (
            <div key={post.pin_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{post.author_name}</span>
                <span className="text-xs text-gray-400">{formatTime(post.publish_time)}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-4">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {post.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>👍 {post.like_num}</span>
                <span>💬 {post.comment_num}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>该圈子暂无内容</p>
        </div>
      )}
    </div>
  )
}
