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
    <div className="min-h-screen bg-orange-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">SAKIYOMI Admin</h1>
            <nav className="hidden md:flex gap-4">
              <a href="/admin" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                ダッシュボード
              </a>
              <a href="/admin/chats" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                💬 チャット
              </a>
              <a href="/admin/responses" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                📝 返信管理
              </a>
              <a href="/admin/users" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                会員管理
              </a>
              <a href="/admin/courses" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                コース管理
              </a>
              <a href="/admin/posts" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                投稿管理
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-primary transition-colors">
              一般画面へ
            </a>
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
    </div>
  )
}
