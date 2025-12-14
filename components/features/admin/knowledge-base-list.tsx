'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteKnowledge, toggleKnowledgeStatus } from '@/lib/actions/knowledge-base'
import { KnowledgeBaseForm } from './knowledge-base-form'
import { cn } from '@/lib/utils/cn'

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

interface KnowledgeBaseListProps {
  initialData: Knowledge[]
}

export function KnowledgeBaseList({ initialData }: KnowledgeBaseListProps) {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>(initialData)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('このナレッジを削除しますか?')) return

    const result = await deleteKnowledge(id)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    } else {
      setKnowledgeList(knowledgeList.filter((k) => k.id !== id))
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleKnowledgeStatus(id, !currentStatus)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    } else {
      setKnowledgeList(
        knowledgeList.map((k) =>
          k.id === id ? { ...k, is_active: !currentStatus } : k
        )
      )
    }
  }

  const handleEdit = (knowledge: Knowledge) => {
    setEditingKnowledge(knowledge)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingKnowledge(null)
  }

  const handleFormSuccess = (knowledge: Knowledge) => {
    if (editingKnowledge) {
      // 更新
      setKnowledgeList(
        knowledgeList.map((k) => (k.id === knowledge.id ? knowledge : k))
      )
    } else {
      // 新規追加
      setKnowledgeList([knowledge, ...knowledgeList])
    }
    handleFormClose()
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          ナレッジを追加
        </button>
      </div>

      {knowledgeList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>ナレッジがまだ登録されていません</p>
          <p className="text-sm mt-2">「ナレッジを追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgeList.map((knowledge) => (
            <div
              key={knowledge.id}
              className={cn(
                'bg-white border rounded-lg p-4',
                !knowledge.is_active && 'opacity-60 bg-gray-50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{knowledge.title}</h3>
                    {knowledge.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {knowledge.category}
                      </span>
                    )}
                    {!knowledge.is_active && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                        無効
                      </span>
                    )}
                  </div>

                  {knowledge.tags && knowledge.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {knowledge.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-700">
                    {expandedId === knowledge.id ? (
                      <p className="whitespace-pre-wrap">{knowledge.content}</p>
                    ) : (
                      <p className="line-clamp-2">{knowledge.content}</p>
                    )}
                  </div>

                  {knowledge.content.length > 100 && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === knowledge.id ? null : knowledge.id)
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      {expandedId === knowledge.id ? '閉じる' : 'もっと見る'}
                    </button>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    作成日: {new Date(knowledge.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => handleToggleStatus(knowledge.id, knowledge.is_active)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title={knowledge.is_active ? '無効化' : '有効化'}
                  >
                    {knowledge.is_active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(knowledge)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="編集"
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(knowledge.id)}
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
        <KnowledgeBaseForm
          knowledge={editingKnowledge}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
