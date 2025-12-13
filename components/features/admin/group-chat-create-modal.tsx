'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createGroupChat } from '@/lib/actions/group-chat'
import { UserSelector } from './user-selector'
import { X, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
}

interface GroupChatCreateModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
}

export function GroupChatCreateModal({ isOpen, onClose, users }: GroupChatCreateModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('グループ名を入力してください')
      return
    }

    if (selectedUserIds.length === 0) {
      setError('最低1人のメンバーを選択してください')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createGroupChat(
        name,
        description || null,
        selectedUserIds
      )

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result.groupChat) {
        // 作成成功
        setName('')
        setDescription('')
        setSelectedUserIds([])
        router.refresh()
        onClose()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('予期しないエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setName('')
      setDescription('')
      setSelectedUserIds([])
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* モーダル */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">新規グループチャット作成</h2>
                <p className="text-sm text-muted-foreground">複数のユーザーとグループで会話できます</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* コンテンツ */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-88px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* グループ名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例: プロジェクトAチーム"
                  maxLength={100}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {name.length}/100文字
                </p>
              </div>

              {/* グループ説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ説明（オプション）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="このグループチャットの目的や説明を入力してください"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* メンバー選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メンバー選択 <span className="text-red-500">*</span>
                </label>
                <UserSelector
                  users={users}
                  selectedUserIds={selectedUserIds}
                  onSelectionChange={setSelectedUserIds}
                />
              </div>
            </div>

            {/* フッター */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || selectedUserIds.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Users className="h-4 w-4" />
                {isSubmitting ? '作成中...' : 'グループチャットを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
