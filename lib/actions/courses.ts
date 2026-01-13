'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

/**
 * 動画をSupabaseストレージにアップロード
 */
async function uploadVideo(videoFile: File, lessonId: string): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // ファイル名を生成（レッスンID + タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `lessons/${lessonId}/${timestamp}.${fileExt}`

    // ファイルをアップロード
    const { data, error } = await supabase.storage
      .from('course-videos')
      .upload(fileName, videoFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Video upload error:', error)
      return { error: '動画のアップロードに失敗しました' }
    }

    // パブリックURLを取得
    const { data: urlData } = supabase.storage
      .from('course-videos')
      .getPublicUrl(fileName)

    return { url: urlData.publicUrl }
  } catch (error) {
    console.error('Error uploading video:', error)
    return { error: '動画のアップロード中にエラーが発生しました' }
  }
}

/**
 * 管理者権限チェック
 */
async function requireAdmin() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    throw new Error('管理者権限が必要です')
  }

  return { user, supabase }
}

/**
 * カテゴリ一覧を取得
 */
export async function getCategories() {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Failed to fetch categories:', error)
      return { error: 'カテゴリの取得に失敗しました' }
    }

    return { categories }
  } catch (error) {
    console.error('Error in getCategories:', error)
    return { error: 'カテゴリの取得中にエラーが発生しました' }
  }
}

/**
 * チャプターとレッスンを含むコース全体を作成
 */
export async function createCourseWithContent(
  courseData: {
    category_id: string
    title: string
    slug: string
    description?: string
    level: string
    duration_minutes?: number
    is_published: boolean
  },
  chapters: Array<{
    title: string
    description?: string
    lessons: Array<{
      title: string
      description?: string
      video_url?: string  // 動画ファイルではなくURLを受け取る
      is_free: boolean
    }>
  }>
) {
  try {
    const { user, supabase } = await requireAdmin()

    // バリデーション
    if (!courseData.category_id || !courseData.title || !courseData.slug || !courseData.level) {
      return { error: '必須項目を入力してください' }
    }

    // スラッグの重複チェック
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseData.slug)
      .single()

    if (existingCourse) {
      return { error: 'このスラッグは既に使用されています' }
    }

    // コースを作成
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        category_id: courseData.category_id,
        title: courseData.title.trim(),
        slug: courseData.slug.trim(),
        description: courseData.description?.trim() || null,
        level: courseData.level,
        duration_minutes: courseData.duration_minutes || null,
        is_published: courseData.is_published,
        published_at: courseData.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (courseError || !course) {
      console.error('Failed to create course:', courseError)
      return { error: 'コースの作成に失敗しました' }
    }

    // チャプターとレッスンを作成
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapterData = chapters[chapterIndex]

      // チャプターを作成
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          course_id: course.id,
          title: chapterData.title.trim(),
          description: chapterData.description?.trim() || null,
          sort_order: chapterIndex + 1,
        })
        .select()
        .single()

      if (chapterError || !chapter) {
        console.error('Failed to create chapter:', chapterError)
        continue
      }

      // レッスンを作成
      for (let lessonIndex = 0; lessonIndex < chapterData.lessons.length; lessonIndex++) {
        const lessonData = chapterData.lessons[lessonIndex]

        // レッスンを作成
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            chapter_id: chapter.id,
            title: lessonData.title.trim(),
            description: lessonData.description?.trim() || null,
            video_provider: 'supabase',
            video_id: lessonData.video_url ? 'uploaded' : '',
            video_url: lessonData.video_url || '',
            sort_order: lessonIndex + 1,
            is_free: lessonData.is_free,
          })
          .select()
          .single()

        if (lessonError || !lesson) {
          console.error('Failed to create lesson:', lessonError)
          continue
        }
      }
    }

    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { course, success: true }
  } catch (error) {
    console.error('Error in createCourseWithContent:', error)
    return { error: 'コースの作成中にエラーが発生しました' }
  }
}

/**
 * コースを作成（基本情報のみ）
 */
export async function createCourse(formData: FormData) {
  try {
    const { user, supabase } = await requireAdmin()

    // フォームデータの取得
    const categoryId = formData.get('category_id') as string
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const level = formData.get('level') as string
    const durationMinutes = formData.get('duration_minutes') as string
    const isPublished = formData.get('is_published') === 'true'

    // バリデーション
    if (!categoryId || !title || !slug || !level) {
      return { error: '必須項目を入力してください' }
    }

    if (title.length > 255) {
      return { error: 'タイトルは255文字以内で入力してください' }
    }

    if (slug.length > 255) {
      return { error: 'スラッグは255文字以内で入力してください' }
    }

    // スラッグの重複チェック
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCourse) {
      return { error: 'このスラッグは既に使用されています' }
    }

    // コースを作成
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        category_id: categoryId,
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        level,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (courseError || !course) {
      console.error('Failed to create course:', courseError)
      return { error: 'コースの作成に失敗しました' }
    }

    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { course, success: true }
  } catch (error) {
    console.error('Error in createCourse:', error)
    return { error: 'コースの作成中にエラーが発生しました' }
  }
}

