'use client'

import { useState, useEffect } from 'react'

interface ProfileData {
  personality?: {
    traits?: string[]
    communicationStyle?: string
    emotionalPattern?: string
  }
  expertise?: {
    domains?: string[]
    depthLevels?: Record<string, string>
    certifications?: string[]
  }
  blindspots?: {
    areas?: string[]
    descriptions?: string
  }
  collaboration?: {
    prefers?: string[]
    avoids?: string[]
    minCollaborationUnit?: string
  }
  needs?: {
    explicit?: string[]
    latent?: string[]
  }
  offerings?: {
    tangible?: string[]
    intangible?: string[]
  }
  naturalLanguagePreview?: string
  meta?: {
    confidence?: number
    generatedAt?: string
    dataSources?: string[]
    basedOnSessionsCount?: number
  }
}

interface UserInfo {
  id: string
  nickname?: string
  avatar_url?: string
  longboard_tags?: string
  blindspot_tags?: string
  offer_tags?: string
  need_tags?: string
  cooperation_pref?: string
  profile?: ProfileData
  has_profile?: boolean
}

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    longboardTags: '',
    blindspotTags: '',
    offerTags: '',
    needTags: '',
    cooperationPref: '',
  })

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      if (result.code === 0) {
        setUserInfo(result.data)
        setFormData({
          longboardTags: result.data.longboard_tags || '',
          blindspotTags: result.data.blindspot_tags || '',
          offerTags: result.data.offer_tags || '',
          needTags: result.data.need_tags || '',
          cooperationPref: result.data.cooperation_pref || '',
        })
      }
    } catch (error) {
      console.error('Fetch user info error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateProfile = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/user/profile/generate', { method: 'POST' })
      const result = await response.json()
      if (result.code === 0) {
        setUserInfo({ ...userInfo!, profile: result.data.profile })
      }
    } catch (error) {
      console.error('Regenerate profile error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.code === 0) {
        setUserInfo(result.data)
        setEditing(false)
      }
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  if (!userInfo) {
    return <div className="p-4">请先登录</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {userInfo.avatar_url ? (
          <img src={userInfo.avatar_url} alt={userInfo.nickname} className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">?</span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{userInfo.nickname || '未设置昵称'}</h2>
          <p className="text-sm text-gray-500">ID: {userInfo.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">我的长板</label>
          {editing ? (
            <input
              type="text"
              value={formData.longboardTags}
              onChange={(e) => setFormData({ ...formData, longboardTags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：产品设计、前端开发"
            />
          ) : (
            <p className="text-gray-900">{userInfo.longboard_tags || '未填写'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">我的短板</label>
          {editing ? (
            <input
              type="text"
              value={formData.blindspotTags}
              onChange={(e) => setFormData({ ...formData, blindspotTags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：法务、税务"
            />
          ) : (
            <p className="text-gray-900">{userInfo.blindspot_tags || '未填写'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">我能提供的</label>
          {editing ? (
            <input
              type="text"
              value={formData.offerTags}
              onChange={(e) => setFormData({ ...formData, offerTags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：技术咨询、面试辅导"
            />
          ) : (
            <p className="text-gray-900">{userInfo.offer_tags || '未填写'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">我想获得的</label>
          {editing ? (
            <input
              type="text"
              value={formData.needTags}
              onChange={(e) => setFormData({ ...formData, needTags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：运营建议、商业合作"
            />
          ) : (
            <p className="text-gray-900">{userInfo.need_tags || '未填写'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">合作偏好</label>
          {editing ? (
            <input
              type="text"
              value={formData.cooperationPref}
              onChange={(e) => setFormData({ ...formData, cooperationPref: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：线上交流、短期项目"
            />
          ) : (
            <p className="text-gray-900">{userInfo.cooperation_pref || '未填写'}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRegenerateProfile}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {generating ? '生成中...' : '刷新画像'}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              编辑画像
            </button>
          </>
        )}
      </div>

      {/* Natural Language Preview */}
      {userInfo?.profile?.naturalLanguagePreview && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">分身自我介绍</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">
            {userInfo.profile.naturalLanguagePreview}
          </p>
          {userInfo.profile.meta && (
            <p className="text-xs text-gray-400 mt-2">
              可信度: {Math.round((userInfo.profile.meta.confidence || 0) * 100)}% |
              基于 {userInfo.profile.meta.basedOnSessionsCount || 0} 个会话生成 |
              {userInfo.profile.meta.generatedAt && new Date(userInfo.profile.meta.generatedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
      )}

      {/* Show regenerate prompt if no profile */}
      {!userInfo?.has_profile && !generating && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          还没有分身画像，点击「刷新画像」让 AI 分身基于你的数据生成个性化画像
        </div>
      )}
    </div>
  )
}
