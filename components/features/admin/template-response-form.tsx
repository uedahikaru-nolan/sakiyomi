'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createTemplateResponse, updateTemplateResponse } from '@/lib/actions/template-responses'

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
}

interface TemplateResponseFormProps {
  template: TemplateResponse | null
  onClose: () => void
  onSuccess: (template: TemplateResponse) => void
}

export function TemplateResponseForm({ template, onClose, onSuccess }: TemplateResponseFormProps) {
  const [title, setTitle] = useState(template?.title || '')
  const [triggerKeywords, setTriggerKeywords] = useState(
    template?.trigger_keywords.join(', ') || ''
  )
  const [responseText, setResponseText] = useState(template?.response_text || '')
  const [description, setDescription] = useState(template?.description || '')
  const [matchType, setMatchType] = useState(template?.match_type || 'contains')
  const [priority, setPriority] = useState(template?.priority ?? 0)
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // キーワードを配列に変換
    const keywordsArray = triggerKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    const data = {
      title,
      trigger_keywords: keywordsArray,
      response_text: responseText,
      description: description || undefined,
      match_type: matchType,
      priority: Number(priority),
      is_active: isActive,
    }

    let result
    if (template) {
      result = await updateTemplateResponse(template.id, data)
    } else {
      result = await createTemplateResponse(data)
    }

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      // 成功時は更新されたデータまたは新規データを返す
      if (result.template) {
        onSuccess(result.template)
      } else if (template) {
        onSuccess({ ...template, ...data })
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {template ? 'テンプレート応答を編集' : 'テンプレート応答を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="例: 契約期間について"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              トリガーキーワード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={triggerKeywords}
              onChange={(e) => setTriggerKeywords(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="例: 契約期間, 契約, 期間 (カンマ区切り)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              カンマ(,)で区切って複数のキーワードを設定できます
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              マッチタイプ
            </label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="contains">部分一致</option>
              <option value="exact">完全一致</option>
              <option value="starts_with">前方一致</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              部分一致: メッセージにキーワードが含まれていればマッチ<br />
              完全一致: メッセージとキーワードが完全に一致した場合のみマッチ<br />
              前方一致: メッセージがキーワードで始まる場合のみマッチ
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              返信内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              placeholder="自動返信する内容を入力してください"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              placeholder="このテンプレートの用途や備考を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              数値が大きいほど優先的にマッチします（デフォルト: 0）
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              有効にする
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : template ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
