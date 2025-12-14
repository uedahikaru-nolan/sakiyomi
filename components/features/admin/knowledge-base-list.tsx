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
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 font-medium"
        >
          <Plus className="h-5 w-5" />
          ナレッジを追加
        </button>
      </div>

      {knowledgeList.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <span className="text-5xl">📚</span>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">ナレッジがまだ登録されていません</p>
          <p className="text-sm text-gray-500">「ナレッジを追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {knowledgeList.map((knowledge) => (
            <div
              key={knowledge.id}
              className={cn(
                'bg-white border border-gray-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200',
                !knowledge.is_active && 'opacity-60 bg-gray-50/50'
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

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(knowledge.id, knowledge.is_active)}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title={knowledge.is_active ? '無効化' : '有効化'}
                  >
                    {knowledge.is_active ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(knowledge)}
                    className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="編集"
                  >
                    <Pencil className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(knowledge.id)}
                    className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="削除"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
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
