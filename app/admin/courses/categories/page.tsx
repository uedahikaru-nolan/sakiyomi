import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryManagementTable } from '@/components/features/admin/category-management-table'
import { Folder, CheckCircle } from 'lucide-react'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  // Get category statistics
  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: activeCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              カテゴリ管理
            </h1>
            <p className="text-gray-600 text-lg">
              コースカテゴリの作成、編集、削除
            </p>
          </div>
          <Link href="/admin/courses">
            <Button variant="outline" className="px-6 py-3 text-base font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all">
              コース管理に戻る
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総カテゴリ数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <Folder className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalCategories || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">有効なカテゴリ</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{activeCategories || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <CardTitle className="text-gray-900 text-xl">カテゴリ一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <CategoryManagementTable categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
