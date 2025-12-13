'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteCourse } from '@/lib/actions/admin'

interface Course {
  id: string
  title: string
  description: string
  is_published: boolean
  created_at: string
  category?: {
    id: string
    name: string
  }
  chapters?: { id: string }[]
}

interface Category {
  id: string
  name: string
}

interface CourseManagementTableProps {
  courses: Course[]
  categories: Category[]
}

export function CourseManagementTable({ courses, categories }: CourseManagementTableProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`コース「${title}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    const result = await deleteCourse(courseId)
    if (result.error) {
      alert('エラー: ' + result.error)
    } else {
      router.refresh()
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (filter === 'published') return course.is_published
    if (filter === 'draft') return !course.is_published
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          すべて ({courses.length})
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('published')}
        >
          公開中 ({courses.filter((c) => c.is_published).length})
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          下書き ({courses.filter((c) => !c.is_published).length})
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-medium">カテゴリ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">チャプター数</th>
                <th className="px-4 py-3 text-left text-sm font-medium">ステータス</th>
                <th className="px-4 py-3 text-left text-sm font-medium">作成日</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {course.category ? (
                        <Badge variant="outline">{course.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">未設定</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {course.chapters?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={course.is_published ? 'default' : 'secondary'}>
                        {course.is_published ? '公開中' : '下書き'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/admin/courses/${course.id}`}>
                          <Button variant="outline" size="sm">
                            編集
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course.id, course.title)}
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    コースがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
