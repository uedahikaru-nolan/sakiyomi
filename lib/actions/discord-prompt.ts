'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getActivePromptSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('discord_prompt_settings')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('[getActivePromptSettings] Error:', error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}

export async function getAllPromptSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('discord_prompt_settings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAllPromptSettings] Error:', error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}

export async function updatePromptSettings(
  id: string,
  settings: {
    system_prompt: string
    tone_description?: string
    additional_knowledge?: string
  }
) {
  console.log('[updatePromptSettings] Starting...', { id, settings })

  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '認証されていません' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || !['admin', 'super_admin'].includes(userData.role)) {
    return { success: false, error: '管理者権限がありません' }
  }

  // Update settings
  const { data, error } = await supabase
    .from('discord_prompt_settings')
    .update(settings)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updatePromptSettings] Error:', error)
    return { success: false, error: error.message }
  }

  console.log('[updatePromptSettings] Success:', data)

  revalidatePath('/admin/discord-messages')

  return { success: true, data }
}

export async function createPromptSettings(settings: {
  system_prompt: string
  tone_description?: string
  additional_knowledge?: string
}) {
  console.log('[createPromptSettings] Starting...', settings)

  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '認証されていません' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || !['admin', 'super_admin'].includes(userData.role)) {
    return { success: false, error: '管理者権限がありません' }
  }

  // Create new settings
  const { data, error } = await supabase
    .from('discord_prompt_settings')
    .insert({
      ...settings,
      created_by: user.id,
      is_active: false // デフォルトは非アクティブ
    })
    .select()
    .single()

  if (error) {
    console.error('[createPromptSettings] Error:', error)
    return { success: false, error: error.message }
  }

  console.log('[createPromptSettings] Success:', data)

  revalidatePath('/admin/discord-messages')

  return { success: true, data }
}

export async function activatePromptSettings(id: string) {
  console.log('[activatePromptSettings] Starting...', { id })

  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '認証されていません' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || !['admin', 'super_admin'].includes(userData.role)) {
    return { success: false, error: '管理者権限がありません' }
  }

  // Deactivate all other settings first
  await supabase
    .from('discord_prompt_settings')
    .update({ is_active: false })
    .neq('id', id)

  // Activate the selected setting
  const { data, error } = await supabase
    .from('discord_prompt_settings')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[activatePromptSettings] Error:', error)
    return { success: false, error: error.message }
  }

  console.log('[activatePromptSettings] Success:', data)

  revalidatePath('/admin/discord-messages')

  return { success: true, data }
}
