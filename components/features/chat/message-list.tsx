'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './message-bubble'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Message {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender: {
    id: string
    name: string
    avatar_url: string | null
    role: string
  }
}

interface MessageListProps {
  messages: Message[]
  currentUserId?: string // 現在のユーザーID（admin画面用）
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 初回読み込み時は即座にスクロール
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 100)
    }
  }, [])

  // 新しいメッセージが追加されたら自動スクロール
  const prevMessagesLengthRef = useRef(messages.length)
  useEffect(() => {
    // メッセージが追加された場合のみスクロール
    if (messages.length > prevMessagesLengthRef.current) {
      console.log('[MessageList] New message added, scrolling to bottom')
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold">チャットを開始しましょう</p>
          <p className="mt-2 text-xs">
            何かご質問やご相談がございましたら、
            <br />
            お気軽にメッセージを送信してください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message, index) => {
        const isAdmin = message.sender.role === 'admin' || message.sender.role === 'super_admin'
        const isOwnMessage = currentUserId ? message.sender_id === currentUserId : !isAdmin
        const showDateSeparator =
          index === 0 ||
          new Date(messages[index - 1].created_at).toDateString() !==
            new Date(message.created_at).toDateString()

        return (
          <div key={message.id}>
            {/* 日付区切り */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </div>
              </div>
            )}

            <MessageBubble
              message={message.message}
              senderName={message.sender.name}
              isAdmin={isAdmin}
              timestamp={message.created_at}
              isOwnMessage={isOwnMessage}
            />
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
