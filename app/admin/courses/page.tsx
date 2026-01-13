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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              コース管理
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              コースの管理、作成、編集
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/courses/categories">
              <Button variant="outline" className="px-6 py-6 text-base font-bold rounded-xl hover:scale-105 transition-all border-2">
                カテゴリ管理
              </Button>
            </Link>
            <Link href="/admin/courses/create">
              <Button className="px-6 py-6 text-base font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                新規コース作成
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-bold text-gray-700">総コース数</CardTitle>
            <span className="text-4xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalCourses || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-bold text-gray-700">公開中</CardTitle>
            <span className="text-4xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{publishedCourses || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-bold text-gray-700">総レッスン数</CardTitle>
            <span className="text-4xl">🎬</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{totalLessons || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200/50">
          <CardTitle className="text-2xl font-bold text-gray-900">コース一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CourseManagementTable courses={courses || []} categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
