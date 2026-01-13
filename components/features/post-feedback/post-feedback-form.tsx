'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createPostFeedback, uploadFeedbackVideo, type PostFeedbackFormData } from '@/lib/actions/post-feedback'
import { useToast } from '@/lib/hooks/useToast'
import { Loader2, Upload, Video } from 'lucide-react'

export function PostFeedbackForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')

  const [formData, setFormData] = useState<PostFeedbackFormData>({
    targetAudience: '',
    targetBenefit: '',
  })

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'エラー',
        description: '動画ファイルを選択してください',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'エラー',
        description: '動画ファイルは100MB以下にしてください',
        variant: 'destructive',
      })
      return
    }

    setVideoFile(file)
    setIsUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadFeedbackVideo(formData)

      if (result.error) {
        toast({
          title: 'エラー',
          description: result.error,
          variant: 'destructive',
        })
        setVideoFile(null)
        return
      }

      if (result.data) {
        setVideoUrl(result.data.publicUrl)
        setFormData((prev) => ({
          ...prev,
          prePostVideoUrl: result.data.publicUrl,
        }))
        toast({
          title: '成功',
          description: '動画をアップロードしました',
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'エラー',
        description: '動画のアップロードに失敗しました',
        variant: 'destructive',
      })
      setVideoFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 動画アップロード中は送信しない
    if (isUploading) {
      toast({
        title: '警告',
        description: '動画のアップロードが完了するまでお待ちください',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const result = await createPostFeedback(formData)

      if (result.error) {
        toast({
          title: 'エラー',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: '成功',
        description: 'フィードバック依頼を送信しました',
      })
      router.push('/dashboard/post-feedback')
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value ? parseFloat(value) : undefined,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
      {/* 左カラム */}
      <div className="space-y-6">
        {/* 添削依頼情報 */}
        <Card>
          <CardHeader>
            <CardTitle>添削依頼情報</CardTitle>
            <CardDescription>投稿前の動画または投稿後のURLを入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video">【投稿前】動画アップロード</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                {isUploading && (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                )}
                {videoFile && !isUploading && (
                  <Video className="w-5 h-5 text-green-600" />
                )}
              </div>
              {videoFile && (
                <p className="text-sm text-gray-600">
                  アップロード済み: {videoFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postUrl">【投稿後】投稿後URL</Label>
              <Input
                id="postUrl"
                name="postUrl"
                type="url"
                placeholder="https://www.instagram.com/..."
                value={formData.postUrl || ''}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* 投稿の狙い */}
        <Card>
          <CardHeader>
            <CardTitle>投稿の狙い</CardTitle>
            <CardDescription>投稿のターゲットと目的を記入してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">ターゲット *</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                placeholder="例: 20代女性、Instagram運用に興味がある人"
                value={formData.targetAudience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetBenefit">ターゲットが得られること *</Label>
              <Textarea
                id="targetBenefit"
                name="targetBenefit"
                placeholder="例: Instagram運用の基本知識、フォロワー増加のコツ"
                value={formData.targetBenefit}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencePostUrl">参考にした投稿のURL</Label>
              <Input
                id="referencePostUrl"
                name="referencePostUrl"
                type="url"
                placeholder="https://..."
                value={formData.referencePostUrl || ''}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* 工夫した点 */}
        <Card>
          <CardHeader>
            <CardTitle>工夫した点</CardTitle>
            <CardDescription>投稿で工夫した点を記入してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first3Seconds">冒頭3秒</Label>
              <Textarea
                id="first3Seconds"
                name="first3Seconds"
                placeholder="冒頭3秒で工夫した点を記入してください"
                value={formData.first3Seconds || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="structureContent">構成・内容</Label>
              <Textarea
                id="structureContent"
                name="structureContent"
                placeholder="構成や内容で工夫した点を記入してください"
                value={formData.structureContent || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shootingEditing">撮影・編集</Label>
              <Textarea
                id="shootingEditing"
                name="shootingEditing"
                placeholder="撮影や編集で工夫した点を記入してください"
                value={formData.shootingEditing || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右カラム */}
      <div className="space-y-6">
        {/* インサイト */}
        <Card>
          <CardHeader>
            <CardTitle>インサイト</CardTitle>
            <CardDescription>投稿のインサイトデータを記入してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoDurationSeconds">動画の尺（秒）</Label>
                <Input
                  id="videoDurationSeconds"
                  name="videoDurationSeconds"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={formData.videoDurationSeconds || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewCount">閲覧数（再生数）</Label>
                <Input
                  id="viewCount"
                  name="viewCount"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={formData.viewCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reachCount">リーチしたアカウント</Label>
                <Input
                  id="reachCount"
                  name="reachCount"
                  type="number"
                  min="0"
                  placeholder="800"
                  value={formData.reachCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageWatchTimeSeconds">平均再生時間（秒）</Label>
                <Input
                  id="averageWatchTimeSeconds"
                  name="averageWatchTimeSeconds"
                  type="number"
                  min="0"
                  placeholder="15"
                  value={formData.averageWatchTimeSeconds || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threeSecondRetentionRate">最初の3秒以上の再生率（%）</Label>
                <Input
                  id="threeSecondRetentionRate"
                  name="threeSecondRetentionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="75.5"
                  value={formData.threeSecondRetentionRate || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saveCount">保存数</Label>
                <Input
                  id="saveCount"
                  name="saveCount"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={formData.saveCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentCount">コメント数</Label>
                <Input
                  id="commentCount"
                  name="commentCount"
                  type="number"
                  min="0"
                  placeholder="20"
                  value={formData.commentCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likeCount">いいね！の数</Label>
                <Input
                  id="likeCount"
                  name="likeCount"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={formData.likeCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shareCount">シェア数</Label>
                <Input
                  id="shareCount"
                  name="shareCount"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={formData.shareCount || ''}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followCount">フォロー数</Label>
                <Input
                  id="followCount"
                  name="followCount"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.followCount || ''}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 仮説 */}
        <Card>
          <CardHeader>
            <CardTitle>仮説</CardTitle>
            <CardDescription>投稿の仮説を記入してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goodPoints">よかった点（仮説）</Label>
              <Textarea
                id="goodPoints"
                name="goodPoints"
                placeholder="投稿でよかったと思う点を記入してください"
                value={formData.goodPoints || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badPoints">悪かった点（仮説）</Label>
              <Textarea
                id="badPoints"
                name="badPoints"
                placeholder="投稿で改善が必要だと思う点を記入してください"
                value={formData.badPoints || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextVerification">次回に向けて検証したいこと</Label>
              <Textarea
                id="nextVerification"
                name="nextVerification"
                placeholder="次回の投稿で検証したいことを記入してください"
                value={formData.nextVerification || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button - 全幅 */}
      <div className="lg:col-span-2 flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isPending || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              動画アップロード中...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              フィードバック依頼を送信
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
