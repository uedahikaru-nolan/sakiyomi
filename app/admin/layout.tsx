import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col shadow-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                SAKIYOMI
              </h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">📊</span>
            <span>ダッシュボード</span>
          </a>
          <a
            href="/admin/chats"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">💬</span>
            <span>チャット</span>
          </a>
          <a
            href="/admin/responses"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">📝</span>
            <span>返信管理</span>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">👥</span>
            <span>会員管理</span>
          </a>
          <a
            href="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">📚</span>
            <span>コース管理</span>
          </a>
          <a
            href="/admin/posts"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span className="text-xl">📄</span>
            <span>投稿管理</span>
          </a>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          {/* User Info */}
          <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">ログイン中</p>
            <p className="text-sm text-gray-300 truncate">{user.email}</p>
          </div>

          {/* Action Buttons */}
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <span>←</span>
            <span>一般画面へ</span>
          </a>
          <form action={signout} className="w-full">
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-gray-500 transition-all duration-200"
            >
              ログアウト
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
