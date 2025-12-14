'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

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
 * ナレッジベース一覧を取得
 */
export async function getKnowledgeBase(includeInactive = false) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // 管理者かどうかチェック
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin'

    let query = supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })

    // 管理者以外は有効なナレッジのみ表示
    if (!isAdmin || !includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch knowledge base:', error)
      return { error: 'ナレッジベースの取得に失敗しました' }
    }

    return { knowledgeBase: data || [] }
  } catch (error) {
    console.error('Error in getKnowledgeBase:', error)
    return { error: 'ナレッジベースの取得に失敗しました' }
  }
}

/**
 * アクティブなナレッジベースのみを取得（AI用）
 */
export async function getActiveKnowledgeBase() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, tags')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch active knowledge base:', error)
      return { knowledgeBase: [] }
    }

    return { knowledgeBase: data || [] }
  } catch (error) {
    console.error('Error in getActiveKnowledgeBase:', error)
    return { knowledgeBase: [] }
  }
}

/**
 * ナレッジベースを作成
 */
export async function createKnowledge(data: {
  title: string
  content: string
  category?: string
  tags?: string[]
  is_active?: boolean
}) {
  try {
    const { user, supabase } = await requireAdmin()

    // バリデーション
    if (!data.title || data.title.trim().length === 0) {
      return { error: 'タイトルを入力してください' }
    }

    if (!data.content || data.content.trim().length === 0) {
      return { error: '内容を入力してください' }
    }

    if (data.title.length > 200) {
      return { error: 'タイトルは200文字以内で入力してください' }
    }

    // ナレッジを作成
    const { data: knowledge, error } = await supabase
      .from('knowledge_base')
      .insert({
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category?.trim() || null,
        tags: data.tags || [],
        is_active: data.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create knowledge:', error)
      return { error: 'ナレッジの作成に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { knowledge }
  } catch (error) {
    console.error('Error in createKnowledge:', error)
    return { error: 'ナレッジの作成に失敗しました' }
  }
}

/**
 * ナレッジベースを更新
 */
export async function updateKnowledge(
  id: string,
  data: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
    is_active?: boolean
  }
) {
  try {
    const { supabase } = await requireAdmin()

    // バリデーション
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        return { error: 'タイトルを入力してください' }
      }
      if (data.title.length > 200) {
        return { error: 'タイトルは200文字以内で入力してください' }
      }
    }

    if (data.content !== undefined) {
      if (!data.content || data.content.trim().length === 0) {
        return { error: '内容を入力してください' }
      }
    }

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.content !== undefined) updateData.content = data.content.trim()
    if (data.category !== undefined) updateData.category = data.category?.trim() || null
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { error } = await supabase
      .from('knowledge_base')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Failed to update knowledge:', error)
      return { error: 'ナレッジの更新に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in updateKnowledge:', error)
    return { error: 'ナレッジの更新に失敗しました' }
  }
}

/**
 * ナレッジベースを削除
 */
export async function deleteKnowledge(id: string) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete knowledge:', error)
      return { error: 'ナレッジの削除に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteKnowledge:', error)
    return { error: 'ナレッジの削除に失敗しました' }
  }
}

/**
 * ナレッジベースの有効/無効を切り替え
 */
export async function toggleKnowledgeStatus(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('knowledge_base')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      console.error('Failed to toggle knowledge status:', error)
      return { error: 'ステータスの変更に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in toggleKnowledgeStatus:', error)
    return { error: 'ステータスの変更に失敗しました' }
  }
}
