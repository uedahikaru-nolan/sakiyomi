'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourseWithContent } from '@/lib/actions/courses'
import { Loader2, ArrowLeft, Plus, X, Video } from 'lucide-react'
import { VideoUploader } from './video-uploader'

interface Category {
  id: string
  name: string
  slug: string
}

interface Lesson {
  id: string
  title: string
  description: string
  video: File | null
  is_free: boolean
}

interface Chapter {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface CourseCreateFormWithVideosProps {
  categories: Category[]
}

export function CourseCreateFormWithVideos({ categories }: CourseCreateFormWithVideosProps) {
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
  const [chapters, setChapters] = useState<Chapter[]>([])

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

  // チャプター関連
  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: '',
      description: '',
      lessons: [],
    }
    setChapters([...chapters, newChapter])
  }

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((c) => c.id !== chapterId))
  }

  const updateChapter = (chapterId: string, field: keyof Chapter, value: string) => {
    setChapters(
      chapters.map((c) =>
        c.id === chapterId ? { ...c, [field]: value } : c
      )
    )
  }

  // レッスン関連
  const addLesson = (chapterId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      video: null,
      is_free: false,
    }
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: [...c.lessons, newLesson] }
          : c
      )
    )
  }

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
          : c
      )
    )
  }

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    field: keyof Lesson,
    value: string | boolean | File | null
  ) => {
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: c.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              ),
            }
          : c
      )
    )
  }

  const handleVideoUpload = (chapterId: string, lessonId: string, files: File[]) => {
    if (files.length > 0) {
      updateLesson(chapterId, lessonId, 'video', files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // バリデーション
      if (!formData.category_id || !formData.title || !formData.slug) {
        setError('必須項目を入力してください')
        setIsLoading(false)
        return
      }

      if (chapters.length === 0) {
        setError('少なくとも1つのチャプターを追加してください')
        setIsLoading(false)
        return
      }

      // まず、動画なしでチャプターとレッスンのデータを整形
      const chaptersData = await Promise.all(
        chapters.map(async (chapter) => ({
          title: chapter.title,
          description: chapter.description || undefined,
          lessons: await Promise.all(
            chapter.lessons.map(async (lesson) => {
              let videoUrl: string | undefined = undefined

              // 動画がある場合、クライアント側でアップロード
              if (lesson.video) {
                try {
                  // 一時的なレッスンIDを生成
                  const tempLessonId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

                  // クライアント側で動画をアップロード
                  const { uploadVideoToStorage } = await import('@/lib/utils/video-upload')
                  const uploadResult = await uploadVideoToStorage(lesson.video, tempLessonId)

                  if (uploadResult.error) {
                    console.error('Video upload failed:', uploadResult.error)
                    throw new Error(uploadResult.error)
                  }

                  videoUrl = uploadResult.url
                } catch (uploadError) {
                  console.error('Error uploading video:', uploadError)
                  throw new Error(`動画のアップロードに失敗しました: ${lesson.title}`)
                }
              }

              return {
                title: lesson.title,
                description: lesson.description || undefined,
                video_url: videoUrl,
                is_free: lesson.is_free,
              }
            })
          ),
        }))
      )

      const result = await createCourseWithContent(
        {
          category_id: formData.category_id,
          title: formData.title,
          slug: formData.slug,
          description: formData.description || undefined,
          level: formData.level,
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes)
            : undefined,
          is_published: formData.is_published,
        },
        chaptersData
      )

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push('/admin/courses')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コースの作成中にエラーが発生しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* コース基本情報 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">コース基本情報</h3>

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

          {/* Level & Duration */}
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* チャプター・レッスン */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">チャプター・レッスン</h3>
            <button
              type="button"
              onClick={addChapter}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              チャプター追加
            </button>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">チャプターを追加してレッスンを作成してください</p>
            </div>
          ) : (
            <div className="space-y-6">
              {chapters.map((chapter, chapterIndex) => (
                <div
                  key={chapter.id}
                  className="border rounded-lg p-6 bg-gray-50 space-y-4"
                >
                  {/* チャプターヘッダー */}
                  <div className="flex items-start justify-between">
                    <h4 className="text-md font-semibold text-gray-900">
                      チャプター {chapterIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeChapter(chapter.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* チャプタータイトル */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      チャプタータイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) =>
                        updateChapter(chapter.id, 'title', e.target.value)
                      }
                      placeholder="例: 第1章：基礎知識"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* チャプター説明 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      チャプター説明
                    </label>
                    <textarea
                      value={chapter.description}
                      onChange={(e) =>
                        updateChapter(chapter.id, 'description', e.target.value)
                      }
                      placeholder="このチャプターで学ぶ内容"
                      rows={2}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  {/* レッスン */}
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">レッスン</label>
                      <button
                        type="button"
                        onClick={() => addLesson(chapter.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        レッスン追加
                      </button>
                    </div>

                    {chapter.lessons.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">レッスンを追加してください</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="border rounded-lg p-4 bg-white space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <h5 className="text-sm font-semibold text-gray-900">
                                レッスン {lessonIndex + 1}
                              </h5>
                              <button
                                type="button"
                                onClick={() => removeLesson(chapter.id, lesson.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                レッスンタイトル <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLesson(chapter.id, lesson.id, 'title', e.target.value)
                                }
                                placeholder="例: はじめに"
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isLoading}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                レッスン説明
                              </label>
                              <textarea
                                value={lesson.description}
                                onChange={(e) =>
                                  updateLesson(chapter.id, lesson.id, 'description', e.target.value)
                                }
                                placeholder="このレッスンで学ぶ内容"
                                rows={2}
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                disabled={isLoading}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                動画ファイル
                              </label>
                              {lesson.video ? (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <Video className="h-5 w-5 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                      {lesson.video.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(lesson.video.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateLesson(chapter.id, lesson.id, 'video', null)
                                    }
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <VideoUploader
                                  maxFiles={1}
                                  onFilesChange={(files) =>
                                    handleVideoUpload(chapter.id, lesson.id, files)
                                  }
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`is_free_${lesson.id}`}
                                checked={lesson.is_free}
                                onChange={(e) =>
                                  updateLesson(chapter.id, lesson.id, 'is_free', e.target.checked)
                                }
                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                disabled={isLoading}
                              />
                              <label
                                htmlFor={`is_free_${lesson.id}`}
                                className="text-xs font-medium text-gray-700 cursor-pointer"
                              >
                                無料公開
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
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
