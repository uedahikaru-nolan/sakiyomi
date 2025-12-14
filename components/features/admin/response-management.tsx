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
    <div className="space-y-6">
      {/* Modern Tab Navigation with Gradient */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <nav className="flex p-2 gap-2">
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`
              flex-1 py-4 px-6 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out
              ${
                activeTab === 'knowledge'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">📚</span>
              <div className="flex flex-col items-start">
                <span>ナレッジベース</span>
                <span className={`text-xs ${activeTab === 'knowledge' ? 'text-blue-100' : 'text-gray-400'}`}>
                  AI参照用
                </span>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`
              flex-1 py-4 px-6 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out
              ${
                activeTab === 'template'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">⚡</span>
              <div className="flex flex-col items-start">
                <span>テンプレート応答</span>
                <span className={`text-xs ${activeTab === 'template' ? 'text-green-100' : 'text-gray-400'}`}>
                  自動返信
                </span>
              </div>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content with Animation */}
      <div className="transition-all duration-300 ease-in-out">
        {activeTab === 'knowledge' && (
          <div className="animate-fadeIn">
            {/* Info Card with Modern Design */}
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2 text-lg">ナレッジベースとは？</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    AIが返信を生成する際に参照する情報を登録します。商品情報、サービス内容、よくある質問の回答などを登録しておくと、AIがそれを参考にして適切な返信を作成します。
                  </p>
                </div>
              </div>
            </div>
            <KnowledgeBaseList initialData={initialKnowledge} />
          </div>
        )}

        {activeTab === 'template' && (
          <div className="animate-fadeIn">
            {/* Info Card with Modern Design */}
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500 rounded-lg shadow-md">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 mb-2 text-lg">テンプレート応答とは？</h3>
                  <p className="text-sm text-green-800 leading-relaxed">
                    特定のキーワードに対して即座に自動返信する内容を設定します。「契約期間」「料金」などのキーワードを登録すると、ユーザーがそのキーワードを含むメッセージを送った際に、AIを経由せず瞬時に返信します。
                  </p>
                </div>
              </div>
            </div>
            <TemplateResponseList initialData={initialTemplates} />
          </div>
        )}
      </div>
    </div>
  )
}
