'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserGroupChatList } from './user-group-chat-list'
import { UserGroupMessageArea } from './user-group-message-area'

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

interface UserGroupChatInterfaceProps {
  groups: GroupChat[]
  selectedGroupId?: string
}

export function UserGroupChatInterface({ groups, selectedGroupId }: UserGroupChatInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(selectedGroupId || null)

  // URLパラメータからグループIDを取得
  useEffect(() => {
    const groupId = searchParams.get('group')
    if (groupId) {
      setSelectedGroup(groupId)
    }
  }, [searchParams])

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('group', groupId)
    router.push(`/dashboard/chats?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
      {/* 左側: グループチャット一覧 */}
      <div className="lg:col-span-1">
        <UserGroupChatList
          groups={groups}
          selectedGroupId={selectedGroup}
          onGroupSelect={handleGroupSelect}
        />
      </div>

      {/* 右側: メッセージエリア */}
      <div className="lg:col-span-2">
        {selectedGroup ? (
          <UserGroupMessageArea groupId={selectedGroup} />
        ) : (
          <div className="bg-white rounded-lg border shadow-sm h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                グループチャットを選択してください
              </h3>
              <p className="text-sm text-muted-foreground">
                左側のリストからグループを選んで会話を始めましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
