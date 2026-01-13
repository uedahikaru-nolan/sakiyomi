'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ProfileFormProps {
  user: {
    name: string
    nickname: string | null
    email: string
    avatar_url: string | null
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください')
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    setAvatarFile(file)
    setError(null)

    // プレビュー表示
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    // アバター画像を追加
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

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
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200/50">
        <CardTitle className="text-gray-900">プロフィール編集</CardTitle>
        <CardDescription>
          あなたの情報を更新してください
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          {/* アバター画像 */}
          <div className="space-y-3 p-6 bg-gradient-to-r from-orange-50/50 to-pink-50/50 rounded-xl border border-gray-200/50">
            <Label className="text-base font-semibold text-gray-900">アバター画像</Label>
            <div className="flex items-center gap-6">
              {/* プレビュー */}
              <div className="relative group">
                {avatarPreview ? (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <Image
                      src={avatarPreview}
                      alt="アバター"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={loading}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-2 hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-110"
                      aria-label="画像を削除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* アップロードボタン */}
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-md hover:shadow-lg text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Upload className="h-5 w-5" />
                  画像を選択
                </label>
                <p className="text-xs text-gray-600 mt-3 ml-1">
                  JPG、PNG、GIF形式、最大5MBまで
                </p>
              </div>
            </div>
          </div>

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
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">自己紹介</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="flex w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-400 shadow-sm focus:shadow-md"
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
            <div className="rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 p-4 text-sm text-red-700 shadow-md animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 p-4 text-sm text-green-700 shadow-md animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">プロフィールを更新しました</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                更新中...
              </span>
            ) : (
              '更新する'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
