import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface CourseDetailPageProps {
  params: Promise<{
    slug: string
    courseSlug: string
  }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug, courseSlug } = await params
  const supabase = await createClient()

  // コース情報を取得
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(id, name, slug),
      chapters(
        id,
        title,
        description,
        sort_order,
        lessons(
          id,
          title,
          description,
          video_url,
          video_provider,
          duration_seconds,
          sort_order,
          is_free
        )
      )
    `)
    .eq('slug', courseSlug)
    .eq('is_published', true)
    .single()

  if (!course) {
    notFound()
  }

  // チャプターをソート
  const sortedChapters = course.chapters?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  sortedChapters.forEach((chapter: any) => {
    chapter.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order)
  })

  const levelConfig = {
    beginner: { label: '初級', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    intermediate: { label: '中級', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    advanced: { label: '上級', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' }
  }[course.level] || { label: '初級', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' }

  const totalLessons = sortedChapters.reduce((acc: number, chapter: any) => acc + (chapter.lessons?.length || 0), 0)

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Link
                href={`/dashboard/courses/${course.category.slug}`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                ← {course.category.name}に戻る
              </Link>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600">
              {course.description}
            </p>
          </div>
          {course.thumbnail_url && (
            <div className="relative flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-64 h-40 object-cover"
              />
            </div>
          )}
        </div>

        {/* コース情報 */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Badge className={`${levelConfig.color} text-white px-4 py-2 text-sm font-bold`}>
            {levelConfig.label}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm font-bold">
            {sortedChapters.length} チャプター
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm font-bold">
            {totalLessons} レッスン
          </Badge>
          {course.duration_minutes && (
            <Badge variant="secondary" className="px-4 py-2 text-sm font-bold">
              約 {course.duration_minutes} 分
            </Badge>
          )}
        </div>
      </div>

      {/* チャプターとレッスン一覧 */}
      <div className="space-y-6">
        {sortedChapters.length > 0 ? (
          sortedChapters.map((chapter: any, chapterIndex: number) => (
            <Card key={chapter.id} className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                <CardTitle className="text-gray-900">
                  第{chapterIndex + 1}章：{chapter.title}
                </CardTitle>
                {chapter.description && (
                  <CardDescription className="text-base">
                    {chapter.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {chapter.lessons && chapter.lessons.length > 0 ? (
                  <div className="space-y-3">
                    {chapter.lessons.map((lesson: any, lessonIndex: number) => (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/courses/${course.category.slug}/${course.slug}/lessons/${lesson.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group cursor-pointer">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                              {lessonIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {lesson.title}
                              </h3>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {lesson.is_free && (
                              <Badge className="bg-green-500 text-white font-bold">
                                無料
                              </Badge>
                            )}
                            {lesson.duration_seconds && (
                              <span className="text-sm text-gray-500 font-medium">
                                {Math.floor(lesson.duration_seconds / 60)}:{String(lesson.duration_seconds % 60).padStart(2, '0')}
                              </span>
                            )}
                            <svg className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    このチャプターにはまだレッスンがありません
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200/50 shadow-md">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-600 font-medium">
                  このコースにはまだチャプターがありません
                </p>
                <p className="text-sm text-gray-500">
                  まもなくコンテンツを追加予定です
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
