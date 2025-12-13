'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatRoomList } from './chat-room-list'
import { AdminMessageArea } from './admin-message-area'

interface ChatRoom {
  id: string
  user_id: string
  status: string
  last_message_at: string | null
  last_message: string | null
  created_at: string
  user: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  unread_count: number
}

interface AdminChatInterfaceProps {
  rooms: ChatRoom[]
  selectedRoomId?: string
}

export function AdminChatInterface({ rooms: initialRooms, selectedRoomId }: AdminChatInterfaceProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const router = useRouter()

  // 新しいメッセージが来たらルーム一覧を更新
  const updateRoomOnNewMessage = useCallback(async (roomId: string, message: string) => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            last_message: message,
            last_message_at: new Date().toISOString(),
          }
        }
        return room
      }).sort((a, b) => {
        // 最新メッセージが上に来るようにソート
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return bTime - aTime
      })
    })
  }, [])

  // Realtime購読
  useEffect(() => {
    const supabase = createClient()

    console.log('[AdminChatInterface] Setting up Realtime subscription')

    const channel = supabase
      .channel('admin-chat-rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          console.log('[AdminChatInterface] New message received:', payload.new)

          const newMessage = payload.new as any

          // メッセージ内容とルームIDを取得
          if (newMessage.chat_room_id && newMessage.message) {
            await updateRoomOnNewMessage(newMessage.chat_room_id, newMessage.message)
          }

          // ページ全体を更新（未読数なども更新されるように）
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload) => {
          console.log('[AdminChatInterface] Room updated:', payload.new)
          // ルームのステータスが変更された場合など
          router.refresh()
        }
      )
      .subscribe((status) => {
        console.log('[AdminChatInterface] Subscription status:', status)
      })

    return () => {
      console.log('[AdminChatInterface] Cleaning up Realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [updateRoomOnNewMessage, router])

  // initialRoomsが更新されたらstateも更新
  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 左側: チャットルーム一覧 */}
      <div className="w-80 flex-shrink-0">
        <ChatRoomList rooms={rooms} selectedRoomId={selectedRoomId} />
      </div>

      {/* 右側: メッセージエリア */}
      <div className="flex-1 border-l">
        {selectedRoomId ? (
          <AdminMessageArea roomId={selectedRoomId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="font-semibold mb-2">チャットルームを選択してください</p>
              <p className="text-sm">左側のリストからユーザーを選択すると、会話が表示されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
