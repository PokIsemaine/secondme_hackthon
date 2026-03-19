import { getAuthConfig } from './auth'

export interface LlmCallResult {
  success: boolean
  content: string
  error?: string
}

function getConfig() {
  return {
    apiBaseUrl: process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab',
  }
}

function parseSSEStream(buffer: string): string {
  const lines = buffer.split('\n')
  let content = ''

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6))
        if (data.content) {
          content += data.content
        }
      } catch {
        // If not JSON, treat as plain text
        content += line.slice(6)
      }
    }
  }

  return content
}

function extractJsonFromText(text: string): string | null {
  // Try to find JSON in the text
  // First, try to find {...} blocks
  const jsonBlockRegex = /\{[\s\S]*\}/g
  const matches = text.match(jsonBlockRegex)

  if (matches) {
    // Try each match from longest to shortest
    const sortedMatches = matches.sort((a, b) => b.length - a.length)
    for (const match of sortedMatches) {
      try {
        JSON.parse(match)
        return match
      } catch {
        continue
      }
    }
  }

  // If no valid JSON found, return null
  return null
}

export async function callActStream(
  accessToken: string,
  prompt: string
): Promise<LlmCallResult> {
  const config = getConfig()

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/act/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_profile',
        content: prompt,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, content: '', error: `HTTP ${response.status}: ${error}` }
    }

    const reader = response.body?.getReader()
    if (!reader) {
      return { success: false, content: '', error: 'No response body' }
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
    }

    // Parse SSE stream
    let content = parseSSEStream(buffer)

    // Try to extract and validate JSON
    const jsonStr = extractJsonFromText(content)
    if (jsonStr) {
      // Validate it's parseable
      try {
        JSON.parse(jsonStr)
        return { success: true, content: jsonStr }
      } catch {
        // Fall through to return raw content
      }
    }

    // If we couldn't extract valid JSON, return what we have
    return { success: true, content }

  } catch (error) {
    return { success: false, content: '', error: String(error) }
  }
}

export async function callChatStreamFallback(
  accessToken: string,
  prompt: string
): Promise<LlmCallResult> {
  const config = getConfig()

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, content: '', error: `HTTP ${response.status}: ${error}` }
    }

    const reader = response.body?.getReader()
    if (!reader) {
      return { success: false, content: '', error: 'No response body' }
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Parse SSE lines as they come in
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              buffer += data.content
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }

    // Handle remaining buffer
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6))
        if (data.content) {
          buffer = data.content
        }
      } catch {
        buffer = buffer.slice(6)
      }
    }

    return { success: true, content: buffer.trim() }

  } catch (error) {
    return { success: false, content: '', error: String(error) }
  }
}

export function parseProfileJson(jsonStr: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(jsonStr)
    // Validate it has the expected top-level structure
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    // Try to extract JSON from text
    const extracted = extractJsonFromText(jsonStr)
    if (extracted) {
      try {
        return JSON.parse(extracted) as Record<string, unknown>
      } catch {
        return null
      }
    }
    return null
  }
}
