'use client'

import { useState } from 'react'
import { KnowledgeBaseList } from './knowledge-base-list'
import { TemplateResponseList } from './template-response-list'

interface Knowledge {
  id: string
  title: string
  content: string
  category: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
  created_by?: string
}

interface TemplateResponse {
  id: string
  title: string
  trigger_keywords: string[]
  response_text: string
  description: string | null
  match_type: string
  priority: number
  is_active: boolean
  created_at: string
  created_by?: string
}

interface ResponseManagementProps {
  initialKnowledge: Knowledge[]
  initialTemplates: TemplateResponse[]
}

type TabType = 'knowledge' | 'template'

export function ResponseManagement({ initialKnowledge, initialTemplates }: ResponseManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge')

  return (
    <div className="space-y-4">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'knowledge'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            📚 ナレッジベース
            <span className="ml-2 text-xs text-gray-400">
              (AI参照用)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'template'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            ⚡ テンプレート応答
            <span className="ml-2 text-xs text-gray-400">
              (自動返信)
            </span>
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {activeTab === 'knowledge' && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">ナレッジベースとは？</h3>
              <p className="text-sm text-blue-800">
                AIが返信を生成する際に参照する情報を登録します。商品情報、サービス内容、よくある質問の回答などを登録しておくと、AIがそれを参考にして適切な返信を作成します。
              </p>
            </div>
            <KnowledgeBaseList initialData={initialKnowledge} />
          </div>
        )}

        {activeTab === 'template' && (
          <div>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1">テンプレート応答とは？</h3>
              <p className="text-sm text-green-800">
                特定のキーワードに対して即座に自動返信する内容を設定します。「契約期間」「料金」などのキーワードを登録すると、ユーザーがそのキーワードを含むメッセージを送った際に、AIを経由せず瞬時に返信します。
              </p>
            </div>
            <TemplateResponseList initialData={initialTemplates} />
          </div>
        )}
      </div>
    </div>
  )
}
