'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageCircle, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ChatRoomList } from './chat-room-list'
import { AdminMessageArea } from './admin-message-area'
import { GroupChatListAdmin } from './group-chat-list-admin'
import { AdminGroupMessageArea } from './admin-group-message-area'
import { GroupChatCreateModal } from './group-chat-create-modal'
import { GroupChatEditModal } from './group-chat-edit-modal'
import { getGroupChatDetails } from '@/lib/actions/group-chat'

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

interface GroupChat {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  members_count: number
  last_message: string | null
  last_message_sender: string | null
  last_message_at: string | null
  unread_count: number
}

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
}

interface UnifiedAdminChatInterfaceProps {
  rooms: ChatRoom[]
  groups: GroupChat[]
  users: User[]
  selectedRoomId?: string
  selectedGroupId?: string
  activeTab?: string
}

export function UnifiedAdminChatInterface({
  rooms: initialRooms,
  groups: initialGroups,
  users,
  selectedRoomId,
  selectedGroupId,
  activeTab = 'direct',
}: UnifiedAdminChatInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupData, setEditingGroupData] = useState<any>(null)

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    // URLパラメータを更新（選択中のチャットをクリア）
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    params.delete('room')
    params.delete('group')
    router.push(`/admin/chats?${params.toString()}`)
  }

  const handleSelectRoom = (roomId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'direct')
    params.set('room', roomId)
    params.delete('group')
    router.push(`/admin/chats?${params.toString()}`)
  }

  const handleSelectGroup = (groupId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'group')
    params.set('group', groupId)
    params.delete('room')
    router.push(`/admin/chats?${params.toString()}`)
  }

  const handleEditGroup = async (groupId: string) => {
    setEditingGroupId(groupId)
    setIsEditModalOpen(true)

    // グループの詳細を取得
    const result = await getGroupChatDetails(groupId)
    if (result.group) {
      setEditingGroupData({
        id: groupId,
        name: result.group.name,
        description: result.group.description,
        icon_url: result.group.icon_url,
        is_read_only: result.group.is_read_only,
        members: result.group.members?.map((m: any) => m.user_id) || [],
      })
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingGroupId(null)
    setEditingGroupData(null)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Modern Tab Header */}
      <div className="bg-white border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('direct')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                currentTab === 'direct'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <MessageCircle className="h-4 w-4" />
              1対1チャット
              {initialRooms.length > 0 && (
                <span className={cn(
                  "ml-1 px-2 py-0.5 text-xs rounded-full font-semibold",
                  currentTab === 'direct'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                )}>
                  {initialRooms.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('group')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                currentTab === 'group'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Users className="h-4 w-4" />
              グループチャット
              {initialGroups.length > 0 && (
                <span className={cn(
                  "ml-1 px-2 py-0.5 text-xs rounded-full font-semibold",
                  currentTab === 'group'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                )}>
                  {initialGroups.length}
                </span>
              )}
            </button>
          </div>

          {/* グループ作成ボタン（グループタブのときのみ表示） */}
          {currentTab === 'group' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="h-4 w-4" />
              グループ作成
            </button>
          )}
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'direct' ? (
          <div className="flex h-full gap-0 bg-white">
            {/* 左側: チャットルーム一覧 */}
            <div className="w-80 flex-shrink-0 border-r">
              <ChatRoomList
                rooms={initialRooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={handleSelectRoom}
              />
            </div>

            {/* 右側: メッセージエリア */}
            <div className="flex-1">
              {selectedRoomId ? (
                <AdminMessageArea roomId={selectedRoomId} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold mb-2">チャットルームを選択してください</p>
                    <p className="text-sm">左側のリストからユーザーを選択すると、会話が表示されます</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full gap-0 bg-white">
            {/* 左側: グループチャット一覧 */}
            <div className="w-80 flex-shrink-0 border-r overflow-y-auto p-4">
              <GroupChatListAdmin
                groups={initialGroups}
                onSelectGroup={handleSelectGroup}
                onEditGroup={handleEditGroup}
                selectedGroupId={selectedGroupId}
              />
            </div>

            {/* 右側: グループメッセージエリア */}
            <div className="flex-1">
              {selectedGroupId ? (
                <AdminGroupMessageArea groupId={selectedGroupId} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold mb-2">グループチャットを選択してください</p>
                    <p className="text-sm">左側のリストからグループを選択すると、会話が表示されます</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* グループ作成モーダル */}
      <GroupChatCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
      />

      {/* グループ編集モーダル */}
      <GroupChatEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        users={users}
        groupChat={editingGroupData}
      />
    </div>
  )
}
