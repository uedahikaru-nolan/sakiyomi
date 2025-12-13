'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deletePost, updatePostStatus } from '@/lib/actions/admin'

interface Post {
  id: string
  title: string
  content: string
  post_type: 'daily' | 'question' | 'achievement' | 'general'
  is_published: boolean
  created_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface PostManagementTableProps {
  posts: Post[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function PostManagementTable({
  posts,
  currentPage,
  totalPages,
  totalCount,
}: PostManagementTableProps) {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  function handleFilter() {
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter) params.set('status', statusFilter)
    router.push(`/admin/posts?${params.toString()}`)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    router.push(`/admin/posts?${params.toString()}`)
  }

  async function handleDelete(postId: string, title: string) {
    if (!confirm(`投稿「${title}」を削除しますか？`)) {
      return
    }

    const result = await deletePost(postId)
    if (result.error) {
      alert('エラー: ' + result.error)
    } else {
      router.refresh()
    }
  }

  async function handleTogglePublish(postId: string, currentStatus: boolean) {
    const result = await updatePostStatus(postId, !currentStatus)
    if (result.error) {
      alert('エラー: ' + result.error)
    } else {
      router.refresh()
    }
  }

  function getPostTypeBadge(type: string) {
    const badges = {
      daily: { label: '日報', variant: 'secondary' as const },
      question: { label: '質問', variant: 'default' as const },
      achievement: { label: '成果報告', variant: 'default' as const },
      general: { label: '一般', variant: 'outline' as const },
    }
    return badges[type as keyof typeof badges] || badges.general
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">全タイプ</option>
          <option value="daily">日報</option>
          <option value="question">質問</option>
          <option value="achievement">成果報告</option>
          <option value="general">一般</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">全ステータス</option>
          <option value="published">公開中</option>
          <option value="draft">下書き</option>
        </select>
        <Button onClick={handleFilter}>フィルター</Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-medium">投稿者</th>
                <th className="px-4 py-3 text-left text-sm font-medium">タイプ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">ステータス</th>
                <th className="px-4 py-3 text-left text-sm font-medium">投稿日</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.length > 0 ? (
                posts.map((post) => {
                  const typeBadge = getPostTypeBadge(post.post_type)
                  return (
                    <tr key={post.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{post.title}</div>
                          {post.content && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {post.content}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {post.user?.name || post.user?.email || '不明'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={post.is_published ? 'default' : 'secondary'}>
                          {post.is_published ? '公開中' : '下書き'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/community/${post.id}`}>
                            <Button variant="outline" size="sm">
                              表示
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(post.id, post.is_published)}
                          >
                            {post.is_published ? '非公開' : '公開'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(post.id, post.title)}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    投稿がありません
                  </td>
                </tr>
              )}
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
