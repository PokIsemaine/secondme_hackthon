'use client'

import LoginButton from '@/components/LoginButton'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">认知盲区拼图</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            发现能力互补的伙伴
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            在知乎圈子的真实讨论中，识别"谁缺什么、谁会什么"，
            让 AI 分身先完成互补分析与协作撮合，再决定是否连接。
          </p>

          <LoginButton />
        </div>

        <section className="mt-16 py-12 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">产品功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">AI 画像分析</h3>
              <p className="text-gray-600 text-sm">
                通过与 AI 分身对话，识别你的能力长板与认知短板
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">圈子内容发现</h3>
              <p className="text-gray-600 text-sm">
                在知乎指定圈子的真实讨论中发现潜在互补机会
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">智能提案生成</h3>
              <p className="text-gray-600 text-sm">
                AI 分析后生成结构化合作提案，只需确认是否连接
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          认知盲区拼图 - 基于 Second Me 与知乎能力构建
        </div>
      </footer>
    </div>
  )
}
