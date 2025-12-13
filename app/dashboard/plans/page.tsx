import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'
import { PlanCard } from '@/components/features/plans/plan-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PlansPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // Get all active plans
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

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

  const currentPlanId = subscription?.plan_id

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">プラン選択</h1>
        <p className="text-muted-foreground">
          あなたに最適なプランを選んでください
        </p>
      </div>

      {subscription && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">現在のプラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {subscription.plan?.name || '不明'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {subscription.cancel_at_period_end
                    ? `${new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}に終了予定`
                    : `次回更新日: ${new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}`}
                </div>
              </div>
              {!subscription.cancel_at_period_end && (
                <Link href="/dashboard/plans/manage">
                  <Button variant="outline">サブスクリプション管理</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            isHighlighted={index === 1}
          />
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>よくある質問</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-semibold mb-1">プランはいつでも変更できますか?</div>
            <div className="text-sm text-muted-foreground">
              はい、いつでもプランを変更できます。アップグレードは即座に反映され、ダウングレードは次回更新日に適用されます。
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">キャンセルはできますか?</div>
            <div className="text-sm text-muted-foreground">
              はい、いつでもキャンセル可能です。キャンセル後も、支払い済みの期間は引き続きサービスをご利用いただけます。
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">支払い方法は?</div>
            <div className="text-sm text-muted-foreground">
              クレジットカード（Visa、Mastercard、American Express、JCB）でのお支払いが可能です。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
