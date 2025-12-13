import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { getGroupChatsList } from '@/lib/actions/group-chat'
import { GroupChatListAdmin } from '@/components/features/admin/group-chat-list-admin'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminGroupChatsPage() {
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

  // Fetch group chats
  const result = await getGroupChatsList()

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
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">グループチャット</h1>
          <p className="text-sm text-muted-foreground mt-1">
            複数のユーザーとグループチャットができます
          </p>
        </div>
        <Link
          href="/admin/group-chats/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規グループ作成
        </Link>
      </div>

      {/* グループチャット一覧 */}
      <GroupChatListAdmin groups={result.groups || []} />
    </div>
  )
}
