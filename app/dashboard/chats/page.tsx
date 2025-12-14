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
    <div className="-m-4 h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-orange-50">
      <div className="px-4 py-6 flex-shrink-0">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">💬 チャット</h1>
          <p className="text-sm text-muted-foreground mt-1">
            運営者との1対1チャットやグループチャットでコミュニケーションできます
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="mx-auto max-w-7xl h-full">
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
