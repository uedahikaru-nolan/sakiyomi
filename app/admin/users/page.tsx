import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserManagementTable } from '@/components/features/admin/user-management-table'
import { Users, UserCheck, Shield } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          会員管理
        </h1>
        <p className="text-gray-600 text-lg">
          会員の管理、検索、編集
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総会員数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">アクティブ会員</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">管理者数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{adminUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <CardTitle className="text-gray-900 text-xl">会員一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
