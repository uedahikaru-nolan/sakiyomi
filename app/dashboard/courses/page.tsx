import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function CoursesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, courses(count)')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">コース一覧</h1>
        <p className="text-muted-foreground">
          あなたの成長をサポートする学習コンテンツ
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <Link key={category.id} href={`/dashboard/courses/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.description || 'カテゴリの説明'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    コース数: {category.courses?.[0]?.count || 0}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              現在、コースは準備中です
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
