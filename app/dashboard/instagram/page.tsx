import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function InstagramPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: instagramAccount } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_connected', true)
    .single()

  const { data: metrics } = await supabase
    .from('instagram_metrics')
    .select('*')
    .eq('instagram_account_id', instagramAccount?.id || '')
    .order('metric_date', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Instagram連携</h1>
        <p className="text-muted-foreground">
          Instagramアカウントを連携して成長を追跡しましょう
        </p>
      </div>

      {!instagramAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Instagramアカウントを連携</CardTitle>
            <CardDescription>
              アカウントを連携すると、フォロワー数やエンゲージメント率などの成長指標を自動的に追跡できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-medium">自動データ収集</h3>
                  <p className="text-sm text-muted-foreground">
                    毎日自動でメトリクスを記録
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-medium">成長を可視化</h3>
                  <p className="text-sm text-muted-foreground">
                    グラフで成長を確認
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-medium">ランクアップ</h3>
                  <p className="text-sm text-muted-foreground">
                    フォロワー数でランク決定
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Instagramと連携する（準備中）
            </Button>

            <p className="text-xs text-muted-foreground">
              ※ Instagram Graph APIとの連携機能は現在準備中です
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>連携中のアカウント</CardTitle>
                  <CardDescription>@{instagramAccount.username}</CardDescription>
                </div>
                <Badge variant="secondary">連携済み</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {instagramAccount.profile_picture_url && (
                  <img
                    src={instagramAccount.profile_picture_url}
                    alt={instagramAccount.username}
                    className="h-16 w-16 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{instagramAccount.account_name}</p>
                  <p className="text-sm text-muted-foreground">
                    最終同期: {instagramAccount.last_synced_at
                      ? new Date(instagramAccount.last_synced_at).toLocaleDateString('ja-JP')
                      : '未同期'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {metrics && metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>成長メトリクス</CardTitle>
                <CardDescription>
                  過去30日間の推移
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">フォロワー数</p>
                    <p className="text-2xl font-bold">{metrics[0].followers_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">フォロー中</p>
                    <p className="text-2xl font-bold">{metrics[0].following_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">投稿数</p>
                    <p className="text-2xl font-bold">{metrics[0].media_count.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
