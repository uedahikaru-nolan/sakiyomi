'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDiscordUserAdmin(discordUserId: string, isAdmin: boolean) {
  console.log('[toggleDiscordUserAdmin] Starting...', { discordUserId, isAdmin })

  const supabase = await createClient()

  // Check current user
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[toggleDiscordUserAdmin] Current user:', user?.id)

  if (!user) {
    console.error('[toggleDiscordUserAdmin] No authenticated user')
    return { success: false, error: '認証されていません' }
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('[toggleDiscordUserAdmin] Error fetching user data:', userError)
    return { success: false, error: 'ユーザー情報の取得に失敗しました' }
  }

  console.log('[toggleDiscordUserAdmin] User role:', userData.role)

  if (!['admin', 'super_admin'].includes(userData.role)) {
    console.error('[toggleDiscordUserAdmin] User is not admin')
    return { success: false, error: '管理者権限がありません' }
  }

  // Update the is_admin flag
  const { data, error } = await supabase
    .from('discord_users')
    .update({ is_admin: isAdmin })
    .eq('discord_id', discordUserId)
    .select()

  if (error) {
    console.error('[toggleDiscordUserAdmin] Error updating discord user admin status:', error)
    return { success: false, error: error.message }
  }

  console.log('[toggleDiscordUserAdmin] Update successful:', data)

  // Revalidate the Discord messages page
  revalidatePath('/admin/discord-messages')

  return { success: true }
}

export async function getDiscordUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('discord_users')
    .select('*')
    .order('username', { ascending: true })

  if (error) {
    console.error('Error fetching discord users:', error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}
