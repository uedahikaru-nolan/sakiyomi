import { getGroupChatsList } from '@/lib/actions/group-chat'
import { createOrGetChatRoom } from '@/lib/actions/chat'
import { UserChatInterface } from '@/components/features/chat/user-chat-interface'

interface PageProps {
  searchParams: Promise<{
    group?: string
    room?: string
    type?: string
  }>
}

export default async function UserChatsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // グループチャット一覧を取得
  const groupResult = await getGroupChatsList()

  // 1対1チャットルームを取得
  const chatRoomResult = await createOrGetChatRoom()

  return (
    <div className="-mx-6 -my-8 h-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Modern Header */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm flex-shrink-0">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">💬 チャット</h1>
          <p className="text-sm text-gray-600 mt-2">
            運営者との1対1チャットやグループチャットでコミュニケーションできます
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto max-w-7xl h-full px-8">
          <UserChatInterface
            groups={groupResult.groups || []}
            chatRoom={chatRoomResult.chatRoom}
            selectedGroupId={params.group}
            selectedRoomId={params.room}
            selectedType={params.type}
          />
        </div>
      </div>
    </div>
  )
}
