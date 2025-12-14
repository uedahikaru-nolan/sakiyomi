'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Users } from 'lucide-react'
import { useGroupChatMessages } from '@/lib/hooks/useGroupChatMessages'
import { MessageList } from '@/components/features/chat/message-list'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { getGroupChatDetails } from '@/lib/actions/group-chat'
import Image from 'next/image'

interface UserGroupMessageAreaProps {
  groupId: string
}

export function UserGroupMessageArea({ groupId }: UserGroupMessageAreaProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [groupDetails, setGroupDetails] = useState<any>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const { messages, isLoading, isSending, error, sendMessage, markAsRead } = useGroupChatMessages(groupId)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 現在のユーザーIDを取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // グループ詳細を取得
  useEffect(() => {
    const fetchGroupDetails = async () => {
      const result = await getGroupChatDetails(groupId)
      if (result.group) {
        setGroupDetails(result.group)
        setIsReadOnly(result.group.is_read_only || false)
      }
    }
    fetchGroupDetails()
  }, [groupId])

  // チャットを開いたら既読処理
  useEffect(() => {
    markAsRead()
  }, [markAsRead])

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const message = inputValue.trim()
    if (!message || isSending) return

    const success = await sendMessage(message)

    if (success) {
      setInputValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.focus()
      }
    }
  }

  // Cmd+Enter（またはCtrl+Enter）で送信、Enterで改行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // テキストエリアの自動リサイズ
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    const textarea = e.target
    textarea.style.height = '40px' // 最小高さにリセット
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200)
    textarea.style.height = `${newHeight}px`
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full max-h-[80vh] flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {groupDetails?.icon_url ? (
              <Image
                src={groupDetails.icon_url}
                alt={groupDetails.name || 'グループ'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{groupDetails?.name || 'グループチャット'}</h3>
            {groupDetails?.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {groupDetails.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {groupDetails?.members?.length || 0}人のメンバー
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-muted-foreground">読み込み中...</div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={currentUserId || undefined} />
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        {error && (
          <div className="mb-2 text-xs text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <div className="font-semibold mb-1">エラー</div>
            <div>{error}</div>
          </div>
        )}

        {isReadOnly ? (
          <div className="text-center py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-muted-foreground">
              このグループは読み取り専用です。管理者からのお知らせを受信できます。
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                className={cn(
                  'flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'min-h-[40px] max-h-[400px]'
                )}
                disabled={isSending}
                style={{ height: '40px' }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-md',
                  'bg-orange-600 text-white',
                  'hover:bg-orange-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
                aria-label="送信"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-2 text-xs text-muted-foreground">
              <span>Cmd+Enterで送信 / Enterで改行</span>
              {inputValue.length > 0 && (
                <span className="ml-2">
                  {inputValue.length}/2000
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
