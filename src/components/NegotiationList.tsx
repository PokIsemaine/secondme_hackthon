'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Negotiation {
  id: string
  topic: string | null
  mode: string
  status: string
  consensus: string | null
  shouldContinue: boolean | null
  createdAt: Date
}

interface Props {
  initialNegotiations: Negotiation[]
}

export default function NegotiationList({ initialNegotiations }: Props) {
  const [negotiations] = useState(initialNegotiations)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">进行中</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已完成</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">已取消</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const getModeLabel = (mode: string) => {
    return mode === 'full_a2a' ? '正式协商' : '预协商'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (negotiations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无协商记录</h3>
        <p className="text-gray-500 mb-6">
          在圈子中发现互补对象后，可以发起 A2A 协商
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          发现互补内容
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {negotiations.map((negotiation) => (
        <div
          key={negotiation.id}
          className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900">{negotiation.topic}</h3>
                {getStatusBadge(negotiation.status)}
                <span className="text-xs text-gray-400">{getModeLabel(negotiation.mode)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDate(negotiation.createdAt)}</span>
                {negotiation.consensus && (
                  <span className="truncate max-w-md">{negotiation.consensus}</span>
                )}
              </div>
            </div>
            <Link
              href={`/negotiation/${negotiation.id}`}
              className="ml-4 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              查看详情
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
