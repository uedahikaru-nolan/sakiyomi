'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateUserRole, updateUserStatus } from '@/lib/actions/admin'

interface UserProfile {
  respondent_name?: string
  full_name?: string
  discord_name?: string
  main_account_url?: string
  second_account_url?: string
  teachable_email?: string
  join_reason?: string
}

interface User {
  id: string
  email: string
  name: string
  role: 'member' | 'admin' | 'super_admin'
  status: 'active' | 'pending' | 'suspended' | 'cancelled'
  created_at: string
  last_login_at?: string
  user_profiles?: UserProfile | UserProfile[]
}

interface UserManagementTableProps {
  users: User[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function UserManagementTable({
  users,
  currentPage,
  totalPages,
  totalCount,
}: UserManagementTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Helper function to get user profile (handle array or single object)
  function getUserProfile(user: User): UserProfile | null {
    if (!user.user_profiles) return null
    if (Array.isArray(user.user_profiles)) {
      return user.user_profiles[0] || null
    }
    return user.user_profiles
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (roleFilter) params.set('role', roleFilter)
    if (statusFilter) params.set('status', statusFilter)
    router.push(`/admin/users?${params.toString()}`)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  async function handleRoleChange(userId: string, newRole: 'member' | 'admin' | 'super_admin') {
    const result = await updateUserRole(userId, newRole)
    if (result.error) {
      alert('エラー: ' + result.error)
    } else {
      router.refresh()
    }
  }

  async function handleStatusChange(userId: string, newStatus: 'active' | 'pending' | 'suspended' | 'cancelled') {
    const result = await updateUserStatus(userId, newStatus)
    if (result.error) {
      alert('エラー: ' + result.error)
    } else {
      router.refresh()
    }
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'default'
      default:
        return 'secondary'
    }
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'suspended':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="メールアドレスまたは氏名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">全ロール</option>
          <option value="member">メンバー</option>
          <option value="admin">管理者</option>
          <option value="super_admin">スーパー管理者</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">全ステータス</option>
          <option value="active">アクティブ</option>
          <option value="pending">保留</option>
          <option value="suspended">停止</option>
          <option value="cancelled">退会</option>
        </select>
        <Button onClick={handleSearch}>検索</Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">氏名</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">メールアドレス</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">回答者名</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">お名前</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">Discord名</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">メインアカウント</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">2アカウント目</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">ティーチャブルメール</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">入会理由</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">ロール</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">ステータス</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">登録日</th>
                <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const profile = getUserProfile(user)
                return (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{profile?.respondent_name || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{profile?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{profile?.discord_name || '-'}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {profile?.main_account_url ? (
                        <a
                          href={profile.main_account_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.main_account_url}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {profile?.second_account_url ? (
                        <a
                          href={profile.second_account_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.second_account_url}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{profile?.teachable_email || '-'}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={profile?.join_reason}>
                      {profile?.join_reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        className="px-2 py-1 border border-input rounded bg-background text-xs"
                      >
                        <option value="member">メンバー</option>
                        <option value="admin">管理者</option>
                        <option value="super_admin">スーパー管理者</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                        className="px-2 py-1 border border-input rounded bg-background text-xs"
                      >
                        <option value="active">アクティブ</option>
                        <option value="pending">保留</option>
                        <option value="suspended">停止</option>
                        <option value="cancelled">退会</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        詳細
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalCount}件中 {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, totalCount)} 件を表示
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前へ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  )
}
