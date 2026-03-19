import crypto from 'crypto'

// 知乎 API 配置
export function getZhihuConfig() {
  return {
    baseUrl: process.env.ZHIHU_BASE_URL || 'https://openapi.zhihu.com',
    appKey: process.env.ZHIHU_APP_KEY!,
    appSecret: process.env.ZHIHU_APP_SECRET!,
    ringIds: (process.env.ZHIHU_RING_IDS || '2001009660925334090,2015023739549529606').split(','),
  }
}

// 生成签名
function generateSignature(appSecret: string, timestamp: number, logId: string): string {
  const signStr = `app_key:${getZhihuConfig().appKey}|ts:${timestamp}|logid:${logId}|extra_info:`
  const hmac = crypto.createHmac('sha256', appSecret)
  hmac.update(signStr)
  return hmac.digest('base64')
}

// 生成请求头
export function generateZhihuHeaders() {
  const config = getZhihuConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  return {
    'X-App-Key': config.appKey,
    'X-Timestamp': timestamp.toString(),
    'X-Log-Id': logId,
    'X-Sign': generateSignature(config.appSecret, timestamp, logId),
    'X-Extra-Info': '',
  }
}

// 通用 GET 请求
export async function zhihuGet<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const config = getZhihuConfig()
  const url = new URL(`${config.baseUrl}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString())
    })
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...generateZhihuHeaders(),
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zhihu API error: ${error}`)
  }

  return response.json()
}

// 通用 POST 请求
export async function zhihuPost<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  const config = getZhihuConfig()
  const url = `${config.baseUrl}${endpoint}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...generateZhihuHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zhihu API error: ${error}`)
  }

  return response.json()
}
