import { Suspense } from 'react'
import { getKnowledgeBase } from '@/lib/actions/knowledge-base'
import { getTemplateResponses } from '@/lib/actions/template-responses'
import { ResponseManagement } from '@/components/features/admin/response-management'

export const metadata = {
  title: '返信管理 | SAKIYOMIツール',
  description: 'ナレッジベースとテンプレート応答の管理',
}

export default async function ResponsesPage() {
  const [knowledgeResult, templateResult] = await Promise.all([
    getKnowledgeBase(true),
    getTemplateResponses(true),
  ])

  if (knowledgeResult.error && templateResult.error) {
    return (
      <div className="p-8">
        <div className="text-destructive">データの取得に失敗しました</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          返信管理
        </h1>
        <p className="text-gray-600 text-lg">
          ナレッジベースとテンプレート応答を管理します
        </p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <ResponseManagement
          initialKnowledge={knowledgeResult.knowledgeBase || []}
          initialTemplates={templateResult.templates || []}
        />
      </Suspense>
    </div>
  )
}
