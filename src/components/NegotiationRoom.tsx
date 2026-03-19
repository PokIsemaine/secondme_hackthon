'use client'

import { useState, useEffect } from 'react'

interface NegotiationRound {
  roundNumber: number
  speaker: string
  summary: string
  content?: string
}

interface NegotiationData {
  id: string
  topic: string
  mode: string
  status: string
  consensus: string | null
  disagreements: string | null
  recommendedForm: string | null
  recommendedDuration: string | null
  shouldContinue: boolean | null
  rounds: NegotiationRound[]
}

interface Props {
  sessionId?: string
  topic?: string
  peerName?: string
  onStartNegotiation?: () => void
}

export default function NegotiationRoom({ sessionId, topic, peerName = '候选代理', onStartNegotiation }: Props) {
  const [negotiation, setNegotiation] = useState<NegotiationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)

  // 加载协商详情
  const loadNegotiation = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/negotiation/${sessionId}`)
      const data = await res.json()
      if (data.code === 0) {
        setNegotiation(data.data)
      }
    } catch (error) {
      console.error('Load negotiation error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadNegotiation()
    }
  }, [sessionId])

  // 开始执行协商
  const startNegotiation = async () => {
    if (!topic) return
    setExecuting(true)
    try {
      // 创建协商会话
      const createRes = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const createData = await createRes.json()
      if (createData.code !== 0) {
        alert(createData.message || '创建协商失败')
        return
      }

      // 执行协商
      const sessionId = createData.data.sessionId
      const execRes = await fetch(`/api/negotiation/${sessionId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const execData = await execRes.json()
      if (execData.code === 0) {
        setNegotiation(execData.data)
      } else {
        alert(execData.message || '执行协商失败')
      }
    } catch (error) {
      console.error('Start negotiation error:', error)
    } finally {
      setExecuting(false)
      onStartNegotiation?.()
    }
  }

  const getSpeakerLabel = (speaker: string) => {
    switch (speaker) {
      case 'my_agent':
        return '我的 Agent'
      case 'peer_agent':
        return '对方 Agent'
      case 'peer_proxy':
        return peerName
      default:
        return speaker
    }
  }

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case 'my_agent':
        return 'bg-blue-500'
      case 'peer_agent':
        return 'bg-green-500'
      case 'peer_proxy':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 初始状态 - 还未开始协商
  if (!sessionId && topic) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Agent 协商室</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            正在与 <span className="font-medium text-purple-600">{peerName}</span> 协商
          </p>
          <p className="text-gray-500 mb-6">
            协商主题: <span className="font-medium">{topic}</span>
          </p>
          <button
            onClick={startNegotiation}
            disabled={executing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executing ? '协商进行中...' : '开始 A2A 协商'}
          </button>
        </div>
      </div>
    )
  }

  // 加载中
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // 协商进行中
  if (negotiation?.status === 'pending') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Agent 协商室</h3>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Agent 正在协商中...</p>
        </div>
      </div>
    )
  }

  // 协商完成 - 显示结果
  if (negotiation?.status === 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Agent 协商室</h3>
          <p className="text-sm text-gray-500 mt-1">主题: {negotiation.topic}</p>
        </div>

        {/* 协商过程 */}
        <div className="p-6">
          <h4 className="font-medium mb-4">协商过程</h4>
          <div className="space-y-4">
            {negotiation.rounds.map((round) => (
              <div key={round.roundNumber} className="flex gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${getSpeakerColor(round.speaker)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{getSpeakerLabel(round.speaker)}</span>
                    <span className="text-xs text-gray-400">第 {round.roundNumber} 轮</span>
                  </div>
                  <p className="text-sm text-gray-600">{round.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 协商结果 */}
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="font-medium mb-4">协商结果</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1">推荐合作形式</p>
              <p className="font-medium">{negotiation.recommendedForm || '待确定'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1">建议时长</p>
              <p className="font-medium">{negotiation.recommendedDuration || '待确定'}</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg border-l-4 bg-white">
            <p className="text-sm text-gray-500 mb-1">建议</p>
            <p className={`font-medium ${negotiation.shouldContinue ? 'text-green-600' : 'text-gray-600'}`}>
              {negotiation.shouldContinue ? '✓ 建议真人接入继续' : '○ 暂不建议继续'}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-6 border-t flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            接受提案
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            请求真实协商
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            放弃
          </button>
        </div>
      </div>
    )
  }

  return null
}
