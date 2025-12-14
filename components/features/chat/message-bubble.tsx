'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { Pencil, Trash2 } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  senderName: string
  isAdmin: boolean
  timestamp: string
  isOwnMessage?: boolean // 自分のメッセージかどうか
  messageId?: string // メッセージID
  canEdit?: boolean // 編集可能かどうか（管理者が自分のメッセージの場合のみtrue）
  onEdit?: (messageId: string, currentMessage: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({
  message,
  senderName,
  isAdmin,
  timestamp,
  isOwnMessage = false,
  messageId,
  canEdit = false,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  // 自分のメッセージは右側、相手のメッセージは左側
  const isRightAlign = isOwnMessage

  return (
    <div
      className={cn(
        'flex group',
        isRightAlign ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => canEdit && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'max-w-[80%] space-y-1 relative',
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
        <div className="relative">
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

          {/* 編集・削除ボタン */}
          {canEdit && showActions && messageId && (
            <div className={cn(
              'absolute top-0 flex gap-1 bg-white border rounded-md shadow-lg p-1',
              isRightAlign ? 'right-full mr-2' : 'left-full ml-2'
            )}>
              <button
                onClick={() => onEdit?.(messageId, message)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="編集"
              >
                <Pencil className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete?.(messageId)}
                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                title="削除"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </button>
            </div>
          )}
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
