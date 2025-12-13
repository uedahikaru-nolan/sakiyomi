'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function createNotification(
  userId: string,
  type: 'comment' | 'reaction' | 'achievement' | 'course_update',
  message: string,
  relatedEntityType?: string,
  relatedEntityId?: string
) {
  const supabase = await createClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    message,
    related_entity_type: relatedEntityType || null,
    related_entity_id: relatedEntityId || null,
  })

  if (error) {
    console.error('Error creating notification:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export async function getUnreadNotificationCount() {
  const user = await requireUser()
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return count || 0
}
