'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SeekerPage() {
  const [step, setStep] = useState(1)
  const [problem, setProblem] = useState('')
  const [offer, setOffer] = useState('')
  const [need, setNeed] = useState('')
  const [draft, setDraft] = useState('')
  const [editedDraft, setEditedDraft] = useState('')
  const [selectedRing, setSelectedRing] = useState('2001009660925334090')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  // 生成草稿
  const generateDraft = async () => {
    if (!problem || !offer || !need) {
      alert('请填写完整信息')
      return
    }

    setStep(2)
    try {
      const res = await fetch('/api/seeker/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myProblem: problem,
          myOffer: offer,
          myNeed: need,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setDraft(data.data.draft)
        setEditedDraft(data.data.draft)
      } else {
        alert(data.message || '生成草稿失败')
      }
    } catch (error) {
      console.error('Generate draft error:', error)
      alert('生成草稿失败')
    }
  }

  // 发布
  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch('/api/seeker/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedDraft,
          ringId: selectedRing,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setPublished(true)
      } else {
        alert(data.message || '发布失败')
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('发布失败')
    } finally {
      setPublishing(false)
    }
  }

  const rings = [
    { id: '2001009660925334090', name: '产品经理' },
    { id: '2015023739549529606', name: '互联网职场' },
  ]

  if (published) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">求补位发帖</h1>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              返回首页
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">发布成功</h2>
            <p className="text-gray-600 mb-6">
              你的求补位帖子已发布到知乎圈子，等待其他用户响应
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                返回首页
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                再发一个
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">求补位发帖</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2">填写信息</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2">编辑发布</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">填写你的需求</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  我目前卡在什么问题？
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="描述你目前遇到的问题或挑战..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  我能提供什么价值？
                </label>
                <textarea
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="你能为别人提供什么帮助..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  我希望获得什么帮助？
                </label>
                <textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="你希望从别人那里获得什么..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={generateDraft}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                生成发帖草稿
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">编辑并发布</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择发布圈子
              </label>
              <select
                value={selectedRing}
                onChange={(e) => setSelectedRing(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {rings.map((ring) => (
                  <option key={ring.id} value={ring.id}>
                    {ring.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                草稿内容（可编辑）
              </label>
              <textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                上一步
              </button>
              <button
                onClick={publish}
                disabled={publishing}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {publishing ? '发布中...' : '立即发布'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
