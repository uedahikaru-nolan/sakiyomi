import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/utils/get-user'
import { signout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { FloatingChatButton } from '@/components/features/chat/floating-chat-button'

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
    <div className="min-h-screen bg-orange-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">SAKIYOMI</h1>
            <nav className="hidden md:flex gap-4">
              <a href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                ダッシュボード
              </a>
              <a href="/dashboard/courses" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                コース
              </a>
              <a href="/dashboard/community" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                コミュニティ
              </a>
              <a href="/dashboard/profile" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                プロフィール
              </a>
              <a href="/dashboard/instagram" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Instagram
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="relative">
              <span className="text-2xl">🔔</span>
              {unreadCount && unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="default" size="sm">
                  🛡️ 管理者画面
                </Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <form action={signout}>
              <Button variant="outline" size="sm" type="submit">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {children}
      </main>

      {/* フローティングチャットボタン */}
      <FloatingChatButton />
    </div>
  )
}
