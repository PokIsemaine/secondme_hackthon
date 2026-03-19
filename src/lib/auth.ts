import { cookies } from 'next/headers'

// 从环境变量读取配置
export function getAuthConfig() {
  return {
    clientId: process.env.SECONDME_CLIENT_ID!,
    clientSecret: process.env.SECONDME_CLIENT_SECRET!,
    redirectUri: process.env.SECONDME_REDIRECT_URI!,
    oauthUrl: process.env.SECONDME_OAUTH_URL!,
    tokenEndpoint: process.env.SECONDME_TOKEN_ENDPOINT!,
    refreshEndpoint: process.env.SECONDME_REFRESH_ENDPOINT!,
    apiBaseUrl: process.env.SECONDME_API_BASE_URL!,
  }
}

// 生成 OAuth 授权 URL
export function generateAuthUrl(state: string): string {
  const config = getAuthConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'user.info user.info.shades user.info.softmemory chat note.add',
    state,
  })
  return `${config.oauthUrl}?${params.toString()}`
}

// 交换授权码获取 Token
export async function exchangeCodeForToken(code: string) {
  const config = getAuthConfig()

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  })

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

// 刷新 Access Token
export async function refreshAccessToken(refreshToken: string) {
  const config = getAuthConfig()

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(config.refreshEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}

// 获取当前用户 ID（从 cookie）
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('user_id')?.value || null
}

// 设置用户 Session Cookie
export async function setUserSession(userId: string, token: string) {
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  })
}

// 清除用户 Session
export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
  cookieStore.delete('token')
}

// 调用 SecondMe API（自动处理 token）
export async function callSecondMeApi<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getAuthConfig()
  const url = `${config.apiBaseUrl}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API call failed: ${error}`)
  }

  return response.json()
}
