import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, Trophy, BookOpen, Instagram, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const user = await getUser()
  const supabase = await createClient()

  // Get user's subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('user_id', user?.id)
    .eq('status', 'active')
    .single()

  // Get user's learning progress
  const { data: progress, count: totalLessons } = await supabase
    .from('user_progress')
    .select('*, lesson:lessons(*)', { count: 'exact' })
    .eq('user_id', user?.id)
    .eq('status', 'completed')

  const completedCount = progress?.length || 0
  const progressPercentage = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
          ダッシュボード
        </h1>
        <p className="text-gray-600 text-lg">
          ようこそ、{user?.email}さん
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">プラン</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {subscription?.plan?.name || '無料プラン'}
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {subscription?.plan?.description || 'スタンダードプラン'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">学習進捗</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">{progressPercentage}%</div>
            <p className="text-sm text-gray-600 font-medium">
              {completedCount} / {totalLessons} レッスン完了
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">ランク</CardTitle>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">Egg（卵）</div>
            <p className="text-sm text-gray-600 font-medium">
              頑張ってレベルアップしよう！
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-gray-900 text-xl">最近の学習</CardTitle>
                <CardDescription className="text-base">
                  最近視聴したレッスン
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {progress && progress.length > 0 ? (
              <div className="space-y-3">
                {progress.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">{item.lesson?.title}</span>
                    </div>
                    <span className="text-sm text-green-600 font-bold">
                      完了
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  まだレッスンを開始していません
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <Instagram className="h-6 w-6 text-pink-600" />
              <div>
                <CardTitle className="text-gray-900 text-xl">Instagram連携</CardTitle>
                <CardDescription className="text-base">
                  アカウントを連携して成長を追跡
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-6 font-medium">
              Instagramアカウントを連携すると、フォロワー数やエンゲージメント率などの成長指標を自動的に追跡できます。
            </p>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Instagram className="h-5 w-5 mr-2" />
              Instagramと連携する
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
