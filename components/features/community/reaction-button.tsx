'use client'

import { useState } from 'react'
import { toggleReaction } from '@/lib/actions/reactions'

interface ReactionButtonProps {
  targetType: 'post' | 'comment'
  targetId: string
  initialCount: number
  initialUserReacted: boolean
}

export function ReactionButton({
  targetType,
  targetId,
  initialCount,
  initialUserReacted,
}: ReactionButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [userReacted, setUserReacted] = useState(initialUserReacted)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)

    const result = await toggleReaction(targetType, targetId)

    if (result?.error) {
      console.error('Error toggling reaction:', result.error)
    } else {
      if (result.action === 'added') {
        setCount(count + 1)
        setUserReacted(true)
      } else {
        setCount(count - 1)
        setUserReacted(false)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
    >
      <span className="text-base">{userReacted ? '❤️' : '🤍'}</span>
      <span>{count} いいね</span>
    </button>
  )
}
