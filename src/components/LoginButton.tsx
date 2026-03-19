'use client'

import { useState } from 'react'

export default function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // 跳转到登录 API，会自动重定向到 SecondMe OAuth
      window.location.href = '/api/auth/login'
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {loading ? '正在跳转...' : '使用 Second Me 登录'}
    </button>
  )
}
