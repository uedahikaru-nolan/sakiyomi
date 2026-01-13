import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { getPostFeedback } from '@/lib/actions/post-feedback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
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

export default async function AdminPostFeedbackPage() {
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

  // Count by status
  const pendingCount = feedbackList?.filter((f: any) => f.feedback_status === 'pending').length || 0
  const inReviewCount = feedbackList?.filter((f: any) => f.feedback_status === 'in_review').length || 0
  const completedCount = feedbackList?.filter((f: any) => f.feedback_status === 'completed').length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">投稿フィードバック管理</h1>
        <p className="text-gray-600">
          会員からの投稿フィードバック依頼を管理します
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              確認待ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-900">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              レビュー中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-900">{inReviewCount}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      {!feedbackList || feedbackList.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">
              フィードバック依頼がありません
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback: any) => {
            const status = statusConfig[feedback.feedback_status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            const createdAt = new Date(feedback.created_at)
            const userName = feedback.user?.user_profiles?.[0]?.display_name || feedback.user?.email || 'Unknown'

            return (
              <Link key={feedback.id} href={`/admin/post-feedback/${feedback.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 hover:border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {feedback.target_audience}
                          </CardTitle>
                          <Badge className={`${status.className} border flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{userName}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(createdAt, {
                              addSuffix: true,
                              locale: ja,
                            })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-800 line-clamp-2">
                        {feedback.target_benefit}
                      </p>

                      {/* Insights */}
                      {(feedback.view_count || feedback.like_count) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {feedback.view_count && (
                            <span>閲覧数: {feedback.view_count.toLocaleString()}</span>
                          )}
                          {feedback.like_count && (
                            <span>いいね: {feedback.like_count.toLocaleString()}</span>
                          )}
                        </div>
                      )}

                      {/* Instructor Feedback Status */}
                      {feedback.instructor_feedback ? (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          フィードバック済み
                        </div>
                      ) : (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          フィードバック未記入
                        </div>
                      )}
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
