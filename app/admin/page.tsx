import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, FileText, CreditCard, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function AdminPage() {
  const supabase = await createClient()

  // Get statistics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('deleted_at', null)

  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, name, email, created_at, status, role')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
          管理者ダッシュボード
        </h1>
        <p className="text-gray-600 text-lg">
          プラットフォームの統計と管理
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総会員数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold text-gray-900">{totalUsers || 0}</div>
            <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              アクティブ: {activeUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総コース数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold text-gray-900">{totalCourses || 0}</div>
            <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              公開中: {publishedCourses || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総投稿数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold text-gray-900">{totalPosts || 0}</div>
            <p className="text-sm text-gray-600 font-medium">
              コミュニティ投稿
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">有料会員数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold text-gray-900">{activeSubscriptions || 0}</div>
            <p className="text-sm text-gray-600 font-medium">
              アクティブサブスクリプション
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <CardTitle className="text-gray-900 text-xl">最近登録した会員</CardTitle>
          <CardDescription className="text-base">
            直近5人の新規会員
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <Badge className={`font-bold ${
                        user.status === 'active'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {user.status}
                      </Badge>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                会員データがありません
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
