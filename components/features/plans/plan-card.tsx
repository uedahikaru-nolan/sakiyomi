'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createCheckoutSession } from '@/lib/actions/subscription'
import { Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  billing_interval: string
  features: any
  is_active: boolean
}

interface PlanCardProps {
  plan: Plan
  isCurrentPlan?: boolean
  isHighlighted?: boolean
}

export function PlanCard({ plan, isCurrentPlan = false, isHighlighted = false }: PlanCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    if (plan.price === 0) {
      setError('無料プランは自動的に適用されています')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createCheckoutSession(plan.id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.url) {
      window.location.href = result.url
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const features = plan.features || []

  return (
    <Card className={isHighlighted ? 'border-orange-500 border-2 relative' : ''}>
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            おすすめ
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription className="text-base">{plan.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="text-4xl font-bold">{formatPrice(plan.price)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {plan.billing_interval === 'monthly' ? '/ 月' : '/ 年'}
          </div>
        </div>

        {features.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-semibold">プラン内容</div>
            <ul className="space-y-2">
              {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" disabled>
            現在のプラン
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading || !plan.is_active}
            variant={isHighlighted ? 'default' : 'outline'}
          >
            {loading ? '処理中...' : plan.price === 0 ? '無料で始める' : 'このプランを選択'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
