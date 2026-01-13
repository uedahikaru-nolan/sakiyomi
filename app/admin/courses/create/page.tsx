import { createClient } from '@/lib/supabase/server'
import { CourseCreateFormWithVideos } from '@/components/features/admin/course-create-form-with-videos'

export default async function CourseCreatePage() {
  const supabase = await createClient()

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-8 border border-orange-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3">
          新規コース作成
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          コース・チャプター・レッスン・動画を一括で作成できます
        </p>
      </div>

      {/* Form */}
      <CourseCreateFormWithVideos categories={categories || []} />
    </div>
  )
}
