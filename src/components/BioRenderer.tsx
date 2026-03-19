'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BioRendererProps {
  bio: string
}

interface ExtractedSections {
  mbti: string | null
  summary: string | null
  personalityTraits: string[]
  valuesTraits: string[]
  fullMarkdown: string
}

function extractSections(bio: string): ExtractedSections {
  // Extract MBTI
  const mbtiMatch = bio.match(/###\s*MBTI\s*###\s*\n(.+)/i)
  const mbti = mbtiMatch ? mbtiMatch[1].trim() : null

  // Extract Summary (总体概述)
  const summaryMatch = bio.match(/###\s*总体概述\s*###\s*\n([\s\S]+?)(?=###\s*[^#]+###|$)/i)
  const summary = summaryMatch ? summaryMatch[1].trim() : null

  // Extract Personality Traits (性格特征) - comma or newline separated
  const personalityMatch = bio.match(/###\s*性格特征\s*###\s*\n([\s\S]+?)(?=###\s*[^#]+###|$)/i)
  let personalityTraits: string[] = []
  if (personalityMatch) {
    const text = personalityMatch[1].trim()
    personalityTraits = text.split(/[,，\n]+/).map(t => t.trim()).filter(Boolean)
  }

  // Extract Values Traits (价值观) - comma or newline separated
  const valuesMatch = bio.match(/###\s*价值观\s*###\s*\n([\s\S]+?)(?=###\s*[^#]+###|$)/i)
  let valuesTraits: string[] = []
  if (valuesMatch) {
    const text = valuesMatch[1].trim()
    valuesTraits = text.split(/[,，\n]+/).map(t => t.trim()).filter(Boolean)
  }

  // Full Markdown is rendered as-is (strip only the sections we've extracted for display)
  // We keep the full bio for the markdown renderer below
  const fullMarkdown = bio

  return { mbti, summary, personalityTraits, valuesTraits, fullMarkdown }
}

export default function BioRenderer({ bio }: BioRendererProps) {
  if (!bio || !bio.trim()) {
    return null
  }

  const { mbti, summary, personalityTraits, valuesTraits, fullMarkdown } = extractSections(bio)
  const hasExtractedContent = mbti || summary || personalityTraits.length > 0 || valuesTraits.length > 0

  return (
    <div className="mb-4">
      {/* AI 分身自我介绍 Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <h3 className="text-sm font-medium text-gray-700">AI分身自我介绍</h3>
      </div>

      {/* Card Container */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100 p-4">
        {/* Summary Line with MBTI */}
        {(summary || mbti) && (
          <div className="mb-3">
            <div className="flex items-center flex-wrap gap-2">
              {mbti && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                  {mbti}
                </span>
              )}
              {summary && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {summary.length > 100 ? summary.substring(0, 100) + '...' : summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Trait Chips */}
        {(personalityTraits.length > 0 || valuesTraits.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {personalityTraits.map((trait, i) => (
              <span
                key={`p-${i}`}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
              >
                {trait}
              </span>
            ))}
            {valuesTraits.map((trait, i) => (
              <span
                key={`v-${i}`}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-100"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Divider if we have extracted content AND full markdown */}
        {hasExtractedContent && (
          <div className="border-t border-purple-100 my-3" />
        )}

        {/* Full Markdown Content */}
        <div className="prose prose-sm prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {fullMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
