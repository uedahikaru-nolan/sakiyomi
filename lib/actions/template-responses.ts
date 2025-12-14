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
 * テンプレート応答一覧を取得
 */
export async function getTemplateResponses(includeInactive = false) {
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
      .from('template_responses')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    // 管理者以外は有効なテンプレートのみ表示
    if (!isAdmin || !includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch template responses:', error)
      return { error: 'テンプレート応答の取得に失敗しました' }
    }

    return { templates: data || [] }
  } catch (error) {
    console.error('Error in getTemplateResponses:', error)
    return { error: 'テンプレート応答の取得に失敗しました' }
  }
}

/**
 * アクティブなテンプレート応答のみを取得（マッチング用）
 */
export async function getActiveTemplateResponses() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('template_responses')
      .select('id, trigger_keywords, response_text, priority, match_type')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Failed to fetch active template responses:', error)
      return { templates: [] }
    }

    return { templates: data || [] }
  } catch (error) {
    console.error('Error in getActiveTemplateResponses:', error)
    return { templates: [] }
  }
}

/**
 * メッセージに対してマッチするテンプレート応答を検索
 */
export async function findMatchingTemplate(message: string) {
  try {
    const { templates } = await getActiveTemplateResponses()

    if (!templates || templates.length === 0) {
      return { match: null }
    }

    const normalizedMessage = message.toLowerCase().trim()

    // 優先度順にチェック（既にソート済み）
    for (const template of templates) {
      const keywords = template.trigger_keywords || []

      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim()

        let isMatch = false

        switch (template.match_type) {
          case 'exact':
            isMatch = normalizedMessage === normalizedKeyword
            break
          case 'starts_with':
            isMatch = normalizedMessage.startsWith(normalizedKeyword)
            break
          case 'contains':
          default:
            isMatch = normalizedMessage.includes(normalizedKeyword)
            break
        }

        if (isMatch) {
          return {
            match: {
              id: template.id,
              response_text: template.response_text,
              matched_keyword: keyword
            }
          }
        }
      }
    }

    return { match: null }
  } catch (error) {
    console.error('Error in findMatchingTemplate:', error)
    return { match: null }
  }
}

/**
 * テンプレート応答を作成
 */
export async function createTemplateResponse(data: {
  title: string
  trigger_keywords: string[]
  response_text: string
  description?: string
  match_type?: string
  priority?: number
  is_active?: boolean
}) {
  try {
    const { user, supabase } = await requireAdmin()

    // バリデーション
    if (!data.title || data.title.trim().length === 0) {
      return { error: 'タイトルを入力してください' }
    }

    if (!data.trigger_keywords || data.trigger_keywords.length === 0) {
      return { error: 'トリガーキーワードを最低1つ入力してください' }
    }

    if (!data.response_text || data.response_text.trim().length === 0) {
      return { error: '返信内容を入力してください' }
    }

    if (data.title.length > 200) {
      return { error: 'タイトルは200文字以内で入力してください' }
    }

    // テンプレートを作成
    const { data: template, error } = await supabase
      .from('template_responses')
      .insert({
        title: data.title.trim(),
        trigger_keywords: data.trigger_keywords.filter(k => k.trim().length > 0),
        response_text: data.response_text.trim(),
        description: data.description?.trim() || null,
        match_type: data.match_type || 'contains',
        priority: data.priority ?? 0,
        is_active: data.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create template response:', error)
      return { error: 'テンプレート応答の作成に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { template }
  } catch (error) {
    console.error('Error in createTemplateResponse:', error)
    return { error: 'テンプレート応答の作成に失敗しました' }
  }
}

/**
 * テンプレート応答を更新
 */
export async function updateTemplateResponse(
  id: string,
  data: {
    title?: string
    trigger_keywords?: string[]
    response_text?: string
    description?: string
    match_type?: string
    priority?: number
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

    if (data.trigger_keywords !== undefined) {
      if (!data.trigger_keywords || data.trigger_keywords.length === 0) {
        return { error: 'トリガーキーワードを最低1つ入力してください' }
      }
    }

    if (data.response_text !== undefined) {
      if (!data.response_text || data.response_text.trim().length === 0) {
        return { error: '返信内容を入力してください' }
      }
    }

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.trigger_keywords !== undefined) updateData.trigger_keywords = data.trigger_keywords.filter(k => k.trim().length > 0)
    if (data.response_text !== undefined) updateData.response_text = data.response_text.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.match_type !== undefined) updateData.match_type = data.match_type
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { error } = await supabase
      .from('template_responses')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Failed to update template response:', error)
      return { error: 'テンプレート応答の更新に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in updateTemplateResponse:', error)
    return { error: 'テンプレート応答の更新に失敗しました' }
  }
}

/**
 * テンプレート応答を削除
 */
export async function deleteTemplateResponse(id: string) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('template_responses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete template response:', error)
      return { error: 'テンプレート応答の削除に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteTemplateResponse:', error)
    return { error: 'テンプレート応答の削除に失敗しました' }
  }
}

/**
 * テンプレート応答の有効/無効を切り替え
 */
export async function toggleTemplateStatus(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('template_responses')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      console.error('Failed to toggle template status:', error)
      return { error: 'ステータスの変更に失敗しました' }
    }

    revalidatePath('/admin/responses')
    return { success: true }
  } catch (error) {
    console.error('Error in toggleTemplateStatus:', error)
    return { error: 'ステータスの変更に失敗しました' }
  }
}
