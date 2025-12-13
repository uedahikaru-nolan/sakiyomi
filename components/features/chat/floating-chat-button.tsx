'use client'

import { MessageCircle } from 'lucide-react'
import { useChat } from '@/lib/hooks/useChat'
import { ChatWindow } from './chat-window'
import { cn } from '@/lib/utils/cn'

export function FloatingChatButton() {
  const { isOpen, unreadCount, openChat, closeChat, chatRoom } = useChat()

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={openChat}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'h-14 w-14 rounded-full',
          'bg-orange-600 hover:bg-orange-700',
          'text-white shadow-lg',
          'transition-all duration-200',
          'flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          isOpen && 'scale-0'
        )}
        aria-label="チャットを開く"
      >
        <MessageCircle className="h-6 w-6" />

        {/* 未読バッジ */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* パルスアニメーション（未読あり） */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          </span>
        )}
      </button>

      {/* チャットウィンドウ */}
      {isOpen && chatRoom && (
        <ChatWindow
          roomId={chatRoom.id}
          onClose={closeChat}
        />
      )}
    </>
  )
}