/**
 * コースを更新
 */
export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const { user, supabase } = await requireAdmin()

    // フォームデータの取得
    const categoryId = formData.get('category_id') as string
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const level = formData.get('level') as string
    const durationMinutes = formData.get('duration_minutes') as string
    const isPublished = formData.get('is_published') === 'true'

    // バリデーション
    if (!categoryId || !title || !slug || !level) {
      return { error: '必須項目を入力してください' }
    }

    // スラッグの重複チェック（自分以外）
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .neq('id', courseId)
      .single()

    if (existingCourse) {
      return { error: 'このスラッグは既に使用されています' }
    }

    // コースを更新
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update({
        category_id: categoryId,
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        level,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .eq('id', courseId)
      .select()
      .single()

    if (courseError || !course) {
      console.error('Failed to update course:', courseError)
      return { error: 'コースの更新に失敗しました' }
    }

    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')
    revalidatePath(`/dashboard/courses/${course.slug}`)

    return { course, success: true }
  } catch (error) {
    console.error('Error in updateCourse:', error)
    return { error: 'コースの更新中にエラーが発生しました' }
  }
}

/**
 * コースを削除
 */
export async function deleteCourse(courseId: string) {
  try {
    const { user, supabase } = await requireAdmin()

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Failed to delete course:', error)
      return { error: 'コースの削除に失敗しました' }
    }

    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteCourse:', error)
    return { error: 'コースの削除中にエラーが発生しました' }
  }
}

/**
 * コースの公開状態を切り替え
 */
export async function toggleCoursePublish(courseId: string, isPublished: boolean) {
  try {
    const { user, supabase } = await requireAdmin()

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error || !course) {
      console.error('Failed to toggle course publish:', error)
      return { error: 'コースの公開状態の変更に失敗しました' }
    }

    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { course, success: true }
  } catch (error) {
    console.error('Error in toggleCoursePublish:', error)
    return { error: 'コースの公開状態の変更中にエラーが発生しました' }
  }
}

/**
 * カテゴリを作成
 */
export async function createCategory(formData: FormData) {
  try {
    const { user, supabase } = await requireAdmin()

    // フォームデータの取得
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const sortOrder = formData.get('sort_order') as string

    // バリデーション
    if (!name || !slug) {
      return { error: '名前とスラッグは必須です' }
    }

    if (name.length > 100) {
      return { error: '名前は100文字以内で入力してください' }
    }

    if (slug.length > 100) {
      return { error: 'スラッグは100文字以内で入力してください' }
    }

    // スラッグの重複チェック
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return { error: 'このスラッグは既に使用されています' }
    }

    // カテゴリを作成
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        sort_order: sortOrder ? parseInt(sortOrder) : 0,
        is_active: true,
      })
      .select()
      .single()

    if (categoryError || !category) {
      console.error('Failed to create category:', categoryError)
      return { error: 'カテゴリの作成に失敗しました' }
    }

    revalidatePath('/admin/courses/categories')
    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { category, success: true }
  } catch (error) {
    console.error('Error in createCategory:', error)
    return { error: 'カテゴリの作成中にエラーが発生しました' }
  }
}

/**
 * カテゴリを更新
 */
export async function updateCategory(categoryId: string, formData: FormData) {
  try {
    const { user, supabase } = await requireAdmin()

    // フォームデータの取得
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const sortOrder = formData.get('sort_order') as string
    const isActive = formData.get('is_active') === 'true'

    // バリデーション
    if (!name || !slug) {
      return { error: '名前とスラッグは必須です' }
    }

    // スラッグの重複チェック（自分以外）
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', categoryId)
      .single()

    if (existingCategory) {
      return { error: 'このスラッグは既に使用されています' }
    }

    // カテゴリを更新
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        sort_order: sortOrder ? parseInt(sortOrder) : 0,
        is_active: isActive,
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (categoryError || !category) {
      console.error('Failed to update category:', categoryError)
      return { error: 'カテゴリの更新に失敗しました' }
    }

    revalidatePath('/admin/courses/categories')
    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { category, success: true }
  } catch (error) {
    console.error('Error in updateCategory:', error)
    return { error: 'カテゴリの更新中にエラーが発生しました' }
  }
}

/**
 * カテゴリを削除
 */
export async function deleteCategory(categoryId: string) {
  try {
    const { user, supabase } = await requireAdmin()

    // カテゴリに紐づくコースがあるか確認
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (courses && courses.length > 0) {
      return { error: 'このカテゴリに紐づくコースが存在するため削除できません' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('Failed to delete category:', error)
      return { error: 'カテゴリの削除に失敗しました' }
    }

    revalidatePath('/admin/courses/categories')
    revalidatePath('/admin/courses')
    revalidatePath('/dashboard/courses')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteCategory:', error)
    return { error: 'カテゴリの削除中にエラーが発生しました' }
  }
}
