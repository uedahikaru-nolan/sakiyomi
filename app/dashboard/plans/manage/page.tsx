import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CancelSubscriptionButton } from '@/components/features/plans/cancel-subscription-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ManageSubscriptionPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // Get user's current subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    redirect('/dashboard/plans')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">サブスクリプション管理</h1>
        <p className="text-muted-foreground">
          現在のサブスクリプションを管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>現在のプラン</CardTitle>
          <CardDescription>
            あなたのサブスクリプション情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">プラン名</span>
              <span className="font-semibold text-lg">{subscription.plan?.name || '不明'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">料金</span>
              <span className="font-semibold">
                {formatPrice(subscription.plan?.price || 0)}
                {subscription.plan?.billing_interval === 'monthly' ? ' / 月' : ' / 年'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">ステータス</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {subscription.cancel_at_period_end ? '解約予定' : '有効'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">開始日</span>
              <span>{new Date(subscription.current_period_start).toLocaleDateString('ja-JP')}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">
                {subscription.cancel_at_period_end ? '終了日' : '次回更新日'}
              </span>
              <span>{new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="text-sm text-yellow-800">
                このサブスクリプションは{new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}に終了します。
                それまでは引き続きサービスをご利用いただけます。
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
          <CardDescription>
            サブスクリプションの管理オプション
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">プランを変更する</div>
              <div className="text-sm text-muted-foreground">
                別のプランに切り替えます
              </div>
            </div>
            <Link href="/dashboard/plans">
              <Button variant="outline">プラン変更</Button>
            </Link>
          </div>

          {!subscription.cancel_at_period_end && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="font-semibold text-destructive">サブスクリプションを解約する</div>
                <div className="text-sm text-muted-foreground">
                  次回更新日に自動的に解約されます
                </div>
              </div>
              <CancelSubscriptionButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
