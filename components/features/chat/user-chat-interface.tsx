'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UnifiedChatList } from './unified-chat-list'
import { UserGroupMessageArea } from './user-group-message-area'
import { UserDirectChat } from './user-direct-chat'
import { getUnreadCount } from '@/lib/actions/chat'

interface GroupChat {
  id: string
  name: string
  description: string | null
  created_by: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  member_count?: number
  unread_count?: number
  last_message?: string
}

interface ChatRoom {
  id: string
  user_id: string
  status: string
  created_at: string
  updated_at: string
}

interface UserChatInterfaceProps {
  groups: GroupChat[]
  chatRoom?: ChatRoom
  selectedGroupId?: string
  selectedRoomId?: string
  selectedType?: string
}

export function UserChatInterface({
  groups,
  chatRoom,
  selectedGroupId,
  selectedRoomId,
  selectedType
}: UserChatInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [chatType, setChatType] = useState<'direct' | 'group' | null>(null)
  const [directUnreadCount, setDirectUnreadCount] = useState(0)

  // 未読数を取得
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await getUnreadCount()
      setDirectUnreadCount(count || 0)
    }
    fetchUnreadCount()
  }, [])

  // URLパラメータから選択状態を復元
  useEffect(() => {
    const type = searchParams.get('type') as 'direct' | 'group' | null
    const groupId = searchParams.get('group')
    const roomId = searchParams.get('room')

    if (type === 'direct' && roomId) {
      setSelectedId(roomId)
      setChatType('direct')
    } else if (type === 'group' && groupId) {
      setSelectedId(groupId)
      setChatType('group')
    } else if (selectedType === 'direct' && selectedRoomId) {
      setSelectedId(selectedRoomId)
      setChatType('direct')
    } else if (selectedGroupId) {
      setSelectedId(selectedGroupId)
      setChatType('group')
    } else if (chatRoom) {
      // デフォルトで運営チャットを選択
      setSelectedId(chatRoom.id)
      setChatType('direct')
    }
  }, [searchParams, selectedGroupId, selectedRoomId, selectedType, chatRoom])

  const handleChatSelect = (id: string, type: 'direct' | 'group') => {
    setSelectedId(id)
    setChatType(type)
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', type)
    if (type === 'direct') {
      params.set('room', id)
      params.delete('group')
    } else {
      params.set('group', id)
      params.delete('room')
    }
    router.push(`/dashboard/chats?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 h-full py-6">
      {/* 左側: 統合チャット一覧 */}
      <div className="w-80 flex-shrink-0 h-full">
        <UnifiedChatList
          groups={groups}
          chatRoom={chatRoom}
          selectedId={selectedId}
          selectedType={chatType}
          onChatSelect={handleChatSelect}
          directUnreadCount={directUnreadCount}
        />
      </div>

      {/* 右側: メッセージエリア */}
      <div className="flex-1 h-full">
        {selectedId && chatType === 'direct' ? (
          <UserDirectChat roomId={selectedId} />
        ) : selectedId && chatType === 'group' ? (
          <UserGroupMessageArea groupId={selectedId} />
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg h-full flex items-center justify-center">
            <div className="text-center p-12">
              <div className="inline-block p-6 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mb-6">
                <span className="text-6xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3">
                チャットを選択してください
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                左側のリストからチャットを選んで会話を始めましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
