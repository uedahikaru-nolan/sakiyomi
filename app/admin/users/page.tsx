import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserManagementTable } from '@/components/features/admin/user-management-table'

interface SearchParams {
  search?: string
  role?: string
  status?: string
  page?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const page = parseInt(params.page || '1')
  const pageSize = 50
  const offset = (page - 1) * pageSize

  // Build query - JOIN with user_profiles to get onboarding data
  let query = supabase
    .from('users')
    .select(`
      *,
      user_profiles:user_profiles(
        respondent_name,
        full_name,
        discord_name,
        main_account_url,
        second_account_url,
        teachable_email,
        join_reason
      )
    `, { count: 'exact' })
    .is('deleted_at', null)

  // Apply filters
  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,name.ilike.%${params.search}%`)
  }

  if (params.role) {
    query = query.eq('role', params.role)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  // Get users with pagination
  const { data: users, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  // Get summary stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('deleted_at', null)

  const { count: adminUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('role', ['admin', 'super_admin'])
    .is('deleted_at', null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">会員管理</h1>
        <p className="text-muted-foreground">
          会員の管理、検索、編集
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総会員数</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ会員</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理者数</CardTitle>
            <span className="text-2xl">🛡️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>会員一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            users={users || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
