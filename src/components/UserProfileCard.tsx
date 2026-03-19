'use client'

import { useState, useEffect } from 'react'
import BioRenderer from './BioRenderer'

interface ProfileData {
  nickname?: string
  avatar_url?: string
  bio?: string
  self_introduction?: string
  profile_completeness?: number
  shades?: string[]
  soft_memories?: string[]
  chat_summary?: string
}

export default function UserProfileCard() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    strengths: '',
    needs: '',
    offers: '',
    boundary: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...')
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      console.log('Profile response:', result)
      if (result.code === 0 && result.data) {
        setProfile(result.data)
        if (!result.data.shades?.length && !result.data.soft_memories?.length) {
          setError('请点击按钮生成画像')
        }
      } else {
        console.error('Failed to fetch profile:', result.message)
        setError(result.message || '获取画像失败')
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      setError('获取画像失败')
    } finally {
      setLoading(false)
    }
  }

  const generateProfile = async () => {
    setGenerating(true)
    setMessage('正在从 SecondMe 获取画像信息...')
    try {
      console.log('Generating profile...')
      const response = await fetch('/api/user/profile', {
        method: 'POST',
      })
      const result = await response.json()
      console.log('Generate profile response:', result)
      if (result.code === 0 && result.data) {
        setProfile(result.data)
        setMessage(result.data.message || '画像生成完成！')
        // 3秒后清除消息
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message || '生成失败')
        console.error('Generate failed:', result.message)
      }
    } catch (error) {
      console.error('Generate profile error:', error)
      setMessage('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const saveManualProfile = async () => {
    try {
      const response = await fetch('/api/user/profile/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const result = await response.json()
      if (result.code === 0) {
        setMessage('画像保存成功！')
        setEditing(false)
        fetchProfile()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message || '保存失败')
      }
    } catch (error) {
      console.error('Save profile error:', error)
      setMessage('保存失败')
    }
  }

  const startEdit = () => {
    setEditForm({
      strengths: profile?.shades?.join('、') || '',
      needs: '',
      offers: '',
      boundary: '',
    })
    setEditing(true)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* 用户基本信息 */}
      <div className="flex items-center gap-4 mb-6">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.nickname}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {profile?.nickname?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {profile?.nickname || '未设置昵称'}
          </h2>
          {profile?.profile_completeness !== undefined && profile?.profile_completeness > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${profile.profile_completeness}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">
                完整度 {profile.profile_completeness}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 生成按钮和消息 */}
      <div className="mb-6">
        <button
          onClick={generateProfile}
          disabled={generating}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {generating ? '正在生成画像...' : '从 SecondMe 生成画像'}
        </button>
        {message && (
          <p className="mt-2 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>

      {/* 兴趣标签 */}
      {profile?.shades && profile.shades.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">兴趣标签</h3>
          <div className="flex flex-wrap gap-2">
            {profile.shades.map((shade, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {shade}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 软记忆 */}
      {profile?.soft_memories && profile.soft_memories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">我的特点</h3>
          <ul className="space-y-1">
            {profile.soft_memories.slice(0, 5).map((memory, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{memory}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 自我介绍 */}
      {profile?.self_introduction && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">自我介绍</h3>
          <p className="text-sm text-gray-600">{profile.self_introduction}</p>
        </div>
      )}

      {/* AI分身自我介绍 - BioRenderer */}
      {profile?.bio && <BioRenderer bio={profile.bio} />}

      {/* 对话摘要 */}
      {profile?.chat_summary && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">AI 分身互动</h3>
          <p className="text-sm text-gray-600">{profile.chat_summary}</p>
        </div>
      )}

      {/* 空状态或错误提示 */}
      {(!profile?.shades?.length && !profile?.soft_memories?.length && !profile?.self_introduction) && (
        <div className="text-center py-4">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <p className="text-gray-500 text-sm">点击上方按钮从 SecondMe 生成你的画像</p>
          <p className="text-gray-400 text-xs mt-1">系统将自动获取你的兴趣标签、软记忆等信息</p>
        </div>
      )}

      {/* 手动编辑按钮 */}
      <div className="mt-4 pt-4 border-t">
        {!editing ? (
          <button
            onClick={startEdit}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            手动编辑画像
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">擅长领域</label>
              <input
                type="text"
                value={editForm.strengths}
                onChange={(e) => setEditForm({ ...editForm, strengths: e.target.value })}
                placeholder="如：PRD梳理、技术架构判断"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">需要帮助</label>
              <input
                type="text"
                value={editForm.needs}
                onChange={(e) => setEditForm({ ...editForm, needs: e.target.value })}
                placeholder="如：技术落地、商业化视角"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">能提供</label>
              <input
                type="text"
                value={editForm.offers}
                onChange={(e) => setEditForm({ ...editForm, offers: e.target.value })}
                placeholder="如：产品结构化、用户研究"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">合作边界</label>
              <input
                type="text"
                value={editForm.boundary}
                onChange={(e) => setEditForm({ ...editForm, boundary: e.target.value })}
                placeholder="如：仅接受30分钟问题对焦"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveManualProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
