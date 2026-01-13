'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryFormDialog } from './category-form-dialog'
import { deleteCategory } from '@/lib/actions/courses'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

interface CategoryManagementTableProps {
  categories: Category[]
}

export function CategoryManagementTable({ categories }: CategoryManagementTableProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (categoryId: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) {
      return
    }

    setDeletingId(categoryId)
    const result = await deleteCategory(categoryId)
    setDeletingId(null)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCloseEditDialog = () => {
    setEditingCategory(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          新規カテゴリ作成
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">名前</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">スラッグ</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">説明</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">表示順</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">状態</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-medium">
                    カテゴリがまだありません
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-semibold text-gray-900">{category.name}</td>
                    <td className="px-4 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">
                      {category.sort_order}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {category.is_active ? (
                        <Badge className="bg-green-500 hover:bg-green-600 font-bold">有効</Badge>
                      ) : (
                        <Badge variant="secondary" className="font-bold">無効</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="hover:bg-blue-50 hover:border-blue-300 font-semibold"
                      >
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 font-semibold"
                      >
                        {deletingId === category.id ? '削除中...' : '削除'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <CategoryFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) handleCloseEditDialog()
          }}
          mode="edit"
          category={editingCategory}
        />
      )}
    </div>
  )
}
