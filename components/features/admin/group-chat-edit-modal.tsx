'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateGroupChat } from '@/lib/actions/group-chat'
import { UserSelector } from './user-selector'
import { X, Users, Upload, Edit } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
}

interface GroupChat {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  is_read_only: boolean
  members: string[]
}

interface GroupChatEditModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  groupChat: GroupChat | null
}

export function GroupChatEditModal({ isOpen, onClose, users, groupChat }: GroupChatEditModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [removeIcon, setRemoveIcon] = useState(false)

  // グループチャット情報をフォームに設定
  useEffect(() => {
    if (groupChat) {
      setName(groupChat.name)
      setDescription(groupChat.description || '')
      setSelectedUserIds(groupChat.members || [])
      setIsReadOnly(groupChat.is_read_only || false)
      setIconPreview(groupChat.icon_url)
      setIconFile(null)
      setRemoveIcon(false)
    }
  }, [groupChat])

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください')
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    setIconFile(file)
    setRemoveIcon(false)
    setError(null)

    // プレビュー表示
    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIcon = () => {
    setIconFile(null)
    setIconPreview(null)
    setRemoveIcon(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!groupChat) {
      setError('グループチャット情報が見つかりません')
      return
    }

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
      const result = await updateGroupChat(
        groupChat.id,
        name,
        description || null,
        selectedUserIds,
        isReadOnly,
        iconFile,
        removeIcon
      )

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result.success) {
        // 更新成功
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
      setError(null)
      onClose()
    }
  }

  if (!isOpen || !groupChat) return null

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
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">グループチャット編集</h2>
                <p className="text-sm text-muted-foreground">グループの情報を更新します</p>
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

              {/* グループアイコン */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  グループアイコン（オプション）
                </label>
                <div className="flex items-center gap-6">
                  {/* プレビュー */}
                  <div className="relative">
                    {iconPreview ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                          src={iconPreview}
                          alt="グループアイコン"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveIcon}
                          disabled={isSubmitting}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                          aria-label="画像を削除"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* アップロードボタン */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="groupIconEdit"
                      accept="image/*"
                      onChange={handleIconChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    <label
                      htmlFor="groupIconEdit"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      画像を選択
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG、PNG、GIF形式、最大5MBまで
                    </p>
                  </div>
                </div>
              </div>

              {/* グループ名 */}
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="editName"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例: プロジェクトAチーム"
                  maxLength={100}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {name.length}/100文字
                </p>
              </div>

              {/* グループ説明 */}
              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ説明（オプション）
                </label>
                <textarea
                  id="editDescription"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="このグループチャットの目的や説明を入力してください"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* 読み取り専用オプション */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={e => setIsReadOnly(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    読み取り専用（管理者のみメッセージ送信可能）
                  </span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  チェックを入れると、ユーザーはメッセージを受信のみできます（一方通行）
                </p>
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
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Edit className="h-4 w-4" />
                {isSubmitting ? '更新中...' : 'グループチャットを更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
