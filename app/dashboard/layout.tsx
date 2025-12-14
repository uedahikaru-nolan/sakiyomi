import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/utils/get-user'
import { signout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { FloatingChatButton } from '@/components/features/chat/floating-chat-button'
import { getTotalGroupUnreadCount } from '@/lib/actions/group-chat'
import { getUnreadCount } from '@/lib/actions/chat'

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Modern Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {/* Logo with gradient */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              SAKIYOMI
            </h1>

            {/* Modern Navigation */}
            <nav className="hidden md:flex gap-2">
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out"
              >
                ダッシュボード
              </a>
              <a
                href="/dashboard/courses"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out"
              >
                コース
              </a>
              <Link
                href="/dashboard/chats"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out relative"
              >
                💬 チャット
                {totalChatUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {totalChatUnreadCount > 9 ? '9+' : totalChatUnreadCount}
                  </Badge>
                )}
              </Link>
              <a
                href="/dashboard/community"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out"
              >
                コミュニティ
              </a>
              <a
                href="/dashboard/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out"
              >
                プロフィール
              </a>
              <a
                href="/dashboard/instagram"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all duration-200 ease-in-out"
              >
                Instagram
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Button */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 hover:bg-orange-50/50 rounded-lg transition-all duration-200"
            >
              <span className="text-2xl">🔔</span>
              {unreadCount && unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>

            {/* Admin Button */}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  🛡️ 管理者画面
                </Button>
              </Link>
            )}

            {/* User Email */}
            <span className="hidden lg:block text-sm text-gray-600 px-3 py-1.5 bg-gray-100/50 rounded-lg">
              {user.email}
            </span>

            {/* Logout Button */}
            <form action={signout}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>

      {/* フローティングチャットボタン */}
      <FloatingChatButton />
    </div>
  )
}
