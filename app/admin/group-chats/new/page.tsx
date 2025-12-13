import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { getAllUsers } from '@/lib/actions/group-chat'
import { GroupChatCreateForm } from '@/components/features/admin/group-chat-create-form'

export default async function NewGroupChatPage() {
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

  // Fetch all users
  const result = await getAllUsers()

  if (result.error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">エラーが発生しました</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新規グループチャット作成</h1>
        <p className="text-sm text-muted-foreground mt-1">
          グループチャットを作成して、複数のユーザーと会話を開始できます
        </p>
      </div>

      <GroupChatCreateForm users={result.users || []} />
    </div>
  )
}
