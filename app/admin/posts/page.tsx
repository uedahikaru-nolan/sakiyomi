import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostManagementTable } from '@/components/features/admin/post-management-table'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">投稿管理</h1>
        <p className="text-muted-foreground">
          コミュニティ投稿の管理、モデレーション
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総投稿数</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公開中</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総コメント数</CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Post Table */}
      <Card>
        <CardHeader>
          <CardTitle>投稿一覧</CardTitle>
        </CardHeader>
        <CardContent>
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
