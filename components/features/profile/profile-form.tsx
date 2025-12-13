'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileFormProps {
  user: {
    name: string
    nickname: string | null
    email: string
  }
  profile: {
    bio: string | null
    website_url: string | null
    twitter_handle: string | null
    location: string | null
    occupation: string | null
  } | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール編集</CardTitle>
        <CardDescription>
          あなたの情報を更新してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">お名前 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">ニックネーム</Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                defaultValue={user.nickname || ''}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              メールアドレスは変更できません
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={profile?.bio || ''}
              placeholder="あなたについて教えてください..."
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website_url">ウェブサイト</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                defaultValue={profile?.website_url || ''}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_handle">X (Twitter)</Label>
              <Input
                id="twitter_handle"
                name="twitter_handle"
                type="text"
                defaultValue={profile?.twitter_handle || ''}
                placeholder="@username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">所在地</Label>
              <Input
                id="location"
                name="location"
                type="text"
                defaultValue={profile?.location || ''}
                placeholder="東京都"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">職業</Label>
              <Input
                id="occupation"
                name="occupation"
                type="text"
                defaultValue={profile?.occupation || ''}
                placeholder="マーケター"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              プロフィールを更新しました
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? '更新中...' : '更新する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
