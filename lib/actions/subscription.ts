'use server'

import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function createCheckoutSession(planId: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return { error: 'プランが見つかりません' }
    }

    // Free plan doesn't require checkout
    if (plan.price === 0) {
      return { error: '無料プランは購入不要です' }
    }

    // Check if plan has Stripe price ID
    if (!plan.stripe_price_id) {
      return { error: 'このプランは現在購入できません。Stripe価格IDが設定されていません。' }
    }

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    const email = userData?.email || user.email

    if (!email) {
      return { error: 'ユーザーのメールアドレスが見つかりません' }
    }

    // Check for existing Stripe customer
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    let customerId = existingSubscription?.stripe_customer_id

    // Create new customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/plans`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    })

    if (!session.url) {
      return { error: 'チェックアウトセッションの作成に失敗しました' }
    }

    return { url: session.url }
  } catch (error) {
    console.error('Checkout session error:', error)
    return { error: '決済処理中にエラーが発生しました' }
  }
}

export async function getUserSubscription() {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    return { subscription }
  } catch (error) {
    return { subscription: null }
  }
}

export async function cancelSubscription() {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return { error: 'アクティブなサブスクリプションが見つかりません' }
    }

    if (!subscription.stripe_subscription_id) {
      return { error: 'StripeサブスクリプションIDが見つかりません' }
    }

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update in database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    return { success: true }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { error: 'サブスクリプションのキャンセルに失敗しました' }
  }
}
