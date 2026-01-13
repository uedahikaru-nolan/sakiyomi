import { redirect } from 'next/navigation'
import { getUser } from '@/lib/utils/get-user'
import { PostFeedbackForm } from '@/components/features/post-feedback/post-feedback-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewPostFeedbackPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/post-feedback">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            新規フィードバック依頼
          </h1>
          <p className="text-gray-600 mt-1">
            投稿の詳細情報を入力して、講師にフィードバックを依頼してください
          </p>
        </div>
      </div>

      {/* Form */}
      <PostFeedbackForm />
    </div>
  )
}
