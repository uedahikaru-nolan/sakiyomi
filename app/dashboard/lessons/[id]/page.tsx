import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from '@/components/features/lessons/video-player'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LessonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const user = await requireUser()
  const supabase = await createClient()

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
          category:categories(name)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!lesson) {
    notFound()
  }

  // Get user's progress for this lesson
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .single()

  // Get other lessons in the same chapter
  const { data: otherLessons } = await supabase
    .from('lessons')
    .select('id, title, sort_order, duration_seconds')
    .eq('chapter_id', lesson.chapter_id)
    .order('sort_order')

  const currentIndex = otherLessons?.findIndex((l) => l.id === lesson.id) ?? -1
  const nextLesson = otherLessons?.[currentIndex + 1]
  const prevLesson = otherLessons?.[currentIndex - 1]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/dashboard/courses" className="hover:text-primary">
          コース
        </a>
        <span>/</span>
        <span>{lesson.chapter?.course?.category?.name}</span>
        <span>/</span>
        <span>{lesson.chapter?.course?.title}</span>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-6">
          <VideoPlayer
            videoProvider={lesson.video_provider as 'vimeo' | 'youtube'}
            videoId={lesson.video_id}
            videoUrl={lesson.video_url}
            lastPosition={progress?.last_position_seconds || 0}
          />
        </CardContent>
      </Card>

      {/* Lesson Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {lesson.chapter?.title} - {lesson.chapter?.course?.title}
                  </CardDescription>
                </div>
                {progress && (
                  <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>
                    {progress.status === 'completed' && '完了'}
                    {progress.status === 'in_progress' && `${progress.progress_percentage}%`}
                    {progress.status === 'not_started' && '未視聴'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {lesson.description && (
                <div className="prose prose-sm max-w-none">
                  <p>{lesson.description}</p>
                </div>
              )}

              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                {lesson.duration_seconds && (
                  <span>⏱️ {Math.floor(lesson.duration_seconds / 60)}分</span>
                )}
                {lesson.is_free ? (
                  <Badge variant="secondary">無料</Badge>
                ) : (
                  <Badge variant="outline">有料会員限定</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            {prevLesson ? (
              <a href={`/dashboard/lessons/${prevLesson.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  ← 前のレッスン
                </Button>
              </a>
            ) : (
              <div className="flex-1" />
            )}

            {nextLesson ? (
              <a href={`/dashboard/lessons/${nextLesson.id}`} className="flex-1">
                <Button className="w-full">
                  次のレッスン →
                </Button>
              </a>
            ) : (
              <Button className="flex-1" variant="outline" disabled>
                これが最後のレッスンです
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">このチャプターのレッスン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherLessons?.map((otherLesson, index) => (
                <a
                  key={otherLesson.id}
                  href={`/dashboard/lessons/${otherLesson.id}`}
                  className={`block p-3 rounded-lg transition-colors ${
                    otherLesson.id === lesson.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {otherLesson.title}
                      </p>
                      {otherLesson.duration_seconds && (
                        <p className="text-xs opacity-80">
                          {Math.floor(otherLesson.duration_seconds / 60)}分
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
