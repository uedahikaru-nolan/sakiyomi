import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          ようこそ、{user?.email}さん
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">プラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.plan?.name || '無料プラン'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan?.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">学習進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {completedCount} / {totalLessons} レッスン完了
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">ランク</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Egg（卵）</div>
            <p className="text-xs text-muted-foreground">
              頑張ってレベルアップしよう！
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近の学習</CardTitle>
            <CardDescription>
              最近視聴したレッスン
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-2">
                {progress.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <span className="text-sm">{item.lesson?.title}</span>
                    <span className="text-xs text-muted-foreground">
                      完了
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                まだレッスンを開始していません
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instagram連携</CardTitle>
            <CardDescription>
              アカウントを連携して成長を追跡
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Instagramアカウントを連携すると、フォロワー数やエンゲージメント率などの成長指標を自動的に追跡できます。
            </p>
            <button className="w-full rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600">
              Instagramと連携する
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
