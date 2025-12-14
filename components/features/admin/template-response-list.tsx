'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteTemplateResponse, toggleTemplateStatus } from '@/lib/actions/template-responses'
import { TemplateResponseForm } from './template-response-form'
import { cn } from '@/lib/utils/cn'

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

interface TemplateResponseListProps {
  initialData: TemplateResponse[]
}

export function TemplateResponseList({ initialData }: TemplateResponseListProps) {
  const [templateList, setTemplateList] = useState<TemplateResponse[]>(initialData)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateResponse | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('このテンプレート応答を削除しますか?')) return

    const result = await deleteTemplateResponse(id)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    } else {
      setTemplateList(templateList.filter((t) => t.id !== id))
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleTemplateStatus(id, !currentStatus)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    } else {
      setTemplateList(
        templateList.map((t) =>
          t.id === id ? { ...t, is_active: !currentStatus } : t
        )
      )
    }
  }

  const handleEdit = (template: TemplateResponse) => {
    setEditingTemplate(template)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTemplate(null)
  }

  const handleFormSuccess = (template: TemplateResponse) => {
    if (editingTemplate) {
      // 更新
      setTemplateList(
        templateList.map((t) => (t.id === template.id ? template : t))
      )
    } else {
      // 新規追加
      setTemplateList([template, ...templateList])
    }
    handleFormClose()
  }

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return '完全一致'
      case 'starts_with':
        return '前方一致'
      case 'contains':
      default:
        return '部分一致'
    }
  }

  // 優先度順にソート
  const sortedTemplates = [...templateList].sort((a, b) => b.priority - a.priority)

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          テンプレートを追加
        </button>
      </div>

      {sortedTemplates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>テンプレート応答がまだ登録されていません</p>
          <p className="text-sm mt-2">「テンプレートを追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                'bg-white border rounded-lg p-4',
                !template.is_active && 'opacity-60 bg-gray-50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{template.title}</h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                      優先度: {template.priority}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {getMatchTypeLabel(template.match_type)}
                    </span>
                    {!template.is_active && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                        無効
                      </span>
                    )}
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  )}

                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-500 mr-2">トリガーキーワード:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.trigger_keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="text-xs font-medium text-gray-500 block mb-1">返信内容:</span>
                    {expandedId === template.id ? (
                      <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{template.response_text}</p>
                    ) : (
                      <p className="line-clamp-2 bg-gray-50 p-2 rounded">{template.response_text}</p>
                    )}
                  </div>

                  {template.response_text.length > 100 && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === template.id ? null : template.id)
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      {expandedId === template.id ? '閉じる' : 'もっと見る'}
                    </button>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    作成日: {new Date(template.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => handleToggleStatus(template.id, template.is_active)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title={template.is_active ? '無効化' : '有効化'}
                  >
                    {template.is_active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="編集"
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <TemplateResponseForm
          template={editingTemplate}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
