'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'

interface MessageBubbleProps {
  message: string
  senderName: string
  isAdmin: boolean
  timestamp: string
  isOwnMessage?: boolean // 自分のメッセージかどうか
}

export function MessageBubble({
  message,
  senderName,
  isAdmin,
  timestamp,
  isOwnMessage = false,
}: MessageBubbleProps) {
  // 自分のメッセージは右側、相手のメッセージは左側
  const isRightAlign = isOwnMessage

  return (
    <div
      className={cn(
        'flex',
        isRightAlign ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] space-y-1',
          isRightAlign ? 'items-end' : 'items-start'
        )}
      >
        {/* 送信者名 */}
        <div
          className={cn(
            'text-xs text-muted-foreground px-2',
            isRightAlign ? 'text-right' : 'text-left'
          )}
        >
          {isAdmin ? (
            <span className="font-semibold text-orange-600">
              {senderName}（運営）
            </span>
          ) : (
            <span>{senderName}</span>
          )}
        </div>

        {/* メッセージバブル */}
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isOwnMessage
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-900'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm">
            {message}
          </p>
        </div>

        {/* タイムスタンプ */}
        <div
          className={cn(
            'text-xs text-muted-foreground px-2',
            isRightAlign ? 'text-right' : 'text-left'
          )}
        >
          {format(new Date(timestamp), 'HH:mm', { locale: ja })}
        </div>
      </div>
    </div>
  )
}
