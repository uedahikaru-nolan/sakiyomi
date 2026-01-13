import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface LessonPageProps {
  params: Promise<{
    slug: string
    courseSlug: string
    lessonId: string
  }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, courseSlug, lessonId } = await params
  const supabase = await createClient()

  // レッスン情報を取得
  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      chapter:chapters(
        id,
        title,
        course:courses(
          id,
          title,
          slug,
          category:categories(id, name, slug)
        )
      )
    `)
    .eq('id', lessonId)
    .single()

  if (!lesson || !lesson.chapter?.course) {
    notFound()
  }

  const course = lesson.chapter.course
  const category = course.category

  // 同じチャプターの他のレッスンを取得
  const { data: chapterLessons } = await supabase
    .from('lessons')
    .select('id, title, sort_order, is_free')
    .eq('chapter_id', lesson.chapter_id)
    .order('sort_order')

  const currentIndex = chapterLessons?.findIndex(l => l.id === lesson.id) ?? -1
  const previousLesson = currentIndex > 0 ? chapterLessons?.[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < (chapterLessons?.length ?? 0) - 1 ? chapterLessons?.[currentIndex + 1] : null

  return (
    <div className="space-y-6">
      {/* パンくずナビゲーション */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/courses"
          className="text-purple-600 hover:text-purple-700 hover:underline"
        >
          コース一覧
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href={`/dashboard/courses/${category.slug}`}
          className="text-purple-600 hover:text-purple-700 hover:underline"
        >
          {category.name}
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href={`/dashboard/courses/${category.slug}/${course.slug}`}
          className="text-purple-600 hover:text-purple-700 hover:underline"
        >
          {course.title}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{lesson.title}</span>
      </div>

      {/* レッスンヘッダー */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
          {lesson.is_free && (
            <Badge className="bg-green-500 text-white font-bold">
              無料
            </Badge>
          )}
        </div>
        {lesson.description && (
          <p className="text-gray-600 text-lg">
            {lesson.description}
          </p>
        )}
        {lesson.duration_seconds && (
          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              約 {Math.floor(lesson.duration_seconds / 60)}:{String(lesson.duration_seconds % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* 動画プレーヤー */}
      {lesson.video_url && (
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-black">
              {lesson.video_provider === 'youtube' ? (
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : lesson.video_provider === 'vimeo' ? (
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  お使いのブラウザは動画タグをサポートしていません。
                </video>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* レッスンコンテンツ */}
      {lesson.content && (
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
            <CardTitle className="text-gray-900">レッスン内容</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ナビゲーション */}
      <div className="flex items-center justify-between gap-4 pt-4">
        {previousLesson ? (
          <Link
            href={`/dashboard/courses/${category.slug}/${course.slug}/lessons/${previousLesson.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-semibold text-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            前のレッスン
          </Link>
        ) : (
          <div></div>
        )}

        <Link
          href={`/dashboard/courses/${category.slug}/${course.slug}`}
          className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          コース一覧に戻る
        </Link>

        {nextLesson ? (
          <Link
            href={`/dashboard/courses/${category.slug}/${course.slug}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            次のレッスン
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div></div>
        )}
      </div>

      {/* 同じチャプターのレッスン一覧 */}
      {chapterLessons && chapterLessons.length > 1 && (
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
            <CardTitle className="text-gray-900">このチャプターのレッスン</CardTitle>
            <CardDescription>
              {lesson.chapter.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {chapterLessons.map((l, index) => (
                <Link
                  key={l.id}
                  href={`/dashboard/courses/${category.slug}/${course.slug}/lessons/${l.id}`}
                  className={`block p-4 rounded-xl border-2 transition-all duration-200 ${
                    l.id === lesson.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        l.id === lesson.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-semibold ${
                        l.id === lesson.id ? 'text-purple-600' : 'text-gray-900'
                      }`}>
                        {l.title}
                      </span>
                    </div>
                    {l.is_free && (
                      <Badge className="bg-green-500 text-white font-bold text-xs">
                        無料
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
