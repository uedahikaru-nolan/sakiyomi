import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">
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

            return (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    {course.thumbnail_url && (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-32 h-20 object-cover rounded-md ml-4"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>📚 {course.chapters?.length || 0} チャプター</span>
                      <span>🎥 {lessonCount} レッスン</span>
                      {course.duration_minutes && (
                        <span>⏱️ {course.duration_minutes}分</span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {course.level === 'beginner' && '初級'}
                        {course.level === 'intermediate' && '中級'}
                        {course.level === 'advanced' && '上級'}
                      </span>
                    </div>
                    <Button>コースを見る</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                このカテゴリにはまだコースがありません
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
