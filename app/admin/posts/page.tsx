import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostManagementTable } from '@/components/features/admin/post-management-table'
import { FileText, CheckCircle, MessageCircle } from 'lucide-react'

interface SearchParams {
  type?: string
  status?: string
  page?: string
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const page = parseInt(params.page || '1')
  const pageSize = 50
  const offset = (page - 1) * pageSize

  // Build query
  let query = supabase
    .from('posts')
    .select('*, user:users(id, name, email)', { count: 'exact' })
    .is('deleted_at', null)

  // Apply filters
  if (params.type) {
    query = query.eq('post_type', params.type)
  }

  if (params.status === 'published') {
    query = query.eq('is_published', true)
  } else if (params.status === 'draft') {
    query = query.eq('is_published', false)
  }

  // Get posts with pagination
  const { data: posts, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  // Get summary stats
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: publishedPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .is('deleted_at', null)

  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          投稿管理
        </h1>
        <p className="text-gray-600 text-lg">
          コミュニティ投稿の管理、モデレーション
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総投稿数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">公開中</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{publishedPosts || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総コメント数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalComments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Post Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <CardTitle className="text-gray-900 text-xl">投稿一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <PostManagementTable
            posts={posts || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
