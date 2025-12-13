'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import { useChatMessages } from '@/lib/hooks/useChatMessages'
import { MessageList } from './message-list'
import { cn } from '@/lib/utils/cn'

interface ChatWindowProps {
  roomId: string
  onClose: () => void
}

export function ChatWindow({ roomId, onClose }: ChatWindowProps) {
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

    console.log('[ChatWindow] Submitting message')

    // メッセージを送信
    const success = await sendMessage(message)

    console.log('[ChatWindow] Send result:', success)

    if (success) {
      console.log('[ChatWindow] Clearing input')
      // 入力をクリア
      setInputValue('')
      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.focus() // フォーカスを戻す
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
    const newHeight = Math.min(textarea.scrollHeight, 120) // 最大120px (約5行)
    textarea.style.height = `${newHeight}px`
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col bg-white shadow-2xl',
        // デスクトップ: 右下ポップアップ
        'md:bottom-24 md:right-6 md:h-[600px] md:w-96 md:rounded-lg',
        // モバイル: フルスクリーン
        'max-md:inset-0 max-md:h-full max-md:w-full'
      )}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-orange-600 p-4 text-white md:rounded-t-lg">
        <div>
          <h3 className="font-semibold">運営サポート</h3>
          <p className="text-xs text-orange-100">お気軽にご質問ください</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-orange-700 transition-colors"
          aria-label="チャットを閉じる"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-hidden">
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
      <div className="border-t p-4">
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
