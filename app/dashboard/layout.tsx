import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { FloatingChatButton } from '@/components/features/chat/floating-chat-button'
import { getTotalGroupUnreadCount } from '@/lib/actions/group-chat'
import { getUnreadCount } from '@/lib/actions/chat'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get unread notification count and user role
  const supabase = await createClient()
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  // Get group chat unread count
  const { count: groupUnreadCount } = await getTotalGroupUnreadCount()

  // Get direct chat unread count
  const { count: directUnreadCount } = await getUnreadCount()

  // Total chat unread count
  const totalChatUnreadCount = (groupUnreadCount || 0) + (directUnreadCount || 0)

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin'

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single()

  // Redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <DashboardSidebar
        userEmail={user.email || ''}
        isAdmin={isAdmin}
        unreadCount={unreadCount || 0}
        totalChatUnreadCount={totalChatUnreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-10">
          {children}
        </main>
      </div>

      {/* フローティングチャットボタン */}
      <FloatingChatButton />
    </div>
  )
}
