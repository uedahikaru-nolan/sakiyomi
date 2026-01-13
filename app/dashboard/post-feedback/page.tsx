import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/utils/get-user'
import { getPostFeedback } from '@/lib/actions/post-feedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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

export default async function PostFeedbackPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: feedbackList, error } = await getPostFeedback()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">投稿フィードバック</h1>
          <p className="text-gray-600">
            講師に動画のフィードバックを依頼できます
          </p>
        </div>
        <Link href="/dashboard/post-feedback/new">
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700">
            <Plus className="w-5 h-5 mr-2" />
            新規フィードバック依頼
          </Button>
        </Link>
      </div>

      {/* Feedback List */}
      {!feedbackList || feedbackList.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">
              フィードバック依頼がありません
            </p>
            <p className="text-gray-600 mb-6">
              投稿の改善点を講師にフィードバックしてもらいましょう
            </p>
            <Link href="/dashboard/post-feedback/new">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700">
                <Plus className="w-5 h-5 mr-2" />
                最初のフィードバック依頼を作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {feedbackList.map((feedback: any) => {
            const status = statusConfig[feedback.feedback_status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            const createdAt = new Date(feedback.created_at)

            return (
              <Link key={feedback.id} href={`/dashboard/post-feedback/${feedback.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 hover:border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {feedback.target_audience}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {feedback.target_benefit}
                        </CardDescription>
                      </div>
                      <Badge className={`${status.className} border ml-2 flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Post Info */}
                      <div className="flex flex-wrap gap-2">
                        {feedback.post_url && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                            <FileText className="w-3 h-3" />
                            <span>投稿URL</span>
                          </div>
                        )}
                        {feedback.pre_post_video_url && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                            <FileText className="w-3 h-3" />
                            <span>動画</span>
                          </div>
                        )}
                      </div>

                      {/* 工夫した点のサマリー */}
                      {(feedback.first_3_seconds || feedback.structure_content || feedback.shooting_editing) && (
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700 mb-1">工夫した点:</p>
                          <div className="space-y-1 text-gray-600">
                            {feedback.first_3_seconds && (
                              <p className="line-clamp-1">• 冒頭3秒: {feedback.first_3_seconds}</p>
                            )}
                            {feedback.structure_content && (
                              <p className="line-clamp-1">• 構成: {feedback.structure_content}</p>
                            )}
                            {feedback.shooting_editing && (
                              <p className="line-clamp-1">• 撮影編集: {feedback.shooting_editing}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Insights - より詳細に */}
                      {(feedback.view_count !== null || feedback.like_count !== null ||
                        feedback.save_count !== null || feedback.comment_count !== null ||
                        feedback.share_count !== null) && (
                        <div className="grid grid-cols-3 gap-2 py-2 bg-gray-50 rounded-lg px-3">
                          {feedback.view_count !== null && feedback.view_count !== undefined && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">閲覧数</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {feedback.view_count.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {feedback.like_count !== null && feedback.like_count !== undefined && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">いいね</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {feedback.like_count.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {feedback.save_count !== null && feedback.save_count !== undefined && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">保存</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {feedback.save_count.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {feedback.comment_count !== null && feedback.comment_count !== undefined && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">コメント</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {feedback.comment_count.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {feedback.share_count !== null && feedback.share_count !== undefined && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">シェア</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {feedback.share_count.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 仮説のサマリー */}
                      {(feedback.good_points || feedback.bad_points) && (
                        <div className="text-sm space-y-1">
                          {feedback.good_points && (
                            <div>
                              <p className="font-semibold text-green-700">✓ よかった点:</p>
                              <p className="text-gray-600 line-clamp-1 pl-3">{feedback.good_points}</p>
                            </div>
                          )}
                          {feedback.bad_points && (
                            <div>
                              <p className="font-semibold text-orange-700">✗ 改善点:</p>
                              <p className="text-gray-600 line-clamp-1 pl-3">{feedback.bad_points}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Instructor Feedback */}
                      {feedback.instructor_feedback && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            講師からのフィードバック
                          </p>
                          <p className="text-sm text-green-800 line-clamp-2">
                            {feedback.instructor_feedback}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>
                          {formatDistanceToNow(createdAt, {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                        <span className="text-blue-600 font-medium">詳細を見る →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
