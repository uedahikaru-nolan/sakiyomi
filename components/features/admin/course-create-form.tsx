'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createCourse } from '@/lib/actions/courses'
import { Loader2, ArrowLeft } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface CourseCreateFormProps {
  categories: Category[]
}

export function CourseCreateForm({ categories }: CourseCreateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    slug: '',
    description: '',
    level: 'beginner',
    duration_minutes: '',
    is_published: false,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('category_id', formData.category_id)
      formDataObj.append('title', formData.title)
      formDataObj.append('slug', formData.slug)
      formDataObj.append('description', formData.description)
      formDataObj.append('level', formData.level)
      formDataObj.append('duration_minutes', formData.duration_minutes)
      formDataObj.append('is_published', String(formData.is_published))

      const result = await createCourse(formDataObj)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push('/admin/courses')
        router.refresh()
      }
    } catch (err) {
      setError('コースの作成中にエラーが発生しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category_id: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
            required
          >
            <option value="">カテゴリを選択</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            コースタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="例: Instagram基礎コース"
            maxLength={255}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            スラッグ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            placeholder="例: instagram-basics"
            maxLength={255}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL に使用される一意の識別子です（半角英数字とハイフン）
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            コース説明（オプション）
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="コースの内容や学習目標を入力してください"
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            難易度 <span className="text-red-500">*</span>
          </label>
          <select
            id="level"
            value={formData.level}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, level: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
            required
          >
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
            所要時間（分）
          </label>
          <input
            type="number"
            id="duration_minutes"
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duration_minutes: e.target.value,
              }))
            }
            placeholder="例: 120"
            min="0"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isLoading}
          />
        </div>

        {/* Is Published */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
            }
            className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
            公開する
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              'コースを作成'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
