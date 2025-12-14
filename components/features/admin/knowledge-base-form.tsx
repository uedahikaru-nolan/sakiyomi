'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createKnowledge, updateKnowledge } from '@/lib/actions/knowledge-base'
import { cn } from '@/lib/utils/cn'

interface Knowledge {
  id: string
  title: string
  content: string
  category: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
}

interface KnowledgeBaseFormProps {
  knowledge?: Knowledge | null
  onClose: () => void
  onSuccess: (knowledge: Knowledge) => void
}

export function KnowledgeBaseForm({ knowledge, onClose, onSuccess }: KnowledgeBaseFormProps) {
  const [title, setTitle] = useState(knowledge?.title || '')
  const [content, setContent] = useState(knowledge?.content || '')
  const [category, setCategory] = useState(knowledge?.category || '')
  const [tagsInput, setTagsInput] = useState(knowledge?.tags?.join(', ') || '')
  const [isActive, setIsActive] = useState(knowledge?.is_active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!knowledge

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (!content.trim()) {
      setError('内容を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // タグを配列に変換
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      if (isEditing) {
        const result = await updateKnowledge(knowledge.id, {
          title,
          content,
          category: category || undefined,
          tags,
          is_active: isActive,
        })

        if (result.error) {
          setError(result.error)
        } else {
          // 更新成功 - 最新データを取得するためにリロード
          window.location.reload()
        }
      } else {
        const result = await createKnowledge({
          title,
          content,
          category: category || undefined,
          tags,
          is_active: isActive,
        })

        if (result.error) {
          setError(result.error)
        } else if (result.knowledge) {
          onSuccess(result.knowledge as Knowledge)
        }
      }
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'ナレッジを編集' : 'ナレッジを追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium mb-1">
              タイトル <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="例: ログイン方法について"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/200文字
            </div>
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリー</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="例: アカウント、機能、トラブルシューティング"
            />
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium mb-1">タグ</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="カンマ区切りで入力（例: ログイン, パスワード, 認証）"
            />
            <div className="text-xs text-muted-foreground mt-1">
              カンマ区切りで複数のタグを入力できます
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              内容 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[200px]"
              placeholder="AIが参照する情報を入力してください。&#10;&#10;例:&#10;ログイン方法:&#10;1. トップページの「ログイン」ボタンをクリック&#10;2. メールアドレスとパスワードを入力&#10;3. 「ログイン」ボタンをクリック&#10;&#10;パスワードを忘れた場合は「パスワードを忘れた方はこちら」からリセットできます。"
            />
            <div className="text-xs text-muted-foreground mt-1">
              できるだけ具体的に記載することで、AIがより適切な回答を生成できます
            </div>
          </div>

          {/* 有効/無効 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              有効化（AI返信で参照されます）
            </label>
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className={cn(
                'flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? '処理中...' : isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
