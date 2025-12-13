'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, Circle } from 'lucide-react'

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

interface ChatRoomListProps {
  rooms: ChatRoom[]
  selectedRoomId?: string
  onSelectRoom?: (roomId: string) => void
}

export function ChatRoomList({ rooms, selectedRoomId, onSelectRoom }: ChatRoomListProps) {
  const router = useRouter()

  const handleSelectRoom = (roomId: string) => {
    if (onSelectRoom) {
      onSelectRoom(roomId)
    } else {
      router.push(`/admin/chats?room=${roomId}`)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white border-r">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          チャット
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {rooms.length}件の会話
        </p>
      </div>

      {/* チャットルーム一覧 */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            チャットルームがありません
          </div>
        ) : (
          <div className="divide-y">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={cn(
                  'w-full p-4 text-left transition-colors hover:bg-gray-50',
                  selectedRoomId === room.id && 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-600'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* アバター */}
                  <div className="flex-shrink-0">
                    {room.user.avatar_url ? (
                      <img
                        src={room.user.avatar_url}
                        alt={room.user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                        {room.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm truncate">
                        {room.user.name}
                      </div>
                      {room.last_message_at && (
                        <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(room.last_message_at), {
                            addSuffix: false,
                            locale: ja,
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground truncate flex-1">
                        {room.last_message || 'メッセージなし'}
                      </div>
                      {room.unread_count > 0 && (
                        <div className="flex-shrink-0 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                          {room.unread_count > 9 ? '9+' : room.unread_count}
                        </div>
                      )}
                    </div>

                    {/* ステータス */}
                    <div className="mt-1 flex items-center gap-2">
                      <Circle
                        className={cn(
                          'h-2 w-2 fill-current',
                          room.status === 'open' && 'text-green-600',
                          room.status === 'resolved' && 'text-blue-600',
                          room.status === 'closed' && 'text-gray-400'
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {room.status === 'open' && '対応中'}
                        {room.status === 'resolved' && '解決済'}
                        {room.status === 'closed' && 'クローズ'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
