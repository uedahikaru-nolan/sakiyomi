'use client'

import { useState } from 'react'
import { createComment } from '@/lib/actions/comments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    name: string
    email: string
  }
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  currentUserId: string
}

export function CommentSection({ postId, comments, currentUserId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!newComment.trim()) return

    setLoading(true)
    setError(null)

    const result = await createComment(postId, newComment)

    if (result?.error) {
      setError(result.error)
    } else {
      setNewComment('')
      // Reload the page to show new comment
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">コメント ({comments.length})</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="コメントを入力..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !newComment.trim()}>
          {loading ? '送信中...' : '送信'}
        </Button>
      </form>

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-l-2 border-muted pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            まだコメントがありません
          </p>
        )}
      </div>
    </div>
  )
}
