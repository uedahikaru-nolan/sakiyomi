'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useChatMessages } from '@/lib/hooks/useChatMessages'
import { MessageList } from './message-list'
import { cn } from '@/lib/utils/cn'

interface UserDirectChatProps {
  roomId: string
}

export function UserDirectChat({ roomId }: UserDirectChatProps) {
  const { messages, isLoading, isSending, error, sendMessage, markAsRead } = useChatMessages(roomId)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      <div className="flex items-center justify-between border-b bg-orange-600 p-4 text-white">
        <div>
          <h3 className="font-semibold">運営サポート</h3>
          <p className="text-xs text-orange-100">お気軽にご質問ください</p>
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
          <MessageList messages={messages} />
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
      </div>
    </div>
  )
}
