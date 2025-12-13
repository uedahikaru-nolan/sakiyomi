import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { getChatRoomsList } from '@/lib/actions/admin-chat'
import { getGroupChatsList, getAllUsers } from '@/lib/actions/group-chat'
import { UnifiedAdminChatInterface } from '@/components/features/admin/unified-admin-chat-interface'

export default async function AdminChatsPage({
  searchParams,
}: {
  searchParams: Promise<{
    room?: string
    group?: string
    tab?: string
    search?: string
    status?: string
  }>
}) {
  // searchParamsを展開
  const params = await searchParams

  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  // Fetch 1対1 chat rooms
  const chatResult = await getChatRoomsList({
    search: params.search,
    status: params.status as 'open' | 'resolved' | 'closed' | undefined,
  })

  // Fetch group chats
  const groupResult = await getGroupChatsList()

  // Fetch all users for group creation
  const usersResult = await getAllUsers()

  if (chatResult.error || groupResult.error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">エラーが発生しました</p>
          <p className="text-sm text-muted-foreground">
            {chatResult.error || groupResult.error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <UnifiedAdminChatInterface
      rooms={chatResult.rooms || []}
      groups={groupResult.groups || []}
      users={usersResult.users || []}
      selectedRoomId={params.room}
      selectedGroupId={params.group}
      activeTab={params.tab || 'direct'}
    />
  )
}
