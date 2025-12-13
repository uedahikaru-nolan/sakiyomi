'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelSubscription } from '@/lib/actions/subscription'
import { useRouter } from 'next/navigation'

export function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    setError(null)

    const result = await cancelSubscription()

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (!showConfirm) {
    return (
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        解約する
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? '処理中...' : '解約を確定する'}
        </Button>
      </div>
    </div>
  )
}
