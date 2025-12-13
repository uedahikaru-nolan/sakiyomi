'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createGroupChat } from '@/lib/actions/group-chat'
import { UserSelector } from './user-selector'
import { ArrowLeft, Users } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
}

interface GroupChatCreateFormProps {
  users: User[]
}

export function GroupChatCreateForm({ users }: GroupChatCreateFormProps) {
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
        // 作成成功、グループチャット一覧ページへ遷移
        router.push('/admin/group-chats')
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('予期しないエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* ボタン */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
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
  )
}
