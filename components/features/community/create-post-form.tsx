'use client'

import { useState } from 'react'
import { createPost } from '@/lib/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CreatePostForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createPost(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい投稿を作成</CardTitle>
        <CardDescription>
          コミュニティと共有したいことを投稿してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post_type">投稿タイプ</Label>
            <select
              id="post_type"
              name="post_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="general">一般</option>
              <option value="daily">日報</option>
              <option value="question">質問</option>
              <option value="achievement">成果報告</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="投稿のタイトル"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <textarea
              id="content"
              name="content"
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="投稿の内容を入力してください..."
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">タグ（カンマ区切り）</Label>
            <Input
              id="tags"
              name="tags"
              type="text"
              placeholder="Instagram, マーケティング, 成長"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              タグをカンマ（,）で区切って入力してください
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '投稿中...' : '投稿する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => window.history.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
