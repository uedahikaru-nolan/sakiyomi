'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCategory, updateCategory } from '@/lib/actions/courses'
import { X, FolderPlus } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
}

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  category?: Category
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  category,
}: CategoryFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  // Load category data when editing
  useEffect(() => {
    if (mode === 'edit' && category) {
      setName(category.name)
      setSlug(category.slug)
      setDescription(category.description || '')
      setSortOrder(category.sort_order.toString())
      setIsActive(category.is_active)
    } else {
      // Reset form for create mode
      setName('')
      setSlug('')
      setDescription('')
      setSortOrder('0')
      setIsActive(true)
    }
    setError(null)
  }, [mode, category, open])

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (mode === 'create') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
      setSlug(generatedSlug)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('description', description)
    formData.append('sort_order', sortOrder)
    formData.append('is_active', isActive.toString())

    let result
    if (mode === 'create') {
      result = await createCategory(formData)
    } else if (category) {
      result = await updateCategory(category.id, formData)
    }

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      handleClose()
      router.refresh()
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setSlug('')
      setDescription('')
      setSortOrder('0')
      setIsActive(true)
      setError(null)
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* モーダル */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {mode === 'create' ? '新規カテゴリ作成' : 'カテゴリ編集'}
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  {mode === 'create'
                    ? 'コースカテゴリの情報を入力してください'
                    : 'カテゴリの情報を編集してください'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-bold text-gray-700">
                  カテゴリ名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="例: Instagramマーケティング基礎"
                  required
                  maxLength={100}
                  className="text-base border-2"
                  disabled={loading}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-bold text-gray-700">
                  スラッグ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="例: instagram-basics"
                  required
                  maxLength={100}
                  className="text-base font-mono border-2"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 font-medium">
                  URLで使用されます。半角英数字とハイフンのみ使用可能です。
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-bold text-gray-700">
                  説明
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="カテゴリの説明を入力してください"
                  rows={3}
                  className="text-base border-2"
                  disabled={loading}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order" className="text-base font-bold text-gray-700">
                  表示順
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="text-base border-2"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 font-medium">
                  小さい数字ほど先に表示されます。
                </p>
              </div>

              {/* Is Active */}
              {mode === 'edit' && (
                <div className="flex items-center justify-between space-x-2 border-2 rounded-xl p-4 bg-gray-50">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="text-base font-bold text-gray-700">
                      有効状態
                    </Label>
                    <p className="text-sm text-gray-500 font-medium">
                      無効にすると、カテゴリが非表示になります。
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-6 text-base font-bold border-2"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-6 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                {loading
                  ? mode === 'create'
                    ? '作成中...'
                    : '更新中...'
                  : mode === 'create'
                  ? '作成'
                  : '更新'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
