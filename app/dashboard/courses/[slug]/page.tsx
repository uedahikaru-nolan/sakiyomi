import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      chapters(
        id,
        title,
        lessons(count)
      )
    `)
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('sort_order')

  return (
    <div className="space-y-8">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600">
          {category.description || 'カテゴリの説明'}
        </p>
      </div>

      <div className="grid gap-6">
        {courses && courses.length > 0 ? (
          courses.map((course) => {
            const lessonCount = course.chapters?.reduce(
              (acc: number, chapter: any) => acc + (chapter.lessons?.[0]?.count || 0),
              0
            ) || 0

            const levelConfig = {
              beginner: { label: '初級', color: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-700' },
              intermediate: { label: '中級', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-700' },
              advanced: { label: '上級', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-100', text: 'text-purple-700' }
            }[course.level] || { label: '初級', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-100', text: 'text-gray-700' }

            return (
              <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-purple-900 group-hover:text-purple-600 transition-colors mb-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {course.description}
                      </CardDescription>
                    </div>
                    {course.thumbnail_url && (
                      <div className="relative flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-40 h-24 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{course.chapters?.length || 0} チャプター</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{lessonCount} レッスン</span>
                      </div>
                      {course.duration_minutes && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.duration_minutes}分</span>
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 ${levelConfig.bg} ${levelConfig.text} rounded-full text-sm font-semibold`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{levelConfig.label}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/courses/${category.slug}/${course.slug}`}>
                      <Button className={`bg-gradient-to-r ${levelConfig.color} text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95`}>
                        コースを見る
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200/50 shadow-md">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-600 font-medium">
                  このカテゴリにはまだコースがありません
                </p>
                <p className="text-sm text-gray-500">
                  まもなく新しいコースを追加予定です
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
