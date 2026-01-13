import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { getPostFeedbackById } from '@/lib/actions/post-feedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeedbackWithVideoAnalysis } from '@/components/features/post-feedback/feedback-with-video-analysis'
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, ExternalLink, User } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const statusConfig = {
  pending: {
    label: '確認待ち',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  in_review: {
    label: 'レビュー中',
    icon: AlertCircle,
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  completed: {
    label: '完了',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-300',
  },
}

export default async function AdminPostFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  const { id } = await params
  const { data: feedback, error } = await getPostFeedbackById(id)

  if (error || !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
            <p className="text-gray-600">
              {error || 'フィードバックが見つかりませんでした'}
            </p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const status = statusConfig[feedback.feedback_status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  const createdAt = new Date(feedback.created_at)
  const userName = feedback.user?.user_profiles?.[0]?.display_name || feedback.user?.email || 'Unknown'

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/post-feedback">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                フィードバック詳細（管理者）
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                {userName} • {format(createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}
              </p>
            </div>
          </div>
          <Badge className={`${status.className} border flex items-center gap-2 px-4 py-2 text-base`}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:grid lg:grid-cols-3 lg:gap-6 overflow-hidden h-full">
        {/* 左カラム: 依頼内容 (1/3幅) - Scrollable */}
        <div className="lg:col-span-1 h-full overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* 添削依頼情報 */}
          <Card>
            <CardHeader>
              <CardTitle>添削依頼情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">【投稿前】動画</p>
                  {feedback.pre_post_video_url ? (
                    <div className="space-y-2">
                      <div className="relative w-full bg-black rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-auto"
                          preload="metadata"
                        >
                          <source src={feedback.pre_post_video_url} type="video/mp4" />
                          <source src={feedback.pre_post_video_url} type="video/quicktime" />
                          <source src={feedback.pre_post_video_url} type="video/webm" />
                          お使いのブラウザは動画タグをサポートしていません。
                        </video>
                      </div>
                      <a
                        href={feedback.pre_post_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                      >
                        新しいタブで開く
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">未登録</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">【投稿後】投稿URL</p>
                  {feedback.post_url ? (
                    <a
                      href={feedback.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-xs break-all"
                    >
                      {feedback.post_url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">未登録</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 投稿の狙い */}
          <Card>
            <CardHeader>
              <CardTitle>投稿の狙い</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">ターゲット</p>
                <p className="text-gray-800">{feedback.target_audience}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">ターゲットが得られること</p>
                <p className="text-gray-800 whitespace-pre-wrap">{feedback.target_benefit}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">参考にした投稿のURL</p>
                {feedback.reference_post_url ? (
                  <a
                    href={feedback.reference_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                  >
                    {feedback.reference_post_url}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm">未登録</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 工夫した点 */}
          <Card>
            <CardHeader>
              <CardTitle>工夫した点</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">冒頭3秒</p>
                {feedback.first_3_seconds ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.first_3_seconds}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">構成・内容</p>
                {feedback.structure_content ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.structure_content}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">撮影・編集</p>
                {feedback.shooting_editing ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.shooting_editing}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* インサイト */}
          <Card>
            <CardHeader>
              <CardTitle>インサイト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {feedback.video_duration_seconds && (
                  <div>
                    <p className="text-sm text-gray-600">動画の尺</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.video_duration_seconds}秒
                    </p>
                  </div>
                )}
                {feedback.view_count !== null && feedback.view_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">閲覧数（再生数）</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.view_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.reach_count !== null && feedback.reach_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">リーチしたアカウント</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.reach_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.average_watch_time_seconds && (
                  <div>
                    <p className="text-sm text-gray-600">平均再生時間</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.average_watch_time_seconds}秒
                    </p>
                  </div>
                )}
                {feedback.three_second_retention_rate && (
                  <div>
                    <p className="text-sm text-gray-600">3秒以上の再生率</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.three_second_retention_rate}%
                    </p>
                  </div>
                )}
                {feedback.save_count !== null && feedback.save_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">保存数</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.save_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.comment_count !== null && feedback.comment_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">コメント数</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.comment_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.like_count !== null && feedback.like_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">いいね！の数</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.like_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.share_count !== null && feedback.share_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">シェア数</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.share_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {feedback.follow_count !== null && feedback.follow_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">フォロー数</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {feedback.follow_count.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 仮説 */}
          <Card>
            <CardHeader>
              <CardTitle>仮説</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">よかった点（仮説）</p>
                {feedback.good_points ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.good_points}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">悪かった点（仮説）</p>
                {feedback.bad_points ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.bad_points}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">次回に向けて検証したいこと</p>
                {feedback.next_verification ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.next_verification}</p>
                ) : (
                  <p className="text-gray-400 text-sm">未記入</p>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* 右カラム: フィードバック (2/3幅) - Fixed */}
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col">
          <div className="h-full p-6">
          <FeedbackWithVideoAnalysis
            feedbackId={feedback.id}
            initialFeedbackGood={feedback.feedback_good}
            initialFeedbackMore={feedback.feedback_more}
            initialFeedbackNextPoints={feedback.feedback_next_points}
            initialFeedbackInsights={feedback.feedback_insights}
            initialStatus={feedback.feedback_status}
            hasVideo={!!feedback.pre_post_video_url}
          />
          </div>
        </div>
      </div>
    </div>
  )
}
