import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseManagementTable } from '@/components/features/admin/course-management-table'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  // Get all courses with category info
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(id, name),
      chapters:chapters(id)
    `)
    .order('created_at', { ascending: false })

  // Get all categories for the create form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get summary stats
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">コース管理</h1>
          <p className="text-muted-foreground">
            コースの管理、作成、編集
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button>新規コース作成</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総コース数</CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公開中</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総レッスン数</CardTitle>
            <span className="text-2xl">🎬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Table */}
      <Card>
        <CardHeader>
          <CardTitle>コース一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseManagementTable courses={courses || []} categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
