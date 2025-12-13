'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Users } from 'lucide-react'
import { useGroupChatMessages } from '@/lib/hooks/useGroupChatMessages'
import { MessageList } from '@/components/features/chat/message-list'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { getGroupChatDetails } from '@/lib/actions/group-chat'

interface AdminGroupMessageAreaProps {
  groupId: string
}

export function AdminGroupMessageArea({ groupId }: AdminGroupMessageAreaProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [groupDetails, setGroupDetails] = useState<any>(null)
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

  // Enterキーで送信（Shift+Enterで改行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // テキストエリアの自動リサイズ
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    const textarea = e.target
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 120)
    textarea.style.height = `${newHeight}px`
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{groupDetails?.name || 'グループチャット'}</h3>
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
      <div className="flex-1 overflow-hidden bg-gray-50">
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

        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className={cn(
              'flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[40px] max-h-[120px]'
            )}
            disabled={isSending}
            rows={1}
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
          <span>Enterで送信 / Shift+Enterで改行</span>
          {inputValue.length > 0 && (
            <span className="ml-2">
              {inputValue.length}/2000
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
