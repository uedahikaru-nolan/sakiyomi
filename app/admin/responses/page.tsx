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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">返信管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
